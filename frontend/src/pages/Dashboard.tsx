import React from 'react';
import { Layout, Typography, Card, Row, Col, Avatar, Dropdown, MenuProps, Button } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, FireOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { user, handleLogout } = useAuth();

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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '0 24px'
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
      
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2}>Dashboard</Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#1890ff' }}>0</Title>
                  <Text type="secondary">Empresas</Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#52c41a' }}>0</Title>
                  <Text type="secondary">Leads</Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#faad14' }}>0</Title>
                  <Text type="secondary">Propostas</Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#f5222d' }}>R$ 0</Title>
                  <Text type="secondary">Vendas</Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Card style={{ marginTop: 24 }}>
            <Title level={3}>Bem-vindo ao CRM System!</Title>
            <Text>
              Sistema de gestão de relacionamento com cliente. 
              Em breve você poderá gerenciar empresas, leads e ter acesso ao chat em tempo real.
            </Text>
            
            <div style={{ marginTop: 16 }}>
              <Link to="/token-test">
                <Button type="primary" icon={<FireOutlined />}>
                  🔥 Testar Renovação de Tokens Firebase
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;
