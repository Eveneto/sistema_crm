import React, { useEffect } from 'react';
import { Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  DashboardOutlined,
  BankOutlined,
  ProjectOutlined,
  TeamOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';
import ThemeToggle from '../theme/ThemeToggle';
import './crm-sidebar.css';

interface ResponsiveSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile?: boolean;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ 
  collapsed, 
  onCollapse,
  isMobile = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state: RootState) => state.auth);

  // Menu items - apenas funcionalidades implementadas
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Visão Geral',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/companies',
      icon: <BankOutlined />,
      label: 'CRM',
      onClick: () => navigate('/companies'),
    },
    {
      key: '/kanban',
      icon: <ProjectOutlined />,
      label: 'Pipeline',
      onClick: () => navigate('/kanban'),
    },
    {
      key: '/communities',
      icon: <TeamOutlined />,
      label: 'Comunidades',
      onClick: () => navigate('/communities'),
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: 'Chat',
      onClick: () => navigate('/chat'),
    },
    {
      key: '/testing-tools',
      icon: <ToolOutlined />,
      label: 'Ferramentas',
      onClick: () => navigate('/testing-tools'),
    },
  ];

const settingsItems = [
    {
        key: '/settings',
        icon: <SettingOutlined />,
        label: 'Configurações',
        onClick: () => navigate('/settings'),
    },
];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Get current selected key based on location
  const getSelectedKey = () => {
    const path = location.pathname;
    
    // Check for exact match first
    for (const item of menuItems) {
      if (item.key === path) return item.key;
    }
    
    // Check for settings items
    for (const item of settingsItems) {
      if (item.key === path) return item.key;
    }
    
    return '/dashboard';
  };

  // Auto-expand parent menu of current page (simplificado)
  useEffect(() => {
    // Como removemos sub-menus, não precisamos mais desta lógica
  }, [location.pathname, collapsed]);

  return (
    <div
      className={`crm-sidebar ${collapsed ? 'crm-sidebar-collapsed' : 'crm-sidebar-expanded'} ${isMobile ? 'crm-sidebar-mobile' : ''}`}
      style={{
        position: isMobile ? 'fixed' : 'relative',
        zIndex: isMobile ? 1050 : 'auto',
      }}
    >
      {/* Header */}
      <div className="crm-sidebar-header">
        <div className="crm-sidebar-logo">
          <div className="crm-logo-icon">
            <span>CRM</span>
          </div>
          {!collapsed && (
            <div className="crm-logo-text">
              <div className="crm-text-lg">Sistema CRM</div>
              <div className="crm-text-sm crm-text-secondary">Assessoria</div>
            </div>
          )}
        </div>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          className="crm-collapse-btn"
        />
      </div>

      {/* User Section */}
      <div className={`crm-sidebar-user ${collapsed ? 'crm-sidebar-user-collapsed' : ''}`}>
        <div className="crm-user-avatar">
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        {!collapsed && (
          <div className="crm-user-info">
            <div className="crm-user-name">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="crm-user-email">
              {user?.email}
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="crm-sidebar-menu">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`crm-menu-item ${getSelectedKey() === item.key ? 'crm-menu-item-active' : ''}`}
            onClick={item.onClick}
          >
            <div className="crm-menu-icon">
              {item.icon}
            </div>
            {!collapsed && (
              <div className="crm-menu-text">
                {item.label}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="crm-sidebar-footer">
        {/* Theme Toggle */}
        <div className="crm-theme-toggle">
          <ThemeToggle iconOnly={true} size="small" />
        </div>

        {/* Logout */}
        <button
          className="crm-logout-btn"
          onClick={handleLogout}
        >
          <div className="crm-logout-icon">
            <LogoutOutlined />
          </div>
          {!collapsed && (
            <div className="crm-logout-text">
              Sair
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResponsiveSidebar;
