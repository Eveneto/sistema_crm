from rest_framework import serializers
from django.core.validators import validate_email
from .models import Company, CompanyContact, validate_cnpj
import re


class CompanyContactSerializer(serializers.ModelSerializer):
    """Serializer para contatos de empresa"""
    
    class Meta:
        model = CompanyContact
        fields = [
            'id', 'name', 'email', 'phone', 'position', 
            'is_primary', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_email(self, value):
        """Validate email format"""
        if value:
            validate_email(value)
        return value


class CompanyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for company lists"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    contact_count = serializers.IntegerField(source='contacts.count', read_only=True)
    formatted_cnpj = serializers.ReadOnlyField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'email', 'phone', 'website', 'industry',
            'size', 'formatted_cnpj', 'is_active', 'is_client',
            'contact_count', 'created_by_name', 'created_at'
        ]


class CompanyDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single company view"""
    contacts = CompanyContactSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    contact_count = serializers.IntegerField(source='contacts.count', read_only=True)
    formatted_cnpj = serializers.ReadOnlyField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'cnpj', 'formatted_cnpj', 'email', 'phone', 
            'website', 'industry', 'size', 'address', 'notes', 
            'is_active', 'is_client', 'contacts', 'contact_count',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'formatted_cnpj', 'created_at', 'updated_at']
    
    def validate_cnpj(self, value):
        """Validate CNPJ format and digits"""
        if value:
            # Clean CNPJ for validation
            cleaned_cnpj = re.sub(r'[^\d]', '', value)
            validate_cnpj(cleaned_cnpj)
            # Store in clean format for consistent storage
            return cleaned_cnpj
        return value
    
    def validate_email(self, value):
        """Validate email format"""
        if value:
            validate_email(value)
        return value
    
    def validate_website(self, value):
        """Validate website URL"""
        if value and not value.startswith(('http://', 'https://')):
            value = f"https://{value}"
        return value


class CompanySerializer(CompanyDetailSerializer):
    """Default company serializer - alias for detail serializer"""
    pass


class CompanyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating companies"""
    
    class Meta:
        model = Company
        fields = [
            'name', 'cnpj', 'email', 'phone', 'website', 
            'industry', 'size', 'address', 'notes',
            'is_active', 'is_client'
        ]
    
    def validate_cnpj(self, value):
        """Validate CNPJ format and digits"""
        if value:
            # Clean CNPJ for validation
            cleaned_cnpj = re.sub(r'[^\d]', '', value)
            validate_cnpj(cleaned_cnpj)
            return cleaned_cnpj
        return value
    
    def validate_name(self, value):
        """Validate company name"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Nome da empresa deve ter pelo menos 2 caracteres")
        return value.strip()
    
    def validate_email(self, value):
        """Validate email format"""
        if value:
            validate_email(value)
        return value
    
    def create(self, validated_data):
        """Create company with current user as creator"""
        request = self.context.get('request')
        if request and request.user:
            validated_data['created_by'] = request.user
        return super().create(validated_data)
    
    def get_contact_count(self, obj):
        """Retorna o número de contatos da empresa"""
        return obj.contacts.count()
    
    def create(self, validated_data):
        """Criar empresa com usuário atual como criador"""
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)


class CompanyListSerializer(serializers.ModelSerializer):
    """Serializer resumido para listagem de empresas"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    contact_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'email', 'phone', 'website', 'industry', 
            'size', 'contact_count', 'created_by_name', 'created_at'
        ]
    
    def get_contact_count(self, obj):
        return obj.contacts.count()


class CompanyCreateUpdateSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        print(f'[DEBUG][validate] Dados recebidos: {attrs}')
        return super().validate(attrs)
    """Serializer para criação e atualização de empresas"""
    
    class Meta:
        model = Company
        fields = [
            'name', 'email', 'phone', 'website', 'industry', 
            'size', 'address', 'notes'
        ]
    
    def validate_name(self, value):
        """Validar nome da empresa"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Nome da empresa deve ter pelo menos 2 caracteres.")
        return value.strip()
    
    def validate_website(self, value):
        """Aceita entradas simples e converte para URL válido"""
        print(f'[DEBUG][validate_website] Valor recebido: {value}')
        if value:
            value = value.strip()
            print(f'[DEBUG][validate_website] Após strip: {value}')
            # Adiciona https:// se não houver protocolo
            if not value.startswith(('http://', 'https://')):
                value = f'https://{value}'
                print(f'[DEBUG][validate_website] https adicionado: {value}')
            # Valida o URL final
            from django.core.validators import URLValidator
            from django.core.exceptions import ValidationError
            validator = URLValidator()
            try:
                validator(value)
            except ValidationError:
                print(f'[DEBUG][validate_website] URL inválido: {value}')
                raise serializers.ValidationError("Insira um URL válido.")
        print(f'[DEBUG][validate_website] Valor final: {value}')
        return value
