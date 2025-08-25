from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from .firebase_service import FirebaseService
import json


class FirebaseAuthenticationMiddleware:
    """
    Middleware para autenticação automática via tokens Firebase
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Processa request antes da view
        self.process_request(request)
        
        # Chama próximo middleware ou view
        response = self.get_response(request)
        
        return response

    def process_request(self, request):
        # Ignora para rotas que não precisam de autenticação
        public_paths = [
            '/auth/login/',
            '/auth/register/', 
            '/auth/verify-email/',
            '/auth/firebase-validate/',
            '/admin/',
            '/static/',
            '/media/'
        ]
        
        # Verifica se é rota pública
        for path in public_paths:
            if request.path.startswith(path):
                return
        
        # Verifica header de autorização
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        auth_type = request.META.get('HTTP_X_AUTH_TYPE', 'django')  # Default Django
        
        if not auth_header.startswith('Bearer '):
            return
            
        token = auth_header[7:]  # Remove 'Bearer '
        
        # Se é token Firebase, valida
        if auth_type == 'firebase':
            firebase_user_data, error = FirebaseService.verify_firebase_token(token)
            
            if not error and firebase_user_data:
                # Busca ou cria usuário Django
                user, user_error = FirebaseService.get_or_create_user_from_firebase(firebase_user_data)
                
                if user and not user_error:
                    # Adiciona usuário ao request
                    request.user = user
                    request.firebase_user_data = firebase_user_data
                    return
        
        # Se chegou aqui, deixa Django lidar com autenticação normal
        return
