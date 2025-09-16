"""
Middleware de auditoria de segurança para rotas protegidas
"""
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseForbidden
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class SecurityAuditMiddleware(MiddlewareMixin):
    """
    Middleware para auditar e fortalecer a segurança das rotas
    """
    
    # Rotas que DEVEM ser protegidas (não podem ser acessadas sem autenticação)
    PROTECTED_PATTERNS = [
        '/api/companies/',
        '/api/kanban/',
        '/api/communities/',
        '/api/chat/',
        '/api/dashboard/metrics/',
    ]
    
    # Rotas que DEVEM ser públicas
    PUBLIC_PATTERNS = [
        '/api/auth/login/',
        '/api/auth/register/',
        '/api/auth/google-login/',
        '/api/health/',
        '/admin/',
    ]
    
    def process_request(self, request):
        """
        Audita o acesso às rotas e aplica políticas de segurança
        """
        path = request.path
        user = getattr(request, 'user', None)
        
        # Log de acesso para auditoria
        if not settings.DEBUG:
            logger.info(f"ACCESS: {request.method} {path} - User: {user} - IP: {self.get_client_ip(request)}")
        
        # Verificar se rota protegida está sendo acessada sem autenticação
        for protected_pattern in self.PROTECTED_PATTERNS:
            if path.startswith(protected_pattern):
                if not user or not user.is_authenticated:
                    logger.warning(f"SECURITY: Unauthorized access attempt to {path} from IP {self.get_client_ip(request)}")
                    return HttpResponseForbidden("Authentication required for this resource")
        
        # Verificar tentativas de acesso suspeitas
        if self.is_suspicious_request(request):
            logger.warning(f"SECURITY: Suspicious request detected from IP {self.get_client_ip(request)}: {path}")
            # Em produção, poderia bloquear ou rate limit agressivo
        
        return None
    
    def get_client_ip(self, request):
        """
        Obtém o IP real do cliente, considerando proxies
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def is_suspicious_request(self, request):
        """
        Detecta padrões suspeitos de requisições
        """
        suspicious_patterns = [
            '/wp-admin',
            '/phpmyadmin',
            '/.env',
            '/config.php',
            '/.git',
            '/admin.php',
            '/../',
            '/etc/passwd',
            'UNION SELECT',
            '<script>',
            'javascript:',
        ]
        
        path = request.path.lower()
        query = request.GET.urlencode().lower()
        
        for pattern in suspicious_patterns:
            if pattern.lower() in path or pattern.lower() in query:
                return True
        
        return False


class APISecurityMiddleware(MiddlewareMixin):
    """
    Middleware específico para segurança de APIs
    """
    
    def process_response(self, request, response):
        """
        Adiciona headers de segurança específicos para APIs
        """
        # Headers de segurança para APIs
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Para APIs, não queremos cache de respostas sensíveis
        if request.path.startswith('/api/') and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
        
        # Content Security Policy básico para APIs
        if not settings.DEBUG:
            response['Content-Security-Policy'] = "default-src 'none'; frame-ancestors 'none';"
        
        return response
