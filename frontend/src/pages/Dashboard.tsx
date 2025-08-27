import React from 'react';
import { Typography, Card, Row, Col } from 'antd';
import MainLayout from '../components/layout/MainLayout';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  return (
    <MainLayout>
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
            Agora você pode gerenciar empresas clicando em "Empresas" no menu lateral.
            Em breve: Kanban para pipeline de vendas e Chat em tempo real.
          </Text>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;