"""
Testes para os serializers do sistema de autenticação.

Cobre:
- UserLoginSerializer: validação de credenciais
- UserRegistrationSerializer: validação de registro
- UserSerializer: serialização de dados do usuário
- Validações de campos obrigatórios
- Casos de erro e edge cases
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import serializers
from unittest.mock import patch, MagicMock
from apps.authentication.serializers import (
    UserLoginSerializer, 
    UserRegistrationSerializer, 
    UserSerializer
)


class UserLoginSerializerTest(TestCase):
    """Testes para UserLoginSerializer."""

    def setUp(self):
        """Configuração inicial para os testes."""
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_valid_login_with_username(self):
        """Teste de login com username válido."""
        data = {
            'username_or_email': 'testuser',
            'password': 'testpass123'
        }
        
        serializer = UserLoginSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['user'], self.user)

    def test_valid_login_with_email(self):
        """Teste de login com email válido."""
        data = {
            'username_or_email': 'test@example.com',
            'password': 'testpass123'
        }
        
        serializer = UserLoginSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['user'], self.user)

    def test_login_with_missing_username_or_email(self):
        """Teste de login sem username/email."""
        data = {
            'password': 'testpass123'
        }
        
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username_or_email', serializer.errors)

    def test_login_with_missing_password(self):
        """Teste de login sem senha."""
        data = {
            'username_or_email': 'testuser'
        }
        
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_login_with_invalid_credentials(self):
        """Teste de login com credenciais inválidas."""
        data = {
            'username_or_email': 'testuser',
            'password': 'wrongpassword'
        }
        
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_login_with_nonexistent_user(self):
        """Teste de login com usuário inexistente."""
        data = {
            'username_or_email': 'nonexistent',
            'password': 'testpass123'
        }
        
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_login_with_inactive_user(self):
        """Teste de login com usuário inativo."""
        # Desativar usuário
        self.user.is_active = False
        self.user.save()
        
        data = {
            'username_or_email': 'testuser',
            'password': 'testpass123'
        }
        
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)


class UserRegistrationSerializerTest(TestCase):
    """Testes para UserRegistrationSerializer."""

    def test_valid_registration_data(self):
        """Teste de registro com dados válidos."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_registration_with_missing_fields(self):
        """Teste de registro com campos obrigatórios ausentes."""
        incomplete_data = [
            {'password': 'pass123', 'password_confirm': 'pass123'},  # Sem username/email
            {'username': 'test', 'password_confirm': 'pass123'},  # Sem senha
            {'username': 'test', 'password': 'pass123'},  # Sem confirmação
        ]
        
        for data in incomplete_data:
            serializer = UserRegistrationSerializer(data=data)
            self.assertFalse(serializer.is_valid())

    def test_registration_with_mismatched_passwords(self):
        """Teste de registro com senhas não coincidentes."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'differentpass',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_registration_with_existing_email(self):
        """Teste de registro com email já existente."""
        # Criar usuário existente
        User.objects.create_user(
            username='existing',
            email='existing@example.com',
            password='pass123'
        )
        
        data = {
            'username': 'newuser',
            'email': 'existing@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_registration_with_short_password(self):
        """Teste de registro com senha muito curta."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': '123',  # Muito curta (min_length=8)
            'password_confirm': '123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_registration_create_user(self):
        """Teste da criação real do usuário pelo serializer."""
        data = {
            'username': 'createduser',
            'email': 'created@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'Created',
            'last_name': 'User'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        
        self.assertIsInstance(user, User)
        self.assertEqual(user.username, 'createduser')
        self.assertEqual(user.email, 'created@example.com')
        self.assertEqual(user.first_name, 'Created')
        self.assertEqual(user.last_name, 'User')
        self.assertTrue(user.check_password('newpass123'))

    def test_registration_without_optional_fields(self):
        """Teste de registro sem campos opcionais."""
        data = {
            'username': 'minimaluser',
            'email': 'minimal@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        self.assertEqual(user.username, 'minimaluser')
        self.assertEqual(user.email, 'minimal@example.com')


class UserSerializerTest(TestCase):
    """Testes para UserSerializer."""

    def setUp(self):
        """Configuração inicial para os testes."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User',
            password='testpass123'
        )

    def test_user_serialization(self):
        """Teste de serialização dos dados do usuário."""
        serializer = UserSerializer(self.user)
        data = serializer.data
        
        self.assertEqual(data['id'], self.user.id)
        self.assertEqual(data['username'], 'testuser')
        self.assertEqual(data['email'], 'test@example.com')
        self.assertEqual(data['first_name'], 'Test')
        self.assertEqual(data['last_name'], 'User')

    def test_user_serialization_without_password(self):
        """Teste se a senha não é incluída na serialização."""
        serializer = UserSerializer(self.user)
        data = serializer.data
        
        self.assertNotIn('password', data)

    def test_user_serialization_fields(self):
        """Teste dos campos incluídos na serialização."""
        serializer = UserSerializer(self.user)
        data = serializer.data
        
        expected_fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        for field in expected_fields:
            self.assertIn(field, data)

    def test_user_update_serialization(self):
        """Teste de atualização através do serializer."""
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'email': 'updated@example.com'
        }
        
        serializer = UserSerializer(self.user, data=update_data, partial=True)
        self.assertTrue(serializer.is_valid())
        
        updated_user = serializer.save()
        
        self.assertEqual(updated_user.first_name, 'Updated')
        self.assertEqual(updated_user.last_name, 'Name')
        self.assertEqual(updated_user.email, 'updated@example.com')

    def test_multiple_users_serialization(self):
        """Teste de serialização de múltiplos usuários."""
        users = [
            User.objects.create_user(
                username=f'user{i}',
                email=f'user{i}@example.com',
                first_name=f'User{i}',
                last_name='Test'
            ) for i in range(1, 4)
        ]
        
        serializer = UserSerializer(users, many=True)
        data = serializer.data
        
        self.assertEqual(len(data), 3)
        for i, user_data in enumerate(data):
            self.assertEqual(user_data['username'], f'user{i+1}')
            self.assertEqual(user_data['email'], f'user{i+1}@example.com')

    def test_user_serializer_read_only_fields(self):
        """Teste de campos read-only no UserSerializer."""
        original_id = self.user.id
        original_date_joined = self.user.date_joined
        
        data = {
            'id': 999,  # Campo read-only
            'date_joined': '2020-01-01T00:00:00Z',  # Campo read-only
            'username': 'newusername',
            'email': 'newemail@example.com'
        }
        
        serializer = UserSerializer(self.user, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        
        updated_user = serializer.save()
        
        # Campos read-only não devem ter mudado
        self.assertEqual(updated_user.id, original_id)
        self.assertEqual(updated_user.date_joined, original_date_joined)
        
        # Campos editáveis devem ter mudado
        self.assertEqual(updated_user.username, 'newusername')
        self.assertEqual(updated_user.email, 'newemail@example.com')
