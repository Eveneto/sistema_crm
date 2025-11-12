# 🐛 Debug: Upload de Arquivos - Guia Completo

**Data:** 12/11/2025  
**Problema:** Mensagens com arquivos não aparecem

---

## 🔍 Problemas Encontrados

### Problema #1: Reducer Não Adicionava Mensagem ao Estado ✅ CORRIGIDO

**Código Anterior:**
```typescript
builder.addCase(sendMessage.fulfilled, (state, action) => {
  // Message will be added via WebSocket
  // ❌ NADA ACONTECIA!
});
```

**Problema:** O comentário dizia "será adicionado via WebSocket", mas:
- Arquivos são enviados via **HTTP POST**, não WebSocket
- WebSocket só notifica **outros usuários**
- O próprio usuário nunca via a mensagem aparecer!

**Correção Aplicada:**
```typescript
builder.addCase(sendMessage.fulfilled, (state, action) => {
  const { roomId, message } = action.payload;
  
  // ✅ Adicionar mensagem ao estado
  if (!state.messages[roomId]) {
    state.messages[roomId] = [];
  }
  
  const exists = state.messages[roomId].some(m => m.id === message.id);
  if (!exists) {
    state.messages[roomId].push(message);
  }
  
  // ✅ Atualizar last_message da sala
  const room = state.rooms.find(r => r.id === roomId);
  if (room) {
    room.last_message = { ... };
  }
});
```

---

## 🧪 Como Testar Agora

### 1. Abrir Console do Navegador (F12)

Você verá logs detalhados em cada etapa:

```
📤 [MessageInput] Enviando mensagem:
  content: "Arquivo anexado"
  messageType: "file"
  filesCount: 1
  files: [File]

📨 [ChatPage] handleSendMessage chamado:
  content: "Arquivo anexado"
  messageType: "file"
  filesCount: 1
  roomId: "123"

📁 [ChatPage] Enviando via HTTP API (com arquivos)

🚀 [Redux] sendMessage iniciado:
  roomId: "123"
  content: "Arquivo anexado"
  filesCount: 1

📎 [Redux] Adicionando arquivos ao FormData: 1

📡 [Redux] Fazendo POST para: /chat/rooms/123/send_message/

✅ [Redux] Resposta recebida: {...}

✅ [Redux Reducer] sendMessage.fulfilled:
  roomId: "123"
  message: {...}

➕ [Redux Reducer] Mensagem adicionada ao estado
```

### 2. Teste Passo a Passo

#### Teste A: Apenas Arquivo
1. Recarregar página (Ctrl+R)
2. Abrir Console (F12)
3. Ir para Chat
4. Clicar **📎**
5. Selecionar imagem
6. Clicar **Enviar**

**Observar:**
- [ ] Logs aparecem no console
- [ ] POST é feito para `/api/chat/rooms/.../send_message/`
- [ ] Resposta 200 OK
- [ ] Mensagem aparece no chat

#### Teste B: Arquivo + Texto
1. Anexar PDF
2. Digitar: "Segue documento"
3. Enviar

**Observar:**
- [ ] Ambos (texto + arquivo) são enviados
- [ ] Mensagem aparece com os dois

---

## 🚨 Possíveis Erros

### Erro 1: "❌ [ChatPage] Sem roomId!"
**Causa:** Não está em uma sala de chat  
**Solução:** Selecionar uma sala primeiro

### Erro 2: "❌ [ChatPage] WebSocket não conectado!"
**Causa:** Daphne não está rodando  
**Solução:** 
```bash
cd backend
daphne -b 0.0.0.0 -p 8001 crm_backend.asgi:application
```

### Erro 3: POST retorna 400/500
**Causa:** Problema no backend  
**Verificar:**
1. Terminal do Django: ver erro
2. Formato do FormData está correto?
3. Backend espera campo diferente?

### Erro 4: Mensagem não aparece (mesmo com 200 OK)
**Causa:** Reducer não está funcionando  
**Verificar:**
- Log `➕ [Redux Reducer] Mensagem adicionada ao estado` aparece?
- Se não, redux store não está sincronizado

---

## 📋 Checklist de Debug

### Frontend
- [ ] Logs do MessageInput aparecem
- [ ] Logs do ChatPage aparecem  
- [ ] Logs do Redux aparecem
- [ ] POST é feito
- [ ] Resposta 200 OK
- [ ] Reducer adiciona mensagem

### Backend
- [ ] Django rodando (porta 8000)
- [ ] Daphne rodando (porta 8001)
- [ ] Sem erros no terminal Django
- [ ] Endpoint `/chat/rooms/.../send_message/` existe
- [ ] Backend retorna mensagem criada

### Rede
- [ ] DevTools → Network → Filtrar por "send_message"
- [ ] Request Method: POST
- [ ] Status: 200
- [ ] Response contém `id`, `content`, `sender`, etc

---

## 🔧 Se Ainda Não Funcionar

### Passo 1: Verificar Request Payload

No Network tab do DevTools:
1. Clicar no request `send_message`
2. Aba "Payload"
3. Verificar se tem:
   ```
   content: "Arquivo anexado"
   message_type: "file"
   attachments[0]file: (binary)
   attachments[0]original_name: "foto.jpg"
   attachments[0]content_type: "image/jpeg"
   attachments[0]file_size: "123456"
   ```

### Passo 2: Verificar Response

Na aba "Response":
```json
{
  "id": "msg-123",
  "content": "Arquivo anexado",
  "message_type": "file",
  "sender": {...},
  "attachments": [{
    "id": "att-456",
    "file_url": "/media/...",
    "file_name": "foto.jpg",
    ...
  }],
  "created_at": "2025-11-12T...",
  ...
}
```

### Passo 3: Verificar Redux State

No Redux DevTools:
1. Action: `chat/sendMessage/fulfilled`
2. State diff:
   ```diff
   messages: {
     "room-123": [
   +   { id: "msg-123", content: "Arquivo anexado", ... }
     ]
   }
   ```

---

## 📊 Arquivos Modificados Nesta Correção

| Arquivo | Mudança | Motivo |
|---------|---------|--------|
| `chatSlice.ts` | Adicionar logs em `sendMessage` | Debug |
| `chatSlice.ts` | Corrigir `sendMessage.fulfilled` reducer | **Problema principal** |
| `chatSlice.ts` | Adicionar `sendMessage.rejected` | Tratar erros |
| `ChatPage.tsx` | Adicionar logs em `handleSendMessage` | Debug |
| `MessageInput.tsx` | Adicionar logs em `handleSend` | Debug |

---

## ✅ Próximos Passos

1. ✅ Correções aplicadas
2. ⏳ **Recarregar frontend** (Ctrl+R)
3. ⏳ **Abrir Console** (F12)
4. ⏳ **Testar upload**
5. ⏳ **Reportar logs** se não funcionar

---

## 💬 Como Reportar Problema

Se ainda não funcionar, copie e cole:

```
### Logs do Console:

[Cole aqui os logs do console]

### Network Tab (send_message):

Request:
- Status: ___
- Method: ___
- URL: ___

Response:
[Cole o JSON da resposta]

### Comportamento:
- [ ] Arquivo aparece no preview
- [ ] Botão Enviar funciona
- [ ] POST é feito
- [ ] Resposta 200
- [ ] Mensagem NÃO aparece <-- PROBLEMA AQUI
```

---

**Atualizado em:** 12/11/2025  
**Versão:** 2.0 (com logs de debug)  
**Status:** 🔴 AGUARDANDO TESTE DO USUÁRIO
