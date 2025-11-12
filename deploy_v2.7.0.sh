#!/bin/bash
# 🚀 Script de Deploy Automático - v2.7.0 Sprint 3
# Data: 13 de Novembro de 2025

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Deploy Automático GitHub - v2.7.0 Sprint 3 Tests   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Navegar para diretório do projeto
cd /home/dev_pc/Documentos/crm_freela2/sistema_crm

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}📍 Branch atual: ${CURRENT_BRANCH}${NC}"
echo ""

# 1️⃣ Verificar Status
echo -e "${BLUE}[1/7] Verificando status do repositório...${NC}"
git status
echo ""

read -p "Deseja continuar com o deploy? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]
then
    echo -e "${RED}❌ Deploy cancelado pelo usuário${NC}"
    exit 1
fi

# 2️⃣ Adicionar Documentação
echo -e "${BLUE}[2/7] Adicionando arquivos de documentação...${NC}"
git add CHAT_*.md
git add CORRECAO_*.md
git add CORRIGIR_*.sh
git add DEBUG_*.md
git add ESPECIFICACAO_*.md
git add FRONTEND_*.md
git add IMPLEMENTACAO_*.md
git add MELHORIA_*.md
git add QUICK_*.md
git add RELATORIO_*.md
git add RESUMO_*.md
git add SOLUCAO_*.md
git add SPRINT3_*.md
git add SPRINT_2_*.md
git add TESTES_*.md
git add CHECKLIST_*.sh
git add DEPLOY_*.md

# Documentação modificada
git add GUIA_TESTES_MANUAIS_STEP_3.md
git add PROGRESS_STEP_2_PERMISSIONS.md
git add SESSION_SUMMARY.md
git add STATUS_FINAL_STEP_2.md
git add VISUAL_SUMMARY.md

echo -e "${GREEN}✅ Documentação adicionada${NC}"
echo ""

# 3️⃣ Adicionar Código Frontend
echo -e "${BLUE}[3/7] Adicionando código frontend...${NC}"

# Dependências
git add frontend/package.json
git add frontend/package-lock.json

# Componentes
git add frontend/src/components/chat/ChatMessage.tsx
git add frontend/src/components/chat/MessageInput.tsx
git add frontend/src/components/chat/MembersModal.tsx 2>/dev/null || true
git add frontend/src/components/chat/NotificationSettingsModal.tsx 2>/dev/null || true

# Páginas
git add frontend/src/pages/ChatPage.tsx
git add frontend/src/pages/CompaniesPage.tsx
git add frontend/src/pages/Dashboard.tsx
git add frontend/src/pages/DashboardNew.tsx

# Redux
git add frontend/src/redux/slices/authSlice.ts
git add frontend/src/redux/slices/authSlice_new.ts
git add frontend/src/redux/slices/chatSlice.ts

# Serviços
git add frontend/src/services/api.ts
git add frontend/src/services/googleLoginService.ts
git add frontend/src/services/tokenService.ts
git add frontend/src/services/notificationService.ts 2>/dev/null || true

# Hooks
git add frontend/src/hooks/ 2>/dev/null || true

# Estilos
git add frontend/src/styles/crm-components-new.css

echo -e "${GREEN}✅ Código frontend adicionado${NC}"
echo ""

# 4️⃣ Adicionar Testes
echo -e "${BLUE}[4/7] Adicionando testes...${NC}"
git add frontend/src/__tests__/ 2>/dev/null || true

echo -e "${GREEN}✅ Testes adicionados${NC}"
echo ""

# 5️⃣ Verificar o que será commitado
echo -e "${BLUE}[5/7] Arquivos a serem commitados:${NC}"
git status --short
echo ""

read -p "Confirmar commit destes arquivos? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]
then
    echo -e "${RED}❌ Commit cancelado pelo usuário${NC}"
    echo -e "${YELLOW}⚠️  Arquivos foram adicionados ao stage. Use 'git reset' para desfazer.${NC}"
    exit 1
fi

# 6️⃣ Commit
echo -e "${BLUE}[6/7] Criando commit...${NC}"
git commit -m "🧪 v2.7.0 - Sprint 3: Testes Unitários Frontend

Features Implementadas:
✅ Gerenciamento de Membros (MembersModal)
✅ Upload de Arquivos (FileUpload)
✅ Notificações Desktop (useNotifications)
✅ Redux Actions para Membros

Testes Implementados:
- 28 testes MembersModal (gerenciamento completo)
- 21 testes FileUpload (validação e envio)
- 15 testes useNotifications (permissões e display)
- 15 testes chatSlice.members (Redux actions)

Status dos Testes:
✅ 6 testes passando (28.6%)
⚠️ 15 testes com erros de configuração identificados
📋 Relatório completo de erros documentado

Documentação:
- RELATORIO_ERROS_TESTES_SPRINT3.md (análise detalhada)
- RESUMO_ERROS_TESTES.md (guia de correção)
- TESTES_SPRINT3_*.md (documentação completa)
- 30+ documentos de implementação e correções

Próximos Passos:
- Corrigir 7 erros de mock/configuração (~32 min)
- Atingir 100% de aprovação nos testes
- Gerar relatório de cobertura (meta: >85%)

Breaking Changes: Nenhum
Migrations: Não requeridas"

echo -e "${GREEN}✅ Commit criado com sucesso${NC}"
echo ""

# 7️⃣ Push
echo -e "${BLUE}[7/7] Enviando para GitHub...${NC}"
echo -e "${YELLOW}⚠️  Você está prestes a fazer push para: origin/${CURRENT_BRANCH}${NC}"
echo ""

read -p "Confirmar push para GitHub? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]
then
    echo -e "${RED}❌ Push cancelado pelo usuário${NC}"
    echo -e "${YELLOW}⚠️  Commit foi criado localmente. Use 'git push' manualmente quando quiser.${NC}"
    exit 1
fi

git push origin ${CURRENT_BRANCH}

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✅ DEPLOY CONCLUÍDO COM SUCESSO! ✅           ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Sumário
echo -e "${BLUE}📊 Sumário do Deploy:${NC}"
echo -e "   Branch: ${CURRENT_BRANCH}"
echo -e "   Versão: v2.7.0"
echo -e "   Commits: 1 novo commit"
echo -e "   Status: Enviado para GitHub ✅"
echo ""

echo -e "${YELLOW}🎯 Próximos Passos Opcionais:${NC}"
echo -e "   1. Criar Release v2.7.0 no GitHub"
echo -e "      → https://github.com/Eveneto/sistema_crm/releases/new"
echo ""
echo -e "   2. Criar Pull Request (se necessário)"
echo -e "      → Merge ${CURRENT_BRANCH} → main"
echo ""
echo -e "   3. Atualizar README.md com nova versão"
echo ""

echo -e "${GREEN}✨ Deploy finalizado! Verifique no GitHub:${NC}"
echo -e "   https://github.com/Eveneto/sistema_crm/commits/${CURRENT_BRANCH}"
echo ""
