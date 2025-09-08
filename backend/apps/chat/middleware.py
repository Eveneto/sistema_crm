"""
Middleware simples para autenticação WebSocket via JWT cookies
"""
import logging
from urllib.parse import parse_qs
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)
User = get_user_model()


class WebSocketAuthenticationMiddleware(BaseMiddleware):
    """
    Middleware para autenticar usuários WebSocket usando cookies JWT
    """
    
    async def __call__(self, scope, receive, send):
        # Extrair cookies do header
        headers = dict(scope['headers'])
        cookie_header = headers.get(b'cookie', b'').decode()
        
        user = AnonymousUser()
        
        if cookie_header:
            try:
                # Parse cookies
                cookies = self.parse_cookies(cookie_header)
                
                # Verificar se tem cookie de access_token JWT
                access_token = cookies.get('access_token')
                
                if access_token:
                    # Autenticar via JWT token
                    user = await self.authenticate_user_from_jwt(access_token)
                    logger.info(f"🔌 WebSocket user authenticated: {user}")
                else:
                    logger.warning("🔌 No access_token cookie found")
                    
            except Exception as e:
                logger.error(f"❌ WebSocket auth error: {e}")
        
        if not user or user.is_anonymous:
            logger.warning("🔌 WebSocket connection rejected: No authenticated user")
        
        # Adicionar usuário ao scope
        scope['user'] = user
        
        return await super().__call__(scope, receive, send)
    
    def parse_cookies(self, cookie_header):
        """Parse cookie string para dict"""
        cookies = {}
        for item in cookie_header.split(';'):
            if '=' in item:
                key, value = item.strip().split('=', 1)
                cookies[key] = value
        return cookies
    
    @database_sync_to_async
    def authenticate_user_from_jwt(self, token):
        """
        Autenticar usuário usando JWT token
        """
        try:
            # Validar token JWT
            UntypedToken(token)
            
            # Decodificar token para obter user_id
            decoded_token = jwt_decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=["HS256"]
            )
            
            # Buscar usuário no banco
            user_id = decoded_token.get('user_id')
            if user_id:
                user = User.objects.get(pk=user_id)
                logger.info(f"🔌 User found in JWT: {user.username}")
                return user
            else:
                logger.warning("🔌 No user_id in JWT token")
                
        except InvalidToken:
            logger.warning("🔌 Invalid JWT token")
        except TokenError as e:
            logger.warning(f"🔌 JWT token error: {e}")
        except User.DoesNotExist:
            logger.warning(f"🔌 User not found for id: {user_id}")
        except Exception as e:
            logger.error(f"🔌 JWT auth error: {e}")
        
        return AnonymousUser()


def WebSocketAuthenticationMiddlewareStack(inner):
    """
    Stack de middleware para WebSocket com autenticação JWT
    """
    return WebSocketAuthenticationMiddleware(inner)
