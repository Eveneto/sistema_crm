import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: User | null;
  token: string | null; // Mantido para compatibilidade, mas não usado
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Com cookies HttpOnly, a autenticação é automática via cookies
// Não podemos verificar tokens via JavaScript (isso é BOM para segurança)
const initialState: AuthState = {
  user: null,
  token: null, // Não usado mais, cookies fazem tudo
  isLoading: false,
  isAuthenticated: false, // Será determinado por tentativa de API protegida
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

// Verificar autenticação atual (via cookies HttpOnly) - SEM rejeições
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Verificando autenticação via cookies...');
      
      // Tentar fazer uma requisição protegida para verificar se está autenticado
      const response = await api.get('/api/auth/profile/');
      console.log('✅ Usuário autenticado via cookies:', response.data.email);
      
      return response.data;
      
    } catch (error: any) {
      console.log('ℹ️ Não autenticado - estado inicial normal');
      // NÃO rejeitar para evitar loops - apenas retornar dados vazios
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Fazer logout no backend para limpar cookies
      api.post('/api/auth/logout/').catch(() => {
        console.log('Logout backend falhou, mas continuando...');
      });
      
      // Usar authSyncService para limpeza completa
      import('../../services/authSyncService').then(({ authSyncService }) => {
        authSyncService.clearAllAuthData();
      });
      
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
        state.isAuthenticated = true;
        
        // Com cookies HttpOnly, a autenticação é automática
        console.log('✅ Login bem-sucedido - autenticação via cookies HttpOnly');
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
        state.isAuthenticated = true;
        // Com cookies HttpOnly, não precisamos gerenciar tokens manualmente
        console.log('✅ Login Google bem-sucedido - autenticação via cookies HttpOnly');
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Google Login failed';
      })
      // Verify Token - SEM rejeição
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload) {
          // Usuário autenticado
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          // Usuário não autenticado (normal)
          state.user = null;
          state.isAuthenticated = false;
        }
        
        state.error = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
