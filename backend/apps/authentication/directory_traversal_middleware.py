"""
Middleware de proteção contra Directory Traversal
"""
import os
import re
from django.http import HttpResponseForbidden
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings


class DirectoryTraversalProtectionMiddleware(MiddlewareMixin):
    """
    Middleware para proteger contra ataques de directory traversal
    """
    
    # Padrões perigosos que podem indicar directory traversal
    DANGEROUS_PATTERNS = [
        r'\.\./',
        r'\.\.\\',
        r'%2e%2e%2f',
        r'%2e%2e%5c',
        r'%252e%252e%252f',
        r'%252e%252e%255c',
        r'\.\.%2f',
        r'\.\.%5c',
        r'%2e%2e/',
        r'%2e%2e\\',
        r'..%c0%af',
        r'..%c1%9c',
    ]
    
    # Arquivos/diretórios sensíveis do sistema
    FORBIDDEN_PATHS = [
        '/etc/passwd',
        '/etc/shadow',
        '/etc/hosts',
        '/proc/',
        '/sys/',
        '/dev/',
        'settings.py',
        '.env',
        'manage.py',
        'requirements.txt',
    ]
    
    def process_request(self, request):
        """
        Verifica se a requisição contém tentativas de directory traversal
        """
        # Obtém o path da URL e query string
        full_path = request.get_full_path()
        
        # Verifica padrões perigosos
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, full_path, re.IGNORECASE):
                return HttpResponseForbidden(
                    "Directory traversal attempt detected"
                )
        
        # Verifica tentativas de acesso a arquivos sensíveis
        for forbidden_path in self.FORBIDDEN_PATHS:
            if forbidden_path.lower() in full_path.lower():
                return HttpResponseForbidden(
                    "Access to system files forbidden"
                )
        
        # Verifica se o path normalizado ainda contém .. após normalização
        normalized_path = os.path.normpath(request.path)
        if '..' in normalized_path:
            return HttpResponseForbidden(
                "Invalid path detected"
            )
        
        return None
