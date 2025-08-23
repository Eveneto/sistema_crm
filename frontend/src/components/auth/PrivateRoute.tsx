import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';
import { RootState } from '../../redux/store';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Se está carregando, mostra spinner
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <Spin size="large" tip="Carregando..." />
      </div>
    );
  }

  // Se não está autenticado (sem token), redireciona para login
  if (!isAuthenticated || !token) {
    // Salva a rota atual para redirecionar após login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se autenticado, renderiza o componente
  return <>{children}</>;
};

export default PrivateRoute;
