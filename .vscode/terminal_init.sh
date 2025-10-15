#!/bin/bash

# Carrega as configurações padrão do bash
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
fi

# Executa o script de ativação do ambiente virtual
if [ -f ".vscode/activate_venv.sh" ]; then
    source ".vscode/activate_venv.sh"
fi
