import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { store } from './redux/store';
import AuthProvider from './components/auth/AuthProvider';
import PrivateRoute from './components/auth/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import EmailVerificationNotice from './pages/auth/EmailVerificationNotice';
import Dashboard from './pages/Dashboard';
import CompaniesPage from './pages/CompaniesPage';
import KanbanPage from './pages/KanbanPage';
import TokenTestPage from './pages/TokenTestPage';
import ApiTest from './components/ApiTest';
import './App.css';

// Importa os services para inicializar
// import './services/tokenService';
import './services/authSyncService';

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <div className="App">
          <Router>
            <AuthProvider>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
                <Route path="/test" element={<ApiTest />} />
                <Route path="/token-test" element={<TokenTestPage />} />
                <Route path="/verifique-email" element={<EmailVerificationNotice />} />
                
                {/* Rotas protegidas */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/companies" 
                  element={
                    <PrivateRoute>
                      <CompaniesPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/kanban" 
                  element={
                    <PrivateRoute>
                      <KanbanPage />
                    </PrivateRoute>
                  } 
                />
                
                {/* Rota padrão - redireciona para dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AuthProvider>
          </Router>
        </div>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
