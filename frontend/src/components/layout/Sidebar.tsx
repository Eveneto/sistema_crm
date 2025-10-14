import React, { useState } from 'react';
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
  BarChartOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';
import './Sidebar.css';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state: RootState) => state.auth);

  // Menu items configuration
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Visão Geral',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'crm',
      icon: <BankOutlined />,
      label: 'CRM',
      children: [
        {
          key: '/companies',
          label: 'Empresas',
          onClick: () => navigate('/companies'),
        },
        {
          key: '/contacts',
          label: 'Contatos',
          onClick: () => navigate('/contacts'),
        },
        {
          key: '/leads',
          label: 'Leads',
          onClick: () => navigate('/leads'),
        },
      ],
    },
    {
      key: '/kanban',
      icon: <ProjectOutlined />,
      label: 'Pipeline',
      onClick: () => navigate('/kanban'),
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Relatórios',
      children: [
        {
          key: '/reports/sales',
          label: 'Vendas',
          onClick: () => navigate('/reports/sales'),
        },
        {
          key: '/reports/activities',
          label: 'Atividades',
          onClick: () => navigate('/reports/activities'),
        },
        {
          key: '/reports/performance',
          label: 'Performance',
          onClick: () => navigate('/reports/performance'),
        },
      ],
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
      key: 'tools',
      icon: <ToolOutlined />,
      label: 'Ferramentas',
      children: [
        {
          key: '/calendar',
          label: 'Calendário',
          icon: <CalendarOutlined />,
          onClick: () => navigate('/calendar'),
        },
        {
          key: '/documents',
          label: 'Documentos',
          icon: <FileTextOutlined />,
          onClick: () => navigate('/documents'),
        },
        {
          key: '/testing-tools',
          label: 'Ferramentas de Teste',
          onClick: () => navigate('/testing-tools'),
        },
      ],
    },
  ];

  const settingsItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Perfil',
      onClick: () => navigate('/profile'),
    },
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
      if (item.children) {
        for (const child of item.children) {
          if (child.key === path) return child.key;
        }
      }
    }
    
    // Check for settings items
    for (const item of settingsItems) {
      if (item.key === path) return item.key;
    }
    
    return '/dashboard';
  };

  // Get open keys for sub-menus
  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys: string[] = [];
    
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (child.key === path) {
            openKeys.push(item.key);
          }
        }
      }
    }
    
    return openKeys;
  };

  const [openKeys, setOpenKeys] = useState<string[]>(getOpenKeys());

  return (
    <Sider
      className="app-sidebar"
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      collapsedWidth={80}
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1001,
        background: '#ffffff',
        borderRight: '1px solid #f0f0f0',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Header with logo and collapse button */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {!collapsed ? (
            <>
              <div className="logo-icon">
                <span>HG</span>
              </div>
              <div className="logo-text">
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  Assessoria
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  CRM System
                </Text>
              </div>
            </>
          ) : (
            <div className="logo-icon collapsed">
              <span>HG</span>
            </div>
          )}
        </div>
        
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          className="collapse-btn"
          style={{
            fontSize: '16px',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* User profile section */}
      {!collapsed && (
        <div className="sidebar-user">
          <Avatar 
            size={40} 
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: '#1890ff',
              marginBottom: 8 
            }}
          />
          <div className="user-info">
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
        <div className="sidebar-user-collapsed">
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
      <div className="sidebar-menu">
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
          items={menuItems.map(item => ({
            key: item.key,
            icon: collapsed ? (
              <Tooltip title={item.label} placement="right">
                {item.icon}
              </Tooltip>
            ) : item.icon,
            label: item.label,
            onClick: item.onClick,
            children: item.children?.map(child => ({
              key: child.key,
              label: child.label,
              icon: child.icon,
              onClick: child.onClick,
            })),
          }))}
        />
      </div>

      {/* Settings menu at bottom */}
      <div className="sidebar-footer">
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
        <div className="logout-section">
          {collapsed ? (
            <Tooltip title="Sair" placement="right">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="logout-btn-collapsed"
                style={{
                  width: '100%',
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ff4d4f',
                }}
              />
            </Tooltip>
          ) : (
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="logout-btn"
              style={{
                width: '100%',
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '0 24px',
                color: '#ff4d4f',
              }}
            >
              Sair
            </Button>
          )}
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
