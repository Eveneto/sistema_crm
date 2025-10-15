# 🏢 CRM Sistema - Frontend Vanilla

Sistema CRM moderno desenvolvido com **HTML5 + CSS3 + JavaScript + Bootstrap 5 + jQuery**

## 🚀 **Stack Tecnológica**

### **Frontend**
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna (Grid, Flexbox, Variables)
- **JavaScript ES6+** - Funcionalidades interativas
- **Bootstrap 5.3.2** - Framework CSS responsivo
- **jQuery 3.7.1** - Manipulação DOM e AJAX
- **Chart.js** - Gráficos interativos
- **Bootstrap Icons** - Ícones

### **Backend**
- **Django REST Framework** - APIs robustas
- **Firebase Auth** - Autenticação
- **PostgreSQL/MySQL** - Banco de dados

---

## 📁 **Estrutura do Projeto**

```
frontend_vanilla/
├── index.html              # Página principal (SPA)
├── serve.py                # Servidor de desenvolvimento
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos customizados
│   └── js/
│       ├── app.js          # Aplicação principal
│       ├── components/     # Componentes reutilizáveis
│       │   ├── auth.js
│       │   ├── navigation.js
│       │   └── utils.js
│       ├── pages/          # Páginas do sistema
│       │   └── dashboard.js
│       └── services/       # Serviços de API
│           ├── api.js
│           └── firebase.js
└── README.md
```

---

## ⚡ **Inicialização Rápida**

### **1. Configurar Firebase**
Edite o arquivo `assets/js/services/firebase.js` com suas configurações:

```javascript
const firebaseConfig = {
    apiKey: "sua-api-key",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "sua-app-id"
};
```

### **2. Iniciar Backend Django**
```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver 8000
```

### **3. Iniciar Frontend**
```bash
# Terminal 2 - Frontend
cd frontend_vanilla
python serve.py
```

### **4. Acessar Sistema**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000

---

## 🎨 **Funcionalidades Implementadas**

### ✅ **Sistema de Autenticação**
- Login/Logout com Firebase
- Registro de usuários
- Proteção de rotas
- Gestão de sessão

### ✅ **Dashboard Interativo**
- Estatísticas em tempo real
- Gráficos responsivos (Chart.js)
- Atividades recentes
- Ações rápidas

### ✅ **Navegação SPA**
- Roteamento client-side
- Menu lateral responsivo
- Breadcrumbs automáticos
- Estado da aplicação

### ✅ **UI/UX Moderna**
- Design responsivo (Mobile-first)
- Tema escuro/claro
- Animações suaves
- Feedback visual (toasts)

---

## 🔌 **Integração com Backend**

### **APIs Disponíveis**
```javascript
// Companies
api.getCompanies()
api.createCompany(data)
api.updateCompany(id, data)
api.deleteCompany(id)

// Kanban
api.getTasks()
api.createTask(data)
api.updateTask(id, data)

// Communities
api.getCommunities()
api.createCommunity(data)

// Chat
api.getChatRooms()
api.sendMessage(roomId, data)
```

### **Autenticação**
```javascript
// Login
const result = await firebaseAuth.login(email, password);

// Logout
await firebaseAuth.logout();

// Verificar status
const isAuth = firebaseAuth.isAuthenticated();
```

---

## 🛠️ **Desenvolvimento**

### **Adicionar Nova Página**
1. Criar arquivo em `assets/js/pages/nova-pagina.js`
2. Implementar função `loadNovaPagina()`
3. Registrar no navigation:
```javascript
window.navigation.registerPage('nova-pagina', loadNovaPagina);
```

### **Adicionar Novo Componente**
1. Criar arquivo em `assets/js/components/`
2. Implementar funcionalidade
3. Importar no `index.html`

### **Estilos Customizados**
Editar `assets/css/style.css` - usa CSS Variables para temas:
```css
:root {
    --primary-color: #0d6efd;
    --secondary-color: #6c757d;
    /* ... */
}
```

---

## 📱 **Responsividade**

### **Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 992px  
- **Desktop**: > 992px

### **Componentes Adaptativos**
- Sidebar colapsável
- Cards empilháveis
- Tabelas scrolláveis
- Modais responsivos

---

## 🔧 **Configurações**

### **API Base URL**
Editar em `assets/js/services/api.js`:
```javascript
this.baseURL = 'http://localhost:8000'; // URL do Django
```

### **Timeout de Requisições**
```javascript
$.ajaxSetup({
    timeout: 30000 // 30 segundos
});
```

---

## 🧪 **Testing**

### **Testar Localmente**
1. Abrir DevTools (F12)
2. Console disponível: `window.DEBUG`
3. Testar APIs: `window.DEBUG.api()`

### **Debug Mode**
```javascript
// Available in localhost
window.DEBUG = {
    app: () => window.app,
    api: () => window.api,
    auth: () => window.firebaseAuth,
    navigation: () => window.navigation
};
```

---

## 🚀 **Deploy Production**

### **Build para Produção**
1. Minificar CSS/JS
2. Otimizar imagens
3. Configurar HTTPS
4. Atualizar URLs da API

### **Servidor Web**
- **Nginx** (recomendado)
- **Apache**
- **Vercel/Netlify** (estático)

---

## 📋 **TODO**

### **Próximas Implementações**
- [ ] Página de Companies CRUD
- [ ] Sistema Kanban drag & drop
- [ ] Chat em tempo real
- [ ] Gestão de Comunidades
- [ ] Upload de arquivos
- [ ] Notificações push
- [ ] PWA (Service Workers)

---

## 🤝 **Contribuição**

1. Fork o projeto
2. Criar branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Add nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Pull Request

---

## 📞 **Suporte**

- **Documentação**: Este README
- **Issues**: GitHub Issues
- **Debug**: Console do navegador + `window.DEBUG`

---

## 📄 **Licença**

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**🎯 Sistema CRM desenvolvido com foco em simplicidade, performance e manutenibilidade!**
