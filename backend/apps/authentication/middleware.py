from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from .firebase_service import FirebaseService
import json
import logging

logger = logging.getLogger(__name__)


class FirebaseAuthenticationMiddleware:
    """
    Middleware para autenticação automática via tokens Firebase
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.firebase_service = FirebaseService()
        try:
            self.firebase_service.initialize()
        except Exception as e:
            logger.error("Falha ao inicializar Firebase no middleware")
    
    def __call__(self, request):
        """Processa autenticação Firebase para cada request"""
        
        # Excluir Django admin da autenticação Firebase
        if request.path.startswith('/admin'):
            logger.info(f"🔍 Django admin path detected: {request.path} - skipping Firebase auth")
            return self.get_response(request)
        
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        # Log para debug
        logger.info(f"🔍 Verificando autenticação para: {request.path}")
        logger.info(f"🔍 Authorization header: {auth_header[:50]}..." if auth_header else "🔍 Nenhum Authorization header")
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                logger.info(f"🔐 Verificando token Firebase...")
                decoded_token = self.firebase_service.verify_token(token)
                user = self.firebase_service.create_or_update_user(decoded_token)
                request.user = user
                logger.info(f"✅ Autenticação Firebase bem-sucedida: {user.email}")
            except Exception as e:
                # Log detalhado apenas para debug, não como erro
                logger.warning(f"⚠️ Token Firebase inválido ou expirado: {str(e)[:100]}")
                # Para API requests, retorna usuário anônimo
                request.user = AnonymousUser()
        else:
            # Para requests sem token, deixa o Django lidar com a autenticação padrão
            if not hasattr(request, 'user'):
                request.user = AnonymousUser()
        
        return self.get_response(request)
