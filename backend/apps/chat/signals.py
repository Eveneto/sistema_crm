from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.communities.models import Community, CommunityMember
from apps.chat.models import ChatRoom, ChatRoomMember
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Community)
def create_community_chat_room(sender, instance, created, **kwargs):
    """
    Cria automaticamente um chat room quando uma nova comunidade é criada
    """
    if created:
        try:
            # Criar chat room para a comunidade
            chat_room = ChatRoom.objects.create(
                name=f"Chat - {instance.name}",
                room_type='community',
                community=instance,
                created_by=instance.created_by,
                is_read_only=False
            )
            
            # Adicionar criador da comunidade como admin do chat
            ChatRoomMember.objects.create(
                room=chat_room,
                user=instance.created_by,
                role='admin',
                is_active=True
            )
            
            logger.info(f"Chat room criado para comunidade: {instance.name}")
            
        except Exception as e:
            logger.error(f"Erro ao criar chat room para comunidade {instance.name}: {e}")


@receiver(post_save, sender=CommunityMember)
def add_member_to_community_chat(sender, instance, created, **kwargs):
    """
    Adiciona automaticamente membros ao chat da comunidade quando se juntam
    """
    if created and instance.is_active:
        try:
            # Encontrar chat room da comunidade
            chat_room = ChatRoom.objects.filter(
                community=instance.community,
                room_type='community'
            ).first()
            
            if chat_room:
                # Adicionar membro ao chat com role baseado no role na comunidade
                chat_role = 'member'
                if instance.role == 'admin':
                    chat_role = 'admin'
                elif instance.role == 'moderator':
                    chat_role = 'moderator'
                
                ChatRoomMember.objects.get_or_create(
                    room=chat_room,
                    user=instance.user,
                    defaults={
                        'role': chat_role,
                        'is_active': True
                    }
                )
                
                logger.info(f"Usuário {instance.user.username} adicionado ao chat da comunidade {instance.community.name}")
                
        except Exception as e:
            logger.error(f"Erro ao adicionar membro ao chat da comunidade: {e}")
    
    # Se o membro foi desativado, remover do chat também
    elif not created and not instance.is_active:
        try:
            chat_room = ChatRoom.objects.filter(
                community=instance.community,
                room_type='community'
            ).first()
            
            if chat_room:
                ChatRoomMember.objects.filter(
                    room=chat_room,
                    user=instance.user
                ).update(is_active=False)
                
                logger.info(f"Usuário {instance.user.username} removido do chat da comunidade {instance.community.name}")
                
        except Exception as e:
            logger.error(f"Erro ao remover membro do chat da comunidade: {e}")


# Sincronizar mudanças de role na comunidade com o chat
@receiver(post_save, sender=CommunityMember)
def sync_community_role_with_chat(sender, instance, created, **kwargs):
    """
    Sincroniza mudanças de role na comunidade com o chat
    """
    if not created and instance.is_active:
        try:
            chat_room = ChatRoom.objects.filter(
                community=instance.community,
                room_type='community'
            ).first()
            
            if chat_room:
                # Mapear role da comunidade para role do chat
                chat_role = 'member'
                if instance.role == 'admin':
                    chat_role = 'admin'
                elif instance.role == 'moderator':
                    chat_role = 'moderator'
                
                # Atualizar role no chat
                ChatRoomMember.objects.filter(
                    room=chat_room,
                    user=instance.user
                ).update(role=chat_role)
                
                logger.info(f"Role de {instance.user.username} atualizado para {chat_role} no chat da comunidade {instance.community.name}")
                
        except Exception as e:
            logger.error(f"Erro ao sincronizar role do chat: {e}")
