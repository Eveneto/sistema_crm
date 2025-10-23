# ❓ FAQ - Perguntas Frequentes sobre Produção

---

## 📌 Perguntas Gerais

### **P1: Meu cliente quer colocar em produção hoje. O que faço?**

**R:** Siga esta ordem:

1. Execute `./pre_deployment_check.sh` (5 minutos)
2. Execute `./test_production_locally.sh` (5 minutos)
3. Se ambos passarem, você está pronto
4. Escolha a plataforma (VPS/AWS/Heroku) e siga `PRODUCTION_README.md`
5. Deploy deve levar 30-60 minutos

**Tempo total:** ~2-3 horas para um programador experiente

---

### **P2: Qual é a melhor opção: VPS, AWS ou Heroku?**

**R:** Depende:

| Critério | VPS | AWS ECS | Heroku |
|----------|-----|---------|--------|
| **Custo** | $5-10/mês | $50-100/mês | $25-50/mês |
| **Facilidade** | Média | Difícil | Fácil |
| **Escalabilidade** | Manual | Automática | Automática |
| **Controle** | Total | Total | Limitado |
| **Melhor para** | MVP/Startup | Enterprise | Prototipagem |

**Recomendação:** VPS (DigitalOcean, Linode) para começar, depois AWS quando escalar.

---

### **P3: Quanto de RAM/CPU preciso?**

**R:** Mínimo:
- **RAM:** 2GB (prototipagem)
- **CPU:** 2 cores (startup)
- **Storage:** 20GB SSD

**Recomendado para 100+ usuários:**
- **RAM:** 4GB
- **CPU:** 4 cores
- **Storage:** 50GB SSD

---

### **P4: Quanto custa de infrastructure?**

**R:** Por mês:
- **VPS básico:** $5-10 (DigitalOcean)
- **Domain:** $10-15 (GoDaddy, Namecheap)
- **SendGrid:** $20-100 (baseado em volume)
- **Backup storage:** $5-10 (S3)
- **CDN (opcional):** $20+ (CloudFlare)

**Total:** $50-135/mês para começar

---

## 🔧 Configuração & Variáveis

### **P5: Onde coloco o SendGrid API Key?**

**R:** Em dois lugares:

1. **Local (testes):**
   ```bash
   # backend/.env
   SENDGRID_API_KEY=SG.seu_api_key_aqui
   ```

2. **Produção (servidor):**
   ```bash
   # No servidor, editar:
   nano backend/.env
   # Adicionar a mesma chave
   ```

**Gerar API Key:**
1. Ir em sendgrid.com → Settings → API Keys
2. Clicar "Create API Key"
3. Dar nome e selecionar "Restricted Access"
4. Permissões: Mail Send, Templates Read
5. Copiar a chave (só aparece uma vez!)

---

### **P6: Como gero um novo SECRET_KEY?**

**R:** Existem 3 formas:

```bash
# Opção 1: Python (Recomendado)
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Opção 2: Python interativo
python
>>> from django.core.management.utils import get_random_secret_key
>>> print(get_random_secret_key())

# Opção 3: Online (NÃO use em produção!)
# https://djecrety.ir/
```

**⚠️ IMPORTANTE:** Gerar um NOVO para produção, nunca usar o do desenvolvimento!

---

### **P7: Qual é a senha padrão do banco?**

**R:** Não existe! Você define quando cria o `.env`:

```bash
DATABASE_PASSWORD=SenhaSegura@123#!Muito$Forte
```

**Boas práticas:**
- Mínimo 20 caracteres
- Incluir: números, letras maiúsculas, minúsculas, símbolos
- Não usar: seu nome, datas, dados óbvios
- Gerar com gerenciador de senhas: LastPass, 1Password, Bitwarden

---

### **P8: Preciso mudar a porta do backend (8000)?**

**R:** Não! No Docker Compose:
- Backend roda na porta 8000 **dentro do container**
- Nginx redireciona 80/443 (externo) → 8000 (interno)
- Cliente vê só: `https://seu-dominio.com` (portas padrão)

**Se quiser mudar:**
```yaml
# docker-compose.prod.yml
services:
  backend:
    ports:
      - "9000:8000"  # Mudar primeira porta
```

---

## 🚀 Deployment

### **P9: Posso fazer deploy sem downtime?**

**R:** Sim! 3 estratégias:

**Opção 1: Blue-Green Deployment**
1. Manter atual em produção (Blue)
2. Deploy novo em paralelo (Green)
3. Switch DNS/Load Balancer
4. Remover Blue se tudo OK

**Opção 2: Rolling Deployment**
1. Parar 1 container do backend
2. Deploy novo em seu lugar
3. Repetir para outros
4. Nginx mantém tráfego entre os antigos

**Opção 3: Maintenance Mode**
1. Ativar "Maintenance Mode" (página estática)
2. Fazer deploy
3. Desativar Maintenance Mode
3. Downtime: 5-10 minutos

**Recomendação para começar:** Opção 3 (simples e rápido)

---

### **P10: Como faço rollback se der problema?**

**R:** 3 opções:

**Opção 1: Git Rollback (Rápido)**
```bash
git revert <commit-que-deu-problema>
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

**Opção 2: Docker Image Anterior**
```bash
# Listar imagens anteriores
docker images | grep crm-backend

# Usar image anterior
docker tag crm-backend:<tag-anterior> crm-backend:latest
docker-compose -f docker-compose.prod.yml up -d
```

**Opção 3: Database Backup**
```bash
# Restore do backup anterior
docker exec crm_postgres_prod pg_restore -U crm_user -d crm_db < backup.sql
```

**Melhor prática:** Manter últimas 5 images e backups de 30 dias

---

### **P11: Quanto tempo leva um deployment?**

**R:** Depende:

| Etapa | Tempo |
|-------|-------|
| Git clone + setup | 2-5 min |
| Docker build | 5-10 min |
| Database migration | 1-5 min |
| Teste de health | 2-3 min |
| **TOTAL** | **10-23 min** |

**Pico de downtime:** 30 segundos (restart dos containers)

---

## 🔒 Segurança

### **P12: Como configuro HTTPS/SSL?**

**R:** 2 opções:

**Opção 1: Let's Encrypt (Gratuito, Recomendado)**
```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d seu-dominio.com -d www.seu-dominio.com

# Certificado salvo em:
# /etc/letsencrypt/live/seu-dominio.com/

# Auto-renovação:
sudo systemctl enable certbot.timer
```

**Opção 2: Seu próprio certificado**
```bash
# Copiar para servidor
scp seu-certificado.pem root@seu-servidor:/etc/ssl/certs/

# Configurar em nginx.conf
ssl_certificate /etc/ssl/certs/seu-certificado.pem;
ssl_certificate_key /etc/ssl/private/sua-chave.pem;
```

---

### **P13: Meu site está sem HTTPS. Como ativar?**

**R:** Verificar arquivo:

```bash
# Ver configuração atual
cat /etc/nginx/sites-enabled/crm

# Deve ter:
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/...
    ssl_certificate_key /etc/letsencrypt/live/...
}

# Se não tem, editar:
sudo nano /etc/nginx/sites-enabled/crm
# Adicionar blocos SSL

# Testar:
sudo nginx -t

# Reiniciar:
sudo systemctl restart nginx
```

---

### **P14: Como mudo a senha do banco em produção?**

**R:** ⚠️ CUIDADO! Só fazer se necessário:

```bash
# 1. Atualizar .env
nano backend/.env
# Mudar DATABASE_PASSWORD

# 2. Parar containers
docker-compose -f docker-compose.prod.yml down

# 3. Resetar database (PERDA DE DADOS!)
docker volume rm sistema_crm_postgres_data_prod

# 4. Iniciar novamente
docker-compose -f docker-compose.prod.yml up -d

# 5. Migrações rodão automaticamente
```

**MELHOR:** Criar novo usuário em vez de alterar:

```sql
-- Dentro do container postgres
CREATE USER crm_user_new WITH PASSWORD 'nova-senha';
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user_new;
ALTER DATABASE crm_db OWNER TO crm_user_new;
```

---

### **P15: Alguém está tentando atacar meu site. O que faço?**

**R:** Passos imediatos:

1. **Ativar rate limiting:**
   ```python
   # settings.py já tem isso em production_settings.py
   REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
       'anon': '100/hour',
       'user': '1000/hour'
   }
   ```

2. **Bloquear IP em Nginx:**
   ```nginx
   location / {
       deny 192.168.1.100;
       allow all;
   }
   ```

3. **Usar Cloudflare (DDoS Protection):**
   - Mudar DNS para Cloudflare
   - Ativa DDoS protection automático

4. **Ver logs de ataque:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs backend | grep "401\|403\|429"
   ```

---

## 🐳 Docker

### **P16: Como vejo os logs do backend em produção?**

**R:** Existem 3 formas:

```bash
# Opção 1: Tempo real (mais útil)
docker-compose -f docker-compose.prod.yml logs -f backend

# Opção 2: Últimas N linhas
docker-compose -f docker-compose.prod.yml logs backend --tail=50

# Opção 3: Arquivo (persistente)
docker-compose -f docker-compose.prod.yml logs backend > /var/log/crm-backend.log

# Opção 4: Ver erros apenas
docker-compose -f docker-compose.prod.yml logs backend | grep -i "error"
```

---

### **P17: Meu container está usando muita memória. O que faço?**

**R:** Diagnosticar e limpar:

```bash
# Ver uso
docker stats

# Se backend está consumindo muito:
docker-compose -f docker-compose.prod.yml restart backend

# Se persistir, pode ser:
# 1. N+1 queries no banco
#    → Otimizar com select_related/prefetch_related
#
# 2. Cache não está funcionando
#    → Verificar Redis: docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
#
# 3. Memory leak em código Python
#    → Profiler: python manage.py shell_plus
#    → from django.core.management import call_command
#    → call_command('profiler')

# Limpar tudo (NUCLEAR - perde tudo!)
docker system prune -a
```

---

### **P18: Um container não está iniciando. Como debugar?**

**R:** Passo-a-passo:

```bash
# 1. Ver status
docker-compose -f docker-compose.prod.yml ps

# 2. Ver logs de erro
docker-compose -f docker-compose.prod.yml logs backend

# 3. Tentar iniciar manualmente (vê mais detalhes)
docker-compose -f docker-compose.prod.yml up backend

# 4. Se der erro, verificar:
# - .env está correto?
# - Porta não está em uso? (sudo lsof -i :8000)
# - Imagem foi buildada? (docker images | grep crm)
# - Disco cheio? (df -h)

# 5. Rebuild container
docker-compose -f docker-compose.prod.yml build --no-cache backend
docker-compose -f docker-compose.prod.yml up -d backend
```

---

## 🗄️ Database

### **P19: Preciso fazer backup do banco. Como?**

**R:** Existem 3 formas:

```bash
# Opção 1: Backup manual (SQL completo)
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U crm_user -d crm_db > backup_$(date +%Y%m%d).sql

# Opção 2: Backup automático com cron
0 2 * * * docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U crm_user -d crm_db > /backups/crm_$(date +\%Y\%m\%d).sql

# Opção 3: Backup em cloud (S3)
aws s3 cp backup_20251023.sql s3://meu-bucket/backups/

# Restore de backup
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U crm_user -d crm_db < backup_20251023.sql
```

**Configurar cron (backup diário às 2AM):**
```bash
crontab -e

# Adicionar:
0 2 * * * cd /home/ubuntu/crm-system && docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U crm_user -d crm_db > /backups/crm_$(date +\%Y\%m\%d).sql
```

---

### **P20: Como verifico o tamanho do banco?**

**R:** Simples:

```bash
# Tamanho do banco
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U crm_user -d crm_db -c "SELECT pg_size_pretty(pg_database_size('crm_db'));"

# Tamanho de cada tabela
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U crm_user -d crm_db -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

**Exemplo de saída:**
```
schemaname | tablename | size
-----------+-----------+-------
public     | companies | 45 MB
public     | contacts  | 23 MB
public     | activities| 12 MB
```

---

## 📧 Email

### **P21: Email não está sendo enviado. Por onde começo?**

**R:** Checklist de debugging:

```bash
# 1. Verificar SENDGRID_API_KEY
grep SENDGRID_API_KEY backend/.env

# Se vazio, preencher!

# 2. Testar no shell Django
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell

# Dentro do shell:
from django.core.mail import send_mail
send_mail(
    'Teste',
    'Mensagem de teste',
    'noreply@seu-dominio.com',
    ['seu@email.com'],
    fail_silently=False,  # Mostrar erro se houver
)

# 3. Ver logs
docker-compose -f docker-compose.prod.yml logs backend | grep -i "mail\|email"

# 4. Verificar no SendGrid dashboard
# SendGrid → Activity → Ver se email foi enviado

# 5. Checklist final:
# [ ] SENDGRID_API_KEY configurado
# [ ] DEFAULT_FROM_EMAIL configurado
# [ ] Domínio verificado no SendGrid
# [ ] Template de email criado
# [ ] Permissões do usuário corretas
```

---

### **P22: Como testo se o email está chegando?**

**R:** Use um email de teste:

```python
# No shell Django:
from django.core.mail import send_mail

send_mail(
    'Teste CRM - Seu Nome',
    'Se receber este email, tudo está ok!',
    'noreply@seu-dominio.com',  # Seu domínio
    ['teste@gmail.com'],  # Seu email pessoal
)
```

**Verificar:**
1. Esperar 5-10 segundos
2. Checar caixa de entrada
3. Também verificar spam/lixeira
4. Se não chegar em 5 minutos, há problema

**Dica:** Adicione seu email à "Sender List" no SendGrid para melhor entrega

---

## 📈 Performance

### **P23: Meu site está lento. Como otimizar?**

**R:** Passos de otimização (em ordem):

1. **Cache (mais impacto):**
   ```python
   # settings.py já tem Redis cache
   # Verificar se Redis está rodando:
   docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
   ```

2. **Database queries:**
   ```python
   # Usar select_related para ForeignKey
   companies = Company.objects.select_related('owner').all()
   
   # Usar prefetch_related para ManyToMany
   companies = Company.objects.prefetch_related('contacts').all()
   ```

3. **Frontend bundle:**
   ```bash
   npm run build
   # Verificar tamanho: ls -lh build/
   # Deve ser < 1MB
   ```

4. **Compression (Nginx):**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

5. **CDN (Cloudflare):**
   - Ativa automaticamente com DNS
   - Cache global de assets

---

### **P24: Qual é o tempo de resposta aceitável?**

**R:** Métricas:

| Métrica | Aceitável | Bom | Excelente |
|---------|-----------|-----|-----------|
| **Time to First Byte** | < 1s | < 500ms | < 200ms |
| **First Contentful Paint** | < 1.8s | < 1s | < 500ms |
| **Largest Paint** | < 2.5s | < 1.5s | < 1s |
| **API Response** | < 500ms | < 200ms | < 100ms |

**Verificar:**
```bash
# Teste simples
time curl https://seu-dominio.com

# Teste com ferramentas
apache2-utils: ab -n 100 -c 10 https://seu-dominio.com
wrk: wrk -t4 -c100 -d30s https://seu-dominio.com
```

---

## 📞 Suporte

### **P25: Onde encontro ajuda se der problema?**

**R:** Recursos:

| Recurso | Link |
|---------|------|
| **Django Docs** | https://docs.djangoproject.com |
| **Django REST Framework** | https://www.django-rest-framework.org |
| **Docker** | https://docs.docker.com |
| **PostgreSQL** | https://www.postgresql.org/docs |
| **Stack Overflow** | https://stackoverflow.com (tag: django, docker) |
| **Django Forum** | https://forum.djangoproject.com |
| **Reddit** | r/django, r/webdev |

---

## 🎉 Último Conselho

> **"Não é se vai dar problema, é quando. Esteja preparado."** 🚀

**Checklist de paz-de-espírito:**
- ✅ Backups automáticos rodando
- ✅ Monitoring ativado
- ✅ Logs centralizados
- ✅ Plano de disaster recovery
- ✅ Time treinado em escalation
- ✅ Documentação atualizada

---

**Precisa de mais ajuda? Releia este FAQ ou consulte `PRODUCTION_README.md`**

*Último update: Outubro 23, 2025*
