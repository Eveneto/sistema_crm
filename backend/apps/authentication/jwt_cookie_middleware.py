from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class CookieJWTAuthenticationMiddleware:
    """
    Middleware SIMPLIFICADO para autenticação via cookies HttpOnly
    Substitui o Firebase middleware confuso
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Excluir Django admin e endpoints públicos
        if (request.path.startswith('/admin') or 
            request.path.startswith('/api/auth/login/') or
            request.path.startswith('/api/auth/register/') or
            request.path.startswith('/api/auth/google-login/') or
            request.path.startswith('/api/auth/refresh/')):
            return self.get_response(request)
        
        # Verificar se já tem Authorization header (mobile/API)
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            # Deixar o DRF lidar com JWT no header
            return self.get_response(request)
        
        # Tentar autenticação via cookie
        access_token = request.COOKIES.get('access_token')
        
        if access_token:
            try:
                # Validar token JWT
                UntypedToken(access_token)
                
                # Decodificar para pegar user_id
                from rest_framework_simplejwt.tokens import AccessToken
                decoded_token = AccessToken(access_token)
                user_id = decoded_token['user_id']
                
                # Buscar usuário
                user = User.objects.get(id=user_id)
                request.user = user
                
                # IMPORTANTE: Definir Authorization header para o DRF
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
                
                logger.debug(f"✅ Cookie auth sucesso: {user.email}")
                
            except (InvalidToken, TokenError, User.DoesNotExist) as e:
                logger.warning(f"⚠️ Cookie token inválido: {str(e)}")
                request.user = AnonymousUser()
        else:
            # Sem cookie, usuário anônimo
            request.user = AnonymousUser()
        
        return self.get_response(request)
