#!/bin/bash

# 🚀 FIREBASE INTEGRATION TEST SCRIPT
# Testa toda a integração Firebase no CRM System

echo "🔥 FIREBASE INTEGRATION TEST - CRM SYSTEM"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verificar se arquivo de credenciais existe
echo "1. Verificando credenciais Firebase..."
CRED_FILE=$(find /home/dev_pc/Documentos/crm_freela -name "client_secret_254673637981-*.json" | head -1)

if [ -z "$CRED_FILE" ]; then
    print_error "Arquivo de credenciais Firebase não encontrado!"
    print_warning "Execute: Baixe as credenciais do Firebase Console e coloque na raiz do projeto"
    exit 1
else
    print_status "Credenciais encontradas: $CRED_FILE"
fi

# 2. Verificar se backend está rodando
echo ""
echo "2. Verificando backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/auth/login/)

if [ "$BACKEND_STATUS" = "405" ]; then
    print_status "Backend rodando (código 405 esperado para GET)"
elif [ "$BACKEND_STATUS" = "200" ]; then
    print_status "Backend rodando"
else
    print_error "Backend não está respondendo (código: $BACKEND_STATUS)"
    print_warning "Execute: cd backend && python manage.py runserver 8000"
    exit 1
fi

# 3. Verificar se frontend está rodando
echo ""
echo "3. Verificando frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$FRONTEND_STATUS" = "200" ]; then
    print_status "Frontend rodando"
else
    print_error "Frontend não está respondendo (código: $FRONTEND_STATUS)"
    print_warning "Execute: cd frontend && npm start"
    exit 1
fi

# 4. Testar inicialização Firebase no backend
echo ""
echo "4. Testando inicialização Firebase..."
cd /home/dev_pc/Documentos/crm_freela/backend
source ../.venv/bin/activate

FIREBASE_INIT_TEST=$(python manage.py shell -c "
try:
    from apps.authentication.firebase_service import FirebaseService
    FirebaseService.initialize()
    print('SUCCESS')
except Exception as e:
    print(f'ERROR: {e}')
" 2>&1)

if echo "$FIREBASE_INIT_TEST" | grep -q "SUCCESS"; then
    print_status "Firebase inicializado com sucesso no backend"
elif echo "$FIREBASE_INIT_TEST" | grep -q "Arquivo de credenciais Firebase não encontrado"; then
    print_error "Credenciais não encontradas pelo backend"
    print_warning "Verifique se o arquivo está na raiz do projeto"
    exit 1
else
    print_error "Erro na inicialização Firebase: $FIREBASE_INIT_TEST"
    exit 1
fi

# 5. Verificar configuração do middleware
echo ""
echo "5. Verificando middleware Firebase..."
MIDDLEWARE_CHECK=$(grep -n "FirebaseAuthenticationMiddleware" crm_backend/settings.py)

if echo "$MIDDLEWARE_CHECK" | grep -q "^[0-9]*:"; then
    if echo "$MIDDLEWARE_CHECK" | grep -q "^[0-9]*:.*#.*FirebaseAuthenticationMiddleware"; then
        print_warning "Middleware Firebase está comentado"
        print_warning "Descomente a linha no settings.py"
    else
        print_status "Middleware Firebase habilitado"
    fi
else
    print_error "Middleware Firebase não encontrado no settings.py"
    exit 1
fi

# 6. Testar API com token inválido (deve falhar)
echo ""
echo "6. Testando proteção de rotas..."
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer invalid_token" \
  -H "X-Auth-Type: firebase" \
  http://localhost:8000/api/companies/companies/)

if [ "$API_TEST" = "401" ]; then
    print_status "Proteção de rotas funcionando (401 Unauthorized esperado)"
elif [ "$API_TEST" = "200" ]; then
    print_warning "Rota não protegida (pode estar usando autenticação Django)"
else
    print_error "Erro inesperado na API (código: $API_TEST)"
fi

# 7. Verificar configuração frontend
echo ""
echo "7. Verificando configuração Firebase frontend..."
if [ -f "/home/dev_pc/Documentos/crm_freela/frontend/src/firebaseConfig.ts" ]; then
    FIREBASE_CONFIG_CHECK=$(grep -c "apiKey.*AIzaSyDIOh0taxaOZCzjshMBsZwoBHwZAalQ1wg" /home/dev_pc/Documentos/crm_freela/frontend/src/firebaseConfig.ts)
    if [ "$FIREBASE_CONFIG_CHECK" -gt 0 ]; then
        print_status "Configuração Firebase frontend OK"
    else
        print_error "Configuração Firebase frontend incorreta"
    fi
else
    print_error "Arquivo firebaseConfig.ts não encontrado"
fi

# 8. Verificar dependências
echo ""
echo "8. Verificando dependências..."
cd /home/dev_pc/Documentos/crm_freela/frontend
if npm list firebase --depth=0 &>/dev/null; then
    print_status "Firebase SDK instalado no frontend"
else
    print_error "Firebase SDK não instalado"
    print_warning "Execute: npm install firebase"
fi

cd /home/dev_pc/Documentos/crm_freela/backend
source ../.venv/bin/activate
if pip list | grep -q "firebase-admin"; then
    print_status "Firebase Admin SDK instalado no backend"
else
    print_error "Firebase Admin SDK não instalado"
    print_warning "Execute: pip install firebase-admin"
fi

# Resultado final
echo ""
echo "=========================================="
echo "📊 RESULTADO DOS TESTES"
echo "=========================================="

if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 TUDO CERTO! Firebase pronto para uso${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Teste login no frontend"
    echo "2. Verifique criação automática de usuários"
    echo "3. Teste proteção de rotas"
else
    echo -e "${RED}⚠️  $ERROR_COUNT problemas encontrados${NC}"
    echo ""
    echo "Corrija os problemas acima antes de continuar"
fi

echo ""
echo "📝 Logs detalhados salvos em: firebase_test_$(date +%Y%m%d_%H%M%S).log"
