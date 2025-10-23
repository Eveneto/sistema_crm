# 📚 REFERÊNCIA TÉCNICA RÁPIDA

> Cole os comandos exatamente como estão. Não modifique nada.

---

## 🚀 COMMANDS CHEAT SHEET

### **TESTE LOCAL**

```bash
# Verificar tudo
./pre_deployment_check.sh

# Testar stack
./test_production_locally.sh

# Ver status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

### **DEPLOYMENT**

```bash
# Build
docker-compose -f docker-compose.prod.yml build

# Start
docker-compose -f docker-compose.prod.yml up -d

# Stop
docker-compose -f docker-compose.prod.yml down

# Restart
docker-compose -f docker-compose.prod.yml restart backend
```

---

### **DATABASE**

```bash
# Criar superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py makemigrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Shell Django
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell

# Backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U crm_user -d crm_db > backup.sql

# Restore
docker-compose -f docker-compose.prod.yml exec postgres psql -U crm_user -d crm_db < backup.sql
```

---

### **TESTING**

```bash
# Testes unitários
docker-compose -f docker-compose.prod.yml exec backend python manage.py test

# Coverage
docker-compose -f docker-compose.prod.yml exec backend coverage run --source='.' manage.py test
docker-compose -f docker-compose.prod.yml exec backend coverage report
```

---

### **LOGS & DEBUG**

```bash
# Todos os logs
docker-compose -f docker-compose.prod.yml logs -f

# Últimas 50 linhas
docker-compose -f docker-compose.prod.yml logs backend --tail=50

# Apenas erros
docker-compose -f docker-compose.prod.yml logs backend | grep -i error

# Salvar em arquivo
docker-compose -f docker-compose.prod.yml logs > app.log
```

---

### **RECURSOS**

```bash
# Ver uso CPU/Memory
docker stats

# Tamanho do banco
docker-compose -f docker-compose.prod.yml exec postgres psql -U crm_user -d crm_db -c "SELECT pg_size_pretty(pg_database_size('crm_db'));"

# Espaço em disco
df -h

# Processos
ps aux | grep docker
```

---

### **NETWORK**

```bash
# Verificar conectividade
curl -v http://localhost:8000/api/

# Com timeout
curl -m 5 http://localhost:8000/api/

# Salvar response em arquivo
curl http://localhost:8000/api/ > response.json
```

---

### **EMAIL TEST**

```bash
# Dentro do shell Django
python manage.py shell

# No shell:
from django.core.mail import send_mail
send_mail('Test', 'Message', 'from@example.com', ['to@example.com'])
```

---

### **FILE OPERATIONS**

```bash
# Copiar arquivo para container
docker cp seu-arquivo backend:/app/

# Copiar arquivo de container
docker cp backend:/app/seu-arquivo .

# Executar comando em container
docker exec backend ls -la /app/
```

---

### **CLEANING**

```bash
# Remover containers parados
docker-compose -f docker-compose.prod.yml down

# Remover volumes (CUIDADO - perde dados!)
docker-compose -f docker-compose.prod.yml down -v

# Remover imagens
docker rmi crm-backend crm-frontend

# Limpeza completa
docker system prune -a
```

---

## 🔧 VARIÁVEIS DE AMBIENTE

### **Backend (.env)**

```bash
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=django-insecure-xxxxx
ALLOWED_HOSTS=seu-dominio.com
DATABASE_NAME=crm_db
DATABASE_USER=crm_user
DATABASE_PASSWORD=xxxxx
DATABASE_HOST=postgres
REDIS_PASSWORD=xxxxx
SENDGRID_API_KEY=SG.xxxxx
DEFAULT_FROM_EMAIL=noreply@seu-dominio.com
CORS_ALLOWED_ORIGINS=https://seu-dominio.com
```

---

## 🐳 DOCKER COMPOSE QUICK REF

```yaml
# Services
postgres:      Database (port 5432)
redis:         Cache (port 6379)
backend:       Django API (port 8000)
frontend:      React + Nginx (port 80/443)

# Health
Em execução:   docker-compose ps
Status:        docker-compose logs

# Scaling (backend)
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

---

## 📊 API ENDPOINTS

```bash
# Frontend (React)
http://localhost/

# Backend API
http://localhost:8000/api/

# Django Admin
http://localhost:8000/admin/

# Health Check
curl http://localhost:8000/api/

# Status
curl http://localhost/health
```

---

## 🔐 SECURITY QUICK CHECK

```bash
# Ver HTTPS headers
curl -I https://seu-dominio.com

# Verificar certificado SSL
openssl s_client -connect seu-dominio.com:443

# Test segurança
curl -w "\nSSL: %{ssl_verify_result}\n" https://seu-dominio.com
```

---

## 📈 PERFORMANCE TEST

```bash
# Apache Bench (100 requisições)
ab -n 100 http://localhost:8000/api/

# Siege (concurrent users)
siege -c 10 -n 100 http://localhost:8000/api/

# Locust (advanced)
pip install locust
locust -f locustfile.py --headless -u 100 -r 10 -t 60s
```

---

## 🔍 TROUBLESHOOTING QUICK

| Problema | Solução |
|----------|---------|
| Porta em uso | `lsof -i :8000` e `kill -9 <PID>` |
| Container não inicia | `docker-compose logs backend` |
| Banco desconectado | `docker-compose restart postgres` |
| Memória alta | `docker stats` e `restart` |
| SSL não funciona | Verificar `/etc/letsencrypt/live/` |
| Email não envia | Verificar `SENDGRID_API_KEY` |

---

## 📂 ARQUIVO LOCATIONS

```
/home/ubuntu/crm-system/
├── backend/
│   ├── crm_backend/
│   │   ├── settings.py           (Django config)
│   │   ├── production_settings.py (Production config)
│   │   └── urls.py
│   ├── .env                      (Environment vars)
│   ├── Dockerfile                (Backend container)
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile                (Frontend container)
│   └── package.json
├── docker-compose.prod.yml       (Orchestration)
└── nginx_production.conf          (Reverse proxy)
```

---

## 🔄 GIT WORKFLOW

```bash
# Ver status
git status

# Add changes
git add .

# Commit
git commit -m "message"

# Push
git push origin main

# Pull
git pull origin main

# Ver histórico
git log --oneline | head -20

# Rollback
git revert <commit-hash>
```

---

## 🆘 HELP COMMANDS

```bash
# Ver versões
docker --version
docker-compose --version
python --version

# Ver ajuda
docker-compose --help
docker-compose logs --help

# Listar tudo
docker ps -a
docker images
docker networks ls
docker volume ls
```

---

## 🚨 EMERGENCY COMMANDS

```bash
# Parar TUDO
docker-compose -f docker-compose.prod.yml down

# Forçar parar
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Limpar TUDO (CUIDADO!)
docker system prune -a --volumes

# Ver que espaço/recursos estão sendo usados
docker system df

# Logs de erro apenas
docker-compose logs 2>&1 | grep -i "error\|fatal\|critical"
```

---

## 📝 NOTAS IMPORTANTES

✅ **Sempre fazer backup antes de:**
- Alterar .env
- Deletar volumes
- Fazer factory reset

✅ **Checklist antes de deployment:**
- [ ] .env configurado
- [ ] Certificado SSL válido
- [ ] Backup do banco anterior
- [ ] pre_deployment_check.sh passou
- [ ] test_production_locally.sh passou

✅ **Manter seguro:**
- Nunca compartilhar .env
- Usar senhas fortes (20+ chars)
- Atualizar Docker regularmente
- Fazer backups regulares

---

## 🎯 COMMANDS MAIS USADOS

```bash
# No dia a dia:
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell

# Problemas:
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
docker system prune -a
```

---

## 📞 QUICK LINKS

- [Django Docs](https://docs.djangoproject.com)
- [Docker Docs](https://docs.docker.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Stack Overflow](https://stackoverflow.com)

---

**Bookmark esta página! 🔖**

*Atualizado: 23/10/2025*
