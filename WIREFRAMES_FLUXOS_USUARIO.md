# 📱 WIREFRAMES E FLUXOS - SISTEMA CRM

## 🎯 **GUIA DE WIREFRAMES PARA DESIGN**

Este documento apresenta wireframes conceituais e fluxos de usuário do Sistema CRM, organizados por módulos principais.

---

## 🏠 **DASHBOARD (VISÃO GERAL)**

### **Layout Desktop**
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] Sistema CRM                    [USER MENU] [THEME]  │
├─────────────────┬───────────────────────────────────────────┤
│ 🏠 Visão Geral  │  📊 DASHBOARD - VISÃO GERAL               │
│ 🏢 CRM          │                                           │
│ 📋 Pipeline     │  ┌───┐ ┌───┐ ┌───┐ ┌───┐                  │
│ 👥 Comunidades  │  │12 │ │45 │ │234│ │8  │                  │
│ 💬 Chat         │  │EMP│ │TSK│ │MSG│ │COM│                  │
│ 🔧 Ferramentas  │  └─▲─┘ └─▲─┘ └─▲─┘ └─▲─┘                  │
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

### **Layout Mobile**
```
┌─────────────────┐
│ [☰] CRM        │
├─────────────────┤
│ 📊 DASHBOARD    │
│                 │
│ ┌───┐ ┌───┐     │
│ │12 │ │45 │     │
│ │EMP│ │TSK│     │
│ └─▲─┘ └─▲─┘     │
│                 │
│ ┌───┐ ┌───┐     │
│ │234│ │8  │     │
│ │MSG│ │COM│     │
│ └─▲─┘ └─▲─┘     │
│                 │
│ 📈 GRÁFICO      │
│ [CHART HERE]    │
│                 │
│ 📋 ATIVIDADES   │
│ • João criou... │
│ • Maria moveu.. │
│ • Pedro coment. │
│ • Ana criou...  │
│                 │
│ 🏠 💬 👥 📋 🏢 │ ← Bottom Nav
└─────────────────┘
```

---

## 🏢 **CRM (GESTÃO DE EMPRESAS)**

### **Tela de Listagem**
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

### **Modal de Criação/Edição**
```
┌─────────────────────────────────────────────────────────────┐
│                    CRIAR NOVA EMPRESA                       │
├─────────────────────────────────────────────────────────────┤
│  📋 INFORMAÇÕES BÁSICAS                                    │
│                                                             │
│  Nome da Empresa *                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ TechCorp Ltda                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Email Corporativo *                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ contato@techcorp.com                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Telefone                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ (11) 99999-9999                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Website                                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ https://techcorp.com                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────┬─────────────────┬─────────────────┐    │
│  │ Setor: Tech     │ Porte: Médio     │ Status: Ativo   │    │
│  └─────────────────┴─────────────────┴─────────────────┘    │
│                                                             │
│  📍 ENDEREÇO                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Rua das Tecnologias, 123 - São Paulo/SP          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  📝 OBSERVAÇÕES                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Empresa especializada em desenvolvimento web...     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                [Cancelar]                [Criar Empresa]    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 **PIPELINE (KANBAN)**

### **Board Completo**
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
│                 │  │ │ 🏷️  │ │ │ 🏷️  │ │         │ │ 🏷️  │ │     │
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

### **Card de Task (Detalhes)**
```
┌─────────────────────────────────────┐
│  🚀 Implementar API de Usuários     │
│                                     │
│  📝 Descrição:                      │
│     Criar endpoints REST para       │
│     gestão de usuários do sistema.  │
│                                     │
│  👤 Responsável: João Silva         │
│  📅 Prazo: 15/11/2025              │
│  🎯 Prioridade: Alta                │
│                                     │
│  🏷️  Tags: backend, api, users     │
│                                     │
│  📎 Anexos: 2 arquivos              │
│  💬 Comentários: 5                  │
│                                     │
│  ┌─────────┬─────────┬─────────┐     │
│  │ ✏️ Edit │ 🗑️ Del  │ ↗️ Move │     │
│  └─────────┴─────────┴─────────┘     │
└─────────────────────────────────────┘
```

---

## 👥 **COMUNIDADES**

### **Grid de Comunidades**
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
│                 │  │  │  🌐    │ │  │  🔒    │ │  │  🌐    │ │ │
│                 │  │  │ Tech    │ │  │ Design │ │  │ Data   │ │ │
│                 │  │  │ Talk    │ │  │ Hub    │ │  │ Science│ │ │
│                 │  │  │ 12 memb │ │  │ 8 memb │ │  │ 25 memb│ │ │
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

### **Página de Detalhes da Comunidade**
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] Sistema CRM                    [USER MENU] [THEME]  │
├─────────────────┬───────────────────────────────────────────┤
│ 🏠 Visão Geral  │  👥 TECH TALK - COMUNIDADE PÚBLICA         │
│ 🏢 CRM          │                                           │
│ 📋 Pipeline     │  ┌─────────────────────────────────────┐  │
│ 👥 Comunidades  │  │ 🌐 Tech Talk                        │  │
│ 💬 Chat         │  │ Discussões sobre tecnologia        │  │
│ 🔧 Ferramentas  │  └─────────────────────────────────────┘  │
├─────────────────┤                                           │
│                 │  ┌─────────────────┬─────────────────────┐ │
│                 │  │ 👥 MEMBROS: 12  │ 📊 ATIVIDADE         │ │
│                 │  │ João, Maria,    │ Posts: 45            │ │
│                 │  │ Pedro, Ana...   │ Comentários: 123     │ │
│                 │  └─────────────────┴─────────────────────┘ │
│                 │                                           │
│                 │  ┌─────────────────────────────────────┐  │
│                 │  │ 📝 POSTS RECENTES                    │  │
│                 │  ├─────────────────────────────────────┤  │
│                 │  │ 🕒 João • 2h atrás                  │  │
│                 │  │ "Novidades no React 19..."          │  │
│                 │  │ 👍 5 ❤️ 2 💬 3                      │  │
│                 │  ├─────────────────────────────────────┤  │
│                 │  │ 🕒 Maria • 4h atrás                 │  │
│                 │  │ "Dicas de performance..."           │  │
│                 │  │ 👍 8 ❤️ 1 💬 7                      │  │
│                 │  └─────────────────────────────────────┘  │
│                 │                                           │
│                 │  [📝 Criar Post] [⚙️ Configurações]       │
└─────────────────┴───────────────────────────────────────────┘
```

---

## 💬 **CHAT**

### **Interface Principal**
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] Sistema CRM                    [USER MENU] [THEME]  │
├─────────────────┬───────────────────────────────────────────┤
│ 🏠 Visão Geral  │  💬 CHAT - CONVERSAS ATIVAS               │
│ 🏢 CRM          │                                           │
│ 📋 Pipeline     │  ┌─────────────┬─────────────────────────┐ │
│ 👥 Comunidades  │  │ 🟢 GERAL    │                         │ │
│ 💬 Chat         │  │ 🟡 DEV TEAM │    💬 GERAL              │ │
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

### **Sala de Chat Detalhada**
```
┌─────────────────────────────────────────────────────────────┐
│  💬 DEV TEAM (5 membros online)          [👥] [⚙️] [×]     │
├─────────────────────────────────────────────────────────────┤
│ 🕒 João • 14:30                                           │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Olá equipe! Temos uma reunião hoje às 15h para     │    │
│ │ discutir o novo sprint.                            │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                           │
│ 🕒 Maria • 14:32                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Perfeito! Já preparei a apresentação dos requisitos.│    │
│ │ Alguém pode revisar antes?                          │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                           │
│ 🕒 Pedro • 14:35                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Claro! Mando o feedback em 10 minutos.              │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                           │
│ 🕒 Ana • 14:37                                            │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Obrigada! Enquanto isso vou ajustar os wireframes. │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                           │
│ 💭 João está digitando...                                 │
│                                                           │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ [📤] │
│ │ Ótimo trabalho equipe! 🚀                        │ [📎] │
│ └─────────────────────────────────────────────────────┘ [😊] │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 **EXPERIÊNCIA MÓVEL**

### **Bottom Navigation**
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

### **Sidebar Mobile (Collapsed)**
```
┌─────┬───────────────────────────────────────────────────────┐
│ ☰   │  📊 DASHBOARD                                        │
│     │                                                      │
│ 🏠  │  [CONTEÚDO PRINCIPAL]                                │
│ 🏢  │                                                      │
│ 📋  │                                                      │
│ 👥  │                                                      │
│ 💬  │                                                      │
│ 🔧  │                                                      │
└─────┴───────────────────────────────────────────────────────┘
```

---

## 🔄 **FLUXOS DE USUÁRIO**

### **Fluxo de Autenticação**
```
LOGIN PAGE → [Firebase Auth] → DASHBOARD
    ↓
EMAIL VERIFICATION (se necessário)
    ↓
DASHBOARD (primeiro acesso)
```

### **Fluxo CRUD Empresa**
```
LISTA EMPRESAS → [+ CRIAR] → MODAL FORM → [SALVAR] → LISTA (atualizada)
    ↓
[EDITAR] → MODAL FORM (pré-preenchido) → [SALVAR] → LISTA
    ↓
[EXCLUIR] → CONFIRMAÇÃO → LISTA (removido)
```

### **Fluxo Kanban**
```
BOARD SELECTION → KANBAN BOARD → [DRAG TASK] → POSIÇÃO ATUALIZADA
    ↓
[+ NOVA TASK] → MODAL FORM → BOARD (task adicionada)
    ↓
[EDIT TASK] → MODAL FORM → BOARD (task atualizada)
```

### **Fluxo Chat**
```
LISTA SALAS → [CLICAR SALA] → CONVERSA ATIVA
    ↓
[DIGITAR MENSAGEM] → [ENVIAR] → MENSAGEM ENVIADA (WebSocket)
    ↓
[RESPOSTA] → MENSAGEM RECEBIDA (tempo real)
```

---

## 🎨 **PATRÕES DE INTERAÇÃO**

### **Estados Loading**
- **Skeleton**: Para conteúdo que está carregando
- **Spinner**: Para ações específicas
- **Disabled buttons**: Durante processamento

### **Feedback Visual**
- **Toast notifications**: Para ações concluídas
- **Inline validation**: Para erros de formulário
- **Status indicators**: Verde/vermelho para sucesso/erro

### **Navegação Hierárquica**
- **Breadcrumb**: Para páginas profundas
- **Back buttons**: Para retorno
- **Tab navigation**: Para seções relacionadas

---

**Estes wireframes servem como guia conceitual para o design de interface do Sistema CRM.**
