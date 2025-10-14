#!/bin/bash

# 🧹 LIMPEZA TOTAL CSS - MIGRAÇÃO BOOTSTRAP
# Backup e remoção de todos os CSS antigos

FRONTEND_DIR="/home/dev_pc/Documentos/crm_freela/frontend/src"
BACKUP_DIR="/home/dev_pc/Documentos/crm_freela/css_backup_$(date +%Y%m%d_%H%M%S)"

echo "🔄 Iniciando limpeza total de CSS..."

# 1. Criar backup
echo "📦 Criando backup em: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Backup de todos os CSS (exceto os novos do Bootstrap)
cd "$FRONTEND_DIR"
find . -name "*.css" -not -name "bootstrap-theme.css" -exec cp --parents {} "$BACKUP_DIR" \;

echo "✅ Backup criado com $(find "$BACKUP_DIR" -name "*.css" | wc -l) arquivos"

# 2. Listar arquivos que serão removidos
echo "🗑️ Arquivos CSS que serão removidos:"
find . -name "*.css" -not -name "bootstrap-theme.css"

# 3. Remover CSS antigos (comentado por segurança)
# find . -name "*.css" -not -name "bootstrap-theme.css" -delete

echo "⚠️ SCRIPT PREPARADO - Execute manualmente a remoção se desejar:"
echo "cd $FRONTEND_DIR && find . -name \"*.css\" -not -name \"bootstrap-theme.css\" -delete"

echo ""
echo "📋 PLANO DE RECONSTRUÇÃO:"
echo "1. Manter apenas bootstrap-theme.css"
echo "2. Atualizar imports no App.tsx"
echo "3. Usar apenas classes Bootstrap nos componentes"
echo "4. CSS custom apenas para layout específico"

echo ""
echo "✨ RESULTADO ESPERADO:"
echo "- Bundle 70% menor"
echo "- Zero conflitos de CSS"
echo "- Manutenção muito mais fácil"
echo "- Performance melhorada"
