from rest_framework.permissions import BasePermission
from .models import CommunityMember


class CommunityPermissions(BasePermission):
    """
    Permissões customizadas para comunidades:
    - Qualquer usuário autenticado pode listar/ver comunidades públicas
    - Apenas membros podem ver detalhes de comunidades privadas
    - Apenas admins/moderadores podem editar comunidades
    - Apenas criador ou admin pode deletar
    """

    def has_permission(self, request, view):
        """Verifica permissão a nível de view"""
        if not request.user.is_authenticated:
            return False

        # Operações de leitura são permitidas para usuários autenticados
        if view.action in ['list', 'retrieve']:
            return True
            
        # Criar comunidade é permitido para qualquer usuário autenticado
        if view.action == 'create':
            return True
            
        # Outras ações precisam verificar a nível de objeto
        return True

    def has_object_permission(self, request, view, obj):
        """Verifica permissão a nível de objeto"""
        user = request.user
        
        # Superuser sempre tem acesso
        if user.is_superuser:
            return True

        # Para leitura (retrieve)
        if view.action == 'retrieve':
            # Comunidades públicas podem ser vistas por todos
            if obj.is_public:
                return True
            # Comunidades privadas apenas por membros
            return CommunityMember.objects.filter(
                community=obj, 
                user=user, 
                is_active=True
            ).exists()

        # Para operações de escrita
        if view.action in ['update', 'partial_update']:
            # Apenas admins e moderadores podem editar
            try:
                membership = CommunityMember.objects.get(
                    community=obj, 
                    user=user, 
                    is_active=True
                )
                return membership.is_moderator
            except CommunityMember.DoesNotExist:
                return False

        # Para delete
        if view.action == 'destroy':
            # Apenas o criador ou admin podem deletar
            if obj.created_by == user:
                return True
            try:
                membership = CommunityMember.objects.get(
                    community=obj, 
                    user=user, 
                    is_active=True
                )
                return membership.is_admin
            except CommunityMember.DoesNotExist:
                return False

        # Para ações customizadas
        if view.action in ['join', 'leave']:
            return True  # Verificação será feita na view
            
        if view.action in ['invite_member', 'members', 'statistics']:
            # Apenas membros podem ver/gerenciar membros
            return CommunityMember.objects.filter(
                community=obj, 
                user=user, 
                is_active=True
            ).exists()

        return False


class CommunityMemberPermissions(BasePermission):
    """
    Permissões para membros de comunidade:
    - Apenas membros da comunidade podem ver outros membros
    - Apenas admins/moderadores podem gerenciar membros
    """

    def has_permission(self, request, view):
        """Verifica permissão a nível de view"""
        if not request.user.is_authenticated:
            return False

        # Verificar se o usuário é membro da comunidade
        community_id = view.kwargs.get('community_pk')
        if not community_id:
            return False

        return CommunityMember.objects.filter(
            community_id=community_id,
            user=request.user,
            is_active=True
        ).exists()

    def has_object_permission(self, request, view, obj):
        """Verifica permissão a nível de objeto (membro específico)"""
        user = request.user
        
        # Superuser sempre tem acesso
        if user.is_superuser:
            return True

        # Para leitura
        if view.action == 'retrieve':
            # Membros podem ver outros membros da mesma comunidade
            return CommunityMember.objects.filter(
                community=obj.community,
                user=user,
                is_active=True
            ).exists()

        # Para operações de escrita (update_role, remove)
        if view.action in ['update', 'partial_update', 'update_role', 'remove']:
            try:
                current_membership = CommunityMember.objects.get(
                    community=obj.community,
                    user=user,
                    is_active=True
                )
                
                # Usuários não podem modificar a si mesmos (exceto sair)
                if obj.user == user:
                    return False
                
                # Apenas admins/moderadores podem gerenciar outros membros
                if not current_membership.is_moderator:
                    return False
                
                # Moderadores não podem modificar admins
                if obj.is_admin and current_membership.role != 'admin':
                    return False
                
                return True
                
            except CommunityMember.DoesNotExist:
                return False

        return False


class IsCommunityMember(BasePermission):
    """
    Permissão simples para verificar se o usuário é membro ativo de uma comunidade
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        community_id = view.kwargs.get('community_pk')
        if not community_id:
            return False
            
        return CommunityMember.objects.filter(
            community_id=community_id,
            user=request.user,
            is_active=True
        ).exists()


class IsCommunityModerator(BasePermission):
    """
    Permissão para verificar se o usuário é moderador ou admin de uma comunidade
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        community_id = view.kwargs.get('community_pk')
        if not community_id:
            return False
            
        try:
            membership = CommunityMember.objects.get(
                community_id=community_id,
                user=request.user,
                is_active=True
            )
            return membership.is_moderator
        except CommunityMember.DoesNotExist:
            return False
