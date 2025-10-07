"""
Configurações específicas para testes.
Este arquivo sobrescreve configurações do settings.py principal para otimizar os testes.
"""

from .settings import *  # Import all from main settings
import sys

# Identificar que estamos em modo de teste
TESTING = True

# Desabilitar rate limiting durante testes
DISABLE_RATE_LIMITING = True

# Usar banco de dados em memória para testes mais rápidos
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Desabilitar middlewares de segurança durante testes
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # Firebase authentication middleware (mantido para testes de integração)
    'apps.authentication.middleware.FirebaseAuthenticationMiddleware',
    # Cookie JWT authentication middleware
    'apps.authentication.jwt_cookie_middleware.CookieJWTAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configurações de logging para testes (reduzir verbosidade)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'WARNING',  # Apenas warnings e errors durante testes
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'security': {
            'handlers': ['console'],
            'level': 'ERROR',  # Apenas errors críticos
            'propagate': False,
        },
        'authentication': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        }
    },
}

# Configurações de email para testes (usar console backend)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Configurações de cache para testes (usar cache local simples)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Configurações Firebase para testes (usar valores mock)
FIREBASE_CREDENTIALS_PATH = None  # Forçar uso de mocking

# Configurações JWT para testes (tokens de vida mais curta)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=10),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Password hashers mais rápidos para testes
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',  # Mais rápido para testes
]

# Desabilitar migrações durante testes para velocidade
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

if 'test' in sys.argv:
    MIGRATION_MODULES = DisableMigrations()

# Configurações específicas para testes automatizados
if 'test' in sys.argv:
    # Forçar DEBUG=False para testar middlewares de produção quando necessário
    # mas manter TESTING=True para desabilitar rate limiting
    DEBUG = False
    
    # Usar secret key fixa para testes
    SECRET_KEY = 'test-secret-key-for-automated-tests'
    
    # Configurações de CORS para testes
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOW_CREDENTIALS = True
