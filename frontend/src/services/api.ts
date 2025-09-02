import axios from 'axios';
import { firebaseTokenService } from './firebaseTokenService';
import { auth } from '../firebaseConfig';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with cookies support
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANTE: Inclui cookies HttpOnly automaticamente
});

// Request interceptor - Forçar headers sempre que possível
api.interceptors.request.use(
  async (config) => {
    const isPublicAuthRoute = config.url?.includes('/auth/login/') || 
                             config.url?.includes('/auth/register/') || 
                             config.url?.includes('/auth/google-login/');
    
    if (!isPublicAuthRoute) {
      // SEMPRE tentar enviar token no header se disponível
      const djangoToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      let firebaseToken = localStorage.getItem('firebase_token');
      
      // Se há token Firebase, verificar se não está corrompido
      if (firebaseToken && !djangoToken) {
        try {
          // Tentar obter token fresh do Firebase se o atual pode estar corrompido
          const freshToken = await firebaseTokenService.refreshToken();
          if (freshToken && freshToken !== firebaseToken) {
            firebaseToken = freshToken;
            console.log('🔄 Token Firebase renovado automaticamente no request');
          }
        } catch (error) {
          console.warn('⚠️ Falha ao verificar/renovar token Firebase no request:', error);
          // Remove token corrompido
          localStorage.removeItem('firebase_token');
          firebaseToken = null;
        }
      }
      
      // Prioridade: Django JWT > Firebase > (Cookies como fallback automático)
      if (djangoToken) {
        config.headers.Authorization = `Bearer ${djangoToken}`;
        console.log(`🔐 [AUTH] Django JWT para ${config.url}`);
      } else if (firebaseToken) {
        config.headers.Authorization = `Bearer ${firebaseToken}`;
        console.log(`🔐 [AUTH] Firebase Token para ${config.url}`);
      } else {
        console.log(`🍪 [AUTH] Cookies HttpOnly para ${config.url} (sem header Authorization)`);
      }
      
      // Debug adicional
      if (config.url?.includes('communities')) {
        console.log('🏘️ [COMMUNITIES] Token usado:', config.headers.Authorization ? 'Header' : 'Cookie');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Melhorado para Firebase e Django JWT
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Evitar loop infinito - não tentar refresh se já é uma requisição de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh/')) {
      originalRequest._retry = true; // Marcar para evitar loops
      console.log('❌ 401 detectado - tentando refresh automático');
      
      // Detectar qual tipo de token estava sendo usado
      const originalAuthHeader = originalRequest.headers?.Authorization || '';
      const isFirebaseToken = originalAuthHeader.startsWith('Bearer ') && !originalAuthHeader.includes('JWT');
      
      try {
        if (isFirebaseToken) {
          console.log('🔄 Refreshing Firebase token...');
          
          // Tentar renovar token Firebase
          const currentUser = auth.currentUser;
          if (currentUser) {
            const newToken = await currentUser.getIdToken(true); // Force refresh
            console.log('✅ Firebase token renovado');
            
            // Atualizar header da requisição original
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Reenviar requisição com novo token
            return api.request(originalRequest);
          } else {
            throw new Error('Usuário não autenticado no Firebase');
          }
        } else {
          console.log('🔄 Refreshing Django JWT via cookies...');
          
          // Tentar refresh de JWT Django via cookies
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/api/auth/refresh/`,
            {},
            { withCredentials: true }
          );
          console.log('✅ Django JWT refreshed via cookies');
          
          // Reenviar a requisição original
          return api.request(originalRequest);
        }
        
      } catch (refreshError) {
        console.log('❌ Falha no refresh - limpando dados e redirecionando');
        console.error('Refresh error:', refreshError);
        
        // Limpar todos os tokens
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('firebase_token');
        
        // Fazer logout do Firebase
        try {
          await auth.signOut();
        } catch (signOutError) {
          console.error('Erro ao fazer logout do Firebase:', signOutError);
        }
        
        // Redirect para login
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    // Para erros 400 relacionados especificamente a tokens Firebase inválidos
    if (error.response?.status === 400 && !originalRequest._retry) {
      const responseData = error.response?.data || {};
      const errorString = JSON.stringify(responseData);
      
      // Verificar apenas se é erro específico de token Firebase
      const isFirebaseTokenError = errorString.includes('no kid claim') ||
                                   errorString.includes('Firebase ID token') ||
                                   errorString.includes('Invalid Firebase token');
      
      if (isFirebaseTokenError) {
        console.log('🚨 [FIREBASE ERROR] Token Firebase inválido detectado - tentando renovar');
        
        originalRequest._retry = true;
        
        try {
          // Limpar token corrompido primeiro
          localStorage.removeItem('firebase_token');
          
          // Usar o serviço de token para forçar renovação
          const newToken = await firebaseTokenService.refreshToken();
          
          if (newToken) {
            console.log('✅ Token Firebase renovado após erro 400 - reenviando requisição');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api.request(originalRequest);
          } else {
            console.error('❌ Não foi possível renovar o token Firebase');
          }
        } catch (refreshError) {
          console.error('❌ Falha ao renovar token após erro 400:', refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
