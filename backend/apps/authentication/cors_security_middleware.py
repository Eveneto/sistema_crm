"""
CORS Security Middleware - Proteção adicional contra origens maliciosas
"""

import re
import logging
from django.http import HttpResponseForbidden
from django.conf import settings

logger = logging.getLogger(__name__)

class CORSSecurityMiddleware:
    """
    Middleware adicional para validar origens CORS de forma mais restritiva
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Origens permitidas (além das configuradas no django-cors-headers)
        self.allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        
        # Padrões suspeitos para bloquear
        self.suspicious_patterns = [
            r'.*malicious.*',
            r'.*evil.*',
            r'.*hack.*',
            r'.*attack.*',
            r'.*exploit.*',
            r'.*ngrok.*',  # Túneis temporários
        ]
        
        # Domínios de desenvolvimento permitidos
        self.dev_domains = [
            'localhost',
            '127.0.0.1',
            '[::1]'
        ]
    
    def __call__(self, request):
        origin = request.META.get('HTTP_ORIGIN')
        
        if origin:
            # Verificar padrões suspeitos
            if self.is_suspicious_origin(origin):
                logger.warning(f"CORS: Blocked suspicious origin: {origin}")
                return HttpResponseForbidden("Origin not allowed")
            
            # Em produção, ser mais restritivo
            if not getattr(settings, 'DEBUG', False):
                if not self.is_allowed_origin(origin):
                    logger.warning(f"CORS: Blocked unauthorized origin in production: {origin}")
                    return HttpResponseForbidden("Origin not allowed")
        
        response = self.get_response(request)
        
        # Adicionar headers de segurança CORS
        if origin and self.is_allowed_origin(origin):
            response['Access-Control-Allow-Origin'] = origin
            response['Vary'] = 'Origin'
        
        return response
    
    def is_suspicious_origin(self, origin):
        """Verificar se a origem é suspeita"""
        for pattern in self.suspicious_patterns:
            if re.match(pattern, origin, re.IGNORECASE):
                return True
        return False
    
    def is_allowed_origin(self, origin):
        """Verificar se a origem é permitida"""
        # Verificar lista de origens permitidas
        if origin in self.allowed_origins:
            return True
        
        # Em desenvolvimento, permitir domínios de dev
        if getattr(settings, 'DEBUG', False):
            for dev_domain in self.dev_domains:
                if dev_domain in origin:
                    return True
        
        return False
