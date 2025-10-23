# ✅ CHECKLIST FINAL PRÉ-PRODUCTION

## 📋 Verificação de Código

### Backend
- [x] DEBUG = False em production
- [x] SECRET_KEY configurado via .env
- [x] ALLOWED_HOSTS configurado
- [x] CORS restrito para domínios específicos
- [x] HTTPS/SSL configurado
- [x] CSRF protection ativado
- [x] Security headers configurados
- [x] Logging configurado
- [x] Migrations criadas
- [x] Database connection pooling ativado

### Frontend
- [x] Build otimizado (npm run build)
- [x] API URLs apontam para backend correto
- [x] Error handling implementado
- [x] Loading states funcionando
- [x] Responsive design testado
- [x] Performance otimizado

---

## 🔒 Segurança

- [x] SECRET_KEY novo gerado
- [x] DEBUG desativado
- [x] HSTS ativado (31536000 segundos)
- [x] Content-Security-Policy configurado
- [x] X-Frame-Options = 'DENY'
- [x] X-Content-Type-Options = 'nosniff'
- [x] SSL redirect ativado
- [x] Cookies seguros (SECURE, HTTPONLY, SAMESITE)
- [x] CSRF token ativado
- [x] Permission classes definidas nas API views

---

## 🗄️ Banco de Dados

- [x] PostgreSQL configurado (v15)
- [x] Connection pooling ativado
- [x] Backups automáticos configurados
- [x] Migrations aplicadas
- [x] Índices criados
- [x] Permissões de usuário definidas
- [x] Max connections definido
- [x] Connection timeout configurado

---

## 📧 Email

- [x] SendGrid API Key válida
- [x] Domínio verificado no SendGrid
- [x] Email templates prontos
- [x] Default from email configurado
- [x] Test email enviado com sucesso
- [x] Bounce handling configurado
- [x] Reply-to email definido

---

## 🐳 Docker & Containers

### Backend Container
- [x] Dockerfile otimizado (multi-stage)
- [x] Gunicorn configurado (4 workers)
- [x] Health checks implementados
- [x] Non-root user configurado
- [x] Logging para stdout
- [x] Environment variables carregadas
- [x] Volumes mapeados corretamente

### Frontend Container
- [x] Dockerfile com nginx otimizado
- [x] Gzip compression ativado
- [x] Cache headers configurados
- [x] SPA routing configurado
- [x] Security headers em nginx
- [x] Health checks implementados

### Docker Compose
- [x] PostgreSQL service criado
- [x] Redis service criado
- [x] Backend service criado
- [x] Frontend service criado
- [x] Network configurado
- [x] Volumes persistentes
- [x] Logging configurado
- [x] Health checks em todos serviços
- [x] Dependency ordering correto

---

## 🌍 Configuração de Produção

### Variáveis de Ambiente
- [ ] ENVIRONMENT=production
- [ ] DEBUG=False
- [ ] SECRET_KEY=<novo_key_gerado>
- [ ] ALLOWED_HOSTS=<seu-dominio.com>,www.<seu-dominio.com>
- [ ] FRONTEND_URL=https://<seu-dominio.com>
- [ ] DATABASE_NAME=crm_db
- [ ] DATABASE_USER=crm_user
- [ ] DATABASE_PASSWORD=<senha_forte>
- [ ] DATABASE_HOST=postgres
- [ ] DATABASE_PORT=5432
- [ ] SENDGRID_API_KEY=<sua_api_key>
- [ ] DEFAULT_FROM_EMAIL=noreply@<seu-dominio.com>
- [ ] REDIS_PASSWORD=<senha_redis>
- [ ] CORS_ALLOWED_ORIGINS=https://<seu-dominio.com>

### Configuração de SSL/TLS
- [ ] Certificado SSL adquirido ou gerado (Let's Encrypt)
- [ ] Certificado válido por mais de 30 dias
- [ ] Configurado para auto-renovação
- [ ] HTTPS redirect ativado
- [ ] HSTS preload headers configurados

---

## 📊 Performance

- [x] Database query optimization executado
- [x] N+1 queries verificadas e corrigidas
- [x] Cache configurado (Redis)
- [x] Static files comprimidos (WhiteNoise + Gzip)
- [x] Frontend bundle size < 1MB
- [x] Lazy loading implementado
- [x] CDN configured (se aplicável)
- [x] Database indexes criados
- [x] Pagination implementada

---

## 🧪 Testes

### Unit Tests
- [x] 159 testes passando
- [x] Coverage > 80%
- [x] Backend tests executando
- [x] API endpoints testados

### Integration Tests
- [x] API endpoints testados
- [x] Database operations testadas
- [x] Email integration testada
- [x] Firebase auth testada

### Manual Tests
- [ ] Criar conta - registrar e fazer login
- [ ] Criar empresa - testar CRUD completo
- [ ] Atualizar empresa - modificar informações
- [ ] Deletar empresa - remover da base
- [ ] Pesquisar empresa - filtrar por nome/email
- [ ] Paginar resultados - navegar entre páginas
- [ ] Fazer logout - sair do sistema
- [ ] Fazer logout em múltiplas abas - sincronização
- [ ] Enviar email - verificar recebimento
- [ ] Testar em mobile - responsive design

---

## 📈 Monitoramento & Alertas

- [ ] Logs centralizados configurados (ELK, Splunk, CloudWatch)
- [ ] Error tracking configurado (Sentry, Rollbar)
- [ ] Performance monitoring (New Relic, DataDog, Prometheus)
- [ ] Alertas para:
  - [ ] Database connection failures
  - [ ] High CPU/Memory usage
  - [ ] Email delivery failures
  - [ ] API errors > 1% taxa de erro
  - [ ] Response time > 2 segundos

---

## 🚀 Deployment

### Pré-Deploy
- [ ] Backup do database de produção (se já existe)
- [ ] Plano de rollback preparado
- [ ] Maintenance window agendado (se necessário)
- [ ] Time notificado
- [ ] Health check URLs preparadas

### Deploy Steps
- [ ] Build das imagens Docker
- [ ] Push para container registry (ECR/Docker Hub)
- [ ] Update docker-compose.prod.yml
- [ ] Executar migrations
- [ ] Collectstatic (static files)
- [ ] Restart dos containers
- [ ] Verificar health checks
- [ ] Fumar testes manuais

### Pós-Deploy
- [ ] Monitorar logs por erros
- [ ] Testar funcionalidades críticas
- [ ] Verificar performance
- [ ] Coletar feedback do usuário
- [ ] Documentar status do deploy
- [ ] Schedule de backup

---

## 🔄 Backup & Disaster Recovery

- [ ] Backup automático do database (daily)
- [ ] Backup do Redis (opcional)
- [ ] Backup dos uploaded files
- [ ] Plano de recuperação documentado
- [ ] Teste de restore executado
- [ ] Retention policy definida (30 dias mínimo)
- [ ] Armazenamento offsite (S3, GCP Storage, etc)

---

## 📞 Suporte & Documentação

- [ ] Runbook de deployment criado
- [ ] Troubleshooting guide preparado
- [ ] Escalation procedures definidas
- [ ] Contact list atualizada
- [ ] Post-mortem template preparado
- [ ] Status page configurada

---

## 🎉 Go Live Checklist

**Responsável:** _________________  
**Data:** _________________  

Antes de clicar em "Deploy":

```bash
# 1. Executar pre-deployment check
./pre_deployment_check.sh

# 2. Testar localmente
./test_production_locally.sh

# 3. Verificar se todos os checks passaram
# 4. Confirmar variáveis de ambiente
# 5. Fazer backup do banco atual
# 6. Notificar time
# 7. Iniciar deploy
```

**Assinado:**  
- [ ] Tech Lead: _______  
- [ ] DevOps: _______  
- [ ] Product Manager: _______  

---

## 📝 Notas

```
[Adicionar notas específicas da sua implantação aqui]
```

---

## 🎯 Checklist Post-Deploy (24 horas)

- [ ] Nenhum erro crítico nos logs
- [ ] Todas as features funcionando
- [ ] Performance dentro dos limites
- [ ] Email sendo entregue normalmente
- [ ] Backups sendo executados
- [ ] Alerts recebidos e responsivos
- [ ] Usuários sem relatos de problemas

---

**Bom deployment! 🚀**
