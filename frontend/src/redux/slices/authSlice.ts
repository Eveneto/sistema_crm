import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { firebaseTokenService } from '../../services/firebaseTokenService';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Função para verificar se o token é válido
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    // Decodifica o JWT para verificar se não expirou
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return tokenData.exp > currentTime;
  } catch {
    return false;
  }
};

const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
const validToken = isTokenValid(storedToken);

const initialState: AuthState = {
  user: null,
  token: validToken ? storedToken : null,
  isLoading: false,
  isAuthenticated: validToken,
  error: null,
};

// Async thunks
interface LoginPayload {
  username_or_email: string;
  password: string;
  rememberMe?: boolean;
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username_or_email, password, rememberMe }: LoginPayload) => {
    console.log('🚀 Fazendo login com API base URL:', api.defaults.baseURL);
    const response = await api.post('/api/auth/login/', {
      username_or_email,
      password,
    });
    return response.data;
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => {
    const response = await api.post('/api/auth/register/', userData);
    return response.data;
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async ({ token }: { token: string }) => {
    const response = await api.post('/api/auth/google-login/', { token });
    return response.data;
  }
);

// Verificar token e recuperar dados do usuário
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('🔍 Verificando token:', token ? 'Token encontrado' : 'Token não encontrado');
      
      if (!token || !isTokenValid(token)) {
        console.log('❌ Token inválido ou expirado');
        throw new Error('Token inválido');
      }
      
      console.log('🚀 Fazendo chamada para profile com token:', token.substring(0, 20) + '...');
      
      // A instância API automaticamente adiciona o token via interceptador
      const response = await api.get('/api/auth/profile/');
      
      console.log('✅ Profile recuperado com sucesso:', response.data);
      return { user: response.data, token };
    } catch (error: any) {
      console.log('❌ Erro ao verificar token:', error.response?.status, error.response?.data);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      return rejectWithValue('Token inválido');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      
      // Reabilita Firebase quando Django JWT é removido
      firebaseTokenService.resumeFirebaseServices();
      
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.isAuthenticated = true;
        
        // Pausa Firebase quando Django JWT está ativo
        firebaseTokenService.pauseFirebaseServices();
        
        // Se rememberMe for true, salva no localStorage, senão no sessionStorage
        const storage = action.meta.arg.rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', action.payload.access);
        if (action.payload.refresh) {
          storage.setItem('refreshToken', action.payload.refresh);
        }
        
        // Remove do outro storage para evitar conflitos
        const otherStorage = action.meta.arg.rememberMe ? sessionStorage : localStorage;
        otherStorage.removeItem('token');
        otherStorage.removeItem('refreshToken');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        // Não salva token nem autentica após registro
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.access);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Google Login failed';
      })
      // Verify Token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
