# 🌙 Teste Manual - Melhorias Visuais do Modo Escuro

## Objetivo
Verificar se o modo escuro agora apresenta uma inversão visual adequada do tema claro, mantendo a paleta azul original e melhorando a legibilidade.

## Preparação
1. Certifique-se de que o frontend está rodando (`npm start`)
2. Abra o sistema no navegador (http://localhost:3000)
3. Faça login no sistema

## Testes Visuais

### 1. **Verificação da Paleta de Cores**
- [ ] **Cores primárias**: Azul deve permanecer azul no modo escuro (não verde)
- [ ] **Backgrounds**: Fundo claro (#ffffff) deve se tornar escuro azulado (#1a1a24)
- [ ] **Textos**: Texto escuro deve se tornar branco/claro
- [ ] **Botões**: Botões azuis devem manter tonalidade azul adaptada

### 2. **Teste de Alternância de Tema**
**Passos:**
1. Localize o toggle de tema na sidebar (ícone de sol/lua)
2. Clique para alternar para modo escuro
3. Observe a transição suave
4. Clique novamente para voltar ao modo claro
5. Repita 2-3 vezes

**Verificações:**
- [ ] Transição é suave (300ms)
- [ ] Não há "piscadas" ou mudanças bruscas
- [ ] Todas as seções mudam de tema simultaneamente
- [ ] Ícone do toggle muda corretamente

### 3. **Teste de Componentes Específicos**

#### **3.1 Sidebar**
- [ ] Background da sidebar fica azul escuro
- [ ] Texto dos itens de menu fica claro
- [ ] Avatar do usuário mantém cor azul
- [ ] Hover nos itens funciona corretamente

#### **3.2 Cards e Containers**
- [ ] Cards têm background escuro
- [ ] Bordas são visíveis com cor apropriada
- [ ] Texto interno é legível (branco/claro)
- [ ] Sombras são suaves e visíveis

#### **3.3 Formulários**
- [ ] Campos de input têm background escuro
- [ ] Texto digitado é branco/claro
- [ ] Bordas são visíveis
- [ ] Placeholders são legíveis

#### **3.4 Tabelas**
- [ ] Background das tabelas é escuro
- [ ] Linhas alternadas são distinguíveis
- [ ] Headers são legíveis
- [ ] Dados nas células são claros

#### **3.5 Botões**
- [ ] Botão primário mantém azul (adaptado)
- [ ] Botão secundário tem contraste adequado
- [ ] Estados hover funcionam
- [ ] Texto dos botões é legível

### 4. **Teste de Páginas Específicas**

#### **4.1 Dashboard**
- [ ] Métricas/cards são legíveis
- [ ] Gráficos se adaptam ao tema
- [ ] Cores não conflitam

#### **4.2 Empresas**
- [ ] Lista de empresas é legível
- [ ] Formulário de criação funciona
- [ ] Modal de edição tem contraste adequado

#### **4.3 Kanban**
- [ ] Colunas têm background apropriado
- [ ] Cards são distinguíveis
- [ ] Texto é legível

### 5. **Teste de Responsividade**

#### **Desktop (> 1200px)**
- [ ] Layout se adapta corretamente
- [ ] Sidebar expandida funciona
- [ ] Todas as cores estão corretas

#### **Tablet (768px - 1199px)**
- [ ] Sidebar colapsada funciona
- [ ] Conteúdo principal se adapta
- [ ] Toggle de tema acessível

#### **Mobile (< 768px)**
- [ ] Menu móvel funciona
- [ ] Cores se adaptam
- [ ] Toggle está acessível

### 6. **Teste de Persistência**
**Passos:**
1. Ative o modo escuro
2. Recarregue a página (F5)
3. Navegue para outra página
4. Abra nova aba do sistema

**Verificações:**
- [ ] Tema persiste após reload
- [ ] Tema persiste na navegação
- [ ] Tema persiste em novas abas

### 7. **Teste de Contraste e Acessibilidade**
- [ ] Texto é legível em todos os componentes
- [ ] Contraste atende WCAG 2.1 AA (3:1 mínimo)
- [ ] Não há elementos "invisíveis"
- [ ] Links e botões são distinguíveis

### 8. **Teste de Detecção do Sistema**
**Para testar preferência do sistema:**
1. Mude a preferência de tema do seu OS para escuro
2. Limpe o localStorage do navegador
3. Recarregue a página

**Verificações:**
- [ ] Sistema detecta preferência escura automaticamente
- [ ] Sistema detecta preferência clara automaticamente

## Problemas Comuns a Verificar

### ❌ **Problemas que NÃO devem ocorrer:**
- [ ] Cores verdes no lugar de azuis
- [ ] Texto branco em background branco
- [ ] Texto escuro em background escuro
- [ ] Componentes "invisíveis"
- [ ] Transições bruscas ou "piscadas"
- [ ] Perda do tema ao navegar

### ✅ **Comportamentos esperados:**
- [ ] Paleta azul consistente em ambos os temas
- [ ] Inversão suave claro ↔ escuro
- [ ] Boa legibilidade em todos os componentes
- [ ] Transições suaves
- [ ] Persistência do tema escolhido

## Relatório de Problemas

Se encontrar problemas, documente:

### 🐛 **Template de Bug:**
```
**Componente:** [Sidebar/Card/Botão/etc]
**Problema:** [Descrição do problema visual]
**Tema:** [Claro/Escuro]
**Navegador:** [Chrome/Firefox/Safari]
**Tela:** [Desktop/Tablet/Mobile]
**Passos para reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [Resultado inesperado]

**Resultado esperado:** [O que deveria acontecer]
**Evidência:** [Screenshot se possível]
```

## Conclusão

Após completar todos os testes acima, o modo escuro deve:
- ✅ Manter a identidade visual azul do sistema
- ✅ Oferecer uma verdadeira inversão do tema claro
- ✅ Proporcionar excelente legibilidade
- ✅ Funcionar consistentemente em todos os dispositivos
- ✅ Persistir adequadamente as preferências do usuário

**Status do Teste:** [ ] Aprovado [ ] Reprovado [ ] Aprovado com ressalvas

**Observações adicionais:**
_[Espaço para comentários específicos sobre a experiência visual]_
