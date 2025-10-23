# 🧩 COMPONENTES UI - SISTEMA CRM

## 📚 **BIBLIOTECA DE COMPONENTES**

Este documento detalha todos os componentes de UI disponíveis no Sistema CRM, organizados por categoria e uso.

---

## 🎨 **SISTEMA DE CORES**

### **Variáveis CSS Principais**
```css
/* Backgrounds */
--crm-bg-primary: #0f172a;      /* Fundo principal */
--crm-bg-secondary: #1e293b;    /* Fundo secundário */
--crm-bg-elevated: #334155;     /* Cards, modais */
--crm-bg-hover: rgba(59, 130, 246, 0.1); /* Hover states */

/* Text */
--crm-text: #f8fafc;            /* Texto principal */
--crm-text-secondary: #cbd5e1;  /* Texto secundário */
--crm-text-disabled: #64748b;   /* Texto desabilitado */

/* Accent */
--crm-accent: #3b82f6;          /* Azul primário */
--crm-accent-light: #60a5fa;    /* Azul claro */

/* Semantic */
--crm-success: #10b981;         /* Verde sucesso */
--crm-warning: #f59e0b;         /* Amarelo aviso */
--crm-error: #ef4444;           /* Vermelho erro */
--crm-info: #8b5cf6;            /* Roxo info */

/* Borders */
--crm-border: #334155;          /* Bordas padrão */
--crm-border-light: #475569;    /* Bordas claras */
```

---

## 📦 **LAYOUT COMPONENTS**

### **MainLayout**
```tsx
<MainLayout>
  {/* Conteúdo da página */}
</MainLayout>
```
**Props**: `children: ReactNode`
**Features**: Sidebar responsivo, header fixo, container fluido

### **PageHeader**
```tsx
<PageHeader
  title="Título da Página"
  subtitle="Descrição opcional"
  actions={<Button type="primary">Ação</Button>}
/>
```
**Props**: `title, subtitle?, actions?, onBack?`

### **ContentContainer**
```tsx
<ContentContainer>
  {/* Conteúdo principal */}
</ContentContainer>
```
**Features**: Padding responsivo, max-width controlado

---

## 📊 **DATA DISPLAY**

### **Stats Cards**
```tsx
<div className="crm-stats-card">
  <div className="crm-stats-icon crm-stats-icon-accent">
    <IconComponent />
  </div>
  <div className="crm-stats-content">
    <div className="crm-stats-value">{value}</div>
    <div className="crm-stats-label">{label}</div>
  </div>
</div>
```
**Variants**: `crm-stats-icon-accent`, `crm-stats-icon-success`, `crm-stats-icon-warning`, `crm-stats-icon-info`

### **Data Table**
```tsx
<Table
  columns={columns}
  dataSource={data}
  pagination={{
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true
  }}
  scroll={{ x: 800 }}
/>
```
**Features**: Paginação, filtros, ordenação, scroll horizontal

### **Charts Container**
```tsx
<div className="crm-chart-container">
  <div className="crm-chart-header">
    <h3 className="crm-chart-title">Título do Gráfico</h3>
  </div>
  <div className="crm-chart-wrapper">
    <ChartComponent />
  </div>
</div>
```

---

## 📝 **FORMS & INPUTS**

### **Form Modal**
```tsx
<Modal
  title="Criar Item"
  open={isOpen}
  onCancel={() => setIsOpen(false)}
  footer={[
    <Button key="cancel">Cancelar</Button>,
    <Button key="submit" type="primary" htmlType="submit">
      Criar
    </Button>
  ]}
>
  <Form layout="vertical">
    <Form.Item label="Nome" name="name" rules={[{required: true}]}>
      <Input placeholder="Digite o nome" />
    </Form.Item>
  </Form>
</Modal>
```

### **Search Input**
```tsx
<Input.Search
  placeholder="Buscar..."
  onSearch={handleSearch}
  style={{ width: 300 }}
/>
```

### **Select Dropdown**
```tsx
<Select
  placeholder="Selecionar opção"
  style={{ width: 200 }}
  options={[
    { value: 'option1', label: 'Opção 1' },
    { value: 'option2', label: 'Opção 2' }
  ]}
/>
```

---

## 🔲 **FEEDBACK COMPONENTS**

### **Loading States**
```tsx
// Spinner
<Spin size="large" />

// Skeleton
<Skeleton active />

// Button loading
<Button loading={isLoading}>Salvar</Button>
```

### **Toast Notifications**
```tsx
// Success
message.success('Operação realizada com sucesso!');

// Error
message.error('Erro ao salvar dados.');

// Warning
message.warning('Atenção: campo obrigatório.');

// Info
message.info('Informação importante.');
```

### **Empty States**
```tsx
<Empty
  description="Nenhum item encontrado"
  className="crm-empty-state"
/>
```

---

## 🎯 **NAVIGATION COMPONENTS**

### **Sidebar Menu**
```tsx
const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Visão Geral',
    onClick: () => navigate('/dashboard')
  },
  // ... outros items
];
```

### **Breadcrumb**
```tsx
<Breadcrumb>
  <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
  <Breadcrumb.Item>Empresas</Breadcrumb.Item>
  <Breadcrumb.Item>Detalhes</Breadcrumb.Item>
</Breadcrumb>
```

### **Tabs**
```tsx
<Tabs
  defaultActiveKey="1"
  items={[
    {
      key: '1',
      label: 'Aba 1',
      children: <div>Conteúdo da aba 1</div>
    }
  ]}
/>
```

---

## 🔔 **NOTIFICATION COMPONENTS**

### **Badge**
```tsx
<Badge count={5}>
  <Button>Notificações</Button>
</Badge>
```

### **Alert**
```tsx
<Alert
  message="Atenção"
  description="Esta é uma mensagem de aviso."
  type="warning"
  closable
/>
```

### **Popover**
```tsx
<Popover
  content={<div>Conteúdo do popover</div>}
  title="Título"
  trigger="hover"
>
  <Button>Hover me</Button>
</Popover>
```

---

## 📱 **RESPONSIVE UTILITIES**

### **CSS Classes Responsivas**
```css
/* Container queries */
@container (min-width: 768px) {
  .crm-responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile-first utilities */
.crm-mobile-hidden { display: none; }
@media (min-width: 768px) {
  .crm-mobile-hidden { display: block; }
}

.crm-desktop-hidden { display: block; }
@media (max-width: 767px) {
  .crm-desktop-hidden { display: none; }
}
```

### **Grid System**
```tsx
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={8} lg={6}>
    <Card>Item</Card>
  </Col>
</Row>
```

---

## 🎨 **THEME COMPONENTS**

### **Theme Toggle**
```tsx
import ThemeToggle from '../components/theme/ThemeToggle';

// Renderiza automaticamente baseado no contexto
<ThemeToggle />
```

### **Dark/Light Mode Support**
```css
/* CSS custom properties para temas */
:root {
  --crm-bg-primary: #0f172a;  /* Dark */
  --crm-text: #f8fafc;
}

[data-theme="light"] {
  --crm-bg-primary: #ffffff;  /* Light */
  --crm-text: #0f172a;
}
```

---

## ♿ **ACCESSIBILITY COMPONENTS**

### **Focus Management**
```css
.crm-focusable:focus-visible {
  outline: 2px solid var(--crm-accent);
  outline-offset: 2px;
}
```

### **Screen Reader Support**
```tsx
<Button aria-label="Fechar modal">
  <CloseOutlined aria-hidden="true" />
</Button>
```

### **Reduced Motion**
```css
@media (prefers-reduced-motion: reduce) {
  .crm-animation {
    animation: none;
    transition: none;
  }
}
```

---

## 🚀 **PERFORMANCE PATTERNS**

### **Lazy Loading**
```tsx
const LazyComponent = lazy(() => import('./LazyComponent'));

<Suspense fallback={<Spin />}>
  <LazyComponent />
</Suspense>
```

### **Memoization**
```tsx
const MemoizedComponent = memo(({ data }) => {
  return <div>{data}</div>;
});
```

### **Virtual Scrolling** (para listas grandes)
```tsx
// Usar react-window ou similar para listas > 100 items
```

---

## 📋 **USAGE PATTERNS**

### **CRUD Operations**
```tsx
// Padrão consistente para operações CRUD
const handleCreate = () => setModalOpen(true);
const handleEdit = (record) => {
  setSelectedRecord(record);
  setModalOpen(true);
};
const handleDelete = (id) => {
  Modal.confirm({
    title: 'Confirmar exclusão',
    content: 'Esta ação não pode ser desfeita.',
    onOk: () => deleteRecord(id)
  });
};
```

### **Form Validation**
```tsx
<Form.Item
  label="Email"
  name="email"
  rules={[
    { required: true, message: 'Email é obrigatório' },
    { type: 'email', message: 'Email inválido' }
  ]}
>
  <Input placeholder="seu@email.com" />
</Form.Item>
```

### **Error Handling**
```tsx
try {
  await apiCall();
  message.success('Operação realizada!');
} catch (error) {
  message.error('Erro ao processar solicitação');
  console.error(error);
}
```

---

## 🔧 **DEVELOPMENT TOOLS**

### **Component Props Interface**
```tsx
interface ComponentProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  onAction?: () => void;
  children?: React.ReactNode;
}
```

### **Custom Hooks**
```tsx
// Hook para API calls
const useApi = (endpoint: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoint);
      setData(response.data);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchData };
};
```

---

**Esta biblioteca de componentes garante consistência e reutilização em todo o Sistema CRM.**
