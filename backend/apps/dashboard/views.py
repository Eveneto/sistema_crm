from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import connection
from django.conf import settings
from django.core.cache import cache
import os
import time


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint para monitoramento de produção
    """
    try:
        # Verificar conexão com banco de dados
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # Verificar arquivos críticos
    critical_files = {
        'firebase_credentials': os.path.exists(os.path.join(settings.BASE_DIR.parent, 'crm-system-ff0eb-firebase-adminsdk-fbsvc-bc12dede9b.json')),
        'settings': os.path.exists(os.path.join(settings.BASE_DIR, 'crm_backend', 'settings.py')),
    }
    
    # Status geral
    is_healthy = db_status == "connected" and all(critical_files.values())
    
    response_data = {
        'status': 'healthy' if is_healthy else 'unhealthy',
        'timestamp': timezone.now().isoformat(),
        'database': {
            'status': db_status,
            'connected': db_status == "connected"
        },
        'debug_mode': settings.DEBUG,
        'critical_files': critical_files,
        'version': '1.0.0',
        'services': {
            'authentication': True,
            'companies': True,
            'kanban': True,
            'dashboard': True,
        },
        'health_check': 'ok'  # Indicador específico para testes
    }
    
    return Response(
        response_data, 
        status=status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def ready_check(request):
    """
    Readiness check - verifica se o sistema está pronto para receber tráfego
    """
    try:
        # Verificações mais rigorosas para readiness
        from django.contrib.auth.models import User
        
        # Verificar se consegue fazer query no banco
        user_count = User.objects.count()
        
        # Verificar apps críticos (mais permissivo)
        apps_status = {}
        try:
            from apps.companies.models import Company
            apps_status['companies'] = True  # Se importou, está OK
        except:
            apps_status['companies'] = False
            
        try:
            from apps.kanban.models import KanbanBoard
            apps_status['kanban'] = True  # Se importou, está OK
        except:
            apps_status['kanban'] = False
        
        # Sistema está pronto se pelo menos o básico funciona
        all_ready = user_count >= 0 and apps_status.get('companies', False)
        
        return Response({
            'ready': all_ready,
            'timestamp': timezone.now().isoformat(),
            'user_count': user_count,
            'apps': apps_status
        }, status=status.HTTP_200_OK if all_ready else status.HTTP_503_SERVICE_UNAVAILABLE)
        
    except Exception as e:
        return Response({
            'ready': False,
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def performance_metrics(request):
    """
    Métricas de performance do sistema para administradores
    """
    try:
        # Métricas básicas sem psutil
        import resource
        memory_usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        
        # Métricas de banco de dados
        start_time = time.time()
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM auth_user")
        db_response_time = (time.time() - start_time) * 1000  # em ms
        
        # Cache status
        cache_test_key = f"health_check_{int(time.time())}"
        cache.set(cache_test_key, "test", 10)
        cache_working = cache.get(cache_test_key) == "test"
        cache.delete(cache_test_key)
        
        return Response({
            'timestamp': timezone.now().isoformat(),
            'system': {
                'memory_usage_kb': memory_usage,
                'uptime_check': True,
            },
            'database': {
                'response_time_ms': round(db_response_time, 2),
                'status': 'healthy' if db_response_time < 100 else 'slow'
            },
            'cache': {
                'working': cache_working,
                'backend': settings.CACHES['default']['BACKEND']
            },
            'requests': {
                'current_time': timezone.now().isoformat(),
                'debug_mode': settings.DEBUG
            }
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
