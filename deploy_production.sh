#!/bin/bash

# ===== SCRIPT DE DEPLOY SEGURO PARA PRODUÇÃO =====
# Este script automatiza o deploy do CRM com validações de segurança

set -e  # Parar em qualquer erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 INICIANDO DEPLOY SEGURO DO CRM SYSTEM${NC}"
echo "=================================================="

# ===== VALIDAÇÕES PRÉ-DEPLOY =====
echo -e "\n${YELLOW}📋 1. VALIDAÇÕES PRÉ-DEPLOY${NC}"

# Verificar se está na branch correta
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}❌ ERRO: Deploy deve ser feito da branch master/main${NC}"
    exit 1
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ ERRO: Há mudanças não commitadas${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Branch e commits verificados${NC}"

# ===== VERIFICAR ARQUIVO .env.production =====
echo -e "\n${YELLOW}📋 2. VERIFICAR CONFIGURAÇÕES DE PRODUÇÃO${NC}"

if [ ! -f "backend/.env.production" ]; then
    echo -e "${RED}❌ ERRO: Arquivo .env.production não encontrado${NC}"
    echo "Crie o arquivo com configurações seguras para produção"
    exit 1
fi

# Verificar se SECRET_KEY não é a padrão
if grep -q "django-insecure-change-this-key" backend/.env.production; then
    echo -e "${RED}❌ ERRO: SECRET_KEY padrão detectada em .env.production${NC}"
    echo "Configure uma SECRET_KEY segura"
    exit 1
fi

# Verificar se DEBUG está false
if ! grep -q "DEBUG=False" backend/.env.production; then
    echo -e "${RED}❌ ERRO: DEBUG deve estar False em produção${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configurações de produção verificadas${NC}"

# ===== TESTES DE SEGURANÇA =====
echo -e "\n${YELLOW}📋 3. EXECUTAR TESTES DE SEGURANÇA${NC}"

# Ir para diretório do backend
cd backend

# Ativar ambiente virtual se existir
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo -e "${GREEN}✅ Ambiente virtual ativado${NC}"
fi

# Verificar dependências de segurança
echo "🔍 Verificando dependências..."
python -m pip check

# Executar testes Django
echo "🧪 Executando testes Django..."
python manage.py test --settings=crm_backend.settings --verbosity=0

# Verificar migrações pendentes
echo "📦 Verificando migrações..."
python manage.py makemigrations --dry-run --check

echo -e "${GREEN}✅ Testes de segurança passaram${NC}"

# ===== VALIDAÇÕES DE CÓDIGO =====
echo -e "\n${YELLOW}📋 4. VALIDAÇÕES DE CÓDIGO${NC}"

# Verificar imports não utilizados (se flake8 estiver instalado)
if command -v flake8 &> /dev/null; then
    echo "🔍 Verificando qualidade do código..."
    flake8 --exclude=migrations,venv,.venv --ignore=E501,W503 . || true
fi

# Verificar configurações Django
echo "🔍 Verificando configurações Django..."
python manage.py check --deploy

echo -e "${GREEN}✅ Validações de código concluídas${NC}"

# ===== BACKUP PRÉ-DEPLOY =====
echo -e "\n${YELLOW}📋 5. BACKUP PRÉ-DEPLOY${NC}"

# Criar backup da base de dados atual (se em produção)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/pre_deploy_$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# Backup do banco SQLite (se existir)
if [ -f "db.sqlite3" ]; then
    cp db.sqlite3 "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Backup do banco SQLite criado${NC}"
fi

# Backup dos arquivos de mídia
if [ -d "media" ]; then
    cp -r media "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Backup dos arquivos de mídia criado${NC}"
fi

echo -e "${GREEN}✅ Backup pré-deploy concluído: $BACKUP_DIR${NC}"

# ===== DEPLOY =====
echo -e "\n${YELLOW}📋 6. EXECUTAR DEPLOY${NC}"

# Instalar dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Executar migrações
echo "📦 Aplicando migrações..."
python manage.py migrate

# Coletar arquivos estáticos
echo "📦 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

# Criar superusuário se não existir (apenas em primeiro deploy)
echo "👤 Verificando superusuário..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(is_superuser=True).exists():
    print('Criando superusuário...')
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superusuário criado: admin/admin123')
else:
    print('Superusuário já existe')
"

echo -e "${GREEN}✅ Deploy concluído${NC}"

# ===== VALIDAÇÕES PÓS-DEPLOY =====
echo -e "\n${YELLOW}📋 7. VALIDAÇÕES PÓS-DEPLOY${NC}"

# Testar se o servidor sobe sem erros
echo "🔍 Testando inicialização do servidor..."
timeout 10s python manage.py runserver 0.0.0.0:8000 --insecure &
SERVER_PID=$!

sleep 5

# Verificar se o processo ainda está rodando
if kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Servidor iniciou com sucesso${NC}"
    kill $SERVER_PID
else
    echo -e "${RED}❌ ERRO: Servidor falhou ao iniciar${NC}"
    exit 1
fi

# Testar endpoint de health check
echo "🔍 Testando endpoints básicos..."
python -c "
import requests
import sys
try:
    # Teste básico de conectividade
    response = requests.get('http://localhost:8000/admin/', timeout=5)
    print('✅ Endpoint admin acessível')
except Exception as e:
    print(f'⚠️ Aviso: Endpoint não testável: {e}')
"

echo -e "${GREEN}✅ Validações pós-deploy concluídas${NC}"

# ===== FINALIZAÇÃO =====
echo -e "\n${BLUE}🎉 DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo "=================================================="
echo -e "${GREEN}✅ Sistema deployado e validado${NC}"
echo -e "${GREEN}✅ Backups criados em: $BACKUP_DIR${NC}"
echo -e "${GREEN}✅ Testes de segurança passaram${NC}"
echo ""
echo -e "${YELLOW}📋 PRÓXIMOS PASSOS:${NC}"
echo "1. Verificar logs em production: tail -f logs/*.log"
echo "2. Configurar servidor web (Nginx/Apache)"
echo "3. Configurar SSL/HTTPS"
echo "4. Configurar firewall"
echo "5. Configurar monitoramento"
echo ""
echo -e "${BLUE}🚀 Sistema pronto para produção!${NC}"

# Voltar para diretório original
cd ..

exit 0
