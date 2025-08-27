#!/bin/bash
echo "=== Django JWT Token Test ==="
echo ""

# Verificar se o backend está rodando
echo "1. Verificando se o backend está rodando..."
if curl -s http://localhost:8000/api/auth/login/ > /dev/null 2>&1; then
    echo "✅ Backend está respondendo"
else
    echo "❌ Backend não está respondendo"
    echo "   Por favor, certifique-se que o backend está rodando em http://localhost:8000"
    exit 1
fi

echo ""
echo "2. Tentando fazer login para obter token..."
echo ""

# Fazer login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpassword123"
  }')

echo "Response do login:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

echo ""
echo "3. Verificando se conseguimos extrair o token..."

# Tentar extrair o token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access', 'NO_TOKEN'))" 2>/dev/null)

if [ "$TOKEN" = "NO_TOKEN" ] || [ -z "$TOKEN" ]; then
    echo "❌ Não foi possível obter o token"
    echo ""
    echo "Vamos tentar criar um usuário de teste primeiro..."
    
    # Criar usuário de teste
    cd /home/dev_pc/Documentos/crm_freela && source .venv/bin/activate && cd backend
    python manage.py shell --command="
from django.contrib.auth.models import User
try:
    user = User.objects.get(username='testuser')
    print(f'Usuário já existe: {user.username}')
except User.DoesNotExist:
    user = User.objects.create_user('testuser', 'test@example.com', 'testpassword123')
    print(f'Usuário criado: {user.username}')
print(f'Total de usuários: {User.objects.count()}')
"
    
    echo ""
    echo "Tentando login novamente..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
      -H "Content-Type: application/json" \
      -d '{
        "username": "testuser",
        "password": "testpassword123"
      }')
    
    echo "Response do segundo login:"
    echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access', 'NO_TOKEN'))" 2>/dev/null)
fi

if [ "$TOKEN" != "NO_TOKEN" ] && [ -n "$TOKEN" ]; then
    echo "✅ Token obtido com sucesso!"
    echo ""
    echo "Token: $TOKEN"
    echo ""
    echo "4. Testando o token com a API de companies..."
    
    API_RESPONSE=$(curl -s -X GET http://localhost:8000/api/companies/companies/ \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    echo "Response da API:"
    echo "$API_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$API_RESPONSE"
    
    echo ""
    echo "5. INSTRUÇÕES PARA O FRONTEND:"
    echo "   - Abra o console do navegador (F12)"
    echo "   - Execute: localStorage.setItem('token', '$TOKEN')"
    echo "   - Recarregue a página"
    echo "   - Tente criar uma company novamente"
    
else
    echo "❌ Falha ao obter token"
    echo "Verifique se o usuário e senha estão corretos no backend"
fi
