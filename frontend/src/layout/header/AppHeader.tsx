import React from 'react';
import { Layout, Button, Space, Avatar, Dropdown, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  collapsed: boolean;
  onCollapse: () => void;
  title?: string;
  subtitle?: string;
  isMobile: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  collapsed,
  onCollapse,
  title,
  subtitle,
  isMobile
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implementar logout
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="crm-header bg-crm-bg-secondary border-b border-crm-border px-6 flex items-center justify-between">
      {/* Left Section - Collapse Button & Title */}
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onCollapse}
          className="crm-collapse-btn text-crm-text-primary hover:bg-crm-bg-tertiary"
        />

        {(title || subtitle) && (
          <div className="crm-header-info">
            {title && (
              <Text className="crm-text-gradient text-xl font-semibold m-0">
                {title}
              </Text>
            )}
            {title && subtitle && <span>&nbsp;</span>}
            {subtitle && (
              <Text type="secondary" className="text-sm m-0">
                {subtitle}
              </Text>
            )}
          </div>
        )}
      </div>

      {/* Right Section - Actions & User Menu */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button
          type="text"
          icon={<BellOutlined />}
          className="crm-notification-btn text-crm-text-primary hover:bg-crm-bg-tertiary"
        />

        {/* User Menu */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div className="crm-user-menu flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-crm-bg-tertiary transition-colors">
            <Avatar
              icon={<UserOutlined />}
              className="crm-avatar crm-avatar-primary"
            />
            {!isMobile && (
              <div className="crm-user-info hidden md:block">
                <Text className="text-sm font-medium m-0">Usuário</Text>
                <Text type="secondary" className="text-xs m-0">Admin</Text>
              </div>
            )}
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
