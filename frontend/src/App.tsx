import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { store } from './redux/store';
import AuthProvider from './components/auth/AuthProvider';
import ThemeProvider, { useTheme } from './contexts/ThemeContext';
import PrivateRoute from './components/auth/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import EmailVerificationNotice from './pages/auth/EmailVerificationNotice';
import Dashboard from './pages/Dashboard';
import CompaniesPage from './pages/CompaniesPage';
import KanbanPage from './pages/KanbanPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailsPage from './pages/CommunityDetailsPage';
import ChatPage from './pages/ChatPage';
import TestingToolsPage from './pages/TestingToolsPage';
import TokenTestPage from './pages/TokenTestPage';
import ApiTest from './components/ApiTest';

// Temas Tecnológicos
import techTheme from './theme/techTheme';
import techDarkTheme from './theme/techDarkTheme';

// Estilos principais
import './App.css';

// Novo Design System Tecnológico
import './styles/tech-design-system.css';
import './styles/tech-components.css';
import './styles/tech-dashboard.css';
import './styles/tech-dashboard-overrides.css';
import './components/layout/TechSidebar.css';

// Novos estilos melhorados
import './styles/toastStyles.css';
import './styles/responsiveBreakpoints.css';
import './styles/global-responsive.css';

// Importa os services para inicializar
// import './services/tokenService';
import './services/authSyncService';

// Componente que usa o tema dinâmico
const AppWithTheme: React.FC = () => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? techDarkTheme : techTheme;
  
  return (
    <ConfigProvider theme={currentTheme}>
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
              <Route path="/testing-tools" element={<TestingToolsPage />} />
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
              <Route 
                path="/communities" 
                element={
                  <PrivateRoute>
                    <CommunitiesPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/communities/:id" 
                element={
                  <PrivateRoute>
                    <CommunityDetailsPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/chat/:roomId" 
                element={
                  <PrivateRoute>
                    <ChatPage />
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
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
