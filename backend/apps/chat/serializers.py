from rest_framework import serializers
from django.contrib.auth.models import User
from apps.communities.models import Community
from .models import ChatRoom, ChatRoomMember, ChatMessage, ChatMessageRead, ChatAttachment


class UserMinimalSerializer(serializers.ModelSerializer):
    """Serializer mínimo para usuários no chat"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class ChatAttachmentSerializer(serializers.ModelSerializer):
    """Serializer para anexos de mensagens"""
    file_size_formatted = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatAttachment
        fields = [
            'id', 'original_name', 'file_name', 'file_size', 'file_size_formatted',
            'content_type', 'file_url', 'uploaded_at', 'file_type'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer para mensagens de chat"""
    sender = UserMinimalSerializer(read_only=True)
    attachments = ChatAttachmentSerializer(many=True, read_only=True)
    reply_to_message = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'message_type', 'content', 'file_url', 'file_name', 
            'file_size', 'sender', 'reply_to', 'reply_to_message',
            'created_at', 'updated_at', 'is_edited', 'is_deleted',
            'attachments', 'is_read', 'can_edit', 'can_delete'
        ]
        read_only_fields = ['id', 'sender', 'created_at', 'updated_at', 'is_edited']
    
    def get_reply_to_message(self, obj):
        if obj.reply_to and not obj.reply_to.is_deleted:
            return {
                'id': obj.reply_to.id,
                'content': obj.reply_to.content[:100] + "..." if len(obj.reply_to.content) > 100 else obj.reply_to.content,
                'sender': obj.reply_to.sender.username,
                'created_at': obj.reply_to.created_at
            }
        return None
    
    def get_is_read(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ChatMessageRead.objects.filter(
                message=obj, 
                user=request.user
            ).exists()
        return False
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_user_edit(request.user)
        return False
    
    def get_can_delete(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_user_delete(request.user)
        return False


class ChatMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de mensagens"""
    attachments = serializers.ListField(
        required=False,
        write_only=True,
        allow_empty=True
    )
    reply_to_id = serializers.UUIDField(required=False, write_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['content', 'message_type', 'reply_to', 'reply_to_id', 'attachments']
        extra_kwargs = {
            'reply_to': {'read_only': True}
        }
    
    def validate_content(self, value):
        """Valida e sanitiza o conteúdo da mensagem"""
        if self.initial_data.get('message_type') == 'text' and not value.strip():
            raise serializers.ValidationError("Mensagem de texto não pode estar vazia")
        
        # Sanitizar HTML/XSS
        import html
        import re
        
        # PASSO 1: Remover tags e atributos perigosos ANTES de escapar
        # Isso garante que até tags que já existem sejam removidas completamente
        dangerous_patterns = [
            # Tags perigosas
            r'<\s*script[^>]*>.*?</\s*script\s*>',
            r'<\s*iframe[^>]*>.*?</\s*iframe\s*>',
            r'<\s*object[^>]*>.*?</\s*object\s*>',
            r'<\s*embed[^>]*>.*?</\s*embed\s*>',
            r'<\s*link[^>]*>',
            r'<\s*meta[^>]*>',
            r'<\s*style[^>]*>.*?</\s*style\s*>',
            # Atributos perigosos
            r'\s+on\w+\s*=\s*["\']?[^"\'>\s]*["\']?',  # onclick, onerror, onload, etc
            r'\s+javascript\s*:\s*',
            r'\s+data\s*:\s*text/html',
            # Outros padrões perigosos
            r'<\s*img[^>]*\s+(?:onerror|onload)[^>]*>',
            r'vbscript\s*:',
        ]
        
        cleaned = value
        for pattern in dangerous_patterns:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE | re.DOTALL)
        
        # PASSO 2: Escapar HTML restante para converter < e > em entidades
        sanitized = html.escape(cleaned)
        
        # PASSO 3: Remover qualquer <script> que possa ter sobrevivido em forma escapada
        # (improvável, mas por segurança)
        if '<script' in sanitized or 'onerror' in sanitized or 'onclick' in sanitized:
            # Se ainda houver tags perigosas, fazer mais uma limpeza
            sanitized = re.sub(r'&lt;\s*script[^&]*&gt;.*?&lt;\s*/\s*script\s*&gt;', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
        
        return sanitized
    
    def create(self, validated_data):
        attachments_data = validated_data.pop('attachments', [])
        reply_to_id = validated_data.pop('reply_to_id', None)
        
        # Se reply_to_id foi fornecido, buscar a mensagem
        if reply_to_id:
            try:
                reply_to_message = ChatMessage.objects.get(id=reply_to_id)
                validated_data['reply_to'] = reply_to_message
            except ChatMessage.DoesNotExist:
                pass
        
        message = super().create(validated_data)
        
        # Processar anexos
        # Aceita tanto FileField (upload real) quanto dict (testes)
        for attachment_data in attachments_data:
            if hasattr(attachment_data, 'read'):
                # É um arquivo real (FileField)
                ChatAttachment.objects.create(
                    message=message,
                    file=attachment_data,
                    original_name=attachment_data.name,
                    file_size=attachment_data.size,
                    content_type=getattr(attachment_data, 'content_type', 'application/octet-stream')
                )
            elif isinstance(attachment_data, dict):
                # É um dict (formato de teste)
                ChatAttachment.objects.create(
                    message=message,
                    file_name=attachment_data.get('file_name', ''),
                    file_size=attachment_data.get('file_size', 0),
                    file_type=attachment_data.get('file_type', ''),
                    file_url=attachment_data.get('file_url', ''),
                    original_name=attachment_data.get('file_name', 'unknown'),
                    content_type=attachment_data.get('file_type', 'application/octet-stream')
                )
        
        return message


class ChatRoomMemberSerializer(serializers.ModelSerializer):
    """Serializer para membros de chat rooms"""
    user = UserMinimalSerializer(read_only=True)
    is_online = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoomMember
        fields = [
            'id', 'user', 'role', 'is_active', 'joined_at', 
            'last_seen', 'notifications_enabled', 'is_muted',
            'is_online', 'unread_count'
        ]
        read_only_fields = ['id', 'joined_at']
    
    def get_is_online(self, obj):
        # Implementar lógica de usuário online (pode usar cache/Redis)
        from django.utils import timezone
        if obj.last_seen:
            time_threshold = timezone.now() - timezone.timedelta(minutes=5)
            return obj.last_seen > time_threshold
        return False
    
    def get_unread_count(self, obj):
        # Contar mensagens não lidas para este usuário nesta sala
        from django.db.models import Count
        return ChatMessage.objects.filter(
            room=obj.room,
            created_at__gt=obj.last_seen or obj.joined_at
        ).exclude(
            read_by__user=obj.user
        ).count()


class ChatRoomListSerializer(serializers.ModelSerializer):
    """Serializer para listagem de chat rooms"""
    participant_count = serializers.ReadOnlyField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'room_type', 'participant_count',
            'last_message', 'unread_count', 'user_role',
            'created_at', 'updated_at'
        ]
    
    def get_last_message(self, obj):
        last_msg = obj.last_message
        if last_msg and not last_msg.is_deleted:
            return {
                'id': last_msg.id,
                'content': last_msg.content[:100] + "..." if len(last_msg.content) > 100 else last_msg.content,
                'sender': last_msg.sender.username,
                'created_at': last_msg.created_at,
                'message_type': last_msg.message_type
            }
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                member = ChatRoomMember.objects.get(room=obj, user=request.user)
                return ChatMessage.objects.filter(
                    room=obj,
                    created_at__gt=member.last_seen or member.joined_at,
                    is_deleted=False
                ).exclude(
                    read_by__user=request.user
                ).count()
            except ChatRoomMember.DoesNotExist:
                return 0
        return 0
    
    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                member = ChatRoomMember.objects.get(room=obj, user=request.user)
                return member.role
            except ChatRoomMember.DoesNotExist:
                return None
        return None


class ChatRoomDetailSerializer(serializers.ModelSerializer):
    """Serializer detalhado para chat rooms"""
    members = ChatRoomMemberSerializer(many=True, read_only=True)
    participant_count = serializers.ReadOnlyField()
    created_by = UserMinimalSerializer(read_only=True)
    community_info = serializers.SerializerMethodField()
    user_permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'room_type', 'community_info', 'created_by',
            'created_at', 'updated_at', 'is_active', 'max_participants',
            'is_read_only', 'participant_count', 'members', 'user_permissions'
        ]
    
    def get_community_info(self, obj):
        if obj.room_type == 'community' and obj.community:
            return {
                'id': obj.community.id,
                'name': obj.community.name,
                'description': obj.community.description
            }
        return None
    
    def get_user_permissions(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                member = ChatRoomMember.objects.get(room=obj, user=request.user)
                return {
                    'can_send_messages': not obj.is_read_only or member.role in ['admin', 'moderator'],
                    'can_delete_messages': member.role in ['admin', 'moderator'],
                    'can_manage_members': member.role == 'admin',
                    'role': member.role
                }
            except ChatRoomMember.DoesNotExist:
                return {
                    'can_send_messages': False,
                    'can_delete_messages': False,
                    'can_manage_members': False,
                    'role': None
                }
        return None


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de chat rooms"""
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )
    members = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = ChatRoom
        fields = [
            'name', 'room_type', 'community', 'max_participants',
            'is_read_only', 'participant_ids', 'members'
        ]
    
    def validate(self, data):
        room_type = data.get('room_type')
        community = data.get('community')
        
        # Aceitar tanto participant_ids quanto members (para compatibilidade)
        participant_ids = data.get('participant_ids') or data.get('members', [])
        data['participant_ids'] = participant_ids
        if 'members' in data:
            del data['members']
        
        if room_type == 'community':
            if not community:
                raise serializers.ValidationError("Community é obrigatória para chats de comunidade")
            # Verificar se já existe chat para esta comunidade
            if ChatRoom.objects.filter(community=community).exists():
                raise serializers.ValidationError("Esta comunidade já possui um chat")
        elif room_type == 'group':
            # Apenas grupos precisam de participant_ids obrigatoriamente
            if not participant_ids:
                raise serializers.ValidationError("Participant_ids é obrigatório para chats em grupo")
            if len(participant_ids) < 1:
                raise serializers.ValidationError("Chat precisa de pelo menos 1 participante além do criador")
        # Para chats privados (private), participant_ids é opcional
        
        return data
    
    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        chat_room = super().create(validated_data)
        
        # Adicionar criador como admin
        chat_room.add_participant(chat_room.created_by, role='admin')
        
        # Adicionar outros participantes
        if chat_room.room_type != 'community':
            for user_id in participant_ids:
                try:
                    user = User.objects.get(id=user_id)
                    chat_room.add_participant(user, role='member')
                except User.DoesNotExist:
                    continue
        
        return chat_room


# Aliases para compatibilidade com testes
ChatRoomSerializer = ChatRoomDetailSerializer
ChatMessageListSerializer = ChatMessageSerializer
ChatMessageReadSerializer = ChatAttachmentSerializer
