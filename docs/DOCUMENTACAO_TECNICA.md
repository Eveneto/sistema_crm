# 🔧 DOCUMENTAÇÃO TÉCNICA - SISTEMA CRM

## 📋 ÍNDICE
1. [Arquitetura do Sistema](#arquitetura)
2. [Stack Tecnológica](#stack)
3. [Banco de Dados](#database)
4. [APIs e Endpoints](#apis)
5. [Cronograma Técnico](#cronograma)
6. [Estrutura do Projeto](#estrutura)
7. [Configurações e Deploy](#deploy)

---

## 🏗️ ARQUITETURA DO SISTEMA <a id="arquitetura"></a>

### **Padrão Arquitetural: MVC + API REST + WebSockets**

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│     FRONTEND        │    │      BACKEND        │    │     DATABASE        │
│     (React SPA)     │◄──►│    (Django API)     │◄──►│      (MySQL)        │
│                     │    │                     │    │                     │
│ • React Components  │    │ • Django REST API   │    │ • Relational Schema │
│ • Redux Toolkit     │    │ • Django Channels   │    │ • Normalized Tables │
│ • Ant Design UI     │    │ • JWT Authentication│    │ • Indexes/Relations │
│ • Socket.io Client  │    │ • WebSocket Support │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
         │                          │                          
         └──────────────────────────┘                          
              WebSocket Connection                             
                                                              
┌─────────────────────┐                                       
│       REDIS         │                                       
│   (Cache + Queue)   │                                       
│ • Session Storage   │                                       
│ • WebSocket State   │                                       
│ • Background Tasks  │                                       
└─────────────────────┘                                       
```

### **Comunicação entre Camadas:**
- **HTTP REST**: CRUD operations, Authentication
- **WebSockets**: Real-time chat, notifications
- **Redis**: Session management, WebSocket scaling

---

## 🛠️ STACK TECNOLÓGICA <a id="stack"></a>

### **Frontend Stack**
```json
{
  "runtime": "Node.js 18+",
  "framework": "React 18.2",
  "language": "JavaScript ES2022",
  "ui_library": "Ant Design 5.x",
  "state_management": "Redux Toolkit",
  "routing": "React Router Dom 6.x",
  "http_client": "Axios",
  "websocket": "Socket.io-client",
  "drag_drop": "react-beautiful-dnd",
  "build_tool": "Create React App / Vite"
}
```

### **Backend Stack**
```json
{
  "runtime": "Python 3.11+",
  "framework": "Django 4.2 LTS",
  "api": "Django REST Framework 3.14",
  "websocket": "Django Channels 4.0",
  "authentication": "djangorestframework-simplejwt",
  "database": "MySQL 8.0",
  "cache": "Redis 7.0",
  "task_queue": "Celery",
  "cors": "django-cors-headers"
}
```

### **DevOps & Infraestrutura**
```json
{
  "containerization": "Docker + Docker Compose",
  "web_server": "Nginx",
  "process_manager": "Gunicorn",
  "environment": "python-dotenv",
  "monitoring": "Django Debug Toolbar (dev)"
}
```

---

## 🗄️ BANCO DE DADOS <a id="database"></a>

### **Esquema Relacional (MySQL)**

```sql
-- Usuários (extends Django User)
CREATE TABLE auth_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    date_joined DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profile (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
);

-- Empresas Clientes
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(254),
    phone VARCHAR(20),
    website VARCHAR(255),
    industry VARCHAR(100),
    size ENUM('startup', 'small', 'medium', 'large', 'enterprise'),
    address TEXT,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES auth_user(id),
    INDEX idx_name (name),
    INDEX idx_industry (industry)
);

-- Boards Kanban
CREATE TABLE boards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES auth_user(id)
);

-- Estágios/Colunas do Kanban
CREATE TABLE stages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    board_id INT,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#1890ff',
    order_position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    INDEX idx_board_order (board_id, order_position)
);

-- Leads/Oportunidades
CREATE TABLE leads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT,
    stage_id INT,
    board_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(15,2),
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    probability INT CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    assigned_to INT,
    created_by INT,
    order_position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (stage_id) REFERENCES stages(id),
    FOREIGN KEY (board_id) REFERENCES boards(id),
    FOREIGN KEY (assigned_to) REFERENCES auth_user(id),
    FOREIGN KEY (created_by) REFERENCES auth_user(id),
    INDEX idx_stage_order (stage_id, order_position),
    INDEX idx_assigned (assigned_to),
    INDEX idx_company (company_id)
);

-- Salas de Chat
CREATE TABLE chat_rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    type ENUM('direct', 'group', 'general') DEFAULT 'group',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES auth_user(id)
);

-- Participantes das Salas
CREATE TABLE chat_room_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT,
    user_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES auth_user(id),
    UNIQUE KEY unique_participation (room_id, user_id)
);

-- Mensagens do Chat
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT,
    sender_id INT,
    content TEXT NOT NULL,
    message_type ENUM('text', 'file', 'system') DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES auth_user(id),
    INDEX idx_room_time (room_id, created_at),
    INDEX idx_sender (sender_id)
);

-- Notificações
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id),
    INDEX idx_user_unread (user_id, is_read, created_at)
);
```

---

## 🚀 APIs E ENDPOINTS <a id="apis"></a>

### **Autenticação**
```
POST   /api/auth/login/          # Login (JWT)
POST   /api/auth/register/       # Registro
POST   /api/auth/refresh/        # Refresh token
POST   /api/auth/logout/         # Logout
GET    /api/auth/me/             # User info
```

### **Empresas**
```
GET    /api/companies/           # Listar empresas (filtros, paginação)
POST   /api/companies/           # Criar empresa
GET    /api/companies/{id}/      # Detalhes da empresa
PUT    /api/companies/{id}/      # Atualizar empresa
DELETE /api/companies/{id}/      # Deletar empresa
GET    /api/companies/{id}/leads/ # Leads da empresa
```

### **Kanban**
```
GET    /api/boards/              # Listar boards
POST   /api/boards/              # Criar board
GET    /api/boards/{id}/         # Detalhes do board
PUT    /api/boards/{id}/         # Atualizar board
DELETE /api/boards/{id}/         # Deletar board

GET    /api/stages/              # Listar estágios
POST   /api/stages/              # Criar estágio
PUT    /api/stages/{id}/         # Atualizar estágio
DELETE /api/stages/{id}/         # Deletar estágio
POST   /api/stages/reorder/      # Reordenar estágios

GET    /api/leads/               # Listar leads
POST   /api/leads/               # Criar lead
GET    /api/leads/{id}/          # Detalhes do lead
PUT    /api/leads/{id}/          # Atualizar lead
DELETE /api/leads/{id}/          # Deletar lead
POST   /api/leads/{id}/move/     # Mover lead entre estágios
```

### **Chat**
```
GET    /api/chat/rooms/          # Listar salas
POST   /api/chat/rooms/          # Criar sala
GET    /api/chat/rooms/{id}/messages/ # Mensagens da sala
POST   /api/chat/rooms/{id}/messages/ # Enviar mensagem
PUT    /api/chat/messages/{id}/read/   # Marcar como lida
```

### **Dashboard**
```
GET    /api/dashboard/stats/     # Estatísticas gerais
GET    /api/dashboard/leads-by-stage/ # Leads por estágio
GET    /api/dashboard/companies-growth/ # Crescimento empresas
```

### **WebSocket Channels**
```
ws://localhost:8000/ws/chat/{room_id}/     # Chat em tempo real
ws://localhost:8000/ws/notifications/      # Notificações
ws://localhost:8000/ws/kanban/{board_id}/  # Updates do Kanban
```

---

## ⏰ CRONOGRAMA TÉCNICO <a id="cronograma"></a>

### **SEMANA 1: INFRAESTRUTURA E BASE**

#### **Dias 1-2: Setup Inicial**
**Backend Tasks:**
- [ ] Django project setup + virtual environment
- [ ] Install dependencies (Django, DRF, Channels, etc.)
- [ ] MySQL configuration + initial migration
- [ ] Redis configuration
- [ ] Basic models (User, Company)
- [ ] Django settings (CORS, JWT, etc.)
- [ ] Initial API structure

**Frontend Tasks:**
- [ ] Create React App setup
- [ ] Install dependencies (Ant Design, Redux, etc.)
- [ ] Project structure organization
- [ ] Base components (Layout, Header, Sidebar)
- [ ] Redux store configuration
- [ ] Axios setup with interceptors

#### **Dias 3-5: Authentication System**
**Backend:**
- [ ] JWT authentication implementation
- [ ] User serializers and views
- [ ] Permission classes
- [ ] Authentication middleware
- [ ] Basic unit tests

**Frontend:**
- [ ] Login/Register forms (Ant Design)
- [ ] Authentication Redux slice
- [ ] Protected routes implementation
- [ ] Token management
- [ ] Auth interceptors

### **SEMANA 2: CORE FEATURES**

#### **Dias 1-3: Companies & Kanban Backend**
**Backend:**
- [ ] Company CRUD APIs complete
- [ ] Board, Stage, Lead models implementation
- [ ] Kanban CRUD APIs
- [ ] Business logic validations
- [ ] Serializers with nested data
- [ ] API filtering and pagination

**Frontend:**
- [ ] Companies list page (Ant Design Table)
- [ ] Company form modal
- [ ] Companies Redux slice
- [ ] Search and filtering

#### **Dias 4-5: Kanban Frontend**
**Backend:**
- [ ] Kanban drag & drop API endpoints
- [ ] Stage reordering logic
- [ ] Lead movement validation

**Frontend:**
- [ ] Kanban board component
- [ ] react-beautiful-dnd integration
- [ ] Lead cards component
- [ ] Drag & drop functionality
- [ ] Kanban Redux slice

### **SEMANA 3: REAL-TIME & INTEGRATION**

#### **Dias 1-3: Chat System**
**Backend:**
- [ ] Django Channels configuration
- [ ] WebSocket consumers
- [ ] Chat models (Room, Message)
- [ ] Chat APIs for history
- [ ] Redis channel layers

**Frontend:**
- [ ] Chat component UI
- [ ] Socket.io integration
- [ ] Real-time message handling
- [ ] Chat Redux slice
- [ ] Message history loading

#### **Dias 4-5: Dashboard & Notifications**
**Backend:**
- [ ] Dashboard statistics APIs
- [ ] Notification system
- [ ] WebSocket notifications
- [ ] Performance optimizations

**Frontend:**
- [ ] Dashboard with charts
- [ ] Notification system
- [ ] Real-time updates
- [ ] Mobile responsiveness
- [ ] Error handling improvements

### **SEMANA 4: TESTING & DEPLOYMENT**

#### **Dias 1-3: Quality Assurance**
**Backend:**
- [ ] Unit tests completion (>70% coverage)
- [ ] Integration tests
- [ ] API documentation (Swagger)
- [ ] Performance testing
- [ ] Security audit

**Frontend:**
- [ ] Component testing
- [ ] Integration tests
- [ ] E2E testing setup
- [ ] Performance optimization
- [ ] Accessibility improvements

#### **Dias 4-5: Deployment**
- [ ] Docker containerization
- [ ] Production settings
- [ ] Environment variables
- [ ] Database migration scripts
- [ ] Server deployment
- [ ] SSL configuration
- [ ] Monitoring setup

---

## 📁 ESTRUTURA DO PROJETO <a id="estrutura"></a>

### **Backend Structure (Django)**
```
crm_backend/
├── crm_backend/
│   ├── __init__.py
│   ├── asgi.py              # WebSocket configuration
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py          # Base settings
│   │   ├── development.py   # Dev settings
│   │   └── production.py    # Prod settings
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── __init__.py
│   ├── authentication/      # JWT Auth app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── companies/           # Companies management
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── filters.py
│   │   └── urls.py
│   ├── kanban/             # Kanban system
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── chat/               # Real-time chat
│   │   ├── models.py
│   │   ├── consumers.py    # WebSocket consumers
│   │   ├── routing.py      # WebSocket routing
│   │   ├── serializers.py
│   │   └── views.py
│   └── dashboard/          # Analytics
│       ├── views.py
│       └── urls.py
├── static/
├── media/
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── docker-compose.yml
├── Dockerfile
├── manage.py
└── README.md
```

### **Frontend Structure (React)**
```
crm_frontend/
├── public/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/
│   │   │   ├── Layout.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── ui/             # UI components
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   └── forms/          # Form components
│   ├── pages/              # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── companies/
│   │   │   ├── CompaniesList.jsx
│   │   │   └── CompanyForm.jsx
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.jsx
│   │   │   └── LeadCard.jsx
│   │   ├── chat/
│   │   │   └── ChatRoom.jsx
│   │   └── dashboard/
│   │       └── Dashboard.jsx
│   ├── redux/              # State management
│   │   ├── store.js
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── companiesSlice.js
│   │   │   ├── kanbanSlice.js
│   │   │   └── chatSlice.js
│   │   └── middleware/
│   ├── services/           # API services
│   │   ├── api.js          # Axios configuration
│   │   ├── authService.js
│   │   ├── companiesService.js
│   │   └── socketService.js
│   ├── utils/              # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.js
│   │   └── useSocket.js
│   ├── styles/             # CSS files
│   ├── App.jsx
│   └── index.js
├── package.json
├── Dockerfile
└── README.md
```

---

## 🚀 CONFIGURAÇÕES E DEPLOY <a id="deploy"></a>

### **Environment Variables**
```bash
# Backend (.env)
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=mysql://user:pass@localhost:3306/crm_db
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Frontend (.env)
REACT_APP_API_BASE_URL=https://api.your-domain.com
REACT_APP_SOCKET_URL=wss://api.your-domain.com
```

### **Docker Configuration**
```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: crm_db
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine

  backend:
    build: ./crm_backend
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=mysql://root:rootpassword@db:3306/crm_db
      - REDIS_URL=redis://redis:6379/0

  frontend:
    build: ./crm_frontend
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend

volumes:
  mysql_data:
```

### **Performance Targets**
- **API Response Time**: < 500ms (95th percentile)
- **Frontend Load Time**: < 2s (First Contentful Paint)
- **WebSocket Latency**: < 100ms
- **Database Query Time**: < 200ms
- **Concurrent Users**: 50+ simultaneous

### **Security Measures**
- JWT tokens with short expiration
- CORS properly configured
- SQL injection prevention (ORM)
- XSS protection (CSP headers)
- Rate limiting on APIs
- HTTPS enforcement
- Input validation and sanitization

---

## 🔧 DEVELOPMENT SETUP

### **Backend Setup**
```bash
# Clone and setup
cd crm_backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements/development.txt

# Database setup
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### **Frontend Setup**
```bash
# Clone and setup
cd crm_frontend
npm install
npm start
```

### **Full Stack with Docker**
```bash
docker-compose up --build
```

---

**📝 Nota:** Esta documentação será atualizada durante o desenvolvimento com detalhes específicos de implementação e eventuais ajustes na arquitetura.
