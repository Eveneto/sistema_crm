import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../redux/store';
import { clearError } from '../redux/slices/authSlice';
import { authSyncService } from '../services/authSyncService';
import { firebaseTokenService } from '../services/firebaseTokenService';

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

  // Verificar se há token do Firebase (integração temporária)
  const firebaseToken = localStorage.getItem('firebase_token');
  const firebaseEmail = localStorage.getItem('user_email');
  const firebaseName = localStorage.getItem('user_name');
  const firebasePhoto = localStorage.getItem('user_photo');
  
  // Considerar autenticado se há token Django OU Firebase
  const isAuthenticatedFinal = isAuthenticated || !!firebaseToken;

  // Função para fazer logout global (todas as abas)
  const handleLogout = () => {
    // Limpar tokens do Firebase também
    localStorage.removeItem('firebase_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_photo');
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

  // Função para refresh manual do token
  const refreshToken = async () => {
    if (firebaseToken) {
      return await firebaseTokenService.forceRefreshToken();
    }
    return null;
  };

  return {
    // Estado
    user: user || (firebaseToken ? { 
      email: firebaseEmail, 
      first_name: firebaseName?.split(' ')[0] || firebaseEmail?.split('@')[0] || 'Usuário Firebase',
      username: firebaseEmail?.split('@')[0] || 'firebase_user',
      id: 0,
      avatar: firebasePhoto || null,
      source: 'firebase' // Identificar origem do usuário
    } : null),
    token: token || firebaseToken,
    isAuthenticated: isAuthenticatedFinal,
    isLoading,
    error,
    
    // Funções
    handleLogout,
    clearAuthError,
    hasRole,
    isAdmin,
    refreshToken,
  };
};
