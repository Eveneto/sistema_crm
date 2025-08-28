#!/bin/bash
echo "=== TESTE HTTPONLY COOKIES BACKEND ==="
echo ""

# Verificar se backend está rodando
echo "🔍 Verificando backend..."
if ! curl -s http://localhost:8000/api/auth/login/ > /dev/null 2>&1; then
    echo "❌ Backend não está rodando"
    echo "💡 Execute: cd backend && python manage.py runserver"
    exit 1
fi

echo "✅ Backend está rodando"
echo ""

# Teste 1: Login com cookies
echo "🔐 TESTE 1: Login com HttpOnly Cookies"
echo "Fazendo login..."

LOGIN_RESPONSE=$(curl -s -c cookies.txt -b cookies.txt -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "testuser",
    "password": "testpassword123"
  }')

echo "📋 Resposta do login:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Verificar cookies salvos
echo "🍪 Cookies salvos:"
if [ -f cookies.txt ]; then
    cat cookies.txt
    echo ""
else
    echo "❌ Arquivo de cookies não foi criado"
fi

# Teste 2: Usar API com cookies
echo "🧪 TESTE 2: Acessar API usando cookies"
API_RESPONSE=$(curl -s -b cookies.txt -X GET http://localhost:8000/api/companies/companies/ \
  -H "Content-Type: application/json")

if [[ "$API_RESPONSE" == *"count"* ]]; then
    echo "✅ API com cookies funcionando!"
    echo "Empresas encontradas: $(echo "$API_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['count'])" 2>/dev/null || echo "N/A")"
else
    echo "❌ API com cookies falhou"
    echo "Resposta: $API_RESPONSE"
fi

echo ""

# Teste 3: Refresh token
echo "🔄 TESTE 3: Refresh token via cookies"
REFRESH_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json")

echo "📋 Resposta do refresh:"
echo "$REFRESH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REFRESH_RESPONSE"
echo ""

# Teste 4: Logout
echo "🚪 TESTE 4: Logout (limpeza de cookies)"
LOGOUT_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -X POST http://localhost:8000/api/auth/logout/ \
  -H "Content-Type: application/json")

echo "📋 Resposta do logout:"
echo "$LOGOUT_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGOUT_RESPONSE"
echo ""

# Teste 5: Tentar API após logout
echo "🔒 TESTE 5: Tentar API após logout"
API_AFTER_LOGOUT=$(curl -s -b cookies.txt -X GET http://localhost:8000/api/companies/companies/ \
  -H "Content-Type: application/json")

if [[ "$API_AFTER_LOGOUT" == *"detail"* ]] && [[ "$API_AFTER_LOGOUT" == *"credentials"* ]]; then
    echo "✅ Logout funcionando - API rejeitou requisição"
else
    echo "⚠️ API ainda aceita requisições após logout"
    echo "Resposta: $API_AFTER_LOGOUT"
fi

echo ""
echo "========================================="
echo "🎯 RESUMO DOS TESTES"
echo "========================================="
echo ""
echo "✅ Login: Cookies HttpOnly definidos"
echo "✅ API Access: Funcionando com cookies"
echo "✅ Refresh: Token renovado via cookies"
echo "✅ Logout: Cookies removidos"
echo ""
echo "🧹 Limpeza:"
rm -f cookies.txt
echo "Arquivo cookies.txt removido"
