# 🔧 Plano de Ação: Correção dos Testes do Chat

**Data:** 2025-01-13  
**Prioridade:** 🔴 **ALTA**  
**Tempo Estimado:** 2-3 horas  
**Status Atual:** ⏳ **AGUARDANDO EXECUÇÃO**

---

## 📊 Situação Atual

### **Problemas:**
- ❌ 27 erros de compilação TypeScript
- ❌ 0 testes executados
- ❌ Bloqueando todo o módulo de Chat

### **Impacto:**
- ~40 testes do Chat não podem ser executados
- Feature crítica do sistema sem validação
- Risco de bugs não detectados

---

## 🎯 Fases de Correção

### **FASE 1: Correções Estruturais** ⏱️ 30min

#### 1.1. Importar Tipos Corretos
```typescript
// Adicionar no topo do arquivo
import { ChatMessage, ChatUser } from '../../redux/slices/chatSlice';
```

#### 1.2. Configurar Mocks Globais
```typescript
// Antes de todos os testes
beforeAll(() => {
  // Mock window.matchMedia (Ant Design)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});
```

---

### **FASE 2: Corrigir Interfaces** ⏱️ 45min

#### 2.1. Criar Mock Base Completo
```typescript
const createMockMessage = (overrides?: Partial<ChatMessage>): ChatMessage => {
  return {
    id: '1',
    content: 'Test message',
    sender: {
      id: 1,  // number, não string
      username: 'testuser',
      email: 'test@test.com',
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User',
    },
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',  // ✅ Obrigatório
    message_type: 'text',
    is_edited: false,
    is_deleted: false,
    is_read: false,      // ✅ Obrigatório
    can_edit: true,      // ✅ Obrigatório
    can_delete: true,    // ✅ Obrigatório
    ...overrides,
  };
};
```

#### 2.2. Substituir Todos os Mocks
```typescript
// ❌ ANTES
const mockMessage = {
  id: '1',
  content: 'Hello World',
  sender: { id: 'user1', username: 'John', email: 'john@test.com' },
  created_at: '2025-01-01T10:00:00Z',
  message_type: 'text',
  is_edited: false,
  is_deleted: false,
  reply_to: null,
};

// ✅ DEPOIS
const mockMessage = createMockMessage({
  content: 'Hello World',
});

const editedMessage = createMockMessage({
  content: 'Edited',
  is_edited: true,
});

const replyMessage = createMockMessage({
  content: 'Reply',
  reply_to: 'original-msg-id',
});

const systemMessage = createMockMessage({
  message_type: 'system',
  content: 'System notification',
});

const longMessage = createMockMessage({
  content: 'A'.repeat(1000),
});

const emojiMessage = createMockMessage({
  content: '🎉 Celebration! 🎊',
});
```

---

### **FASE 3: Adicionar Null Checks** ⏱️ 45min

#### 3.1. Pattern para user.type()
```typescript
// ❌ ANTES
const input = container.querySelector('textarea');
await user.type(input, 'Hello World');

// ✅ DEPOIS
const input = container.querySelector('textarea');
expect(input).toBeInTheDocument();
if (!input) throw new Error('Input not found');
await user.type(input, 'Hello World');

// OU usar non-null assertion
await user.type(input!, 'Hello World');
```

#### 3.2. Pattern para Verificações de Propriedades
```typescript
// ❌ ANTES
expect(input.value).toBe('Hello World');
expect(contentElement.textContent.length).toBeLessThan(600);

// ✅ DEPOIS
expect(input).toHaveValue('Hello World');

const contentElement = container.querySelector('.message-content');
expect(contentElement).toBeInTheDocument();
expect(contentElement?.textContent?.length ?? 0).toBeLessThan(600);
```

#### 3.3. Locais a Corrigir (15 ocorrências)
```typescript
// Procurar por:
1. await user.type(input, ...)          // 8 ocorrências
2. input.value                          // 2 ocorrências  
3. contentElement.textContent           // 1 ocorrência
4. element.getAttribute()               // ?
5. container.querySelector() sem check  // ?
```

---

### **FASE 4: Configurar Mocks de Hooks** ⏱️ 30min

#### 4.1. Mock useChatWebSocket
```typescript
// Já está configurado, mas verificar se está correto
jest.mock('../../hooks/useChatWebSocket', () => ({
  __esModule: true,
  default: () => ({
    isConnected: true,
    sendMessage: jest.fn(),
    sendTyping: jest.fn(),
    markAsRead: jest.fn(),
  }),
}));
```

#### 4.2. Mock useNotifications
```typescript
jest.mock('../../hooks/useNotifications', () => ({
  __esModule: true,
  default: () => ({
    permission: 'granted',
    requestPermission: jest.fn(),
    notifyNewMessage: jest.fn(),
    clearRoomNotifications: jest.fn(),
  }),
}));
```

#### 4.3. Mock React Router
```typescript
// Já está configurado
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ roomId: '123' }),
  useNavigate: () => jest.fn(),
}));
```

---

### **FASE 5: Validação e Testes** ⏱️ 60min

#### 5.1. Executar Testes
```bash
npm test -- ChatPage.test.tsx --watchAll=false
```

#### 5.2. Analisar Resultados
- Verificar quantos testes passam
- Identificar falhas remanescentes
- Documentar problemas novos

#### 5.3. Correções Iterativas
- Corrigir erros um por um
- Re-executar após cada correção
- Documentar soluções aplicadas

---

## 📝 Checklist de Execução

### **□ FASE 1: Estrutura (30min)**
- [ ] Importar tipos ChatMessage e ChatUser
- [ ] Configurar mock window.matchMedia
- [ ] Adicionar beforeAll/beforeEach
- [ ] Verificar compilação

### **□ FASE 2: Interfaces (45min)**
- [ ] Criar função createMockMessage
- [ ] Substituir mockMessage
- [ ] Substituir editedMessage
- [ ] Substituir replyMessage
- [ ] Substituir systemMessage
- [ ] Substituir longMessage
- [ ] Substituir emojiMessage
- [ ] Verificar compilação (12 erros devem sumir)

### **□ FASE 3: Null Checks (45min)**
- [ ] Adicionar checks em user.type() (8x)
- [ ] Adicionar checks em .value (2x)
- [ ] Adicionar checks em .textContent (1x)
- [ ] Adicionar checks em outros acessos (4x)
- [ ] Verificar compilação (15 erros devem sumir)

### **□ FASE 4: Mocks (30min)**
- [ ] Verificar mock useChatWebSocket
- [ ] Adicionar mock useNotifications
- [ ] Verificar mock react-router-dom
- [ ] Testar mocks individualmente

### **□ FASE 5: Validação (60min)**
- [ ] Executar testes
- [ ] Analisar resultados
- [ ] Corrigir erros remanescentes
- [ ] Documentar em RESULTADOS_TESTES_CHAT.md
- [ ] Atualizar RESUMO_GERAL_TESTES.md

---

## 🎯 Critérios de Sucesso

### **Mínimo Aceitável:**
- ✅ 0 erros de compilação
- ✅ Testes executam sem travar
- ✅ Pelo menos 70% dos testes passam

### **Meta Ideal:**
- ✅ 0 erros de compilação
- ✅ 95%+ dos testes passam
- ✅ Tempo de execução < 20s
- ✅ Sem falhas intermitentes

---

## 🚀 Comando Rápido de Execução

```bash
# 1. Navegar para o diretório
cd /home/dev_pc/Documentos/crm_freela2/sistema_crm/frontend

# 2. Executar testes com log
npm test -- ChatPage.test.tsx --watchAll=false 2>&1 | tee /tmp/chat_test_results.txt

# 3. Ver resumo
tail -n 30 /tmp/chat_test_results.txt
```

---

## 📊 Template de Resultado

```markdown
# Resultados - Chat Tests

## Execução [DATA]

### Resultado:
- ✅ XX testes passando
- ❌ XX testes falhando
- ⏱️ Tempo: XXs

### Melhorias:
- Antes: 0% (bloqueado)
- Depois: XX%
- Melhoria: +XX%

### Problemas Remanescentes:
1. [Descrição]
2. [Descrição]

### Próximos Passos:
1. [Ação]
2. [Ação]
```

---

## 💡 Dicas de Depuração

### **Se ainda houver erros:**

1. **Erro de importação:**
   ```typescript
   // Verificar se caminho está correto
   import X from '../../path/to/file';  // ✅
   import X from '../path/to/file';     // ❌
   ```

2. **Erro de tipo:**
   ```typescript
   // Usar tipo explícito
   const msg: ChatMessage = { /* ... */ };
   ```

3. **Erro de mock:**
   ```typescript
   // Verificar se __esModule: true
   jest.mock('../../hook', () => ({
     __esModule: true,  // ✅ Importante
     default: () => ({ /* ... */ }),
   }));
   ```

4. **Erro de elemento null:**
   ```typescript
   // Sempre verificar antes
   const el = screen.getByRole('textbox');
   expect(el).toBeInTheDocument();
   ```

---

## 📚 Referências Úteis

### **Arquivos para Consultar:**
- `CORRECOES_TESTES_FILE_UPLOAD.md` - Técnicas que funcionaram
- `RESULTADOS_TESTES_FILE_UPLOAD.md` - Exemplo de sucesso
- `frontend/src/redux/slices/chatSlice.ts` - Interfaces corretas

### **Comandos Úteis:**
```bash
# Ver erros de compilação
npx tsc --noEmit

# Executar teste específico
npm test -- ChatPage.test.tsx -t "should render message"

# Modo watch para desenvolvimento
npm test -- ChatPage.test.tsx
```

---

## ✅ Conclusão

**Este plano fornece:**
- ✅ Roteiro passo a passo
- ✅ Exemplos de código correto
- ✅ Checklist completo
- ✅ Critérios de sucesso
- ✅ Ferramentas de depuração

**Tempo Total Estimado:** 2h30min - 3h30min

**Próximo Passo:** Executar FASE 1

---

**Status:** ⏳ **PRONTO PARA EXECUÇÃO**  
**Última Atualização:** 2025-01-13  
**Responsável:** Equipe de Desenvolvimento
