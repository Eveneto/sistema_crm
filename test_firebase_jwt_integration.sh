#!/bin/bash
echo "=== TESTE DE INTEGRAÇÃO FIREBASE + JWT ==="
echo ""

echo "🧹 Limpeza completa de tokens (simulando estado fresh)..."
echo ""

# Test no navegador usando JavaScript
echo "Execute estes comandos no console do navegador (F12):"
echo ""
echo "// 1. Limpar todos os tokens"
echo "localStorage.clear();"
echo "sessionStorage.clear();"
echo ""
echo "// 2. Verificar estado limpo"
echo "console.log('localStorage:', {...localStorage});"
echo "console.log('sessionStorage:', {...sessionStorage});"
echo ""

echo "🔧 Status do sistema após correções:"
echo "✅ API prioriza Django JWT sobre Firebase"
echo "✅ Firebase refresh reduzido para 55min (mais conservador)"
echo "✅ Firebase pausado quando JWT está ativo"
echo "✅ Melhor tratamento de quota exceeded"
echo "✅ Logs detalhados para debug"
echo ""

echo "📋 Fluxo esperado após correções:"
echo "1. Login Django → JWT armazenado → Firebase pausado"
echo "2. API usa JWT para todas as requisições"
echo "3. Se JWT falha → tenta Firebase (se disponível)"
echo "4. Se ambos falharem → redirect para login"
echo ""

echo "🧪 TESTES RECOMENDADOS:"
echo ""
echo "TESTE 1: Login Django puro"
echo "- Limpe todos os tokens"
echo "- Faça login com testuser/testpassword123"
echo "- Verifique se funciona sem erros Firebase"
echo ""

echo "TESTE 2: Token manual (bypass login)"
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username_or_email": "testuser", "password": "testpassword123"}' | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access', 'NO_TOKEN'))" 2>/dev/null)

if [ "$TOKEN" != "NO_TOKEN" ] && [ -n "$TOKEN" ]; then
    echo "✅ Token obtido via API"
    echo ""
    echo "Execute no console do navegador:"
    echo "localStorage.setItem('token', '$TOKEN');"
    echo "location.reload();"
    echo ""
    echo "Depois teste acessar /companies"
else
    echo "❌ Não foi possível obter token via API"
fi

echo ""
echo "🔍 Monitoramento:"
echo "- Abra DevTools (F12) → Console"
echo "- Procure por logs: '🔐 Usando token Django JWT' ou '🔐 Usando token Firebase'"
echo "- Verifique se não há mais 'quota exceeded' errors"
echo ""

echo "⚠️ Se ainda houver problemas:"
echo "1. Verifique se backend está rodando"
echo "2. Limpe completamente localStorage/sessionStorage"
echo "3. Recarregue a página completamente"
echo "4. Evite alternar muito rápido entre Firebase/JWT"
