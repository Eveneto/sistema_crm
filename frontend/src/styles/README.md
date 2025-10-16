# CRM Design System - Guia de Implementação

## 🎨 Visão Geral

Este é um sistema de design CSS completo e modular para o CRM, implementado seguindo as melhores práticas de arquitetura CSS moderna. O sistema foi criado baseado na documentação completa de design e segue uma abordagem mobile-first com design system consistente.

## 📁 Estrutura dos Arquivos

```
frontend/src/styles/
├── crm-main.css           # Arquivo principal de importação
├── crm-design-system.css  # Variáveis CSS e design tokens
├── crm-layout.css         # Layout e navegação
├── crm-components-new.css # Biblioteca de componentes
├── crm-pages.css          # Estilos específicos de página
├── crm-responsive.css     # Sistema responsivo
└── crm-utilities.css      # Classes utilitárias
```

## 🚀 Como Usar

### 1. Importação no Projeto

```typescript
// No seu index.tsx ou App.tsx
import './styles/crm-main.css';
```

### 2. Uso Básico

```tsx
// Componente usando classes do design system
function MyComponent() {
  return (
    <div className="crm-card crm-p-4">
      <h2 className="crm-text-xl crm-font-semibold crm-mb-3">
        Título do Card
      </h2>
      <p className="crm-text-secondary">
        Conteúdo do card com estilos consistentes.
      </p>
      <button className="crm-btn crm-btn-primary crm-mt-4">
        Ação Principal
      </button>
    </div>
  );
}
```

## 🎯 Componentes Disponíveis

### Layout
- `.crm-main-layout` - Layout principal da aplicação
- `.crm-sidebar` - Sidebar lateral responsiva
- `.crm-content` - Container de conteúdo principal
- `.crm-bottom-nav` - Navegação móvel inferior

### Componentes Básicos
- `.crm-btn` - Botões com variantes (primary, secondary, outline, ghost)
- `.crm-card` - Cards com header, body e footer
- `.crm-form-*` - Elementos de formulário
- `.crm-table` - Tabelas responsivas
- `.crm-modal` - Modais com overlay
- `.crm-toast` - Notificações toast

### Estados e Feedback
- `.crm-loading` - Estados de carregamento
- `.crm-empty` - Estados vazios
- `.crm-error` - Estados de erro
- `.crm-success` - Estados de sucesso

## 📱 Sistema Responsivo

O sistema usa uma abordagem **mobile-first** com breakpoints fluidos:

```css
/* Mobile: 320px - 767px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px - 1439px */
/* Large: 1440px+ */
```

### Classes Responsivas
```tsx
{/* Esconde em mobile, mostra em desktop */}
<div className="crm-hidden-mobile crm-block-desktop">
  Conteúdo apenas para desktop
</div>

{/* Layout que muda com o breakpoint */}
<div className="crm-flex-mobile crm-grid-tablet">
  Itens que se adaptam
</div>
```

## 🎨 Design Tokens

### Cores
```css
--crm-primary: #0f172a;      /* Azul escuro */
--crm-success: #10b981;      /* Verde */
--crm-warning: #f59e0b;      /* Amarelo */
--crm-error: #ef4444;        /* Vermelho */
--crm-info: #8b5cf6;         /* Roxo */
```

### Espaçamento Fluido
```css
--crm-space-1: clamp(0.25rem, 0.5vw, 0.5rem);
--crm-space-2: clamp(0.5rem, 1vw, 0.75rem);
--crm-space-3: clamp(0.75rem, 1.5vw, 1rem);
/* ... até --crm-space-16 */
```

### Tipografia
```css
--crm-font-family: 'Inter', system-ui, sans-serif;
--crm-text-xs: clamp(0.75rem, 2vw, 0.875rem);
--crm-text-sm: clamp(0.875rem, 2.5vw, 1rem);
/* ... até --crm-text-4xl */
```

## 🛠️ Utilitários

### Espaçamento
```tsx
{/* Margens */}
<div className="crm-m-4">Margin 4</div>
<div className="crm-mt-3 crm-mb-2">Margin top/bottom</div>
<div className="crm-mx-auto">Margin horizontal auto</div>

{/* Paddings */}
<div className="crm-p-4">Padding 4</div>
<div className="crm-px-3 crm-py-2">Padding horizontal/vertical</div>
```

### Layout
```tsx
{/* Flexbox */}
<div className="crm-flex crm-justify-center crm-items-center">
  <span>Centralizado</span>
</div>

{/* Grid */}
<div className="crm-grid crm-grid-cols-3">
  <div>Coluna 1</div>
  <div>Coluna 2</div>
  <div>Coluna 3</div>
</div>
```

### Cores e Texto
```tsx
{/* Cores */}
<div className="crm-text-primary crm-bg-secondary">
  Texto primário com fundo secundário
</div>

{/* Tamanhos */}
<h1 className="crm-text-3xl crm-font-bold">Título Grande</h1>
<p className="crm-text-sm crm-text-muted">Texto pequeno</p>
```

## 🔧 Customização

### Modificando Variáveis
```css
/* Em crm-design-system.css */
:root {
  --crm-primary: #1e40af; /* Azul mais claro */
  --crm-radius-lg: 12px;  /* Bordas mais arredondadas */
}
```

### Criando Novos Componentes
```css
/* Adicione em crm-components-new.css */
.crm-custom-component {
  background: var(--crm-bg-elevated);
  border: 1px solid var(--crm-border);
  border-radius: var(--crm-radius-lg);
  padding: var(--crm-space-4);
}
```

### Estendendo Componentes Existentes
```tsx
{/* Usando classes múltiplas */}
<button className="crm-btn crm-btn-primary crm-w-full crm-text-lg">
  Botão Customizado
</button>
```

## 📋 Boas Práticas

### 1. Use Classes Utilitárias
```tsx
{/* ✅ Bom: Usa utilitários */}
<div className="crm-flex crm-justify-between crm-items-center crm-p-4">
  <h3 className="crm-text-lg crm-font-semibold">Título</h3>
  <button className="crm-btn crm-btn-primary">Ação</button>
</div>

{/* ❌ Evite: CSS customizado */}
<div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
  <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Título</h3>
  <button style={{ background: '#0f172a', color: 'white' }}>Ação</button>
</div>
```

### 2. Mantenha Consistência
```tsx
{/* ✅ Use sempre as classes do design system */}
<Card className="crm-card">
  <CardHeader className="crm-card-header">
    <CardTitle className="crm-card-title">Título</CardTitle>
  </CardHeader>
</Card>

{/* ❌ Não misture estilos */}
<Card style={{ borderRadius: '8px' }}>
  <CardHeader className="custom-header">
    <CardTitle>Título</CardTitle>
  </CardHeader>
</Card>
```

### 3. Responsividade
```tsx
{/* ✅ Mobile-first */}
<div className="crm-flex-col crm-flex-row-tablet">
  <div className="crm-w-full crm-w-1/2-tablet">Item</div>
  <div className="crm-w-full crm-w-1/2-tablet">Item</div>
</div>
```

## 🧪 Testes e Debugging

### Verificando Aplicação dos Estilos
```bash
# No navegador, inspecione elementos e verifique:
# 1. Se as variáveis CSS estão sendo aplicadas
# 2. Se os componentes têm as classes corretas
# 3. Se a responsividade está funcionando
```

### Teste em Diferentes Dispositivos
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large**: 1440px+

## 🔄 Migração

### Do Sistema Antigo
1. ✅ **Concluído**: Análise do sistema atual
2. ✅ **Concluído**: Criação dos novos arquivos CSS
3. 🔄 **Em andamento**: Substituição gradual dos estilos antigos
4. ⏳ **Pendente**: Remoção dos arquivos legados

### Passos para Migração
```bash
# 1. Importe o novo sistema
import './styles/crm-main.css';

# 2. Substitua classes gradualmente
# Antes: .old-button-class
# Depois: .crm-btn crm-btn-primary

# 3. Teste cada componente migrado
# 4. Remova arquivos antigos quando tudo estiver migrado
```

## 📚 Documentação Relacionada

- [Análise Completa do Sistema](./ANALISE_COMPLETA_APLICACAO_CRM.md)
- [Design System Detalhado](./ANALISE_DESIGN_SYSTEM_COMPLETA.md)
- [Wireframes e Componentes](./ANALISE_WIREFRAMES_COMPONENTES.md)
- [Plano de Implementação](./PLANO_IMPLEMENTACAO_CSS_COMPLETO.md)

## 🤝 Suporte

Para dúvidas sobre o uso do design system:

1. Consulte este documento primeiro
2. Verifique os arquivos de exemplo nos componentes
3. Teste no navegador com as dev tools
4. Consulte a documentação de design relacionada

---

**Versão**: 1.0.0
**Última atualização**: Dezembro 2024
**Status**: ✅ Implementado e documentado
