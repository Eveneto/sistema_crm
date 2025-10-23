🛠 Sistema CRM – Documento Técnico Detalhado
1. 📚 Biblioteca de Componentes UI
1.1 Layout Components

MainLayout

Estrutura principal do sistema com sidebar lateral e header fixo.

Sidebar: expansível/collapsável, ícones representativos, labels opcionais em desktop, apenas ícones em mobile.

Header: inclui logo, menu de usuário, troca de tema e breadcrumb opcional.

Container fluido: centraliza o conteúdo, respeita padding responsivo.

PageHeader

Composto por título grande, subtítulo menor e ações contextuais (botões).

Suporta onBack para retorno de navegação hierárquica.

Espaçamento: padding top/bottom 16px, lateral 24px.

Tipografia: Título 24px, subtítulo 16px, cor baseada em --crm-text.

ContentContainer

Área principal do conteúdo.

Padding interno ajustável: desktop 24–32px, mobile 16px.

Largura máxima controlada: 1200px desktop, 100% em mobile.

1.2 Data Display

Stats Cards

Cards compactos exibindo valor + label + ícone.

Variantes visuais:

Accent: cor --crm-accent

Success: cor --crm-success

Warning: cor --crm-warning

Info: cor --crm-info

Tipografia: valor grande (20–24px), label menor (12–14px), cor secundária.

Data Table

Suporta paginação, filtros, ordenação e scroll horizontal.

Cabeçalhos fixos, linhas com hover highlight.

Indicadores de seleção múltipla: checkbox + highlight de linha.

Responsividade: em telas menores, colunas menos importantes viram dropdown.

Charts Container

Cada gráfico tem header com título e legendas.

Tipos de gráfico: linha, barra, pizza.

Grid responsivo: desktop 2–3 gráficos lado a lado, mobile 1 por vez.

Cores consistentes com a paleta semântica.

1.3 Forms & Inputs

Form Modal

Modal centrado com fundo semi-transparente (rgba(0,0,0,0.3)).

Campos com label, placeholder, helper text.

Validação inline: erro exibido abaixo do campo, ícone de erro à esquerda.

Botões de ação: primário (criar/salvar), secundário (cancelar), desativado durante submit.

Search Input

Input com ícone de lupa, placeholder e possibilidade de trigger onSearch ao digitar ou apertar Enter.

Feedback visual: borda azul ao focar, vermelho ao erro.

Select Dropdown

Lista de opções com scroll vertical.

Destaca a opção selecionada com cor --crm-accent-light.

Suporta busca interna e keyboard navigation.

1.4 Feedback Components

Loading

Spinner: centralizado ou inline em botões.

Skeleton: simula layout do conteúdo antes de carregar.

Buttons: desabilitados durante ações de envio, mostrando indicador de carregamento.

Toast Notifications

Pequenas notificações flutuantes no canto superior direito.

Tipos: sucesso (verde), erro (vermelho), aviso (amarelo), informação (roxo).

Duração padrão: 3–5s, com opção de fechar manualmente.

Empty States

Cards ou áreas indicando nenhum dado disponível.

Incluem ícone ilustrativo + mensagem clara + ação sugerida.

1.5 Navigation Components

Sidebar Menu

Links com ícones e labels, hover com fundo --crm-bg-hover.

Indicação da página ativa: borda esquerda ou background destacado.

Collapsible em mobile, expandido em desktop.

Breadcrumb

Indica a hierarquia atual do usuário.

Cores: labels secundárias, item atual destacado em --crm-accent.

Tabs

Segmentação de conteúdo.

Estado ativo: underline ou background leve, cor --crm-accent.

Estado hover: leve mudança de cor de fundo ou sombra.

1.6 Notification Components

Badge

Pequeno círculo com número ou indicador de alerta.

Posicionado sobre ícones ou botões.

Alert

Caixa de aviso, com cores semânticas: sucesso, erro, aviso, informação.

Pode ser fechada manualmente (closable).

Popover

Conteúdo extra exibido ao hover ou click.

Inclui título opcional, corpo do conteúdo e botões de ação.

1.7 Responsive Utilities

Classes de grid responsivo (xs, sm, md, lg).

Ocultação condicional (hidden md:block) para otimização de layout.

Mobile-first: layout ajusta prioridades de conteúdo.

1.8 Theme Components

Theme Toggle

Alterna Dark/Light mode via CSS custom properties.

Todos os componentes respeitam cores, sombras e backgrounds.

1.9 Accessibility

Gerenciamento de foco (focus-visible).

Suporte a screen readers (aria-labels).

Redução de animações em prefers-reduced-motion.

1.10 Performance Patterns

Lazy loading: React.lazy + Suspense para módulos pesados.

Memoization: React.memo para componentes que não mudam com frequência.

Virtual scrolling: listas longas (100+ items) para performance.

1.11 Usage Patterns

CRUD: modal + confirmação + toast de sucesso/erro.

Form validation: campos obrigatórios, formatos de email, telefone e URL.

Error handling: logging, mensagens claras, fallback visual.

1.12 Development Tools

Props interfaces padronizadas.

Custom hooks para chamadas de API.

Storybook ou sandbox para testes visuais isolados.

2. 🎨 Sistema de Cores

Backgrounds

Primary: #0f172a

Secondary: #1e293b

Elevated: #334155

Hover: rgba(59, 130, 246, 0.1)

Textos

Principal: #f8fafc

Secundário: #cbd5e1

Disabled: #64748b

Accent

Primário: #3b82f6

Light: #60a5fa

Semântico

Success: #10b981

Warning: #f59e0b

Error: #ef4444

Info: #8b5cf6

Bordas

Normal: #334155

Light: #475569

Modo claro

Inverte cores de fundo e texto, mantendo contraste e semântica.

3. 🏗 Wireframes e Layouts

3.1 Dashboard

Desktop: cards de estatísticas no topo, gráfico de linha e barra central, lista de atividades recentes lateral.

Mobile: cards empilhados, gráfico acima da lista, bottom navigation fixo.

3.2 CRM – Gestão de Empresas

Tabela responsiva com filtros, paginação e estatísticas.

Modal detalhado: campos organizados em seções, botões fixos ao final.

3.3 Pipeline (Kanban)

Colunas com cores suaves e bordas arredondadas.

Cards com sombra leve, hover highlight, drag-and-drop visual.

3.4 Comunidades

Grid de cards com ícones público/privado, número de membros e ações rápidas.

Página detalhada: membros, atividade, posts recentes, botões de criar post/configuração.

3.5 Chat

Lista de salas: indicadores de status (online/offline).

Sala ativa: mensagens em bolhas, alinhadas por autor, tipografia clara, envio de anexos/emoji.

3.6 Experiência Mobile

Bottom nav fixo com ícones e labels.

Sidebar colapsada com acesso rápido, animação suave de expansão.

4. 🔄 Fluxos de Usuário

4.1 Autenticação

LOGIN → Firebase Auth → DASHBOARD

Email verification → primeiro acesso → Dashboard com onboarding.

4.2 CRUD Empresa

Lista → criar → modal → salvar → atualização da lista.

Editar → modal pré-preenchido → salvar.

Excluir → confirmação → lista atualizada.

4.3 Kanban

Seleção de board → drag task → posição atualizada.

Criar task → modal → board atualizado.

Editar task → modal → board atualizado.

4.4 Chat

Lista de salas → abrir → digitar → enviar → atualização em tempo real.

Indicação de status, typing indicator, notificações visuais.

5. 🎨 Padrões de Interação

Estados Loading: Skeleton, Spinner, Disabled buttons.

Feedback Visual: Toasts, inline validation, status indicators.

Navegação Hierárquica: Breadcrumb, back buttons, tabs.

Consistência: cores, espaçamentos, tipografia e componentes iguais em todos os módulos.

Animações: sutis, rápidas, sem prejudicar performance.

6. 📌 Diretrizes de Desenvolvimento

Reutilização: biblioteca UI padronizada.

Responsividade: mobile-first, grid system, media queries.

Acessibilidade: focus visible, aria-labels, prefers-reduced-motion.

Performance: lazy loading, memoization, virtual scrolling.

Boas práticas: validação de forms, tratamento de erros, mensagens de feedback consistentes, uso de toast para notificações.

Documentação: cada componente deve ter guia de uso, variantes, props e exemplos visuais.