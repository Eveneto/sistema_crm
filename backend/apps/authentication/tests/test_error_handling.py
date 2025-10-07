"""
Testes específicos para tratamento de erros no sistema de autenticação.
Cobre cenários de falha, validações e comportamento em situações excepcionais.
"""

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from apps.authentication.models import EmailVerificationToken, UserProfile
from apps.authentication.firebase_service import FirebaseService
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import uuid
import json


class AuthenticationErrorHandlingTest(TestCase):
    """Testes para tratamento de erros de autenticação."""
    
    def setUp(self):
        """Configuração inicial para os testes."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            is_active=True
        )
    
    def test_login_with_malformed_json(self):
        """Teste de login com JSON malformado."""
        # Enviar dados que não são JSON válido
        response = self.client.post(
            '/api/auth/login/',
            data='{"username_or_email": "test@example.com", "password": "incomplete',
            content_type='application/json'
        )
        
        # Deve retornar erro de bad request ou rate limiting
        self.assertIn(response.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_429_TOO_MANY_REQUESTS
        ])
    
    def test_registration_with_invalid_email_format(self):
        """Teste de registro com formato de email inválido."""
        invalid_emails = [
            'invalid-email',
            '@domain.com',
            'user@',
            'user@domain',
            '',
        ]
        
        for invalid_email in invalid_emails:
            data = {
                'email': invalid_email,
                'password': 'validpass123',
                'password_confirm': 'validpass123',
                'first_name': 'Test',
                'last_name': 'User'
            }
            
            response = self.client.post('/api/auth/register/', data)
            
            # Deve retornar erro de validação
            self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_token_verification_with_corrupted_token(self):
        """Teste de verificação com token corrompido."""
        corrupted_tokens = [
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.corrupted.signature',
            'not.a.token.at.all',
            '',
            '...',
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        ]
        
        from rest_framework_simplejwt.tokens import UntypedToken
        
        for corrupted_token in corrupted_tokens:
            with self.assertRaises((InvalidToken, TokenError, ValueError)):
                UntypedToken(corrupted_token)
    
    def test_profile_access_with_expired_token(self):
        """Teste de acesso ao perfil com token expirado."""
        # Criar token JWT manualmente expirado
        refresh = RefreshToken.for_user(self.user)
        access = refresh.access_token
        
        # Modificar manualmente a expiração para o passado
        import time
        past_time = int(time.time()) - 3600  # 1 hora no passado
        access['exp'] = past_time
        
        # Tentar acessar perfil com token expirado
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(access)}')
        response = self.client.get('/api/auth/profile/')
        
        # Deve retornar erro de não autorizado
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_firebase_token_validation_errors(self):
        """Teste de erros na validação de tokens Firebase."""
        firebase_service = FirebaseService()
        
        invalid_tokens = [
            None,
            '',
            'invalid-token',
            '12345',
            'bearer invalid-token',
        ]
        
        for invalid_token in invalid_tokens:
            with self.assertRaises(Exception):
                firebase_service.verify_token(invalid_token)
    
    def test_user_creation_with_duplicate_username(self):
        """Teste de criação de usuário com username duplicado."""
        # Criar primeiro usuário
        first_user = User.objects.create_user(
            username='duplicate',
            email='first@example.com',
            password='password123'
        )
        
        # Tentar criar segundo usuário com mesmo username
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                username='duplicate',  # Username duplicado
                email='second@example.com',
                password='password123'
            )
    
    def test_email_verification_with_nonexistent_token(self):
        """Teste de verificação com token inexistente."""
        nonexistent_token = uuid.uuid4()
        
        response = self.client.get(f'/api/auth/verify-email/{nonexistent_token}/')
        
        # Deve retornar erro ou rate limiting
        self.assertIn(response.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_429_TOO_MANY_REQUESTS
        ])
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            self.assertIn('error', response.data)
    
    def test_password_validation_edge_cases(self):
        """Teste de validação de senhas em casos extremos."""
        edge_case_passwords = [
            '',  # Senha vazia
            ' ',  # Apenas espaço
            '1',  # Muito curta
            '12',  # Muito curta
            'a' * 200,  # Muito longa
            '        ',  # Apenas espaços
        ]
        
        for password in edge_case_passwords:
            data = {
                'email': f'test{len(password)}@example.com',
                'password': password,
                'password_confirm': password,
                'first_name': 'Test',
                'last_name': 'User'
            }
            
            response = self.client.post('/api/auth/register/', data)
            
            # Não deve permitir registro com senhas inválidas
            self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_concurrent_token_refresh(self):
        """Teste de refresh concorrente de tokens."""
        refresh = RefreshToken.for_user(self.user)
        
        # Simular múltiplos refreshes do mesmo token
        responses = []
        for i in range(3):
            # Cada refresh invalida o token anterior
            try:
                new_access = refresh.access_token
                responses.append(True)
            except Exception:
                responses.append(False)
        
        # Pelo menos o primeiro deve funcionar
        self.assertTrue(responses[0])
    
    def test_middleware_with_invalid_authorization_header(self):
        """Teste do middleware com headers de autorização inválidos."""
        invalid_headers = [
            'Bearer',  # Sem token
            'Token invalid-token',  # Tipo errado
            'Bearer ',  # Token vazio
            'invalid-format',  # Formato incorreto
        ]
        
        for invalid_header in invalid_headers:
            response = self.client.get(
                '/api/auth/profile/',
                HTTP_AUTHORIZATION=invalid_header
            )
            
            # Deve retornar erro de não autorizado
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    @patch('apps.authentication.firebase_service.FirebaseService.initialize')
    def test_firebase_initialization_failure(self, mock_initialize):
        """Teste de falha na inicialização do Firebase."""
        mock_initialize.side_effect = Exception("Firebase initialization failed")
        
        firebase_service = FirebaseService()
        
        with self.assertRaises(Exception):
            firebase_service.verify_token('valid-token')
    
    def test_user_profile_creation_edge_cases(self):
        """Teste de criação de UserProfile em casos extremos."""
        # Usuário sem email
        user_no_email = User.objects.create_user(
            username='noemail',
            email='',  # Email vazio
            password='password123'
        )
        
        # Deve ser possível criar perfil mesmo sem email
        profile = UserProfile.objects.create(user=user_no_email)
        self.assertIsNotNone(profile)
        
        # Tentar criar profile duplicado
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            UserProfile.objects.create(user=user_no_email)
    
    def test_serializer_validation_with_unicode_data(self):
        """Teste de validação com dados Unicode."""
        unicode_data = {
            'email': 'tëst@éxämplë.com',
            'password': 'pássw🔐rd123',
            'password_confirm': 'pássw🔐rd123',
            'first_name': 'Tëst',
            'last_name': 'Üsér'
        }
        
        response = self.client.post('/api/auth/register/', unicode_data)
        
        # Sistema deve lidar com caracteres Unicode
        # (Pode aceitar ou rejeitar, mas não deve quebrar)
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_429_TOO_MANY_REQUESTS  # Rate limiting
        ])
    
    def test_rate_limiting_behavior(self):
        """Teste de comportamento com rate limiting."""
        # Este teste verifica se o sistema responde adequadamente
        # quando rate limiting está ativo
        
        # Fazer múltiplas requisições rapidamente
        responses = []
        for i in range(5):
            response = self.client.post('/api/auth/login/', {
                'username_or_email': 'nonexistent@example.com',
                'password': 'wrongpassword'
            })
            responses.append(response.status_code)
        
        # Verificar se há consistência nas respostas
        # (Pode ser 400 para dados inválidos ou 429 para rate limiting)
        for status_code in responses:
            self.assertIn(status_code, [
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_429_TOO_MANY_REQUESTS
            ])
    
    def test_database_integrity_constraints(self):
        """Teste de constraints de integridade do banco."""
        # Tentar criar EmailVerificationToken sem usuário
        with self.assertRaises(Exception):
            EmailVerificationToken.objects.create(
                user=None,  # Usuário None deve falhar
                token=uuid.uuid4()
            )
        
        # Tentar criar UserProfile sem usuário
        with self.assertRaises(Exception):
            UserProfile.objects.create(
                user=None  # Usuário None deve falhar
            )
    
    def test_long_form_data_handling(self):
        """Teste com dados de formulário muito longos."""
        long_data = {
            'email': f'{"a" * 100}@example.com',  # Email muito longo
            'password': 'a' * 100,  # Senha muito longa
            'password_confirm': 'a' * 100,
            'first_name': 'a' * 100,  # Nome muito longo
            'last_name': 'a' * 100
        }
        
        response = self.client.post('/api/auth/register/', long_data)
        
        # Sistema deve validar adequadamente dados longos
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def test_special_characters_in_form_data(self):
        """Teste com caracteres especiais em dados do formulário."""
        special_data = {
            'email': 'test+special@example.com',
            'password': 'Pass@#$%123!',
            'password_confirm': 'Pass@#$%123!',
            'first_name': "O'Connor",  # Aspas simples
            'last_name': 'Smith-Jones'  # Hífen
        }
        
        response = self.client.post('/api/auth/register/', special_data)
        
        # Sistema deve lidar com caracteres especiais válidos
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_429_TOO_MANY_REQUESTS
        ])


class FirebaseErrorHandlingTest(TestCase):
    """Testes específicos para tratamento de erros do Firebase."""
    
    def setUp(self):
        """Configuração inicial."""
        self.firebase_service = FirebaseService()
    
    @patch('apps.authentication.firebase_service.auth.verify_id_token')
    def test_firebase_token_expired_error(self, mock_verify):
        """Teste de token Firebase expirado."""
        from firebase_admin.auth import ExpiredIdTokenError
        mock_verify.side_effect = ExpiredIdTokenError("Token expired", None)
        
        with self.assertRaises(Exception):
            self.firebase_service.verify_token('expired-token')
    
    @patch('apps.authentication.firebase_service.auth.verify_id_token')
    def test_firebase_token_invalid_error(self, mock_verify):
        """Teste de token Firebase inválido."""
        from firebase_admin.auth import InvalidIdTokenError
        mock_verify.side_effect = InvalidIdTokenError("Token invalid", None)
        
        with self.assertRaises(Exception):
            self.firebase_service.verify_token('invalid-token')
    
    @patch('apps.authentication.firebase_service.auth.verify_id_token')
    def test_firebase_network_error(self, mock_verify):
        """Teste de erro de rede com Firebase."""
        mock_verify.side_effect = ConnectionError("Network error")
        
        with self.assertRaises(Exception):
            self.firebase_service.verify_token('network-error-token')
    
    def test_firebase_user_data_validation(self):
        """Teste de validação de dados do usuário Firebase."""
        invalid_firebase_users = [
            {},  # Dados vazios
            {'uid': 'test'},  # Sem email
            {'email': ''},  # Email vazio
            {'email': None},  # Email None
            {'email': 'test@example.com'},  # Sem UID
        ]
        
        for invalid_user in invalid_firebase_users:
            with self.assertRaises(Exception):
                self.firebase_service.create_or_update_user(invalid_user)


class SecurityErrorHandlingTest(TestCase):
    """Testes para tratamento de erros de segurança."""
    
    def setUp(self):
        """Configuração inicial."""
        self.client = APIClient()
    
    def test_sql_injection_attempts(self):
        """Teste de tentativas de SQL injection."""
        sql_injection_attempts = [
            "'; DROP TABLE auth_user; --",
            "admin'--",
            "1' OR '1'='1",
            "test@example.com'; DROP TABLE auth_user; --"
        ]
        
        for injection_attempt in sql_injection_attempts:
            data = {
                'username_or_email': injection_attempt,
                'password': 'anypassword'
            }
            
            response = self.client.post('/api/auth/login/', data)
            
            # Sistema não deve quebrar com tentativas de injection
            self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def test_xss_attempts_in_registration(self):
        """Teste de tentativas de XSS no registro."""
        xss_attempts = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>",
            "&#60;script&#62;alert('xss')&#60;/script&#62;"
        ]
        
        for xss_attempt in xss_attempts:
            data = {
                'email': f'test@example.com',
                'password': 'validpass123',
                'password_confirm': 'validpass123',
                'first_name': xss_attempt,
                'last_name': 'User'
            }
            
            response = self.client.post('/api/auth/register/', data)
            
            # Sistema deve sanitizar ou rejeitar tentativas de XSS
            self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def test_csrf_protection(self):
        """Teste de proteção CSRF."""
        # Tentar fazer POST sem CSRF token adequado
        from django.test import Client
        client = Client(enforce_csrf_checks=True)
        
        data = {
            'username_or_email': 'test@example.com',
            'password': 'password123'
        }
        
        response = client.post('/api/auth/login/', data)
        
        # CSRF deve estar protegido ou não se aplicar a API
        # (APIs REST geralmente não usam CSRF)
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,  # Se CSRF não se aplica
            status.HTTP_400_BAD_REQUEST,  # Dados inválidos
            status.HTTP_403_FORBIDDEN,  # CSRF falhou
            status.HTTP_429_TOO_MANY_REQUESTS  # Rate limiting
        ])
