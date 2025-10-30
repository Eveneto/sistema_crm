import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Create axios instance SIMPLIFICADO - Cookies HttpOnly fazem tudo
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRÍTICO: Inclui cookies HttpOnly automaticamente
});

// Request interceptor SIMPLIFICADO
api.interceptors.request.use(
  (config) => {
    // Para endpoints públicos, não fazer nada
    const isPublicRoute = config.url?.includes('/auth/login/') || 
                         config.url?.includes('/auth/register/') || 
                         config.url?.includes('/auth/google-login/');
    
    if (isPublicRoute) {
      console.log(`🌐 [PUBLIC] ${config.url}`);
      return config;
    }
    
    // Para APIs autenticadas, apenas enviar cookies automaticamente
    // Verificar se há token manual (mobile/API)
    const manualToken = localStorage.getItem('api_token') || sessionStorage.getItem('api_token');
    
    if (manualToken) {
      config.headers.Authorization = `Bearer ${manualToken}`;
      console.log(`� [API TOKEN] ${config.url}`);
    } else {
      console.log(`🍪 [COOKIES] ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor ULTRA SIMPLIFICADO - SEM refresh automático
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // IMPORTANTE: Com cookies HttpOnly, NÃO fazer refresh automático
    // O browser e backend gerenciam isso automaticamente
    
    // Se 401, apenas limpar estado e redirecionar
    if (error.response?.status === 401) {
      console.log('❌ 401 detectado - usuário não autenticado');
      
      // Limpar qualquer token manual que possa existir
      localStorage.removeItem('api_token');
      sessionStorage.removeItem('api_token');
      
      // Se não estiver na página de login, redirecionar
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 Redirecionando para login...');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
