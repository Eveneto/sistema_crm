import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../redux/store';
import { clearError, logout } from '../redux/slices/authSlice';
import { authSyncService } from '../services/authSyncService';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error
  } = useSelector((state: RootState) => state.auth);

  // Função para fazer logout global (todas as abas)
  const handleLogout = () => {
    // Usar o logout do Redux que já limpa cookies via API
    dispatch(logout());
    
    // Limpar qualquer token manual como fallback
    localStorage.removeItem('api_token');
    sessionStorage.removeItem('api_token');
    
    // Sincronizar logout em todas as abas
    authSyncService.triggerGlobalLogout();
    navigate('/login');
  };

  // Função para limpar erros
  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Verificar se o usuário tem uma role específica (TODO: implementar quando role estiver no User type)
  const hasRole = (role: string) => {
    // return user?.role === role;
    return false; // Por enquanto retorna false
  };

  // Verificar se é admin (TODO: implementar quando role estiver no User type)
  const isAdmin = () => {
    // return user?.role === 'admin';
    return user?.username === 'admin' || user?.email === 'admin@example.com'; // Temporário
  };

  // Com cookies HttpOnly, não precisamos de refresh manual
  // O sistema faz automaticamente via interceptors
  const refreshToken = async () => {
    console.log('🔄 Refresh automático via cookies HttpOnly');
    return null; // Cookies fazem automaticamente
  };

  return {
    // Estado
    user,
    token, // Mantido para compatibilidade, mas cookies fazem tudo
    isAuthenticated,
    isLoading,
    error,
    
    // Funções
    logout: handleLogout,
    clearError: clearAuthError,
    hasRole,
    isAdmin,
    refreshToken,
    
    // Informações adicionais
    userDisplayName: user?.first_name || user?.username || user?.email || 'Usuário',
    userEmail: user?.email || '',
    userId: user?.id || 0,
  };
};
