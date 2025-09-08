import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from apps.communities.models import Community


class ChatRoom(models.Model):
    """
    Chat rooms - podem ser ligadas a comunidades ou serem privadas
    """
    ROOM_TYPES = [
        ('community', 'Community Chat'),
        ('private', 'Private Chat'),
        ('group', 'Group Chat'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Nome do chat")
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='community')
    
    # Para chats de comunidade
    community = models.OneToOneField(
        Community, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='chat_room',
        help_text="Comunidade associada (para room_type='community')"
    )
    
    # Para chats privados/grupos
    participants = models.ManyToManyField(
        User,
        through='ChatRoomMember',
        related_name='chat_rooms',
        help_text="Participantes do chat"
    )
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Configurações do chat
    max_participants = models.IntegerField(null=True, blank=True, help_text="Limite de participantes (opcional)")
    is_read_only = models.BooleanField(default=False, help_text="Chat apenas leitura")
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['room_type', 'is_active']),
            models.Index(fields=['community']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        if self.room_type == 'community' and self.community:
            return f"Chat: {self.community.name}"
        return f"Chat: {self.name}"

    @property
    def participant_count(self):
        """Número de participantes ativos"""
        return self.members.filter(is_active=True).count()

    @property
    def last_message(self):
        """Última mensagem do chat"""
        return self.messages.order_by('-created_at').first()

    def add_participant(self, user, role='member'):
        """Adiciona um participante ao chat"""
        member, created = ChatRoomMember.objects.get_or_create(
            room=self,
            user=user,
            defaults={'role': role, 'is_active': True}
        )
        if not created and not member.is_active:
            member.is_active = True
            member.save()
        return member

    def remove_participant(self, user):
        """Remove um participante do chat"""
        try:
            member = ChatRoomMember.objects.get(room=self, user=user)
            member.is_active = False
            member.save()
            return True
        except ChatRoomMember.DoesNotExist:
            return False

    def can_user_access(self, user):
        """Verifica se o usuário pode acessar este chat"""
        if not self.is_active:
            return False
            
        if self.room_type == 'community':
            # Para chats de comunidade, verificar se é membro da comunidade
            if self.community:
                return self.community.members.filter(user=user, is_active=True).exists()
            else:
                # Se não tem community associada, verificar se é membro direto do chat
                return self.members.filter(user=user, is_active=True).exists()
        else:
            # Para chats privados/grupos, verificar se é participante
            return self.members.filter(user=user, is_active=True).exists()


class ChatRoomMember(models.Model):
    """
    Membership em chat rooms com roles e permissões
    """
    MEMBER_ROLES = [
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
        ('member', 'Member'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=MEMBER_ROLES, default='member')
    
    # Status
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(null=True, blank=True)
    
    # Configurações pessoais
    notifications_enabled = models.BooleanField(default=True)
    is_muted = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['room', 'user']
        indexes = [
            models.Index(fields=['room', 'is_active']),
            models.Index(fields=['user', 'is_active']),
        ]

    def __str__(self):
        return f"{self.user.username} in {self.room.name} ({self.role})"

    def update_last_seen(self):
        """Atualiza o timestamp de última visualização"""
        self.last_seen = timezone.now()
        self.save(update_fields=['last_seen'])


class ChatMessage(models.Model):
    """
    Mensagens de chat com suporte a diferentes tipos de conteúdo
    """
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
        ('system', 'System Message'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    
    # Conteúdo da mensagem
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    content = models.TextField(help_text="Conteúdo da mensagem")
    
    # Para mensagens com arquivos
    file_url = models.URLField(null=True, blank=True, help_text="URL do arquivo anexado")
    file_name = models.CharField(max_length=255, null=True, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True, help_text="Tamanho em bytes")
    
    # Resposta a outra mensagem
    reply_to = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='replies'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    
    # Para mensagens do sistema
    system_data = models.JSONField(null=True, blank=True, help_text="Dados extra para mensagens do sistema")
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['room', 'is_deleted', 'created_at']),
        ]

    def __str__(self):
        preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"{self.sender.username}: {preview}"

    def can_user_edit(self, user):
        """Verifica se o usuário pode editar esta mensagem"""
        if self.is_deleted:
            return False
            
        # Autor pode editar nos primeiros 15 minutos
        if self.sender == user:
            time_limit = timezone.now() - timezone.timedelta(minutes=15)
            return self.created_at > time_limit
            
        # Admins e moderadores podem editar
        try:
            member = ChatRoomMember.objects.get(room=self.room, user=user)
            return member.role in ['admin', 'moderator']
        except ChatRoomMember.DoesNotExist:
            return False

    def can_user_delete(self, user):
        """Verifica se o usuário pode deletar esta mensagem"""
        if self.is_deleted:
            return False
            
        # Autor pode deletar
        if self.sender == user:
            return True
            
        # Admins e moderadores podem deletar
        try:
            member = ChatRoomMember.objects.get(room=self.room, user=user)
            return member.role in ['admin', 'moderator']
        except ChatRoomMember.DoesNotExist:
            return False

    def soft_delete(self):
        """Marca mensagem como deletada sem remover do banco"""
        self.is_deleted = True
        self.content = "[Mensagem deletada]"
        self.save()


class ChatMessageRead(models.Model):
    """
    Tracking de mensagens lidas por usuário
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='read_by')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['message', 'user']
        indexes = [
            models.Index(fields=['message', 'user']),
            models.Index(fields=['user', 'read_at']),
        ]

    def __str__(self):
        return f"{self.user.username} read message {self.message.id}"


class ChatAttachment(models.Model):
    """
    Anexos de mensagens de chat
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='chat_attachments/%Y/%m/')
    original_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['message']),
            models.Index(fields=['uploaded_at']),
        ]

    def __str__(self):
        return f"Attachment: {self.original_name}"

    @property
    def file_size_formatted(self):
        """Retorna o tamanho do arquivo formatado"""
        if self.file_size < 1024:
            return f"{self.file_size} B"
        elif self.file_size < 1024 * 1024:
            return f"{self.file_size / 1024:.1f} KB"
        else:
            return f"{self.file_size / (1024 * 1024):.1f} MB"
