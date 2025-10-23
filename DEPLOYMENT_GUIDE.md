# 🚀 GUIA COMPLETO DE DEPLOYMENT - CRM SYSTEM

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Local com Docker](#configuração-local-com-docker)
3. [Deployment em Produção](#deployment-em-produção)
4. [Configurações por Plataforma](#configurações-por-plataforma)
5. [Monitoramento & Troubleshooting](#monitoramento--troubleshooting)

---

## 🔧 Pré-requisitos

### **Software Necessário**

```bash
# Docker
docker --version  # >= 20.10

# Docker Compose
docker-compose --version  # >= 1.29

# Python (para scripts locais)
python --version  # >= 3.12

# Node.js (para verificação frontend)
node --version  # >= 18
```

### **Dados Necessários**

Você precisa ter:
- [ ] SendGrid API Key
- [ ] Domain/subdomain registrado
- [ ] PostgreSQL database (será criado no Docker)
- [ ] Firebase credentials.json (se usar Firebase)
- [ ] SSL certificate (para HTTPS em produção)

---

## 🐳 Configuração Local com Docker

### **Passo 1: Preparar variáveis de ambiente**

```bash
# Copiar template de produção
cp backend/.env.production backend/.env.prod

# Gerar SECRET_KEY forte
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Copiar o valor gerado e editar backend/.env.prod
# Substituir os valores de exemplo pelos reais
```

**Arquivo `backend/.env.prod` (exemplo completo):**

```bash
# ============================================
# APPLICATION
# ============================================
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=django-insecure-XyZ123...  # Gerar novo com comando acima
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:3000

# ============================================
# DATABASE
# ============================================
DATABASE_NAME=crm_db
DATABASE_USER=crm_user
DATABASE_PASSWORD=SenhaSegura123!@#
DATABASE_HOST=postgres
DATABASE_PORT=5432

# ============================================
# CACHE
# ============================================
REDIS_PASSWORD=Redis123!@#

# ============================================
# EMAIL
# ============================================
SENDGRID_API_KEY=SG.sua_api_key_aqui
DEFAULT_FROM_EMAIL=noreply@seu-dominio.com
EMAIL_HOST_USER=seu-email@seu-dominio.com

# ============================================
# CORS
# ============================================
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost

# ============================================
# FIREBASE
# ============================================
FIREBASE_CREDENTIALS_PATH=/app/firebase-credentials.json
```

### **Passo 2: Carregar variáveis no Docker**

```bash
# Sair da .env padrão e usar .env.prod
export $(cat backend/.env.prod | xargs)

# Ou copiar para .env permanentemente
cp backend/.env.prod backend/.env
```

### **Passo 3: Build das imagens**

```bash
# Build local
docker-compose -f docker-compose.prod.yml build

# Com output de build
docker-compose -f docker-compose.prod.yml build --no-cache
```

### **Passo 4: Iniciar serviços**

```bash
# Iniciar em background
docker-compose -f docker-compose.prod.yml up -d

# Ver logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver apenas erros
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### **Passo 5: Verificar saúde**

```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Backend health check
curl http://localhost:8000/api/health/

# Frontend
curl http://localhost:3000

# Verificar banco de dados
docker exec crm_postgres_prod psql -U crm_user -d crm_db -c "\dt"
```

---

## 🌐 Deployment em Produção

### **Opção 1: AWS ECS (Recomendado)**

**1. Criar repositório ECR:**

```bash
# Criar repo para backend
aws ecr create-repository \
  --repository-name crm-backend \
  --region us-east-1

# Criar repo para frontend
aws ecr create-repository \
  --repository-name crm-frontend \
  --region us-east-1

# Fazer login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
```

**2. Build e Push das imagens:**

```bash
# Backend
docker build -t crm-backend:latest ./backend
docker tag crm-backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/crm-backend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/crm-backend:latest

# Frontend
docker build -t crm-frontend:latest ./frontend
docker tag crm-frontend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/crm-frontend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/crm-frontend:latest
```

**3. Criar RDS Database (PostgreSQL):**

```bash
# Via AWS Console ou CLI
# - Postgresql 15
# - db.t3.micro (free tier)
# - Backup: 7 dias
# - Multi-AZ: Sim
```

**4. Criar ElastiCache (Redis):**

```bash
# Via AWS Console
# - Redis 7.x
# - cache.t3.micro
# - 1 nó (scale depois se necessário)
```

**5. Criar Task Definition no ECS:**

```json
{
  "family": "crm-system",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "crm-backend",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/crm-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "hostPort": 8000
        }
      ],
      "environment": [
        {
          "name": "ENVIRONMENT",
          "value": "production"
        }
      ]
    }
  ]
}
```

### **Opção 2: Heroku**

```bash
# 1. Criar app
heroku create seu-app-crm

# 2. Adicionar buildpacks
heroku buildpacks:add heroku/python -a seu-app-crm
heroku buildpacks:add heroku/nodejs -a seu-app-crm

# 3. Configurar variáveis
heroku config:set ENVIRONMENT=production -a seu-app-crm
heroku config:set SECRET_KEY=xxxxx -a seu-app-crm
heroku config:set DATABASE_URL=postgres://... -a seu-app-crm

# 4. Deploy
git push heroku main

# 5. Ver logs
heroku logs --tail -a seu-app-crm
```

### **Opção 3: VPS com Docker**

```bash
# No servidor VPS

# 1. Instalar Docker e Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Clone do repositório
git clone seu-repo.git crm-system
cd crm-system

# 3. Configurar .env
cp backend/.env.production backend/.env
nano backend/.env  # Editar com valores reais

# 4. Start
docker-compose -f docker-compose.prod.yml up -d

# 5. Nginx reverso proxy (opcional)
sudo apt-get install nginx
# Configurar nginx.conf (ver abaixo)
sudo systemctl start nginx
```

---

## ⚙️ Configurações por Plataforma

### **Nginx Reverse Proxy (Production)**

Arquivo: `nginx.prod.conf`

```nginx
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:80;
}

server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    client_max_body_size 10M;

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;

        # WebSocket
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }
}

# HTTPS redirect (após certificado SSL)
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # ... resto da configuração igual acima
}

# Redirect HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 Monitoramento & Troubleshooting

### **Verificar Status**

```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Logs de erro
docker-compose -f docker-compose.prod.yml logs --tail=50 backend

# Recursos utilizados
docker stats

# Inspecionar container
docker inspect crm_backend_prod
```

### **Comandos Úteis**

```bash
# Executar comando no container backend
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Acessar shell Django
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell

# Ver migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py showmigrations

# Resetar banco (CUIDADO!)
docker-compose -f docker-compose.prod.yml exec backend python manage.py flush
```

### **Problemas Comuns**

**Problema: Database connection refused**
```bash
# Solução: Verificar se PostgreSQL está saudável
docker-compose -f docker-compose.prod.yml ps postgres
docker-compose -f docker-compose.prod.yml logs postgres

# Reiniciar
docker-compose -f docker-compose.prod.yml down postgres
docker-compose -f docker-compose.prod.yml up -d postgres
```

**Problema: Static files 404**
```bash
# Solução: Rebuild frontend
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

**Problema: Email não sendo enviado**
```bash
# Verificar: SendGrid API Key válida
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell

# Testar envio
>>> from django.core.mail import send_mail
>>> send_mail('Teste', 'Mensagem', 'noreply@seu-dominio.com', ['seu@email.com'])
```

**Problema: Memory leak**
```bash
# Ver uso de memória
docker stats crm_backend_prod

# Reiniciar
docker-compose -f docker-compose.prod.yml restart backend
```

---

## ✅ Checklist Pré-Launch

```
INFRAESTRUTURA:
  [ ] Database PostgreSQL configurado e testado
  [ ] Redis cache rodando
  [ ] Domínio apontando para servidor
  [ ] SSL certificate configurado
  
CÓDIGO:
  [ ] DEBUG = False em produção
  [ ] SECRET_KEY gerado e seguro
  [ ] ALLOWED_HOSTS configurado
  [ ] CORS restrito para domínio real
  
EMAIL:
  [ ] SendGrid configurado e testado
  [ ] Domínio verificado no SendGrid
  [ ] Template de email funcionando
  
DOCKER:
  [ ] Imagens buildadas sem erros
  [ ] Containers iniciando corretamente
  [ ] Health checks retornando OK
  [ ] Volumes persistentes funcionando
  
TESTES:
  [ ] 159 unit tests passando
  [ ] Testes de carga executados
  [ ] Acesso via browser testado
  [ ] Email de verificação funcionando
  
MONITORAMENTO:
  [ ] Logs configurados
  [ ] Alertas definidos
  [ ] Backups automáticos
  [ ] Plano de disaster recovery
```

---

## 🎯 Próximas Ações

1. Gerar novo SECRET_KEY seguro
2. Preparar arquivo `.env.prod` com dados reais
3. Testar build local com Docker Compose
4. Escolher plataforma de deployment (AWS/Heroku/VPS)
5. Deploy para staging first
6. Validar em staging
7. Deploy para produção

**Aguarde! Vou ajudá-lo em cada passo.** 🚀
