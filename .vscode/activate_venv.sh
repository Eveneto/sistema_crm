#!/bin/bash

# Script para ativar automaticamente o ambiente virtual
# Este script é executado quando um novo terminal é aberto no VS Code

PROJECT_ROOT="/home/dev_pc/Documentos/crm_freela2/sistema_crm"
VENV_PATH="$PROJECT_ROOT/.venv"

# Verifica se estamos no diretório do projeto
if [[ "$PWD" == "$PROJECT_ROOT"* ]]; then
    # Verifica se o ambiente virtual existe
    if [ -d "$VENV_PATH" ]; then
        # Verifica se o ambiente virtual não está já ativado
        if [[ "$VIRTUAL_ENV" != "$VENV_PATH" ]]; then
            echo "🐍 Ativando ambiente virtual Python..."
            source "$VENV_PATH/bin/activate"
            echo "✅ Ambiente virtual ativado: $(python --version)"
            echo "📁 Diretório do projeto: $PROJECT_ROOT"
            echo ""
            echo "🚀 Comandos úteis:"
            echo "   cd backend && python manage.py runserver  # Iniciar backend Django"
            echo "   cd frontend && npm start                  # Iniciar frontend React"
            echo "   deactivate                                # Desativar ambiente virtual"
            echo ""
        fi
    else
        echo "⚠️  Ambiente virtual não encontrado em $VENV_PATH"
        echo "   Execute: python3 -m venv .venv"
    fi
fi
