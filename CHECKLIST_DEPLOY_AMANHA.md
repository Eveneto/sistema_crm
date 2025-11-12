# ✅ Checklist Rápido - Deploy 13/11/2025

## 🚀 Opção 1: Deploy Automático (RECOMENDADO)

### Comando Único:
```bash
cd /home/dev_pc/Documentos/crm_freela2/sistema_crm
./deploy_v2.7.0.sh
```

**O script irá:**
1. ✅ Verificar status do repositório
2. ✅ Adicionar todos os arquivos corretos
3. ✅ Criar commit com mensagem completa
4. ✅ Fazer push para GitHub
5. ✅ Mostrar resumo do deploy

**Tempo estimado:** 2-3 minutos (com confirmações)

---

## 📝 Opção 2: Deploy Manual

### Comandos:
```bash
cd /home/dev_pc/Documentos/crm_freela2/sistema_crm

# 1. Verificar status
git status

# 2. Adicionar arquivos
git add CHAT_*.md CORRECAO_*.md CORRIGIR_*.sh DEBUG_*.md ESPECIFICACAO_*.md
git add FRONTEND_*.md IMPLEMENTACAO_*.md MELHORIA_*.md QUICK_*.md
git add RELATORIO_*.md RESUMO_*.md SOLUCAO_*.md SPRINT3_*.md SPRINT_2_*.md
git add TESTES_*.md CHECKLIST_*.sh DEPLOY_*.md
git add GUIA_TESTES_MANUAIS_STEP_3.md PROGRESS_STEP_2_PERMISSIONS.md
git add SESSION_SUMMARY.md STATUS_FINAL_STEP_2.md VISUAL_SUMMARY.md
git add frontend/package.json frontend/package-lock.json
git add frontend/src/components/chat/
git add frontend/src/pages/
git add frontend/src/redux/slices/
git add frontend/src/services/
git add frontend/src/hooks/
git add frontend/src/styles/crm-components-new.css
git add frontend/src/__tests__/

# 3. Verificar o que será commitado
git status

# 4. Commit
git commit -m "🧪 v2.7.0 - Sprint 3: Testes Unitários Frontend"

# 5. Push
git push origin frontend-refeito
```

**Tempo estimado:** 5-7 minutos

---

## ⚠️ VERIFICAÇÕES IMPORTANTES

### Antes do Push:
- [ ] **NÃO** incluir `backend/db.sqlite3`
- [ ] **NÃO** incluir `CREDENCIAIS_TESTE.md`
- [ ] **NÃO** incluir `.bashrc_daphne`
- [ ] Revisar com `git status`

### Arquivos Críticos a Incluir:
- [ ] `RELATORIO_ERROS_TESTES_SPRINT3.md` ✅
- [ ] `RESUMO_ERROS_TESTES.md` ✅
- [ ] `DEPLOY_GITHUB_13_NOV_2025.md` ✅
- [ ] `deploy_v2.7.0.sh` ✅
- [ ] Todos os testes em `frontend/src/__tests__/` ✅
- [ ] Componentes Sprint 3 ✅

---

## 📊 Resumo do que vai para o GitHub

### 📄 Documentação: 36 arquivos
- Relatórios de testes
- Guias de implementação
- Correções e troubleshooting
- Scripts de deploy

### 💻 Código: 23 arquivos
- 4 novos componentes
- 4 arquivos de teste
- 1 novo hook
- 1 novo serviço
- 13 arquivos modificados

### 🧪 Testes: 79 test cases
- MembersModal: 28 testes
- FileUpload: 21 testes
- useNotifications: 15 testes
- chatSlice.members: 15 testes

---

## 🎯 Depois do Push

### Opcional - Criar Release:
1. Acesse: https://github.com/Eveneto/sistema_crm/releases/new
2. Tag: `v2.7.0`
3. Título: **v2.7.0 - Sprint 3: Testes Unitários Frontend**
4. Copie o conteúdo do arquivo `DEPLOY_GITHUB_13_NOV_2025.md`

### Verificar:
```bash
# Ver commit no GitHub
https://github.com/Eveneto/sistema_crm/commits/frontend-refeito

# Ver arquivos alterados
https://github.com/Eveneto/sistema_crm/compare
```

---

## 📞 Se algo der errado

### Desfazer último commit (antes do push):
```bash
git reset --soft HEAD~1
```

### Remover arquivo do stage:
```bash
git reset HEAD <arquivo>
```

### Ver diferenças:
```bash
git diff
git diff --staged
```

---

## ✅ Status Final Esperado

```
✅ Branch: frontend-refeito atualizada
✅ Commit: v2.7.0 - Sprint 3 Tests
✅ Arquivos: 59 adicionados/modificados
✅ Push: Enviado para GitHub
✅ Documentação: Completa
```

---

**Preparado em:** 12/11/2025  
**Para executar em:** 13/11/2025  
**Método recomendado:** Script automático (`./deploy_v2.7.0.sh`)
