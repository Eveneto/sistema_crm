import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Badge } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import MainLayoutBootstrap from '../components/layout/MainLayoutBootstrap';
import api from '../services/api';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  companies: number;
  tasks: number;
  messages: number;
  communities: number;
  users: number;
  revenue: number;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
  user: string;
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
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simular dados (substitua por chamadas reais da API)
      setTimeout(() => {
        setStats({
          companies: 45,
          tasks: 123,
          messages: 89,
          communities: 12,
          users: 234,
          revenue: 145000,
        });

        setRecentActivities([
          {
            id: 1,
            type: 'company',
            title: 'Nova empresa criada',
            description: 'TechCorp foi adicionada ao sistema',
            time: '2 horas atrás',
            user: 'João Silva'
          },
          {
            id: 2,
            type: 'task',
            title: 'Tarefa concluída',
            description: 'Follow-up com cliente ABC',
            time: '4 horas atrás',
            user: 'Maria Santos'
          },
          {
            id: 3,
            type: 'message',
            title: 'Nova mensagem',
            description: 'Cliente interessado em proposta',
            time: '6 horas atrás',
            user: 'Pedro Costa'
          }
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setLoading(false);
    }
  };

  // Dados dos gráficos
  const lineChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Vendas',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Atividades',
        data: [12, 19, 3, 5, 2, 3, 7],
        backgroundColor: '#1890ff',
      },
    ],
  };

  const doughnutData = {
    labels: ['Empresas', 'Tarefas', 'Mensagens'],
    datasets: [
      {
        data: [stats.companies, stats.tasks, stats.messages],
        backgroundColor: ['#1890ff', '#52c41a', '#faad14'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'var(--bs-text-primary)',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'var(--bs-text-secondary)' },
        grid: { color: 'var(--bs-border-color)' },
      },
      y: {
        ticks: { color: 'var(--bs-text-secondary)' },
        grid: { color: 'var(--bs-border-color)' },
      },
    },
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: string;
    color: string;
    trend?: number;
  }> = ({ title, value, icon, color, trend }) => (
    <Card className="h-100 shadow-custom">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted mb-1 small">{title}</p>
            <h4 className="mb-1 fw-bold">{value.toLocaleString()}</h4>
            {trend && (
              <small className={`text-${trend > 0 ? 'success' : 'danger'}`}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
              </small>
            )}
          </div>
          <div 
            className={`bg-${color} rounded-circle d-flex align-items-center justify-content-center`}
            style={{ width: '50px', height: '50px' }}
          >
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <MainLayoutBootstrap>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">Carregando dashboard...</span>
        </div>
      </MainLayoutBootstrap>
    );
  }

  return (
    <MainLayoutBootstrap>
      <div className="container-fluid">
        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">📊 Visão Geral</h1>
            <p className="text-muted mb-0">Acompanhe o desempenho do seu CRM</p>
          </div>
          <Badge bg="primary" className="fs-6">
            {new Date().toLocaleDateString('pt-BR')}
          </Badge>
        </div>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <StatCard
              title="Empresas"
              value={stats.companies}
              icon="🏢"
              color="primary"
              trend={12}
            />
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <StatCard
              title="Tarefas"
              value={stats.tasks}
              icon="📋"
              color="success"
              trend={8}
            />
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <StatCard
              title="Mensagens"
              value={stats.messages}
              icon="💬"
              color="warning"
              trend={-3}
            />
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <StatCard
              title="Usuários"
              value={stats.users}
              icon="👥"
              color="info"
              trend={15}
            />
          </Col>
        </Row>

        {/* Charts Section */}
        <Row className="g-4 mb-4">
          <Col lg={8}>
            <Card className="h-100 shadow-custom">
              <Card.Header>
                <h5 className="mb-0">📈 Vendas por Mês</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  <Line data={lineChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="h-100 shadow-custom">
              <Card.Header>
                <h5 className="mb-0">📊 Distribuição</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  <Doughnut data={doughnutData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity and Weekly Activity */}
        <Row className="g-4">
          <Col lg={6}>
            <Card className="shadow-custom">
              <Card.Header>
                <h5 className="mb-0">🕒 Atividades Recentes</h5>
              </Card.Header>
              <Card.Body>
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="d-flex align-items-start mb-3 pb-3 border-bottom">
                    <div className="me-3">
                      <div 
                        className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <span className="text-white">
                          {activity.type === 'company' ? '🏢' : 
                           activity.type === 'task' ? '📋' : '💬'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{activity.title}</h6>
                      <p className="text-muted mb-1 small">{activity.description}</p>
                      <small className="text-muted">
                        {activity.user} • {activity.time}
                      </small>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6}>
            <Card className="shadow-custom">
              <Card.Header>
                <h5 className="mb-0">📊 Atividade Semanal</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  <Bar data={barChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayoutBootstrap>
  );
};

export default DashboardBootstrap;
