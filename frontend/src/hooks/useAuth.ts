import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../redux/store';
import { clearError } from '../redux/slices/authSlice';
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
    return false; // Por enquanto retorna false
  };

  return {
    // Estado
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Funções
    handleLogout,
    clearAuthError,
    hasRole,
    isAdmin,
  };
};
