"""
Rate Limiting Middleware para proteção contra DoS/DDoS
Implementação simples baseada em IP address
"""

import time
from django.http import HttpResponse
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware:
    """
    Middleware para implementar rate limiting baseado em IP
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Configurações padrão (podem ser sobrescritas via settings)
        self.requests_per_minute = getattr(settings, 'RATE_LIMIT_REQUESTS_PER_MINUTE', 60)
        self.requests_per_hour = getattr(settings, 'RATE_LIMIT_REQUESTS_PER_HOUR', 1000)
        self.block_duration = getattr(settings, 'RATE_LIMIT_BLOCK_DURATION', 300)  # 5 minutos
        
    def __call__(self, request):
        # Verificar rate limiting
        if self.is_rate_limited(request):
            logger.warning(f"Rate limit exceeded for IP: {self.get_client_ip(request)}")
            return HttpResponse(
                "Rate limit exceeded. Please try again later.",
                status=429,
                headers={'Retry-After': str(self.block_duration)}
            )
        
        # Registrar requisição
        self.record_request(request)
        
        response = self.get_response(request)
        return response
    
    def get_client_ip(self, request):
        """Obter IP real do cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def is_rate_limited(self, request):
        """Verificar se o IP está sendo rate limited"""
        ip = self.get_client_ip(request)
        
        # Chaves para cache
        minute_key = f"rate_limit_minute:{ip}:{int(time.time() // 60)}"
        hour_key = f"rate_limit_hour:{ip}:{int(time.time() // 3600)}"
        blocked_key = f"rate_limit_blocked:{ip}"
        
        # Verificar se IP está bloqueado
        if cache.get(blocked_key):
            return True
        
        # Verificar limites
        minute_count = cache.get(minute_key, 0)
        hour_count = cache.get(hour_key, 0)
        
        if minute_count >= self.requests_per_minute or hour_count >= self.requests_per_hour:
            # Bloquear IP temporariamente
            cache.set(blocked_key, True, self.block_duration)
            return True
        
        return False
    
    def record_request(self, request):
        """Registrar requisição para contagem"""
        ip = self.get_client_ip(request)
        
        # Chaves para cache
        minute_key = f"rate_limit_minute:{ip}:{int(time.time() // 60)}"
        hour_key = f"rate_limit_hour:{ip}:{int(time.time() // 3600)}"
        
        # Incrementar contadores
        minute_count = cache.get(minute_key, 0) + 1
        hour_count = cache.get(hour_key, 0) + 1
        
        cache.set(minute_key, minute_count, 60)  # Expira em 1 minuto
        cache.set(hour_key, hour_count, 3600)   # Expira em 1 hora


class APIRateLimitMiddleware:
    """
    Rate limiting específico para APIs com limites mais restritivos
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Limites mais restritivos para APIs
        self.api_requests_per_minute = getattr(settings, 'API_RATE_LIMIT_REQUESTS_PER_MINUTE', 30)
        self.api_requests_per_hour = getattr(settings, 'API_RATE_LIMIT_REQUESTS_PER_HOUR', 500)
        
    def __call__(self, request):
        # Aplicar rate limiting apenas para URLs de API
        if request.path.startswith('/api/') and not request.path.startswith('/api/health/'):
            if self.is_api_rate_limited(request):
                logger.warning(f"API Rate limit exceeded for IP: {self.get_client_ip(request)} on {request.path}")
                return HttpResponse(
                    "API rate limit exceeded. Please try again later.",
                    status=429,
                    headers={
                        'Retry-After': '60',
                        'X-RateLimit-Limit': str(self.api_requests_per_minute),
                        'X-RateLimit-Remaining': '0'
                    }
                )
            
            self.record_api_request(request)
        
        response = self.get_response(request)
        
        # Adicionar headers de rate limit na resposta da API
        if request.path.startswith('/api/'):
            ip = self.get_client_ip(request)
            minute_key = f"api_rate_limit_minute:{ip}:{int(time.time() // 60)}"
            current_count = cache.get(minute_key, 0)
            
            response['X-RateLimit-Limit'] = str(self.api_requests_per_minute)
            response['X-RateLimit-Remaining'] = str(max(0, self.api_requests_per_minute - current_count))
            response['X-RateLimit-Reset'] = str(int(time.time()) + 60)
        
        return response
    
    def get_client_ip(self, request):
        """Obter IP real do cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def is_api_rate_limited(self, request):
        """Verificar rate limiting específico para APIs"""
        ip = self.get_client_ip(request)
        
        minute_key = f"api_rate_limit_minute:{ip}:{int(time.time() // 60)}"
        hour_key = f"api_rate_limit_hour:{ip}:{int(time.time() // 3600)}"
        
        minute_count = cache.get(minute_key, 0)
        hour_count = cache.get(hour_key, 0)
        
        return minute_count >= self.api_requests_per_minute or hour_count >= self.api_requests_per_hour
    
    def record_api_request(self, request):
        """Registrar requisição da API"""
        ip = self.get_client_ip(request)
        
        minute_key = f"api_rate_limit_minute:{ip}:{int(time.time() // 60)}"
        hour_key = f"api_rate_limit_hour:{ip}:{int(time.time() // 3600)}"
        
        minute_count = cache.get(minute_key, 0) + 1
        hour_count = cache.get(hour_key, 0) + 1
        
        cache.set(minute_key, minute_count, 60)
        cache.set(hour_key, hour_count, 3600)
