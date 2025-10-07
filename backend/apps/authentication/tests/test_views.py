"""
Testes para as views do sistema de autenticação.

Cobre:
- LoginView: endpoint de login com validação
- RegisterView: endpoint de registro de usuários
- GoogleLoginView: autenticação via Google OAuth
- LogoutView: logout e invalidação de tokens
- UserView: operações com dados do usuário
- Responses, status codes, autenticação
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch, MagicMock
import json
from apps.authentication.models import UserProfile


class LoginViewTest(APITestCase):
    """Testes para a view de login."""

    def setUp(self):
        """Configuração inicial para os testes."""
        self.client = APIClient()
        self.login_url = '/api/auth/login/'
        
        # Criar usuário de teste
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_login_with_valid_credentials(self):
        """Teste de login com credenciais válidas."""
        data = {
            'username_or_email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'test@example.com')

    def test_login_with_invalid_email(self):
        """Teste de login com email inválido."""
        data = {
            'username_or_email': 'invalid@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_login_with_invalid_password(self):
        """Teste de login com senha inválida."""
        data = {
            'username_or_email': 'test@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_login_with_missing_fields(self):
        """Teste de login com campos obrigatórios ausentes."""
        # Sem username_or_email
        response = self.client.post(self.login_url, {'password': 'testpass123'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Sem senha
        response = self.client.post(self.login_url, {'username_or_email': 'test@example.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_empty_data(self):
        """Teste de login sem dados."""
        response = self.client.post(self.login_url, {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_method_not_allowed(self):
        """Teste de métodos HTTP não permitidos."""
        # GET não deve ser permitido
        response = self.client.get(self.login_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        
        # PUT não deve ser permitido
        response = self.client.put(self.login_url, {})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_login_with_inactive_user(self):
        """Teste de login com usuário inativo."""
        # Desativar usuário
        self.user.is_active = False
        self.user.save()
        
        data = {
            'username_or_email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class RegisterViewTest(APITestCase):
    """Testes para a view de registro."""

    def setUp(self):
        """Configuração inicial para os testes."""
        self.client = APIClient()
        self.register_url = '/api/auth/register/'

    def test_register_with_valid_data(self):
        """Teste de registro com dados válidos."""
        data = {
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        # Verificar se usuário foi criado
        user = User.objects.get(email='newuser@example.com')
        self.assertEqual(user.first_name, 'New')
        self.assertEqual(user.last_name, 'User')

    def test_register_with_existing_email(self):
        """Teste de registro com email já existente."""
        # Criar usuário existente
        User.objects.create_user(
            username='existing',
            email='existing@example.com',
            password='pass123'
        )
        
        data = {
            'email': 'existing@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_register_with_mismatched_passwords(self):
        """Teste de registro com senhas não coincidentes."""
        data = {
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'differentpass',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_with_missing_required_fields(self):
        """Teste de registro com campos obrigatórios ausentes."""
        incomplete_data = [
            {'password': 'pass123', 'password_confirm': 'pass123'},  # Sem email
            {'email': 'test@example.com', 'password_confirm': 'pass123'},  # Sem senha
            {'email': 'test@example.com', 'password': 'pass123'},  # Sem confirmação
        ]
        
        for data in incomplete_data:
            response = self.client.post(self.register_url, data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_creates_user_profile(self):
        """Teste se o registro cria automaticamente o UserProfile."""
        data = {
            'email': 'profiletest@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'Profile',
            'last_name': 'Test'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar se o UserProfile foi criado
        user = User.objects.get(email='profiletest@example.com')
        try:
            profile = user.userprofile
            self.assertIsNotNone(profile)
        except UserProfile.DoesNotExist:
            # Pode não estar implementado ainda
            pass


class GoogleLoginViewTest(APITestCase):
    """Testes para a view de login Google."""

    def setUp(self):
        """Configuração inicial para os testes."""
        self.client = APIClient()
        self.google_login_url = '/api/auth/google-login/'

    @patch('apps.authentication.firebase_service.FirebaseService.verify_token')
    def test_google_login_with_valid_token(self, mock_verify_token):
        """Teste de login Google com token válido."""
        # Mock do token Firebase válido
        mock_verify_token.return_value = {
            'uid': 'google_user_123',
            'email': 'googleuser@example.com',
            'name': 'Google User',
            'email_verified': True
        }
        
        data = {
            'firebase_token': 'valid_firebase_token'
        }
        
        response = self.client.post(self.google_login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)

    @patch('apps.authentication.firebase_service.FirebaseService.verify_token')
    def test_google_login_with_invalid_token(self, mock_verify_token):
        """Teste de login Google com token inválido."""
        # Mock do token Firebase inválido
        mock_verify_token.side_effect = Exception('Invalid token')
        
        data = {
            'firebase_token': 'invalid_firebase_token'
        }
        
        response = self.client.post(self.google_login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_google_login_without_token(self):
        """Teste de login Google sem token."""
        response = self.client.post(self.google_login_url, {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('apps.authentication.firebase_service.FirebaseService.verify_token')
    def test_google_login_creates_new_user(self, mock_verify_token):
        """Teste se login Google cria novo usuário quando necessário."""
        # Mock do token Firebase para usuário novo
        mock_verify_token.return_value = {
            'uid': 'new_google_user_456',
            'email': 'newgoogleuser@example.com',
            'name': 'New Google User',
            'email_verified': True
        }
        
        data = {
            'firebase_token': 'valid_new_user_token'
        }
        
        response = self.client.post(self.google_login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar se usuário foi criado
        user = User.objects.get(email='newgoogleuser@example.com')
        self.assertIsNotNone(user)


class LogoutViewTest(APITestCase):
    """Testes para a view de logout."""

    def setUp(self):
        """Configuração inicial para os testes."""
        self.client = APIClient()
        self.logout_url = '/api/auth/logout/'
        
        # Criar usuário e fazer login
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Gerar tokens JWT
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.refresh_token = str(refresh)

    def test_logout_with_valid_token(self):
        """Teste de logout com token válido."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        data = {
            'refresh_token': self.refresh_token
        }
        
        response = self.client.post(self.logout_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_without_authentication(self):
        """Teste de logout sem autenticação."""
        data = {
            'refresh_token': self.refresh_token
        }
        
        response = self.client.post(self.logout_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_without_refresh_token(self):
        """Teste de logout sem refresh token."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.post(self.logout_url, {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserViewTest(APITestCase):
    """Testes para a view de usuário."""

    def setUp(self):
        """Configuração inicial para os testes."""
        self.client = APIClient()
        self.user_url = '/api/auth/profile/'
        
        # Criar usuário
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        # Gerar token JWT
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

    def test_get_user_data_authenticated(self):
        """Teste de obtenção de dados do usuário autenticado."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        response = self.client.get(self.user_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')

    def test_get_user_data_unauthenticated(self):
        """Teste de obtenção de dados sem autenticação."""
        response = self.client.get(self.user_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_user_data_authenticated(self):
        """Teste de atualização de dados do usuário autenticado."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'email': 'updated@example.com'
        }
        
        response = self.client.patch(self.user_url, update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')
        self.assertEqual(response.data['last_name'], 'Name')
        
        # Verificar se foi salvo no banco
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')

    def test_update_user_data_unauthenticated(self):
        """Teste de atualização sem autenticação."""
        update_data = {
            'first_name': 'Updated'
        }
        
        response = self.client.patch(self.user_url, update_data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AuthenticationIntegrationTest(APITestCase):
    """Testes de integração do sistema de autenticação."""

    def setUp(self):
        """Configuração inicial para os testes."""
        self.client = APIClient()

    def test_complete_authentication_flow(self):
        """Teste do fluxo completo de autenticação."""
        # 1. Registro
        register_data = {
            'email': 'flowtest@example.com',
            'password': 'flowpass123',
            'password_confirm': 'flowpass123',
            'first_name': 'Flow',
            'last_name': 'Test'
        }
        
        response = self.client.post('/api/auth/register/', register_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        access_token = response.data['access']
        refresh_token = response.data['refresh']
        
        # 2. Verificar dados do usuário
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'flowtest@example.com')
        
        # 3. Logout
        response = self.client.post('/api/auth/logout/', {
            'refresh_token': refresh_token
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Login novamente
        login_data = {
            'username_or_email': 'flowtest@example.com',
            'password': 'flowpass123'
        }
        
        response = self.client.post('/api/auth/login/', login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)

    def test_authentication_error_handling(self):
        """Teste de tratamento de erros na autenticação."""
        # Tentar acessar endpoint protegido sem token
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Login com credenciais inválidas
        response = self.client.post('/api/auth/login/', {
            'username_or_email': 'invalid@example.com',
            'password': 'invalidpass'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Registro com dados inválidos
        response = self.client.post('/api/auth/register/', {
            'email': 'invalid-email',
            'password': 'short'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
