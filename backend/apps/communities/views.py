from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
import logging

from .models import Community, CommunityMember
from .serializers import (
    CommunityListSerializer, CommunityDetailSerializer, CommunityCreateUpdateSerializer,
    CommunityMemberSerializer, CommunityMemberCreateSerializer
)
from .permissions import CommunityPermissions, CommunityMemberPermissions

logger = logging.getLogger(__name__)


class CommunityViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar comunidades"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name', 'member_count']
    ordering = ['-created_at']
    filterset_fields = ['is_public', 'created_by']

    def get_queryset(self):
        """Retorna communities baseado na visibilidade e membership do usuário"""
        user = self.request.user
        
        # Administradores podem ver todas
        if user.is_staff:
            return Community.objects.filter(is_active=True).select_related('created_by').prefetch_related('members__user')
        
        # Usuários normais veem:
        # 1. Comunidades públicas ativas
        # 2. Comunidades privadas onde são membros
        return Community.objects.filter(
            Q(is_active=True) & (
                Q(is_public=True) | 
                Q(members__user=user, members__is_active=True)
            )
        ).distinct().select_related('created_by').prefetch_related('members__user')

    def get_serializer_class(self):
        if self.action == 'list':
            return CommunityListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CommunityCreateUpdateSerializer
        return CommunityDetailSerializer

    def perform_create(self, serializer):
        """Cria uma nova comunidade e adiciona o criador como admin"""
        community = serializer.save(created_by=self.request.user)
        
        # Adicionar o criador como administrador
        CommunityMember.objects.create(
            community=community,
            user=self.request.user,
            role='admin'
        )
        logger.info(f"Community {community.name} created by {self.request.user.username}")

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Permite que um usuário se junte à comunidade"""
        community = self.get_object()
        user = request.user

        # Verificar se pode se juntar
        can_join, message = community.can_join(user)
        if not can_join:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        # Se é comunidade privada, deve ser convidado
        if not community.is_public:
            return Response(
                {'error': 'Esta é uma comunidade privada. Você precisa de um convite.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Criar membership
        membership, created = CommunityMember.objects.get_or_create(
            community=community,
            user=user,
            defaults={'role': 'member'}
        )

        if not created:
            # Reativar se estava inativo
            if not membership.is_active:
                membership.is_active = True
                membership.save()
                return Response({'message': 'Você voltou a fazer parte da comunidade!'})
            else:
                return Response({'error': 'Você já é membro desta comunidade'}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"User {user.username} joined community {community.name}")
        return Response({'message': 'Você se juntou à comunidade com sucesso!'})

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Permite que um usuário saia da comunidade"""
        community = self.get_object()
        user = request.user

        try:
            membership = CommunityMember.objects.get(community=community, user=user, is_active=True)
            
            # Admins não podem sair se são os únicos admins
            if membership.role == 'admin':
                other_admins = CommunityMember.objects.filter(
                    community=community, 
                    role='admin', 
                    is_active=True
                ).exclude(user=user)
                
                if not other_admins.exists():
                    return Response(
                        {'error': 'Você não pode sair pois é o único administrador. Promova outro membro primeiro.'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

            membership.is_active = False
            membership.save()
            logger.info(f"User {user.username} left community {community.name}")
            return Response({'message': 'Você saiu da comunidade'})

        except CommunityMember.DoesNotExist:
            return Response({'error': 'Você não é membro desta comunidade'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Lista membros da comunidade"""
        community = self.get_object()
        members = community.members.filter(is_active=True).select_related('user', 'invited_by')
        serializer = CommunityMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def invite_member(self, request, pk=None):
        """Convida um usuário para a comunidade"""
        community = self.get_object()
        
        # Verificar se o usuário atual pode convidar
        try:
            current_membership = CommunityMember.objects.get(
                community=community, 
                user=request.user, 
                is_active=True
            )
            if not current_membership.can_invite_members():
                return Response(
                    {'error': 'Você não tem permissão para convidar membros'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        except CommunityMember.DoesNotExist:
            return Response(
                {'error': 'Você não é membro desta comunidade'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CommunityMemberCreateSerializer(data=request.data)
        if serializer.is_valid():
            user_to_invite = User.objects.get(id=serializer.validated_data['user_id'])
            
            # Verificar se pode se juntar
            can_join, message = community.can_join(user_to_invite)
            if not can_join:
                return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

            # Criar convite
            membership, created = CommunityMember.objects.get_or_create(
                community=community,
                user=user_to_invite,
                defaults={
                    'role': serializer.validated_data.get('role', 'member'),
                    'invited_by': request.user
                }
            )

            if created:
                logger.info(f"User {user_to_invite.username} invited to community {community.name} by {request.user.username}")
                return Response({'message': f'Usuário {user_to_invite.username} foi convidado com sucesso!'})
            else:
                return Response({'error': 'Usuário já é membro desta comunidade'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Retorna estatísticas da comunidade"""
        community = self.get_object()
        
        stats = {
            'total_members': community.member_count,
            'members_by_role': {
                'admin': community.members.filter(role='admin', is_active=True).count(),
                'moderator': community.members.filter(role='moderator', is_active=True).count(),
                'member': community.members.filter(role='member', is_active=True).count(),
            },
            'is_full': community.is_full,
            'max_members': community.max_members,
            'recent_joins': community.members.filter(is_active=True).order_by('-joined_at')[:5].count()
        }
        return Response(stats)


class CommunityMemberViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar membros das comunidades"""
    permission_classes = [IsAuthenticated, CommunityMemberPermissions]
    serializer_class = CommunityMemberSerializer
    
    def get_queryset(self):
        community_id = self.kwargs.get('community_pk')
        if community_id:
            return CommunityMember.objects.filter(
                community_id=community_id,
                is_active=True
            ).select_related('user', 'invited_by', 'community')
        return CommunityMember.objects.none()

    @action(detail=True, methods=['patch'])
    def update_role(self, request, community_pk=None, pk=None):
        """Atualiza o papel de um membro"""
        member = self.get_object()
        new_role = request.data.get('role')
        
        if new_role not in ['admin', 'moderator', 'member']:
            return Response({'error': 'Papel inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        member.role = new_role
        member.save()
        
        logger.info(f"User {member.user.username} role updated to {new_role} in community {member.community.name}")
        return Response(CommunityMemberSerializer(member).data)

    @action(detail=True, methods=['delete'])
    def remove(self, request, community_pk=None, pk=None):
        """Remove um membro da comunidade"""
        member = self.get_object()
        
        # Verificar se não é o único admin
        if member.role == 'admin':
            other_admins = CommunityMember.objects.filter(
                community=member.community, 
                role='admin', 
                is_active=True
            ).exclude(id=member.id)
            
            if not other_admins.exists():
                return Response(
                    {'error': 'Não é possível remover o único administrador'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        member.is_active = False
        member.save()
        
        logger.info(f"User {member.user.username} removed from community {member.community.name}")
        return Response({'message': 'Membro removido da comunidade'})
