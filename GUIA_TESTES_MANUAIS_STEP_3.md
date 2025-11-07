# Step 3: Testes Manuais - Guia de Validação 📋

**Status:** PRONTO PARA EXECUTAR  
**Estimado:** 4-6 horas  
**Data Inicial:** 7 de novembro de 2025

## Objetivo

Validar que a implementação do chat funciona corretamente **end-to-end** no frontend, incluindo:
1. CRUD de salas e mensagens
2. Validação de permissões
3. Tratamento de erros
4. UX/Responsividade

---

## Fase 1: Setup Inicial (15 min)

### 1.1 Iniciar Serviços
```bash
# Terminal 1: Backend
cd backend
python manage.py runserver 8000

# Terminal 2: Frontend
cd frontend
npm start

# Terminal 3: Teste (commands only)
# (manter separado)
```

### 1.2 Criar Usuários de Teste
```bash
# Via Django Admin ou API
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test123!@#",
    "first_name": "Admin"
  }'

# Repetir para:
# - moderador@test.com
# - member1@test.com
# - member2@test.com
# - outsider@test.com
```

### 1.3 Acessar Frontend
```
http://localhost:3000
Login: admin@test.com / Test123!@#
```

---

## Fase 2: CRUD de Chat Rooms (45 min)

### 2.1 Criar Chat Room Privado

**Objetivo:** Validar criação de sala privada

**Steps:**
1. Clicar em "Novo Chat" / "New Chat"
2. Preencher:
   - Nome: "Test Private Room"
   - Tipo: "Private"
   - Membros: moderador@test.com, member1@test.com
3. Clicar "Criar"

**Validação:**
- ✅ Sala criada e visível na lista
- ✅ Apenas membros convidados conseguem acessar
- ✅ URL: `/api/chat/rooms/{id}/`
- ✅ Resposta contém: `id`, `name`, `room_type`, `members`
- ✅ Backend log: Sala criada

**Teste de API:**
```bash
curl -X GET http://localhost:8000/api/chat/rooms/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Validar resposta:
# {
#   "count": 1,
#   "results": [{
#     "id": "...",
#     "name": "Test Private Room",
#     "room_type": "private",
#     "members": [{...}]
#   }]
# }
```

### 2.2 Editar Chat Room

**Objective:** Validar edição de sala

**Steps:**
1. Na sala criada, clicar em "Editar" / "Settings"
2. Mudar nome para: "Test Private Room - Updated"
3. Salvar

**Validação:**
- ✅ Nome atualizado na UI
- ✅ Mudança refletida na lista
- ✅ Backend: SQL UPDATE executado
- ✅ Apenas criador pode editar

**Teste de Permissions:**
- Login como `member1@test.com`
- Tentar editar sala
- ✅ Deve mostrar erro 403: "Você não tem permissão"

### 2.3 Adicionar Membro

**Objetivo:** Validar adição de novo membro

**Steps:**
1. Na sala, clicar "Adicionar Membro"
2. Procurar: "member2@test.com"
3. Selecionar role: "Member"
4. Clicar "Adicionar"

**Validação:**
- ✅ Novo membro aparece na lista
- ✅ Membro recebe notificação (se implementado)
- ✅ Membro consegue enviar mensagens
- ✅ API: POST `/api/chat/rooms/{id}/members/`

**Teste de Permission:**
- Login como `outsider@test.com`
- Tentar acessar a sala
- ✅ Deve retornar 403: "Você não tem permissão"

### 2.4 Remover Membro

**Objetivo:** Validar remoção de membro

**Steps:**
1. Na sala, clicar no membro "member2@test.com"
2. Clicar "Remover"
3. Confirmar

**Validação:**
- ✅ Membro removido da lista
- ✅ Membro não consegue mais enviar mensagens
- ✅ API: DELETE `/api/chat/rooms/{id}/members/{user_id}/`

### 2.5 Deletar Chat Room

**Objetivo:** Validar deleção de sala

**Steps:**
1. Na sala, clicar "Editar" → "Deletar Sala"
2. Confirmar

**Validação:**
- ✅ Sala removida da lista (soft delete)
- ✅ Sala não aparece mais para membros
- ✅ Backend: `is_active = False`
- ✅ Histórico de mensagens preservado

---

## Fase 3: CRUD de Mensagens (60 min)

### 3.1 Enviar Mensagem de Texto

**Objetivo:** Validar envio de mensagem básica

**Steps:**
1. Abrir sala criada
2. Na caixa de mensagem, digitar: "Olá, esta é a primeira mensagem"
3. Pressionar Enter ou clicar "Enviar"

**Validação:**
- ✅ Mensagem aparece na tela imediatamente
- ✅ Timestamp correto
- ✅ Sender identificado corretamente
- ✅ Mensagem persiste após F5 (reload)
- ✅ API: POST `/api/chat/rooms/{room_id}/messages/`

**Teste de Content:**
```bash
curl -X POST http://localhost:8000/api/chat/rooms/{room_id}/messages/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Teste de API"
  }'

# Resposta esperada (201):
# {
#   "id": "...",
#   "content": "Teste de API",
#   "sender": "...",
#   "room": "...",
#   "created_at": "2025-11-07T...",
#   "is_edited": false
# }
```

### 3.2 Testar XSS Protection

**Objetivo:** Validar sanitização de XSS

**Steps:**
1. Tentar enviar mensagem com payload XSS:
   ```
   <script>alert('XSS')</script>
   ```
2. Pressionar Enter

**Validação:**
- ✅ Script tag é removida/escapada
- ✅ Mensagem salva com conteúdo sanitizado
- ✅ Nenhuma execução de JavaScript
- ✅ No console: sem erros de XSS

**Teste Avançado:**
```bash
curl -X POST http://localhost:8000/api/chat/rooms/{room_id}/messages/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<script>alert(\"XSS\")</script>"
  }'

# Verificar resposta - script deve ser removido
```

**Outros Payloads XSS para Testar:**
- `<img src="x" onerror="alert(1)">`
- `<iframe src="javascript:alert(1)"></iframe>`
- `<svg onload="alert(1)">`
- `javascript:alert(1)`

### 3.3 Editar Mensagem

**Objetivo:** Validar edição de mensagem

**Steps:**
1. Enviar mensagem: "Mensagem original"
2. Clicar em "..." (menu) → "Editar"
3. Mudar para: "Mensagem editada"
4. Clicar "Salvar"

**Validação:**
- ✅ Texto atualizado
- ✅ Marcado como editado (badge "Editada")
- ✅ Timestamp original preservado
- ✅ Timestamp de edição atualizado
- ✅ API: PATCH `/api/chat/messages/{id}/`

**Teste de Permission:**
- Login como `member2`
- Tentar editar mensagem de `member1`
- ✅ Deve retornar erro 403

### 3.4 Deletar Mensagem

**Objetivo:** Validar deleção de mensagem

**Steps:**
1. Clicar em "..." → "Deletar"
2. Confirmar

**Validação:**
- ✅ Mensagem desaparece (soft delete)
- ✅ Mensagem substituída por "Mensagem deletada"
- ✅ Apenas dono/admin podem deletar
- ✅ API: DELETE `/api/chat/messages/{id}/`

### 3.5 Marcar como Lido

**Objetivo:** Validar status de leitura

**Steps:**
1. Enviar mensagem como `member1`
2. Mudar para `member2`
3. Abrir sala
4. Clicar na mensagem ou auto-marcar ao abrir

**Validação:**
- ✅ Marcado como lido
- ✅ Badge de "não lido" desaparece
- ✅ Status refletido para todos os membros
- ✅ API: POST `/api/chat/messages/{id}/mark_as_read/`

---

## Fase 4: Testes de Permissões (45 min)

### 4.1 Permissão: Admin

**Objetivo:** Validar poderes de admin

**Setup:**
- Sala com `admin@test.com` como admin
- `member1@test.com` como member

**Tests:**
1. ✅ Admin consegue enviar mensagens
2. ✅ Admin consegue editar suas mensagens
3. ✅ Admin consegue deletar qualquer mensagem
4. ✅ Admin consegue editar sala
5. ✅ Admin consegue remover membros
6. ✅ Admin consegue promover/rebaixar membros

**Teste de API:**
```bash
# Admin deletando mensagem de member
curl -X DELETE http://localhost:8000/api/chat/messages/{member_message_id}/ \
  -H "Authorization: Bearer {admin_token}"
# ✅ Esperado: 204 No Content
```

### 4.2 Permissão: Moderator

**Objetivo:** Validar permissões de moderador

**Setup:**
- `moderador@test.com` como moderator

**Tests:**
1. ✅ Moderator consegue enviar mensagens
2. ✅ Moderator consegue editar suas mensagens
3. ✅ Moderator consegue deletar suas mensagens
4. ❌ Moderator **NÃO** consegue deletar mensagens de outros
5. ❌ Moderator **NÃO** consegue remover membros
6. ✅ Moderator consegue silenciar/reportar mensagens

### 4.3 Permissão: Member

**Objetivo:** Validar permissões de member

**Setup:**
- `member1@test.com` como member

**Tests:**
1. ✅ Member consegue enviar mensagens
2. ✅ Member consegue editar suas mensagens
3. ✅ Member consegue deletar suas mensagens
4. ❌ Member **NÃO** consegue deletar mensagens de outros
5. ❌ Member **NÃO** consegue editar sala
6. ❌ Member **NÃO** consegue remover membros

### 4.4 Permissão: Outsider (Não-membro)

**Objetivo:** Validar bloqueio de não-membros

**Setup:**
- `outsider@test.com` não é membro

**Tests:**
1. ❌ Outsider **NÃO** consegue ver a sala
   ```bash
   curl -X GET http://localhost:8000/api/chat/rooms/{room_id}/ \
     -H "Authorization: Bearer {outsider_token}"
   # ✅ Esperado: 403 Forbidden
   ```

2. ❌ Outsider **NÃO** consegue enviar mensagens
   ```bash
   curl -X POST http://localhost:8000/api/chat/rooms/{room_id}/messages/ \
     -H "Authorization: Bearer {outsider_token}" \
     -H "Content-Type: application/json" \
     -d '{"content": "Hackada"}'
   # ✅ Esperado: 403 Forbidden
   ```

3. ❌ Outsider **NÃO** consegue listar mensagens

### 4.5 Superuser Bypass

**Objetivo:** Validar que superuser tem acesso total

**Setup:**
- Criar superuser: `superuser@test.com`
- Sala privada sem o superuser como membro

**Tests:**
1. ✅ Superuser consegue ver qualquer sala
2. ✅ Superuser consegue enviar mensagens em qualquer sala
3. ✅ Superuser consegue deletar qualquer mensagem
4. ✅ Superuser consegue editar qualquer sala

---

## Fase 5: Testes de Community Chat (30 min)

### 5.1 Community Chat - Criação Automática

**Objetivo:** Validar que chat é criado automaticamente para comunidades

**Steps:**
1. Ir para Communities
2. Criar nova comunidade: "Test Community"
3. Volta para Chat

**Validação:**
- ✅ Chat automático criado com nome "Chat - Test Community"
- ✅ Criador da comunidade é admin do chat
- ✅ Chat aparece na lista
- ✅ API: POST `/api/communities/` deve disparar signal

### 5.2 Community Chat - Adição de Membro

**Objetivo:** Validar que membro da comunidade acessa chat automaticamente

**Steps:**
1. Na comunidade, adicionar `member1@test.com`
2. Login como `member1`
3. Ir para Chat

**Validação:**
- ✅ `member1` consegue ver o chat da comunidade
- ✅ `member1` consegue enviar mensagens
- ✅ API: POST `/api/communities/members/` deve disparar signal

### 5.3 Community Chat - Permissões

**Steps:**
1. Criar comunidade com admin, moderador, member
2. Testar cada role

**Validação:**
- ✅ Admin: pode fazer tudo
- ✅ Moderador: pode enviar, editar próprias
- ✅ Member: pode enviar, editar próprias

---

## Fase 6: Testes de UI/UX (45 min)

### 6.1 Responsividade

**Teste em diferentes resoluções:**

| Resolução | Dispositivo | Validação |
|-----------|------------|-----------|
| 1920x1080 | Desktop | ✅ Layout perfeito |
| 1366x768 | Laptop | ✅ Sem overflow |
| 768x1024 | Tablet | ✅ Reorganiza bem |
| 375x667 | Mobile | ✅ Funcional |

**Steps:**
1. Abrir Chat em cada resolução
2. Enviar mensagem longa
3. Testar scroll
4. Testar input

**Validação:**
- ✅ Mensagens legíveis
- ✅ Inputs acessíveis
- ✅ Sem overflow horizontal
- ✅ Touch-friendly em mobile

### 6.2 Tratamento de Erros

**Teste: Sala não encontrada**
```bash
curl -X GET http://localhost:8000/api/chat/rooms/invalid-id/ \
  -H "Authorization: Bearer {token}"
# ✅ Esperado: 404 Not Found com mensagem clara
```

**Teste: Mensagem vazia**
- Campo vazio + Enter
- ✅ Não deve enviar
- ✅ Deve mostrar erro: "Mensagem não pode estar vazia"

**Teste: Offline**
1. Desligar internet
2. Tentar enviar mensagem
3. ✅ Deve mostrar erro amigável
4. ✅ Tentar novamente quando online

### 6.3 Feedback Visual

**Validações:**
- ✅ Loading spinner ao enviar
- ✅ Checkmark ao sucesso
- ✅ Retry button em erro
- ✅ Toast notifications para ações
- ✅ Timestamp formatado legível

### 6.4 Performance

**Teste: Scroll de muitas mensagens**
1. Criar sala com 100+ mensagens
2. Scroll up/down
3. ✅ Sem lag
4. ✅ Scroll suave

**Teste: Digite longo**
1. Digite mensagem com 5000 caracteres
2. Enviar
3. ✅ Sem travamento
4. ✅ Renderiza corretamente

---

## Fase 7: Testes de Integração (30 min)

### 7.1 Multi-Tab Sync

**Objetivo:** Validar sincronização entre abas

**Steps:**
1. Abrir chat em 2 abas
2. Enviar mensagem na aba 1
3. Verificar se aparece na aba 2

**Validação:**
- ✅ Mensagem aparece em tempo real em ambas abas
- ✅ Status de leitura sincronizado
- ✅ Logout em uma aba afeta ambas

### 7.2 Real-time Updates

**Setup:** 2 browsers diferente s
1. Browser 1: Login como `member1`
2. Browser 2: Login como `member2`
3. Browser 1: Enviar mensagem

**Validação:**
- ✅ Mensagem aparece em Browser 2 em tempo real
- ✅ Typing indicator funciona
- ✅ Online status atualiza

### 7.3 API Consistency

**Objetivo:** Validar que dados são consistentes entre UI e API

**Steps:**
1. Enviar mensagem via UI
2. Verificar via curl

```bash
curl -X GET http://localhost:8000/api/chat/rooms/{room_id}/messages/ \
  -H "Authorization: Bearer {token}"
```

**Validação:**
- ✅ Mesmos dados em ambas
- ✅ Timestamps idênticos
- ✅ Metadados corretos

---

## Fase 8: Teste de Stress (20 min)

### 8.1 Muitos Membros

**Setup:** Sala com 50+ membros

**Tests:**
1. Enviar mensagem
2. ✅ Entregue para todos rapidamente
3. ✅ Sem timeout

### 8.2 Mensagens Longas

**Payload:** 10,000 caracteres

**Tests:**
1. Enviar via API
2. ✅ Renderiza corretamente
3. ✅ Não corta conteúdo

### 8.3 Rate Limiting (se implementado)

1. Enviar 100 mensagens seguidas
2. ✅ Deve limitar após N requisições
3. ✅ Deve retornar 429 Too Many Requests

---

## Checklist Final

### Backend ✅
- [ ] `python manage.py test apps.chat --keepdb` → 100% pass (core modules)
- [ ] `python manage.py check` → OK
- [ ] Sem migrations pendentes
- [ ] Logs limpos

### Frontend 🎨
- [ ] Chat page carrega
- [ ] Pode criar sala
- [ ] Pode enviar mensagem
- [ ] Pode deletar mensagem
- [ ] Permissões funcionam
- [ ] Sem console errors

### API 📡
- [ ] Nested routes funcionam
- [ ] Permissions validadas
- [ ] XSS sanitization funciona
- [ ] Erros bem formatados

### UX 💅
- [ ] Responsivo em todos devices
- [ ] Feedback visual adequado
- [ ] Performance aceitável
- [ ] Acessibilidade OK

---

## Logs & Debugging

### Ver logs do Django
```bash
# Terminal backend
tail -f backend/debug.log
```

### Ver erros da API
```bash
curl -X GET http://localhost:8000/api/chat/rooms/ \
  -H "Authorization: Bearer {token}" \
  -v
```

### Inspecionar banco de dados
```bash
cd backend
python manage.py dbshell
SELECT * FROM chat_chatroom;
SELECT * FROM chat_chatmessage ORDER BY created_at DESC LIMIT 10;
```

---

## Rastreamento de Problemas

| Problema | Solução |
|----------|---------|
| Sala não aparece | Verificar `is_active=True` no DB |
| Mensagem não envia | Verificar membership em ChatRoomMember |
| 403 Forbidden | Verificar role em ChatRoomMember |
| XSS não sanitizado | Verificar se campo usa ChatMessageCreateSerializer |
| Não sincroniza entre tabs | Verificar authSyncService.ts no frontend |

---

## Resultado Esperado

✅ **100% dos testes manuais passando**

- CRUD funciona perfeitamente
- Permissões respeitadas
- XSS bloqueado
- UX responsivo
- Performance aceitável
- Pronto para staging/produção

**Tempo Total Estimado:** 4-6 horas
**Data Prevista:** 7-8 de novembro de 2025
