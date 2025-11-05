# 🎯 GUIA PARA CONTINUAR - FASE 2

**Objetivo**: Corrigir os 62 testes restantes (67% → 90%+)  
**Tempo Estimado**: 4-6 horas  
**Data**: 5 de novembro de 2025

---

## 📋 CHECKLIST RÁPIDO

```
✅ Fase 1 Completa:
   ├─ 5/5 bugs críticos resolvidos
   ├─ 126/188 testes passando (67%)
   └─ Todos os 6 módulos funcionando

🟡 Fase 2 Pendente:
   ├─ 62 testes restantes
   ├─ 4-6 horas de trabalho
   └─ Alvo: 170/188 testes (90%+)
```

---

## 🚀 COMO EXECUTAR FASE 2

### Passo 1: Rodar Testes e Identificar Padrões

```bash
cd /home/dev_pc/Documentos/crm_freela2/sistema_crm/backend

# Ver todos os erros com categorias
python -m pytest apps/chat/tests/ -q --tb=no 2>&1 | grep "FAILED" | sort

# Ver erros específicos
python -m pytest apps/chat/tests/test_views.py -v --tb=short
python -m pytest apps/chat/tests/test_consumers.py -v --tb=short
```

### Passo 2: Priorizar por Impacto

```
MAIOR IMPACTO:
1. test_views.py (15 testes) - Request Factory
2. test_consumers.py (8 testes) - Async/Sync
3. test_serializers.py (4 testes) - Fields
4. test_permissions.py (6 testes) - Request context
5. test_attachments.py (4 testes) - Response data
```

### Passo 3: Executar Prioridade por Prioridade

```bash
# Prioridade 1: test_views.py
python -m pytest apps/chat/tests/test_views.py::ChatRoomViewSetTest -v

# Prioridade 2: test_consumers.py
python -m pytest apps/chat/tests/test_consumers.py::ChatConsumerConnectionTest -v

# E assim por diante...
```

---

## 🔧 SOLUÇÕES POR TIPO DE ERRO

### Tipo 1: Request Factory Issues

**Erro**:
```
AttributeError: 'WSGIRequest' object has no attribute 'query_params'
```

**Solução**:
```python
# Antes (ERRADO):
from rest_framework.test import APIRequestFactory
factory = APIRequestFactory()
request = factory.get('/api/chat/rooms/')

# Depois (CORRETO):
from rest_framework.test import APIRequestFactory
factory = APIRequestFactory()
request = factory.get('/api/chat/rooms/')
request.user = self.user  # IMPORTANTE!
```

**Arquivos a Corrigir**:
- `test_views.py` (15 testes)
- `test_serializers.py` (4 testes)

**Tempo**: ~1 hora

---

### Tipo 2: Async/Sync Issues

**Erro**:
```
django.core.exceptions.SynchronousOnlyOperation: You cannot call this from an async context
```

**Solução**:
```python
# Dentro de teste async:
@sync_to_async
def get_message_count():
    return ChatMessage.objects.count()

# Em vez de:
# messages = ChatMessage.objects.filter(room=self.room).count()  ❌
```

**Arquivos a Corrigir**:
- `test_consumers.py` (8 testes)

**Tempo**: ~1.5 horas

---

### Tipo 3: Field Access Issues

**Erro**:
```
AssertionError: 'expected_value' != 'actual_value'
```

**Solução**:
1. Verificar se o serializer está retornando os campos corretos
2. Debugar com `print(serializer.data)`
3. Ajustar field names conforme necessário

**Arquivos a Corrigir**:
- `test_serializers.py` (4 testes)
- `test_attachments.py` (4 testes)

**Tempo**: ~1 hora

---

### Tipo 4: Permission Context Issues

**Erro**:
```
AssertionError: False is not True
```

**Solução**:
```python
# Antes (ERRADO):
request = factory.get('/api/...')

# Depois (CORRETO):
request = factory.get('/api/...')
force_authenticate(request, user=self.user)
```

**Arquivos a Corrigir**:
- `test_permissions.py` (6 testes)

**Tempo**: ~0.5 hora

---

### Tipo 5: WebSocket Issues

**Erro**:
```
KeyError: 'url_route' ou AssertionError na conexão
```

**Solução**:
```python
# Usar AsyncWebsocketCommunicator com scope completo:
communicator = AsyncWebsocketCommunicator(
    ChatConsumer.as_asgi(),
    f"/ws/chat/{self.room.id}/",
    headers=[(b'authorization', b'Token test-token')]
)
communicator.scope['url_route'] = {
    'kwargs': {'room_id': str(self.room.id)}
}
connected, _ = await communicator.connect()
self.assertTrue(connected)
```

**Arquivos a Corrigir**:
- `test_consumers.py` (já melhorou muito)

**Tempo**: ~1 hora

---

## 📊 PLANO DETALHADO

### PASSO 1: test_views.py (15 testes) - 1.5 horas

```bash
# Executar:
python -m pytest apps/chat/tests/test_views.py -v --tb=short

# Padrão esperado:
# Todos os testes estão usando RequestFactory que não funciona com DRF
# Solução: Converter para APIRequestFactory + force_authenticate

# Mudanças necessárias:
1. Importar APIRequestFactory
2. Usar APIRequestFactory em vez de RequestFactory
3. Adicionar force_authenticate(request, user=user)
4. Re-rodar testes
```

### PASSO 2: test_consumers.py (8 testes) - 1.5 horas

```bash
# Executar:
python -m pytest apps/chat/tests/test_consumers.py -v --tb=short

# Padrão esperado:
# Alguns testes falhando por SynchronousOnlyOperation
# Solução: Usar sync_to_async nos testes

# Mudanças necessárias:
1. Identificar linhas que acessam DB em async context
2. Envolver com @sync_to_async ou await sync_to_async()
3. Re-rodar testes
```

### PASSO 3: test_serializers.py (4 testes) - 1 hora

```bash
# Executar:
python -m pytest apps/chat/tests/test_serializers.py -v --tb=short

# Padrão esperado:
# Alguns testes falhando por dados vazios ou field mismatch
# Solução: Debugar e verificar dados retornados

# Mudanças necessárias:
1. Adicionar debug prints: print(serializer.data)
2. Verificar se todos os fields estão sendo populados
3. Ajustar field names conforme necessário
```

### PASSO 4: test_permissions.py (6 testes) - 0.5 hora

```bash
# Executar:
python -m pytest apps/chat/tests/test_permissions.py -v --tb=short

# Padrão esperado:
# Permission tests falhando por request sem user
# Solução: Adicionar force_authenticate

# Mudanças necessárias:
1. Adicionar force_authenticate nos testes
2. Re-rodar testes
```

### PASSO 5: test_attachments.py (4 testes) - 1 hora

```bash
# Executar:
python -m pytest apps/chat/tests/test_attachments.py -v --tb=short

# Padrão esperado:
# Alguns testes falhando por response vazio ou dados incorretos
# Solução: Verificar views e serializers

# Mudanças necessárias:
1. Debugar views que retornam attachment data
2. Verificar se serializers estão corretos
3. Re-rodar testes
```

---

## 🔍 DEBUGGING RÁPIDO

### Como ver EXATAMENTE qual é o erro

```bash
# Ver um teste específico com erro completo:
python -m pytest apps/chat/tests/test_views.py::ChatRoomViewSetTest::test_create_group_room -vvv

# Ver erro com traceback completo:
python -m pytest apps/chat/tests/test_views.py::ChatRoomViewSetTest::test_create_group_room -vvv --tb=long
```

### Como corrigir rápido

```bash
# 1. Rodar teste
# 2. Ver erro
# 3. Abrir arquivo de teste
# 4. Fazer mudança simples
# 5. Re-rodar teste

# Exemplo:
python -m pytest apps/chat/tests/test_views.py::ChatRoomViewSetTest -v && echo "✅ OK"
```

---

## 📝 DICAS IMPORTANTES

### 1. Não mexer em test_models.py
```
✅ 39/39 testes passando
❌ Não mexer em nada aqui
```

### 2. APIRequestFactory vs RequestFactory
```python
# ERRADO:
from rest_framework.test import RequestFactory
request = RequestFactory().get('/api/...')

# CORRETO:
from rest_framework.test import APIRequestFactory
request = APIRequestFactory().get('/api/...')
```

### 3. Sempre adicionar user
```python
from rest_framework.test import force_authenticate

request = APIRequestFactory().get('/api/...')
force_authenticate(request, user=self.user)
```

### 4. Usar AsyncTestCase para async testes
```python
# Melhor:
from django.test import AsyncTestCase

class MyAsyncTest(AsyncTestCase):
    async def test_something(self):
        ...
```

### 5. Sync_to_async para DB access
```python
from asgiref.sync import sync_to_async

@sync_to_async
def get_count():
    return ChatMessage.objects.count()
```

---

## ✅ VALIDAÇÃO

Após cada mudança, verificar:

```bash
# Rodar testes novamente
python -m pytest apps/chat/tests/ -q

# Esperado:
# Pelo menos +5 a +10 testes passando por tarefa
# Taxa subindo de 67% para 75%, 80%, 85%, 90%+
```

---

## 🎯 META

```
Antes:  ████████░░░░░░░░░░░░ 67.0% (126/188)
Depois: ███████████████░░░░░░ 90%+ (170/188)
```

---

## 📞 SUPORTE

Se encontrar um erro:

1. **Verificar os arquivos de documentação**:
   - `RELATORIO_ERROS_ENCONTRADOS.md`
   - `RESULTADO_FINAL_CORRECOES.md`

2. **Rodar testes com verbose**:
   ```bash
   python -m pytest -vvv --tb=long
   ```

3. **Debugar com prints**:
   ```python
   print("DEBUG:", serializer.data)
   print("ERROR:", e)
   ```

4. **Procurar por padrões**:
   - Todos os erros de um tipo costumam ter a mesma causa

---

## 🏁 CONCLUSÃO

**Você está pronto para FASE 2!** 🚀

Próximos passos:
1. ✅ Ler este guia
2. ⏳ Executar Passo 1 (test_views.py)
3. ⏳ Executar Passo 2 (test_consumers.py)
4. ⏳ Executar Passo 3 (test_serializers.py)
5. ⏳ Executar Passo 4 (test_permissions.py)
6. ⏳ Executar Passo 5 (test_attachments.py)
7. ✅ Atingir 90%+ de taxa de sucesso!

**Tempo Total**: 4-6 horas  
**Recompensa**: 90%+ teste coverage 🎉

Boa sorte! 🍀

