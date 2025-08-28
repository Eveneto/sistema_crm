import axios from 'axios';
import { firebaseTokenService } from './firebaseTokenService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with cookies support
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANTE: Inclui cookies HttpOnly automaticamente
});

// Request interceptor - Cookies são enviados automaticamente
// Mantemos fallback para localStorage apenas para debug/desenvolvimento
api.interceptors.request.use(
  (config) => {
    // Cookies HttpOnly são enviados automaticamente via withCredentials
    // Mantém localStorage como fallback apenas para desenvolvimento/debug
    const isPublicAuthRoute = config.url?.includes('/auth/login/') || 
                             config.url?.includes('/auth/register/') || 
                             config.url?.includes('/auth/google-login/');
    
    if (!isPublicAuthRoute) {
      // EM DESENVOLVIMENTO: Verificar se há tokens localStorage como fallback
      const djangoToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const firebaseToken = firebaseTokenService.getCurrentToken();
      
      // Apenas adiciona header se não há cookies (fallback para debug)
      if (djangoToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${djangoToken}`;
        console.log(`🔐 Fallback: Usando token Django JWT do localStorage para ${config.url}`);
      } else if (firebaseToken && !config.headers.Authorization && !djangoToken) {
        config.headers.Authorization = `Bearer ${firebaseToken}`;
        console.log(`🔐 Fallback: Usando token Firebase do localStorage para ${config.url}`);
      } else {
        console.log(`🍪 Usando cookies HttpOnly para ${config.url}`);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Com cookies, o refresh é mais simples
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Evitar loop infinito - não tentar refresh se já é uma requisição de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh/')) {
      originalRequest._retry = true; // Marcar para evitar loops
      console.log('❌ Token inválido (401) - tentando refresh automático via cookies');
      
      try {
        // Tentar refresh automático via cookies - criar nova instância para evitar interceptor
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh/`,
          {},
          { withCredentials: true }
        );
        console.log('✅ Token refreshed via cookies - reenviar requisição');
        
        // Reenviar a requisição original
        return api.request(originalRequest);
        
      } catch (refreshError) {
        console.log('❌ Falha no refresh via cookies - limpando localStorage e redirecionando');
        
        // Limpar localStorage como fallback
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('firebase_token');
        
        // Redirect para login
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
