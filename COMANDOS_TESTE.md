# 🖥️ COMANDOS PRONTOS - COPIE E EXECUTE

## 📋 TESTAR CONFIGURAÇÃO DE EMAIL

Após configurar o `.env` e reiniciar o servidor, execute este comando:

```bash
# Entre na pasta backend
cd /home/dev_pc/Documentos/crm_freela2/sistema_crm/backend

# Entre no shell do Django
python manage.py shell
```

Depois execute **um destes comandos** no shell:

### **Se escolheu OPÇÃO A (Console):**
```python
from django.core.mail import send_mail
from django.conf import settings

# Testar envio de email
result = send_mail(
    'Teste de Email',
    'Este é um email de teste do CRM',
    settings.DEFAULT_FROM_EMAIL,
    ['seu_email@gmail.com'],
    fail_silently=False
)

print(f"Email enviado: {result}")
print(f"De: {settings.DEFAULT_FROM_EMAIL}")

# Você verá a mensagem completa impressa no console acima
```

### **Se escolheu OPÇÃO B (Gmail):**
```python
from django.core.mail import send_mail
from django.conf import settings

# Testar envio de email
result = send_mail(
    'Teste de Email - Gmail',
    'Este email foi enviado via Gmail SMTP!',
    settings.DEFAULT_FROM_EMAIL,
    ['seu_email_destino@gmail.com'],
    fail_silently=False
)

print(f"✅ Email enviado com sucesso: {result}")
print(f"De: {settings.DEFAULT_FROM_EMAIL}")

# Você receberá o email de verdade
```

### **Depois execute isto para sair:**
```python
exit()
```

---

## 🧪 TESTAR REGISTRO COM EMAIL

### **Usando curl (Terminal):**

```bash
curl -X POST "http://localhost:8000/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste_email_novo",
    "email": "seu_email_novo@gmail.com",
    "first_name": "Teste",
    "last_name": "Email",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!"
  }' \
  -v
```

**Resultado esperado:**
- Status: 201 Created ✅
- Email aparecerá no console (Opção A) ou inbox (Opção B)

---

## 🔍 VERIFICAR CONFIGURAÇÃO

### **Verificar valores do .env**

```bash
# Entrar no backend
cd /home/dev_pc/Documentos/crm_freela2/sistema_crm/backend

# Entrar no shell
python manage.py shell
```

Depois execute:

```python
from django.conf import settings

# Verificar todas as configurações
print("=" * 60)
print("CONFIGURAÇÕES DE EMAIL")
print("=" * 60)
print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"EMAIL_HOST_PASSWORD: {'***' if settings.EMAIL_HOST_PASSWORD else 'VAZIO ❌'}")
print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print("=" * 60)

# Se DEFAULT_FROM_EMAIL for vazio, o problema está aqui!
if not settings.DEFAULT_FROM_EMAIL:
    print("❌ PROBLEMA: DEFAULT_FROM_EMAIL está vazio!")
    print("   Verifique o arquivo .env")
else:
    print(f"✅ Email configurado: {settings.DEFAULT_FROM_EMAIL}")
```

---

## 🚨 TROUBLESHOOTING RÁPIDO

### **Erro: "Invalid address"**

```python
# Verificar DEFAULT_FROM_EMAIL
from django.conf import settings
print(f"DEFAULT_FROM_EMAIL: '{settings.DEFAULT_FROM_EMAIL}'")
print(f"Vazio? {settings.DEFAULT_FROM_EMAIL == ''}")

# Solução: Editar .env e adicionar DEFAULT_FROM_EMAIL
```

### **Erro: "Authentication failed"**

```python
# Verificar credenciais
from django.conf import settings
print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"EMAIL_HOST_PASSWORD: {settings.EMAIL_HOST_PASSWORD}")

# Se Gmail: Verificar se é senha de APP (não senha normal)
# Se SendGrid: Verificar se API key é válida
```

### **Email não chega (Gmail)**

```python
# Verificar se EMAIL_USE_TLS está True
from django.conf import settings
print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")

# Verificar na pasta de SPAM do Gmail
# Gmail pode marcar como spam no início
```

---

## 📝 SCRIPT DE TESTE COMPLETO

Crie arquivo: `test_email.py` dentro de `/backend`

```python
#!/usr/bin/env python
"""
Script para testar configuração de email
Execute com: python test_email.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print("\n" + "="*60)
print("TESTE DE CONFIGURAÇÃO DE EMAIL")
print("="*60 + "\n")

# 1. Verificar configuração
print("📋 CONFIGURAÇÃO ATUAL:")
print(f"   EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"   EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"   EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"   DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")

# 2. Validar
print("\n🔍 VALIDAÇÃO:")
if not settings.DEFAULT_FROM_EMAIL:
    print("   ❌ DEFAULT_FROM_EMAIL está vazio!")
    print("   → Edite o arquivo .env e adicione as variáveis de email")
    sys.exit(1)

print("   ✅ DEFAULT_FROM_EMAIL está configurado")

# 3. Tentar enviar email de teste
print("\n📧 ENVIANDO EMAIL DE TESTE...")
try:
    result = send_mail(
        'Teste CRM - Email Configurado',
        f'Este é um email de teste.\nData: {django.utils.timezone.now()}\nBackend: {settings.EMAIL_BACKEND}',
        settings.DEFAULT_FROM_EMAIL,
        ['seu_email@gmail.com'],
        fail_silently=False
    )
    
    if result:
        print(f"   ✅ Email enviado com sucesso!")
        print(f"   → De: {settings.DEFAULT_FROM_EMAIL}")
        print(f"   → Para: seu_email@gmail.com")
        print(f"   → Backend: {settings.EMAIL_BACKEND}")
    else:
        print("   ⚠️ Email pode não ter sido enviado")
        
except Exception as e:
    print(f"   ❌ Erro ao enviar: {str(e)}")
    sys.exit(1)

print("\n" + "="*60)
print("✅ TESTE CONCLUÍDO")
print("="*60 + "\n")
```

**Executar:**
```bash
cd backend
python test_email.py
```

---

## ✅ CHECKLIST DE EXECUÇÃO

- [ ] Editei `.env` com configurações de email
- [ ] Reiniciei o servidor Django
- [ ] Executei `python manage.py shell`
- [ ] Testei envio com `send_mail()`
- [ ] Recebi email no console ou inbox
- [ ] Criei novo usuário em localhost:3000
- [ ] Verifiquei se email de verificação chegou
- [ ] Tudo funcionando! ✅

---

## 🎯 PRÓXIMA COMUNICAÇÃO

Quando tudo estiver funcionando, execute:

```bash
# Dentro do shell Python
from django.contrib.auth.models import User
print(f"Usuários registrados: {User.objects.count()}")

# Depois saia
exit()
```

Me avise o resultado! 👍
