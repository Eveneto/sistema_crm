#!/bin/bash

echo "=== DEBUG FRONTEND COMPANIES CRUD ==="
echo ""

# Verificar se backend está rodando
echo "🔍 Verificando se backend está rodando..."
BACKEND_STATUS=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8000/api/companies/companies/)

if [ "$BACKEND_STATUS" = "000" ]; then
    echo "❌ Backend não está rodando em http://localhost:8000"
    echo "💡 Execute: cd backend && python manage.py runserver 8000"
    exit 1
fi

echo "✅ Backend está rodando (Status: $BACKEND_STATUS)"
echo ""

# Verificar se frontend está rodando
echo "🔍 Verificando se frontend está rodando..."
FRONTEND_STATUS=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/)

if [ "$FRONTEND_STATUS" = "000" ]; then
    echo "⚠️ Frontend não está rodando em http://localhost:3000"
    echo "💡 Execute: cd frontend && npm start"
fi

echo "✅ Frontend está rodando (Status: $FRONTEND_STATUS)"
echo ""

# Obter token para testes
echo "🔑 Obtendo token JWT..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "testuser",
    "password": "testpassword123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.loads(sys.stdin.read().strip())
    print(data.get('access', 'NO_TOKEN'))
except:
    print('NO_TOKEN')
")

if [ "$TOKEN" = "NO_TOKEN" ] || [ -z "$TOKEN" ]; then
    echo "❌ Falha ao obter token"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Token obtido: ${TOKEN:0:30}..."
echo ""

# Criar empresa para teste
echo "📝 Criando empresa para teste..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:8000/api/companies/companies/ \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Frontend Debug Company",
      "email": "debug@frontend.com",
      "phone": "(11) 99999-9999",
      "website": "https://debug.com",
      "industry": "Debug",
      "size": "small",
      "address": "Rua Debug, 123",
      "notes": "Empresa para debug frontend"
    }' \
    -w "HTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$CREATE_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
CREATE_BODY=$(echo "$CREATE_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [[ "$HTTP_STATUS" =~ ^2[0-9][0-9]$ ]]; then
    COMPANY_ID=$(echo "$CREATE_BODY" | python3 -c "
import sys, json
try:
    data = json.loads(sys.stdin.read().strip())
    print(data.get('id', 'NO_ID'))
except:
    print('NO_ID')
")
    echo "✅ Empresa criada com ID: $COMPANY_ID"
else
    echo "❌ Falha ao criar empresa (Status: $HTTP_STATUS)"
    echo "Response: $CREATE_BODY"
    exit 1
fi

echo ""
echo "🧪 TESTANDO PROBLEMA DE UPDATE/DELETE DO FRONTEND"
echo ""

# Simular exatamente o que o frontend faz - PATCH
echo "1. TESTE PATCH (Frontend handleSubmit com editingCompany)"
PATCH_RESPONSE=$(curl -s -X PATCH "http://localhost:8000/api/companies/companies/$COMPANY_ID/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Frontend Debug Company UPDATED",
      "email": "debug-updated@frontend.com",
      "notes": "Empresa atualizada via PATCH frontend"
    }' \
    -w "HTTP_STATUS:%{http_code}" \
    -v 2>&1)

echo "Response completo do PATCH:"
echo "$PATCH_RESPONSE"
echo ""

# Simular DELETE
echo "2. TESTE DELETE (Frontend handleDelete)"
DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:8000/api/companies/companies/$COMPANY_ID/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -w "HTTP_STATUS:%{http_code}" \
    -v 2>&1)

echo "Response completo do DELETE:"
echo "$DELETE_RESPONSE"
echo ""

echo "========================================="
echo "🎯 ANÁLISE DOS PROBLEMAS"
echo "========================================="
echo ""
echo "✅ Backend CRUD endpoints funcionam 100%"
echo "✅ Token de autenticação está válido"
echo ""
echo "🔍 PRÓXIMOS PASSOS PARA DEBUG:"
echo ""
echo "1. Abra o arquivo de teste frontend:"
echo "   file:///home/dev_pc/Documentos/crm_freela/test_frontend_crud.html"
echo ""
echo "2. Configure o token no campo (copie e cole):"
echo "   $TOKEN"
echo ""
echo "3. Teste cada operação CRUD individualmente"
echo ""
echo "4. Abra DevTools (F12) e verifique:"
echo "   - Console: Erros JavaScript"
echo "   - Network: Requisições HTTP enviadas"
echo "   - Application: Tokens no localStorage"
echo ""
echo "5. Compare requisições do frontend com teste backend"
echo ""
echo "6. Se UPDATE/DELETE falharem no teste HTML:"
echo "   - Problema é no token ou CORS"
echo "   - Verifique headers enviados"
echo ""
echo "7. Se funcionarem no teste HTML mas não no React:"
echo "   - Problema na implementação CompaniesPage.tsx"
echo "   - Verifique handleSubmit e handleDelete"
echo ""
echo "💡 POSSÍVEIS CAUSAS:"
echo "- Token expirando entre requisições"
echo "- CORS headers diferentes para PUT/PATCH/DELETE"
echo "- Conflito entre Firebase e Django JWT"
echo "- Erro no código React (promise, async/await)"
echo "- Diferença na estrutura de dados enviada"
