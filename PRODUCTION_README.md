# 🚀 PRODUCTION DEPLOYMENT - CRM SYSTEM

> **⚠️ IMPORTANTE:** Este documento é seu guia completo para colocar o CRM em produção. Siga cada passo com atenção.

---

## 📚 Tabela de Conteúdo

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Arquivos de Configuração](#arquivos-de-configuração)
4. [Teste Local](#teste-local)
5. [Deployment em Produção](#deployment-em-produção)
6. [Monitoramento](#monitoramento)
7. [Troubleshooting](#troubleshooting)

---

## 📖 Visão Geral

### O que foi preparado?

```
┌─────────────────────────────────────────────────────────┐
│              PRODUÇÃO - ARQUITETURA                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐     ┌──────────┐                         │
│  │ Nginx    │     │ React    │                         │
│  │ Proxy    ├────→│ Frontend │  Port 80/443            │
│  └──────────┘     └──────────┘                         │
│       ↓                                                 │
│  ┌──────────┐                                          │
│  │ Gunicorn │                                          │
│  │ Backend  │  Port 8000                               │
│  └────┬─────┘                                          │
│       ├────────────┬──────────────┬──────────────┐     │
│       ↓            ↓              ↓              ↓     │
│  ┌────────┐  ┌─────────┐  ┌──────────┐  ┌──────┐     │
│  │Postgres│  │  Redis  │  │ SendGrid │  │Firebase│    │
│  │  DB    │  │ Cache   │  │  Email   │  │  Auth  │    │
│  └────────┘  └─────────┘  └──────────┘  └──────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Componentes

| Serviço | Versão | Porta | Função |
|---------|--------|-------|--------|
| PostgreSQL | 15 | 5432 | Database |
| Redis | 7 | 6379 | Cache & Sessions |
| Django | 4.2.5 | 8000 | API Backend |
| React | 18+ | 3000 | Frontend |
| Nginx | latest | 80/443 | Reverse Proxy |
| Gunicorn | 4 workers | - | WSGI Server |

---

## 🔧 Pré-requisitos

### 1. **Ambiente de Servidor**

```bash
# Sistema Operacional
Ubuntu 20.04+ ou similar

# Verificar requisitos mínimos
- CPU: 2 cores
- RAM: 2GB (mínimo), 4GB (recomendado)
- Storage: 20GB SSD
- Largura de banda: 100 Mbps

# Instalar Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. **Dados Necessários**

Antes de começar, você precisa ter:

- [ ] **SendGrid API Key**
  - Criar conta em sendgrid.com
  - Ir em Settings > API Keys
  - Gerar nova chave (full access)

- [ ] **Domain/Subdomain**
  - Ex: crm.seu-dominio.com
  - DNS apontando para seu servidor

- [ ] **Certificado SSL**
  - Let's Encrypt (gratuito)
  - Ou seu certificado próprio

- [ ] **Firebase Credentials** (se usar)
  - client_secret_*.json
  - Salvar em `/app/firebase-credentials.json`

### 3. **Clonar Repositório**

```bash
# Clone
git clone <seu-repo> crm-system
cd crm-system

# Checkout para branch de produção
git checkout main  # ou sua branch de produção
```

---

## 📝 Arquivos de Configuração

### 1. **Gerar SECRET_KEY Novo**

```bash
# No seu laptop (NÃO no servidor)
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Copiar o output (será algo como):
# django-insecure-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### 2. **Criar .env.production**

```bash
# No servidor
cp backend/.env.production backend/.env

# Editar com valores reais
nano backend/.env
```

**Conteúdo completo (template):**

```bash
# ============================================
# APPLICATION
# ============================================
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=django-insecure-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
ALLOWED_HOSTS=crm.seu-dominio.com,www.crm.seu-dominio.com
FRONTEND_URL=https://crm.seu-dominio.com

# ============================================
# DATABASE
# ============================================
DATABASE_NAME=crm_db
DATABASE_USER=crm_user
DATABASE_PASSWORD=SenhaSegura@123#!Muito$Forte
DATABASE_HOST=postgres
DATABASE_PORT=5432

# ============================================
# CACHE (Redis)
# ============================================
REDIS_PASSWORD=RedisSeguro@456#!Muito$Forte

# ============================================
# EMAIL (SendGrid)
# ============================================
SENDGRID_API_KEY=SG.abcd1234efgh5678ijkl9012mnop3456
DEFAULT_FROM_EMAIL=noreply@seu-dominio.com
EMAIL_HOST_USER=seu-email@seu-dominio.com

# ============================================
# CORS
# ============================================
CORS_ALLOWED_ORIGINS=https://crm.seu-dominio.com

# ============================================
# SSL
# ============================================
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### 3. **Atualizar docker-compose.prod.yml**

Verifique se as variáveis de ambiente estão corretas:

```yaml
# Exemplo (seu arquivo já tem isso)
services:
  backend:
    environment:
      - ENVIRONMENT=production
      - DEBUG=False
      # ... resto das variáveis
```

---

## 🧪 Teste Local

### **Passo 1: Executar Verificação**

```bash
# No diretório do projeto
./pre_deployment_check.sh

# Isso vai verificar:
# ✓ Todos os arquivos necessários
# ✓ Variáveis de ambiente
# ✓ Configurações de segurança
# ✓ Dependências Docker
# ✓ Configuração Django
```

### **Passo 2: Teste com Docker Compose**

```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# Aguarde 30 segundos para tudo iniciar...

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Deve mostrar algo assim:
# NAME                    STATUS
# crm_postgres_prod       Up (healthy)
# crm_redis_prod          Up (healthy)
# crm_backend_prod        Up (healthy)
# crm_frontend_prod       Up (healthy)
```

### **Passo 3: Executar Testes Automatizados**

```bash
# Script completo de teste
./test_production_locally.sh

# Testa:
# 1. Build das imagens
# 2. Health checks
# 3. Conectividade entre serviços
# 4. API endpoints
# 5. Frontend assets
# 6. Database connection
# 7. Redis connection
```

### **Passo 4: Testes Manuais**

```bash
# Testar Backend API
curl http://localhost:8000/api/

# Testar Frontend
curl http://localhost/

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Criar superuser (para admin)
docker-compose -f docker-compose.prod.yml exec backend \
  python manage.py createsuperuser

# Acessar admin
# http://localhost:8000/admin
```

### **Passo 5: Limpar (se necessário)**

```bash
# Parar todos os serviços
docker-compose -f docker-compose.prod.yml down

# Remover volumes (banco de dados)
docker-compose -f docker-compose.prod.yml down -v

# Remover imagens
docker rmi crm-backend crm-frontend
```

---

## 🚀 Deployment em Produção

### **Opção A: VPS com Docker (Recomendado)**

#### 1. **Preparar o Servidor**

```bash
# SSH no servidor
ssh usuario@seu-servidor.com

# Atualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Nginx
sudo apt-get install -y nginx

# Instalar Certbot (SSL)
sudo apt-get install -y certbot python3-certbot-nginx
```

#### 2. **Configurar SSL com Let's Encrypt**

```bash
# Gerar certificado
sudo certbot certonly --standalone -d crm.seu-dominio.com -d www.crm.seu-dominio.com

# Certificado salvo em:
# /etc/letsencrypt/live/crm.seu-dominio.com/

# Configurar renovação automática
sudo systemctl enable certbot.timer
```

#### 3. **Fazer Deploy**

```bash
# Clone e setup
cd /home/ubuntu
git clone <seu-repo> crm-system
cd crm-system

# Preparar .env
cp backend/.env.production backend/.env
# Editar backend/.env com valores reais

# Build e start
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Ver status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

#### 4. **Configurar Nginx Reverse Proxy**

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/crm

# Colar conteúdo (ver arquivo nginx_production.conf no projeto)

# Habilitar site
sudo ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Acessar
# https://crm.seu-dominio.com
```

### **Opção B: AWS ECS (Enterprise)**

```bash
# 1. Criar repositório ECR
aws ecr create-repository --repository-name crm-backend

# 2. Build e push
docker build -t crm-backend:latest ./backend
docker tag crm-backend:latest <conta>.dkr.ecr.us-east-1.amazonaws.com/crm-backend:latest
docker push <conta>.dkr.ecr.us-east-1.amazonaws.com/crm-backend:latest

# 3. Criar task definition
# (Criar via AWS Console ou terraform)

# 4. Deploy
aws ecs update-service --cluster crm --service backend --force-new-deployment
```

### **Opção C: Heroku (Simples)**

```bash
# Instalar Heroku CLI
curl https://cli.heroku.com/install.sh | sh

# Login
heroku login

# Criar app
heroku create seu-app-crm

# Configurar buildpacks
heroku buildpacks:add heroku/python
heroku buildpacks:add heroku/nodejs

# Config vars
heroku config:set ENVIRONMENT=production
heroku config:set SECRET_KEY=xxxxx
heroku config:set DATABASE_URL=postgres://...

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

---

## 📊 Monitoramento

### **1. Verificar Status**

```bash
# Ver containers rodando
docker-compose -f docker-compose.prod.yml ps

# Ver uso de recursos
docker stats

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Específico do backend
docker-compose -f docker-compose.prod.yml logs backend --tail=100
```

### **2. Configurar Logs**

```bash
# Ver logs em arquivo
docker-compose -f docker-compose.prod.yml logs backend > /var/log/crm-backend.log

# Monitorar em tempo real
docker-compose -f docker-compose.prod.yml logs -f backend
```

### **3. Health Checks**

```bash
# Health check do backend
curl -f http://localhost:8000/api/ || echo "Backend down"

# Health check do frontend
curl -f http://localhost/ || echo "Frontend down"

# Health check do database
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U crm_user -d crm_db -c "SELECT 1;" || echo "DB down"

# Health check do Redis
docker-compose -f docker-compose.prod.yml exec -T redis \
  redis-cli ping || echo "Redis down"
```

### **4. Monitoramento Avançado (Opcional)**

```bash
# Sentry (error tracking)
pip install sentry-sdk
# Adicionar ao settings.py

# Prometheus (métricas)
pip install django-prometheus

# New Relic (APM)
pip install newrelic

# ELK Stack (logs centralizados)
# Usar docker-compose adicional
```

---

## 🔧 Troubleshooting

### **Problema: "Database connection refused"**

```bash
# Solução:
docker-compose -f docker-compose.prod.yml logs postgres
docker-compose -f docker-compose.prod.yml ps postgres

# Se não está saudável, reiniciar
docker-compose -f docker-compose.prod.yml down postgres
docker-compose -f docker-compose.prod.yml up -d postgres

# Aguardar 10 segundos e testar
sleep 10
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U crm_user -d crm_db -c "SELECT 1;"
```

### **Problema: "Static files 404"**

```bash
# Solução:
docker-compose -f docker-compose.prod.yml exec backend \
  python manage.py collectstatic --noinput

# Ou rebuild frontend
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

### **Problema: "Email not sending"**

```bash
# Verificar SendGrid key
echo $SENDGRID_API_KEY

# Testar no shell Django
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell

# No shell:
from django.core.mail import send_mail
send_mail(
    'Teste',
    'Mensagem de teste',
    'noreply@seu-dominio.com',
    ['seu@email.com'],
    fail_silently=False,
)
```

### **Problema: "High memory usage"**

```bash
# Ver uso
docker stats

# Reiniciar serviço
docker-compose -f docker-compose.prod.yml restart backend

# Se persistir, verificar logs
docker-compose -f docker-compose.prod.yml logs backend

# Possível causa: N+1 queries no banco
# Solução: Otimizar queries com select_related/prefetch_related
```

### **Problema: "Slow API response"**

```bash
# Verificar performance
curl -w "Total: %{time_total}s\n" http://localhost:8000/api/

# Checar com ferramentas
ab -n 100 -c 10 http://localhost:8000/api/

# Verificar índices do banco
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U crm_user -d crm_db -c "\d+ companies_company"

# Cacheando resultados
# Adicionar cache em settings.py se não tiver
```

---

## ✅ Checklist Final

```
ANTES DO GO LIVE:
  [ ] .env configurado com valores reais
  [ ] SECRET_KEY novo gerado
  [ ] Certificado SSL ativo
  [ ] SendGrid testado
  [ ] Banco de dados migrado
  [ ] Testes passando localmente
  [ ] pre_deployment_check.sh passou
  [ ] test_production_locally.sh passou
  [ ] Backup do banco preparado
  [ ] Time notificado

DEPOIS DO DEPLOY:
  [ ] Acessar https://crm.seu-dominio.com
  [ ] Fazer login com credenciais
  [ ] Testar CRUD de empresas
  [ ] Testar email de registro
  [ ] Verificar logs de erros
  [ ] Monitorar performance (24 horas)
```

---

## 📞 Suporte & Documentação

| Arquivo | Descrição |
|---------|-----------|
| DEPLOYMENT_GUIDE.md | Guia detalhado de deployment |
| PRE_DEPLOYMENT_CHECKLIST.md | Checklist completo |
| LAUNCH_PLAN.md | Plano de lançamento em 6 fases |
| pre_deployment_check.sh | Script de verificação automática |
| test_production_locally.sh | Script de teste local |

---

## 🎉 Pronto para Go Live!

Se você chegou aqui e todos os testes passaram, **parabéns!** 🚀

Seu CRM está pronto para produção. 

**Bom deployment!**

---

*Última atualização: 2025*  
*Versão: 1.0*
