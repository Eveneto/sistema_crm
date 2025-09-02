import uuid
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Community(models.Model):
    """Communities - spaces for collaboration and chat"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Nome da comunidade")
    description = models.TextField(blank=True, help_text="Descrição da comunidade")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_communities')
    is_public = models.BooleanField(default=True, help_text="Se a comunidade é pública ou privada")
    max_members = models.IntegerField(null=True, blank=True, help_text="Limite máximo de membros (opcional)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Community'
        verbose_name_plural = 'Communities'

    def __str__(self):
        return self.name

    @property
    def member_count(self):
        """Retorna o número de membros da comunidade"""
        return self.members.count()

    @property
    def is_full(self):
        """Verifica se a comunidade atingiu o limite de membros"""
        if self.max_members:
            return self.member_count >= self.max_members
        return False

    def can_join(self, user):
        """Verifica se um usuário pode se juntar à comunidade"""
        if not self.is_active:
            return False, "Comunidade não está ativa"
        
        if self.is_full:
            return False, "Comunidade atingiu o limite de membros"
            
        if self.members.filter(user=user).exists():
            return False, "Usuário já é membro desta comunidade"
            
        return True, "Pode se juntar"


class CommunityMember(models.Model):
    """Community Members - users that belong to a community with specific roles"""
    
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('moderator', 'Moderador'),
        ('member', 'Membro'),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='community_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    invited_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='sent_invitations'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['community', 'user']
        ordering = ['joined_at']
        verbose_name = 'Community Member'
        verbose_name_plural = 'Community Members'

    def __str__(self):
        return f"{self.user.username} - {self.community.name} ({self.role})"

    def clean(self):
        """Validações customizadas"""
        # Verificar se a comunidade pode aceitar mais membros
        can_join, message = self.community.can_join(self.user)
        if not can_join and not self.pk:  # Apenas para novos membros
            raise ValidationError(message)

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_moderator(self):
        return self.role in ['admin', 'moderator']

    def can_manage_members(self):
        """Verifica se pode gerenciar outros membros"""
        return self.is_moderator

    def can_invite_members(self):
        """Verifica se pode convidar novos membros"""
        return self.is_moderator or self.role == 'member'  # Membros podem convidar também
