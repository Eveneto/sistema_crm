from rest_framework import serializers
from .models import Company, CompanyContact


class CompanyContactSerializer(serializers.ModelSerializer):
    """Serializer para contatos de empresa"""
    
    class Meta:
        model = CompanyContact
        fields = [
            'id', 'name', 'email', 'phone', 'position', 
            'is_primary', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CompanySerializer(serializers.ModelSerializer):
    """Serializer para empresas"""
    contacts = CompanyContactSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    contact_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'email', 'phone', 'website', 'industry', 
            'size', 'address', 'notes', 'contacts', 'contact_count',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
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
        """Validar URL do website"""
        if value and not value.startswith(('http://', 'https://')):
            return f'https://{value}'
        return value
