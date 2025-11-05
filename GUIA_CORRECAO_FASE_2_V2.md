# Guia de Correção de Testes - Fase 2

## Status Atual
- **126/188 testes passando (67%)**
- **62 testes falhando (33%)**
- **Meta: 170/188 (90%)**
- **Defasagem: 44 testes**

## Principais Problemas Identificados

### 1. test_views.py (14 falhas)
**Problemas:**
- URLs hard-coded vs reverse()
- Response.data format diferente do esperado (dict vs list)
- Status codes incorretos (400, 404, 405)
- Comparação UUID vs string

**Exemplos:**
- `test_list_chat_rooms`: Esperado list, recebido OrderedDict com paginação
- `test_create_private_room`: 400 Bad Request (validation issues)
- `test_create_group_room`: 400 Bad Request (fields validation)
- `test_delete_room`: 404 ChatRoom.DoesNotExist

**Solução:**
1. Usar `reverse()` para URLs dinâmicas
2. Adaptar assertions para respostas com paginação
3. Validar campos de entrada (serializers)
4. Usar `.get()` com safe error handling

### 2. test_consumers.py (12 falhas)
**Problemas:**
- `SynchronousOnlyOperation` no async context
- `sync_to_async` não sendo usado
- Database queries em contexto async
- JSON serialization de UUID

**Exemplo:**
```
SynchronousOnlyOperation: You cannot call this from an async context
```

**Solução:**
1. Usar `async_to_sync()` ou `sync_to_async()` para DB ops
2. Implementar proper async/await patterns
3. Converter UUID antes de JSON serialization

### 3. test_serializers.py (8 falhas)
**Problemas:**
- Missing fields: `member_count`, `read_count`, `file_name`, `file_type`
- Type mismatches: sender ID retorna int vs string esperado
- UUID vs string representation

**Solução:**
1. Adicionar campos ausentes aos serializers
2. Normalizar tipos de dados
3. Usar SerializerMethodField quando necessário

### 4. test_permissions.py (6 falhas)
**Problemas:**
- `ChatRoom.room` attribute não existe (deveria ser `ChatRoom.id`?)
- UNIQUE constraint failed em community_id
- Permission check logic não matching

**Solução:**
1. Revisar atributos do modelo ChatRoom
2. Usar diferentes comunidades/rooms para testes
3. Validar permission classes implementation

### 5. test_attachments.py (4 falhas)
**Problemas:**
- Missing fields: `file_name`, `file_type`
- Response status codes incorretos
- Response data structure diferente

**Solução:**
1. Adicionar os campos ao modelo ChatAttachment
2. Atualizar serializer com os novos campos
3. Validar response data structure

## Ordem de Correção Recomendada

1. **Primeiro**: Fixar test_attachments.py (4 testes) - Mais simples, apenas adicionar campos
2. **Segundo**: Fixar test_serializers.py (8 testes) - Reflete nas outras
3. **Terceiro**: Fixar test_permissions.py (6 testes) - Depende dos serializers
4. **Quarto**: Fixar test_views.py (14 testes) - Depende dos anteriores
5. **Quinto**: Fixar test_consumers.py (12 testes) - Async patterns complexas

## Status de Bloqueadores

### Bloqueador 1: Campos Faltando
- [ ] ChatAttachment: file_name, file_type, file_url
- [ ] ChatRoomSerializer: member_count
- [ ] ChatMessageSerializer: read_count

### Bloqueador 2: Atributos de Modelo
- [ ] ChatRoom.room (verificar se deveria ser algo diferente)
- [ ] Unique constraints em comunidades

### Bloqueador 3: Async/Await em Consumers
- [ ] Implementar sync_to_async decorators
- [ ] UUID JSON serialization

## Próximos Passos Imediatos

1. Revisar modelo ChatRoom procurando por atributo `room`
2. Adicionar campos faltando aos serializers
3. Usar pytest-asyncio fixtures corretas
4. Implementar reverse() para URLs dinâmicas
