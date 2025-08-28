# 🔐 Autenticação Segura para Produção

## Problemas Atuais (Desenvolvimento)

### ❌ localStorage manual:
```javascript
localStorage.setItem('token', 'eyJ...') // APENAS PARA DEBUG!
```

### ❌ Tokens expostos no JavaScript:
- localStorage/sessionStorage são acessíveis via JS
- Vulnerável a XSS attacks
- Tokens podem ser roubados por scripts maliciosos

## ✅ Soluções para Produção

### 1. **HttpOnly Cookies** (Mais Seguro)

```python
# backend/apps/authentication/views.py
from django.http import JsonResponse

def login_view(request):
    # ... validação ...
    
    response = JsonResponse({
        'user': user_data,
        'message': 'Login successful'
    })
    
    # Token em cookie HttpOnly (não acessível via JS)
    response.set_cookie(
        'access_token',
        access_token,
        httponly=True,  # Não acessível via JavaScript
        secure=True,    # Apenas HTTPS em produção
        samesite='Lax', # Proteção CSRF
        max_age=3600    # 1 hora
    )
    
    return response
```

### 2. **CSRF Protection**

```python
# settings.py
CSRF_TRUSTED_ORIGINS = [
    "https://yourdomain.com",
    "https://api.yourdomain.com",
]

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
```

### 3. **Middleware de Autenticação**

```python
# backend/apps/authentication/middleware.py
class CookieAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Ler token do cookie HttpOnly
        token = request.COOKIES.get('access_token')
        if token:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
        
        return self.get_response(request)
```

### 4. **Frontend Axios Configuração**

```typescript
// frontend/src/services/api.ts
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Inclui cookies automaticamente
  headers: {
    'Content-Type': 'application/json',
  },
});

// Remove interceptors manuais - cookies são automáticos
api.interceptors.request.use((config) => {
  // Não precisa adicionar Authorization header manualmente
  // Cookie HttpOnly é enviado automaticamente
  return config;
});
```

### 5. **Refresh Token Automático**

```typescript
// frontend/src/services/authService.ts
class AuthService {
  private refreshTimer: NodeJS.Timeout | null = null;

  setupAutoRefresh() {
    // Refresh token 5 minutos antes de expirar
    this.refreshTimer = setInterval(async () => {
      try {
        await api.post('/api/auth/refresh/');
        console.log('✅ Token refreshed automatically');
      } catch (error) {
        console.log('❌ Auto-refresh failed, redirecting to login');
        this.logout();
      }
    }, 55 * 60 * 1000); // 55 minutos
  }

  logout() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    // Logout remove cookie no backend
    api.post('/api/auth/logout/');
    window.location.href = '/login';
  }
}
```

## 🎯 Implementação Recomendada

### **Desenvolvimento:**
- ✅ localStorage para debug rápido
- ✅ Tokens visíveis para troubleshooting
- ✅ CORS permissivo

### **Produção:**
- ✅ HttpOnly Cookies
- ✅ CSRF Protection  
- ✅ Refresh automático
- ✅ HTTPS obrigatório
- ✅ Rate limiting

## 🛠️ Próximos Passos

1. **Manter atual** para desenvolvimento/debug
2. **Implementar HttpOnly cookies** para produção
3. **Configurar NGINX** para HTTPS e headers de segurança
4. **Implementar refresh automático**
5. **Testes de segurança** (OWASP)

## 🔍 Para Debug Atual

O método manual `localStorage.setItem()` é adequado para:
- ✅ Testar APIs isoladamente
- ✅ Verificar CRUD sem login completo  
- ✅ Debug de autenticação
- ✅ Desenvolvimento local

**Mas NUNCA para produção!** 🚨
