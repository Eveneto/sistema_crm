import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { verifyToken } from '../../redux/slices/authSlice';
import LoadingScreen from '../common/LoadingScreen';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Fazer verificação apenas UMA VEZ ao inicializar a aplicação
      try {
        console.log('🔍 Verificando autenticação inicial via cookies...');
        await dispatch(verifyToken()).unwrap();
        console.log('✅ Usuário já estava autenticado via cookies');
      } catch (error) {
        console.log('ℹ️ Usuário não autenticado - redirecionando para login');
      } finally {
        // SEMPRE finalizar o loading, independente do resultado
        setIsInitializing(false);
      }
    };

    // Executar apenas na inicialização da aplicação
    initializeAuth();
  }, [dispatch]); // Remover isAuthenticated das dependências para evitar loops!

  // Mostra loading apenas durante a inicialização, não durante operações subsequentes
  if (isInitializing) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  return <>{children}</>;
};

export default AuthProvider;
