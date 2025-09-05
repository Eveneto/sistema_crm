from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Community, CommunityMember


class UserSerializer(serializers.ModelSerializer):
    """Serializer básico para usuários"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class CommunityMemberSerializer(serializers.ModelSerializer):
    """Serializer para membros da comunidade"""
    user = UserSerializer(read_only=True)
    invited_by = UserSerializer(read_only=True)
    
    class Meta:
        model = CommunityMember
        fields = [
            'id', 'user', 'role', 'joined_at', 'invited_by', 
            'is_active', 'is_admin', 'is_moderator'
        ]
        read_only_fields = ['id', 'joined_at', 'is_admin', 'is_moderator']


class CommunityMemberCreateSerializer(serializers.ModelSerializer):
    """Serializer para criar/convidar membros"""
    user_id = serializers.IntegerField(required=False)
    user_email = serializers.EmailField(required=False)
    
    class Meta:
        model = CommunityMember
        fields = ['user_id', 'user_email', 'role']

    def validate(self, data):
        """Validar que temos user_id OU user_email"""
        if not data.get('user_id') and not data.get('user_email'):
            raise serializers.ValidationError("É necessário fornecer user_id ou user_email")
        
        if data.get('user_id') and data.get('user_email'):
            raise serializers.ValidationError("Forneça apenas user_id OU user_email, não ambos")
        
        return data

    def validate_user_id(self, value):
        if value and not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("Usuário não encontrado")
        return value
        
    def validate_user_email(self, value):
        if value and not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Usuário com este email não encontrado")
        return value


class CommunityListSerializer(serializers.ModelSerializer):
    """Serializer para listagem de comunidades"""
    created_by = UserSerializer(read_only=True)
    member_count = serializers.ReadOnlyField()
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Community
        fields = [
            'id', 'name', 'description', 'created_by', 'is_public', 
            'member_count', 'max_members', 'is_full', 'is_member', 
            'user_role', 'created_at', 'updated_at'
        ]

    def get_is_member(self, obj):
        """Verifica se o usuário atual é membro desta comunidade"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(user=request.user, is_active=True).exists()
        return False

    def get_user_role(self, obj):
        """Retorna o papel do usuário atual na comunidade"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = obj.members.filter(user=request.user, is_active=True).first()
            return membership.role if membership else None
        return None


class CommunityDetailSerializer(serializers.ModelSerializer):
    """Serializer para detalhes de uma comunidade"""
    created_by = UserSerializer(read_only=True)
    members = CommunityMemberSerializer(many=True, read_only=True)
    member_count = serializers.ReadOnlyField()
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    can_join = serializers.SerializerMethodField()
    
    class Meta:
        model = Community
        fields = [
            'id', 'name', 'description', 'created_by', 'is_public', 
            'max_members', 'member_count', 'is_full', 'members',
            'is_member', 'user_role', 'can_join', 'created_at', 'updated_at'
        ]

    def get_is_member(self, obj):
        """Verifica se o usuário atual é membro desta comunidade"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(user=request.user, is_active=True).exists()
        return False

    def get_user_role(self, obj):
        """Retorna o papel do usuário atual na comunidade"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = obj.members.filter(user=request.user, is_active=True).first()
            return membership.role if membership else None
        return None

    def get_can_join(self, obj):
        """Verifica se o usuário pode se juntar à comunidade"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            can_join, message = obj.can_join(request.user)
            return {'can_join': can_join, 'message': message}
        return {'can_join': False, 'message': 'Usuário não autenticado'}


class CommunityCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para criar/atualizar comunidades"""
    
    class Meta:
        model = Community
        fields = ['name', 'description', 'is_public', 'max_members']

    def validate_max_members(self, value):
        if value is not None and value < 1:
            raise serializers.ValidationError("O número máximo de membros deve ser pelo menos 1")
        return value
