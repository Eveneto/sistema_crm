import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { ThemeProvider } from './contexts/ThemeContext';
import { verifyToken } from './redux/slices/authSlice';

// Pages
import LoginPageBootstrap from './pages/auth/LoginPageBootstrap';
import RegisterPageBootstrap from './pages/auth/RegisterPageBootstrap';
import DashboardBootstrap from './pages/DashboardBootstrap';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/bootstrap-theme.css';

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
        <Route path="/dashboard" element={<DashboardBootstrap />} />

        {/* TODO: Add more protected routes */}
        {/* 
        <Route path="/companies" element={<CompaniesPageBootstrap />} />
        <Route path="/communities" element={<CommunitiesPageBootstrap />} />
        <Route path="/kanban" element={<KanbanPageBootstrap />} />
        <Route path="/chat" element={<ChatPageBootstrap />} />
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
