import axios from 'axios';
import { firebaseTokenService } from './firebaseTokenService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available (but not for login/register)
api.interceptors.request.use(
  (config) => {
    // Não adiciona token apenas para rotas de login/register, mas adiciona para profile
    const isPublicAuthRoute = config.url?.includes('/auth/login/') || 
                             config.url?.includes('/auth/register/') || 
                             config.url?.includes('/auth/google-login/');
    
    if (!isPublicAuthRoute) {
      // PRIORIDADE: token Django JWT > token Firebase
      // Isso evita conflitos e garante que Django JWT seja usado quando disponível
      const djangoToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const firebaseToken = firebaseTokenService.getCurrentToken();
      
      const token = djangoToken || firebaseToken;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Identifica o tipo de token para o backend processar corretamente
        // config.headers['X-Auth-Type'] = djangoToken ? 'django' : 'firebase';
        console.log(`🔐 Usando token ${djangoToken ? 'Django JWT' : 'Firebase'} para ${config.url}`);
      } else {
        console.log('⚠️ Nenhum token disponível para', config.url);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.log('❌ Token inválido (401) - iniciando processo de limpeza e renovação');
      
      const djangoToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const firebaseToken = firebaseTokenService.getCurrentToken();
      
      if (djangoToken) {
        console.log('🔄 Token Django JWT inválido - removendo e redirecionando para login');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        // Não remove Firebase token, pode ser usado para re-autenticar
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      if (firebaseToken) {
        console.log('🔄 Token Firebase inválido - tentando renovar via Firebase');
        try {
          const newFirebaseToken = await firebaseTokenService.forceRefreshToken();
          if (newFirebaseToken) {
            console.log('✅ Token Firebase renovado - reenviar requisição');
            // Reenviar a requisição original com novo token
            error.config.headers.Authorization = `Bearer ${newFirebaseToken}`;
            return api.request(error.config);
          } else {
            throw new Error('Não foi possível renovar token Firebase');
          }
        } catch (renewError) {
          console.log('❌ Falha ao renovar token Firebase - limpando tudo');
          localStorage.removeItem('firebase_token');
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }
      
      // Se não há tokens, apenas redireciona
      console.log('❌ Nenhum token disponível - redirecionando para login');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
