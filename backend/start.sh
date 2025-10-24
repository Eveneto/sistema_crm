#!/bin/bash
# Script de inicialização para executar tanto ASGI (WebSocket) quanto WSGI (HTTP) simultaneamente

set -e

echo "🚀 Iniciando CRM Backend com suporte completo a WebSocket..."

# Executar migrações
echo "📦 Executando migrações..."
python manage.py migrate --noinput

# Coletar arquivos estáticos
echo "📁 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput --clear

# Iniciar Daphne (ASGI) para WebSocket em background
echo "🔌 Iniciando Daphne (WebSocket) na porta 8001..."
daphne -b 0.0.0.0 -p 8001 crm_backend.asgi:application &

# Aguardar um momento para Daphne iniciar
sleep 3

# Verificar se Daphne está rodando (simplificado)
sleep 2
echo "✅ Daphne (WebSocket) iniciado com sucesso"

# Iniciar Gunicorn (WSGI) para HTTP na porta principal
echo "🌐 Iniciando Gunicorn (HTTP) na porta 8000..."
exec gunicorn crm_backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-class sync \
    --timeout 30 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --access-logfile - \
    --error-logfile -
