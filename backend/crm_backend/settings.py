
"""
Django settings for crm_backend project.
"""

from pathlib import Path
from dotenv import load_dotenv
import os
from datetime import timedelta

# Email settings (configure via .env)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)

# Frontend URL for verification link
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-this-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'channels',  # WebSocket support para chat
    # TODO: Enable when packages are installed
    # 'drf_yasg',
    
    # Local apps
    'apps.authentication',
    'apps.companies',
    'apps.kanban',
    'apps.communities',
    'apps.chat',
    'apps.dashboard',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # CSRF disabled para desenvolvimento - habilitar em produção
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # NOVO: Cookie JWT authentication middleware - HABILITADO
    'apps.authentication.jwt_cookie_middleware.CookieJWTAuthenticationMiddleware',
    # ANTIGO: Firebase middleware - DESABILITADO
    # 'apps.authentication.middleware.FirebaseAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'crm_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'crm_backend.wsgi.application'
ASGI_APPLICATION = 'crm_backend.asgi.application'

# Channels configuration for WebSocket
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

# Fallback para desenvolvimento sem Redis
import os
if os.getenv('USE_REDIS_CHANNELS', 'false').lower() != 'true':
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer'
        }
    }


# Database - Using SQLite for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# TODO: Switch to MySQL in production
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': os.getenv('DATABASE_NAME', 'crm_db'),
#         'USER': os.getenv('DATABASE_USER', 'root'),
#         'PASSWORD': os.getenv('DATABASE_PASSWORD', 'password'),
#         'HOST': os.getenv('DATABASE_HOST', 'localhost'),
#         'PORT': os.getenv('DATABASE_PORT', '3306'),
#         'OPTIONS': {
#             'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
#         },
#     }
# }

# Custom User Model (disabled for now)
# AUTH_USER_MODEL = 'authentication.User'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.authentication.firebase_drf_auth.FirebaseAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # Suporte a JWT Django
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    # TODO: Enable when django_filters is installed
    # 'DEFAULT_FILTER_BACKENDS': [
    #     'django_filters.rest_framework.DjangoFilterBackend',
    #     'rest_framework.filters.SearchFilter',
    #     'rest_framework.filters.OrderingFilter',
    # ],
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins in development
CORS_ALLOW_ALL_HEADERS = True  # Allow all headers in development
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-auth-type',  # Header para identificar tipo de token (firebase/django)
    'X-Auth-Type',  # Case variation for header
]
CORS_ALLOWED_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# TODO: Enable when Channels is installed
# Channels Configuration (WebSockets)
# ASGI_APPLICATION = 'crm_backend.asgi.application'

# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels_redis.core.RedisChannelLayer',
#         'CONFIG': {
#             'hosts': [os.getenv('REDIS_URL', 'redis://localhost:6379/0')],
#         },
#     },
# }

# ===== SECURITY SETTINGS =====
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Session security
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# CSRF settings
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'

# ===== CACHING =====
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# Redis cache quando disponível (não obrigatório)
try:
    import django_redis
    if os.getenv('REDIS_URL'):
        CACHES = {
            'default': {
                'BACKEND': 'django_redis.cache.RedisCache',
                'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1'),
                'OPTIONS': {
                    'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                }
            }
        }
except ImportError:
    # django_redis não está instalado, usar cache local
    pass

# ===== LOGGING =====
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
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'apps': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

# Criar diretório de logs se não existir
import os
log_dir = BASE_DIR / 'logs'
os.makedirs(log_dir, exist_ok=True)

# ===== API THROTTLING =====
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = [
    'rest_framework.throttling.AnonRateThrottle',
    'rest_framework.throttling.UserRateThrottle'
]
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '100/hour',
    'user': '1000/hour'
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Firebase Configuration
FIREBASE_CREDENTIALS_PATH = os.path.join(BASE_DIR.parent, 'crm-system-ff0eb-firebase-adminsdk-fbsvc-bc12dede9b.json')

# Swagger Configuration
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    }
}
