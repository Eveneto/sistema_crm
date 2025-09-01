# 🔐 GUIA DE SEGURANÇA - SETUP DO PROJETO

## ⚠️ ARQUIVOS SENSÍVEIS REMOVIDOS

Este repositório foi limpo de todos os arquivos sensíveis. Os seguintes arquivos NÃO estão incluídos no Git:

### Backend
- `backend/.env` - Variáveis de ambiente com credenciais
- `backend/db.sqlite3` - Banco de dados local
- `crm-system-*.json` - Chaves do Firebase Admin SDK

### Frontend
- `frontend/.env` - Configurações do Firebase e Google OAuth

## 📋 SETUP OBRIGATÓRIO

### 1. Backend (.env)
Copie `backend/.env.example` para `backend/.env` e configure:

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais reais:
- `SECRET_KEY` - Gere uma nova chave secreta Django
- `EMAIL_HOST_PASSWORD` - Senha de app do Gmail
- Configurações do banco de dados (se usar MySQL)

### 2. Frontend (.env)
Copie `frontend/.env.example` para `frontend/.env` e configure:

```bash
cd frontend
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais Firebase e Google:
- `REACT_APP_FIREBASE_*` - Configurações do Firebase Web
- `REACT_APP_GOOGLE_CLIENT_ID` - Client ID do Google OAuth

### 3. Firebase Admin SDK
- Baixe o arquivo JSON do Firebase Admin SDK
- Renomeie para `crm-system-[project-id]-firebase-adminsdk-[key-id]-[hash].json`
- Coloque na raiz do projeto

## 🛡️ VERIFICAÇÃO DE SEGURANÇA

Antes de fazer commits, sempre execute:

```bash
git status
```

NUNCA faça commit de:
- Arquivos `.env`
- Arquivos `*.json` com credenciais
- Banco de dados (`*.sqlite3`, `*.db`)
- Certificados (`*.pem`, `*.key`)

## 🚨 EM CASO DE VAZAMENTO

Se você acidentalmente fez commit de credenciais:

1. **Revogue imediatamente** todas as chaves expostas
2. **Gere novas credenciais** nos serviços (Firebase, Google, etc.)
3. **Use o BFG Repo-Cleaner** para limpar o histórico do Git
4. **Force push** para sobrescrever o histórico remoto

## ✅ VERIFICAÇÃO FINAL

Antes do primeiro setup, confirme que os seguintes arquivos existem e estão configurados:
- [ ] `backend/.env` (com credenciais reais)
- [ ] `frontend/.env` (com credenciais reais)  
- [ ] `crm-system-*.json` (Firebase Admin SDK)
- [ ] Todos os arquivos acima estão listados no `.gitignore`

⚠️ **NUNCA** compartilhe esses arquivos em canais públicos (Discord, Slack, email, etc.)
