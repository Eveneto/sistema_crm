import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../hooks/useAuth'; // Usar nosso hook customizado

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, token } = useAuth(); // Usar o hook que reconhece Firebase
  const location = useLocation();

  console.log("🔒 PrivateRoute - isAuthenticated:", isAuthenticated, "token:", !!token, "isLoading:", isLoading);

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
