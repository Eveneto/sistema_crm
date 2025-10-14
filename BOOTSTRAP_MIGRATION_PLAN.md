# 🚀 Plano de Migração: Ant Design → Bootstrap

## 📋 **Objetivo**
Migrar completamente do Ant Design para Bootstrap, mantendo:
- ✅ Funcionalidades existentes
- ✅ Layout responsivo
- ✅ Modo escuro elegante
- ✅ Arquitetura de temas
- ✅ Performance otimizada

## 🎯 **Vantagens da Migração**

### **Controle Visual Total**
- CSS 100% customizável
- Tema escuro nativo mais flexível
- Paleta de cores completamente nossa
- Grid system superior

### **Performance**
- Bundle menor (Bootstrap CSS vs Ant Design JS)
- Menos overhead de JavaScript
- Carregamento mais rápido

### **Flexibilidade**
- Componentes mais simples
- Customização sem limitações
- Integração CSS mais fácil

## 📦 **Fase 1: Setup e Dependências**

### **Instalar Bootstrap**
```bash
npm install react-bootstrap bootstrap
npm install @types/react-bootstrap
```

### **Remover Ant Design**
```bash
npm uninstall antd
```

### **Configurar SCSS (opcional)**
```bash
npm install sass
```

## 🔧 **Fase 2: Mapeamento de Componentes**

### **Layout Principal**
| Ant Design | Bootstrap | Status |
|------------|-----------|--------|
| `Layout` | `Container/Row/Col` | 🔄 |
| `Layout.Sider` | Custom Sidebar | 🔄 |
| `Layout.Header` | `Navbar` | 🔄 |
| `Layout.Content` | `Container` | 🔄 |

### **Componentes de Interface**
| Ant Design | Bootstrap | Status |
|------------|-----------|--------|
| `Card` | `Card` | 🔄 |
| `Button` | `Button` | 🔄 |
| `Input` | `Form.Control` | 🔄 |
| `Table` | `Table` | 🔄 |
| `Modal` | `Modal` | 🔄 |
| `Menu` | `Nav` | 🔄 |
| `Avatar` | Custom | 🔄 |
| `Spin` | `Spinner` | 🔄 |

### **Formulários**
| Ant Design | Bootstrap | Status |
|------------|-----------|--------|
| `Form` | `Form` | 🔄 |
| `Form.Item` | `Form.Group` | 🔄 |
| `Select` | `Form.Select` | 🔄 |
| `DatePicker` | `Form.Control[type="date"]` | 🔄 |

## 🎨 **Fase 3: Sistema de Temas**

### **Estrutura CSS**
```scss
// _variables.scss
$primary: #1890ff;
$dark: #0f1419;
$light: #ffffff;

// _themes.scss
[data-theme="light"] {
  --bg-primary: #{$light};
  --text-primary: #333;
  --border-color: #d9d9d9;
}

[data-theme="dark"] {
  --bg-primary: #{$dark};
  --text-primary: #{$light};
  --border-color: #434343;
}
```

### **ThemeContext Mantido**
- ✅ Mesmo sistema de contexto
- ✅ localStorage persistence
- ✅ System preference detection
- ✅ Toggle component

## 📄 **Fase 4: Migração por Página**

### **4.1 Layout Base**
- [ ] `App.tsx` - Remove ConfigProvider, adiciona Bootstrap
- [ ] `Sidebar.tsx` - Migra para Bootstrap Nav
- [ ] `MainLayout.tsx` - Bootstrap Container/Row/Col

### **4.2 Dashboard**
- [ ] `Dashboard.tsx` - Cards e métricas
- [ ] Gráficos mantêm bibliotecas atuais
- [ ] Grid responsivo com Bootstrap

### **4.3 Páginas Principais**
- [ ] `CompaniesPage.tsx` - Table e Forms
- [ ] `KanbanPage.tsx` - Cards customizados
- [ ] `CommunitiesPage.tsx` - Layout com Cards

### **4.4 Componentes Auxiliares**
- [ ] `ThemeToggle.tsx` - Mantém funcionalidade
- [ ] Forms diversos - Bootstrap Form components
- [ ] Modals - Bootstrap Modal

## 🎯 **Fase 5: Tema Escuro Bootstrap**

### **CSS Variables Strategy**
```css
:root {
  --bs-primary: #1890ff;
  --bs-body-bg: #ffffff;
  --bs-body-color: #333333;
}

[data-theme="dark"] {
  --bs-primary: #1890ff;
  --bs-body-bg: #0f1419;
  --bs-body-color: #ffffff;
  --bs-border-color: #434343;
}
```

### **Bootstrap Dark Mode**
- Usar data-bs-theme="dark" quando necessário
- CSS custom para componentes específicos
- Transições suaves mantidas

## 🧪 **Fase 6: Testes**

### **Testes Mantidos**
- ✅ ThemeContext tests
- ✅ ThemeToggle tests
- ✅ Integration tests

### **Novos Testes**
- [ ] Bootstrap component integration
- [ ] Responsive layout tests
- [ ] Form validation tests

## 📱 **Fase 7: Responsividade**

### **Bootstrap Grid**
```tsx
<Container fluid>
  <Row>
    <Col lg={2} md={3} className="sidebar">
      <Sidebar />
    </Col>
    <Col lg={10} md={9} className="main-content">
      <MainContent />
    </Col>
  </Row>
</Container>
```

### **Breakpoints**
- `xs`: < 576px (mobile)
- `sm`: 576px+ (mobile landscape)
- `md`: 768px+ (tablet)
- `lg`: 992px+ (desktop)
- `xl`: 1200px+ (large desktop)

## 🚀 **Fase 8: Otimizações**

### **Bundle Size**
- Remover CSS não utilizado
- Tree shaking do Bootstrap
- Lazy loading de componentes

### **Performance**
- CSS crítico inline
- Preload de fontes
- Otimização de imagens

## ✅ **Checklist de Migração**

### **Setup**
- [ ] Bootstrap instalado
- [ ] Ant Design removido
- [ ] SCSS configurado (opcional)

### **Layout**
- [ ] Layout principal migrado
- [ ] Sidebar responsive
- [ ] Navigation funcionando

### **Componentes**
- [ ] Cards migrados
- [ ] Buttons migrados
- [ ] Forms migrados
- [ ] Tables migradas
- [ ] Modals migrados

### **Temas**
- [ ] Sistema de temas funcionando
- [ ] Modo escuro implementado
- [ ] Transições suaves
- [ ] Persistência funcionando

### **Páginas**
- [ ] Dashboard funcionando
- [ ] Companies funcionando
- [ ] Kanban funcionando
- [ ] Communities funcionando

### **Testes**
- [ ] Todos os testes passando
- [ ] Novos testes adicionados
- [ ] Cobertura mantida

### **Performance**
- [ ] Bundle size reduzido
- [ ] Carregamento otimizado
- [ ] Responsividade testada

## 🎉 **Resultado Esperado**

### **Visual**
- ✅ Design limpo e moderno
- ✅ Modo escuro elegante
- ✅ Responsividade perfeita
- ✅ Controle total sobre CSS

### **Performance**
- ✅ Bundle 30-40% menor
- ✅ Carregamento mais rápido
- ✅ Menos JavaScript

### **Manutenibilidade**
- ✅ CSS mais simples
- ✅ Customização fácil
- ✅ Documentação melhor

---

**Status Atual:** 🔄 Preparando migração
**Próximo Passo:** Instalar Bootstrap e começar migração do layout
