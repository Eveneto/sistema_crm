import React from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, MenuProps } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  DashboardOutlined,
  BuildOutlined,
  ProjectOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Menu do dropdown do usuário
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Perfil',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Configurações',
      icon: <SettingOutlined />,
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

  // Itens do menu lateral
  const sideMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/companies',
      icon: <BuildOutlined />,
      label: 'Empresas',
      onClick: () => navigate('/companies'),
    },
    {
      key: '/kanban',
      icon: <ProjectOutlined />,
      label: 'Pipeline',
      onClick: () => navigate('/kanban'),
      disabled: true, // Temporariamente desabilitado
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: 'Chat',
      onClick: () => navigate('/chat'),
      disabled: true, // Temporariamente desabilitado
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          🏢 CRM System
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text>Olá, {user?.first_name || user?.username}!</Text>
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar 
                size="small" 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
              <Text>{user?.first_name || user?.username}</Text>
            </div>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {/* Sidebar */}
        <Sider 
          width={250}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={sideMenuItems}
          />
        </Sider>

        {/* Content */}
        <Content style={{ 
          padding: '24px', 
          background: '#f0f2f5',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
