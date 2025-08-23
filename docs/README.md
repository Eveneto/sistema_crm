# 🏢 CRM System - Sistema de Gestão de Relacionamento com Cliente

Sistema completo de CRM desenvolvido com React + TypeScript e Django REST Framework, incluindo Kanban board, chat em tempo real e gestão de empresas clientes.

## 🚀 Funcionalidades

- ✅ **Autenticação JWT** - Sistema de login seguro
- ✅ **Gestão de Empresas** - CRUD completo de clientes
- ✅ **Kanban Board** - Drag & drop para gestão de leads
- ✅ **Chat em Tempo Real** - Comunicação entre membros da equipe
- ✅ **Dashboard** - Métricas e estatísticas
- ✅ **Notificações** - Sistema de notificações real-time
- ✅ **Responsivo** - Interface adaptada para mobile

## 🛠️ Tecnologias

### Frontend
- **React 19** + TypeScript
- **Ant Design** - Componentes UI profissionais
- **Redux Toolkit** - Gerenciamento de estado
- **React Router** - Navegação
- **DnD Kit** - Drag & drop
- **Socket.io Client** - WebSocket real-time
- **Axios** - Cliente HTTP

### Backend
- **Django 4.2** + Python 3.11
- **Django REST Framework** - APIs REST
- **Django Channels** - WebSocket support
- **JWT Authentication** - Autenticação segura
- **MySQL 8.0** - Banco de dados
- **Redis** - Cache e WebSocket scaling

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│   React + TS    │◄──►│   Django API    │◄──►│    MySQL        │
│                 │    │                 │    │                 │
│ • Ant Design    │    │ • REST APIs     │    │ • Users         │
│ • Redux Toolkit │    │ • WebSockets    │    │ • Companies     │
│ • Socket.io     │    │ • JWT Auth      │    │ • Leads         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              WebSocket Connection
                    │
            ┌─────────────────┐
            │      REDIS      │
            │ Cache + Queue   │
            └─────────────────┘
```

## 🚦 Quick Start

### Opção 1: Docker (Recomendado)

```bash
# Clone o repositório
git clone <repo-url>
cd crm_freela

# Execute com Docker Compose
docker-compose up --build

# Acesse:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/swagger/
```

### Opção 2: Desenvolvimento Local

#### Backend Setup

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar banco de dados
cp .env.example .env
# Edite .env com suas configurações

# Executar migrações
python manage.py migrate
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar desenvolvimento
npm start
```

## 📊 Banco de Dados

### Principais Entidades

```sql
Users (Usuários do sistema)
├── id, username, email, role
├── phone, avatar, created_at

Companies (Empresas clientes)
├── id, name, email, phone, website
├── industry, size, notes
└── created_by, created_at

Boards (Quadros Kanban)
├── id, name, description
└── created_by, created_at

Leads (Oportunidades)
├── id, title, description, value
├── company_id, stage_id, board_id
├── priority, assigned_to
└── created_at, updated_at

Chat (Sistema de mensagens)
├── Rooms (Salas)
├── Messages (Mensagens)
└── Participants (Participantes)
```

## 🔌 APIs Principais

### Autenticação
```
POST /api/auth/login/     # Login
POST /api/auth/register/  # Registro
GET  /api/auth/profile/   # Perfil do usuário
POST /api/auth/logout/    # Logout
```

### Empresas
```
GET    /api/companies/           # Listar empresas
POST   /api/companies/           # Criar empresa
GET    /api/companies/{id}/      # Detalhes
PUT    /api/companies/{id}/      # Atualizar
DELETE /api/companies/{id}/      # Deletar
```

### Kanban
```
GET  /api/kanban/boards/     # Listar boards
GET  /api/kanban/leads/      # Listar leads
POST /api/kanban/leads/      # Criar lead
PUT  /api/kanban/leads/{id}/ # Atualizar lead
```

### WebSocket Endpoints
```
ws://localhost:8000/ws/chat/{room_id}/     # Chat real-time
ws://localhost:8000/ws/notifications/      # Notificações
```

## 🧪 Testes

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm test
```

## 🚀 Deploy

### Produção com Docker

```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Variáveis de Ambiente

#### Backend (.env)
```bash
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=mysql://user:pass@localhost:3306/crm_db
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=your-domain.com
```

#### Frontend (.env)
```bash
REACT_APP_API_BASE_URL=https://api.your-domain.com
REACT_APP_SOCKET_URL=wss://api.your-domain.com
```

## 📁 Estrutura do Projeto

```
crm_freela/
├── backend/                 # Django Backend
│   ├── apps/
│   │   ├── authentication/ # Sistema de auth
│   │   ├── companies/      # Gestão de empresas
│   │   ├── kanban/         # Sistema Kanban
│   │   ├── chat/           # Chat real-time
│   │   └── dashboard/      # Dashboard e métricas
│   ├── crm_backend/        # Configurações Django
│   └── requirements.txt    # Dependências Python
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas
│   │   ├── redux/          # Estado global
│   │   ├── services/       # Serviços API
│   │   └── types/          # Tipos TypeScript
│   └── package.json        # Dependências Node
├── docker-compose.yml      # Docker para desenvolvimento
└── README.md              # Esta documentação
```

## 🗺️ Roadmap

### ✅ Versão 1.0 (Atual)
- [x] Sistema de autenticação JWT
- [x] CRUD de empresas/clientes
- [x] Dashboard básico
- [x] Kanban board (estrutura)
- [x] Chat system (estrutura)
- [x] Integração frontend-backend
- [x] Docker para desenvolvimento

### 🚀 Versão 1.1 (Próxima Release)
- [ ] **Login via Google OAuth 2.0** - Autenticação social
- [ ] Implementação completa do Kanban (drag & drop)
- [ ] Chat em tempo real funcional
- [ ] Sistema de notificações
- [ ] Filtros avançados no dashboard
- [ ] Upload de arquivos/documentos

### 🔮 Versão 1.2 (Futura)
- [ ] Login via Facebook/LinkedIn
- [ ] Relatórios e analytics avançados
- [ ] API webhooks para integração
- [ ] Sistema de templates de email
- [ ] Mobile app (React Native)
- [ ] Multi-tenancy (várias empresas)

### 🌟 Versão 2.0 (Long Term)
- [ ] IA para análise de leads
- [ ] Automação de marketing
- [ ] Integração com CRMs existentes
- [ ] Sistema de billing/cobrança
- [ ] White-label solution

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

- 📧 Email: support@crm.com
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Website: https://crm.com

---

**Desenvolvido com ❤️ para otimizar a gestão de relacionamento com clientes**
