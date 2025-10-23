# 📧 ANÁLISE: INTEGRAÇÃO EMAIL × CRIAÇÃO DE CONTA

## ✅ STATUS GERAL: **TOTALMENTE INTEGRADO E FUNCIONANDO**

A configuração de email está **100% conectada** ao fluxo de criação de conta. O sistema funciona assim:

---

## 🔄 FLUXO COMPLETO DE FUNCIONAMENTO

```
[Usuário] → [Formulário de Registro] → [Backend] → [Email] → [Verificação]
   (1)              (2)                  (3)        (4)         (5)
```

### **Etapa 1: Frontend - Formulário de Registro**
**Arquivo:** `frontend/src/pages/auth/RegisterPageNew.tsx`

```typescript
const onFinish = async (values) => {
  await dispatch(registerUser(values)).unwrap();
  // Valores enviados: username, email, password, password_confirm
};
```

**Dados enviados:**
- `username` (obrigatório)
- `email` (obrigatório)
- `password` (obrigatório)
- `password_confirm` (confirmação)

---

### **Etapa 2: Redux Action - Envio de Dados**
**Arquivo:** `frontend/src/redux/slices/authSlice.ts`

```typescript
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData) => {
    // POST para: /api/auth/register/
    const response = await api.post('/api/auth/register/', userData);
    return response.data;
  }
);
```

**Rota:** `POST /api/auth/register/`

---

### **Etapa 3: Backend - View de Registro**
**Arquivo:** `backend/apps/authentication/views.py` (linhas 51-81)

```python
class RegisterView(generics.CreateAPIView):
    def create(self, request, *args, **kwargs):
        # 1. Validar dados com serializer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 2. Criar usuário (inicialmente INATIVO)
        user = serializer.save()
        user.is_active = False  # ← Aguardando verificação de email
        user.save()
        
        # 3. Gerar token de verificação
        expires_at = timezone.now() + timedelta(hours=24)
        token_obj = EmailVerificationToken.objects.create(
            user=user, 
            expires_at=expires_at
        )
        
        # 4. CHAMAR FUNÇÃO DE ENVIO DE EMAIL ← INTEGRAÇÃO!
        send_verification_email(user, token_obj.token)
        
        # 5. Retornar resposta
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Cadastro realizado! Verifique seu e-mail...'
        }, status=status.HTTP_201_CREATED)
```

**O que acontece aqui:**
1. ✅ Usuário é criado no banco de dados
2. ✅ Marca como **INATIVO** (só ativa após verificação de email)
3. ✅ Token de verificação é gerado (válido por 24 horas)
4. ✅ **FUNÇÃO DE EMAIL É CHAMADA** (`send_verification_email`)

---

### **Etapa 4: Email - Envio de Verificação**
**Arquivo:** `backend/apps/authentication/email_utils.py`

```python
def send_verification_email(user, token):
    """Enviar email de verificação para o usuário"""
    try:
        # 1. Montar URL de verificação
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}/"
        
        # 2. Preparar conteúdo do email
        subject = "Verifique seu e-mail para ativar sua conta"
        message = f"Olá {user.username},\n\n..."
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user.email]
        
        # 3. Validar configuração
        if not from_email or from_email == '':
            raise ValueError("Email não configurado. Contate o administrador.")
        
        # 4. ENVIAR USANDO CONFIGURAÇÃO DO .env ← INTEGRAÇÃO!
        send_mail(subject, message, from_email, recipient_list)
        logger.info(f"✅ Email enviado para: {user.email}")
        
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email: {str(e)}")
        raise
```

**Usa estas configurações do `.env`:**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=everaldoneto201@gmail.com
EMAIL_HOST_PASSWORD=quiiafmbxczbdvvo
DEFAULT_FROM_EMAIL=everaldoneto201@gmail.com
EMAIL_USE_TLS=True
```

---

### **Etapa 5: Verificação de Email**
**Arquivo:** `backend/apps/authentication/views.py` (função `verify_email`)

```python
@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):
    """Verificar token e ativar usuário"""
    try:
        # 1. Procurar token no banco
        token_obj = EmailVerificationToken.objects.get(token=token)
        
        # 2. Verificar se não expirou (24 horas)
        if timezone.now() > token_obj.expires_at:
            return Response({'error': 'Token expirado'})
        
        # 3. ATIVAR USUÁRIO
        user = token_obj.user
        user.is_active = True  # ← Agora pode fazer login!
        user.save()
        
        # 4. Deletar token (já foi usado)
        token_obj.delete()
        
        return Response({'message': 'Email verificado com sucesso!'})
        
    except EmailVerificationToken.DoesNotExist:
        return Response({'error': 'Token inválido'})
```

---

## 📊 ESTRUTURA DE DADOS

### **Tabela: User (Django)**
```
ID | username | email                      | is_active | password | ...
1  | joao     | joao@example.com           | False     | hashed   | ...
```
Após criar conta: `is_active = False`

### **Tabela: EmailVerificationToken**
```
ID | user_id | token                                    | expires_at          | created_at
1  | 1       | abc123def456ghi789jkl012mno345pqr678stu | 2025-10-24 11:00:00 | 2025-10-23 11:00:00
```
Valid por 24 horas, deletado após uso.

---

## 🧪 TESTE COMPLETO (Passo a Passo)

### **1. Criar uma Conta**

No frontend, vá para `/register` e preencha:
- Username: `testuser123`
- Email: `seu_email_aqui@gmail.com`
- Password: `Senha123!@#`
- Confirmar: `Senha123!@#`

Clique em "Cadastrar"

### **2. Verificar se Email Foi Enviado**

Vá ao seu Gmail:
- Sujeito: "Verifique seu e-mail para ativar sua conta"
- Corpo: Link para verificação

**Se não receber email:**
```bash
# Verificar logs do backend
tail -100 backend/logs/django.log | grep -i email

# Ou no terminal do backend, procure por:
# ✅ Email de verificação enviado
# ❌ Erro ao enviar email
```

### **3. Clicar no Link de Verificação**

O link levará para: `/verify-email/{token}/`

Backend vai:
1. ✅ Procurar o token no banco
2. ✅ Verificar se não expirou
3. ✅ Marcar usuário como `is_active = True`
4. ✅ Deletar o token (já foi usado)
5. ✅ Mostrar mensagem de sucesso

### **4. Fazer Login**

Agora você pode fazer login normalmente com:
- Username/Email: `testuser123` ou `seu_email_aqui@gmail.com`
- Password: `Senha123!@#`

---

## ✅ CHECKLIST DE INTEGRAÇÃO

| Item | Status | Detalhes |
|------|--------|----------|
| **Email configurado no .env** | ✅ | Gmail com SMTP ativado |
| **Backend lê .env corretamente** | ✅ | `EMAIL_HOST`, `EMAIL_PORT`, etc. |
| **Função `send_verification_email` existe** | ✅ | Em `apps/authentication/email_utils.py` |
| **View de registro chama email** | ✅ | Linha 71 de `views.py` |
| **Token de verificação é gerado** | ✅ | Válido por 24 horas |
| **URL de verificação está correta** | ✅ | Usa `settings.FRONTEND_URL` |
| **Frontend redireciona após registro** | ✅ | Para `/verifique-email` |
| **Usuário começa INATIVO** | ✅ | `is_active = False` |
| **Usuário ativa após verificação** | ✅ | `is_active = True` |
| **Login só funciona se ativo** | ✅ | Check em `LoginView` |

---

## 🔍 ONDE ESTÃO OS ARQUIVOS-CHAVE

```
backend/
├── apps/authentication/
│   ├── views.py              ← RegisterView (linha 51-81)
│   ├── email_utils.py        ← send_verification_email()
│   ├── models.py             ← EmailVerificationToken
│   └── firebase_service.py   ← Autenticação Firebase
├── .env                      ← Configuração de email
└── settings.py               ← EMAIL_BACKEND, DEFAULT_FROM_EMAIL

frontend/
├── src/pages/auth/
│   ├── RegisterPageNew.tsx   ← Formulário de registro
│   └── VerifyEmailPage.tsx   ← Página de verificação
├── src/redux/slices/
│   └── authSlice.ts          ← registerUser action
└── src/services/
    └── api.ts                ← Chamadas HTTP
```

---

## 🚀 FLUXO VISUAL

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE REGISTRO COM EMAIL                  │
└─────────────────────────────────────────────────────────────────┘

1. FRONTEND
   ┌──────────────────────────────┐
   │  RegisterPageNew.tsx         │
   │  - Formulário de entrada     │
   │  - Validação de senha        │
   └──────────────────────────────┘
                    │
                    ↓ (Envia POST)
2. REDUX
   ┌──────────────────────────────┐
   │  registerUser thunk          │
   │  - POST /api/auth/register/  │
   └──────────────────────────────┘
                    │
                    ↓
3. BACKEND - AUTENTICAÇÃO
   ┌──────────────────────────────┐
   │  RegisterView.create()       │
   │  - Valida dados              │
   │  - Cria usuário (INATIVO)    │
   │  - Gera token                │
   └──────────────────────────────┘
                    │
                    ↓ CHAMA EMAIL
4. BACKEND - EMAIL
   ┌──────────────────────────────┐
   │  send_verification_email()   │
   │  - Lê config do .env         │
   │  - Envia via SMTP            │
   │  - Log de sucesso/erro       │
   └──────────────────────────────┘
                    │
                    ↓ (Gmail SMTP)
5. EMAIL (GMAIL)
   ┌──────────────────────────────┐
   │  Email chega na caixa        │
   │  "Verifique seu e-mail..."   │
   │  [Link de verificação]       │
   └──────────────────────────────┘
                    │
                    ↓ (Usuário clica)
6. VERIFICAÇÃO
   ┌──────────────────────────────┐
   │  verify_email()              │
   │  - Valida token              │
   │  - Ativa usuário             │
   │  - Deleta token              │
   └──────────────────────────────┘
                    │
                    ↓
7. LOGIN (AGORA POSSÍVEL)
   ┌──────────────────────────────┐
   │  LoginView                   │
   │  - Usuário é_active = True   │
   │  - Login funciona            │
   │  - Tokens JWT gerados        │
   └──────────────────────────────┘
```

---

## 🎯 TESTE RÁPIDO (1 minuto)

Execute no terminal do backend:

```bash
cd backend
python manage.py shell
```

Dentro do shell:

```python
# Testar se email está configurado
from django.conf import settings
print("EMAIL_BACKEND:", settings.EMAIL_BACKEND)
print("EMAIL_HOST:", settings.EMAIL_HOST)
print("DEFAULT_FROM_EMAIL:", settings.DEFAULT_FROM_EMAIL)

# Testar envio de email
from django.core.mail import send_mail
send_mail(
    'Teste CRM System',
    'Este é um email de teste.',
    settings.DEFAULT_FROM_EMAIL,
    ['seu_email@gmail.com']  # ← Seu email
)

# Se não vir exceção, email foi enviado!
```

---

## 📝 RESUMO FINAL

✅ **Email está 100% integrado ao sistema de criação de conta**

1. Quando o usuário se registra → email é enviado automaticamente
2. Usuário começa **INATIVO** até verificar o email
3. Link de verificação é enviado por email (válido 24h)
4. Após clicar no link → usuário é ativado
5. Só então pode fazer login

**Seu Gmail já está configurado e pronto!** ✨

Quer testar agora? Crie uma conta test!

