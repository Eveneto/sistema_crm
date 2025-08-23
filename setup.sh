#!/bin/bash

# CRM Setup Script
echo "🏢 CRM System - Setup Script"
echo "=============================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"

# Criar arquivos .env se não existirem
echo "📝 Configurando arquivos de ambiente..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Criado backend/.env"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Criado frontend/.env"
fi

# Executar Docker Compose
echo "🐳 Iniciando containers..."
docker-compose up --build -d

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📋 Serviços disponíveis:"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:8000"
echo "• API Documentation: http://localhost:8000/swagger/"
echo "• Admin Panel: http://localhost:8000/admin/"
echo ""
echo "📊 Banco de dados:"
echo "• MySQL: localhost:3306"
echo "• Redis: localhost:6379"
echo ""
echo "🛠️ Comandos úteis:"
echo "• Parar: docker-compose down"
echo "• Logs: docker-compose logs -f"
echo "• Rebuild: docker-compose up --build"
echo ""
echo "✨ Bom desenvolvimento!"
