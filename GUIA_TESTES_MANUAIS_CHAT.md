# 🧪 Guia de Testes Manuais - Chat API

## 🎯 Objetivo
Validar manualmente as funcionalidades corrigidas do módulo de chat através da interface e requisições diretas.

---

## 🔧 Pré-requisitos

### 1. Iniciar Servidores
```bash
# Terminal 1: Backend
cd backend && python manage.py runserver 8000

# Terminal 2: Frontend
cd frontend && npm start
```

### 2. Obter Token de Autenticação
- Faça login no frontend (http://localhost:3000)
- Abra DevTools (F12) → Network
- Encontre requisição com header `Authorization: Bearer <token>`
- Copie o token para usar nos testes cURL

---

## ✅ Checklist de Testes

### 1. CRUD de Salas de Chat

#### 1.1 Criar Sala Privada
```bash
curl -X POST "http://localhost:8000/api/chat/rooms/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sala Teste Privada",
    "room_type": "private"
  }'
```
**✅ Esperado**: Status 201, sala criada com você como admin

#### 1.2 Criar Sala em Grupo
```bash
curl -X POST "http://localhost:8000/api/chat/rooms/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grupo de Trabalho",
    "room_type": "group",
    "members": [2, 3]
  }'
```
**✅ Esperado**: Status 201, sala criada com membros especificados

#### 1.3 Listar Salas
```bash
curl -X GET "http://localhost:8000/api/chat/rooms/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Lista de salas que você tem acesso

#### 1.4 Ver Detalhes de Sala
```bash
# Substitua ROOM_ID pelo ID da sala criada
curl -X GET "http://localhost:8000/api/chat/rooms/ROOM_ID/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Detalhes completos da sala (membros, permissões)

#### 1.5 Tentar Acessar Sala Sem Permissão
```bash
# Use ID de sala que não é membro
curl -X GET "http://localhost:8000/api/chat/rooms/SALA_ALHEIA/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Status 403 Forbidden (não 404!)

#### 1.6 Editar Sala (apenas criador)
```bash
curl -X PATCH "http://localhost:8000/api/chat/rooms/ROOM_ID/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sala Renomeada"
  }'
```
**✅ Esperado**: Status 200, nome atualizado

#### 1.7 Deletar Sala (soft delete)
```bash
curl -X DELETE "http://localhost:8000/api/chat/rooms/ROOM_ID/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Status 204, sala marcada como inativa

---

### 2. Gerenciamento de Membros

#### 2.1 Adicionar Membro
```bash
curl -X POST "http://localhost:8000/api/chat/rooms/ROOM_ID/add_member/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 4,
    "role": "member"
  }'
```
**✅ Esperado**: Status 200, membro adicionado

#### 2.2 Remover Membro
```bash
curl -X POST "http://localhost:8000/api/chat/rooms/ROOM_ID/remove_member/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 4
  }'
```
**✅ Esperado**: Status 200, membro removido completamente

#### 2.3 Alterar Papel de Membro
```bash
curl -X POST "http://localhost:8000/api/chat/rooms/ROOM_ID/change_member_role/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 3,
    "role": "moderator"
  }'
```
**✅ Esperado**: Status 200, papel alterado para moderador

#### 2.4 Listar Membros
```bash
curl -X GET "http://localhost:8000/api/chat/rooms/ROOM_ID/members/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Lista de membros com papéis

---

### 3. Mensagens

#### 3.1 Enviar Mensagem
```bash
curl -X POST "http://localhost:8000/api/chat/rooms/ROOM_ID/send_message/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Olá, esta é uma mensagem de teste!",
    "message_type": "text"
  }'
```
**✅ Esperado**: Status 201, mensagem criada

#### 3.2 Listar Mensagens da Sala
```bash
curl -X GET "http://localhost:8000/api/chat/rooms/ROOM_ID/messages/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Lista de mensagens com paginação

#### 3.3 Responder Mensagem
```bash
curl -X POST "http://localhost:8000/api/chat/rooms/ROOM_ID/send_message/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Esta é uma resposta",
    "message_type": "text",
    "reply_to_id": "MESSAGE_UUID_AQUI"
  }'
```
**✅ Esperado**: Status 201, campo `reply_to` preenchido

#### 3.4 Editar Mensagem
```bash
curl -X PATCH "http://localhost:8000/api/chat/messages/MESSAGE_ID/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Mensagem editada"
  }'
```
**✅ Esperado**: Status 200, `is_edited: true`

#### 3.5 Deletar Mensagem
```bash
curl -X DELETE "http://localhost:8000/api/chat/messages/MESSAGE_ID/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Status 204, `is_deleted: true`

#### 3.6 Marcar Mensagem como Lida
```bash
curl -X POST "http://localhost:8000/api/chat/messages/MESSAGE_ID/mark_as_read/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Status 200, confirmação

---

### 4. Anexos

#### 4.1 Enviar Mensagem com Anexo (Simulação)
```bash
curl -X POST "http://localhost:8000/api/chat/rooms/ROOM_ID/send_message/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Arquivo anexado",
    "message_type": "file",
    "attachments": [{
      "file_name": "documento.pdf",
      "file_size": 2048,
      "file_type": "application/pdf",
      "file_url": "https://example.com/doc.pdf"
    }]
  }'
```
**✅ Esperado**: Status 201, anexo criado

#### 4.2 Listar Anexos
```bash
curl -X GET "http://localhost:8000/api/chat/attachments/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Lista de anexos acessíveis

#### 4.3 Ver Metadados do Anexo
```bash
curl -X GET "http://localhost:8000/api/chat/attachments/ATTACHMENT_ID/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Metadados com `file_name`, `file_size`, etc.

#### 4.4 Download de Anexo
```bash
curl -X GET "http://localhost:8000/api/chat/attachments/ATTACHMENT_ID/download/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  --output downloaded_file.pdf
```
**✅ Esperado**: Arquivo baixado (ou erro se não tiver arquivo real)

#### 4.5 Tentar Download Sem Permissão
```bash
# Use attachment de sala que não é membro
curl -X GET "http://localhost:8000/api/chat/attachments/ATTACHMENT_ALHEIO/download/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Status 403 Forbidden

---

## 🔒 Testes de Segurança e Permissões

### 5.1 Não-membro Tenta Enviar Mensagem
1. Crie uma sala
2. Faça login com outro usuário (não adicionado)
3. Tente enviar mensagem
**✅ Esperado**: Status 403 Forbidden

### 5.2 Membro Comum Tenta Remover Outro Membro
1. Faça login com usuário que é membro comum (não admin)
2. Tente remover outro membro
**✅ Esperado**: Status 403 Forbidden

### 5.3 Moderador Deleta Mensagem de Outro
1. Faça login com usuário moderador
2. Tente deletar mensagem de outro membro
**✅ Esperado**: Status 204 (moderador pode deletar)

### 5.4 Membro Comum Tenta Deletar Mensagem de Outro
1. Faça login com usuário membro comum
2. Tente deletar mensagem de outro
**✅ Esperado**: Status 403 Forbidden

### 5.5 XSS Protection
```bash
curl -X POST "http://localhost:8000/api/chat/rooms/ROOM_ID/send_message/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<script>alert(\"XSS\")</script>Texto normal",
    "message_type": "text"
  }'
```
**✅ Esperado**: Status 201, mas conteúdo sanitizado (sem `<script>`)

---

## 🎨 Testes de Interface (Frontend)

### 6.1 Navegação
- [ ] Acessar página de chat via menu lateral
- [ ] Ver lista de salas disponíveis
- [ ] Clicar em sala e ver mensagens

### 6.2 Envio de Mensagens
- [ ] Digitar mensagem no campo de texto
- [ ] Clicar em "Enviar" ou pressionar Enter
- [ ] Mensagem aparece imediatamente na lista
- [ ] Avatar e nome do usuário aparecem corretamente

### 6.3 Edição de Mensagens
- [ ] Hover sobre mensagem própria mostra botão "Editar"
- [ ] Clicar em editar abre campo de edição
- [ ] Alterar texto e salvar
- [ ] Tag "(editado)" aparece

### 6.4 Responder Mensagens
- [ ] Clicar em "Responder" em uma mensagem
- [ ] Campo de resposta mostra preview da mensagem original
- [ ] Enviar resposta
- [ ] Resposta mostra referência à mensagem original

### 6.5 Gerenciamento de Membros
- [ ] Abrir modal/painel de membros
- [ ] Ver lista de membros com papéis
- [ ] Adicionar novo membro (se admin)
- [ ] Alterar papel de membro (se admin)
- [ ] Remover membro (se admin)

### 6.6 Upload de Arquivos
- [ ] Clicar em botão de anexo
- [ ] Selecionar arquivo do computador
- [ ] Preview do arquivo aparece
- [ ] Enviar mensagem com anexo
- [ ] Arquivo aparece na mensagem com ícone

### 6.7 Download de Arquivos
- [ ] Clicar em anexo na mensagem
- [ ] Arquivo começa a fazer download
- [ ] Arquivo é salvo corretamente

---

## 📱 Testes Responsivos

### 7.1 Desktop (1920x1080)
- [ ] Layout de 3 colunas (salas | mensagens | detalhes)
- [ ] Todos os elementos visíveis
- [ ] Scroll funciona em cada seção

### 7.2 Tablet (768x1024)
- [ ] Layout de 2 colunas (salas/mensagens adaptativo)
- [ ] Painel de detalhes em modal
- [ ] Menu lateral colapsa em hamburguer

### 7.3 Mobile (375x667)
- [ ] Layout de 1 coluna (navegação por telas)
- [ ] Lista de salas → Mensagens → Voltar funciona
- [ ] Campo de mensagem fixo na parte inferior
- [ ] Teclado virtual não quebra layout

---

## ⚡ Testes de Performance

### 8.1 Paginação de Mensagens
1. Criar sala com 100+ mensagens
2. Scroll até o topo
3. **✅ Esperado**: Carrega mais mensagens automaticamente

### 8.2 Lista de Salas com Muitas Entradas
1. Criar 50+ salas
2. Acessar página de chat
3. **✅ Esperado**: Lista carrega rapidamente, sem travamentos

### 8.3 Envio Rápido de Mensagens
1. Enviar 10 mensagens seguidas rapidamente
2. **✅ Esperado**: Todas aparecem na ordem correta

---

## 🐛 Cenários de Erro

### 9.1 Sala Não Encontrada
```bash
curl -X GET "http://localhost:8000/api/chat/rooms/00000000-0000-0000-0000-000000000000/" \
  -H "Authorization: Bearer SEU_TOKEN"
```
**✅ Esperado**: Status 404 Not Found

### 9.2 Mensagem Vazia
```bash
curl -X POST "http://localhost:8000/api/chat/rooms/ROOM_ID/send_message/" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "",
    "message_type": "text"
  }'
```
**✅ Esperado**: Status 400 Bad Request

### 9.3 Token Inválido
```bash
curl -X GET "http://localhost:8000/api/chat/rooms/" \
  -H "Authorization: Bearer TOKEN_INVALIDO"
```
**✅ Esperado**: Status 401 Unauthorized

### 9.4 Sala Inativa (Deletada)
1. Deletar sala
2. Tentar acessar sala deletada
**✅ Esperado**: Status 404 ou 403

---

## 📊 Checklist Final

### Funcionalidades Core
- [ ] Criar sala privada
- [ ] Criar sala em grupo
- [ ] Listar salas
- [ ] Ver detalhes de sala
- [ ] Editar sala (criador)
- [ ] Deletar sala (criador)
- [ ] Adicionar membro
- [ ] Remover membro
- [ ] Alterar papel de membro
- [ ] Enviar mensagem
- [ ] Editar mensagem (autor)
- [ ] Deletar mensagem (autor/moderador)
- [ ] Responder mensagem
- [ ] Marcar como lida
- [ ] Upload de anexo
- [ ] Download de anexo

### Segurança
- [ ] Autenticação obrigatória
- [ ] Permissões de admin/moderador/membro
- [ ] 403 para acesso não autorizado
- [ ] XSS sanitização funcionando
- [ ] Apenas criador edita/deleta sala
- [ ] Apenas autor edita mensagem

### UX/UI
- [ ] Interface responsiva
- [ ] Loading states
- [ ] Mensagens de erro claras
- [ ] Confirmações de ação
- [ ] Indicadores visuais de status

---

## ✅ Critérios de Aceitação

Para considerar o chat **APROVADO PARA PRODUÇÃO**, todos os itens acima devem estar funcionando conforme esperado.

**Status Atual**: ✅ API REST completa e funcional

**Pendências Opcionais** (Fase 2):
- WebSocket para tempo real
- Typing indicators
- Read receipts em tempo real
- Notificações push

---

**Testado por**: _________________  
**Data**: _________________  
**Resultado**: ☐ Aprovado  ☐ Reprovado  ☐ Com ressalvas
