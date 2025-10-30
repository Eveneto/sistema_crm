import React from 'react';
import { Menu, Avatar, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  MessageOutlined,
  BankOutlined,
  SettingOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface AppSidebarProps {
  collapsed: boolean;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/companies',
      icon: <BankOutlined />,
      label: 'Empresas',
    },
    {
      key: '/kanban',
      icon: <ProjectOutlined />,
      label: 'Kanban',
    },
    {
      key: '/communities',
      icon: <TeamOutlined />,
      label: 'Comunidades',
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: 'Chat',
    },
    {
      type: 'divider' as const,
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <div className="crm-sidebar-content h-full flex flex-col">
      {/* Logo/Brand */}
      <div className="crm-sidebar-header p-6 border-b border-crm-border">
        <div className="flex items-center gap-3">
          <Avatar
            size="large"
            className="crm-avatar crm-avatar-primary"
            style={{ background: 'linear-gradient(135deg, var(--crm-primary), var(--crm-accent))' }}
          >
            CRM
          </Avatar>
          {!collapsed && (
            <div className="crm-brand-info">
              <Text className="crm-text-gradient text-lg font-bold m-0">
                CRM System
              </Text>
              <span>&nbsp;</span>
              <Text type="secondary" className="text-xs m-0">
                Gestão Empresarial
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="crm-sidebar-menu flex-1 p-4">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="crm-menu border-none bg-transparent"
          inlineCollapsed={collapsed}
        />
      </div>

      {/* Footer */}
      <div className="crm-sidebar-footer p-4 border-t border-crm-border">
        {!collapsed && (
          <div className="crm-sidebar-footer-content text-center">
            <Text type="secondary" className="text-xs">
              Versão 2.0.0
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppSidebar;
