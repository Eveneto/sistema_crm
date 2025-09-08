from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q, Count, Max
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser
import logging

from .models import ChatRoom, ChatRoomMember, ChatMessage, ChatMessageRead
from .serializers import (
    ChatRoomListSerializer, ChatRoomDetailSerializer, ChatRoomCreateSerializer,
    ChatMessageSerializer, ChatMessageCreateSerializer, ChatRoomMemberSerializer
)
from .permissions import ChatRoomPermissions, ChatMessagePermissions

logger = logging.getLogger(__name__)


class ChatRoomViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar chat rooms"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ChatRoomListSerializer
        elif self.action == 'create':
            return ChatRoomCreateSerializer
        else:
            return ChatRoomDetailSerializer
    
    def get_queryset(self):
        """Retorna apenas chats que o usuário tem acesso"""
        user = self.request.user
        
        # Chats onde o usuário é membro direto
        direct_member_rooms = ChatRoom.objects.filter(
            members__user=user,
            members__is_active=True,
            is_active=True
        )
        
        # Chats de comunidades onde o usuário é membro
        community_rooms = ChatRoom.objects.filter(
            room_type='community',
            community__members__user=user,
            community__members__is_active=True,
            is_active=True
        )
        
        # Combinar e remover duplicatas
        return (direct_member_rooms | community_rooms).distinct().annotate(
            last_message_time=Max('messages__created_at')
        ).order_by('-last_message_time', '-updated_at')
    
    def perform_create(self, serializer):
        """Cria chat room com o usuário atual como criador"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Permite usuário entrar no chat"""
        chat_room = self.get_object()
        user = request.user
        
        # Verificar se pode acessar
        if not chat_room.can_user_access(user):
            return Response(
                {'error': 'Você não tem permissão para acessar este chat'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar se já é membro
        if chat_room.members.filter(user=user, is_active=True).exists():
            return Response(
                {'message': 'Você já é membro deste chat'},
                status=status.HTTP_200_OK
            )
        
        # Adicionar como membro
        member = chat_room.add_participant(user)
        
        return Response({
            'message': 'Entrou no chat com sucesso',
            'member': ChatRoomMemberSerializer(member, context={'request': request}).data
        })
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Permite usuário sair do chat"""
        chat_room = self.get_object()
        user = request.user
        
        if chat_room.remove_participant(user):
            return Response({'message': 'Saiu do chat com sucesso'})
        else:
            return Response(
                {'error': 'Você não é membro deste chat'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Lista mensagens do chat com paginação"""
        chat_room = self.get_object()
        
        # Verificar acesso
        if not chat_room.can_user_access(request.user):
            return Response(
                {'error': 'Você não tem permissão para acessar este chat'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Paginação
        page_size = int(request.query_params.get('page_size', 50))
        before_id = request.query_params.get('before')  # Para paginação reversa
        
        messages = chat_room.messages.filter(is_deleted=False).select_related(
            'sender', 'reply_to__sender'
        ).prefetch_related('attachments')
        
        if before_id:
            try:
                before_message = ChatMessage.objects.get(id=before_id, room=chat_room)
                messages = messages.filter(created_at__lt=before_message.created_at)
            except ChatMessage.DoesNotExist:
                pass
        
        messages = messages.order_by('-created_at')[:page_size]
        messages = list(reversed(messages))  # Ordem cronológica
        
        serializer = ChatMessageSerializer(
            messages, 
            many=True, 
            context={'request': request}
        )
        
        return Response({
            'messages': serializer.data,
            'has_more': len(messages) == page_size
        })
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Envia nova mensagem no chat"""
        chat_room = self.get_object()
        
        # Verificar acesso
        if not chat_room.can_user_access(request.user):
            return Response(
                {'error': 'Você não tem permissão para acessar este chat'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar se pode enviar mensagens
        if chat_room.is_read_only:
            try:
                member = ChatRoomMember.objects.get(room=chat_room, user=request.user)
                if member.role not in ['admin', 'moderator']:
                    return Response(
                        {'error': 'Este chat está em modo somente leitura'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except ChatRoomMember.DoesNotExist:
                return Response(
                    {'error': 'Você não é membro deste chat'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = ChatMessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save(
                room=chat_room,
                sender=request.user
            )
            
            # Atualizar último acesso do usuário
            try:
                member = ChatRoomMember.objects.get(room=chat_room, user=request.user)
                member.update_last_seen()
            except ChatRoomMember.DoesNotExist:
                pass
            
            # Marcar mensagem como lida pelo autor
            ChatMessageRead.objects.get_or_create(
                message=message,
                user=request.user
            )
            
            # Retornar mensagem criada
            response_serializer = ChatMessageSerializer(
                message, 
                context={'request': request}
            )
            
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marca mensagens como lidas até determinado ponto"""
        chat_room = self.get_object()
        message_id = request.data.get('message_id')
        
        if not message_id:
            return Response(
                {'error': 'message_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            message = ChatMessage.objects.get(id=message_id, room=chat_room)
            
            # Marcar todas as mensagens até esta como lidas
            messages_to_mark = ChatMessage.objects.filter(
                room=chat_room,
                created_at__lte=message.created_at,
                is_deleted=False
            )
            
            for msg in messages_to_mark:
                ChatMessageRead.objects.get_or_create(
                    message=msg,
                    user=request.user
                )
            
            # Atualizar last_seen do membro
            try:
                member = ChatRoomMember.objects.get(room=chat_room, user=request.user)
                member.update_last_seen()
            except ChatRoomMember.DoesNotExist:
                pass
            
            return Response({'message': 'Mensagens marcadas como lidas'})
            
        except ChatMessage.DoesNotExist:
            return Response(
                {'error': 'Mensagem não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Lista membros do chat"""
        chat_room = self.get_object()
        
        # Verificar acesso
        if not chat_room.can_user_access(request.user):
            return Response(
                {'error': 'Você não tem permissão para acessar este chat'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        members = chat_room.members.filter(is_active=True).select_related('user')
        serializer = ChatRoomMemberSerializer(
            members, 
            many=True, 
            context={'request': request}
        )
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Adiciona novo membro ao chat"""
        chat_room = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'member')
        
        # Verificar permissões
        try:
            requester_member = ChatRoomMember.objects.get(
                room=chat_room, 
                user=request.user
            )
            if requester_member.role != 'admin':
                return Response(
                    {'error': 'Apenas admins podem adicionar membros'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except ChatRoomMember.DoesNotExist:
            return Response(
                {'error': 'Você não é membro deste chat'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user_to_add = User.objects.get(id=user_id)
            member = chat_room.add_participant(user_to_add, role=role)
            
            serializer = ChatRoomMemberSerializer(
                member, 
                context={'request': request}
            )
            
            return Response({
                'message': f'{user_to_add.username} foi adicionado ao chat',
                'member': serializer.data
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuário não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )


class ChatMessageViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar mensagens de chat"""
    permission_classes = [IsAuthenticated, ChatMessagePermissions]
    serializer_class = ChatMessageSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Retorna apenas mensagens de chats acessíveis pelo usuário"""
        user = self.request.user
        
        # Mensagens de chats onde o usuário é membro
        return ChatMessage.objects.filter(
            Q(room__members__user=user, room__members__is_active=True) |
            Q(room__room_type='community', room__community__members__user=user, 
              room__community__members__is_active=True),
            is_deleted=False
        ).distinct().select_related(
            'room', 'sender', 'reply_to__sender'
        ).prefetch_related('attachments')
    
    def update(self, request, *args, **kwargs):
        """Edita mensagem (apenas conteúdo)"""
        message = self.get_object()
        
        if not message.can_user_edit(request.user):
            return Response(
                {'error': 'Você não pode editar esta mensagem'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Permitir editar apenas o conteúdo
        allowed_fields = ['content']
        data = {key: value for key, value in request.data.items() if key in allowed_fields}
        
        serializer = self.get_serializer(message, data=data, partial=True)
        if serializer.is_valid():
            serializer.save(is_edited=True)
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Deleta mensagem (soft delete)"""
        message = self.get_object()
        
        if not message.can_user_delete(request.user):
            return Response(
                {'error': 'Você não pode deletar esta mensagem'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.soft_delete()
        return Response({'message': 'Mensagem deletada com sucesso'})
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marca mensagem específica como lida"""
        message = self.get_object()
        
        ChatMessageRead.objects.get_or_create(
            message=message,
            user=request.user
        )
        
        return Response({'message': 'Mensagem marcada como lida'})
