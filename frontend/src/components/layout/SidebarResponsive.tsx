import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Typography, Divider, Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  DashboardOutlined,
  BankOutlined,
  ProjectOutlined,
  TeamOutlined,
  MessageOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';
import './SidebarResponsive.css';

const { Sider } = Layout;
const { Text } = Typography;

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
  const [openKeys, setOpenKeys] = useState<string[]>([]);

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
    setOpenKeys([]);
  }, [location.pathname, collapsed]);

  // Create menu item (simplificado sem badges)
  const createMenuItem = (item: any) => {
    return {
      key: item.key,
      icon: collapsed && !isMobile ? (
        <Tooltip title={item.label} placement="right">
          {item.icon}
        </Tooltip>
      ) : item.icon,
      label: item.label,
      onClick: item.onClick,
    };
  };

  return (
    <>
      <Sider
        className={`app-sidebar-responsive ${isMobile && !collapsed ? 'sidebar-mobile-open' : ''}`}
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        collapsedWidth={80}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken && !isMobile) {
            onCollapse(true);
          }
        }}
        style={{
          height: '100vh',
          position: 'fixed',
          left: isMobile ? (collapsed ? -280 : 0) : 0,
          top: 0,
          bottom: 0,
          zIndex: 1001,
          background: '#ffffff',
          borderRight: '1px solid #f0f0f0',
          boxShadow: isMobile ? '4px 0 16px rgba(0, 0, 0, 0.1)' : '2px 0 8px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
      >
        {/* Header with logo and collapse button */}
        <div className="sidebar-header-responsive">
          <div className="sidebar-logo-responsive">
            {!collapsed ? (
              <>
                <div className="logo-content-wrapper">
                  <div className="logo-icon-responsive">
                    <span>HG</span>
                  </div>
                  <div className="logo-text-responsive">
                    <Text strong style={{ fontSize: '16px', color: 'white' }}>
                      Assessoria
                    </Text>
                    <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                      CRM System
                    </Text>
                  </div>
                </div>
                <Button
                  type="text"
                  icon={<MenuFoldOutlined />}
                  onClick={() => onCollapse(!collapsed)}
                  className="collapse-btn-responsive"
                  style={{
                    fontSize: '16px',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                />
              </>
            ) : (
              <div className="sidebar-logo-collapsed-responsive">
                <div className="logo-icon-responsive collapsed">
                  <span>HG</span>
                </div>
                <Button
                  type="text"
                  icon={<MenuUnfoldOutlined />}
                  onClick={() => onCollapse(!collapsed)}
                  className="collapse-btn-responsive collapsed"
                  style={{
                    fontSize: '16px',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    marginTop: 8,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* Quick actions when collapsed - removido para simplificar */}

        {/* User profile section */}
        {!collapsed && (
          <div className="sidebar-user-responsive">
            <Avatar 
              size={40} 
              icon={<UserOutlined />}
              style={{ 
                backgroundColor: '#1890ff',
                marginBottom: 8 
              }}
            />
            <div className="user-info-responsive">
              <Text strong style={{ fontSize: '14px' }}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {user?.email}
              </Text>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="sidebar-user-collapsed-responsive">
            <Tooltip title={`${user?.first_name} ${user?.last_name}`} placement="right">
              <Avatar 
                size={32} 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
            </Tooltip>
          </div>
        )}

        <Divider style={{ margin: '16px 0' }} />

        {/* Main navigation menu */}
        <div className="sidebar-menu-responsive">
          <Menu
            mode="inline"
            theme="light"
            selectedKeys={[getSelectedKey()]}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={setOpenKeys}
            style={{ 
              border: 'none',
              background: 'transparent',
            }}
            items={menuItems.map(createMenuItem)}
          />
        </div>

        {/* Settings menu at bottom */}
        <div className="sidebar-footer-responsive">
          <Divider style={{ margin: '8px 0' }} />
          
          <Menu
            mode="inline"
            theme="light"
            selectedKeys={[getSelectedKey()]}
            style={{ 
              border: 'none',
              background: 'transparent',
            }}
            items={settingsItems.map(item => ({
              key: item.key,
              icon: collapsed ? (
                <Tooltip title={item.label} placement="right">
                  {item.icon}
                </Tooltip>
              ) : item.icon,
              label: item.label,
              onClick: item.onClick,
            }))}
          />

          {/* Logout button */}
          <div className="logout-section-responsive">
            {collapsed ? (
              <Tooltip title="Sair" placement="right">
                <Button
                  type="text"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  className="logout-btn-collapsed-responsive"
                  danger
                  style={{
                    width: '100%',
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </Tooltip>
            ) : (
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="logout-btn-responsive"
                danger
                style={{
                  width: '100%',
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: '0 24px',
                }}
              >
                Sair
              </Button>
            )}
          </div>
        </div>
      </Sider>
    </>
  );
};

export default ResponsiveSidebar;
