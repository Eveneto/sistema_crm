# 📧 GUIA DE CONFIGURAÇÃO DE EMAIL - SendGrid + Gmail

**Data:** 23 de outubro de 2025  
**Status:** Pronto para configurar  
**Tempo estimado:** 10-15 minutos

---

## 🎯 DUAS OPÇÕES DE EMAIL

### Opção 1: SendGrid (RECOMENDADO para Produção)
- **Plano Gratuito:** 100 emails/dia
- **Melhor para:** Produção, mailing em massa
- **Setup:** 5 minutos

### Opção 2: Gmail (Fácil para Desenvolvimento)
- **Restrição:** 500 emails/dia com app-specific password
- **Melhor para:** Testes, desenvolvimento
- **Setup:** 3 minutos

---

## 📋 PASSO 1: ESCOLHA SUA OPÇÃO

Qual você prefere configurar?

```
[ ] OPÇÃO 1: SendGrid (production-ready, recomendado)
[ ] OPÇÃO 2: Gmail (fácil, para testes)
```

---

## 🚀 OPÇÃO 1: SendGrid (RECOMENDADO)

### Passo 1.1: Criar conta SendGrid

1. Acesse: https://sendgrid.com/pt-br/
2. Clique em "Começar grátis"
3. Preencha com seus dados:
   - Email: seu_email@dominio.com
   - Senha: (senha forte)
   - Nome completo: Seu Nome
   - Empresa: CRM System
   - Aplicação: Crm App
4. Confirme email

### Passo 1.2: Gerar API Key

1. No painel SendGrid, vá para:
   - **Settings** → **API Keys** (ou Configurações → Chaves de API)
2. Clique em **"Create API Key"** (Criar chave de API)
3. Nome: `CRM-Django-Local`
4. Permissões: **Restricted Access** → Select **Mail Send**
5. Copie a chave:
   ```
   SG.xxxxxxxxxxxxxxxxx_xxxxxxxxxxxxxxxxx
   ```

### Passo 1.3: Configurar Django

Atualize o arquivo `.env`:

```env
# Email Configuration - SendGrid
EMAIL_BACKEND=sendgrid_django.SendgridBackend
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxx_xxxxxxxxxxxxxxx
DEFAULT_FROM_EMAIL=seu_email@dominio.com
```

### Passo 1.4: Instalar SendGrid Django

```bash
cd backend
pip install sendgrid-django
```

### Passo 1.5: Testar

```bash
python manage.py shell
```

Dentro do shell:

```python
from django.core.mail import send_mail

send_mail(
    subject='Test Email from CRM',
    message='This is a test email from Django with SendGrid',
    from_email='seu_email@dominio.com',
    recipient_list=['seu_email@dominio.com'],
    fail_silently=False,
)

print("Email enviado com sucesso!")
exit()
```

---

## 📧 OPÇÃO 2: Gmail (FÁCIL)

### Passo 2.1: Ativar 2FA no Gmail

1. Acesse: https://myaccount.google.com/security
2. Procure por "Verificação em duas etapas"
3. Clique em "Ativar" (se não estiver ativo)
4. Siga as instruções

### Passo 2.2: Gerar Senha de App

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione:
   - **Aplicativo:** Mail
   - **Dispositivo:** Windows Computer (ou seu SO)
3. Google gera uma senha de 16 caracteres:
   ```
   xxxx xxxx xxxx xxxx
   ```
4. Copie SEM ESPAÇOS: `xxxxxxxxxxxxxxxx`

### Passo 2.3: Configurar Django

Atualize o arquivo `.env`:

```env
# Email Configuration - Gmail
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=xxxxxxxxxxxxxxxx
DEFAULT_FROM_EMAIL=seu_email@gmail.com
EMAIL_USE_TLS=True
```

### Passo 2.4: Testar

```bash
cd backend
python manage.py shell
```

Dentro do shell:

```python
from django.core.mail import send_mail

send_mail(
    subject='Test Email from CRM',
    message='This is a test email from Django with Gmail',
    from_email='seu_email@gmail.com',
    recipient_list=['seu_email@gmail.com'],
    fail_silently=False,
)

print("Email enviado com sucesso!")
exit()
```

---

## ✅ TESTE DE EMAIL NO DJANGO

### Método 1: Via Shell (recomendado para testar)

```bash
cd backend
python manage.py shell
```

```python
from django.core.mail import send_mail

# Teste simples
send_mail(
    subject='Test Email CRM',
    message='Email test from Django CRM - PostgreSQL Configuration',
    from_email='seu_email@dominio.com',
    recipient_list=['seu_email@dominio.com'],
)

print("✅ Email enviado com sucesso!")
```

### Método 2: Via API Django

```bash
# Abra outro terminal
curl -X POST "http://localhost:8000/api/test-email/" \
  -H "Content-Type: application/json" \
  -d '{"email":"seu_email@dominio.com"}'
```

### Método 3: Via Frontend (quando configurado)

- Faça login em http://localhost:3000
- Vá para Configurações
- Procure por "Test Email"
- Clique e veja se chega

---

## 🔧 SETTINGS.PY - REVISÃO DE CONFIGURAÇÃO

Verifique em `backend/crm_backend/settings.py`:

```python
# Email Configuration
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@example.com')
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'

# SendGrid (if using SendGrid)
if 'sendgrid' in EMAIL_BACKEND:
    SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
```

Se não estiver, adicione:

```python
# Adicione no settings.py
import os

# ─── Email Configuration ───
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@example.com')
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'

# SendGrid Configuration
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', '')
if SENDGRID_API_KEY:
    EMAIL_BACKEND = 'sendgrid_django.SendgridBackend'
```

---

## 🚨 TROUBLESHOOTING

### Erro: "username and password not accepted"

**Solução Gmail:**
- Verifique 2FA está ativado
- Use app-specific password (16 caracteres), não sua senha do Gmail

**Solução SendGrid:**
- Copie a chave de API completa
- Não tenha espaços ao colar

### Erro: "Connection timed out"

- Verifique firewall (porta 587 deve estar aberta)
- Teste com: `telnet smtp.gmail.com 587`

### Email não chega

**Gmail:**
- Verifique pasta SPAM
- Confira que DEFAULT_FROM_EMAIL é seu Gmail

**SendGrid:**
- Acesse dashboard SendGrid → Activity
- Verifique status do email
- Se "Dropped", verifique o motivo

---

## 🧪 TESTE COMPLETO

### 1. Configurar `.env`

Escolha sua opção (SendGrid OU Gmail) e preencha:

**SendGrid:**
```env
EMAIL_BACKEND=sendgrid_django.SendgridBackend
SENDGRID_API_KEY=SG.xxxxx
DEFAULT_FROM_EMAIL=seu_email@dominio.com
```

**Gmail:**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=sua_app_password_16_chars
DEFAULT_FROM_EMAIL=seu_email@gmail.com
EMAIL_USE_TLS=True
```

### 2. Reiniciar Backend

```bash
# Ctrl+C para parar
# Depois:
cd backend
python manage.py runserver
```

### 3. Testar via Shell

```bash
python manage.py shell
```

```python
from django.core.mail import send_mail

result = send_mail(
    subject='Teste CRM Email',
    message='Email de teste - PostgreSQL + Django',
    from_email='seu_email@dominio.com',
    recipient_list=['seu_email@dominio.com']
)

if result == 1:
    print("✅ Email enviado com sucesso!")
else:
    print("❌ Erro ao enviar email")
```

### 4. Verificar Recebimento

- Acesse sua caixa de email
- Procure por "Teste CRM Email"
- Se chegou → ✅ Sucesso!

---

## 📋 TEMPLATE DE EMAIL NO DJANGO

Se quiser usar templates HTML:

### 1. Criar arquivo: `backend/templates/email/welcome.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #007bff; color: white; padding: 20px; }
        .content { padding: 20px; }
        .footer { background: #f0f0f0; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bem-vindo ao CRM System!</h1>
        </div>
        <div class="content">
            <p>Olá {{ user.first_name }},</p>
            <p>Sua conta foi criada com sucesso!</p>
            <p>Acesse a aplicação em: {{ app_url }}</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 CRM System. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
```

### 2. Usar no Django

```python
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

# Renderizar template
html_content = render_to_string('email/welcome.html', {
    'user': user,
    'app_url': 'http://localhost:3000'
})

# Enviar email com HTML
msg = EmailMultiAlternatives(
    subject='Bem-vindo ao CRM',
    body='Bem-vindo ao CRM System',
    from_email='seu_email@dominio.com',
    to=['seu_email@dominio.com']
)
msg.attach_alternative(html_content, "text/html")
msg.send()
```

---

## 🔐 SEGURANÇA

### Para Produção:

1. **Nunca commitar chaves no Git:**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Usar variáveis de ambiente:**
   ```python
   SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
   ```

3. **Rotacionar chaves periodicamente:**
   - SendGrid: todo mês
   - Gmail: mudar senha a cada 90 dias

4. **Monitorar uso:**
   - SendGrid: Dashboard → Statistics
   - Gmail: Verificar atividade em myaccount.google.com

---

## 📊 COMPARAÇÃO: SendGrid vs Gmail

| Aspecto | SendGrid | Gmail |
|---------|----------|-------|
| **Plano Gratuito** | 100 emails/dia | 500 emails/dia |
| **Setup** | 5 minutos | 3 minutos |
| **Suporte** | Excelente | Comunidade Google |
| **Rastreamento** | Sim (cliques, aberturas) | Não |
| **SMTP Relay** | Sim | Sim |
| **Para Produção** | ✅ Recomendado | ❌ Não recomendado |
| **Escalabilidade** | ✅ Profissional | ⚠️ Limitado |
| **Interface** | Dashboard completo | Simples |

---

## ✅ PRÓXIMOS PASSOS

1. **Hoje:**
   - [ ] Escolha sua opção (SendGrid ou Gmail)
   - [ ] Configure as credenciais no `.env`
   - [ ] Teste envio de email
   - [ ] Verifique recebimento

2. **Após email funcionando:**
   - Integrar com formulários de contato
   - Ativar notificações de empresa criada
   - Configurar recuperação de senha por email
   - Alertas de dashboard

3. **Para Produção (Semana que vem):**
   - Mudar para SendGrid obrigatoriamente
   - Usar domínio profissional (seu_dominio@crm.com)
   - Configurar SPF, DKIM, DMARC
   - Monitorar bounce rate

---

## 🎯 COMANDO RÁPIDO

Se usar Gmail:

```bash
# 1. Atualizar .env
sed -i 's/EMAIL_BACKEND=.*/EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend/' backend/.env
sed -i 's/EMAIL_HOST_USER=.*/EMAIL_HOST_USER=seu_email@gmail.com/' backend/.env
sed -i 's/EMAIL_HOST_PASSWORD=.*/EMAIL_HOST_PASSWORD=sua_app_password/' backend/.env

# 2. Reiniciar backend
pkill -f "runserver"
cd backend && python manage.py runserver

# 3. Testar
python manage.py shell -c "from django.core.mail import send_mail; send_mail('Test', 'Test', 'seu_email@gmail.com', ['seu_email@gmail.com'])"
```

---

**Criado em:** 23 de outubro de 2025  
**Status:** Pronto para configurar email  
**Próximo:** Escolha SendGrid ou Gmail e siga os passos!
