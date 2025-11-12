# 🔧 Correção: URLs da API Duplicadas

## ❌ Problema Identificado

O sistema estava tentando acessar URLs duplicadas:
```
❌ /api/api/auth/login/
❌ /api/api/auth/register/
❌ /api/api/companies/companies/
```

Resultando em erros **404 Not Found**.

---

## 🔍 Causa Raiz

O axios estava configurado com:
```typescript
// api.ts
const API_BASE_URL = 'http://localhost:8000'; // ❌ Sem /api
```

E todas as chamadas incluíam `/api/` no início:
```typescript
// authSlice.ts
await api.post('/api/auth/login/', {...}); // ❌ Duplicação
```

Resultado: `http://localhost:8000` + `/api/auth/login/` = ✅ Correto  
Mas quando mudado para rotas relativas, virava `/api/api/...`

---

## ✅ Solução Aplicada

### 1. Corrigir `baseURL` do Axios

**Arquivo:** `frontend/src/services/api.ts`

```typescript
// ANTES
const API_BASE_URL = 'http://localhost:8000';

// DEPOIS
const API_BASE_URL = 'http://localhost:8000/api';
```

### 2. Remover `/api/` das Rotas

**Arquivos corrigidos:**

| Arquivo | Rotas Corrigidas |
|---------|------------------|
| `redux/slices/authSlice.ts` | `/auth/login/`, `/auth/register/`, `/auth/profile/`, `/auth/logout/`, `/auth/google-login/` |
| `redux/slices/authSlice_new.ts` | `/auth/login/`, `/auth/register/`, `/auth/profile/`, `/auth/logout/`, `/auth/google-login/` |
| `services/tokenService.ts` | `/auth/refresh/` |
| `services/googleLoginService.ts` | `/auth/google-login/` |
| `pages/Dashboard.tsx` | `/companies/companies/`, `/kanban/tasks/`, `/communities/communities/` |
| `pages/DashboardNew.tsx` | `/companies/companies/`, `/kanban/tasks/`, `/communities/communities/` |
| `pages/CompaniesPage.tsx` | `/companies/companies/`, `/companies/companies/stats/` |

### 3. Padrão Correto Agora

```typescript
// ✅ CORRETO
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// ✅ Chamadas sem /api/ inicial
await api.post('/auth/login/', {...});
await api.get('/companies/companies/');
await api.post('/chat/rooms/{id}/messages/', {...});
```

**Resultado final:**
- `http://localhost:8000/api` + `/auth/login/` = `http://localhost:8000/api/auth/login/` ✅

---

## 🧪 Como Testar

### 1. Verificar que não há mais URLs duplicadas:

```bash
cd frontend/src
grep -r "api\.\(get\|post\|put\|patch\|delete\)('/api/" --include="*.ts" --include="*.tsx"
```

**Resultado esperado:** 0 matches (exceto em comentários/docs)

### 2. Testar Login:

1. Abrir http://localhost:3000
2. Fazer login com:
   - Username: `admin`
   - Senha: `123456`
3. **✅ Login deve funcionar** sem erros 404

### 3. Verificar Console:

Antes:
```
❌ POST /api/api/auth/login/ 404
```

Depois:
```
✅ POST /api/auth/login/ 200
```

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| **Arquivos corrigidos** | 7 |
| **Rotas corrigidas** | 15+ |
| **Tempo de correção** | ~10 minutos |
| **Testes necessários** | Login, Registro, Dashboard, Companies |

---

## 🎯 Próximos Passos

1. ✅ Correção aplicada
2. ⏳ Testar login/cadastro
3. ⏳ Testar dashboard
4. ⏳ Testar CRUD de empresas
5. ⏳ Verificar chat (WebSocket pode precisar ajuste)

---

## 💡 Lição Aprendida

**Regra de Ouro:**
- `baseURL` do axios **DEVE** incluir `/api` se todas as rotas começam com `/api/`
- **OU** `baseURL` **NÃO DEVE** incluir `/api` e todas as rotas devem começar com `/api/`

**Nunca:**
- `baseURL = 'http://localhost:8000/api'` + rota `'/api/auth/login/'` ❌
- Isso cria `/api/api/auth/login/`

**Correto:**
- `baseURL = 'http://localhost:8000/api'` + rota `'/auth/login/'` ✅
- `baseURL = 'http://localhost:8000'` + rota `'/api/auth/login/'` ✅

---

**Data:** 12/11/2025  
**Status:** ✅ Corrigido  
**Testado:** ⏳ Pendente
