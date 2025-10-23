# ✅ EMAIL CONFIGURATION - QUICK START

**Data:** 23 de outubro de 2025  
**Status:** Pronto para configurar  
**Tempo:** 5-10 minutos

---

## 🎯 OPÇÃO MAIS RÁPIDA - Gmail (3 minutos)

### Passo 1: Generate App Password
```
1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione: Mail + seu dispositivo
3. Copie a senha de 16 caracteres (sem espaços)
```

### Passo 2: Update .env
```bash
nano backend/.env
```

Procure por "# Email Configuration" e substitua por:
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=senha_16_chars
DEFAULT_FROM_EMAIL=seu_email@gmail.com
EMAIL_USE_TLS=True
```

Salve: `Ctrl+O`, `ENTER`, `Ctrl+X`

### Passo 3: Restart Backend
```bash
# Terminal do backend: Ctrl+C
cd backend
python manage.py runserver
```

### Passo 4: Test
```bash
cd backend
python manage.py shell
```

```python
from django.core.mail import send_mail
send_mail('Test', 'Email test', 'seu_email@gmail.com', ['seu_email@gmail.com'])
print("✅ Enviado!")
exit()
```

---

## 🌟 OPÇÃO PROFISSIONAL - SendGrid (5 minutos)

### Passo 1: Criar Conta
```
1. Acesse: https://sendgrid.com/pt-br/
2. "Começar grátis"
3. Confirme seu email
```

### Passo 2: API Key
```
1. Settings → API Keys
2. Create API Key
3. Nome: CRM-Django
4. Copie: SG.xxxxx...
```

### Passo 3: Install
```bash
cd backend
pip install sendgrid-django
```

### Passo 4: Update .env
```bash
nano backend/.env
```

```
EMAIL_BACKEND=sendgrid_django.SendgridBackend
SENDGRID_API_KEY=SG.sua_chave_aqui
DEFAULT_FROM_EMAIL=seu_email@dominio.com
```

Salve: `Ctrl+O`, `ENTER`, `Ctrl+X`

### Passo 5: Restart & Test
```bash
# Terminal do backend: Ctrl+C
cd backend
python manage.py runserver

# Em outro terminal:
python manage.py shell
```

```python
from django.core.mail import send_mail
send_mail('Test SendGrid', 'OK', 'seu_email@dominio.com', ['seu_email@dominio.com'])
print("✅ Enviado!")
exit()
```

---

## 📚 DOCUMENTOS CRIADOS

| Arquivo | Tamanho | Descrição |
|---------|---------|-----------|
| `configure_email.sh` | 12KB | Script automático interativo |
| `GUIA_CONFIGURACAO_EMAIL.md` | 12KB | Guia completo (2 opções) |
| `CHECKLIST_EMAIL.md` | 8KB | Este arquivo |

---

## 🚀 COMEÇAR AGORA

Escolha:

```bash
# Automático (recomendado)
./configure_email.sh

# Manual com guia
cat GUIA_CONFIGURACAO_EMAIL.md

# Ou siga os passos acima
```

---

**Status:** ✅ Pronto para usar  
**Próxima fase:** Redis Verification
