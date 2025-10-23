# 📋 TEMPLATE .env - COPIE E COLE

## ✅ OPÇÃO 1: DESENVOLVIMENTO (Console Backend)
**Use isso para testes - emails aparecem no terminal**

```properties
# Environment variables
DEBUG=True
SECRET_KEY=django-insecure-development-key-change-in-production-123456789
DATABASE_NAME=crm_db
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_PORT=3306
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Email Configuration - CONSOLE (para desenvolvimento)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=sua_senha_app_google
DEFAULT_FROM_EMAIL=seu_email@gmail.com
EMAIL_USE_TLS=True
```

---

## ✅ OPÇÃO 2: PRODUÇÃO COM GMAIL
**Use isso para enviar emails de verdade**

**ANTES: Obtenha a senha de aplicação do Gmail:**
1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "Mail" e "Windows Computer"
3. Copie a senha gerada (16 caracteres com espaço)

```properties
# Environment variables
DEBUG=True
SECRET_KEY=django-insecure-development-key-change-in-production-123456789
DATABASE_NAME=crm_db
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_PORT=3306
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Email Configuration - GMAIL SMTP
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu_email_real@gmail.com
EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx
DEFAULT_FROM_EMAIL=seu_email_real@gmail.com
EMAIL_USE_TLS=True
```

---

## ✅ OPÇÃO 3: SENDGRID
**Serviço profissional de email**

```properties
# Environment variables
DEBUG=True
SECRET_KEY=django-insecure-development-key-change-in-production-123456789
DATABASE_NAME=crm_db
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_PORT=3306
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Email Configuration - SENDGRID
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.sua_api_key_aqui
DEFAULT_FROM_EMAIL=seu_email@seudomain.com
EMAIL_USE_TLS=True
```

---

## ✅ OPÇÃO 4: MAILGUN
**Outra opção de serviço profissional**

```properties
# Environment variables
DEBUG=True
SECRET_KEY=django-insecure-development-key-change-in-production-123456789
DATABASE_NAME=crm_db
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_PORT=3306
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Email Configuration - MAILGUN
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_HOST_USER=postmaster@seu_domain.mailgun.org
EMAIL_HOST_PASSWORD=sua_smtp_password
DEFAULT_FROM_EMAIL=noreply@seu_domain.mailgun.org
EMAIL_USE_TLS=True
```

---

## 📋 INSTRUÇÕES DE USO

1. **Escolha uma opção acima** (1, 2, 3 ou 4)
2. **Copie TUDO o conteúdo**
3. **Cole no arquivo:** `/home/dev_pc/Documentos/crm_freela2/sistema_crm/backend/.env`
4. **Substitua os valores necessários:**
   - `seu_email@gmail.com` → Seu email real
   - `sua_senha_app_google` → Sua senha/token
5. **Reinicie o servidor Django**
6. **Teste criando um novo usuário**

---

## 🆘 TROUBLESHOOTING

**Erro: "Invalid address"**
→ Verifique se `DEFAULT_FROM_EMAIL` está preenchido

**Erro: "Authentication failed"**
→ Verifique username/password e se está correto

**Não recebe email**
→ Verifique pasta de spam/lixo
→ Para Gmail: Verifique se é senha de aplicação (não senha normal)

---

## ✅ DEPOIS DE IMPLEMENTAR

Teste com este comando no terminal:
```bash
cd backend
python manage.py shell
```

Depois execute:
```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    'Teste',
    'Mensagem de teste',
    settings.DEFAULT_FROM_EMAIL,
    ['seu_email@gmail.com'],
    fail_silently=False
)
```

Se funcionar: ✅ Email está configurado!
