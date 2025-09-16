# 📋 DOCUMENTAÇÃO DE DEPLOY PARA PRODUÇÃO

## 🚀 GUIA COMPLETO DE DEPLOY SEGURO

### ✅ PRÉ-REQUISITOS

1. **Servidor Linux** (Ubuntu 20.04+ recomendado)
2. **Domínio configurado** apontando para o servidor
3. **Certificado SSL** (Let's Encrypt recomendado)
4. **Docker & Docker Compose** instalados
5. **Firewall configurado** (UFW)

---

## 🔧 CONFIGURAÇÃO DO SERVIDOR

### 1. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git nginx certbot python3-certbot-nginx
```

### 2. Configurar Firewall
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
```

### 3. Instalar Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

---

## 📦 PREPARAÇÃO DO DEPLOY

### 1. Clonar Repositório
```bash
git clone https://github.com/Eveneto/sistema_crm.git
cd sistema_crm
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar e editar arquivo de produção
cp backend/.env.production backend/.env
nano backend/.env

# ALTERAR OBRIGATORIAMENTE:
# - SECRET_KEY (gerar nova)
# - ALLOWED_HOSTS (seu domínio)
# - CORS_ALLOWED_ORIGINS (seu domínio)
# - Senhas do banco
# - Credenciais de email
```

### 3. Gerar SECRET_KEY Segura
```python
python -c "
import secrets
import string
alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
secret_key = ''.join(secrets.choice(alphabet) for i in range(50))
print(f'SECRET_KEY={secret_key}')
"
```

---

## 🔐 CONFIGURAÇÃO SSL

### 1. Obter Certificado Let's Encrypt
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 2. Renovação Automática
```bash
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🚢 DEPLOY COM DOCKER

### 1. Executar Script de Deploy
```bash
./deploy_production.sh
```

### 2. Deploy Manual (se necessário)
```bash
# Construir e subir containers
docker-compose -f docker-compose.production.yml up -d --build

# Verificar status
docker-compose -f docker-compose.production.yml ps

# Ver logs
docker-compose -f docker-compose.production.yml logs -f
```

---

## 🔍 VALIDAÇÕES PÓS-DEPLOY

### 1. Testes de Conectividade
```bash
# Testar endpoints
curl -I https://yourdomain.com
curl -I https://yourdomain.com/api/
curl -I https://yourdomain.com/admin/

# Verificar SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### 2. Testes de Segurança
```bash
# Headers de segurança
curl -I https://yourdomain.com | grep -E "(Strict-Transport|X-Content-Type|X-Frame|X-XSS)"

# Rate limiting
for i in {1..15}; do curl -I https://yourdomain.com/api/ & done
```

### 3. Monitoramento
```bash
# Logs do sistema
tail -f backend/logs/django.log
tail -f backend/logs/security.log
tail -f backend/logs/error.log

# Recursos do sistema
htop
df -h
free -h
```

---

## 📊 MONITORAMENTO CONTÍNUO

### 1. Logs Importantes
```bash
# Logs de segurança
tail -f /var/log/nginx/access.log | grep -E "(40[0-9]|50[0-9])"

# Logs do Django
docker-compose -f docker-compose.production.yml logs -f backend

# Logs do banco
docker-compose -f docker-compose.production.yml logs -f db
```

### 2. Backup Automático
```bash
# Verificar backups
ls -la backups/

# Backup manual
docker-compose -f docker-compose.production.yml exec db \
pg_dump -U crm_user crm_production > backup_manual_$(date +%Y%m%d).sql
```

---

## 🔧 MANUTENÇÃO

### 1. Atualizações
```bash
# Atualizar código
git pull origin master

# Rebuild apenas se necessário
docker-compose -f docker-compose.production.yml up -d --build

# Aplicar migrações
docker-compose -f docker-compose.production.yml exec backend python manage.py migrate
```

### 2. Rollback de Emergência
```bash
# Parar containers
docker-compose -f docker-compose.production.yml down

# Restaurar backup
docker-compose -f docker-compose.production.yml exec db \
psql -U crm_user crm_production < backups/backup_YYYYMMDD_HHMMSS.sql

# Subir novamente
docker-compose -f docker-compose.production.yml up -d
```

---

## ⚡ OTIMIZAÇÕES

### 1. Performance
```bash
# Configurar swap se necessário
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Limpeza Periódica
```bash
# Limpeza de containers
docker system prune -f

# Limpeza de logs antigos
find backend/logs/ -name "*.log" -mtime +30 -delete
```

---

## 🚨 TROUBLESHOOTING

### Problemas Comuns

1. **Erro 502 Bad Gateway**
   - Verificar se backend está rodando: `docker ps`
   - Verificar logs: `docker logs container_name`

2. **Erro de SSL**
   - Verificar certificados: `sudo certbot certificates`
   - Renovar se necessário: `sudo certbot renew`

3. **Banco de dados não conecta**
   - Verificar credenciais no .env
   - Verificar se container do PostgreSQL está rodando

4. **Rate limiting muito agressivo**
   - Ajustar nginx_production.conf
   - Reiniciar nginx: `sudo systemctl reload nginx`

---

## ✅ CHECKLIST FINAL

- [ ] Domínio configurado e funcionando
- [ ] SSL ativo e válido
- [ ] Variáveis de ambiente configuradas
- [ ] Firewall configurado
- [ ] Backups automáticos funcionando
- [ ] Monitoramento ativo
- [ ] Logs sendo gerados
- [ ] Performance otimizada
- [ ] Documentação atualizada

---

## 📞 SUPORTE

Em caso de problemas:

1. Verificar logs primeiro
2. Consultar esta documentação
3. Verificar issues no GitHub
4. Criar nova issue com logs detalhados

**🎉 SISTEMA PRONTO PARA PRODUÇÃO! 🎉**
