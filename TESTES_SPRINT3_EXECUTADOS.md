# 🎯 Testes Manuais - Sprint 3 (Upload + Notificações)

**Data:** 12/11/2025  
**Tempo Estimado:** 1h20min  
**Testador:** _______________

---

## 📋 Checklist Rápido

| # | Teste | Status | Observações |
|---|-------|--------|-------------|
| 1 | Upload de imagem | ⬜ | |
| 2 | Upload de PDF | ⬜ | |
| 3 | Múltiplos arquivos | ⬜ | |
| 4 | Validação >10MB | ⬜ | |
| 5 | Validação .exe | ⬜ | |
| 6 | Remover preview | ⬜ | |
| 7 | Enviar sem texto | ⬜ | |
| 8 | Permissão notificações | ⬜ | |
| 9 | Configurar notificações | ⬜ | |
| 10 | Receber notificação | ⬜ | |
| 11 | Notificação @menção | ⬜ | |
| 12 | Som notificação | ⬜ | |
| 13 | Desativar notificações | ⬜ | |
| 14 | WebSocket tempo real | ⬜ | |
| 15 | Anexo via WebSocket | ⬜ | |
| 16 | 3 usuários | ⬜ | |
| 17 | Responsivo | ⬜ | |
| 18 | Loading states | ⬜ | |
| 19 | Mensagens erro | ⬜ | |
| 20 | Scroll automático | ⬜ | |

**Total:** ___/20 (**____%**)

---

## 🚀 Setup Inicial

### 1. Verificar Servidores
```bash
# Devem estar rodando:
✅ Django: http://localhost:8000
✅ Daphne: http://localhost:8001  
✅ React: http://localhost:3000
```

### 2. Credenciais
- **Admin:** `admin` / `123456`
- **Membro1:** `member1` / `123456`
- **Membro2:** `member2` / `123456`

### 3. Preparar Arquivos de Teste
- ✅ 1 imagem JPG (< 10MB)
- ✅ 1 PDF (< 10MB)
- ✅ 1 arquivo .docx
- ✅ 1 imagem > 10MB (para testar validação)
- ✅ 1 arquivo .exe (para testar bloqueio)

---

## 📁 UPLOAD DE ARQUIVOS

### ✅ Teste 1: Upload de Imagem

**Passos:**
1. Login: `admin` / `123456`
2. Menu → **Chat**
3. Selecionar ou criar sala
4. Clicar **📎** (clipe)
5. Selecionar imagem JPG/PNG
6. Verificar preview
7. Clicar **Enviar**

**Resultado:**
- [ ] Preview mostra miniatura da imagem
- [ ] Mensagem enviada com sucesso
- [ ] Imagem aparece na lista de mensagens
- [ ] Clique na imagem amplia

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 2: Upload de PDF

**Passos:**
1. Clicar **📎**
2. Selecionar PDF
3. Digitar: "Segue o documento"
4. **Enviar**

**Resultado:**
- [ ] Ícone de PDF no preview
- [ ] Mensagem com texto + anexo
- [ ] Nome do arquivo visível
- [ ] Clique baixa o arquivo

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 3: Múltiplos Arquivos

**Passos:**
1. Clicar **📎**
2. Selecionar 3 arquivos (1 JPG + 1 PDF + 1 DOCX)
3. **Enviar**

**Resultado:**
- [ ] 3 previews aparecem lado a lado
- [ ] Mensagem contém os 3 anexos
- [ ] Todos são clicáveis/baixáveis

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 4: Validação >10MB

**Passos:**
1. Tentar selecionar arquivo > 10MB

**Resultado:**
- [ ] Mensagem de erro: "Arquivo muito grande. Máximo: 10MB"
- [ ] Arquivo NÃO é adicionado ao preview
- [ ] Não é possível enviar

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 5: Validação Tipo .exe

**Passos:**
1. Tentar selecionar arquivo .exe ou .sh

**Resultado:**
- [ ] Mensagem: "Tipo de arquivo não permitido"
- [ ] Arquivo bloqueado
- [ ] Lista de tipos permitidos mostrada

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 6: Remover do Preview

**Passos:**
1. Adicionar 2 arquivos
2. Clicar no **X** de um preview
3. Enviar

**Resultado:**
- [ ] Arquivo removido do preview
- [ ] Apenas 1 arquivo enviado
- [ ] Contagem atualizada

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 7: Enviar Só Arquivo

**Passos:**
1. Adicionar arquivo
2. NÃO digitar texto
3. Enviar

**Resultado:**
- [ ] Mensagem enviada
- [ ] Mostra apenas anexo
- [ ] Sem erro de "campo obrigatório"

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

## 📱 NOTIFICAÇÕES DESKTOP

### ✅ Teste 8: Permissão

**Passos:**
1. Abrir navegador anônimo
2. Login: `admin` / `123456`
3. Menu → **Chat**
4. Aguardar 2 segundos

**Resultado:**
- [ ] Pop-up do navegador pede permissão
- [ ] Mensagem explicativa aparece
- [ ] Botão "Permitir" visível

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 9: Configurar

**Passos:**
1. Clicar ícone **🔔** (sino)
2. Alternar: Ativar/Desativar
3. Alternar: Todas / Apenas menções
4. Alternar: Som ligado/desligado

**Resultado:**
- [ ] Modal abre
- [ ] Todas opções funcionam
- [ ] Status da permissão exibido
- [ ] Configurações salvas

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 10: Receber Notificação

**Setup:**
- **Navegador A:** Login `admin`, ir para Chat
- **Navegador B:** Login `member1`, mesma sala
- **Navegador A:** Minimizar/trocar tab

**Passos:**
1. **B** envia: "Olá, teste!"

**Resultado em A:**
- [ ] Notificação desktop aparece
- [ ] Mostra nome remetente (member1)
- [ ] Mostra texto da mensagem
- [ ] Mostra nome da sala
- [ ] Clique abre a tab

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 11: Notificação @menção

**Setup:**
- Configurar: "@ Apenas menções"
- Minimizar tab

**Passos:**
1. Outro usuário envia: "Oi, tudo bem?"
2. Outro usuário envia: "@admin, veja isso"

**Resultado:**
- [ ] Primeira mensagem NÃO notifica
- [ ] Segunda (@admin) NOTIFICA
- [ ] Notificação não fecha sozinha (requireInteraction)

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 12: Som

**Passos:**
1. Ativar "🔊 Som"
2. Minimizar tab
3. Receber mensagem

**Resultado:**
- [ ] Som toca junto com notificação
- [ ] Som é breve e não irritante
- [ ] Ao desativar, som para

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 13: Desativar

**Passos:**
1. Desativar toggle principal
2. Receber mensagens

**Resultado:**
- [ ] Nenhuma notificação aparece
- [ ] Som não toca
- [ ] Persiste após recarregar

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

## 🔄 WEBSOCKET

### ✅ Teste 14: Tempo Real

**Setup:**
- **Navegador A:** `admin`
- **Navegador B:** `member1`
- Ambos na mesma sala

**Passos:**
1. **B** envia: "Teste WebSocket"

**Resultado em A:**
- [ ] Mensagem aparece INSTANTANEAMENTE (< 1s)
- [ ] Sem recarregar página
- [ ] Ordem cronológica correta
- [ ] Avatar e nome corretos

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 15: Anexo via WebSocket

**Passos:**
1. **B** envia mensagem com imagem

**Resultado em A:**
- [ ] Recebe mensagem + anexo instantaneamente
- [ ] Imagem exibida
- [ ] Arquivo clicável/baixável

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 16: 3 Usuários

**Setup:**
- **A:** `admin`
- **B:** `member1`
- **C:** `member2`
- Todos na mesma sala

**Passos:**
1. Cada um envia mensagem diferente rapidamente

**Resultado:**
- [ ] Todos recebem todas
- [ ] Ordem cronológica correta
- [ ] Nenhuma perdida/duplicada

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

## 🎨 INTERFACE

### ✅ Teste 17: Responsivo

**Passos:**
1. F12 → Device Toolbar (Ctrl+Shift+M)
2. Testar: iPhone SE (375px), iPad (768px), Desktop (1920px)

**Resultado:**
- [ ] Layout se adapta
- [ ] Botões clicáveis
- [ ] Preview não transborda
- [ ] Sem scroll horizontal

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 18: Loading

**Passos:**
1. Enviar mensagem
2. Fazer upload de arquivo grande (8MB)

**Resultado:**
- [ ] Spinner durante upload
- [ ] Botão desabilitado
- [ ] Mensagem aparece após conclusão

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 19: Erros

**Passos:**
1. Desligar backend (Ctrl+C)
2. Tentar enviar mensagem

**Resultado:**
- [ ] Mensagem de erro clara
- [ ] Toast/notificação aparece
- [ ] Texto não some do input
- [ ] Sugestão de ação

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

### ✅ Teste 20: Scroll

**Passos:**
1. Sala com muitas mensagens
2. Scroll até o topo
3. Receber nova mensagem

**Resultado:**
- [ ] Se no fim: scroll desce automaticamente
- [ ] Se no topo: mantém posição
- [ ] Indicador "Nova mensagem" aparece

**Status:** ⬜ PASSOU | ⬜ FALHOU  
**Notas:** _______________________

---

## 📊 Resultado Final

### Estatísticas
- **Total de testes:** 20
- **Passaram:** ___ (___%)
- **Falharam:** ___ (___%)
- **Bugs críticos:** ___ 

### Aprovação

**Critérios:**
- ✅ Mínimo 18/20 testes (90%)
- ✅ Zero bugs críticos

**Resultado:** ⬜ APROVADO | ⬜ REPROVADO

**Motivo (se reprovado):**
_________________________________
_________________________________

---

## 🐛 Bugs Encontrados

### Bug #1
**Título:** _______________________
**Severidade:** ⬜ Crítico | ⬜ Alto | ⬜ Médio | ⬜ Baixo
**Teste:** Teste #___
**Descrição:**
_________________________________
_________________________________

### Bug #2
**Título:** _______________________
**Severidade:** ⬜ Crítico | ⬜ Alto | ⬜ Médio | ⬜ Baixo
**Teste:** Teste #___
**Descrição:**
_________________________________
_________________________________

---

## ✅ Assinaturas

**Testado por:** ___________________  
**Data:** ____/____/2025  
**Tempo gasto:** _____ minutos  

**Revisado por:** ___________________  
**Data:** ____/____/2025

---

**Versão:** Sprint 3  
**Features:** Upload de Arquivos + Notificações Desktop  
**Documento:** TESTES_SPRINT3_EXECUTADOS.md
