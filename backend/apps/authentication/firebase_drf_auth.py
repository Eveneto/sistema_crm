from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser
from .firebase_service import FirebaseService
import logging
import jwt

logger = logging.getLogger(__name__)


class FirebaseAuthentication(BaseAuthentication):
    """
    Classe de autenticação DRF usando Firebase tokens
    """
    
    def __init__(self):
        self.firebase_service = FirebaseService()
        try:
            self.firebase_service.initialize()
        except Exception as e:
            logger.error(f"Falha ao inicializar Firebase na autenticação DRF: {e}")
    
    def authenticate(self, request):
        """
        Autentica o usuário usando token Firebase
        Retorna (user, token) se autenticado, None se não há token ou não é Firebase
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            # Sem token Bearer, retorna None (passa para próximo authenticator)
            return None
            
        token = auth_header.split(' ')[1]
        
        # Verifica se é um token Firebase (tokens Firebase são mais longos e têm formato específico)
        # JWT Django tokens têm 3 partes separadas por ".", Firebase tokens são diferentes
        if '.' in token and len(token.split('.')) == 3:
            # Pode ser um JWT Django, deixa para o próximo authenticator
            try:
                import jwt
                # Tenta decodificar como JWT para ver se tem estrutura válida
                jwt.decode(token, options={"verify_signature": False})
                logger.info(f"🔐 Token parece ser JWT Django, passando para próximo authenticator")
                return None
            except:
                # Não é JWT válido, continua tentando como Firebase
                pass
        
        try:
            logger.info(f"🔐 DRF Firebase: Verificando token para {request.path}")
            decoded_token = self.firebase_service.verify_token(token)
            user = self.firebase_service.create_or_update_user(decoded_token)
            logger.info(f"✅ DRF Firebase: Autenticação bem-sucedida: {user.email}")
            return (user, token)
            
        except Exception as e:
            logger.error(f"❌ DRF Firebase: Erro na autenticação: {e}")
            # Não levanta exceção, deixa para o próximo authenticator tentar
            return None
    
    def authenticate_header(self, request):
        """
        Retorna o header de autenticação para responses 401
        """
        return 'Bearer'
