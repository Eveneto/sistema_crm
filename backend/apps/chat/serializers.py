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
            'id', 'original_name', 'file_size', 'file_size_formatted',
            'content_type', 'file_url', 'uploaded_at'
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
        child=serializers.FileField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = ChatMessage
        fields = ['content', 'message_type', 'reply_to', 'attachments']
    
    def validate_content(self, value):
        if self.initial_data.get('message_type') == 'text' and not value.strip():
            raise serializers.ValidationError("Mensagem de texto não pode estar vazia")
        return value
    
    def create(self, validated_data):
        attachments_data = validated_data.pop('attachments', [])
        message = super().create(validated_data)
        
        # Processar anexos
        for attachment_file in attachments_data:
            ChatAttachment.objects.create(
                message=message,
                file=attachment_file,
                original_name=attachment_file.name,
                file_size=attachment_file.size,
                content_type=getattr(attachment_file, 'content_type', 'application/octet-stream')
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
    
    class Meta:
        model = ChatRoom
        fields = [
            'name', 'room_type', 'community', 'max_participants',
            'is_read_only', 'participant_ids'
        ]
    
    def validate(self, data):
        room_type = data.get('room_type')
        community = data.get('community')
        participant_ids = data.get('participant_ids', [])
        
        if room_type == 'community':
            if not community:
                raise serializers.ValidationError("Community é obrigatória para chats de comunidade")
            # Verificar se já existe chat para esta comunidade
            if ChatRoom.objects.filter(community=community).exists():
                raise serializers.ValidationError("Esta comunidade já possui um chat")
        else:
            if not participant_ids:
                raise serializers.ValidationError("Participant_ids é obrigatório para chats privados/grupos")
            if len(participant_ids) < 1:
                raise serializers.ValidationError("Chat precisa de pelo menos 1 participante além do criador")
        
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
