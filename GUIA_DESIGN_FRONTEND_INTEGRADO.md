# 🎨 **GUIA DE DESIGN FRONTEND INTEGRADO - SISTEMA CRM**

## 📋 **VISÃO GERAL**

Este documento integra o **conceito visual do designer** com a **implementação técnica atual**, servindo como base para a **reescrita completa do CSS** do Sistema CRM.

**Objetivo**: Fornecer diretrizes completas para desenvolvimento visual consistente e implementação técnica robusta.

---

## 🏗️ **ARQUITETURA TÉCNICA**

### **Stack Tecnológica**
- **Frontend**: React 19.1.1 + TypeScript + Ant Design 5.27.0
- **Estado**: Redux Toolkit + Firebase Auth
- **Estilização**: CSS Custom Properties + CSS Grid + Container Queries
- **Gráficos**: Chart.js + Socket.io (tempo real)

### **Sistema de Design**
- **Tema Base**: Dark theme com azul primário (#0f172a)
- **Layout**: CSS Grid fluido com container queries
- **Responsividade**: Mobile-first com breakpoints fluidos
- **Acessibilidade**: WCAG 2.1 AA compliant

---

## 🎨 **SISTEMA DE CORES**

### **CSS Custom Properties (Variáveis)**
```css
/* Backgrounds */
--crm-bg-primary: #0f172a;
--crm-bg-secondary: #1e293b;
--crm-bg-elevated: #334155;
--crm-bg-hover: rgba(59, 130, 246, 0.1);

/* Text */
--crm-text-primary: #f8fafc;
--crm-text-secondary: #cbd5e1;
--crm-text-disabled: #64748b;

/* Accent */
--crm-accent: #3b82f6;
--crm-accent-light: #60a5fa;

/* Semantic */
--crm-success: #10b981;
--crm-warning: #f59e0b;
--crm-error: #ef4444;
--crm-info: #8b5cf6;

/* Borders */
--crm-border: #334155;
--crm-border-light: #475569;
```

### **Paleta Visual**
- **Primary**: #0f172a (Azul escuro profissional)
- **Secondary**: #1e293b (Cinza azulado)
- **Elevated**: #334155 (Superfícies elevadas)
- **Hover**: rgba(59, 130, 246, 0.1) (Transparente azul)

### **Texto**
- **Principal**: #f8fafc (Branco quase puro)
- **Secundário**: #cbd5e1 (Cinza claro)
- **Disabled**: #64748b (Cinza médio)

### **Estados Semânticos**
- **Success**: #10b981 (Verde esmeralda)
- **Warning**: #f59e0b (Âmbar)
- **Error**: #ef4444 (Vermelho)
- **Info**: #8b5cf6 (Roxo)

---

## 📐 **TIPOGRAFIA E ESPAÇAMENTOS**

### **Fonte Principal**
- **Family**: Inter (sans-serif)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Fallback**: system-ui, -apple-system, sans-serif

### **Escala Tipográfica Fluida**
```css
--crm-font-size-xs: clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem);   /* 12px → 14px */
--crm-font-size-sm: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);     /* 14px → 16px */
--crm-font-size-base: clamp(1rem, 0.9rem + 0.3vw, 1.125rem);    /* 16px → 18px */
--crm-font-size-lg: clamp(1.125rem, 1rem + 0.4vw, 1.25rem);     /* 18px → 20px */
--crm-font-size-xl: clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem);     /* 20px → 24px */
--crm-font-size-2xl: clamp(1.5rem, 1.3rem + 0.7vw, 2rem);       /* 24px → 32px */
```

### **Espaçamentos Fluidos**
```css
--crm-space-1: clamp(0.25rem, 0.2rem + 0.2vw, 0.5rem);    /* 4px → 8px */
--crm-space-2: clamp(0.5rem, 0.4rem + 0.3vw, 0.75rem);    /* 8px → 12px */
--crm-space-3: clamp(0.75rem, 0.6rem + 0.4vw, 1rem);      /* 12px → 16px */
--crm-space-4: clamp(1rem, 0.8rem + 0.5vw, 1.5rem);       /* 16px → 24px */
--crm-space-6: clamp(1.5rem, 1.2rem + 0.7vw, 2rem);       /* 24px → 32px */
--crm-space-8: clamp(2rem, 1.6rem + 0.9vw, 2.5rem);       /* 32px → 40px */
```

---

## 🧩 **BIBLIOTECA DE COMPONENTES**

### **1. Layout Components**

#### **MainLayout**
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}
```

**Estrutura**:
- Sidebar lateral expansível/colapsável
- Header fixo com logo, menu usuário, theme toggle
- Container fluido centralizado
- Bottom navigation em mobile

**CSS Classes**:
```css
.crm-main-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
  background: var(--crm-bg-primary);
}

.crm-sidebar {
  width: var(--crm-sidebar-width, 280px);
  background: var(--crm-bg-secondary);
  border-right: 1px solid var(--crm-border);
}

.crm-sidebar--collapsed {
  width: var(--crm-sidebar-collapsed-width, 64px);
}
```

#### **PageHeader**
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode[];
}
```

**Espaçamentos**: padding top/bottom 16px, lateral 24px
**Tipografia**: Título 24px (--crm-font-size-2xl), subtítulo 16px (--crm-font-size-base)

#### **ContentContainer**
```css
.crm-content-container {
  padding: var(--crm-space-6);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .crm-content-container {
    padding: var(--crm-space-4);
  }
}
```

### **2. Data Display Components**

#### **Stats Cards**
```typescript
interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  variant?: 'accent' | 'success' | 'warning' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}
```

**Variantes Visuais**:
- `accent`: background com --crm-accent
- `success`: background com --crm-success
- `warning`: background com --crm-warning
- `info`: background com --crm-info

**Exemplo de Uso**:
```tsx
<StatsCard
  value="47"
  label="Empresas Ativas"
  icon={<BuildingIcon />}
  variant="accent"
  trend={{ value: 12, isPositive: true }}
/>
```

#### **Data Table**
```typescript
interface DataTableProps {
  columns: Column[];
  data: any[];
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
  };
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
}
```

**Features**:
- Paginação automática
- Ordenação por coluna
- Filtros inline
- Seleção múltipla
- Scroll horizontal em mobile

#### **Charts Container**
```typescript
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartData;
  options?: ChartOptions;
  loading?: boolean;
}
```

**Grid Responsivo**:
- Desktop: 2-3 gráficos lado a lado
- Tablet: 1-2 gráficos por linha
- Mobile: 1 gráfico por vez

### **3. Forms & Inputs**

#### **Form Modal**
```typescript
interface FormModalProps {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
  children: React.ReactNode;
}
```

**Características**:
- Fundo semi-transparente (rgba(0,0,0,0.3))
- Validação inline com erro abaixo do campo
- Botões desabilitados durante submit
- Animação de entrada/saída suave

#### **Search Input**
```typescript
interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  loading?: boolean;
}
```

**Feedback Visual**:
- Borda azul ao focar (--crm-accent)
- Borda vermelha ao erro (--crm-error)
- Ícone de lupa sempre visível

#### **Select Dropdown**
```typescript
interface SelectDropdownProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
}
```

**Features**:
- Scroll vertical para muitas opções
- Busca interna
- Keyboard navigation
- Destaque da opção selecionada

### **4. Feedback Components**

#### **Loading States**
```typescript
// Spinner centralizado
<Spinner size="large" />

// Spinner inline em botão
<Button loading={true}>Salvar</Button>

// Skeleton loader
<Skeleton active paragraph={{ rows: 4 }} />
```

#### **Toast Notifications**
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
}

// Uso
toast.success('Empresa criada com sucesso!');
toast.error('Erro ao salvar empresa');
```

**Posicionamento**: Canto superior direito
**Duração**: 3-5 segundos
**Fechamento**: Manual ou automático

#### **Empty States**
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Exemplo**:
```tsx
<EmptyState
  icon={<FileIcon />}
  title="Nenhuma empresa encontrada"
  description="Comece criando sua primeira empresa"
  action={{
    label: "Criar Empresa",
    onClick: () => setModalVisible(true)
  }}
/>
```

### **5. Navigation Components**

#### **Sidebar Menu**
```typescript
interface SidebarMenuProps {
  items: MenuItem[];
  collapsed?: boolean;
  activeKey?: string;
  onItemClick?: (key: string) => void;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}
```

**Estados Visuais**:
- Hover: background --crm-bg-hover
- Ativo: borda esquerda azul ou background destacado
- Collapsed: apenas ícones visíveis

#### **Breadcrumb**
```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}
```

**Estilo**:
- Labels secundárias (--crm-text-secondary)
- Item atual destacado (--crm-accent)
- Separador: "/"

#### **Tabs**
```typescript
interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}
```

**Estados**:
- Ativo: underline ou background leve (--crm-accent)
- Hover: mudança sutil de cor de fundo
- Disabled: opacidade reduzida

### **6. Notification Components**

#### **Badge**
```typescript
interface BadgeProps {
  count: number;
  showZero?: boolean;
  overflowCount?: number;
  children?: React.ReactNode;
}
```

**Posicionamento**: Superior direito sobre ícones/botoes
**Estilo**: Círculo vermelho com número branco

#### **Alert**
```typescript
interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  description?: string;
  closable?: boolean;
  onClose?: () => void;
}
```

**Características**:
- Cores semânticas consistentes
- Ícone contextual
- Fechamento manual opcional

#### **Popover**
```typescript
interface PopoverProps {
  content: React.ReactNode;
  title?: string;
  trigger?: 'hover' | 'click';
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}
```

**Uso**: Tooltips, menus dropdown, informações extras

### **7. Responsive Utilities**

#### **CSS Grid System**
```css
/* Container queries para responsividade fluida */
.crm-grid {
  display: grid;
  gap: var(--crm-space-4);
}

.crm-grid--responsive {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

@media (max-width: 768px) {
  .crm-grid--responsive {
    grid-template-columns: 1fr;
  }
}
```

#### **Utility Classes**
```css
/* Visibilidade condicional */
.crm-hidden-mobile { display: none; }
.crm-hidden-tablet { display: none; }
.crm-hidden-desktop { display: none; }

@media (min-width: 768px) {
  .crm-hidden-mobile { display: block; }
}

@media (min-width: 1024px) {
  .crm-hidden-tablet { display: block; }
}

/* Mobile-first approach */
.crm-visible-mobile { display: block; }
.crm-visible-tablet { display: none; }
.crm-visible-desktop { display: none; }

@media (min-width: 768px) {
  .crm-visible-mobile { display: none; }
  .crm-visible-tablet { display: block; }
}

@media (min-width: 1024px) {
  .crm-visible-desktop { display: block; }
}
```

### **8. Theme Components**

#### **Theme Toggle**
```typescript
interface ThemeToggleProps {
  currentTheme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}
```

**Implementação**: Alterna CSS custom properties dinamicamente
**Persistência**: Salva preferência no localStorage

---

## 🏗️ **WIREFRAMES E LAYOUTS**

### **Dashboard**
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] Sistema CRM                    [USER MENU] [THEME]  │
├─────────────────┬───────────────────────────────────────────┤
│ 🏠 Visão Geral  │  📊 DASHBOARD - MÉTRICAS GERAIS           │
│ 🏢 CRM          │                                           │
│ 📋 Pipeline     │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐      │
│ 👥 Comunidades  │  │12 │ │45 │ │234│ │8  │ │156│ │23 │      │
│ 💬 Chat         │  │EMP│ │TSK│ │MSG│ │COM│ │PST│ │ROM│      │
│ 🔧 Ferramentas  │  └─▲─┘ └─▲─┘ └─▲─┘ └─▲─┘ └─▲─┘ └─▲─┘      │
├─────────────────┤                                           │
│                 │  ┌─────────────────────────────────────┐  │
│                 │  │         GRÁFICO DE LINHA            │  │
│                 │  │   ↑                                 │  │
│                 │  │ 120 ┌─── ── ── ── ── ── ── ── ── ─┐ │  │
│                 │  │ 100 │                           * │ │  │
│                 │  │  80 │                         *   │ │  │
│                 │  │  60 │                       *     │ │  │
│                 │  │  40 │                     *       │ │  │
│                 │  │  20 │                   *         │ │  │
│                 │  │   0 └─ ── ── ── ── ── ── ── ── ─┘ │  │
│                 │  │     Jan Fev Mar Abr Mai Jun       │  │
│                 │  └─────────────────────────────────────┘  │
│                 │                                           │
│                 │  ┌─────────────────┬─────────────────────┐ │
│                 │  │   GRÁFICO BAR   │  ATIVIDADES RECENTES │ │
│                 │  │                 │                     │ │
│                 │  │        ███      │  🕒 João criou empresa│ │
│                 │  │      ██████     │  🕒 Maria moveu task │ │
│                 │  │    █████████    │  🕒 Pedro comentou    │ │
│                 │  │  ████████████   │  🕒 Ana criou comm    │ │
│                 │  └─────────────────┴─────────────────────┘ │
└─────────────────┴───────────────────────────────────────────┘
```

### **CRM - Gestão de Empresas**
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] Sistema CRM                    [USER MENU] [THEME]  │
├─────────────────┬───────────────────────────────────────────┤
│ 🏠 Visão Geral  │  🏢 CRM - GESTÃO DE EMPRESAS               │
│ 🏢 CRM          │                                           │
│ 📋 Pipeline     │  ┌─────────────────────────────────────┐  │
│ 👥 Comunidades  │  │ 🔍 Buscar empresa...        [+]     │  │
│ 💬 Chat         │  └─────────────────────────────────────┘  │
│ 🔧 Ferramentas  │                                           │
├─────────────────┤  ┌─────────────────────────────────────┐  │
│                 │  │ Empresa          | Contatos | Ações  │  │
│                 │  ├─────────────────────────────────────┤  │
│                 │  │ 🏢 TechCorp       | 3         | ✏️ 🗑️ │  │
│                 │  │ 🏢 DataSys        | 5         | ✏️ 🗑️ │  │
│                 │  │ 🏢 WebFlow        | 2         | ✏️ 🗑️ │  │
│                 │  │ 🏢 CloudTech      | 7         | ✏️ 🗑️ │  │
│                 │  └─────────────────────────────────────┘  │
│                 │  [1] 2 3 4 5 ... 12 [Próxima]             │
│                 │                                           │
│                 │  ┌─────────────────────────────────────┐  │
│                 │  │ 📊 ESTATÍSTICAS                      │  │
│                 │  │ Total: 47 empresas                   │  │
│                 │  │ Setor Tech: 32 (68%)                 │  │
│                 │  │ Com contato: 38 (81%)                │  │
│                 │  └─────────────────────────────────────┘  │
└─────────────────┴───────────────────────────────────────────┘
```

### **Pipeline (Kanban)**
```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO] Sistema CRM                        [USER MENU] [THEME]  │
├─────────────────┬───────────────────────────────────────────────┤
│ 🏠 Visão Geral  │  📋 PIPELINE - PROJETOS ATIVOS                │
│ 🏢 CRM          │                                               │
│ 📋 Pipeline     │  ┌─────────────────────┐ ┌─────────────────┐  │
│ 👥 Comunidades  │  │ 📊 Board: Sprint 1  │ │ [+] Nova Coluna  │  │
│ 💬 Chat         │  └─────────────────────┘ └─────────────────┘  │
│ 🔧 Ferramentas  │                                               │
├─────────────────┤  ┌─────────┬─────────┬─────────┬─────────┐     │
│                 │  │ BACKLOG │ TO DO   │ DOING   │ DONE    │     │
│                 │  ├─────────┼─────────┼─────────┼─────────┤     │
│                 │  │ ┌─────┐ │         │ ┌─────┐ │ ┌─────┐ │     │
│                 │  │ │Task1│ │         │ │Task3│ │ │Task5│ │     │
│                 │  │ │ 🏷️  │ │         │ │ 🏷️  │ │ │ 🏷️  │ │     │
│                 │  │ └─────┘ │         │ └─────┘ │ └─────┘ │     │
│                 │  │ ┌─────┐ │ ┌─────┐ │         │ ┌─────┐ │     │
│                 │  │ │Task2│ │ │Task4│ │         │ │Task6│ │     │
│                 │  │ │ 🏷️  │ │ │ 🏷️  │ │ │ 🏷️  │ │ │ 🏷️  │ │     │
│                 │  │ └─────┘ │ └─────┘ │         │ └─────┘ │     │
│                 │  │         │         │         │         │     │
│                 │  │         │         │         │         │     │
│                 │  │         │         │         │         │     │
│                 │  └─────────┴─────────┴─────────┴─────────┘     │
│                 │                                               │
│                 │  ┌─────────────────────────────────────────┐   │
│                 │  │ 📈 ESTATÍSTICAS DO BOARD                │   │
│                 │  │ Total Tasks: 6  | Concluídas: 2 (33%)   │   │
│                 │  └─────────────────────────────────────────┘   │
└─────────────────┴───────────────────────────────────────────────┘
```

### **Comunidades**
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] Sistema CRM                    [USER MENU] [THEME]  │
├─────────────────┬───────────────────────────────────────────┤
│ 🏠 Visão Geral  │  👥 COMUNIDADES                           │
│ 🏢 CRM          │                                           │
│ 📋 Pipeline     │  ┌─────────────────────────────────────┐  │
│ 👥 Comunidades  │  │ 🔍 Buscar comunidades...     [+]    │  │
│ 💬 Chat         │  └─────────────────────────────────────┘  │
│ 🔧 Ferramentas  │                                           │
├─────────────────┤  ┌─────────────┬─────────────┬─────────────┐ │
│                 │  │  ┌────────┐ │  ┌────────┐ │  ┌────────┐ │ │
│                 │  │  │  🌐    │ │  │  🌐    │ │  │  🔒    │ │ │
│                 │  │  │ Tech    │ │  │ Design │ │  │ Priv   │ │ │
│                 │  │  │ Talk    │ │  │ Hub    │ │  │ Group  │ │ │
│                 │  │  │ 12 memb │ │  │ 8 memb │ │  │ 3 memb │ │ │
│                 │  │  └────────┘ │  └────────┘ │  └────────┘ │ │
│                 │  └─────────────┴─────────────┴─────────────┘ │
│                 │                                               │
│                 │  ┌─────────────────────┬─────────────────────┐ │
│                 │  │ 📊 TOTAIS           │ 🔄 FILTROS           │ │
│                 │  │ Públicas: 15        │ [Todas] [Minhas]     │ │
│                 │  │ Privadas: 8         │ [Ordenar ▼]          │ │
│                 │  │ Total: 23           │                      │ │
│                 │  └─────────────────────┴─────────────────────┘ │
└─────────────────┴───────────────────────────────────────────┘
```

### **Chat**
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] Sistema CRM                    [USER MENU] [THEME]  │
├─────────────────┬───────────────────────────────────────────┤
│ 🏠 Visão Geral  │  💬 CHAT - CONVERSAS ATIVAS               │
│ 💬 Chat         │                                           │
│ 📋 Pipeline     │  ┌─────────────┬─────────────────────────┐ │
│ 👥 Comunidades  │  │ 🟢 GERAL    │                         │ │
│ 🏢 CRM          │  │ 🟡 DEV TEAM │    💬 GERAL              │ │
│ 🔧 Ferramentas  │  │ ⚪ DESIGN   │                         │ │
│                 │  │ 🟢 PRODUCT  │  ┌─────────────────────┐ │ │
│                 │  │ ⚪ MARKETING│  │ João • 14:30        │ │
│                 │  │             │  │ Olá pessoal!        │ │
│                 │  ├─────────────┤  │                     │ │
│                 │  │ [+] NOVA    │  │ Maria • 14:32       │ │
│                 │  │ SALA        │  │ Bom dia! Como estão │ │
│                 │  └─────────────┘  │ os projetos?        │ │
│                 │                  │  │                     │ │
│                 │                  │  │ Pedro • 14:35      │ │
│                 │                  │  │ Tudo bem, obrigado!│ │
│                 │                  │  └─────────────────────┘ │
│                 │                  │                         │ │
│                 │                  │  ┌─────────────────────┐ │ │
│                 │                  │  │ 💬 Digite sua mens. │ │
│                 │                  │  │ [📎] [😊] [📤]      │ │
│                 │                  │  └─────────────────────┘ │ │
└─────────────────┴───────────────────────────────────────────┘
```

### **Experiência Mobile**
```
┌─────────────────────────────────────────────────────────────┐
│  📱 SISTEMA CRM                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [CONTEÚDO DA PÁGINA ATUAL]                                 │
│                                                             │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 🏠 DASHBOARD | 💬 CHAT | 👥 COMUNIDADES | 📋 PIPELINE | 🏢 CRM │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 **FLUXOS DE USUÁRIO**

### **Autenticação**
```
LOGIN PAGE → [Firebase Auth] → DASHBOARD
    ↓
EMAIL VERIFICATION (se necessário)
    ↓
DASHBOARD (primeiro acesso)
```

### **CRUD Empresa**
```
LISTA EMPRESAS → [+ CRIAR] → MODAL FORM → [SALVAR] → LISTA (atualizada)
    ↓
[EDITAR] → MODAL FORM (pré-preenchido) → [SALVAR] → LISTA
    ↓
[EXCLUIR] → CONFIRMAÇÃO → LISTA (removido)
```

### **Kanban**
```
BOARD SELECTION → KANBAN BOARD → [DRAG TASK] → POSIÇÃO ATUALIZADA
    ↓
[+ NOVA TASK] → MODAL FORM → BOARD (task adicionada)
    ↓
[EDIT TASK] → MODAL FORM → BOARD (task atualizada)
```

### **Chat**
```
LISTA SALAS → [CLICAR SALA] → CONVERSA ATIVA
    ↓
[DIGITAR MENSAGEM] → [ENVIAR] → MENSAGEM ENVIADA (WebSocket)
    ↓
[RESPOSTA] → MENSAGEM RECEBIDA (tempo real)
```

---

## 🎨 **PADRÕES DE INTERAÇÃO**

### **Estados Loading**
- **Skeleton**: Simula layout antes do carregamento
- **Spinner**: Centralizado ou inline em botões
- **Disabled buttons**: Durante processamento

### **Feedback Visual**
- **Toast notifications**: Sucesso/erro no canto superior direito
- **Inline validation**: Erros abaixo dos campos
- **Status indicators**: Verde/vermelho para estados

### **Navegação Hierárquica**
- **Breadcrumb**: Indica localização atual
- **Back buttons**: Retorno em navegação profunda
- **Tab navigation**: Conteúdo segmentado

### **Consistência**
- **Cores**: Paleta unificada em todos os componentes
- **Espaçamentos**: Sistema fluido consistente
- **Tipografia**: Escala hierárquica padronizada
- **Componentes**: Padrões iguais em todos os módulos

### **Animações**
- **Sutis**: Transições rápidas (200-300ms)
- **Purposeful**: Feedback claro para ações do usuário
- **Performance**: Respeita `prefers-reduced-motion`

---

## ♿ **ACESSIBILIDADE**

### **Gerenciamento de Foco**
```css
.crm-focus-visible:focus-visible {
  outline: 2px solid var(--crm-accent);
  outline-offset: 2px;
}
```

### **Screen Readers**
- **ARIA Labels**: Descrições contextuais
- **Semantic HTML**: Uso correto de headings e landmarks
- **Alt Text**: Descrições para imagens

### **Navegação por Teclado**
- **Tab Order**: Sequência lógica de foco
- **Enter/Space**: Ativação de elementos interativos
- **Arrow Keys**: Navegação em listas e menus

### **Contraste e Legibilidade**
- **WCAG 2.1 AA**: Contraste mínimo 4.5:1
- **Text Size**: Mínimo 14px para corpo de texto
- **Touch Targets**: Mínimo 44px para elementos touch

---

## ⚡ **PERFORMANCE PATTERNS**

### **Lazy Loading**
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Uso com Suspense
<Suspense fallback={<Skeleton />}>
  <Dashboard />
</Suspense>
```

### **Memoization**
```typescript
const StatsCard = memo(({ value, label, icon }: StatsCardProps) => {
  // Component logic
});
```

### **Virtual Scrolling**
```typescript
// Para listas grandes (>100 items)
<VirtualizedList
  items={largeDataset}
  itemHeight={50}
  containerHeight={400}
/>
```

---

## 🛠️ **DIRETRIZES DE DESENVOLVIMENTO**

### **Estrutura de Arquivos CSS**
```
src/styles/
├── crm-design-system.css     # Variáveis e temas
├── crm-components.css        # Estilos de componentes
├── crm-sidebar.css          # Layout da sidebar
├── crm-responsive.css       # Media queries
└── crm-utilities.css        # Classes utilitárias
```

### **Convenções de Nomeação**
```css
/* Componentes */
.crm-button { }
.crm-button--primary { }
.crm-button--disabled { }

/* Utilitários */
.crm-text-center { }
.crm-space-y-4 { }
.crm-hidden-mobile { }

/* Estados */
.crm-is-loading { }
.crm-is-active { }
.crm-is-disabled { }
```

### **Uso do Sistema de Design**
```typescript
// ✅ Correto - usa variáveis CSS
const styles = {
  backgroundColor: 'var(--crm-bg-primary)',
  color: 'var(--crm-text-primary)',
  padding: 'var(--crm-space-4)',
};

// ❌ Evitar - valores hardcoded
const styles = {
  backgroundColor: '#0f172a',
  color: '#f8fafc',
  padding: '16px',
};
```

### **Responsividade**
```css
/* Mobile-first approach */
.crm-component {
  padding: var(--crm-space-3); /* Mobile default */
}

@media (min-width: 768px) {
  .crm-component {
    padding: var(--crm-space-4); /* Tablet */
  }
}

@media (min-width: 1024px) {
  .crm-component {
    padding: var(--crm-space-6); /* Desktop */
  }
}
```

---

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

### **Pré-Implementação**
- [ ] Sistema de cores definido (--crm-* variables)
- [ ] Tipografia fluida implementada
- [ ] Espaçamentos fluidos configurados
- [ ] Componentes base criados

### **Componentes Core**
- [ ] MainLayout responsivo
- [ ] Sidebar colapsível
- [ ] Form modal padronizado
- [ ] Data table responsiva
- [ ] Stats cards com variantes

### **Páginas Principais**
- [ ] Dashboard com métricas
- [ ] CRM com listagem e CRUD
- [ ] Kanban com drag & drop
- [ ] Comunidades com grid
- [ ] Chat com tempo real

### **Responsividade**
- [ ] Mobile-first implementado
- [ ] Bottom navigation funcional
- [ ] Container queries aplicadas
- [ ] Breakpoints fluidos testados

### **Acessibilidade**
- [ ] Foco visível implementado
- [ ] ARIA labels adicionados
- [ ] Contraste WCAG validado
- [ ] Navegação por teclado testada

### **Performance**
- [ ] Lazy loading implementado
- [ ] Memoization aplicada
- [ ] Bundle size otimizado
- [ ] Core Web Vitals validados

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Revisão Final**: Validar todos os componentes com o designer
2. **Implementação**: Começar reescrita CSS baseada neste guia
3. **Testes**: Validar responsividade e acessibilidade
4. **Documentação**: Atualizar conforme implementações
5. **Deploy**: Lançamento da nova versão visual

---

**Este guia integrado serve como base completa para a reescrita do CSS do Sistema CRM, combinando design conceitual com implementação técnica robusta.**
