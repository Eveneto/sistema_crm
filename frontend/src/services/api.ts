import axios from 'axios';

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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    if (error.response?.status === 401) {
      // Remove tokens se não autorizado
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
