from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False, allow_blank=True)  # Username opcional
    email = serializers.EmailField(required=True)  # Email obrigatório
    first_name = serializers.CharField(required=False, allow_blank=True)  # Opcional
    last_name = serializers.CharField(required=False, allow_blank=True)  # Opcional

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name']

    def validate_email(self, value):
        """Validar formato do email"""
        if not value:
            raise serializers.ValidationError("Email é obrigatório")
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Email inválido")
        return value

    def validate(self, attrs):
        # Validar senhas
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        if not password or not password_confirm:
            raise serializers.ValidationError("Password e password_confirm são obrigatórios")
        
        if password != password_confirm:
            raise serializers.ValidationError("As senhas não coincidem")
        
        # Validar email único
        email = attrs.get('email')
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Este email já está cadastrado")
        
        return attrs

    def create(self, validated_data):
        """Criar usuário com validações extras"""
        # Remover campos que não são do modelo User
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        
        email = validated_data.get('email')
        if not email:
            raise serializers.ValidationError("Email é obrigatório para criar usuário")
        
        # Gerar ou validar username
        username = validated_data.get('username', '').strip()
        
        if not username:
            # Gerar username do email
            username = email.split('@')[0]
            
            # Garantir unicidade
            counter = 1
            original_username = username
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1
        
        # Validar que username é único
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError(f"Username '{username}' já existe")
        
        validated_data['username'] = username
        
        # Limpar campos vazios
        validated_data['first_name'] = validated_data.get('first_name', '').strip()
        validated_data['last_name'] = validated_data.get('last_name', '').strip()
        
        # Remover is_active se estiver presente (deixar o padrão do User)
        validated_data.pop('is_active', None)
        
        # Criar usuário (RegisterView vai desativar)
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        return user



class UserLoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username_or_email = attrs.get('username_or_email')
        password = attrs.get('password')

        user = None
        if username_or_email and password:
            # Tenta autenticar por username
            user = authenticate(username=username_or_email, password=password)
            if not user:
                # Tenta autenticar por e-mail
                try:
                    from django.contrib.auth.models import User
                    user_obj = User.objects.filter(email=username_or_email).first()
                    if user_obj:
                        user = authenticate(username=user_obj.username, password=password)
                except Exception:
                    pass
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'date_joined']
        read_only_fields = ['id', 'date_joined']
