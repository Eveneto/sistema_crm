# 🧪 Guia de Testes - Upload de Arquivos

## ⚡ Início Rápido

### 1. Iniciar Aplicação

```bash
# Terminal 1 - Backend
cd sistema_crm
./start-dev.sh

# Aguardar mensagens:
# ✅ Daphne running on http://0.0.0.0:8001
# ✅ Development server is running at http://0.0.0.0:8000

# Terminal 2 - Frontend
cd frontend
npm start

# Aguardar:
# ✅ Compiled successfully!
# ✅ webpack compiled with 0 warnings
```

### 2. Acessar Chat

1. Abrir: http://localhost:3000
2. Fazer login (ou criar conta)
3. Navegar para: **Chat** (menu lateral)
4. Selecionar ou criar uma sala

---

## ✅ Checklist de Testes Funcionais

### 🎯 Teste 1: Upload de Imagem

**Objetivo:** Anexar e enviar imagem PNG/JPEG

**Passos:**
1. [ ] Clicar no botão **📎 (clipe)** ao lado do input
2. [ ] Selecionar arquivo: `imagem.png` (< 10MB)
3. [ ] **Verificar:** Preview aparece com miniatura da imagem
4. [ ] **Verificar:** Nome do arquivo exibido
5. [ ] **Verificar:** Tamanho em KB exibido
6. [ ] Digitar texto (opcional): "Veja esta imagem"
7. [ ] Clicar em **Enviar** ou pressionar **Enter**
8. [ ] **Verificar:** Mensagem aparece no chat com anexo
9. [ ] **Verificar:** Outros usuários da sala recebem a mensagem

**Resultado Esperado:** ✅ Imagem enviada e exibida

---

### 🎯 Teste 2: Upload de PDF

**Objetivo:** Anexar e enviar documento PDF

**Passos:**
1. [ ] Clicar no botão **📎**
2. [ ] Selecionar arquivo: `documento.pdf`
3. [ ] **Verificar:** Preview aparece com ícone de arquivo (não miniatura)
4. [ ] **Verificar:** Nome "documento.pdf" exibido
5. [ ] Enviar sem texto adicional
6. [ ] **Verificar:** Mensagem mostra "Arquivo anexado"
7. [ ] **Verificar:** Link para download funciona

**Resultado Esperado:** ✅ PDF enviado, mensagem com "Arquivo anexado"

---

### 🎯 Teste 3: Remover Arquivo do Preview

**Objetivo:** Cancelar envio antes de clicar em Enviar

**Passos:**
1. [ ] Clicar no botão **📎**
2. [ ] Selecionar arquivo qualquer
3. [ ] **Verificar:** Preview aparece
4. [ ] Clicar no **❌ (X)** ao lado do arquivo no preview
5. [ ] **Verificar:** Arquivo removido do preview
6. [ ] **Verificar:** Botão Enviar volta a ficar desabilitado (se não houver texto)

**Resultado Esperado:** ✅ Arquivo removido, preview vazio

---

### 🎯 Teste 4: Arquivo Muito Grande (Erro)

**Objetivo:** Validar limite de 10MB

**Passos:**
1. [ ] Clicar no botão **📎**
2. [ ] Tentar selecionar arquivo > 10MB (ex: vídeo, imagem RAW)
3. [ ] **Verificar:** Mensagem de erro aparece:
   - 🔴 "Arquivo muito grande! Tamanho máximo: 10MB"
4. [ ] **Verificar:** Arquivo NÃO é adicionado ao preview

**Resultado Esperado:** ✅ Erro exibido, upload bloqueado

---

### 🎯 Teste 5: Tipo de Arquivo Não Suportado (Erro)

**Objetivo:** Validar tipos permitidos

**Passos:**
1. [ ] Clicar no botão **📎**
2. [ ] Tentar selecionar arquivo não permitido (ex: `.exe`, `.zip`, `.mp4`)
3. [ ] **Verificar:** Mensagem de erro aparece:
   - 🔴 "Tipo de arquivo não suportado"
4. [ ] **Verificar:** Arquivo NÃO é adicionado ao preview

**Resultado Esperado:** ✅ Erro exibido, upload bloqueado

---

### 🎯 Teste 6: Múltiplos Arquivos

**Objetivo:** Anexar vários arquivos em uma única mensagem

**Passos:**
1. [ ] Clicar no botão **📎** e selecionar `imagem1.png`
2. [ ] **Verificar:** Preview com 1 arquivo
3. [ ] Clicar no botão **📎** novamente e selecionar `documento.pdf`
4. [ ] **Verificar:** Preview com 2 arquivos
5. [ ] Clicar no botão **📎** novamente e selecionar `imagem2.jpg`
6. [ ] **Verificar:** Preview com 3 arquivos
7. [ ] Digitar texto: "Vários anexos"
8. [ ] Clicar em **Enviar**
9. [ ] **Verificar:** Mensagem com todos os 3 anexos

**Resultado Esperado:** ✅ Múltiplos arquivos enviados juntos

---

### 🎯 Teste 7: Arquivo + Resposta

**Objetivo:** Enviar arquivo respondendo a outra mensagem

**Passos:**
1. [ ] Clicar em **Responder** em uma mensagem existente
2. [ ] **Verificar:** Banner de resposta aparece acima do input
3. [ ] Clicar no botão **📎** e selecionar arquivo
4. [ ] **Verificar:** Preview do arquivo E preview da resposta visíveis
5. [ ] Digitar texto: "Respondendo com anexo"
6. [ ] Clicar em **Enviar**
7. [ ] **Verificar:** Mensagem mostra:
   - Link para mensagem original
   - Texto digitado
   - Arquivo anexado

**Resultado Esperado:** ✅ Resposta com anexo funciona

---

### 🎯 Teste 8: Enviar Somente Arquivo (Sem Texto)

**Objetivo:** Enviar mensagem apenas com anexo

**Passos:**
1. [ ] Clicar no botão **📎** e selecionar arquivo
2. [ ] **NÃO digitar texto**
3. [ ] **Verificar:** Botão Enviar está **HABILITADO**
4. [ ] Clicar em **Enviar**
5. [ ] **Verificar:** Mensagem aparece com texto padrão:
   - 📎 "Arquivo anexado"

**Resultado Esperado:** ✅ Mensagem enviada com texto padrão

---

### 🎯 Teste 9: Interface Visual

**Objetivo:** Validar design e UX

**Verificações:**
1. [ ] Preview de arquivo tem borda arredondada
2. [ ] Miniaturas de imagem têm 40x40px
3. [ ] Ícone de arquivo (PDF/DOC) tem tamanho adequado
4. [ ] Texto do nome do arquivo tem ellipsis se muito longo
5. [ ] Hover no botão X muda cor para vermelho
6. [ ] Preview tem fundo cinza claro
7. [ ] Layout responsivo (testa redimensionar janela)

**Resultado Esperado:** ✅ Design polido e consistente

---

### 🎯 Teste 10: Integração com WebSocket

**Objetivo:** Outros usuários recebem mensagens com arquivos

**Passos:**
1. [ ] Abrir chat em **2 navegadores diferentes** (ou aba anônima)
2. [ ] Fazer login com **2 usuários diferentes**
3. [ ] Ambos entram na **mesma sala**
4. [ ] Usuário 1: Envia mensagem com arquivo
5. [ ] **Verificar:** Usuário 2 recebe mensagem em tempo real
6. [ ] **Verificar:** Arquivo aparece na mensagem do Usuário 2
7. [ ] Usuário 2: Clica no link do arquivo
8. [ ] **Verificar:** Download ou visualização funciona

**Resultado Esperado:** ✅ Real-time sync funcionando

---

## 🐛 Testes de Edge Cases

### 🧪 Teste 11: Nome de Arquivo Longo

**Passos:**
1. [ ] Anexar arquivo com nome muito longo (> 50 caracteres)
2. [ ] **Verificar:** Nome tem ellipsis (...) no preview
3. [ ] **Verificar:** Nome completo é enviado ao backend

---

### 🧪 Teste 12: Arquivo com Caracteres Especiais

**Passos:**
1. [ ] Anexar arquivo: `teste ação & côção.pdf`
2. [ ] **Verificar:** Nome exibido corretamente no preview
3. [ ] **Verificar:** Upload funciona sem erros

---

### 🧪 Teste 13: Cancelar Mensagem com Arquivo

**Passos:**
1. [ ] Anexar arquivo
2. [ ] Começar a digitar texto
3. [ ] Fechar aba ou sair da sala **SEM enviar**
4. [ ] Voltar para a sala
5. [ ] **Verificar:** Preview de arquivo não persiste (comportamento esperado)

---

## 📊 Resumo de Testes

| # | Teste | Status | Observações |
|---|-------|--------|-------------|
| 1 | Upload de Imagem | ⬜ | |
| 2 | Upload de PDF | ⬜ | |
| 3 | Remover Arquivo | ⬜ | |
| 4 | Arquivo > 10MB | ⬜ | |
| 5 | Tipo Não Suportado | ⬜ | |
| 6 | Múltiplos Arquivos | ⬜ | |
| 7 | Arquivo + Resposta | ⬜ | |
| 8 | Somente Arquivo | ⬜ | |
| 9 | Interface Visual | ⬜ | |
| 10 | WebSocket Sync | ⬜ | |
| 11 | Nome Longo | ⬜ | |
| 12 | Caracteres Especiais | ⬜ | |
| 13 | Cancelar Mensagem | ⬜ | |

**Legenda:**
- ⬜ Não testado
- ✅ Passou
- ❌ Falhou
- ⚠️ Atenção necessária

---

## 🔧 Comandos Úteis para Debug

### Verificar Console do Navegador

```javascript
// Abrir DevTools (F12) e verificar:
// 1. Erros no Console (aba Console)
// 2. Requisições de upload (aba Network)
//    - Filtrar por: "send_message"
//    - Verificar payload FormData
//    - Verificar status 200 OK

// 3. Redux state (aba Components -> ChatPage)
//    - Verificar messages array
//    - Verificar attachments em cada mensagem
```

### Verificar Backend (Django)

```bash
# Ver logs do Django em tempo real
cd sistema_crm
docker-compose logs -f backend

# Buscar por:
# - POST /api/chat/rooms/{id}/send_message/
# - Status 201 Created
# - Erros de validação (se houver)
```

### Verificar WebSocket

```bash
# Ver logs do Daphne
docker-compose logs -f daphne

# Buscar por:
# - WebSocket CONNECT
# - WebSocket SEND (broadcast de mensagem)
# - WebSocket DISCONNECT
```

---

## 🚨 Problemas Comuns e Soluções

### ❌ Problema: "Arquivo muito grande" mesmo com arquivo pequeno

**Causa:** Validação incorreta  
**Solução:** Verificar `maxSize` em `MessageInput.tsx` (deve ser `10 * 1024 * 1024`)

---

### ❌ Problema: Preview não aparece

**Causa:** CSS não carregado ou estado não atualizado  
**Solução:**
1. Verificar importação de `crm-components-new.css`
2. Verificar `attachedFiles` no React DevTools
3. Hard refresh (Ctrl+Shift+R)

---

### ❌ Problema: Erro 413 (Payload Too Large) no upload

**Causa:** Limite do Nginx ou Django  
**Solução:** Aumentar `client_max_body_size` no Nginx e `DATA_UPLOAD_MAX_MEMORY_SIZE` no Django

---

### ❌ Problema: Mensagem enviada mas arquivo não aparece

**Causa:** Backend não processou FormData corretamente  
**Solução:** Verificar serializer `ChatAttachmentSerializer` e view `send_message`

---

### ❌ Problema: Outros usuários não recebem mensagem em tempo real

**Causa:** WebSocket não notificou corretamente  
**Solução:** Verificar logs do Daphne e `room_group_send` no consumer

---

## ✅ Critérios de Aceitação

Para considerar a feature **APROVADA**, todos os testes devem passar:

- ✅ Upload de imagem funciona
- ✅ Upload de PDF funciona
- ✅ Validação de tamanho funciona
- ✅ Validação de tipo funciona
- ✅ Preview visual correto
- ✅ Remover arquivo funciona
- ✅ Múltiplos arquivos funcionam
- ✅ WebSocket sync funciona
- ✅ Sem erros no console
- ✅ Design consistente e polido

**Quando todos ✅:**
```
🎉 Feature US-CHAT-013 APROVADA!
📝 Atualizar status no SPRINT3_FILE_UPLOAD_IMPLEMENTADO.md
🚀 Prosseguir para próxima feature (Notificações Desktop)
```

---

**Última atualização:** Sprint 3  
**Responsável:** Dev Team  
**Status:** ⏳ Aguardando Testes Manuais
