from rest_framework.permissions import BasePermission
from .models import ChatRoom, ChatRoomMember


class ChatRoomPermissions(BasePermission):
    """
    Permissões para Chat Rooms
    """
    
    def has_permission(self, request, view):
        """Verificar permissão geral"""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """Verificar permissão específica do objeto"""
        user = request.user
        
        # Para leitura, verificar se tem acesso ao chat
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return obj.can_user_access(user)
        
        # Para escrita, verificar se é membro ativo
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                member = ChatRoomMember.objects.get(room=obj, user=user, is_active=True)
                
                # Admin pode tudo
                if member.role == 'admin':
                    return True
                
                # Moderador pode editar algumas coisas
                if member.role == 'moderator':
                    # Definir quais actions moderador pode fazer
                    allowed_actions = ['send_message', 'mark_as_read', 'update']
                    return view.action in allowed_actions
                
                # Member normal só pode ações básicas
                allowed_actions = ['send_message', 'mark_as_read', 'leave']
                return view.action in allowed_actions
                
            except ChatRoomMember.DoesNotExist:
                return False
        
        # Para DELETE, apenas admin
        if request.method == 'DELETE':
            try:
                member = ChatRoomMember.objects.get(room=obj, user=user, is_active=True)
                return member.role == 'admin'
            except ChatRoomMember.DoesNotExist:
                return False
        
        return False


class ChatMessagePermissions(BasePermission):
    """
    Permissões para Chat Messages
    """
    
    def has_permission(self, request, view):
        """Verificar permissão geral"""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """Verificar permissão específica da mensagem"""
        user = request.user
        
        # Verificar se o usuário tem acesso ao chat da mensagem
        if not obj.room.can_user_access(user):
            return False
        
        # Para leitura, se tem acesso ao chat, pode ler
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Para edição, verificar regras específicas
        if request.method in ['PUT', 'PATCH']:
            return obj.can_user_edit(user)
        
        # Para deleção, verificar regras específicas
        if request.method == 'DELETE':
            return obj.can_user_delete(user)
        
        return False


class CommunityMemberPermissions(BasePermission):
    """
    Permissões específicas para membros de comunidades
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Para ações de leitura
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            # Se é membro da comunidade, pode ver outros membros
            if hasattr(obj, 'community'):
                return obj.community.members.filter(user=user, is_active=True).exists()
            return True
        
        # Para ações de escrita, verificar se é admin/moderador da comunidade
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            if hasattr(obj, 'community'):
                try:
                    from apps.communities.models import CommunityMember
                    member = CommunityMember.objects.get(
                        community=obj.community, 
                        user=user, 
                        is_active=True
                    )
                    return member.role in ['admin', 'moderator']
                except CommunityMember.DoesNotExist:
                    return False
        
        return False
