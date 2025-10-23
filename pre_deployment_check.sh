#!/bin/bash

# ============================================
# PRÉ-DEPLOYMENT CHECK SCRIPT
# Verifica se tudo está pronto para deploy
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# ============================================
# FUNÇÕES
# ============================================

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
}

check_file_exists() {
    if [ -f "$1" ]; then
        print_success "Arquivo encontrado: $1"
        return 0
    else
        print_error "Arquivo NÃO encontrado: $1"
        return 1
    fi
}

check_env_var() {
    if grep -q "^$1=" backend/.env.prod 2>/dev/null || grep -q "^$1=" backend/.env 2>/dev/null; then
        print_success "Variável $1 configurada"
        return 0
    else
        print_error "Variável $1 NÃO configurada"
        return 1
    fi
}

# ============================================
# INICIO DAS VERIFICAÇÕES
# ============================================

clear
echo -e "${BLUE}"
cat << "EOF"
 ______ _____ ____  __  ______   _____  _____ ____ 
|__  __/ ____|  __ \|  \/  |  \ | ____|/ __ \|  _ \
   | | | |    | |  | |  /\  | | \| |__ | |  | | |_) |
   | | | |    | |  | | |  \ | |  . __ \| |  | |  _ <
   | | | |____ | |__| | |\/| | | | | | | |__| | |_) |
   |_|  \_____|_____/|_|  |_|_| |_| |_|\____/|____/

PRÉ-DEPLOYMENT CHECK - CRM SYSTEM
EOF
echo -e "${NC}\n"

# ============================================
# 1. VERIFICAÇÃO DE ARQUIVOS
# ============================================

print_header "1. VERIFICAÇÃO DE ARQUIVOS NECESSÁRIOS"

echo "Verificando arquivos de configuração..."
check_file_exists "backend/crm_backend/settings.py"
check_file_exists "backend/crm_backend/production_settings.py"
check_file_exists "backend/requirements.txt"
check_file_exists "backend/Dockerfile"
check_file_exists "frontend/Dockerfile"
check_file_exists "docker-compose.prod.yml"
check_file_exists "frontend/package.json"
check_file_exists "nginx_production.conf"

echo -e "\nVerificando arquivo .env..."
if [ -f "backend/.env.prod" ]; then
    print_success ".env.prod encontrado"
elif [ -f "backend/.env" ]; then
    print_success ".env encontrado"
else
    print_error ".env ou .env.prod não encontrado"
fi

# ============================================
# 2. VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE
# ============================================

print_header "2. VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE"

echo "Verificando variáveis essenciais..."
check_env_var "ENVIRONMENT"
check_env_var "DEBUG"
check_env_var "SECRET_KEY"
check_env_var "DATABASE_NAME"
check_env_var "DATABASE_USER"
check_env_var "DATABASE_PASSWORD"
check_env_var "SENDGRID_API_KEY"
check_env_var "DEFAULT_FROM_EMAIL"
check_env_var "REDIS_PASSWORD"

# ============================================
# 3. VERIFICAÇÃO DE DEPENDÊNCIAS
# ============================================

print_header "3. VERIFICAÇÃO DE DEPENDÊNCIAS DO SISTEMA"

echo "Verificando Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "$DOCKER_VERSION"
else
    print_error "Docker não instalado"
fi

echo -e "\nVerificando Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_success "$COMPOSE_VERSION"
else
    print_error "Docker Compose não instalado"
fi

echo -e "\nVerificando Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "$PYTHON_VERSION"
else
    print_error "Python3 não instalado"
fi

echo -e "\nVerificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION"
else
    print_warning "Node.js não instalado (opcional para deployment)"
fi

# ============================================
# 4. VERIFICAÇÃO DE CONFIGURAÇÃO DJANGO
# ============================================

print_header "4. VERIFICAÇÃO DE CONFIGURAÇÃO DJANGO"

echo "Verificando settings.py..."
if grep -q "ENVIRONMENT" backend/crm_backend/settings.py; then
    print_success "ENVIRONMENT configurado em settings.py"
else
    print_error "ENVIRONMENT não encontrado em settings.py"
fi

if grep -q "production_settings" backend/crm_backend/settings.py; then
    print_success "production_settings importado"
else
    print_error "production_settings não está sendo importado"
fi

echo -e "\nVerificando production_settings.py..."
if [ -f "backend/crm_backend/production_settings.py" ]; then
    if grep -q "HSTS" backend/crm_backend/production_settings.py; then
        print_success "HSTS configurado (segurança SSL)"
    else
        print_warning "HSTS não configurado em production_settings.py"
    fi
    
    if grep -q "SECURE_SSL_REDIRECT" backend/crm_backend/production_settings.py; then
        print_success "SSL redirect configurado"
    else
        print_warning "SSL redirect não configurado"
    fi
else
    print_error "production_settings.py não encontrado"
fi

# ============================================
# 5. VERIFICAÇÃO DE TESTES
# ============================================

print_header "5. VERIFICAÇÃO DE TESTES"

if [ -f "backend/apps/tests.py" ] || find backend -name "test*.py" | grep -q .; then
    print_success "Arquivos de teste encontrados"
    echo -e "\nSugestão: Execute 'python manage.py test' antes do deployment"
else
    print_warning "Nenhum arquivo de teste encontrado"
fi

# ============================================
# 6. VERIFICAÇÃO DE SEGURANÇA
# ============================================

print_header "6. VERIFICAÇÃO DE SEGURANÇA"

echo "Verificando configurações de segurança..."

# Verificar DEBUG
if grep -q "DEBUG = False" backend/crm_backend/production_settings.py; then
    print_success "DEBUG = False configurado"
elif grep -q "DEBUG = os.getenv" backend/crm_backend/settings.py; then
    print_success "DEBUG configurado por variável de ambiente"
else
    print_warning "DEBUG não configurado corretamente"
fi

# Verificar ALLOWED_HOSTS
if grep -q "ALLOWED_HOSTS" backend/crm_backend/production_settings.py; then
    print_success "ALLOWED_HOSTS configurado"
else
    print_warning "ALLOWED_HOSTS não configurado"
fi

# Verificar SECRET_KEY
if grep -q "SECRET_KEY" backend/crm_backend/settings.py; then
    if grep -q "get_random_secret_key" backend/crm_backend/settings.py; then
        print_warning "SECRET_KEY usando get_random_secret_key (verá se está em .env)"
    else
        print_success "SECRET_KEY configurado"
    fi
else
    print_error "SECRET_KEY não encontrado em settings"
fi

# ============================================
# 7. VERIFICAÇÃO DE DOCKER
# ============================================

print_header "7. VERIFICAÇÃO DE DOCKER"

echo "Verificando Dockerfiles..."

if [ -f "backend/Dockerfile" ]; then
    if grep -q "EXPOSE 8000" backend/Dockerfile; then
        print_success "Backend Dockerfile tem EXPOSE 8000"
    else
        print_warning "Backend Dockerfile sem EXPOSE"
    fi
    
    if grep -q "gunicorn" backend/Dockerfile; then
        print_success "Backend usando gunicorn"
    else
        print_error "Backend não configurado com gunicorn"
    fi
else
    print_error "backend/Dockerfile não encontrado"
fi

if [ -f "frontend/Dockerfile" ]; then
    if grep -q "nginx" frontend/Dockerfile; then
        print_success "Frontend usando nginx"
    else
        print_error "Frontend não configurado com nginx"
    fi
else
    print_error "frontend/Dockerfile não encontrado"
fi

echo -e "\nVerificando docker-compose.prod.yml..."
if [ -f "docker-compose.prod.yml" ]; then
    if grep -q "postgres" docker-compose.prod.yml; then
        print_success "PostgreSQL configurado"
    else
        print_error "PostgreSQL não configurado"
    fi
    
    if grep -q "redis" docker-compose.prod.yml; then
        print_success "Redis configurado"
    else
        print_error "Redis não configurado"
    fi
    
    if grep -q "healthcheck" docker-compose.prod.yml; then
        print_success "Health checks configurados"
    else
        print_warning "Health checks não configurados"
    fi
else
    print_error "docker-compose.prod.yml não encontrado"
fi

# ============================================
# 8. VERIFICAÇÃO DE DEPENDÊNCIAS PYTHON
# ============================================

print_header "8. VERIFICAÇÃO DE DEPENDÊNCIAS PYTHON"

echo "Analisando requirements.txt..."

DEPS_CHECK=(
    "django"
    "djangorestframework"
    "gunicorn"
    "whitenoise"
    "django-redis"
    "psycopg2"
    "sendgrid-django"
    "firebase-admin"
)

for dep in "${DEPS_CHECK[@]}"; do
    if grep -q "$dep" backend/requirements.txt; then
        print_success "$dep encontrado"
    else
        print_warning "$dep não encontrado em requirements.txt"
    fi
done

# ============================================
# 9. RELATÓRIO FINAL
# ============================================

print_header "RELATÓRIO FINAL"

TOTAL=$((PASSED + FAILED + WARNINGS))

echo -e "${GREEN}✓ Verificações passadas: $PASSED${NC}"
echo -e "${RED}✗ Verificações falhadas: $FAILED${NC}"
echo -e "${YELLOW}⚠ Avisos: $WARNINGS${NC}"
echo -e "\nTotal: $TOTAL verificações"

echo -e "\n${BLUE}================================${NC}"

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ PRONTO PARA DEPLOYMENT!${NC}"
        echo -e "\nPróximas ações:"
        echo "  1. Gerar SECRET_KEY: python -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\""
        echo "  2. Editar backend/.env.prod com valores reais"
        echo "  3. Executar: docker-compose -f docker-compose.prod.yml build"
        echo "  4. Executar: docker-compose -f docker-compose.prod.yml up -d"
        echo "  5. Verificar: docker-compose -f docker-compose.prod.yml ps"
        exit 0
    else
        echo -e "${YELLOW}⚠ PRONTO PARA DEPLOYMENT (COM AVISOS)${NC}"
        echo -e "\nResolva os avisos antes de enviar para produção."
        exit 0
    fi
else
    echo -e "${RED}✗ PROBLEMAS ENCONTRADOS${NC}"
    echo -e "\nResolva os erros acima antes de fazer deployment."
    exit 1
fi
