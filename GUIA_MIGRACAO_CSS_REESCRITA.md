# 🔄 **GUIA DE MIGRAÇÃO CSS - REESCRITA COMPLETA**

## 🎯 **OBJETIVO**

Este documento fornece um **plano detalhado** para reescrever completamente o CSS do Sistema CRM baseado no **Guia de Design Frontend Integrado**.

**Resultado esperado**: CSS modular, consistente, performático e totalmente alinhado com o sistema de design.

---

## 📁 **ESTRUTURA ATUAL DE CSS**

### **Arquivos CSS Existentes** (a serem substituídos)
```
src/styles/
├── crm-design-system.css     ✅ (manter e expandir)
├── crm-components.css        ✅ (manter e expandir)
├── crm-sidebar.css          ✅ (manter e expandir)
├── dashboard-horizontal-force.css    ❌ (remover)
├── dashboard-improved.css            ❌ (remover)
├── tech-dashboard*.css               ❌ (remover)
├── global-responsive.css             ❌ (remover)
├── responsiveBreakpoints.css         ❌ (remover)
├── navigation.css                    🔄 (migrar para crm-components.css)
├── toastStyles.css                   🔄 (migrar para crm-components.css)
└── [outros arquivos específicos]      ❌ (remover)
```

### **Inline Styles** (a serem removidos)
- `DashboardNew.tsx` - estilos inline
- `ChatPage.tsx` - estilos inline
- `CommunityDetailsPage.tsx` - estilos inline
- `KanbanPage.tsx` - estilos inline
- `CommunitiesPage.tsx` - estilos inline (parcial)
- `TokenTestPage.tsx` - estilos inline (parcial)

---

## 🏗️ **NOVA ESTRUTURA DE CSS**

### **Arquitetura Modular**
```
src/styles/
├── crm-design-system.css     # 🎨 Variáveis, temas, resets
├── crm-layout.css           # 📐 Layouts (MainLayout, Sidebar, Grid)
├── crm-components.css       # 🧩 Componentes (Buttons, Forms, Cards)
├── crm-pages.css            # 📄 Estilos específicos de páginas
├── crm-responsive.css       # 📱 Media queries e responsividade
└── crm-utilities.css        # 🔧 Classes utilitárias
```

### **Princípios da Nova Arquitetura**
1. **Mobile-First**: Estilos base para mobile, media queries para telas maiores
2. **Container Queries**: Responsividade baseada em container, não viewport
3. **CSS Custom Properties**: Todas as cores, espaçamentos e tipografia em variáveis
4. **Component-Based**: Um arquivo CSS por componente/função
5. **No Inline Styles**: Tudo em arquivos CSS externos

---

## 🎨 **FASES DE IMPLEMENTAÇÃO**

### **FASE 1: Foundation** (1-2 dias)

#### **1.1 Sistema de Design Expandido**
```css
/* crm-design-system.css */
:root {
  /* ===== CORES ===== */
  /* Backgrounds */
  --crm-bg-primary: #0f172a;
  --crm-bg-secondary: #1e293b;
  --crm-bg-elevated: #334155;
  --crm-bg-hover: rgba(59, 130, 246, 0.1);
  --crm-bg-overlay: rgba(0, 0, 0, 0.3);

  /* Text */
  --crm-text-primary: #f8fafc;
  --crm-text-secondary: #cbd5e1;
  --crm-text-disabled: #64748b;
  --crm-text-inverse: #0f172a;

  /* Accent */
  --crm-accent: #3b82f6;
  --crm-accent-light: #60a5fa;
  --crm-accent-dark: #2563eb;

  /* Semantic */
  --crm-success: #10b981;
  --crm-warning: #f59e0b;
  --crm-error: #ef4444;
  --crm-info: #8b5cf6;

  /* Borders */
  --crm-border: #334155;
  --crm-border-light: #475569;
  --crm-border-focus: #3b82f6;

  /* ===== TIPOGRAFIA ===== */
  --crm-font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --crm-font-weight-regular: 400;
  --crm-font-weight-medium: 500;
  --crm-font-weight-semibold: 600;
  --crm-font-weight-bold: 700;

  /* Tamanhos fluidos */
  --crm-font-size-xs: clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem);
  --crm-font-size-sm: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
  --crm-font-size-base: clamp(1rem, 0.9rem + 0.3vw, 1.125rem);
  --crm-font-size-lg: clamp(1.125rem, 1rem + 0.4vw, 1.25rem);
  --crm-font-size-xl: clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem);
  --crm-font-size-2xl: clamp(1.5rem, 1.3rem + 0.7vw, 2rem);
  --crm-font-size-3xl: clamp(1.875rem, 1.6rem + 0.9vw, 2.5rem);

  /* Line heights */
  --crm-line-height-tight: 1.25;
  --crm-line-height-normal: 1.5;
  --crm-line-height-relaxed: 1.75;

  /* ===== ESPAÇAMENTOS ===== */
  --crm-space-1: clamp(0.25rem, 0.2rem + 0.2vw, 0.5rem);
  --crm-space-2: clamp(0.5rem, 0.4rem + 0.3vw, 0.75rem);
  --crm-space-3: clamp(0.75rem, 0.6rem + 0.4vw, 1rem);
  --crm-space-4: clamp(1rem, 0.8rem + 0.5vw, 1.5rem);
  --crm-space-6: clamp(1.5rem, 1.2rem + 0.7vw, 2rem);
  --crm-space-8: clamp(2rem, 1.6rem + 0.9vw, 2.5rem);
  --crm-space-12: clamp(3rem, 2.4rem + 1.3vw, 3.5rem);

  /* ===== SOMBRAS ===== */
  --crm-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --crm-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --crm-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --crm-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --crm-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* ===== BORDERS ===== */
  --crm-radius-sm: 0.25rem;
  --crm-radius: 0.375rem;
  --crm-radius-md: 0.5rem;
  --crm-radius-lg: 0.75rem;
  --crm-radius-xl: 1rem;
  --crm-radius-full: 9999px;

  /* ===== ANIMAÇÕES ===== */
  --crm-transition-fast: 150ms ease-in-out;
  --crm-transition-normal: 250ms ease-in-out;
  --crm-transition-slow: 350ms ease-in-out;

  /* ===== Z-INDEX ===== */
  --crm-z-dropdown: 1000;
  --crm-z-sticky: 1020;
  --crm-z-fixed: 1030;
  --crm-z-modal-backdrop: 1040;
  --crm-z-modal: 1050;
  --crm-z-popover: 1060;
  --crm-z-tooltip: 1070;
}

/* Reset e base */
* {
  box-sizing: border-box;
}

html {
  font-family: var(--crm-font-family);
  line-height: var(--crm-line-height-normal);
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--crm-bg-primary);
  color: var(--crm-text-primary);
  font-size: var(--crm-font-size-base);
  font-weight: var(--crm-font-weight-regular);
}

/* Acessibilidade */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible */
.crm-focus-visible:focus-visible {
  outline: 2px solid var(--crm-accent);
  outline-offset: 2px;
}
```

#### **1.2 Layout Base**
```css
/* crm-layout.css */

/* Main Layout */
.crm-main-layout {
  display: grid;
  grid-template-columns: var(--crm-sidebar-width, 280px) 1fr;
  min-height: 100vh;
  background-color: var(--crm-bg-primary);
  transition: grid-template-columns var(--crm-transition-normal);
}

.crm-main-layout--sidebar-collapsed {
  grid-template-columns: var(--crm-sidebar-collapsed-width, 64px) 1fr;
}

.crm-main-layout__content {
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
}

/* Header */
.crm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--crm-space-4) var(--crm-space-6);
  background-color: var(--crm-bg-secondary);
  border-bottom: 1px solid var(--crm-border);
  position: sticky;
  top: 0;
  z-index: var(--crm-z-sticky);
}

.crm-header__left {
  display: flex;
  align-items: center;
  gap: var(--crm-space-4);
}

.crm-header__right {
  display: flex;
  align-items: center;
  gap: var(--crm-space-3);
}

/* Sidebar */
.crm-sidebar {
  background-color: var(--crm-bg-secondary);
  border-right: 1px solid var(--crm-border);
  display: flex;
  flex-direction: column;
  transition: width var(--crm-transition-normal);
}

.crm-sidebar--collapsed {
  width: var(--crm-sidebar-collapsed-width, 64px);
}

.crm-sidebar__header {
  padding: var(--crm-space-4);
  border-bottom: 1px solid var(--crm-border);
}

.crm-sidebar__menu {
  flex: 1;
  padding: var(--crm-space-2) 0;
}

.crm-sidebar__footer {
  padding: var(--crm-space-4);
  border-top: 1px solid var(--crm-border);
}

/* Content Container */
.crm-content-container {
  padding: var(--crm-space-6);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  overflow-x: auto;
}

/* Page Header */
.crm-page-header {
  margin-bottom: var(--crm-space-6);
}

.crm-page-header__title {
  font-size: var(--crm-font-size-2xl);
  font-weight: var(--crm-font-weight-bold);
  color: var(--crm-text-primary);
  margin: 0 0 var(--crm-space-2) 0;
}

.crm-page-header__subtitle {
  font-size: var(--crm-font-size-base);
  color: var(--crm-text-secondary);
  margin: 0 0 var(--crm-space-4) 0;
}

.crm-page-header__actions {
  display: flex;
  gap: var(--crm-space-3);
  align-items: center;
}
```

### **FASE 2: Componentes Core** (2-3 dias)

#### **2.1 Buttons**
```css
/* crm-components.css */

/* Base Button */
.crm-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--crm-space-2);
  padding: var(--crm-space-3) var(--crm-space-4);
  font-size: var(--crm-font-size-sm);
  font-weight: var(--crm-font-weight-medium);
  line-height: var(--crm-line-height-tight);
  border-radius: var(--crm-radius);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--crm-transition-fast);
  text-decoration: none;
  white-space: nowrap;
}

.crm-button:focus-visible {
  outline: 2px solid var(--crm-accent);
  outline-offset: 2px;
}

/* Variants */
.crm-button--primary {
  background-color: var(--crm-accent);
  color: var(--crm-text-inverse);
  border-color: var(--crm-accent);
}

.crm-button--primary:hover:not(:disabled) {
  background-color: var(--crm-accent-dark);
  border-color: var(--crm-accent-dark);
}

.crm-button--secondary {
  background-color: transparent;
  color: var(--crm-text-primary);
  border-color: var(--crm-border);
}

.crm-button--secondary:hover:not(:disabled) {
  background-color: var(--crm-bg-hover);
}

.crm-button--ghost {
  background-color: transparent;
  color: var(--crm-text-secondary);
  border-color: transparent;
}

.crm-button--ghost:hover:not(:disabled) {
  background-color: var(--crm-bg-hover);
  color: var(--crm-text-primary);
}

/* Sizes */
.crm-button--sm {
  padding: var(--crm-space-2) var(--crm-space-3);
  font-size: var(--crm-font-size-xs);
}

.crm-button--lg {
  padding: var(--crm-space-4) var(--crm-space-6);
  font-size: var(--crm-font-size-base);
}

/* States */
.crm-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.crm-button--loading {
  position: relative;
  color: transparent;
}

.crm-button--loading::after {
  content: '';
  position: absolute;
  width: 1em;
  height: 1em;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: crm-spin 1s linear infinite;
}

@keyframes crm-spin {
  to { transform: rotate(360deg); }
}
```

#### **2.2 Forms**
```css
/* Form Base */
.crm-form-item {
  margin-bottom: var(--crm-space-4);
}

.crm-form-item__label {
  display: block;
  font-size: var(--crm-font-size-sm);
  font-weight: var(--crm-font-weight-medium);
  color: var(--crm-text-primary);
  margin-bottom: var(--crm-space-2);
}

.crm-form-item__label--required::after {
  content: ' *';
  color: var(--crm-error);
}

/* Input Base */
.crm-input {
  width: 100%;
  padding: var(--crm-space-3) var(--crm-space-4);
  font-size: var(--crm-font-size-base);
  font-family: var(--crm-font-family);
  line-height: var(--crm-line-height-tight);
  color: var(--crm-text-primary);
  background-color: var(--crm-bg-secondary);
  border: 1px solid var(--crm-border);
  border-radius: var(--crm-radius);
  transition: all var(--crm-transition-fast);
}

.crm-input:focus {
  outline: none;
  border-color: var(--crm-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.crm-input:disabled {
  background-color: var(--crm-bg-primary);
  color: var(--crm-text-disabled);
  cursor: not-allowed;
}

.crm-input::placeholder {
  color: var(--crm-text-disabled);
}

/* Input Variants */
.crm-input--error {
  border-color: var(--crm-error);
}

.crm-input--error:focus {
  border-color: var(--crm-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Search Input */
.crm-search-input {
  position: relative;
}

.crm-search-input .crm-input {
  padding-left: calc(var(--crm-space-4) + 1.5em);
}

.crm-search-input::before {
  content: '';
  position: absolute;
  left: var(--crm-space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 1em;
  height: 1em;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.5;
}

/* Select */
.crm-select {
  position: relative;
}

.crm-select .crm-input {
  cursor: pointer;
  padding-right: calc(var(--crm-space-4) + 1.5em);
}

.crm-select::after {
  content: '';
  position: absolute;
  right: var(--crm-space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 0.75em;
  height: 0.75em;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23cbd5e1'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-size: contain;
  pointer-events: none;
}

/* Form Error */
.crm-form-error {
  font-size: var(--crm-font-size-sm);
  color: var(--crm-error);
  margin-top: var(--crm-space-1);
  display: flex;
  align-items: center;
  gap: var(--crm-space-1);
}

.crm-form-error::before {
  content: '';
  width: 0.75em;
  height: 0.75em;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ef4444'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-size: contain;
  flex-shrink: 0;
}
```

#### **2.3 Cards e Data Display**
```css
/* Stats Cards */
.crm-stats-card {
  background-color: var(--crm-bg-secondary);
  border: 1px solid var(--crm-border);
  border-radius: var(--crm-radius-lg);
  padding: var(--crm-space-6);
  transition: all var(--crm-transition-fast);
}

.crm-stats-card:hover {
  border-color: var(--crm-border-light);
  box-shadow: var(--crm-shadow);
}

.crm-stats-card__content {
  display: flex;
  align-items: center;
  gap: var(--crm-space-4);
}

.crm-stats-card__info {
  flex: 1;
}

.crm-stats-card__value {
  font-size: var(--crm-font-size-2xl);
  font-weight: var(--crm-font-weight-bold);
  color: var(--crm-text-primary);
  margin-bottom: var(--crm-space-1);
}

.crm-stats-card__label {
  font-size: var(--crm-font-size-sm);
  color: var(--crm-text-secondary);
  font-weight: var(--crm-font-weight-medium);
}

.crm-stats-card__icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--crm-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Variants */
.crm-stats-card--accent .crm-stats-card__icon {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--crm-accent);
}

.crm-stats-card--success .crm-stats-card__icon {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--crm-success);
}

.crm-stats-card--warning .crm-stats-card__icon {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--crm-warning);
}

.crm-stats-card--info .crm-stats-card__icon {
  background-color: rgba(139, 92, 246, 0.1);
  color: var(--crm-info);
}

/* Data Table */
.crm-data-table {
  background-color: var(--crm-bg-secondary);
  border: 1px solid var(--crm-border);
  border-radius: var(--crm-radius-lg);
  overflow: hidden;
}

.crm-data-table__header {
  background-color: var(--crm-bg-elevated);
  border-bottom: 1px solid var(--crm-border);
}

.crm-data-table__row {
  border-bottom: 1px solid var(--crm-border);
  transition: background-color var(--crm-transition-fast);
}

.crm-data-table__row:hover {
  background-color: var(--crm-bg-hover);
}

.crm-data-table__row:last-child {
  border-bottom: none;
}

.crm-data-table__cell {
  padding: var(--crm-space-4);
  font-size: var(--crm-font-size-sm);
  color: var(--crm-text-primary);
}

.crm-data-table__cell--header {
  font-weight: var(--crm-font-weight-semibold);
  color: var(--crm-text-primary);
  background-color: var(--crm-bg-elevated);
}

/* Charts Container */
.crm-chart-container {
  background-color: var(--crm-bg-secondary);
  border: 1px solid var(--crm-border);
  border-radius: var(--crm-radius-lg);
  padding: var(--crm-space-6);
}

.crm-chart-container__header {
  margin-bottom: var(--crm-space-4);
}

.crm-chart-container__title {
  font-size: var(--crm-font-size-lg);
  font-weight: var(--crm-font-weight-semibold);
  color: var(--crm-text-primary);
  margin: 0 0 var(--crm-space-1) 0;
}

.crm-chart-container__subtitle {
  font-size: var(--crm-font-size-sm);
  color: var(--crm-text-secondary);
  margin: 0;
}

.crm-chart-container__chart {
  height: 300px;
  position: relative;
}
```

### **FASE 3: Páginas Específicas** (2-3 dias)

#### **3.1 Dashboard**
```css
/* crm-pages.css */

/* Dashboard Grid */
.crm-dashboard {
  display: grid;
  gap: var(--crm-space-6);
}

.crm-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--crm-space-4);
}

.crm-dashboard__charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--crm-space-6);
}

.crm-dashboard__activities {
  background-color: var(--crm-bg-secondary);
  border: 1px solid var(--crm-border);
  border-radius: var(--crm-radius-lg);
  padding: var(--crm-space-6);
}

.crm-dashboard__activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--crm-space-3);
  padding: var(--crm-space-3) 0;
  border-bottom: 1px solid var(--crm-border);
}

.crm-dashboard__activity-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.crm-dashboard__activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: var(--crm-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--crm-font-size-sm);
}

.crm-dashboard__activity-content {
  flex: 1;
  min-width: 0;
}

.crm-dashboard__activity-text {
  font-size: var(--crm-font-size-sm);
  color: var(--crm-text-primary);
  margin: 0;
}

.crm-dashboard__activity-time {
  font-size: var(--crm-font-size-xs);
  color: var(--crm-text-disabled);
  margin-top: var(--crm-space-1);
}
```

#### **3.2 Kanban**
```css
/* Kanban Board */
.crm-kanban {
  display: flex;
  gap: var(--crm-space-4);
  overflow-x: auto;
  padding: var(--crm-space-4) 0;
}

.crm-kanban__column {
  background-color: var(--crm-bg-secondary);
  border: 1px solid var(--crm-border);
  border-radius: var(--crm-radius-lg);
  padding: var(--crm-space-4);
  min-width: 280px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
}

.crm-kanban__column-header {
  font-size: var(--crm-font-size-sm);
  font-weight: var(--crm-font-weight-semibold);
  color: var(--crm-text-primary);
  margin-bottom: var(--crm-space-4);
  padding-bottom: var(--crm-space-2);
  border-bottom: 1px solid var(--crm-border);
}

.crm-kanban__column-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--crm-space-3);
  min-height: 200px;
}

.crm-kanban__card {
  background-color: var(--crm-bg-primary);
  border: 1px solid var(--crm-border);
  border-radius: var(--crm-radius);
  padding: var(--crm-space-4);
  cursor: grab;
  transition: all var(--crm-transition-fast);
}

.crm-kanban__card:hover {
  border-color: var(--crm-border-light);
  box-shadow: var(--crm-shadow);
}

.crm-kanban__card--dragging {
  opacity: 0.5;
  transform: rotate(5deg);
  box-shadow: var(--crm-shadow-lg);
}

.crm-kanban__card-title {
  font-size: var(--crm-font-size-sm);
  font-weight: var(--crm-font-weight-semibold);
  color: var(--crm-text-primary);
  margin: 0 0 var(--crm-space-2) 0;
}

.crm-kanban__card-description {
  font-size: var(--crm-font-size-xs);
  color: var(--crm-text-secondary);
  margin: 0 0 var(--crm-space-3) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.crm-kanban__card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--crm-font-size-xs);
  color: var(--crm-text-disabled);
}

.crm-kanban__add-card {
  background-color: var(--crm-bg-hover);
  border: 2px dashed var(--crm-border);
  border-radius: var(--crm-radius);
  padding: var(--crm-space-4);
  text-align: center;
  cursor: pointer;
  transition: all var(--crm-transition-fast);
  color: var(--crm-text-secondary);
  font-size: var(--crm-font-size-sm);
}

.crm-kanban__add-card:hover {
  background-color: var(--crm-bg-secondary);
  border-color: var(--crm-accent);
  color: var(--crm-accent);
}
```

### **FASE 4: Responsividade** (1-2 dias)

#### **4.1 Media Queries**
```css
/* crm-responsive.css */

/* Tablet */
@media (max-width: 1024px) {
  .crm-main-layout {
    grid-template-columns: 1fr;
  }

  .crm-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: var(--crm-sidebar-width, 280px);
    z-index: var(--crm-z-fixed);
    transform: translateX(-100%);
    transition: transform var(--crm-transition-normal);
  }

  .crm-sidebar--open {
    transform: translateX(0);
  }

  .crm-dashboard__charts {
    grid-template-columns: 1fr;
  }

  .crm-kanban {
    padding: var(--crm-space-2);
  }

  .crm-kanban__column {
    min-width: 250px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .crm-header {
    padding: var(--crm-space-3) var(--crm-space-4);
  }

  .crm-content-container {
    padding: var(--crm-space-4);
  }

  .crm-dashboard__stats {
    grid-template-columns: 1fr;
  }

  .crm-dashboard__charts {
    grid-template-columns: 1fr;
  }

  .crm-page-header__actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .crm-page-header__actions .crm-button {
    width: 100%;
    justify-content: center;
  }

  .crm-data-table {
    font-size: var(--crm-font-size-xs);
  }

  .crm-data-table__cell {
    padding: var(--crm-space-2);
  }

  .crm-kanban {
    flex-direction: column;
    gap: var(--crm-space-2);
  }

  .crm-kanban__column {
    min-width: unset;
    max-width: unset;
  }

  /* Bottom Navigation */
  .crm-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--crm-bg-secondary);
    border-top: 1px solid var(--crm-border);
    padding: var(--crm-space-2);
    z-index: var(--crm-z-fixed);
  }

  .crm-bottom-nav__list {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .crm-bottom-nav__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--crm-space-1);
    padding: var(--crm-space-2);
    border-radius: var(--crm-radius);
    transition: background-color var(--crm-transition-fast);
    min-height: 60px;
    justify-content: center;
  }

  .crm-bottom-nav__item:hover {
    background-color: var(--crm-bg-hover);
  }

  .crm-bottom-nav__item--active {
    background-color: var(--crm-accent);
    color: var(--crm-text-inverse);
  }

  .crm-bottom-nav__icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .crm-bottom-nav__label {
    font-size: var(--crm-font-size-xs);
    font-weight: var(--crm-font-weight-medium);
  }

  /* Hide sidebar on mobile */
  .crm-sidebar {
    display: none;
  }

  /* Adjust main layout for mobile */
  .crm-main-layout {
    grid-template-columns: 1fr;
    padding-bottom: 80px; /* Space for bottom nav */
  }
}

/* Container Queries (Modern browsers) */
@container (max-width: 600px) {
  .crm-stats-card {
    padding: var(--crm-space-4);
  }

  .crm-stats-card__content {
    flex-direction: column;
    text-align: center;
    gap: var(--crm-space-3);
  }

  .crm-stats-card__icon {
    width: 2.5rem;
    height: 2.5rem;
  }
}
```

### **FASE 5: Utilitários e Finalização** (1 dia)

#### **5.1 Utility Classes**
```css
/* crm-utilities.css */

/* Display */
.crm-hidden { display: none !important; }
.crm-block { display: block !important; }
.crm-inline { display: inline !important; }
.crm-inline-block { display: inline-block !important; }
.crm-flex { display: flex !important; }
.crm-grid { display: grid !important; }

/* Flexbox */
.crm-flex-col { flex-direction: column !important; }
.crm-flex-row { flex-direction: row !important; }
.crm-flex-wrap { flex-wrap: wrap !important; }
.crm-flex-nowrap { flex-wrap: nowrap !important; }
.crm-items-center { align-items: center !important; }
.crm-items-start { align-items: flex-start !important; }
.crm-items-end { align-items: flex-end !important; }
.crm-justify-center { justify-content: center !important; }
.crm-justify-between { justify-content: space-between !important; }
.crm-justify-around { justify-content: space-around !important; }
.crm-justify-end { justify-content: flex-end !important; }

/* Spacing */
.crm-space-y-1 > * + * { margin-top: var(--crm-space-1) !important; }
.crm-space-y-2 > * + * { margin-top: var(--crm-space-2) !important; }
.crm-space-y-3 > * + * { margin-top: var(--crm-space-3) !important; }
.crm-space-y-4 > * + * { margin-top: var(--crm-space-4) !important; }
.crm-space-y-6 > * + * { margin-top: var(--crm-space-6) !important; }

.crm-space-x-1 > * + * { margin-left: var(--crm-space-1) !important; }
.crm-space-x-2 > * + * { margin-left: var(--crm-space-2) !important; }
.crm-space-x-3 > * + * { margin-left: var(--crm-space-3) !important; }
.crm-space-x-4 > * + * { margin-left: var(--crm-space-4) !important; }
.crm-space-x-6 > * + * { margin-left: var(--crm-space-6) !important; }

/* Margins */
.crm-m-0 { margin: 0 !important; }
.crm-m-1 { margin: var(--crm-space-1) !important; }
.crm-m-2 { margin: var(--crm-space-2) !important; }
.crm-m-3 { margin: var(--crm-space-3) !important; }
.crm-m-4 { margin: var(--crm-space-4) !important; }
.crm-m-6 { margin: var(--crm-space-6) !important; }

.crm-mt-0 { margin-top: 0 !important; }
.crm-mt-1 { margin-top: var(--crm-space-1) !important; }
.crm-mt-2 { margin-top: var(--crm-space-2) !important; }
.crm-mt-3 { margin-top: var(--crm-space-3) !important; }
.crm-mt-4 { margin-top: var(--crm-space-4) !important; }
.crm-mt-6 { margin-top: var(--crm-space-6) !important; }

/* Padding */
.crm-p-0 { padding: 0 !important; }
.crm-p-1 { padding: var(--crm-space-1) !important; }
.crm-p-2 { padding: var(--crm-space-2) !important; }
.crm-p-3 { padding: var(--crm-space-3) !important; }
.crm-p-4 { padding: var(--crm-space-4) !important; }
.crm-p-6 { padding: var(--crm-space-6) !important; }

/* Text */
.crm-text-left { text-align: left !important; }
.crm-text-center { text-align: center !important; }
.crm-text-right { text-align: right !important; }

.crm-text-xs { font-size: var(--crm-font-size-xs) !important; }
.crm-text-sm { font-size: var(--crm-font-size-sm) !important; }
.crm-text-base { font-size: var(--crm-font-size-base) !important; }
.crm-text-lg { font-size: var(--crm-font-size-lg) !important; }
.crm-text-xl { font-size: var(--crm-font-size-xl) !important; }

.crm-font-normal { font-weight: var(--crm-font-weight-regular) !important; }
.crm-font-medium { font-weight: var(--crm-font-weight-medium) !important; }
.crm-font-semibold { font-weight: var(--crm-font-weight-semibold) !important; }
.crm-font-bold { font-weight: var(--crm-font-weight-bold) !important; }

.crm-text-primary { color: var(--crm-text-primary) !important; }
.crm-text-secondary { color: var(--crm-text-secondary) !important; }
.crm-text-accent { color: var(--crm-accent) !important; }
.crm-text-success { color: var(--crm-success) !important; }
.crm-text-warning { color: var(--crm-warning) !important; }
.crm-text-error { color: var(--crm-error) !important; }

/* Background */
.crm-bg-primary { background-color: var(--crm-bg-primary) !important; }
.crm-bg-secondary { background-color: var(--crm-bg-secondary) !important; }
.crm-bg-accent { background-color: var(--crm-accent) !important; }
.crm-bg-success { background-color: var(--crm-success) !important; }
.crm-bg-warning { background-color: var(--crm-warning) !important; }
.crm-bg-error { background-color: var(--crm-error) !important; }

/* Borders */
.crm-border { border: 1px solid var(--crm-border) !important; }
.crm-border-top { border-top: 1px solid var(--crm-border) !important; }
.crm-border-bottom { border-bottom: 1px solid var(--crm-border) !important; }
.crm-border-left { border-left: 1px solid var(--crm-border) !important; }
.crm-border-right { border-right: 1px solid var(--crm-border) !important; }

.crm-rounded { border-radius: var(--crm-radius) !important; }
.crm-rounded-sm { border-radius: var(--crm-radius-sm) !important; }
.crm-rounded-md { border-radius: var(--crm-radius-md) !important; }
.crm-rounded-lg { border-radius: var(--crm-radius-lg) !important; }
.crm-rounded-full { border-radius: var(--crm-radius-full) !important; }

/* Shadows */
.crm-shadow { box-shadow: var(--crm-shadow) !important; }
.crm-shadow-sm { box-shadow: var(--crm-shadow-sm) !important; }
.crm-shadow-md { box-shadow: var(--crm-shadow-md) !important; }
.crm-shadow-lg { box-shadow: var(--crm-shadow-lg) !important; }
.crm-shadow-xl { box-shadow: var(--crm-shadow-xl) !important; }

/* Responsive Utilities */
.crm-hidden-mobile { display: none !important; }
.crm-hidden-tablet { display: none !important; }
.crm-hidden-desktop { display: none !important; }

@media (min-width: 768px) {
  .crm-hidden-mobile { display: block !important; }
  .crm-visible-tablet { display: block !important; }
}

@media (min-width: 1024px) {
  .crm-hidden-tablet { display: block !important; }
  .crm-visible-desktop { display: block !important; }
}
```

---

## 📋 **PLANO DE MIGRAÇÃO POR COMPONENTE**

### **Migração de Componentes React**

#### **1. Remover Inline Styles**
```typescript
// ❌ ANTES (inline styles)
<div style={{
  backgroundColor: '#0f172a',
  color: '#f8fafc',
  padding: '16px',
  borderRadius: '8px'
}}>
  Content
</div>

// ✅ DEPOIS (CSS classes)
<div className="crm-stats-card crm-stats-card--accent">
  Content
</div>
```

#### **2. Migrar Estilos Existentes**
```typescript
// Para cada componente com estilos inline:

// 1. Identificar o padrão visual
// 2. Criar classe CSS correspondente
// 3. Substituir style={{}} por className=""
// 4. Testar visualmente
// 5. Remover código de estilo obsoleto
```

### **Arquivos a Migrar**

#### **DashboardNew.tsx**
- [ ] Remover todos os estilos inline
- [ ] Aplicar classes `crm-dashboard-*`
- [ ] Verificar responsividade

#### **ChatPage.tsx**
- [ ] Migrar estilos de mensagens
- [ ] Aplicar classes de chat
- [ ] Manter funcionalidade de tempo real

#### **CommunityDetailsPage.tsx**
- [ ] Estilos de posts e comentários
- [ ] Layout de comunidade
- [ ] Interações sociais

#### **KanbanPage.tsx**
- [ ] Estilos de drag & drop
- [ ] Layout de colunas
- [ ] Cards de tarefas

#### **CommunitiesPage.tsx**
- [ ] Grid de comunidades (parcial)
- [ ] Cards de preview

#### **TokenTestPage.tsx**
- [ ] Estilos de formulário (parcial)

---

## ✅ **CHECKLIST DE MIGRAÇÃO**

### **Preparação**
- [ ] Backup completo do código atual
- [ ] Criar branch `css-rewrite`
- [ ] Instalar dependências necessárias
- [ ] Configurar CSS custom properties

### **Fase 1: Foundation**
- [ ] Criar `crm-design-system.css` expandido
- [ ] Implementar `crm-layout.css`
- [ ] Configurar variáveis CSS globais
- [ ] Testar reset e base styles

### **Fase 2: Componentes Core**
- [ ] Implementar `crm-components.css`
- [ ] Criar buttons, forms, cards
- [ ] Testar componentes isoladamente
- [ ] Validar acessibilidade

### **Fase 3: Páginas**
- [ ] Criar `crm-pages.css`
- [ ] Migrar Dashboard, Kanban, etc.
- [ ] Testar layouts específicos
- [ ] Ajustar breakpoints

### **Fase 4: Responsividade**
- [ ] Implementar `crm-responsive.css`
- [ ] Adicionar bottom navigation
- [ ] Testar mobile/tablet/desktop
- [ ] Otimizar touch targets

### **Fase 5: Utilitários**
- [ ] Criar `crm-utilities.css`
- [ ] Migrar componentes React
- [ ] Remover estilos inline
- [ ] Limpeza final

### **Testes Finais**
- [ ] Testes visuais em todos os dispositivos
- [ ] Validação de acessibilidade
- [ ] Performance (Lighthouse)
- [ ] Funcionalidades intactas
- [ ] Code review

---

## 🚀 **IMPLEMENTAÇÃO PRÁTICA**

### **Comandos para Iniciar**
```bash
# 1. Criar nova branch
git checkout -b css-rewrite

# 2. Criar estrutura de arquivos
mkdir -p src/styles
touch src/styles/crm-design-system.css
touch src/styles/crm-layout.css
touch src/styles/crm-components.css
touch src/styles/crm-pages.css
touch src/styles/crm-responsive.css
touch src/styles/crm-utilities.css

# 3. Importar no index.css ou App.css
@import './styles/crm-design-system.css';
@import './styles/crm-layout.css';
@import './styles/crm-components.css';
@import './styles/crm-pages.css';
@import './styles/crm-responsive.css';
@import './styles/crm-utilities.css';
```

### **Dicas de Desenvolvimento**
1. **Desenvolver iterativamente**: Comece com componentes simples
2. **Testar frequentemente**: Use dev tools para verificar estilos
3. **Manter consistência**: Sempre use variáveis CSS
4. **Documentar**: Comente classes complexas
5. **Versionar**: Commits frequentes para backup

### **Possíveis Desafios**
- **Conflitos CSS**: Verificar especificidade
- **Inline styles**: Migrar gradualmente
- **Responsividade**: Testar em múltiplos dispositivos
- **Performance**: Evitar CSS excessivo

---

**Esta migração resultará em um CSS modular, consistente e de alta performance, totalmente alinhado com o sistema de design definido.**
