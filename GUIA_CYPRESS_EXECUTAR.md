# 🚀 Guia Prático: Executando Testes E2E no Cypress

## ✅ Pré-requisitos Verificados
- ✅ Frontend rodando em `localhost:3000`
- ✅ Backend rodando em `localhost:8000`
- ✅ Usuários de teste criados:
  - `admin@example.com` / `admin123` (Admin)
  - `manager@test.com` / `manager123` (Manager)
- ✅ Comandos Cypress corrigidos para seletores corretos

## 🎯 Como Executar os Testes

### 1. Teste de Debug (Recomendado primeiro)
No Cypress, procure e execute:
```
cypress/e2e/debug-login.cy.js
```

Este teste vai:
- ✅ Fazer screenshots do processo
- ✅ Logar informações dos elementos encontrados
- ✅ Tentar o login passo a passo
- ✅ Mostrar onde está falhando exatamente

### 2. Teste de Autenticação Completo
Depois que o debug funcionar, execute:
```
cypress/e2e/auth/authentication.spec.js
```

### 3. Testes por Módulo (em ordem)
1. **Authentication** - `cypress/e2e/auth/authentication.spec.js`
2. **Companies CRUD** - `cypress/e2e/companies_crud.spec.js`
3. **Kanban** - `cypress/e2e/kanban/kanban.spec.js`
4. **Chat** - `cypress/e2e/chat/chat.spec.js`

## 🔧 Problemas Comuns e Soluções

### Se o teste falhar com "Element not found":

1. **Verifique se React renderizou completamente**
   - Aumentar timeouts
   - Verificar console do navegador

2. **Elemento com nome diferente**
   - O comando de login agora usa múltiplas estratégias
   - Vai tentar placeholders, nomes e tipos diferentes

3. **Página não carregou**
   - Verificar se frontend está respondendo
   - Verificar se não há erros de JavaScript

### Se o login falhar:

1. **Credenciais incorretas**
   - Usar: `admin@example.com` / `admin123`
   - Ou: `manager@test.com` / `manager123`

2. **Backend não responde**
   - Verificar se API está em `localhost:8000`
   - Testar login manual: `curl -X POST localhost:8000/api/auth/login/`

## 📊 O que Esperar

### ✅ Teste de Sucesso:
- Screenshots salvos em `cypress/screenshots/`
- Login realizado com sucesso
- Redirecionamento para dashboard
- Menu lateral visível

### ❌ Se Falhar:
- Screenshots mostrarão exatamente onde parou
- Logs no Cypress mostrarão detalhes
- Verificar console do navegador no Cypress

## 🚀 Comando Rápido

No terminal do Cypress, você também pode executar:
```bash
# Apenas o teste de debug
npx cypress run --spec "cypress/e2e/debug-login.cy.js"

# Todos os testes de auth
npx cypress run --spec "cypress/e2e/auth/**/*"
```

## 🎬 Próximos Passos

1. **Execute o debug-login.cy.js primeiro**
2. **Analise os screenshots gerados**
3. **Se funcionar, execute os testes completos**
4. **Reporte qualquer erro específico encontrado**

---

🔍 **Dica**: Use o modo interativo do Cypress para ver o que está acontecendo em tempo real!
