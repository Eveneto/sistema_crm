# 🧪 GUIA COMPLETO DE TESTES MANUAIS - CRM SYSTEM

## 📋 **CHECKLIST COMPLETO DE FUNCIONALIDADES**

### **🔐 1. AUTENTICAÇÃO**
- [ ] Login com credenciais válidas (`admin@example.com` / `admin123`)
- [ ] Login com credenciais inválidas (deve mostrar erro)
- [ ] Logout e redirecionamento
- [ ] Persistência de sessão após reload da página
- [ ] Login com Google (se implementado)
- [ ] Redirecionamento de páginas protegidas para login

**🔗 URLs para testar:**
- Login: `http://localhost:3000/login`
- Dashboard: `http://localhost:3000/dashboard`

---

### **🏢 2. GESTÃO DE EMPRESAS (CRUD Completo)**
- [ ] **Listar empresas** - Ver todas as empresas cadastradas
- [ ] **Criar empresa** - Formulário de nova empresa
- [ ] **Editar empresa** - Modificar dados existentes
- [ ] **Excluir empresa** - Remover empresa
- [ ] **Buscar/Filtrar** - Pesquisar por nome, setor, etc.
- [ ] **Paginação** - Navegar entre páginas de resultados
- [ ] **Ordenação** - Ordenar por diferentes campos
- [ ] **Validação de formulários** - Campos obrigatórios

**🔗 URL:** `http://localhost:3000/companies`

**📊 Dados de teste sugeridos:**
```
Nome: Tech Solutions Ltda
Setor: Tecnologia
Email: contato@techsolutions.com
Telefone: (11) 9999-8888
Status: Ativo
```

---

### **📊 3. DASHBOARD & ANALYTICS**
- [ ] **Métricas principais** - Números de empresas, leads, vendas
- [ ] **Gráficos** - Charts funcionando (Chart.js)
- [ ] **Cards informativos** - Estatísticas atualizadas
- [ ] **Performance** - Carregamento rápido dos dados
- [ ] **Responsividade** - Dashboard em mobile/tablet

**🔗 URL:** `http://localhost:3000/dashboard`

---

### **📋 4. SISTEMA KANBAN (Pipeline de Vendas)**
- [ ] **Visualizar colunas** - Lead, Qualificado, Proposta, Fechado
- [ ] **Criar tarefas/cards** - Adicionar novos itens
- [ ] **Arrastar e soltar** - Mover cards entre colunas
- [ ] **Editar cards** - Modificar informações
- [ ] **Excluir cards** - Remover itens
- [ ] **Filtros** - Por responsável, data, valor
- [ ] **Responsáveis** - Atribuir usuários aos cards

**🔗 URL:** `http://localhost:3000/kanban`

---

### **💬 5. SISTEMA DE CHAT**
- [ ] **Chat em tempo real** - WebSocket funcionando
- [ ] **Enviar mensagens** - Texto simples
- [ ] **Receber mensagens** - Updates automáticos
- [ ] **Lista de usuários online** - Presença em tempo real
- [ ] **Histórico de mensagens** - Carregar conversas antigas
- [ ] **Notificações** - Alertas de novas mensagens
- [ ] **Múltiplas abas** - Chat sincronizado entre abas

**🔗 URL:** `http://localhost:3000/chat`

---

### **👥 6. COMUNIDADES (Se implementado)**
- [ ] **Listar comunidades** - Ver comunidades disponíveis
- [ ] **Criar comunidade** - Nova comunidade
- [ ] **Entrar/Sair** - Gerenciar participação
- [ ] **Membros** - Ver participantes
- [ ] **Moderação** - Funcionalidades de admin

**🔗 URL:** `http://localhost:3000/communities`

---

### **🔧 7. FUNCIONALIDADES TÉCNICAS**
- [ ] **Navegação** - Menu lateral funcionando
- [ ] **Responsividade** - Mobile, tablet, desktop
- [ ] **Loading states** - Indicadores de carregamento
- [ ] **Error handling** - Tratamento de erros
- [ ] **Validações** - Formulários com validação
- [ ] **Feedback visual** - Mensagens de sucesso/erro
- [ ] **Performance** - Carregamento rápido
- [ ] **SEO/URLs** - Rotas funcionando corretamente

---

### **🚀 8. INTEGRAÇÃO COM BACKEND**
- [ ] **APIs funcionando** - Todas as requisições retornando dados
- [ ] **Autenticação JWT** - Tokens sendo enviados
- [ ] **CORS configurado** - Frontend se comunicando com backend
- [ ] **Error handling** - Tratamento de erros de API
- [ ] **Timeout handling** - Requisições não travando

**📡 Backend APIs para verificar:**
```
http://localhost:8000/api/auth/profile/
http://localhost:8000/api/companies/companies/
http://localhost:8000/api/companies/companies/stats/
http://localhost:8000/api/communities/communities/
```

---

## 🎯 **PLANO DE TESTES - ORDEM RECOMENDADA**

### **Fase 1: Básico (5 min)**
1. Fazer login no sistema
2. Navegar entre as páginas principais
3. Verificar se menus e layouts funcionam

### **Fase 2: CRUD Principal (10 min)**
1. Testar criação de empresa
2. Testar edição de empresa
3. Testar exclusão de empresa
4. Testar busca e filtros

### **Fase 3: Funcionalidades Avançadas (15 min)**
1. Testar Dashboard e gráficos
2. Testar Kanban (drag & drop)
3. Testar Chat (tempo real)
4. Testar responsividade

### **Fase 4: Edge Cases (5 min)**
1. Testar logout e re-login
2. Testar navegação com F5 (refresh)
3. Testar URLs diretas
4. Testar validações de formulário

---

## 📊 **CRITÉRIOS DE SUCESSO**

### ✅ **Funcionalidade Básica (MVP)**
- Login/logout funcionando
- CRUD de empresas completo
- Dashboard com dados
- Navegação fluida

### 🚀 **Funcionalidade Avançada**
- Kanban com drag & drop
- Chat em tempo real
- Responsividade completa
- Performance otimizada

### 🏆 **Funcionalidade Premium**
- Comunidades funcionando
- Analytics avançados
- Notificações em tempo real
- PWA features

---

## 🐛 **REGISTRO DE PROBLEMAS**

**Template para reportar problemas:**
```
❌ PROBLEMA: [Descrever o que não funciona]
📍 LOCALIZAÇÃO: [URL e página específica]
🔄 PASSOS: [Como reproduzir]
✅ ESPERADO: [O que deveria acontecer]
❗ PRIORIDADE: [Alta/Média/Baixa]
```

---

**🚀 VAMOS COMEÇAR! Abra o navegador e acesse: http://localhost:3000**
