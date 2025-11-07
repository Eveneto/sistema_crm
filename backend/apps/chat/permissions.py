from rest_framework.permissions import BasePermission
from .models import ChatRoom, ChatRoomMember


class ChatRoomPermissions(BasePermission):
    """
    Permissões para Chat Rooms
    """
    
    def has_permission(self, request, view):
        """Verificar permissão geral"""
        # Superuser tem acesso a tudo
        if request.user and request.user.is_superuser:
            return True
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """Verificar permissão específica do objeto"""
        user = request.user
        
        # Superuser tem permissão total
        if user.is_superuser:
            return True
        
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
        # Superuser tem acesso a tudo
        if request.user and request.user.is_superuser:
            return True
        
        # Usuário deve estar autenticado
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Se está em nested route (/rooms/{room_pk}/messages/)
        room_pk = view.kwargs.get('room_pk') if hasattr(view, 'kwargs') else None
        
        # Se não encontrou em kwargs, tentar extrair da URL
        if not room_pk and hasattr(request, 'path'):
            import re
            match = re.search(r'/rooms/([^/]+)/', request.path)
            if match:
                room_pk = match.group(1)
        
        if room_pk:
            # Para CREATE (POST), verificar se é membro da sala
            if request.method == 'POST':
                try:
                    room = ChatRoom.objects.get(pk=room_pk, is_active=True)
                    
                    # Verificar se tem acesso à sala
                    if not room.can_user_access(request.user):
                        return False
                    
                    # Para CREATE, verificar se é membro
                    # Verificar membership direto
                    is_member = ChatRoomMember.objects.filter(
                        room=room,
                        user=request.user,
                        is_active=True
                    ).exists()
                    
                    # Ou membro de comunidade se for community room
                    if not is_member and room.room_type == 'community' and room.community:
                        try:
                            from apps.communities.models import CommunityMember
                            is_member = CommunityMember.objects.filter(
                                community=room.community,
                                user=request.user,
                                is_active=True
                            ).exists()
                        except (ImportError, AttributeError):
                            pass
                    
                    return is_member
                except ChatRoom.DoesNotExist:
                    return False
        
        # Para flat route, apenas verificar autenticação
        return True
    
    def has_object_permission(self, request, view, obj):
        """Verificar permissão específica da mensagem"""
        user = request.user
        
        # Superuser tem permissão total
        if user.is_superuser:
            return True
        
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


class IsChatRoomOwner(BasePermission):
    """
    Permissão customizada para verificar se usuário é dono da sala
    """
    def has_object_permission(self, request, view, obj):
        # Superuser sempre tem acesso
        if request.user.is_superuser:
            return True
        
        # Se obj é um ChatRoom
        if isinstance(obj, ChatRoom):
            return obj.created_by == request.user
        
        # Se obj é um ChatMessage (verificar se criou a sala)
        from .models import ChatMessage
        if isinstance(obj, ChatMessage):
            return obj.room.created_by == request.user
        
        return False


# Aliases para compatibilidade com testes
IsChatRoomMember = ChatRoomPermissions
IsChatRoomModerator = CommunityMemberPermissions
CanDeleteMessage = ChatMessagePermissions
CanEditMessage = ChatMessagePermissions
ChatMessagePermission = ChatMessagePermissions
