from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseForbidden
from django.core.exceptions import SuspiciousOperation
import logging
import re
import time
from collections import defaultdict
from django.conf import settings

logger = logging.getLogger('security')

class SecurityMiddleware(MiddlewareMixin):
    """
    Middleware avançado de segurança para produção
    """
    
    def __init__(self, get_response):
        super().__init__(get_response)
        self.get_response = get_response
        
        # Rate limiting em memória (usar Redis em produção)
        self.request_counts = defaultdict(list)
        
        # Padrões suspeitos
        self.suspicious_patterns = [
            r'<script.*?>.*?</script>',  # XSS básico
            r'javascript:',              # JavaScript injection
            r'onload=',                  # Event handlers
            r'onclick=',
            r'onmouseover=',
            r'eval\(',                   # Eval injection
            r'union.*select',            # SQL injection
            r'drop.*table',
            r'insert.*into',
            r'\.\./.*',                  # Directory traversal
            r'\.\.\\.*',
        ]
        
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.suspicious_patterns]

    def process_request(self, request):
        """
        Processa request antes da view
        """
        start_time = time.time()
        request._security_start_time = start_time
        
        # 1. Rate limiting básico
        if self._check_rate_limit(request):
            logger.warning(f"Rate limit exceeded for IP: {self._get_client_ip(request)}")
            return HttpResponseForbidden("Rate limit exceeded")
        
        # 2. Validação de input suspeito
        if self._check_suspicious_input(request):
            logger.error(f"Suspicious input detected from IP: {self._get_client_ip(request)}")
            raise SuspiciousOperation("Suspicious input detected")
        
        # 3. Validação de User-Agent
        if self._check_suspicious_user_agent(request):
            logger.warning(f"Suspicious User-Agent from IP: {self._get_client_ip(request)}")
        
        return None

    def process_response(self, request, response):
        """
        Processa response após a view
        """
        # Log timing de requests lentos
        if hasattr(request, '_security_start_time'):
            duration = time.time() - request._security_start_time
            if duration > 5.0:  # Requests > 5 segundos
                logger.warning(f"Slow request: {request.path} took {duration:.2f}s")
        
        # Headers adicionais de segurança
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Content Security Policy para produção
        if not settings.DEBUG:
            csp = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: https:; "
                "connect-src 'self' https://api.yourdomain.com"
            )
            response['Content-Security-Policy'] = csp
        
        return response

    def _get_client_ip(self, request):
        """Obtém IP real do cliente considerando proxies"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def _check_rate_limit(self, request):
        """
        Rate limiting básico (100 requests por minuto por IP)
        Em produção, usar Redis com django-ratelimit
        """
        ip = self._get_client_ip(request)
        now = time.time()
        
        # Limpar requests antigos (mais de 1 minuto)
        self.request_counts[ip] = [
            timestamp for timestamp in self.request_counts[ip] 
            if now - timestamp < 60
        ]
        
        # Adicionar request atual
        self.request_counts[ip].append(now)
        
        # Verificar limite (100 requests por minuto)
        return len(self.request_counts[ip]) > 100

    def _check_suspicious_input(self, request):
        """
        Verifica inputs suspeitos em GET e POST
        """
        # Verificar query parameters
        for key, value in request.GET.items():
            if self._is_suspicious_string(value):
                logger.error(f"Suspicious GET parameter '{key}': {value}")
                return True
        
        # Verificar POST data se não for multipart
        if request.method == 'POST' and request.content_type != 'multipart/form-data':
            try:
                for key, value in request.POST.items():
                    if self._is_suspicious_string(str(value)):
                        logger.error(f"Suspicious POST parameter '{key}': {value}")
                        return True
            except:
                pass  # Pode falhar se não for form data
        
        return False

    def _is_suspicious_string(self, text):
        """
        Verifica se uma string contém padrões suspeitos
        """
        if not isinstance(text, str):
            text = str(text)
        
        for pattern in self.compiled_patterns:
            if pattern.search(text):
                return True
        
        return False

    def _check_suspicious_user_agent(self, request):
        """
        Verifica User-Agents suspeitos
        """
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        
        suspicious_agents = [
            'sqlmap',
            'nikto',
            'nmap',
            'masscan',
            'wget',
            'curl',  # Pode ser legítimo, mas loggar
            'python-requests',
            'bot',
            'crawler',
            'spider'
        ]
        
        for agent in suspicious_agents:
            if agent in user_agent:
                return True
        
        return False


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware para logging detalhado de requests
    """
    
    def process_request(self, request):
        """Log de requests importantes"""
        # Log apenas requests importantes (não assets)
        if (request.path.startswith('/api/') or 
            request.path.startswith('/admin/') or
            request.method in ['POST', 'PUT', 'DELETE']):
            
            logger.info(f"Request: {request.method} {request.path} from {self._get_client_ip(request)}")
            
            # Log dados sensíveis apenas em desenvolvimento
            if settings.DEBUG:
                if request.method == 'POST':
                    logger.debug(f"POST data: {request.POST}")

    def process_response(self, request, response):
        """Log de responses com erros"""
        if response.status_code >= 400:
            logger.warning(
                f"Error response: {response.status_code} for "
                f"{request.method} {request.path} from {self._get_client_ip(request)}"
            )
        
        return response

    def _get_client_ip(self, request):
        """Obtém IP real do cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
