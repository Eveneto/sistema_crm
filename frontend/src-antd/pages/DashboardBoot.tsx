import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import MainLayoutBootstrap from '../components/layout/MainLayoutBootstrap';
import api from '../services/api';

interface DashboardStats {
  companies: number;
  tasks: number;
  messages: number;
  communities: number;
  users: number;
  revenue: number;
}

const DashboardBootstrap: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    companies: 0,
    tasks: 0,
    messages: 0,
    communities: 0,
    users: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/dashboard/stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // Se falhar, usar dados mock
        setStats({
          companies: 25,
          tasks: 42,
          messages: 156,
          communities: 8,
          users: 12,
          revenue: 85000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard: React.FC<{ title: string; value: number | string; icon: string; color: string }> = ({ 
    title, 
    value, 
    icon, 
    color 
  }) => (
    <Card className="h-100 shadow-custom">
      <Card.Body className="d-flex align-items-center">
        <div className={`text-${color} me-3`} style={{ fontSize: '2rem' }}>
          {icon}
        </div>
        <div>
          <Card.Title className="mb-1 h5">{title}</Card.Title>
          <Card.Text className="h3 mb-0 text-primary-custom">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Card.Text>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <MainLayoutBootstrap>
        <Container fluid>
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <div className="spinner-border text-primary-custom" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-3">Carregando dashboard...</p>
            </div>
          </div>
        </Container>
      </MainLayoutBootstrap>
    );
  }

  return (
    <MainLayoutBootstrap>
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-1">📊 Visão Geral</h1>
                <p className="text-muted mb-0">Dashboard do sistema CRM</p>
              </div>
              <Button variant="outline-primary" size="sm">
                ↻ Atualizar
              </Button>
            </div>
          </Col>
        </Row>

        {/* Estatísticas */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Empresas"
              value={stats.companies}
              icon="🏢"
              color="primary"
            />
          </Col>
          <Col xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Tarefas"
              value={stats.tasks}
              icon="📋"
              color="warning"
            />
          </Col>
          <Col xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Mensagens"
              value={stats.messages}
              icon="💬"
              color="info"
            />
          </Col>
          <Col xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Comunidades"
              value={stats.communities}
              icon="👥"
              color="success"
            />
          </Col>
          <Col xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Usuários"
              value={stats.users}
              icon="👤"
              color="secondary"
            />
          </Col>
          <Col xs={12} sm={6} lg={4} xl={2}>
            <StatCard
              title="Receita"
              value={`R$ ${stats.revenue.toLocaleString()}`}
              icon="💰"
              color="success"
            />
          </Col>
        </Row>

        {/* Seções principais */}
        <Row className="g-4">
          {/* Atividades Recentes */}
          <Col xs={12} lg={6}>
            <Card className="h-100 shadow-custom">
              <Card.Header>
                <Card.Title className="mb-0">📈 Atividades Recentes</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary-custom rounded-circle p-2 me-3">
                      <span className="text-white">📊</span>
                    </div>
                    <div>
                      <p className="mb-1 fw-semibold">Nova empresa cadastrada</p>
                      <small className="text-muted">2 horas atrás</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-success rounded-circle p-2 me-3">
                      <span className="text-white">✅</span>
                    </div>
                    <div>
                      <p className="mb-1 fw-semibold">Tarefa concluída</p>
                      <small className="text-muted">5 horas atrás</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-info rounded-circle p-2 me-3">
                      <span className="text-white">💬</span>
                    </div>
                    <div>
                      <p className="mb-1 fw-semibold">Nova mensagem</p>
                      <small className="text-muted">1 dia atrás</small>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Status do Pipeline */}
          <Col xs={12} lg={6}>
            <Card className="h-100 shadow-custom">
              <Card.Header>
                <Card.Title className="mb-0">🎯 Status do Pipeline</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Leads</span>
                      <span className="fw-bold">25</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-primary-custom" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Propostas</span>
                      <span className="fw-bold">12</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-warning" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Fechados</span>
                      <span className="fw-bold">8</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-success" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Ações Rápidas */}
        <Row className="mt-4">
          <Col>
            <Card className="shadow-custom">
              <Card.Header>
                <Card.Title className="mb-0">⚡ Ações Rápidas</Card.Title>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col xs={12} sm={6} md={3}>
                    <Button variant="outline-primary" className="w-100 h-100 py-3">
                      <div>
                        <div style={{ fontSize: '1.5rem' }}>🏢</div>
                        <div className="mt-2">Nova Empresa</div>
                      </div>
                    </Button>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Button variant="outline-primary" className="w-100 h-100 py-3">
                      <div>
                        <div style={{ fontSize: '1.5rem' }}>📋</div>
                        <div className="mt-2">Nova Tarefa</div>
                      </div>
                    </Button>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Button variant="outline-primary" className="w-100 h-100 py-3">
                      <div>
                        <div style={{ fontSize: '1.5rem' }}>👥</div>
                        <div className="mt-2">Comunidade</div>
                      </div>
                    </Button>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Button variant="outline-primary" className="w-100 h-100 py-3">
                      <div>
                        <div style={{ fontSize: '1.5rem' }}>💬</div>
                        <div className="mt-2">Chat</div>
                      </div>
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MainLayoutBootstrap>
  );
};

export default DashboardBootstrap;
