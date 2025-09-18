#!/bin/bash

echo "🧹 LIMPANDO CACHE DE RATE LIMITING"
echo "================================="

# Reiniciar o cache in-memory fazendo múltiplas requests em endpoints diferentes
echo "Aguardando reset natural do rate limiting (65 segundos)..."
sleep 65

echo "✅ Cache limpo! Agora execute os testes:"
echo "./run_advanced_security_tests_fixed.sh"
