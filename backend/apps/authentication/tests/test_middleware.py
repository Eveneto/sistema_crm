"""
Testes para o middleware de autenticação Firebase.

Cobre:
- FirebaseAuthenticationMiddleware: processamento de tokens
- Validação de tokens Firebase
- Criação/atualização de usuários
- Tratamento de erros e cenários edge case
- Integração com Django admin
"""

from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User, AnonymousUser
from django.http import HttpResponse
from unittest.mock import patch, MagicMock
import json
from apps.authentication.middleware import FirebaseAuthenticationMiddleware


class FirebaseAuthenticationMiddlewareTest(TestCase):
    """Testes para FirebaseAuthenticationMiddleware."""

    def setUp(self):
        """Configuração inicial para os testes."""
        self.factory = RequestFactory()
        self.middleware = FirebaseAuthenticationMiddleware(lambda request: HttpResponse('OK'))

    @patch('apps.authentication.middleware.FirebaseService')
    def test_middleware_initialization(self, mock_firebase_service):
        """Teste da inicialização do middleware."""
        mock_service = MagicMock()
        mock_firebase_service.return_value = mock_service
        
        middleware = FirebaseAuthenticationMiddleware(lambda request: HttpResponse('OK'))
        
        mock_firebase_service.assert_called_once()
        mock_service.initialize.assert_called_once()

    @patch('apps.authentication.middleware.FirebaseService')
    def test_middleware_initialization_error(self, mock_firebase_service):
        """Teste de erro na inicialização do Firebase."""
        mock_service = MagicMock()
        mock_service.initialize.side_effect = Exception('Firebase initialization error')
        mock_firebase_service.return_value = mock_service
        
        # Middleware deve continuar funcionando mesmo com erro de inicialização
        middleware = FirebaseAuthenticationMiddleware(lambda request: HttpResponse('OK'))
        self.assertIsNotNone(middleware)

    def test_admin_path_bypass(self):
        """Teste se paths do Django admin são ignorados."""
        request = self.factory.get('/admin/some-page/')
        
        response = self.middleware(request)
        
        # Deve processar normalmente sem tentar autenticação Firebase
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'OK')

    @patch('apps.authentication.middleware.FirebaseService')
    def test_valid_firebase_token(self, mock_firebase_service):
        """Teste com token Firebase válido."""
        # Mock do Firebase service
        mock_service = MagicMock()
        mock_decoded_token = {
            'uid': 'firebase_uid_123',
            'email': 'test@example.com',
            'name': 'Test User'
        }
        mock_user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        
        mock_service.verify_token.return_value = mock_decoded_token
        mock_service.create_or_update_user.return_value = mock_user
        mock_firebase_service.return_value = mock_service
        
        # Recriar middleware com mock
        middleware = FirebaseAuthenticationMiddleware(lambda request: HttpResponse('OK'))
        
        # Request com token válido
        request = self.factory.get('/api/some-endpoint/')
        request.META['HTTP_AUTHORIZATION'] = 'Bearer valid_firebase_token'
        
        response = middleware(request)
        
        # Verificar se usuário foi autenticado
        self.assertEqual(request.user, mock_user)
        mock_service.verify_token.assert_called_once_with('valid_firebase_token')
        mock_service.create_or_update_user.assert_called_once_with(mock_decoded_token)

    @patch('apps.authentication.middleware.FirebaseService')
    def test_invalid_firebase_token(self, mock_firebase_service):
        """Teste com token Firebase inválido."""
        # Mock do Firebase service com erro
        mock_service = MagicMock()
        mock_service.verify_token.side_effect = Exception('Invalid token')
        mock_firebase_service.return_value = mock_service
        
        # Recriar middleware com mock
        middleware = FirebaseAuthenticationMiddleware(lambda request: HttpResponse('OK'))
        
        # Request com token inválido
        request = self.factory.get('/api/some-endpoint/')
        request.META['HTTP_AUTHORIZATION'] = 'Bearer invalid_firebase_token'
        
        response = middleware(request)
        
        # Usuário deve ser anônimo
        self.assertIsInstance(request.user, AnonymousUser)
        mock_service.verify_token.assert_called_once_with('invalid_firebase_token')

    def test_no_authorization_header(self):
        """Teste sem header de autorização."""
        request = self.factory.get('/api/some-endpoint/')
        
        response = self.middleware(request)
        
        # Usuário deve ser anônimo
        self.assertIsInstance(request.user, AnonymousUser)

    def test_invalid_authorization_header_format(self):
        """Teste com header de autorização em formato inválido."""
        request = self.factory.get('/api/some-endpoint/')
        request.META['HTTP_AUTHORIZATION'] = 'Invalid format token'
        
        response = self.middleware(request)
        
        # Usuário deve ser anônimo
        self.assertIsInstance(request.user, AnonymousUser)

    def test_empty_authorization_header(self):
        """Teste com header de autorização vazio."""
        request = self.factory.get('/api/some-endpoint/')
        request.META['HTTP_AUTHORIZATION'] = ''
        
        response = self.middleware(request)
        
        # Usuário deve ser anônimo
        self.assertIsInstance(request.user, AnonymousUser)

    def test_bearer_without_token(self):
        """Teste com Bearer sem token."""
        request = self.factory.get('/api/some-endpoint/')
        request.META['HTTP_AUTHORIZATION'] = 'Bearer '
        
        response = self.middleware(request)
        
        # Usuário deve ser anônimo
        self.assertIsInstance(request.user, AnonymousUser)

    @patch('apps.authentication.middleware.FirebaseService')
    def test_multiple_requests_same_middleware(self, mock_firebase_service):
        """Teste múltiplas requisições no mesmo middleware."""
        mock_service = MagicMock()
        mock_user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        
        # Primeira chamada bem-sucedida
        mock_service.verify_token.return_value = {'uid': 'test', 'email': 'test@example.com'}
        mock_service.create_or_update_user.return_value = mock_user
        mock_firebase_service.return_value = mock_service
        
        middleware = FirebaseAuthenticationMiddleware(lambda request: HttpResponse('OK'))
        
        # Primeira requisição - sucesso
        request1 = self.factory.get('/api/endpoint1/')
        request1.META['HTTP_AUTHORIZATION'] = 'Bearer valid_token'
        response1 = middleware(request1)
        self.assertEqual(request1.user, mock_user)
        
        # Segunda requisição - erro
        mock_service.verify_token.side_effect = Exception('Token expired')
        request2 = self.factory.get('/api/endpoint2/')
        request2.META['HTTP_AUTHORIZATION'] = 'Bearer expired_token'
        response2 = middleware(request2)
        self.assertIsInstance(request2.user, AnonymousUser)

    @patch('apps.authentication.middleware.FirebaseService')
    def test_firebase_service_create_user_error(self, mock_firebase_service):
        """Teste de erro na criação/atualização do usuário."""
        mock_service = MagicMock()
        mock_service.verify_token.return_value = {'uid': 'test', 'email': 'test@example.com'}
        mock_service.create_or_update_user.side_effect = Exception('Database error')
        mock_firebase_service.return_value = mock_service
        
        middleware = FirebaseAuthenticationMiddleware(lambda request: HttpResponse('OK'))
        
        request = self.factory.get('/api/some-endpoint/')
        request.META['HTTP_AUTHORIZATION'] = 'Bearer valid_token'
        
        response = middleware(request)
        
        # Usuário deve ser anônimo devido ao erro
        self.assertIsInstance(request.user, AnonymousUser)

    def test_request_already_has_user(self):
        """Teste quando request já tem usuário definido."""
        existing_user = User.objects.create_user(
            username='existinguser',
            email='existing@example.com'
        )
        
        request = self.factory.get('/api/some-endpoint/')
        request.user = existing_user  # Usuário já definido
        
        response = self.middleware(request)
        
        # Usuário não deve ser alterado
        self.assertEqual(request.user, existing_user)

    @patch('apps.authentication.middleware.FirebaseService')
    def test_middleware_with_different_paths(self, mock_firebase_service):
        """Teste do middleware com diferentes paths."""
        mock_service = MagicMock()
        mock_firebase_service.return_value = mock_service
        
        middleware = FirebaseAuthenticationMiddleware(lambda request: HttpResponse('OK'))
        
        # Lista de paths para testar
        test_paths = [
            '/api/authentication/login/',
            '/api/companies/',
            '/api/dashboard/',
            '/health/',
            '/',
            '/api/kanban/boards/',
        ]
        
        for path in test_paths:
            request = self.factory.get(path)
            response = middleware(request)
            
            # Todos devem processar normalmente
            self.assertEqual(response.status_code, 200)
            # Usuário deve ser anônimo (sem token)
            self.assertIsInstance(request.user, AnonymousUser)

    @patch('apps.authentication.middleware.FirebaseService')
    def test_different_http_methods(self, mock_firebase_service):
        """Teste do middleware com diferentes métodos HTTP."""
        mock_service = MagicMock()
        mock_firebase_service.return_value = mock_service
        
        middleware = FirebaseAuthenticationMiddleware(lambda request: HttpResponse('OK'))
        
        # Testa diferentes métodos HTTP
        methods = ['get', 'post', 'put', 'patch', 'delete']
        
        for method in methods:
            request = getattr(self.factory, method)('/api/test/')
            response = middleware(request)
            
            self.assertEqual(response.status_code, 200)
            self.assertIsInstance(request.user, AnonymousUser)

    @patch('apps.authentication.middleware.logger')
    @patch('apps.authentication.middleware.FirebaseService')
    def test_logging_behavior(self, mock_firebase_service, mock_logger):
        """Teste do comportamento de logging do middleware."""
        mock_service = MagicMock()
        mock_service.verify_token.side_effect = Exception('Invalid token')
        mock_firebase_service.return_value = mock_service
        
        middleware = FirebaseAuthenticationMiddleware(lambda request: HttpResponse('OK'))
        
        request = self.factory.get('/api/test/')
        request.META['HTTP_AUTHORIZATION'] = 'Bearer invalid_token'
        
        response = middleware(request)
        
        # Verificar se logs foram chamados
        mock_logger.info.assert_called()
        mock_logger.warning.assert_called()
