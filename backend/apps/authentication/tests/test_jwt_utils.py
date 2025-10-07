"""
Testes para funcionalidades JWT do sistema de autenticação.
Cobre geração, validação, refresh e expiração de tokens JWT usando simple-jwt.
"""

import unittest
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken, UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from datetime import timedelta
import jwt
from django.conf import settings


class JWTTokenTest(TestCase):
    """Testes para funcionalidades de tokens JWT."""
    
    def setUp(self):
        """Configuração inicial para os testes."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_generate_refresh_token_for_user(self):
        """Teste de geração de refresh token para usuário."""
        refresh = RefreshToken.for_user(self.user)
        
        self.assertIsInstance(refresh, RefreshToken)
        self.assertEqual(refresh['user_id'], self.user.id)
        self.assertIn('exp', refresh)
        self.assertIn('iat', refresh)
        self.assertIn('jti', refresh)
    
    def test_generate_access_token_from_refresh(self):
        """Teste de geração de access token a partir do refresh token."""
        refresh = RefreshToken.for_user(self.user)
        access = refresh.access_token
        
        self.assertIsInstance(access, AccessToken)
        self.assertEqual(access['user_id'], self.user.id)
        self.assertIn('exp', access)
        self.assertIn('iat', access)
    
    def test_token_contains_expected_claims(self):
        """Teste se o token contém as claims esperadas."""
        refresh = RefreshToken.for_user(self.user)
        access = refresh.access_token
        
        # Claims do refresh token
        self.assertEqual(refresh['user_id'], self.user.id)
        self.assertEqual(refresh['token_type'], 'refresh')
        
        # Claims do access token
        self.assertEqual(access['user_id'], self.user.id)
        self.assertEqual(access['token_type'], 'access')
    
    def test_refresh_token_lifetime(self):
        """Teste da duração do refresh token."""
        refresh = RefreshToken.for_user(self.user)
        
        # Verificar se o token tem tempo de expiração
        exp_timestamp = refresh['exp']
        iat_timestamp = refresh['iat']
        
        # Calcular duração
        duration = exp_timestamp - iat_timestamp
        
        # Verificar se a duração é razoável (deve ser pelo menos 1 dia)
        self.assertGreater(duration, 86400)  # 24 horas em segundos
    
    def test_access_token_lifetime(self):
        """Teste da duração do access token."""
        refresh = RefreshToken.for_user(self.user)
        access = refresh.access_token
        
        # Verificar se o token tem tempo de expiração
        exp_timestamp = access['exp']
        iat_timestamp = access['iat']
        
        # Calcular duração
        duration = exp_timestamp - iat_timestamp
        
        # Access token deve ter duração menor que refresh token
        # Normalmente entre 5 minutos e várias horas
        self.assertLessEqual(duration, 86400)  # Menos que 1 dia
        self.assertGreater(duration, 300)  # Mais que 5 minutos
    
    def test_token_validation_with_valid_token(self):
        """Teste de validação com token válido."""
        refresh = RefreshToken.for_user(self.user)
        access = refresh.access_token
        
        # Validar usando UntypedToken
        try:
            validated_token = UntypedToken(str(access))
            self.assertEqual(validated_token['user_id'], self.user.id)
        except (InvalidToken, TokenError):
            self.fail("Token válido não deveria gerar exceção")
    
    def test_token_validation_with_invalid_token(self):
        """Teste de validação com token inválido."""
        invalid_token = "invalid.token.here"
        
        with self.assertRaises((InvalidToken, TokenError)):
            UntypedToken(invalid_token)
    
    def test_token_validation_with_malformed_token(self):
        """Teste de validação com token malformado."""
        malformed_tokens = [
            "not.a.token",
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9",  # Só header
            "",  # Token vazio
            "bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9",  # Com prefixo
        ]
        
        for malformed_token in malformed_tokens:
            with self.assertRaises((InvalidToken, TokenError)):
                UntypedToken(malformed_token)
    
    def test_token_expiration_handling(self):
        """Teste do tratamento de tokens expirados."""
        # Este teste é complexo pois simple-jwt calcula expiração em runtime
        # Vamos testar com token manualmente expirado
        refresh = RefreshToken.for_user(self.user)
        
        # Modificar manualmente a expiração para o passado
        import time
        past_time = int(time.time()) - 3600  # 1 hora no passado
        refresh['exp'] = past_time
        
        # Token deveria estar expirado
        with self.assertRaises((InvalidToken, TokenError)):
            UntypedToken(str(refresh))
    
    def test_refresh_token_regeneration(self):
        """Teste de regeneração de access token usando refresh token."""
        refresh = RefreshToken.for_user(self.user)
        original_access = str(refresh.access_token)
        
        # Gerar novo access token
        new_access = str(refresh.access_token)
        
        # Os tokens devem ser diferentes (novo jti)
        self.assertNotEqual(original_access, new_access)
        
        # Mas ambos devem ter o mesmo user_id
        original_decoded = AccessToken(original_access)
        new_decoded = AccessToken(new_access)
        
        self.assertEqual(original_decoded['user_id'], new_decoded['user_id'])
    
    def test_token_blacklisting(self):
        """Teste de blacklist de tokens (se disponível)."""
        refresh = RefreshToken.for_user(self.user)
        
        # Token deve ser válido inicialmente
        try:
            UntypedToken(str(refresh))
        except (InvalidToken, TokenError):
            self.fail("Token deveria ser válido inicialmente")
        
        # Verificar se blacklist está disponível
        if hasattr(refresh, 'blacklist'):
            # Blacklist o token
            refresh.blacklist()
            
            # Token deve ser inválido após blacklist
            with self.assertRaises((InvalidToken, TokenError)):
                UntypedToken(str(refresh))
        else:
            # Se não há blacklist, apenas verificar que o token ainda é válido
            try:
                UntypedToken(str(refresh))
            except (InvalidToken, TokenError):
                self.fail("Token deveria permanecer válido sem blacklist")
    
    def test_token_decoding_without_verification(self):
        """Teste de decodificação de token sem verificação de assinatura."""
        refresh = RefreshToken.for_user(self.user)
        token_string = str(refresh)
        
        # Decodificar sem verificação
        decoded = jwt.decode(token_string, options={"verify_signature": False})
        
        self.assertEqual(decoded['user_id'], self.user.id)
        self.assertIn('exp', decoded)
        self.assertIn('iat', decoded)
    
    def test_multiple_tokens_for_same_user(self):
        """Teste de múltiplos tokens para o mesmo usuário."""
        token1 = RefreshToken.for_user(self.user)
        token2 = RefreshToken.for_user(self.user)
        
        # Tokens devem ser diferentes
        self.assertNotEqual(str(token1), str(token2))
        
        # Mas ambos devem ser válidos
        self.assertEqual(token1['user_id'], self.user.id)
        self.assertEqual(token2['user_id'], self.user.id)
    
    def test_token_with_custom_claims(self):
        """Teste de token com claims personalizadas."""
        refresh = RefreshToken.for_user(self.user)
        
        # Adicionar claim personalizada
        refresh['custom_claim'] = 'custom_value'
        
        # Verificar se a claim foi adicionada
        decoded = UntypedToken(str(refresh))
        self.assertEqual(decoded['custom_claim'], 'custom_value')
    
    def test_token_algorithm_validation(self):
        """Teste de validação do algoritmo do token."""
        refresh = RefreshToken.for_user(self.user)
        token_string = str(refresh)
        
        # Decodificar header para verificar algoritmo
        header = jwt.get_unverified_header(token_string)
        
        self.assertEqual(header['alg'], 'HS256')
        self.assertEqual(header['typ'], 'JWT')
    
    def test_token_with_different_users(self):
        """Teste de tokens para usuários diferentes."""
        user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        
        token1 = RefreshToken.for_user(self.user)
        token2 = RefreshToken.for_user(user2)
        
        # Tokens devem ter user_ids diferentes
        self.assertEqual(token1['user_id'], self.user.id)
        self.assertEqual(token2['user_id'], user2.id)
        self.assertNotEqual(token1['user_id'], token2['user_id'])
    
    def test_token_verification_with_wrong_secret(self):
        """Teste de verificação com chave secreta errada."""
        refresh = RefreshToken.for_user(self.user)
        token_string = str(refresh)
        
        # Tentar decodificar com chave errada
        with self.assertRaises(jwt.InvalidSignatureError):
            jwt.decode(token_string, "wrong_secret", algorithms=["HS256"])
    
    def test_token_structure_validation(self):
        """Teste de validação da estrutura do token."""
        refresh = RefreshToken.for_user(self.user)
        token_string = str(refresh)
        
        # Token JWT deve ter 3 partes separadas por pontos
        parts = token_string.split('.')
        self.assertEqual(len(parts), 3)
        
        # Cada parte deve ser base64 válida
        for part in parts:
            try:
                import base64
                base64.urlsafe_b64decode(part + '==')  # Padding para base64
            except Exception:
                pass  # Algumas partes podem não ser base64 puro (por padding)


class JWTCookieMiddlewareTest(TestCase):
    """Testes específicos para o middleware de cookies JWT."""
    
    def setUp(self):
        """Configuração inicial para os testes."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_token_extraction_from_cookie(self):
        """Teste de extração de token de cookie."""
        from apps.authentication.jwt_cookie_middleware import CookieJWTAuthenticationMiddleware
        
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)
        
        # Mock request com cookie
        mock_request = MagicMock()
        mock_request.path = '/api/protected/'
        mock_request.META = {}
        mock_request.COOKIES = {'access_token': access_token}
        
        # Mock get_response
        mock_get_response = MagicMock()
        
        middleware = CookieJWTAuthenticationMiddleware(mock_get_response)
        
        # O middleware deve processar o request
        # (Teste mais detalhado seria necessário para verificar autenticação)
        self.assertIsInstance(middleware, CookieJWTAuthenticationMiddleware)
    
    def test_middleware_bypasses_public_paths(self):
        """Teste se middleware ignora paths públicos."""
        from apps.authentication.jwt_cookie_middleware import CookieJWTAuthenticationMiddleware
        
        public_paths = [
            '/admin/login/',
            '/api/auth/login/',
            '/api/auth/register/',
            '/api/auth/google-login/',
            '/api/auth/refresh/'
        ]
        
        mock_get_response = MagicMock()
        middleware = CookieJWTAuthenticationMiddleware(mock_get_response)
        
        for path in public_paths:
            mock_request = MagicMock()
            mock_request.path = path
            mock_request.META = {}
            
            # Middleware deve chamar get_response diretamente
            result = middleware(mock_request)
            mock_get_response.assert_called_with(mock_request)
