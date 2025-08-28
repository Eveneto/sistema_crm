from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
import jwt
from django.conf import settings

User = get_user_model()


class CookieAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware para autenticação via HttpOnly cookies
    """
    
    def process_request(self, request):
        # Rotas que não precisam de autenticação
        public_paths = [
            '/api/auth/login/',
            '/api/auth/register/',
            '/api/auth/verify-email/',
            '/api/auth/firebase-validate/',
            '/api/auth/refresh/',  # Refresh precisa de cookie mas não de Authorization
            '/admin/',
            '/static/',
            '/media/'
        ]
        
        # Verifica se é rota pública
        for path in public_paths:
            if request.path.startswith(path):
                return
        
        # Prioridade: Header Authorization > Cookie
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        # Se já tem Authorization header, deixa DRF processar
        if auth_header.startswith('Bearer '):
            return
        
        # Tentar obter token do cookie
        access_token = request.COOKIES.get('access_token')
        
        if access_token:
            try:
                # Adicionar header Authorization baseado no cookie
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
                print(f"🍪 Cookie auth: Token adicionado ao header para {request.path}")
                
            except Exception as e:
                print(f"❌ Erro ao processar cookie token: {e}")
        
        return None
