#!/bin/bash
echo "=== DIAGNÓSTICO COMPLETO DE AUTENTICAÇÃO ==="
echo ""

# Verificar status dos serviços
echo "1. 🔍 Verificando serviços rodando..."
BACKEND_PID=$(ps aux | grep "runserver 8000" | grep -v grep | awk '{print $2}' | head -1)
FRONTEND_PID=$(ps aux | grep "npm start" | grep -v grep | awk '{print $2}' | head -1)

if [ -n "$BACKEND_PID" ]; then
    echo "✅ Backend rodando (PID: $BACKEND_PID)"
else
    echo "❌ Backend NÃO está rodando"
fi

if [ -n "$FRONTEND_PID" ]; then
    echo "✅ Frontend rodando (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend NÃO está rodando"
fi

echo ""
echo "2. 🔑 Testando login e obtendo novo token..."

# Login e obter token
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpassword123"
  }')

echo "Response do login:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extrair token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access', 'NO_TOKEN'))" 2>/dev/null)

if [ "$TOKEN" != "NO_TOKEN" ] && [ -n "$TOKEN" ]; then
    echo ""
    echo "3. ✅ Token obtido!"
    
    # Decodificar token para ver expiração
    echo ""
    echo "4. 📊 Analisando token..."
    echo "$TOKEN" | python3 -c "
import sys
import json
import base64
from datetime import datetime

token = sys.stdin.read().strip()
try:
    # Decodificar payload
    payload_b64 = token.split('.')[1]
    # Adicionar padding se necessário
    payload_b64 += '=' * (4 - len(payload_b64) % 4)
    payload = json.loads(base64.b64decode(payload_b64))
    
    exp_timestamp = payload.get('exp', 0)
    exp_datetime = datetime.fromtimestamp(exp_timestamp)
    now = datetime.now()
    
    print(f'👤 User ID: {payload.get(\"user_id\", \"unknown\")}')
    print(f'⏰ Expira em: {exp_datetime}')
    print(f'🕐 Agora: {now}')
    print(f'✅ Válido: {now < exp_datetime}')
    
    # Tempo restante
    if now < exp_datetime:
        time_left = exp_datetime - now
        minutes_left = int(time_left.total_seconds() / 60)
        print(f'⌛ Tempo restante: {minutes_left} minutos')
except Exception as e:
    print(f'❌ Erro decodificando token: {e}')
"

    echo ""
    echo "5. 🧪 Testando API de companies..."
    
    # Testar GET
    echo "📥 GET /api/companies/companies/:"
    GET_RESPONSE=$(curl -s -X GET http://localhost:8000/api/companies/companies/ \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -w "HTTP_STATUS:%{http_code}")
    
    HTTP_STATUS=$(echo "$GET_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$GET_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ Status: $HTTP_STATUS"
        echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
    else
        echo "❌ Status: $HTTP_STATUS"
        echo "$RESPONSE_BODY"
    fi
    
    echo ""
    echo "📤 POST /api/companies/companies/ (criar nova company):"
    POST_RESPONSE=$(curl -s -X POST http://localhost:8000/api/companies/companies/ \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Test Company via Script",
        "email": "test@script.com", 
        "phone": "11999999999",
        "industry": "Testing"
      }' \
      -w "HTTP_STATUS:%{http_code}")
    
    HTTP_STATUS=$(echo "$POST_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$POST_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    if [ "$HTTP_STATUS" = "201" ]; then
        echo "✅ Status: $HTTP_STATUS (Company criada!)"
        echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
    else
        echo "❌ Status: $HTTP_STATUS"
        echo "$RESPONSE_BODY"
    fi
    
    echo ""
    echo "🎯 INSTRUÇÕES PARA O FRONTEND:"
    echo "1. Abra http://localhost:3000 no navegador"
    echo "2. Abra o console (F12)"
    echo "3. Execute: localStorage.setItem('token', '$TOKEN')"
    echo "4. Recarregue a página e teste criar uma company"
    echo ""
    echo "💡 Se ainda não funcionar, o problema está no FRONTEND, não na API!"
    
else
    echo "❌ Falha ao obter token - verifique credenciais"
fi
