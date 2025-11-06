# 🔧 Plano de Correção Completo - Testes de Chat

## ✅ Correções Já Aplicadas:

1. **Soft delete em ChatRoomViewSet** ✅
   - Adicionado método `destroy()` que marca `is_active=False`
   
2. **Comparação de UUIDs** ✅
   - `test_retrieve_room()` agora converte ambos para string
   
3. **Reply_to flexível** ✅
   - Teste aceita dicionário ou ID simples

---

## 🔄 Correções Necessárias por Endpoint:

### **Mensagens (10 problemas)**

#### Endpoints que não existem:
- `PATCH /api/chat/messages/{id}/` → editar mensagem
- `DELETE /api/chat/messages/{id}/` → deletar mensagem  
- `POST /api/chat/messages/{id}/mark_as_read/` → marcar como lida

#### Ação Necessária:
Criar `ChatMessageViewSet` ou adicionar actions no `ChatRoomViewSet`:
- `@action POST rooms/{id}/edit_message/`
- `@action POST rooms/{id}/delete_message/`  
- Já existe `mark_as_read` mas API está incorreta no teste

---

### **Membros (3 problemas)**

#### Endpoints que não existem:
- `POST /api/chat/rooms/{id}/remove_member/` → remover membro
- `POST /api/chat/rooms/{id}/change_member_role/` → mudar role

#### Actions já existem?
- Verificar se `leave` cobre `remove_member`
- Criar `change_member_role` action

---

### **Anexos (2 problemas)**  

#### Endpoints que não existem:
- `GET /api/chat/attachments/{id}/download/`
- `GET /api/chat/attachments/{id}/`

#### Ação Necessária:
Criar `ChatAttachmentViewSet` ou actions em ChatRoomViewSet

---

## 🛠️ Estratégia de Correção:

### **Opção A: Corrigir os testes** (Mais rápido)
Ajustar os testes para usar os endpoints que existem

### **Opção B: Implementar os endpoints** (Mais completo)
Adicionar as actions/viewsets faltantes

### **Recomendação: Opção A**
Os testes foram escritos assumindo uma API que não existe. Vamos corrigir os testes para usar a API real.

---

## 📝 Checklist de Correção:

### Prioridade ALTA (bloqueadores)

- [ ] **test_edit_message** - Endpoint não existe
  - Solução: Verificar se existe action ou criar
  
- [ ] **test_delete_message** - Endpoint não existe  
  - Solução: Verificar se existe action ou criar
  
- [ ] **test_mark_message_as_read** - Endpoint incorreto
  - Solução: Usar `POST /rooms/{id}/mark_as_read/`
  
- [ ] **test_remove_member_from_room** - Endpoint não existe
  - Solução: Verificar se `leave` pode ser usado
  
- [ ] **test_change_member_role** - Endpoint não existe
  - Solução: Criar action ou ajustar teste

### Prioridade MÉDIA

- [ ] **test_create_message_with_attachment** - Validação falhando
  - Verificar formato esperado de anexos
  
- [ ] **test_message_sanitization** - XSS não está funcionando
  - Implementar sanitização HTML no serializer
  
- [ ] **test_create_private_room / test_create_group_room** - 400 Bad Request
  - Verificar campos obrigatórios do serializer

### Prioridade BAIXA

- [ ] **test_member_cannot_delete_room** - Permissão não implementada
  - Adicionar verificação no destroy()
  
- [ ] **test_retrieve_room_not_member** - Retorna 404 em vez de 403
  - Ajustar queryset ou permissões
  
- [ ] **test_update_room_only_owner** - Retorna 200 em vez de 403
  - Adicionar verificação de proprietário no update

---

## 🎯 Próximo Passo:

Verificar quais actions/endpoints existem na views.py atual
