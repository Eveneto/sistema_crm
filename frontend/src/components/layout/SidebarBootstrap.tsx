import React from 'react';
import { Nav, Navbar, Button, Offcanvas } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';
import ThemeToggleBootstrap from '../theme/ThemeToggleBootstrap';

interface SidebarBootstrapProps {
  collapsed: boolean;
}

const SidebarBootstrap: React.FC<SidebarBootstrapProps> = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    {
      key: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      key: '/companies',
      icon: '🏢',
      label: 'Empresas',
      path: '/companies'
    },
    {
      key: '/communities',
      icon: '👥',
      label: 'Comunidades',
      path: '/communities'
    },
    {
      key: '/kanban',
      icon: '📋',
      label: 'Kanban',
      path: '/kanban'
    },
    {
      key: '/chat',
      icon: '💬',
      label: 'Chat',
      path: '/chat'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <div 
      className="sidebar-bootstrap d-flex flex-column h-100"
      style={{
        width: collapsed ? '80px' : '280px',
        backgroundColor: 'var(--bs-body-bg)',
        borderRight: '1px solid var(--bs-border-color)',
        transition: 'width 0.3s ease'
      }}
    >
      {/* Logo/Brand */}
      <div className="p-3 border-bottom">
        <Navbar.Brand 
          className="d-flex align-items-center text-decoration-none"
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <span className="me-2 fs-4">🏢</span>
          {!collapsed && (
            <span className="fw-bold text-primary">CRM System</span>
          )}
        </Navbar.Brand>
      </div>

      {/* Navigation Menu */}
      <Nav className="flex-column flex-grow-1 py-3">
        {menuItems.map((item) => (
          <Nav.Item key={item.key} className="px-3 mb-1">
            <Nav.Link
              className={`d-flex align-items-center py-2 px-3 rounded ${
                location.pathname === item.path 
                  ? 'bg-primary text-white' 
                  : 'text-body hover-bg-light'
              }`}
              onClick={() => handleNavigation(item.path)}
              style={{ 
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span className="me-3 fs-5">{item.icon}</span>
              {!collapsed && (
                <span className="fw-medium">{item.label}</span>
              )}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* User Profile & Settings */}
      <div className="border-top">
        {/* Theme Toggle */}
        <div className="p-3">
          <ThemeToggleBootstrap />
        </div>

        {/* User Info */}
        {user && (
          <div className="p-3 border-top">
            <div className="d-flex align-items-center mb-2">
              <div 
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                style={{ width: '40px', height: '40px' }}
              >
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!collapsed && (
                <div className="flex-grow-1 text-truncate">
                  <div className="fw-medium text-truncate">
                    {user.email}
                  </div>
                  <small className="text-muted">Online</small>
                </div>
              )}
            </div>
            
            {!collapsed && (
              <Button
                variant="outline-danger"
                size="sm"
                className="w-100"
                onClick={handleLogout}
              >
                <span className="me-2">🚪</span>
                Sair
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarBootstrap;
