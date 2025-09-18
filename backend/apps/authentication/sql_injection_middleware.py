"""
SQL Injection Protection Middleware
"""

import re
import logging
from django.http import HttpResponseBadRequest, JsonResponse
from django.conf import settings

logger = logging.getLogger(__name__)

class SQLInjectionProtectionMiddleware:
    """
    Middleware para detectar tentativas de SQL Injection
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Padrões SQL Injection comuns (corrigidos)
        self.sql_patterns = [
            r"(%27)|(')|(\-\-)|(%23)|(#)",  # SQL meta-characters
            r"((%3D)|(=))[^\n]*((%27)|(')|(\-\-)|(%3B)|(;))",  # Typical SQL injection attack
            r"((%27)|(')){2}",  # Double quotes
            r"(.*)(union)(.*)",  # UNION attacks
            r"(.*)(select)(.*)",  # SELECT attacks
            r"(.*)(insert)(.*)",  # INSERT attacks
            r"(.*)(update)(.*)",  # UPDATE attacks
            r"(.*)(delete)(.*)",  # DELETE attacks
            r"(.*)(drop)(.*)",  # DROP attacks
            r"(.*)(create)(.*)",  # CREATE attacks
            r"(.*)(alter)(.*)",  # ALTER attacks
            r"(.*)(grant)(.*)",  # GRANT attacks
            r"(.*)(revoke)(.*)",  # REVOKE attacks
            r"(.*)(exec)(.*)",  # EXEC attacks
            r"(.*)(sp_)(.*)",  # Stored procedure attacks
            r"(.*)(xp_)(.*)",  # Extended stored procedure attacks
            r"(%3B)|(;)",  # Semicolon
            r"(%22)|(\")",  # Double quote
            r"(%5C)|(\\)",  # Backslash
            r"(%2A)|(\*)",  # Asterisk
            r"(%27)|(')",  # Single quote
            r"(%2B)|(\+)",  # Plus sign
            r"(%3D)|(=)",  # Equals sign
            r"(%7C)|(\|)",  # Pipe
            r"information_schema",  # Information schema attacks
            r"mysql\.",  # MySQL specific attacks
            r"pg_",  # PostgreSQL specific attacks
            r"sys\.",  # System table attacks
            r"master\.",  # SQL Server specific attacks
            r"@@version",  # Version detection
            r"benchmark\s*\(",  # MySQL benchmark function
            r"sleep\s*\(",  # Sleep function attacks
            r"waitfor\s+delay",  # SQL Server time delay
            r"convert\s*\(",  # Type conversion attacks
            r"cast\s*\(",  # Type casting attacks
            r"concat\s*\(",  # String concatenation
            r"substring\s*\(",  # Substring function
            r"ascii\s*\(",  # ASCII function
            r"char\s*\(",  # Character function
            r"having\s+\d+\s*=\s*\d+",  # HAVING clause attacks
            r"group\s+by\s+\d+",  # GROUP BY attacks
            r"order\s+by\s+\d+",  # ORDER BY attacks
            r"and\s+\d+\s*=\s*\d+",  # Boolean-based blind SQL injection
            r"or\s+\d+\s*=\s*\d+",  # Boolean-based blind SQL injection
            r"'\s+or\s+'1'\s*=\s*'1",  # Classic SQL injection
            r"'\s+or\s+1\s*=\s*1",  # Classic SQL injection
            r"admin'\s*--",  # Admin bypass attempt
            r"'\s+union\s+select",  # UNION SELECT injection
        ]
        
        # Compilar regex para performance
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE | re.DOTALL) for pattern in self.sql_patterns]
        
        # Palavras-chave SQL suspeitas
        self.sql_keywords = [
            'union', 'select', 'insert', 'update', 'delete', 'drop', 'create', 'alter',
            'grant', 'revoke', 'exec', 'execute', 'sp_', 'xp_', 'information_schema',
            'benchmark', 'sleep', 'waitfor', 'delay', 'convert', 'cast', 'concat',
            'substring', 'ascii', 'char', 'having', 'group by', 'order by'
        ]
    
    def __call__(self, request):
        # Permitir usuários autenticados
        if hasattr(request, 'user') and request.user.is_authenticated:
            return self.get_response(request)
            
        # Verificar SQL injection nos parâmetros
        if self.contains_sql_injection(request):
            client_ip = self.get_client_ip(request)
            logger.warning(f"SQL Injection attempt detected from IP: {client_ip} on path: {request.path}")
            
            return JsonResponse({
                'error': 'Invalid request: potential SQL injection detected',
                'message': 'Your request contains potentially malicious SQL patterns'
            }, status=400)
        
        response = self.get_response(request)
        return response
    
    def get_client_ip(self, request):
        """Obter IP do cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def contains_sql_injection(self, request):
        """Verificar se a requisição contém SQL injection"""
        # Pular verificação para health checks
        if request.path.startswith('/api/health/'):
            return False
            
        # Verificar GET parameters
        for key, value in request.GET.items():
            if self.is_sql_injection_payload(value):
                return True
        
        # Verificar POST data
        if hasattr(request, 'POST'):
            for key, value in request.POST.items():
                if self.is_sql_injection_payload(value):
                    return True
        
        return False
    
    def is_sql_injection_payload(self, payload):
        """Verificar se o payload contém SQL injection"""
        if not payload:
            return False

        payload_str = str(payload).lower()
        
        # Indicadores SQL simples mas efetivos
        sql_indicators = [
            "' or '1'='1", "' or 1=1", "' or true", "admin'--", 
            "' union select", "'; drop table", "'; delete from",
            "' and '1'='1", "or 1=1--", "union all select",
            "information_schema", "' or ''='", "1' or '1'='1",
            "' having 1=1", "' group by", "' order by", "benchmark(",
            "sleep(", "waitfor delay", "pg_sleep", "' and 1=1"
        ]
        
        # Verificar padrões regex primeiro
        for pattern in self.compiled_patterns:
            if pattern.search(payload_str):
                return True
        
        # Verificar indicadores simples
        for indicator in sql_indicators:
            if indicator in payload_str:
                return True
        
        # Verificar múltiplas palavras-chave SQL suspeitas
        keyword_count = 0
        for keyword in self.sql_keywords:
            if keyword in payload_str:
                keyword_count += 1
                if keyword_count >= 2:  # 2 ou mais palavras-chave SQL = suspeito
                    return True
        
        return False


class QueryParameterValidationMiddleware:
    """
    Middleware para validar parâmetros de query
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Parâmetros permitidos por endpoint
        self.allowed_params = {
            '/api/companies/companies/': ['page', 'page_size', 'search', 'ordering'],
            '/api/kanban/boards/': ['page', 'page_size', 'search'],
            '/api/chat/rooms/': ['page', 'page_size'],
            '/api/dashboard/metrics/': ['period', 'type'],
        }
        
        # Regex para valores permitidos
        self.param_patterns = {
            'page': r'^\d+$',
            'page_size': r'^(10|20|50|100)$',
            'search': r'^[a-zA-Z0-9\s\-_\.@]{0,100}$',
            'ordering': r'^-?[a-zA-Z_]{1,50}$',
            'period': r'^(day|week|month|year)$',
            'type': r'^(revenue|users|orders)$',
        }
    
    def __call__(self, request):
        # Validar parâmetros apenas para endpoints específicos
        if request.path in self.allowed_params:
            if not self.validate_query_params(request):
                return JsonResponse({
                    'error': 'Invalid query parameters',
                    'message': 'One or more query parameters contain invalid values'
                }, status=400)
        
        response = self.get_response(request)
        return response
    
    def validate_query_params(self, request):
        """Validar parâmetros de query"""
        allowed_for_path = self.allowed_params.get(request.path, [])
        
        for param, value in request.GET.items():
            # Verificar se parâmetro é permitido
            if param not in allowed_for_path:
                logger.warning(f"Unauthorized parameter '{param}' for path {request.path}")
                return False
            
            # Verificar formato do valor
            if param in self.param_patterns:
                pattern = self.param_patterns[param]
                if not re.match(pattern, str(value)):
                    logger.warning(f"Invalid value '{value}' for parameter '{param}'")
                    return False
        
        return True
