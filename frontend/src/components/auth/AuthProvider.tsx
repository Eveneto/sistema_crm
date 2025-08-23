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
  const { token, isLoading } = useSelector((state: RootState) => state.auth);
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          await dispatch(verifyToken()).unwrap();
        } catch (error) {
          console.log('Token inválido, usuário será redirecionado para login');
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [dispatch, token]);

  // Mostra loading enquanto verifica a autenticação
  if (isInitializing || isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  return <>{children}</>;
};

export default AuthProvider;
