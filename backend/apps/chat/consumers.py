import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from django.utils import timezone
from .models import ChatRoom, ChatRoomMember, ChatMessage, ChatMessageRead
from .serializers import ChatMessageSerializer

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket Consumer para chat em tempo real
    """
    
    async def connect(self):
        """Conecta usuário ao WebSocket"""
        # Extrair room_id da URL
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        # Verificar autenticação
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close(code=4001)  # Unauthorized
            return
        
        self.user = user
        
        # Verificar se o usuário pode acessar este chat
        try:
            chat_room = await self.get_chat_room(self.room_id)
            if not await self.can_user_access_room(user, chat_room):
                await self.close(code=4003)  # Forbidden
                return
            
            self.chat_room = chat_room
        except Exception as e:
            logger.error(f"Erro ao verificar acesso ao chat {self.room_id}: {e}")
            await self.close(code=4004)  # Not found
            return
        
        # Entrar no grupo do chat
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Atualizar status online do usuário
        await self.update_user_last_seen()
        
        # Notificar outros usuários que este usuário entrou
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status',
                'user_id': user.id,
                'username': user.username,
                'status': 'online',
                'timestamp': timezone.now().isoformat()
            }
        )
        
        logger.info(f"User {user.username} connected to chat {self.room_id}")
    
    async def disconnect(self, close_code):
        """Desconecta usuário do WebSocket"""
        if hasattr(self, 'room_group_name'):
            # Sair do grupo do chat
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            
            # Notificar outros usuários que este usuário saiu
            if hasattr(self, 'user'):
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_status',
                        'user_id': self.user.id,
                        'username': self.user.username,
                        'status': 'offline',
                        'timestamp': timezone.now().isoformat()
                    }
                )
                
                logger.info(f"User {self.user.username} disconnected from chat {self.room_id}")
    
    async def receive(self, text_data):
        """Recebe mensagem do WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'send_message':
                await self.handle_send_message(data)
            elif message_type == 'mark_as_read':
                await self.handle_mark_as_read(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'edit_message':
                await self.handle_edit_message(data)
            elif message_type == 'delete_message':
                await self.handle_delete_message(data)
            else:
                await self.send(text_data=json.dumps({
                    'error': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {e}")
            await self.send(text_data=json.dumps({
                'error': 'Internal server error'
            }))
    
    async def handle_send_message(self, data):
        """Processa envio de nova mensagem"""
        content = data.get('content', '').strip()
        message_type = data.get('message_type', 'text')
        reply_to_id = data.get('reply_to')
        
        if not content and message_type == 'text':
            await self.send(text_data=json.dumps({
                'error': 'Message content cannot be empty'
            }))
            return
        
        # Verificar se o chat permite envio de mensagens
        if self.chat_room.is_read_only:
            member = await self.get_user_member()
            if not member or member.role not in ['admin', 'moderator']:
                await self.send(text_data=json.dumps({
                    'error': 'This chat is read-only'
                }))
                return
        
        # Criar mensagem no banco
        try:
            reply_to_message = None
            if reply_to_id:
                reply_to_message = await self.get_message_by_id(reply_to_id)
            
            message = await self.create_message(
                content=content,
                message_type=message_type,
                reply_to=reply_to_message
            )
            
            # Marcar como lida pelo autor
            await self.mark_message_as_read(message, self.user)
            
            # Serializar mensagem
            message_data = await self.serialize_message(message)
            
            # Enviar para todos no grupo
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'new_message',
                    'message': message_data
                }
            )
            
            # Atualizar last_seen do usuário
            await self.update_user_last_seen()
            
        except Exception as e:
            logger.error(f"Error creating message: {e}")
            await self.send(text_data=json.dumps({
                'error': 'Failed to send message'
            }))
    
    async def handle_mark_as_read(self, data):
        """Processa marcação de mensagem como lida"""
        message_id = data.get('message_id')
        if not message_id:
            return
        
        try:
            message = await self.get_message_by_id(message_id)
            if message:
                await self.mark_message_as_read(message, self.user)
                
                # Notificar outros usuários que a mensagem foi lida
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'message_read',
                        'message_id': str(message.id),
                        'user_id': self.user.id,
                        'username': self.user.username
                    }
                )
        except Exception as e:
            logger.error(f"Error marking message as read: {e}")
    
    async def handle_typing(self, data):
        """Processa indicador de digitação"""
        is_typing = data.get('is_typing', False)
        
        # Enviar status de digitação para outros usuários
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_typing',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_typing': is_typing
            }
        )
    
    async def handle_edit_message(self, data):
        """Processa edição de mensagem"""
        message_id = data.get('message_id')
        new_content = data.get('content', '').strip()
        
        if not message_id or not new_content:
            await self.send(text_data=json.dumps({
                'error': 'Message ID and content are required'
            }))
            return
        
        try:
            message = await self.get_message_by_id(message_id)
            if message and await self.can_user_edit_message(message, self.user):
                await self.edit_message(message, new_content)
                
                # Serializar mensagem editada
                message_data = await self.serialize_message(message)
                
                # Notificar todos sobre a edição
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'message_edited',
                        'message': message_data
                    }
                )
            else:
                await self.send(text_data=json.dumps({
                    'error': 'Cannot edit this message'
                }))
        except Exception as e:
            logger.error(f"Error editing message: {e}")
            await self.send(text_data=json.dumps({
                'error': 'Failed to edit message'
            }))
    
    async def handle_delete_message(self, data):
        """Processa deleção de mensagem"""
        message_id = data.get('message_id')
        
        if not message_id:
            await self.send(text_data=json.dumps({
                'error': 'Message ID is required'
            }))
            return
        
        try:
            message = await self.get_message_by_id(message_id)
            if message and await self.can_user_delete_message(message, self.user):
                await self.delete_message(message)
                
                # Notificar todos sobre a deleção
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'message_deleted',
                        'message_id': str(message.id),
                        'deleted_by': self.user.username
                    }
                )
            else:
                await self.send(text_data=json.dumps({
                    'error': 'Cannot delete this message'
                }))
        except Exception as e:
            logger.error(f"Error deleting message: {e}")
            await self.send(text_data=json.dumps({
                'error': 'Failed to delete message'
            }))
    
    # Handlers para mensagens do grupo
    async def new_message(self, event):
        """Envia nova mensagem para o WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message']
        }))
    
    async def message_edited(self, event):
        """Envia mensagem editada para o WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message_edited',
            'message': event['message']
        }))
    
    async def message_deleted(self, event):
        """Envia notificação de mensagem deletada para o WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id'],
            'deleted_by': event['deleted_by']
        }))
    
    async def message_read(self, event):
        """Envia notificação de mensagem lida para o WebSocket"""
        # Não enviar para o próprio usuário que marcou como lida
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'message_read',
                'message_id': event['message_id'],
                'user_id': event['user_id'],
                'username': event['username']
            }))
    
    async def user_status(self, event):
        """Envia status de usuário para o WebSocket"""
        # Não enviar status do próprio usuário para si mesmo
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'user_id': event['user_id'],
                'username': event['username'],
                'status': event['status'],
                'timestamp': event['timestamp']
            }))
    
    async def user_typing(self, event):
        """Envia indicador de digitação para o WebSocket"""
        # Não enviar indicador de digitação do próprio usuário
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_typing',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing']
            }))
    
    # Métodos auxiliares com acesso ao banco de dados
    @database_sync_to_async
    def get_chat_room(self, room_id):
        return ChatRoom.objects.get(id=room_id, is_active=True)
    
    @database_sync_to_async
    def can_user_access_room(self, user, chat_room):
        return chat_room.can_user_access(user)
    
    @database_sync_to_async
    def get_user_member(self):
        try:
            return ChatRoomMember.objects.get(
                room=self.chat_room, 
                user=self.user, 
                is_active=True
            )
        except ChatRoomMember.DoesNotExist:
            return None
    
    @database_sync_to_async
    def create_message(self, content, message_type='text', reply_to=None):
        return ChatMessage.objects.create(
            room=self.chat_room,
            sender=self.user,
            content=content,
            message_type=message_type,
            reply_to=reply_to
        )
    
    @database_sync_to_async
    def get_message_by_id(self, message_id):
        try:
            return ChatMessage.objects.get(
                id=message_id, 
                room=self.chat_room,
                is_deleted=False
            )
        except ChatMessage.DoesNotExist:
            return None
    
    @database_sync_to_async
    def mark_message_as_read(self, message, user):
        ChatMessageRead.objects.get_or_create(
            message=message,
            user=user
        )
    
    @database_sync_to_async
    def update_user_last_seen(self):
        try:
            member = ChatRoomMember.objects.get(
                room=self.chat_room,
                user=self.user
            )
            member.update_last_seen()
        except ChatRoomMember.DoesNotExist:
            pass
    
    @database_sync_to_async
    def can_user_edit_message(self, message, user):
        return message.can_user_edit(user)
    
    @database_sync_to_async
    def can_user_delete_message(self, message, user):
        return message.can_user_delete(user)
    
    @database_sync_to_async
    def edit_message(self, message, new_content):
        message.content = new_content
        message.is_edited = True
        message.save()
        return message
    
    @database_sync_to_async
    def delete_message(self, message):
        message.soft_delete()
        return message
    
    @database_sync_to_async
    def serialize_message(self, message):
        """Serializa mensagem para JSON"""
        from django.http import HttpRequest
        
        # Criar request fake para o serializer
        request = HttpRequest()
        request.user = self.user
        
        serializer = ChatMessageSerializer(message, context={'request': request})
        return serializer.data
