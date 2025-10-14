import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './redux/store';
import { ThemeProvider } from './contexts/ThemeContext';
import { verifyToken } from './redux/slices/authSlice';

// Pages
import LoginPageBootstrap from './pages/auth/LoginPageBootstrap';
import RegisterPageBootstrap from './pages/auth/RegisterPageBootstrap';
import CompaniesPageBootstrap from './pages/CompaniesPageBootstrap';
import CommunitiesPageBootstrap from './pages/CommunitiesPageBootstrap';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/bootstrap-theme.css';

// Simple Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  
  if (isLoading) {
    return <div className="d-flex justify-content-center p-4">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const dispatch = store.dispatch;

  useEffect(() => {
    // Check authentication status on app start
    dispatch(verifyToken());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<LoginPageBootstrap />} />
        <Route path="/auth/register" element={<RegisterPageBootstrap />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <div className="p-4">Dashboard em construção...</div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/companies" 
          element={
            <ProtectedRoute>
              <CompaniesPageBootstrap />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/communities" 
          element={
            <ProtectedRoute>
              <CommunitiesPageBootstrap />
            </ProtectedRoute>
          } 
        />

        {/* TODO: Add more protected routes */}
        {/* 
        <Route path="/kanban" element={<ProtectedRoute><KanbanPageBootstrap /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPageBootstrap /></ProtectedRoute>} />
        */}

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
