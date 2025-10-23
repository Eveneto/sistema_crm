# 🚀 PLANO DE LANÇAMENTO - CRM SYSTEM
## SendGrid + PostgreSQL + Docker

---

## 📋 FASE 1: SEGURANÇA DJANGO ✅

### **Problemas Encontrados (6 warnings)**

```
❌ 1. CSRF Protection - Desabilitado
❌ 2. HSTS - Não configurado
❌ 3. SSL Redirect - Não ativado
❌ 4. SECRET_KEY - Muito fraco
❌ 5. SESSION_COOKIE_SECURE - Não seguro
❌ 6. DEBUG - Ativado em produção
```

### **Solução Automática**

Vou criar arquivo de settings para produção. Você precisa adicionar isso ao `settings.py`:

```python
# ============================================
# ADICIONAR NO FIM DO ARQUIVO settings.py
# ============================================

# Detectar ambiente de produção
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
IS_PRODUCTION = ENVIRONMENT == 'production'

if IS_PRODUCTION:
    # ✅ 1. Debug desabilitado
    DEBUG = False
    
    # ✅ 2. SECRET_KEY - Gere um novo!
    # Comando: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
    # Coloque o resultado em .env como: SECRET_KEY=xxxxx
    
    # ✅ 3. CSRF Protection
    MIDDLEWARE.insert(0, 'django.middleware.csrf.CsrfViewMiddleware')
    
    # ✅ 4. HSTS (HTTP Strict Transport Security)
    SECURE_HSTS_SECONDS = 31536000  # 1 ano
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # ✅ 5. SSL Redirect
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # ✅ 6. Outros headers de segurança
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_CONTENT_SECURITY_POLICY = {
        'default-src': ("'self'",),
        'script-src': ("'self'", "'unsafe-inline'"),
        'style-src': ("'self'", "'unsafe-inline'"),
        'img-src': ("'self'", "data:", "https:"),
    }
```

---

## 🔧 FASE 2: SENDGRID - CONFIGURAÇÃO

### **Passo 1: Criar Conta SendGrid**

1. Acesse: https://sendgrid.com
2. Crie conta gratuita
3. Verifique seu email
4. Dashboard → Settings → API Keys
5. Crie "API Key" com permissões de envio

### **Passo 2: Configurar .env para SendGrid**

Edite arquivo: `backend/.env`

```bash
# ============================================
# SENDGRID CONFIG
# ============================================
EMAIL_BACKEND=sendgrid_backend.SendgridBackend
SENDGRID_API_KEY=SG.sua_chave_aqui
DEFAULT_FROM_EMAIL=seu_email@dominio.com
EMAIL_HOST_USER=seu_email@dominio.com
```

### **Passo 3: Instalar biblioteca SendGrid**

```bash
cd backend
pip install sendgrid-django
```

Adicione ao `requirements.txt`:
```
sendgrid-django==4.2.0
```

### **Passo 4: Testar**

```bash
cd backend
python manage.py shell
```

```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    'Teste SendGrid',
    'Email de teste do CRM',
    settings.DEFAULT_FROM_EMAIL,
    ['seu_email@gmail.com'],
    fail_silently=False
)
print("✅ Email enviado com SendGrid!")
```

---

## 🐘 FASE 3: POSTGRESQL - CONFIGURAÇÃO

### **Passo 1: Instalar Biblioteca**

```bash
cd backend
pip install psycopg2-binary
```

Adicione ao `requirements.txt`:
```
psycopg2-binary==2.9.9
```

### **Passo 2: Configurar .env**

```bash
# ============================================
# POSTGRESQL CONFIG
# ============================================
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=crm_db
DATABASE_USER=crm_user
DATABASE_PASSWORD=sua_senha_super_segura
DATABASE_HOST=postgres
DATABASE_PORT=5432
```

### **Passo 3: Atualizar settings.py**

No `settings.py`, substitua a configuração DATABASE:

```python
DATABASES = {
    'default': {
        'ENGINE': os.getenv('DATABASE_ENGINE', 'django.db.backends.sqlite3'),
        'NAME': os.getenv('DATABASE_NAME', os.path.join(BASE_DIR, 'db.sqlite3')),
        'USER': os.getenv('DATABASE_USER', ''),
        'PASSWORD': os.getenv('DATABASE_PASSWORD', ''),
        'HOST': os.getenv('DATABASE_HOST', ''),
        'PORT': os.getenv('DATABASE_PORT', ''),
        'CONN_MAX_AGE': 600 if os.getenv('ENVIRONMENT') == 'production' else 0,
    }
}
```

### **Passo 4: Preparar Migração**

```bash
# Dentro de backend

# 1. Criar dump do SQLite
python manage.py dumpdata > data_dump.json

# 2. Deletar db.sqlite3
rm db.sqlite3

# 3. Com PostgreSQL rodando:
python manage.py migrate
python manage.py loaddata data_dump.json
```

---

## 🐳 FASE 4: DOCKER - SETUP

### **Passo 1: Criar Dockerfile (Backend)**

Arquivo: `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Dependências do sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Collectstatic para produção
RUN python manage.py collectstatic --no-input || true

# Gunicorn
CMD ["gunicorn", "crm_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

### **Passo 2: Criar Dockerfile (Frontend)**

Arquivo: `frontend/Dockerfile`

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

### **Passo 3: Docker Compose

Arquivo: `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  # ============ POSTGRESQL ============
  postgres:
    image: postgres:15-alpine
    container_name: crm_postgres
    environment:
      POSTGRES_DB: crm_db
      POSTGRES_USER: crm_user
      POSTGRES_PASSWORD: sua_senha_super_segura
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U crm_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============ REDIS ============
  redis:
    image: redis:7-alpine
    container_name: crm_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============ DJANGO ============
  backend:
    build: ./backend
    container_name: crm_backend
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --no-input &&
             gunicorn crm_backend.wsgi:application --bind 0.0.0.0:8000 --workers 4"
    environment:
      ENVIRONMENT: production
      DEBUG: "False"
      DATABASE_ENGINE: django.db.backends.postgresql
      DATABASE_NAME: crm_db
      DATABASE_USER: crm_user
      DATABASE_PASSWORD: sua_senha_super_segura
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      REDIS_URL: redis://redis:6379/0
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
      SECRET_KEY: ${SECRET_KEY}
      ALLOWED_HOSTS: localhost,127.0.0.1
      CORS_ALLOWED_ORIGINS: http://localhost:3000
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ============ REACT ============
  frontend:
    build: ./frontend
    container_name: crm_frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000
    depends_on:
      - backend
    volumes:
      - ./frontend:/app

volumes:
  postgres_data:
  redis_data:
```

### **Passo 4: Testar Docker Localmente**

```bash
# Do diretório raiz do projeto
docker-compose -f docker-compose.prod.yml up -d

# Verificar se tudo rodou
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## ⚡ FASE 5: OTIMIZAÇÕES DE PERFORMANCE

### **5.1 Django Otimizações**

Adicione ao `settings.py`:

```python
# Cache Configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/0'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {'max_connections': 50}
        }
    }
}

# Session usando Redis
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Compressão de resposta
MIDDLEWARE += ['django.middleware.gzip.GZipMiddleware']

# Database connection pooling
DATABASES['default']['CONN_MAX_AGE'] = 600
DATABASES['default']['OPTIONS'] = {
    'connect_timeout': 10,
}

# API throttling
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

### **5.2 Frontend Otimizações**

Edite `frontend/package.json`:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}
```

Execute análise:

```bash
cd frontend
npm run build
npm run analyze
```

---

## 📊 FASE 6: CHECKLISTA DE LANÇAMENTO

```
SEGURANÇA:
  [ ] DEBUG = False em produção
  [ ] SECRET_KEY gerado forte (50+ caracteres)
  [ ] CSRF Protection ativado
  [ ] HSTS configurado
  [ ] SSL Redirect ativado
  [ ] Headers de segurança configurados
  
EMAIL:
  [ ] SendGrid API key válida
  [ ] Domínio verificado no SendGrid
  [ ] Template de email configurado
  [ ] Testes de envio funcionando
  
BANCO DE DADOS:
  [ ] PostgreSQL rodando
  [ ] Migrations aplicadas
  [ ] Dados migrados do SQLite
  [ ] Backups configurados
  
DOCKER:
  [ ] Dockerfile backend criado
  [ ] Dockerfile frontend criado
  [ ] docker-compose.prod.yml funcional
  [ ] Imagens buildadas e testadas
  [ ] Volumes persistentes funcionando
  
PERFORMANCE:
  [ ] Cache Redis configurado
  [ ] Compressão GZIP ativado
  [ ] Static files otimizados
  [ ] Database connection pooling
  [ ] Frontend minificado e otimizado
  [ ] Análise de bundle size feita
  
TESTES:
  [ ] 159 unit tests passando
  [ ] Testes E2E rodados
  [ ] Testes de carga executados
  [ ] Verificação de segurança completa
```

---

## 🎯 PRÓXIMOS PASSOS

### **Hoje (O que fazer agora):**

1. ✅ Adicionar configurações de segurança ao `settings.py`
2. ✅ Instalar SendGrid e PostgreSQL localmente
3. ✅ Testar mudança de banco de dados
4. ✅ Criar Dockerfiles

### **Depois (Quando souber onde hospedar):**

5. Criar CI/CD pipeline (GitHub Actions)
6. Deploy automático
7. Configurar domain/SSL
8. Monitoramento em produção

---

**Vou ajudá-lo com cada fase! Quer que eu comece agora?** 🚀
