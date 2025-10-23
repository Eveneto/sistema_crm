# 🎨 GUIA VISUAL - SISTEMA CRM

## 📱 **RESUMO EXECUTIVO PARA DESIGN**

Este documento resume os aspectos visuais e de experiência do usuário do Sistema CRM, focando em elementos que impactam o design de interface.

---

## 🎯 **IDENTIDADE VISUAL**

### **Paleta de Cores**
- **Tema Principal**: Dark theme com azul navy
- **Cor Primária**: `#0f172a` (Azul escuro)
- **Cor Secundária**: `#3b82f6` (Azul claro)
- **Cor de Sucesso**: `#10b981` (Verde esmeralda)
- **Cor de Aviso**: `#f59e0b` (Âmbar)
- **Cor de Erro**: `#ef4444` (Vermelho)
- **Cor de Info**: `#8b5cf6` (Roxo)

### **Tipografia**
- **Fonte Principal**: Sistema (sans-serif)
- **Tamanhos**: 12px, 14px, 16px, 18px, 20px, 24px, 32px
- **Pesos**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

---

## 🏗️ **LAYOUT E ESTRUTURA**

### **Layout Principal**
```
┌─────────────────────────────────────┐
│           TOP NAVIGATION            │
├─────────────────┬───────────────────┤
│    SIDEBAR      │                   │
│    (280px)      │    MAIN CONTENT    │
│                 │                   │
│                 │                   │
└─────────────────┴───────────────────┘
```

### **Sidebar Estados**
- **Expandido**: 280px (desktop)
- **Colapsado**: 80px (desktop)
- **Mobile**: Hidden por padrão, toggle via botão

### **Breakpoints Responsivos**
- **Mobile**: ≤ 768px
- **Tablet**: 769px - 1200px
- **Desktop**: > 1200px

---

## 📊 **PÁGINAS PRINCIPAIS**

### **1. Dashboard (Visão Geral)**
**Layout**: Grid responsivo 2x2 + gráficos
**Elementos**:
- 4 cards de estatísticas (empresas, tasks, mensagens, comunidades)
- 3 gráficos (linha, barra, pizza)
- Lista de atividades recentes
- Header com título e subtítulo

### **2. CRM (Empresas)**
**Layout**: Tabela + modais
**Elementos**:
- Tabela com paginação e filtros
- Botão flutuante de adição (+)
- Modais de criação/edição
- Cards de detalhes da empresa

### **3. Pipeline (Kanban)**
**Layout**: Board horizontal + sidebar
**Elementos**:
- Colunas drag & drop
- Cards de tasks coloridos
- Modal de criação de tasks
- Estatísticas do board

### **4. Comunidades**
**Layout**: Grid de cards
**Elementos**:
- Cards de comunidades (públicas/privadas)
- Filtros e busca
- Tabs (Todas/Minhas)
- Modal de criação

### **5. Chat**
**Layout**: Sidebar + chat area
**Elementos**:
- Lista de salas à esquerda
- Área de mensagens central
- Input de mensagem inferior
- Indicadores online/offline

---

## 🧩 **COMPONENTES PRINCIPAIS**

### **Cards**
- **Border Radius**: 12px
- **Shadow**: Suave em hover
- **Background**: `var(--crm-bg-elevated)`
- **Padding**: 24px interno

### **Botões**
- **Primary**: Azul gradiente
- **Secondary**: Bordas azuis
- **Danger**: Vermelho sólido
- **Border Radius**: 8px
- **Height**: 36px mínimo

### **Formulários**
- **Inputs**: Bordas arredondadas, focus azul
- **Labels**: Acima dos campos
- **Validation**: Mensagens vermelhas abaixo
- **Spacing**: 16px entre campos

### **Tabelas**
- **Headers**: Azul escuro
- **Rows**: Hover cinza claro
- **Pagination**: Centralizada inferior
- **Actions**: Ícones à direita

### **Modais**
- **Width**: 600px (máximo)
- **Header**: Título + botão fechar
- **Footer**: Botões de ação
- **Backdrop**: Blur escuro

---

## 📱 **EXPERIÊNCIA MÓVEL**

### **Navegação Mobile**
- **Bottom Navigation**: Tabs fixas inferior
- **Hamburger Menu**: Toggle sidebar
- **Swipe Gestures**: Para navegação

### **Layout Adaptativo**
- **Single Column**: Tudo empilhado
- **Touch Targets**: 44px mínimo
- **Readable Text**: 16px mínimo
- **Thumb-friendly**: Botões grandes

### **Gráficos Mobile**
- **Responsive Charts**: Adaptação automática
- **Touch Interactions**: Pinch to zoom
- **Simplified Views**: Versões mobile dos gráficos

---

## 🎨 **MICROINTERAÇÕES**

### **Hover States**
- **Cards**: Shadow suave + translateY(-2px)
- **Buttons**: Scale 1.02 + shadow
- **Links**: Underline suave
- **Duration**: 0.2s ease

### **Loading States**
- **Spinners**: Azul primário
- **Skeletons**: Pulsing animation
- **Progress Bars**: Linear para uploads

### **Feedback Visual**
- **Success**: Verde + check icon
- **Error**: Vermelho + X icon
- **Warning**: Amarelo + ! icon
- **Info**: Azul + i icon

---

## ♿ **ACESSIBILIDADE**

### **Contraste**
- **Texto normal**: 4.5:1 mínimo
- **Texto grande**: 3:1 mínimo
- **UI elements**: 3:1 mínimo

### **Navegação**
- **Focus indicators**: Outline azul 2px
- **Skip links**: Pular para conteúdo
- **Keyboard navigation**: Tab order lógico

### **Conteúdo**
- **Alt text**: Todas as imagens
- **Semantic HTML**: Headers, landmarks
- **Screen readers**: ARIA labels onde necessário

---

## 📐 **ESPAÇAMENTO E DIMENSÕES**

### **Sistema de Spacing**
- **4px**: xs (pequenos gaps)
- **8px**: sm (margins internos)
- **16px**: md (entre elementos)
- **24px**: lg (seções)
- **32px**: xl (containers)
- **48px**: 2xl (páginas)

### **Grid System**
- **Columns**: 24 colunas
- **Gutter**: 16px entre colunas
- **Breakpoints**: xs, sm, md, lg, xl, xxl

---

## 🚀 **PERFORMANCE VISUAL**

### **Loading Strategy**
- **Skeleton screens**: Durante carregamento
- **Progressive enhancement**: Conteúdo básico primeiro
- **Lazy loading**: Imagens e componentes

### **Animations**
- **Duration**: 0.2-0.3s
- **Easing**: ease-out para entrada, ease-in para saída
- **Reduced motion**: Respeita preferência do usuário

---

## 🎯 **PRINCÍPIOS DE DESIGN**

1. **Consistência**: Mesmo padrão em todas as páginas
2. **Simplicidade**: Interface limpa, sem clutter
3. **Hierarquia**: Informação organizada por importância
4. **Feedback**: Respostas claras às ações do usuário
5. **Acessibilidade**: Usável por todos os tipos de usuário

---

## 📋 **CHECKLIST PARA NOVOS COMPONENTES**

- [ ] Usa variáveis CSS do design system?
- [ ] Responsivo em mobile/tablet/desktop?
- [ ] Estados hover/focus implementados?
- [ ] Contraste adequado para acessibilidade?
- [ ] Loading states incluídos?
- [ ] Funciona com navegação por teclado?
- [ ] Testado em diferentes navegadores?

---

**Este guia serve como referência para manter consistência visual e experiência do usuário em todo o Sistema CRM.**
