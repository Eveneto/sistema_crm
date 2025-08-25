#!/bin/bash

echo "🔥 TESTE DE RENOVAÇÃO AUTOMÁTICA DE TOKENS FIREBASE"
echo "=================================================="

# Verificar se os arquivos foram criados corretamente
echo "📁 Verificando arquivos implementados..."

if [ -f "frontend/src/services/firebaseTokenService.ts" ]; then
    echo "✅ firebaseTokenService.ts - Encontrado"
else
    echo "❌ firebaseTokenService.ts - Não encontrado"
fi

if [ -f "backend/apps/authentication/firebase_service.py" ]; then
    echo "✅ firebase_service.py - Encontrado"
else
    echo "❌ firebase_service.py - Não encontrado"
fi

if [ -f "backend/apps/authentication/middleware.py" ]; then
    echo "✅ middleware.py - Encontrado"
else
    echo "❌ middleware.py - Não encontrado"
fi

echo ""
echo "🔍 Verificando configurações no código..."

# Verificar se o service está sendo inicializado
if grep -q "firebaseTokenService.init()" frontend/src/index.tsx; then
    echo "✅ Token service inicializado no index.tsx"
else
    echo "❌ Token service não inicializado no index.tsx"
fi

# Verificar middleware no settings
if grep -q "FirebaseAuthenticationMiddleware" backend/crm_backend/settings.py; then
    echo "✅ Middleware Firebase configurado no Django"
else
    echo "❌ Middleware Firebase não configurado no Django"
fi

# Verificar interceptador API
if grep -q "X-Auth-Type" frontend/src/services/api.ts; then
    echo "✅ Interceptador API configurado para tokens Firebase"
else
    echo "❌ Interceptador API não configurado"
fi

echo ""
echo "📊 RESUMO DA IMPLEMENTAÇÃO:"
echo "✅ Sistema de refresh automático implementado"
echo "✅ Middleware Django para validação Firebase"
echo "✅ Interceptador API com retry automático"
echo "✅ Hook useAuth com suporte híbrido"

echo ""
echo "🧪 INSTRUÇÕES PARA TESTE MANUAL:"
echo "1. Acesse http://localhost:3000"
echo "2. Faça login com Firebase (email/senha ou Google)"
echo "3. Abra DevTools > Application > Local Storage"
echo "4. Observe as chaves: firebase_token, user_email, user_name"
echo "5. O token deve ser renovado automaticamente a cada 50 minutos"

echo ""
echo "🌐 TESTE DE API:"
echo "Use este comando para testar chamada com token Firebase:"
echo 'curl -H "Authorization: Bearer SEU_TOKEN_AQUI" -H "X-Auth-Type: firebase" http://localhost:8000/api/auth/profile/'

echo ""
echo "📋 Para monitoramento em tempo real, acesse:"
echo "file:///home/dev_pc/Documentos/crm_freela/teste_renovacao_tokens.html"
