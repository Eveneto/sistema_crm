"""
Production settings for CRM Backend
Este arquivo é carregado automaticamente quando ENVIRONMENT=production
"""

import os
from datetime import timedelta

# ============================================
# ENVIRONMENT DETECTION
# ============================================
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
IS_PRODUCTION = ENVIRONMENT == 'production'

# ============================================
# SECURITY SETTINGS - PRODUCTION
# ============================================

if IS_PRODUCTION:
    # 1. DEBUG DESABILITADO
    DEBUG = False
    
    # 2. SECRET_KEY FORTE
    # IMPORTANTE: Gere com: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
    # E coloque em .env como: SECRET_KEY=xxxxx
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY or SECRET_KEY.startswith('django-insecure-'):
        raise ValueError("❌ ERRO: SECRET_KEY não está configurada ou é insegura!")
    
    # 3. ALLOWED_HOSTS
    ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')
    if not ALLOWED_HOSTS or ALLOWED_HOSTS == ['']:
        raise ValueError("❌ ERRO: ALLOWED_HOSTS não está configurado!")
    
    # 4. CSRF PROTECTION
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_HTTPONLY = True
    CSRF_COOKIE_SAMESITE = 'Strict'
    CSRF_TRUSTED_ORIGINS = ALLOWED_HOSTS
    
    # 5. SESSION SECURITY
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
    
    # 6. HTTPS/SSL
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    
    # 7. HSTS (HTTP Strict Transport Security)
    SECURE_HSTS_SECONDS = 31536000  # 1 ano
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # 8. SEGURANÇA DE HEADERS
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
    X_FRAME_OPTIONS = 'DENY'
    
    # 9. CONTENT SECURITY POLICY
    SECURE_CONTENT_SECURITY_POLICY = {
        'default-src': ("'self'",),
        'script-src': ("'self'", "'unsafe-inline'"),
        'style-src': ("'self'", "'unsafe-inline'", "https://fonts.googleapis.com"),
        'img-src': ("'self'", "data:", "https:"),
        'font-src': ("'self'", "https://fonts.gstatic.com"),
        'connect-src': ("'self'", "https:"),
    }
    
    # ============================================
    # DATABASE - POSTGRESQL EM PRODUÇÃO
    # ============================================
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DATABASE_NAME', 'crm_db'),
            'USER': os.getenv('DATABASE_USER', 'crm_user'),
            'PASSWORD': os.getenv('DATABASE_PASSWORD', ''),
            'HOST': os.getenv('DATABASE_HOST', 'localhost'),
            'PORT': os.getenv('DATABASE_PORT', '5432'),
            'CONN_MAX_AGE': 600,  # Connection pooling
            'OPTIONS': {
                'connect_timeout': 10,
                'options': '-c statement_timeout=30000',  # 30 segundo timeout
            },
        }
    }
    
    # ============================================
    # CACHE - REDIS EM PRODUÇÃO
    # ============================================
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'CONNECTION_POOL_KWARGS': {
                    'max_connections': 50,
                    'retry_on_timeout': True,
                },
                'SOCKET_CONNECT_TIMEOUT': 5,
                'SOCKET_TIMEOUT': 5,
                'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
            },
            'KEY_PREFIX': 'crm_prod',
            'TIMEOUT': 300,
        }
    }
    
    # ============================================
    # STATIC FILES - WHITENOISE + COMPRESSION
    # ============================================
    STATIC_ROOT = os.path.join('/app', 'staticfiles') if os.path.exists('/app') else os.path.join('..', 'staticfiles')
    STATIC_URL = '/static/'
    STATICFILES_DIRS = []  # Não usar em produção
    
    # Armazenamento comprimido de static files
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    
    # ============================================
    # LOGGING - PRODUÇÃO
    # ============================================
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
                'style': '{',
            },
            'simple': {
                'format': '{levelname} {message}',
                'style': '{',
            },
        },
        'filters': {
            'require_debug_false': {
                '()': 'django.utils.log.RequireDebugFalse',
            },
            'require_debug_true': {
                '()': 'django.utils.log.RequireDebugTrue',
            },
        },
        'handlers': {
            'console': {
                'level': 'INFO',
                'class': 'logging.StreamHandler',
                'formatter': 'simple',
            },
            'file': {
                'level': 'INFO',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': '/var/log/crm/django.log',
                'maxBytes': 1024*1024*10,  # 10 MB
                'backupCount': 5,
                'formatter': 'verbose',
            },
            'error_file': {
                'level': 'ERROR',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': '/var/log/crm/django_errors.log',
                'maxBytes': 1024*1024*10,
                'backupCount': 5,
                'formatter': 'verbose',
            },
        },
        'loggers': {
            'django': {
                'handlers': ['console', 'file', 'error_file'],
                'level': 'INFO',
                'propagate': False,
            },
            'django.security': {
                'handlers': ['console', 'error_file'],
                'level': 'INFO',
                'propagate': False,
            },
            'apps': {
                'handlers': ['console', 'file'],
                'level': 'INFO',
                'propagate': False,
            },
        },
    }
    
    # ============================================
    # EMAIL - SENDGRID EM PRODUÇÃO
    # ============================================
    EMAIL_BACKEND = 'sendgrid_backend.SendgridBackend'
    SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
    if not SENDGRID_API_KEY:
        raise ValueError("❌ ERRO: SENDGRID_API_KEY não está configurada!")
    
    DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@crm.example.com')
    
    # ============================================
    # API THROTTLING - PRODUÇÃO
    # ============================================
    REST_FRAMEWORK = {
        'DEFAULT_THROTTLE_CLASSES': [
            'rest_framework.throttling.AnonRateThrottle',
            'rest_framework.throttling.UserRateThrottle',
        ],
        'DEFAULT_THROTTLE_RATES': {
            'anon': '100/hour',
            'user': '1000/hour',
        },
        'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
        'PAGE_SIZE': 20,
        'DEFAULT_FILTER_BACKENDS': [
            'django_filters.rest_framework.DjangoFilterBackend',
            'rest_framework.filters.SearchFilter',
            'rest_framework.filters.OrderingFilter',
        ],
    }
    
    # ============================================
    # MIDDLEWARE ADICIONAL - COMPRESSÃO
    # ============================================
    # Sobrescrever MIDDLEWARE com compressão adicional para produção
    MIDDLEWARE = [
        'whitenoise.middleware.WhiteNoiseMiddleware',  # Static files comprimidos
        'django.middleware.gzip.GZipMiddleware',  # Compressão de resposta
        'corsheaders.middleware.CorsMiddleware',
        'django.middleware.security.SecurityMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'apps.authentication.jwt_cookie_middleware.CookieJWTAuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    ]
    
    # ============================================
    # GUNICORN CONFIGURATION
    # ============================================
    # Defina em docker-compose ou .env
    # GUNICORN_WORKERS=4
    # GUNICORN_TIMEOUT=30
    # GUNICORN_MAX_REQUESTS=1000

else:
    # ============================================
    # DEVELOPMENT SETTINGS
    # ============================================
    DEBUG = True
    SECRET_KEY = 'django-insecure-development-key-only'
    ALLOWED_HOSTS = ['*']
    
    # Desenvolvimento: mais permissivo
    CSRF_COOKIE_SECURE = False
    SESSION_COOKIE_SECURE = False
    SECURE_SSL_REDIRECT = False
    SECURE_HSTS_SECONDS = 0
    
    # SQLite em desenvolvimento
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': 'db.sqlite3',
        }
    }
    
    # Cache local em desenvolvimento
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }
