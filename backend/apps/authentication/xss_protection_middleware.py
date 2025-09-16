"""
XSS Protection Middleware - Proteção contra Cross-Site Scripting
"""

import re
import html
import logging
from django.http import HttpResponseBadRequest, JsonResponse
from django.conf import settings

logger = logging.getLogger(__name__)

class XSSProtectionMiddleware:
    """
    Middleware para detectar e sanitizar tentativas de XSS
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Padrões XSS comuns
        self.xss_patterns = [
            r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>',
            r'javascript:',
            r'vbscript:',
            r'on\w+\s*=',
            r'<iframe\b',
            r'<object\b',
            r'<embed\b',
            r'<link\b',
            r'<meta\b',
            r'<style\b',
            r'expression\s*\(',
            r'url\s*\(',
            r'@import',
            r'<img[^>]+src[^>]*=\s*["\']?\s*javascript:',
            r'<img[^>]+onerror\s*=',
            r'<svg[^>]*onload\s*=',
            r'<[^>]+on\w+\s*=\s*["\']?[^"\']*["\']?',
        ]
        
        # Compilar regex para performance
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE | re.DOTALL) for pattern in self.xss_patterns]
    
    def __call__(self, request):
        # Verificar XSS nos parâmetros da requisição
        if self.contains_xss(request):
            logger.warning(f"XSS attempt detected from IP: {self.get_client_ip(request)}")
            return JsonResponse({
                'error': 'Invalid request: potential XSS detected',
                'message': 'Your request contains potentially malicious content'
            }, status=400)
        
        response = self.get_response(request)
        
        # Adicionar headers de proteção XSS
        response['X-XSS-Protection'] = '1; mode=block'
        response['X-Content-Type-Options'] = 'nosniff'
        
        return response
    
    def get_client_ip(self, request):
        """Obter IP do cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def contains_xss(self, request):
        """Verificar se a requisição contém XSS"""
        # Pular verificação para health checks
        if request.path.startswith('/api/health/'):
            return False
            
        # Verificar GET parameters
        for key, value in request.GET.items():
            if self.is_xss_payload(value):
                return True
        
        # Verificar POST data (se for form data)
        if hasattr(request, 'POST'):
            for key, value in request.POST.items():
                if self.is_xss_payload(value):
                    return True
        
        return False
    
    def is_xss_payload(self, payload):
        """Verificar se o payload contém XSS"""
        if not payload:
            return False
        
        # Converter para string se necessário
        payload_str = str(payload).lower()
        
        # Padrões XSS mais específicos
        xss_indicators = [
            '<script', 'javascript:', 'vbscript:', 'onload=', 'onerror=', 
            'onclick=', 'onmouseover=', '<iframe', '<object', '<embed',
            'alert(', 'confirm(', 'prompt(', 'document.cookie',
            'eval(', 'expression(', '<svg', '<img', 'src=javascript'
        ]
        
        # Verificar contra padrões XSS
        for pattern in self.compiled_patterns:
            if pattern.search(payload_str):
                return True
        
        # Verificar indicadores simples
        for indicator in xss_indicators:
            if indicator in payload_str:
                return True
        
        return False


class InputSanitizationMiddleware:
    """
    Middleware para sanitizar automaticamente inputs
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Sanitizar inputs antes do processamento
        self.sanitize_request(request)
        
        response = self.get_response(request)
        return response
    
    def sanitize_request(self, request):
        """Sanitizar dados da requisição"""
        # Sanitizar GET parameters
        sanitized_get = {}
        for key, value in request.GET.items():
            sanitized_get[key] = self.sanitize_input(value)
        request.GET = sanitized_get
        
        # Sanitizar POST data
        if hasattr(request, 'POST'):
            sanitized_post = {}
            for key, value in request.POST.items():
                sanitized_post[key] = self.sanitize_input(value)
            request.POST = sanitized_post
    
    def sanitize_input(self, value):
        """Sanitizar um valor individual"""
        if not value:
            return value
        
        # Converter para string
        value_str = str(value)
        
        # HTML escape
        sanitized = html.escape(value_str)
        
        # Remover caracteres perigosos
        dangerous_chars = ['<', '>', '"', "'", '&', 'javascript:', 'vbscript:']
        for char in dangerous_chars:
            sanitized = sanitized.replace(char, '')
        
        return sanitized


class CSPMiddleware:
    """
    Content Security Policy Middleware
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # CSP policy restritiva
        self.csp_policy = {
            'default-src': "'self'",
            'script-src': "'self' 'unsafe-inline'",
            'style-src': "'self' 'unsafe-inline'",
            'img-src': "'self' data: https:",
            'font-src': "'self'",
            'connect-src': "'self'",
            'media-src': "'self'",
            'object-src': "'none'",
            'child-src': "'self'",
            'frame-ancestors': "'none'",
            'form-action': "'self'",
            'base-uri': "'self'",
        }
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Aplicar CSP apenas em produção
        if not getattr(settings, 'DEBUG', False):
            csp_header = '; '.join([f"{key} {value}" for key, value in self.csp_policy.items()])
            response['Content-Security-Policy'] = csp_header
        
        return response
