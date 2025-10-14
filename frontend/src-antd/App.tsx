import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './redux/store';
import AuthProvider from './components/auth/AuthProvider';
import ThemeProvider, { useTheme } from './contexts/ThemeContext';
import PrivateRoute from './components/auth/PrivateRoute';

// Páginas Bootstrap
import LoginPageBootstrap from './pages/auth/LoginPageBootstrap';
import RegisterPageBootstrap from './pages/auth/RegisterPageBootstrap';
import DashboardBoot from './pages/DashboardBoot';

// Páginas temporárias (ainda Ant Design)
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import EmailVerificationNotice from './pages/auth/EmailVerificationNotice';
import CompaniesPage from './pages/CompaniesPage';
import KanbanPage from './pages/KanbanPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailsPage from './pages/CommunityDetailsPage';
import ChatPage from './pages/ChatPage';
import TestingToolsPage from './pages/TestingToolsPage';
import TokenTestPage from './pages/TokenTestPage';
import ApiTest from './components/ApiTest';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Bootstrap Custom Theme
import './bootstrap-theme.css';

// Estilos principais
import './App.css';

// Importa os services para inicializar
// import './services/tokenService';
import './services/authSyncService';

// Componente que usa o tema dinâmico
const AppWithTheme: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  // Aplica a classe do tema no body
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas - Bootstrap */}
            <Route path="/login" element={<LoginPageBootstrap />} />
            <Route path="/register" element={<RegisterPageBootstrap />} />
            
            {/* Rotas públicas - Ant Design (temporário) */}
            <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
            <Route path="/test" element={<ApiTest />} />
            <Route path="/token-test" element={<TokenTestPage />} />
            <Route path="/testing-tools" element={<TestingToolsPage />} />
            <Route path="/verifique-email" element={<EmailVerificationNotice />} />
            
            {/* Rotas protegidas - Bootstrap */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardBoot />
                </PrivateRoute>
              } 
            />
            
            {/* Rotas protegidas - Ant Design (temporário) */}
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
