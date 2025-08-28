#!/bin/bash
echo "=== TESTE COMPLETO CRUD EMPRESAS ==="
echo ""

# Obter token válido
echo "🔑 Obtendo token JWT..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "testuser",
    "password": "testpassword123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access', 'NO_TOKEN'))" 2>/dev/null)

if [ "$TOKEN" = "NO_TOKEN" ] || [ -z "$TOKEN" ]; then
    echo "❌ Falha ao obter token"
    exit 1
fi

echo "✅ Token obtido: ${TOKEN:0:20}..."
echo ""

# Função para fazer requisições com logs detalhados
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local desc=$4
    
    echo "🧪 TESTE: $desc"
    echo "📡 $method $url"
    
    if [ -n "$data" ]; then
        echo "📦 Data: $data"
        RESPONSE=$(curl -s -X $method "http://localhost:8000$url" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "HTTP_STATUS:%{http_code}")
    else
        RESPONSE=$(curl -s -X $method "http://localhost:8000$url" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -w "HTTP_STATUS:%{http_code}")
    fi
    
    HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    echo "📊 Status: $HTTP_STATUS"
    
    if [[ "$HTTP_STATUS" =~ ^2[0-9][0-9]$ ]]; then
        echo "✅ SUCESSO"
        echo "📋 Response:"
        echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
    else
        echo "❌ ERRO"
        echo "📋 Response:"
        echo "$RESPONSE_BODY"
    fi
    echo ""
    echo "---"
    echo ""
    
    # Retorna o response body para uso posterior
    echo "$RESPONSE_BODY"
}

echo "=== TESTE 1: CREATE (POST) ==="
CREATE_RESPONSE=$(test_endpoint "POST" "/api/companies/companies/" '{
  "name": "Empresa Teste CRUD",
  "email": "crud@test.com",
  "phone": "(11) 99999-0001",
  "website": "https://crud-test.com",
  "industry": "Teste CRUD",
  "size": "small",
  "address": "Rua do Teste CRUD, 123",
  "notes": "Empresa criada para teste de CRUD completo"
}' "Criar nova empresa")

# Extrair ID da empresa criada
COMPANY_ID=$(echo "$CREATE_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.loads(sys.stdin.read().strip())
    print(data.get('id', 'NO_ID'))
except:
    print('NO_ID')
")

if [ "$COMPANY_ID" = "NO_ID" ] || [ -z "$COMPANY_ID" ]; then
    echo "❌ Não foi possível obter ID da empresa criada"
    echo "Response: $CREATE_RESPONSE"
    
    # Tentar extrair ID manualmente
    COMPANY_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
    
    if [ -n "$COMPANY_ID" ]; then
        echo "✅ ID extraído manualmente: $COMPANY_ID"
    else
        exit 1
    fi
fi

echo "🏢 ID da empresa criada: $COMPANY_ID"
echo ""

echo "=== TESTE 2: READ (GET) ==="
test_endpoint "GET" "/api/companies/companies/" "" "Listar todas as empresas"

echo "=== TESTE 3: READ BY ID (GET) ==="
test_endpoint "GET" "/api/companies/companies/$COMPANY_ID/" "" "Buscar empresa específica por ID"

echo "=== TESTE 4: UPDATE PARCIAL (PATCH) ==="
test_endpoint "PATCH" "/api/companies/companies/$COMPANY_ID/" '{
  "name": "Empresa Teste CRUD ATUALIZADA",
  "phone": "(11) 99999-0002",
  "notes": "Empresa atualizada via PATCH"
}' "Atualização parcial da empresa"

echo "=== TESTE 5: UPDATE COMPLETO (PUT) ==="
test_endpoint "PUT" "/api/companies/companies/$COMPANY_ID/" '{
  "name": "Empresa Teste CRUD PUT",
  "email": "crud-put@test.com",
  "phone": "(11) 99999-0003",
  "website": "https://crud-put-test.com",
  "industry": "Teste PUT",
  "size": "medium",
  "address": "Rua do Teste PUT, 456",
  "notes": "Empresa atualizada via PUT completo"
}' "Atualização completa da empresa"

echo "=== TESTE 6: VERIFICAÇÃO APÓS UPDATES ==="
test_endpoint "GET" "/api/companies/companies/$COMPANY_ID/" "" "Verificar dados após updates"

echo "=== TESTE 7: BUSCA (GET com query) ==="
test_endpoint "GET" "/api/companies/companies/search/?q=CRUD" "" "Buscar empresas com termo 'CRUD'"

echo "=== TESTE 8: ESTATÍSTICAS ==="
test_endpoint "GET" "/api/companies/companies/stats/" "" "Obter estatísticas das empresas"

echo "=== TESTE 9: DELETE ==="
test_endpoint "DELETE" "/api/companies/companies/$COMPANY_ID/" "" "Deletar empresa"

echo "=== TESTE 10: VERIFICAÇÃO APÓS DELETE ==="
VERIFY_DELETE=$(test_endpoint "GET" "/api/companies/companies/$COMPANY_ID/" "" "Verificar se empresa foi deletada (deve retornar 404)")

echo ""
echo "========================================="
echo "🎯 RESUMO DOS TESTES"
echo "========================================="
echo ""
echo "✅ CREATE: Empresa criada com ID $COMPANY_ID"
echo "✅ READ: Listagem e busca por ID"
echo "🔄 PATCH: Atualização parcial"
echo "🔄 PUT: Atualização completa" 
echo "❌ DELETE: Remoção da empresa"
echo ""
echo "💡 PARA TESTE MANUAL NO FRONTEND:"
echo "1. Execute no console: localStorage.setItem('token', '$TOKEN')"
echo "2. Acesse http://localhost:3000/companies"
echo "3. Teste criar, editar e deletar empresas"
echo ""
echo "🔍 Se algum teste falhou, verifique:"
echo "- Backend está rodando em http://localhost:8000"
echo "- Usuário testuser existe e tem permissões"
echo "- Não há conflitos de CORS"
