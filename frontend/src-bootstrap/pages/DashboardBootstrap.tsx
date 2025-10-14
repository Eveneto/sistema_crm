import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge,
  ListGroup,
  ProgressBar,
  Spinner,
  Alert
} from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import MainLayoutBootstrap from '../../components/layout/MainLayoutBootstrap';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface DashboardStats {
  companies: number;
  communities: number;
  users: number;
  tasks: number;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

const DashboardBootstrap: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { themeMode } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    companies: 0,
    communities: 0,
    users: 0,
    tasks: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // Simulate API calls with mock data
      setTimeout(() => {
        setStats({
          companies: 42,
          communities: 12,
          users: 156,
          tasks: 89
        });

        setActivities([
          {
            id: 1,
            type: 'company',
            description: 'Nova empresa "Tech Solutions" foi criada',
            timestamp: new Date().toISOString(),
            user: 'João Silva'
          },
          {
            id: 2,
            type: 'task',
            description: 'Tarefa "Implementar Dashboard" foi concluída',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: 'Maria Santos'
          },
          {
            id: 3,
            type: 'community',
            description: 'Nova comunidade "Desenvolvedores React" foi criada',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            user: 'Pedro Costa'
          }
        ]);

        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      setError('Erro ao carregar dados do dashboard');
      setIsLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Estatísticas Mensais',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Empresas',
        data: [12, 19, 15, 22, 28, 35],
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Comunidades',
        data: [5, 8, 12, 15, 18, 22],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ['Concluídas', 'Em Progresso', 'Pendentes'],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'company': return '🏢';
      case 'task': return '✅';
      case 'community': return '👥';
      default: return '📄';
    }
  };

  const getActivityVariant = (type: string) => {
    switch (type) {
      case 'company': return 'primary';
      case 'task': return 'success';
      case 'community': return 'info';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <MainLayoutBootstrap>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <div className="mt-3">Carregando dashboard...</div>
          </div>
        </div>
      </MainLayoutBootstrap>
    );
  }

  if (error) {
    return (
      <MainLayoutBootstrap>
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      </MainLayoutBootstrap>
    );
  }

  return (
    <MainLayoutBootstrap>
      <Container fluid>
        {/* Welcome Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h1 className="display-6 fw-bold text-primary mb-1">
                  Bem-vindo, {user?.first_name || user?.username || 'Usuário'}! 👋
                </h1>
                <p className="text-muted mb-0">
                  Aqui está um resumo das suas atividades
                </p>
              </div>
              <div className="text-end d-none d-md-block">
                <div className="text-muted small">
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px' }}
                    >
                      🏢
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.companies}</div>
                    <div className="text-muted small">Empresas</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px' }}
                    >
                      👥
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.communities}</div>
                    <div className="text-muted small">Comunidades</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px' }}
                    >
                      👤
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.users}</div>
                    <div className="text-muted small">Usuários</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px' }}
                    >
                      📋
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.tasks}</div>
                    <div className="text-muted small">Tarefas</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row className="mb-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="card-title mb-0">Crescimento Mensal</h5>
              </Card.Header>
              <Card.Body>
                <Bar data={barChartData} options={chartOptions} />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="card-title mb-0">Status das Tarefas</h5>
              </Card.Header>
              <Card.Body className="d-flex align-items-center justify-content-center">
                <div style={{ maxWidth: '250px', width: '100%' }}>
                  <Doughnut data={doughnutData} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activities */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="card-title mb-0">Atividades Recentes</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  {activities.map((activity) => (
                    <ListGroup.Item key={activity.id} className="d-flex align-items-center py-3">
                      <div className="flex-shrink-0 me-3">
                        <Badge 
                          bg={getActivityVariant(activity.type)} 
                          className="p-2 rounded-circle"
                        >
                          {getActivityIcon(activity.type)}
                        </Badge>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-medium">{activity.description}</div>
                        <small className="text-muted">
                          por {activity.user} • {formatDate(activity.timestamp)}
                        </small>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MainLayoutBootstrap>
  );
};

export default DashboardBootstrap;
