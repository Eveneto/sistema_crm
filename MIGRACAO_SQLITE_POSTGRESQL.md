# 🗄️ GUIA DE MIGRAÇÃO: SQLite → PostgreSQL

> **Pré-requisito:** Docker e Docker Compose instalados

---

## 📋 Visão Geral

Este guia vai te ajudar a:

1. ✅ Fazer backup do banco SQLite atual
2. ✅ Iniciar PostgreSQL em Docker
3. ✅ Migrar dados do SQLite para PostgreSQL
4. ✅ Validar integridade dos dados
5. ✅ Testar a aplicação com novo banco

**Tempo estimado:** 30-45 minutos

---

## 🔄 Passo 1: Backup do SQLite Atual

### **Fazer backup do banco atual (IMPORTANTE!)**

```bash
# Criar pasta de backups
mkdir -p backups

# Copiar database.db (SQLite)
cp backend/db.sqlite3 backups/db.sqlite3.backup.$(date +%Y%m%d_%H%M%S)

# Verificar
ls -lh backups/
```

**Saída esperada:**
```
-rw-r--r-- 1 user user 123K Oct 23 10:30 db.sqlite3.backup.20251023_103000
```

---

## 🐳 Passo 2: Iniciar PostgreSQL em Docker

### **Opção A: Usar docker-compose.prod.yml (Recomendado)**

```bash
# Iniciar apenas o PostgreSQL
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Aguardar inicialização
sleep 10

# Verificar se está saudável
docker-compose -f docker-compose.prod.yml ps postgres
```

**Deve mostrar:**
```
NAME            STATUS
crm_postgres_prod   Up (healthy)
```

### **Opção B: PostgreSQL Standalone (Simples)**

```bash
# Se não quiser usar docker-compose completo
docker run -d \
  --name crm_postgres \
  -e POSTGRES_USER=crm_user \
  -e POSTGRES_PASSWORD=SenhaSegura@123 \
  -e POSTGRES_DB=crm_db \
  -p 5432:5432 \
  postgres:15-alpine

# Aguardar inicialização
sleep 5

# Verificar
docker ps | grep crm_postgres
```

---

## 🔧 Passo 3: Configurar Django para PostgreSQL

### **Editar backend/.env**

```bash
# Copiar template de produção
cp backend/.env.production backend/.env

# Editar arquivo
nano backend/.env
```

**Adicionar/Modificar essas variáveis:**

```bash
# DATABASE
DATABASE_NAME=crm_db
DATABASE_USER=crm_user
DATABASE_PASSWORD=SenhaSegura@123
DATABASE_HOST=localhost        # Mudar de 'postgres' para 'localhost'
DATABASE_PORT=5432            # Porta padrão PostgreSQL

# ENVIRONMENT
ENVIRONMENT=development        # Manter como development para testes
DEBUG=True                     # Manter como True para development

# EMAIL (opcional, mas recomendado)
SENDGRID_API_KEY=seu_api_key_aqui
DEFAULT_FROM_EMAIL=noreply@test.com
```

---

## 📦 Passo 4: Instalar Driver PostgreSQL

### **Instalar psycopg2 (driver Python para PostgreSQL)**

```bash
# Ativar venv
source backend/.venv/bin/activate

# Instalar
pip install psycopg2-binary==2.9.9

# Verificar instalação
python -c "import psycopg2; print(psycopg2.__version__)"
```

**Saída esperada:**
```
2.9.9 (dt, c ext, prov=libpq)
```

---

## 🔍 Passo 5: Testar Conexão com PostgreSQL

### **Verificar se Django consegue conectar**

```bash
cd backend

# Ativar venv
source .venv/bin/activate

# Testar conexão
python manage.py dbshell
```

**Deve abrir prompt do PostgreSQL:**
```
psql (15.0)
Type "help" for help.

crm_db=>
```

**Para sair:**
```
\q
```

---

## 💾 Passo 6: Criar Migrations do Banco

### **Gerar e aplicar migrations**

```bash
cd backend

# Ativar venv
source .venv/bin/activate

# Criar migrations (mesmo sem mudanças, garante compatibilidade)
python manage.py makemigrations

# Aplicar migrations
python manage.py migrate

# Verificar status
python manage.py showmigrations
```

**Saída esperada:**
```
[X] 0001_initial
[X] 0002_alter_field_name
...
```

---

## 📊 Passo 7: Exportar Dados do SQLite

### **Dumpar dados do SQLite em JSON**

```bash
cd backend

# Ativar venv
source .venv/bin/activate

# Exportar TODOS os dados
python manage.py dumpdata --all --indent=2 > /tmp/sqlite_data.json

# Verificar arquivo
ls -lh /tmp/sqlite_data.json

# Ver quantos registros
cat /tmp/sqlite_data.json | python -m json.tool | grep -c '"model"'
```

**Saída esperada:**
```
-rw-r--r-- 1 user user 345K Oct 23 10:45 /tmp/sqlite_data.json
```

---

## 📥 Passo 8: Importar Dados para PostgreSQL

### **Carregar dados no novo banco**

```bash
cd backend

# Ativar venv
source .venv/bin/activate

# Importar dados
python manage.py loaddata /tmp/sqlite_data.json

# Ou com mais verbosidade
python manage.py loaddata /tmp/sqlite_data.json --verbosity=2
```

**Saída esperada:**
```
Installed 345 object(s) from 1 fixture(s)
```

---

## ✅ Passo 9: Validar Migração

### **Verificar se tudo foi migrado corretamente**

```bash
cd backend

# Ativar venv
source .venv/bin/activate

# Ver contagem de registros
python manage.py shell

# No shell Django:
```

**Execute no shell:**

```python
from django.apps import apps

# Listar todas as apps
for app_config in apps.get_app_configs():
    print(f"\n{app_config.name}:")
    for model in app_config.get_models():
        count = model.objects.count()
        print(f"  {model.__name__}: {count} registros")
```

**Saída esperada:**
```
authentication:
  User: 5 registros

companies:
  Company: 12 registros
  Contact: 34 registros

chat:
  Message: 156 registros

...
```

### **Sair do shell**

```python
exit()
```

---

## 🧪 Passo 10: Testar Aplicação

### **Executar testes**

```bash
cd backend

# Ativar venv
source .venv/bin/activate

# Rodar testes
python manage.py test --keepdb

# Ou apenas alguns
python manage.py test apps.companies.tests --keepdb
```

**Deve passar todos:**
```
Ran 159 tests in 2.345s
OK
```

---

## 🌐 Passo 11: Testar Servidor de Desenvolvimento

### **Iniciar servidor Django**

```bash
cd backend

# Ativar venv
source .venv/bin/activate

# Rodar servidor
python manage.py runserver 8000
```

**Saída esperada:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### **Em outro terminal, testar API**

```bash
# Testar backend
curl http://localhost:8000/api/

# Ou abrir no navegador
# http://localhost:8000/admin
# (username/password que usou antes)
```

---

## 📋 Checklist de Validação

```
✅ Backup do SQLite feito
✅ PostgreSQL rodando em Docker
✅ Django configurado para PostgreSQL
✅ psycopg2 instalado
✅ Conexão com PostgreSQL testada
✅ Migrations aplicadas
✅ Dados exportados do SQLite
✅ Dados importados no PostgreSQL
✅ Contagem de registros validada
✅ Testes passando
✅ Servidor testado
✅ API respondendo
✅ Admin funcionando
```

---

## 🔄 Passo 12: Remover SQLite (Opcional)

### **Depois de validar tudo, você pode remover SQLite**

```bash
cd backend

# Arquivar (não deletar ainda)
mv db.sqlite3 db.sqlite3.old

# Após ter certeza de que PostgreSQL está funcionando:
# rm db.sqlite3.old
```

---

## 🚨 Troubleshooting

### **Problema: "could not connect to server: Connection refused"**

```bash
# Verificar se PostgreSQL está rodando
docker-compose -f docker-compose.prod.yml ps postgres

# Se não estiver:
docker-compose -f docker-compose.prod.yml up -d postgres

# Aguardar 10 segundos
sleep 10

# Tentar novamente
python manage.py dbshell
```

### **Problema: "FATAL: Ident authentication failed"**

```bash
# Verificar arquivo .env
cat backend/.env | grep DATABASE

# Garantir que DATABASE_PASSWORD está configurado
# E que DATABASE_HOST está correto (localhost ou postgres)
```

### **Problema: "permission denied for schema public"**

```bash
# Resetar permissões no PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U crm_user -d crm_db -c "GRANT ALL PRIVILEGES ON SCHEMA public TO crm_user;"

# Ou resetar completamente o banco
docker-compose -f docker-compose.prod.yml down postgres
docker volume rm sistema_crm_postgres_data_prod  # CUIDADO - deleta dados!
docker-compose -f docker-compose.prod.yml up -d postgres
sleep 10
python manage.py migrate
```

### **Problema: "loaddata" falha com constraint errors**

```bash
# Tentar sem as permissões do usuário admin primeiro
python manage.py loaddata /tmp/sqlite_data.json --exclude auth.permission

# Depois carregar permissões
python manage.py loaddata /tmp/sqlite_data.json
```

---

## 📊 Comparação: SQLite vs PostgreSQL

| Aspecto | SQLite | PostgreSQL |
|---------|--------|-----------|
| **Arquivo** | `db.sqlite3` | Server remoto |
| **Escalabilidade** | Até ~1GB | Ilimitado |
| **Concorrência** | Limitada | Excelente |
| **Produção** | ❌ Não | ✅ Sim |
| **Backup** | Manual | Automático |
| **Performance** | Boa | Excelente |

---

## 🎯 Próximas Ações

Após concluir esta migração:

### **Curto Prazo (Esta Semana)**
- ✅ Migração completada e testada
- ⏳ Executar `./pre_deployment_check.sh` novamente
- ⏳ Testar stack com `./test_production_locally.sh`

### **Médio Prazo (Próxima Semana)**
- ⏳ Configurar Redis (cache)
- ⏳ Configurar SendGrid (email)
- ⏳ Comprar domínio
- ⏳ Gerar certificado SSL

### **Antes de Go Live**
- ⏳ Testes em staging
- ⏳ Deployment em produção
- ⏳ Configurar domínio
- ⏳ Ativar HTTPS

---

## 💡 Dicas Importantes

✅ **Sempre fazer backup antes de migrar**
```bash
# Seu backup está em:
ls -lh backups/db.sqlite3.backup*
```

✅ **PostgreSQL em Docker é temporário**
```bash
# Quando parar os containers, dados são perdidos
# A menos que você tenha volumes persistentes (têm no docker-compose.prod.yml)

# Para persistência permanente:
docker volume ls | grep postgres
```

✅ **Manter SQLite para referência**
```bash
# Não delete db.sqlite3 imediatamente
# Mantenha backup por pelo menos 1 semana
```

✅ **Testar rollback**
```bash
# Se algo der errado, pode voltar:
1. Parar PostgreSQL
2. Restaurar db.sqlite3.old
3. Reiniciar Django
```

---

## 📞 Verificação Rápida

### **Depois de cada passo, execute:**

```bash
# 1. PostgreSQL está rodando?
docker-compose -f docker-compose.prod.yml ps postgres

# 2. Django consegue conectar?
python manage.py dbshell
\q

# 3. Dados foram migrados?
python manage.py shell
# Execute: print(User.objects.count())

# 4. Servidor está respondendo?
python manage.py runserver 8000
# Em outro terminal: curl http://localhost:8000/api/
```

---

## 📈 Performance Esperada

**Antes (SQLite):**
```
- API response: 150-200ms
- Queries: Sem caching
- Concorrência: 1 usuário por vez
```

**Depois (PostgreSQL):**
```
- API response: 50-100ms (3x mais rápido!)
- Queries: Com indexação
- Concorrência: Múltiplos usuários
```

---

## 🎉 Conclusão

Após seguir este guia, você terá:

✅ Backup seguro do SQLite  
✅ PostgreSQL rodando em Docker  
✅ Dados migrados completamente  
✅ Banco validado e funcionando  
✅ Servidor pronto para próxima fase  

**Próximo passo:** Depois de validar, voltamos para configurar o resto (SendGrid, Redis, Domínio, SSL).

---

*Guia criado em: 23 de Outubro, 2025*  
*Versão: 1.0 - SQLite → PostgreSQL Migration*
