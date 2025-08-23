import api from './api';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

interface TokenRefreshResponse {
  access: string;
  refresh: string;
}

class TokenService {
  private refreshPromise: Promise<TokenRefreshResponse> | null = null;

  // Verifica se o token está próximo do vencimento (5 minutos antes)
  isTokenExpiringSoon(token: string): boolean {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = tokenData.exp - currentTime;
      
      // Se restam menos de 5 minutos (300 segundos), renovar
      return timeUntilExpiry < 300;
    } catch {
      return true; // Se não conseguir decodificar, considera como expirando
    }
  }

  // Verifica se o token expirou
  isTokenExpired(token: string): boolean {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return tokenData.exp <= currentTime;
    } catch {
      return true;
    }
  }

  // Renova o token usando refresh token
  async refreshToken(): Promise<TokenRefreshResponse | null> {
    // Se já existe uma promise de refresh em andamento, reutiliza
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      store.dispatch(logout());
      return null;
    }

    this.refreshPromise = this.performRefresh(refreshToken);
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(refreshToken: string): Promise<TokenRefreshResponse> {
    try {
      const response = await api.post('/api/auth/refresh/', {
        refresh: refreshToken
      });

      const { access, refresh: newRefresh } = response.data;
      
      // Determina qual storage usar (verifica onde estava o token original)
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      
      // Salva os novos tokens
      storage.setItem('token', access);
      storage.setItem('refreshToken', newRefresh || refreshToken);
      
      return response.data;
    } catch (error) {
      // Se o refresh falhou, faz logout
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      
      store.dispatch(logout());
      throw error;
    }
  }

  // Verifica e renova o token se necessário
  async ensureValidToken(): Promise<string | null> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      // Token expirado, tenta renovar
      const refreshResult = await this.refreshToken();
      return refreshResult?.access || null;
    }

    if (this.isTokenExpiringSoon(token)) {
      // Token expirando em breve, renova em background
      this.refreshToken().catch(() => {
        // Se falhar, não bloqueia a operação atual
        console.warn('Background token refresh failed');
      });
    }

    return token;
  }

  // Configura interceptador para renovação automática
  setupInterceptors() {
    // Request interceptor - adiciona token válido
    api.interceptors.request.use(async (config) => {
      // Para requisições de login/register, não adiciona token
      if (config.url?.includes('/auth/login/') || 
          config.url?.includes('/auth/register/') || 
          config.url?.includes('/auth/google-login/')) {
        return config;
      }

      const validToken = await this.ensureValidToken();
      
      if (validToken) {
        config.headers.Authorization = `Bearer ${validToken}`;
      }
      
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    // Response interceptor - trata 401 e renova token se necessário
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshResult = await this.refreshToken();
            
            if (refreshResult?.access) {
              originalRequest.headers.Authorization = `Bearer ${refreshResult.access}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            // Se o refresh falhar, o logout já foi feito no performRefresh
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
}

export const tokenService = new TokenService();

// Inicializa os interceptadores quando o módulo é importado
tokenService.setupInterceptors();
