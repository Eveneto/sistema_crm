# 🏢 CRM System - Production Ready

[![Version](https://img.shields.io/badge/version-v2.5.0-blue.svg)](https://github.com/Eveneto/sistema_crm/releases/tag/v2.5.0)
[![Tests](https://img.shields.io/badge/tests-135%20passing-success.svg)](https://github.com/Eveneto/sistema_crm)
[![Build Status](https://img.shields.io/badge/build-production%20ready-success.svg)](https://github.com/Eveneto/sistema_crm)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Sistema de Gestão de Relacionamento com Cliente moderno, construído com **Django REST Framework** e **React TypeScript**, certificado como **pronto para produção** com **135 testes automatizados**.

---

## 🚀 **Características Principais**

### ✨ **Sistema Completo de CRM**
- 👥 **Gestão de Empresas** - CRUD completo com validações
- 📊 **Dashboard Analytics** - Métricas em tempo real
- 📋 **Kanban Board** - Gestão visual de projetos
- 💬 **Chat Real-time** - Comunicação interna via WebSocket
- 🔐 **Autenticação Segura** - JWT + HttpOnly Cookies

### 🏆 **Qualidade Profissional**
- ✅ **135 testes automatizados** (100% passando)
- ✅ **TypeScript** para type safety
- ✅ **Responsive design** mobile-first
- ✅ **Error handling** robusto
- ✅ **Performance otimizada**

---

## 🛠️ **Stack Tecnológica**

### **Backend**
- 🐍 **Django 4.2** + **Django REST Framework**
- 🔑 **JWT Authentication** + **Firebase Integration**
- 🗄️ **SQLite** (desenvolvimento) / **MySQL** (produção)
- 📡 **WebSocket** para real-time features
- 🧪 **16 testes unitários** passando

### **Frontend**
- ⚛️ **React 18** + **TypeScript**
- 🔄 **Redux Toolkit** para state management
- 🎨 **Ant Design** para UI components
- 📱 **Responsive design** com CSS modular
- 🧪 **119 testes Jest** + **React Testing Library**

### **DevOps & Deploy**
- 🐳 **Docker** + **Docker Compose**
- 🌐 **Nginx** com SSL/TLS
- 🔒 **Let's Encrypt** para certificados
- 📊 **Logging** e monitoramento
- 🚀 **Deploy automatizado**

---

## 🚀 **Quick Start**

### **Desenvolvimento**

```bash
# Clone o repositório
git clone https://github.com/Eveneto/sistema_crm.git
cd sistema_crm

# Setup completo com Docker
docker-compose up -d

# Ou setup manual:

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (novo terminal)
cd frontend
npm install
npm start
```

**Acesse:** `http://localhost:3000`

### **Produção**

```bash
# Deploy automatizado
./deploy_production.sh

# Ou usando Docker Compose
docker-compose -f docker-compose.production.yml up -d
```

---

## 🧪 **Sistema de Testes**

### **Executar Todos os Testes**
```bash
# Script automatizado (recomendado)
./test_simple.sh

# Testes específicos
cd backend && python manage.py test    # Backend (16 testes)
cd frontend && npm test                # Frontend (119 testes)
```

### **Cobertura de Testes**
- **Backend**: 16/16 testes Django passando
- **Frontend**: 119/119 testes Jest passando
- **E2E**: 6 suites Cypress implementadas
- **Total**: 135 testes automatizados

### **Tipos de Testes**
- ✅ **Unit Tests** - Componentes e funções
- ✅ **Integration Tests** - Fluxos completos
- ✅ **API Tests** - Endpoints e autenticação
- ✅ **Performance Tests** - Speed e memory

---

## 📁 **Estrutura do Projeto**

```
sistema_crm/
├── backend/                    # Django REST API
│   ├── apps/
│   │   ├── authentication/    # Sistema de auth
│   │   ├── companies/         # Gestão de empresas
│   │   ├── kanban/           # Board de projetos
│   │   ├── chat/             # Chat real-time
│   │   └── dashboard/        # Analytics
│   ├── requirements.txt
│   └── manage.py
├── frontend/                   # React TypeScript
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── redux/           # State management
│   │   ├── services/        # API integration
│   │   └── __tests__/       # 119 testes Jest
│   ├── package.json
│   └── public/
├── docker-compose.yml          # Desenvolvimento
├── docker-compose.production.yml  # Produção
├── deploy_production.sh        # Script de deploy
└── test_simple.sh             # Testes automatizados
```

---

## 🔐 **Segurança**

### **Características de Segurança**
- 🛡️ **JWT + HttpOnly Cookies** para autenticação
- 🔒 **CSRF Protection** ativo
- 🚫 **Rate limiting** configurado
- ✅ **Input validation** rigorosa
- 🔍 **SQL injection** prevenção
- 🚦 **CORS** configurado adequadamente

### **Configurações de Produção**
- ✅ **DEBUG=False** obrigatório
- ✅ **SECRET_KEY** segura gerada
- ✅ **HTTPS** com certificados SSL
- ✅ **Firewall** configurado
- ✅ **Backup** automático

---

## 📊 **Funcionalidades**

### **Dashboard**
- 📈 Métricas de empresas e deals
- 📊 Gráficos interativos
- 🔄 Atualizações em tempo real
- 📱 Design responsivo

### **Gestão de Empresas**
- ➕ Criar/editar empresas
- 🔍 Busca e filtros avançados
- 📋 Lista paginada
- 📊 Estatísticas por categoria

### **Kanban Board**
- 📋 Colunas customizáveis
- 🎯 Drag & drop funcional
- 🏷️ Tags e prioridades
- 👥 Atribuição de membros

### **Chat Real-time**
- 💬 Mensagens instantâneas
- 👥 Salas de conversa
- 🔔 Notificações
- 📁 Compartilhamento de arquivos

---

## 🌟 **Recursos Avançados**

### **Performance**
- ⚡ **Lazy loading** de componentes
- 📦 **Code splitting** automático
- 🔄 **Caching** inteligente
- 📱 **PWA ready**

### **UX/UI**
- 🎨 **Design system** consistente
- 📱 **Mobile-first** responsive
- ♿ **Accessibility** (WCAG)
- 🌙 **Dark mode** ready

### **Developer Experience**
- 📝 **TypeScript** para type safety
- 🧪 **Hot reloading** development
- 📚 **Documentação** completa
- 🔍 **Error tracking** detalhado

---

## 📚 **Documentação**

### **Guias Disponíveis**
- 📋 [`DEPLOY_PRODUCTION_GUIDE.md`](DEPLOY_PRODUCTION_GUIDE.md) - Deploy completo
- 🔒 [`ANALISE_SEGURANCA_COMPLETA.md`](ANALISE_SEGURANCA_COMPLETA.md) - Análise de segurança
- 🧪 [`RELATORIO_TESTES_AUTOMATIZADOS_COMPLETO.md`](RELATORIO_TESTES_AUTOMATIZADOS_COMPLETO.md) - Testes
- 🚀 [`GITHUB_RELEASE_v2.5.0.md`](GITHUB_RELEASE_v2.5.0.md) - Release notes

### **Certificações**
- ✅ **Production Ready** - [`AVALIACAO_FINAL_SISTEMA_APROVADO.md`](AVALIACAO_FINAL_SISTEMA_APROVADO.md)
- 🔒 **Security Approved** - [`RELATORIO_SEGURANCA_FINAL_APROVADO.md`](RELATORIO_SEGURANCA_FINAL_APROVADO.md)

---

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Execute os testes (`./test_simple.sh`)
4. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
5. Push para a branch (`git push origin feature/AmazingFeature`)
6. Abra um Pull Request

---

## 📈 **Roadmap**

### **v2.6.0 - Próxima Release**
- [ ] Two-Factor Authentication (2FA)
- [ ] Advanced reporting dashboard
- [ ] Email integration
- [ ] Mobile app (React Native)

### **Futuras Versões**
- [ ] AI-powered insights
- [ ] Advanced workflow automation
- [ ] Multi-tenancy support
- [ ] Advanced permissions system

---

## 📄 **Licença**

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 **Agradecimentos**

- **Django** e **React** communities
- **Ant Design** team
- **Firebase** platform
- Todos os contribuidores

---

## 📞 **Suporte**

- 📧 **Email**: support@crmsystem.com
- 📱 **Issues**: [GitHub Issues](https://github.com/Eveneto/sistema_crm/issues)
- 📖 **Docs**: [Documentação Completa](docs/)

---

## 🏆 **Status do Projeto**

**✅ CERTIFICADO COMO PRODUCTION-READY**

- 🧪 **135 testes** automatizados passando
- 🔒 **Segurança** validada e aprovada
- ⚡ **Performance** otimizada
- 📱 **UX/UI** profissional
- 🚀 **Deploy** automatizado
- 📚 **Documentação** completa

**Pronto para usar em ambiente de produção! 🎯**

---

<div align="center">

**Desenvolvido com ❤️ para revolucionar a gestão de relacionamento com clientes**

[⭐ Star este projeto](https://github.com/Eveneto/sistema_crm) • [🐛 Reportar Bug](https://github.com/Eveneto/sistema_crm/issues) • [💡 Sugerir Feature](https://github.com/Eveneto/sistema_crm/issues)

</div>
