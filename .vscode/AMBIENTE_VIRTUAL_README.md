# Ambiente Virtual Python - Configuração Automática

Este projeto está configurado para ativar automaticamente o ambiente virtual Python sempre que um novo terminal for aberto no VS Code.

## 🔧 Configuração Implementada

### Arquivos Criados/Modificados:
- `.venv/` - Ambiente virtual Python na raiz do projeto
- `.vscode/settings.json` - Configurações do VS Code para Python
- `.vscode/activate_venv.sh` - Script de ativação automática
- `.vscode/terminal_init.sh` - Inicializador do terminal
- `.gitignore` - Atualizado para ignorar ambiente virtual

### Funcionalidades:
✅ Ativação automática do ambiente virtual em novos terminais
✅ Configuração do interpretador Python padrão
✅ PYTHONPATH configurado para o backend Django
✅ Ambiente isolado para dependências do projeto

## 🚀 Como Usar

### 1. Abrir um Novo Terminal
Quando você abrir um novo terminal no VS Code, verá uma mensagem como:
```
🐍 Ativando ambiente virtual Python...
✅ Ambiente virtual ativado: Python 3.12.x
📁 Diretório do projeto: /home/dev_pc/Documentos/crm_freela2/sistema_crm

🚀 Comandos úteis:
   cd backend && python manage.py runserver  # Iniciar backend Django
   cd frontend && npm start                  # Iniciar frontend React
   deactivate                                # Desativar ambiente virtual
```

### 2. Verificar Ativação
Para verificar se o ambiente está ativo, observe:
- Prompt do terminal com `(.venv)` no início
- Comando `which python` aponta para `.venv/bin/python`
- Comando `pip list` mostra apenas os pacotes do projeto

### 3. Comandos Úteis
```bash
# Verificar status do ambiente
python --version
which python
pip list

# Instalar nova dependência
pip install nome-do-pacote
pip freeze > backend/requirements.txt

# Desativar ambiente (se necessário)
deactivate

# Reativar manualmente (se necessário)
source .venv/bin/activate
```

## 🛠️ Dependências Instaladas

As seguintes dependências foram automaticamente instaladas no ambiente virtual:
- Django 4.2.5
- Django REST Framework 3.14.0
- Firebase Admin SDK 6.2.0
- Channels (WebSocket support)
- Celery (Task queue)
- E outras dependências do projeto...

## 🔍 Solução de Problemas

### Ambiente não ativa automaticamente:
1. Feche e reabra o VS Code
2. Abra um novo terminal (Ctrl+Shift+`)
3. Verifique se os arquivos `.vscode/` existem

### Dependência não encontrada:
1. Verifique se o ambiente está ativo: `which python`
2. Instale a dependência: `pip install nome-do-pacote`
3. Atualize requirements: `pip freeze > backend/requirements.txt`

### Restaurar ambiente virtual:
```bash
# Remover ambiente atual
rm -rf .venv

# Criar novo ambiente
python3 -m venv .venv

# Ativar e instalar dependências
source .venv/bin/activate
pip install -r backend/requirements.txt
```

## 📝 Notas Importantes

- O ambiente virtual está localizado em `.venv/` na raiz do projeto
- Todas as dependências Python devem ser instaladas dentro do ambiente virtual
- O arquivo `.gitignore` está configurado para não versionar o ambiente virtual
- O PYTHONPATH está configurado para o diretório `backend/`
- Ideal para desenvolvimento Django + React com Firebase

## 🎯 Próximos Passos

1. Abra um novo terminal para testar a ativação automática
2. Execute `cd backend && python manage.py runserver` para iniciar o Django
3. Em outro terminal, execute `cd frontend && npm start` para o React
4. Desenvolva tranquilamente com o ambiente isolado!
