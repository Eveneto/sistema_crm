import React from 'react';
import { Avatar, Dropdown, MenuProps, Space, Typography } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface UserProfileDropdownProps {
  style?: React.CSSProperties;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ style }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Função de logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu do dropdown do usuário
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div>
          <Text strong>{user?.first_name || user?.username}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {user?.email}
          </Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'account',
      label: 'Minha conta',
      icon: <UserOutlined />,
      onClick: () => console.log('Profile clicked'),
    },
    {
      key: 'settings',
      label: 'Configurações',
      icon: <SettingOutlined />,
      onClick: () => console.log('Settings clicked'),
    },
    {
      key: 'help',
      label: 'Ajuda',
      icon: <QuestionCircleOutlined />,
      onClick: () => console.log('Help clicked'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Sair',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  // Determinar iniciais do usuário
  const getUserInitials = () => {
    const name = user?.first_name || user?.username || 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, ...style }}>
      {/* Ícone de notificações */}
      <div
        style={{
          padding: '8px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        }}
        className="rd-notification-icon"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--rd-bg-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <BellOutlined style={{ fontSize: '16px', color: 'var(--rd-text-secondary)' }} />
      </div>

      {/* Dropdown do usuário */}
      <Dropdown 
        menu={{ items: userMenuItems }} 
        trigger={['click']}
        placement="bottomRight"
      >
        <div style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          padding: '4px 8px',
          borderRadius: '8px',
          transition: 'background-color 0.2s ease',
        }}
        className="rd-user-dropdown"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--rd-bg-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        >
          <Avatar 
            size={32} 
            style={{ 
              backgroundColor: 'var(--rd-primary)',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            {getUserInitials()}
          </Avatar>
          <Space direction="vertical" size={0} style={{ lineHeight: 1.2 }}>
            <Text 
              style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: 'var(--rd-text)',
                lineHeight: 1.2,
              }}
            >
              {user?.first_name || user?.username}
            </Text>
            <Text 
              style={{ 
                fontSize: '12px', 
                color: 'var(--rd-text-tertiary)',
                lineHeight: 1.2,
              }}
            >
              {user?.email}
            </Text>
          </Space>
        </div>
      </Dropdown>
    </div>
  );
};

export default UserProfileDropdown;
