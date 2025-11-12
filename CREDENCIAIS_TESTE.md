# 🔑 Credenciais de Teste - CRM System

## ✅ Usuários Disponíveis

Todos os usuários abaixo têm a senha: **`123456`**

---

### 👑 Administrador

| Campo | Valor |
|-------|-------|
| **Username** | `admin` |
| **Email** | admin@test.com |
| **Senha** | `123456` |
| **Privilégios** | Superusuário, Staff |
| **Descrição** | Acesso total ao sistema |

---

### 👮 Moderador

| Campo | Valor |
|-------|-------|
| **Username** | `moderador` |
| **Email** | moderador@test.com |
| **Senha** | `123456` |
| **Privilégios** | Usuário comum |
| **Descrição** | Pode moderar chat rooms |

---

### 👤 Membros

#### Member 1
| Campo | Valor |
|-------|-------|
| **Username** | `member1` |
| **Email** | member1@test.com |
| **Senha** | `123456` |
| **Privilégios** | Usuário comum |

#### Member 2
| Campo | Valor |
|-------|-------|
| **Username** | `member2` |
| **Email** | member2@test.com |
| **Senha** | `123456` |
| **Privilégios** | Usuário comum |

---

### 🚪 Outsider

| Campo | Valor |
|-------|-------|
| **Username** | `outsider` |
| **Email** | outsider@test.com |
| **Senha** | `123456` |
| **Privilégios** | Usuário comum |
| **Descrição** | Usuário externo para testes |

---

## 🧪 Como Usar

### Login via Interface Web:

1. Abra: http://localhost:3000
2. Insira username (ou email) e senha
3. Clique em "Entrar"

**Exemplo:**
```
Username: admin
Senha: 123456
```

### Login via API (cURL):

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "admin",
    "password": "123456"
  }'
```

---

## 📊 Casos de Teste Recomendados

### 1. Teste de Permissões
- ✅ Login como `admin` → Deve ter acesso a tudo
- ✅ Login como `moderador` → Deve moderar chats
- ✅ Login como `member1` → Acesso básico

### 2. Teste de Chat Multi-usuário
- Abra 2 navegadores diferentes
- Login com `member1` no primeiro
- Login com `member2` no segundo
- Teste mensagens em tempo real

### 3. Teste de Funcionalidades
- **Dashboard:** Ver estatísticas
- **Empresas:** CRUD completo
- **Kanban:** Criar/mover cards
- **Chat:** Enviar mensagens e arquivos
- **Comunidades:** Criar e participar

---

## 🔒 Segurança

⚠️ **ATENÇÃO:**
- Estas credenciais são **APENAS PARA DESENVOLVIMENTO**
- **NUNCA** use senhas simples como "123456" em produção
- Altere todas as senhas antes do deploy

### Em Produção:
```bash
# Criar superusuário com senha forte
python manage.py createsuperuser

# Definir senha forte (mínimo 12 caracteres)
# Exemplo: MyS3cure!P@ssw0rd#2025
```

---

## 🔄 Resetar Senhas

Se precisar resetar as senhas novamente:

```bash
cd backend
python manage.py shell << 'EOF'
from django.contrib.auth.models import User

for username in ['admin', 'moderador', 'member1', 'member2', 'outsider']:
    user = User.objects.get(username=username)
    user.set_password('123456')
    user.save()
    print(f'✅ {username}: senha resetada')
EOF
```

---

## 📝 Histórico

| Data | Ação | Descrição |
|------|------|-----------|
| 12/11/2025 | Criação | Documento inicial com 5 usuários |
| 12/11/2025 | Update | Senhas atualizadas para 123456 |

---

## 🎯 Próximos Passos

1. ✅ Senhas atualizadas
2. ⏳ Testar login no frontend
3. ⏳ Testar funcionalidades de cada usuário
4. ⏳ Documentar fluxos de teste

---

**Data de Criação:** 12/11/2025  
**Última Atualização:** 12/11/2025  
**Ambiente:** Desenvolvimento  
**Status:** ✅ Ativo
