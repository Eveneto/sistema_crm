import React, { useState } from 'react';
import { Nav, Button, Collapse } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../theme/ThemeToggleBootstrap';

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Menu items configuration
  const menuItems = [
    {
      key: '/dashboard',
      icon: '📊',
      label: 'Visão Geral',
      path: '/dashboard',
    },
    {
      key: '/companies',
      icon: '🏢',
      label: 'Empresas',
      path: '/companies',
    },
    {
      key: '/kanban',
      icon: '📋',
      label: 'Kanban',
      path: '/kanban',
    },
    {
      key: '/communities',
      icon: '👥',
      label: 'Comunidades',
      path: '/communities',
    },
    {
      key: '/chat',
      icon: '💬',
      label: 'Chat',
      path: '/chat',
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar-container ${collapsed ? 'collapsed' : ''}`} style={{ width: collapsed ? '80px' : '250px' }}>
      {/* Header */}
      <div className="p-3 border-bottom border-secondary">
        <div className="d-flex align-items-center">
          {!collapsed && (
            <>
              <div className="text-primary-custom fw-bold fs-4 me-auto">
                CRM System
              </div>
            </>
          )}
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => onCollapse(!collapsed)}
            className="text-white p-1 ms-auto"
          >
            {collapsed ? '»' : '«'}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-3 border-bottom border-secondary">
          <div className="d-flex align-items-center">
            <div 
              className="bg-primary-custom rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ width: '40px', height: '40px' }}
            >
              <span className="text-white fw-bold">
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-grow-1">
              <div className="text-white fw-semibold small">
                {user?.first_name || user?.username || 'Usuário'}
              </div>
              <div className="text-white-50 small">
                {user?.email || 'email@example.com'}
              </div>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="text-white p-1"
            >
              ⚙️
            </Button>
          </div>
          
          <Collapse in={showUserMenu}>
            <div className="mt-2">
              <Button
                variant="outline-light"
                size="sm"
                className="w-100 d-flex align-items-center justify-content-start"
                onClick={handleLogout}
              >
                <span className="me-2">🚪</span>
                Sair
              </Button>
            </div>
          </Collapse>
        </div>
      )}

      {/* Navigation Menu */}
      <Nav className="sidebar-nav flex-column p-2">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.key}
            className={`d-flex align-items-center ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
            style={{ cursor: 'pointer' }}
          >
            <span className="me-2" style={{ fontSize: '1.2rem' }}>
              {item.icon}
            </span>
            {!collapsed && (
              <span>{item.label}</span>
            )}
          </Nav.Link>
        ))}
      </Nav>

      {/* Theme Toggle */}
      <div className="mt-auto p-3 border-top border-secondary">
        <div className="d-flex align-items-center justify-content-center">
          <ThemeToggle />
          {!collapsed && (
            <span className="text-white ms-2 small">Tema</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
