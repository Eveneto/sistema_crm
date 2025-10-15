import React, { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Progress, Space, Avatar, List, Tag, Spin } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  DollarCircleOutlined,
  TrophyOutlined,
  MessageOutlined,
  RiseOutlined,
  BankOutlined
} from '@ant-design/icons';
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
import MainLayout from '../components/layout/MainLayout';
import PageHeader from '../components/layout/PageHeader';
import api from '../services/api';
import '../styles/dashboard-improved.css';

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

const { Title, Text } = Typography;

interface DashboardStats {
  companies: number;
  tasks: number;
  messages: number;
  communities: number;
  users: number;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: 'company' | 'task' | 'message' | 'community';
  title: string;
  description: string;
  time: string;
  user: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    companies: 0,
    tasks: 0,
    messages: 0,
    communities: 0,
    users: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados das APIs existentes
      const [companiesRes, tasksRes, communitiesRes] = await Promise.all([
        api.get('/api/companies/companies/'),
        api.get('/api/kanban/tasks/'),
        api.get('/api/communities/communities/')
      ]);

      // Calcular estatísticas
      const companiesCount = companiesRes.data.count || companiesRes.data.length || 0;
      const tasksCount = tasksRes.data.count || tasksRes.data.length || 0;
      const communitiesCount = communitiesRes.data.count || communitiesRes.data.length || 0;

      setStats({
        companies: companiesCount,
        tasks: tasksCount,
        messages: Math.floor(Math.random() * 1000) + 500, // Simulado para demo
        communities: communitiesCount,
        users: Math.floor(Math.random() * 50) + 10, // Simulado para demo
        revenue: Math.floor(Math.random() * 500000) + 100000 // Simulado para demo
      });

      // Atividades simuladas para demo impressionante
      setActivities([
        {
          id: '1',
          type: 'company',
          title: 'Nova empresa cadastrada',
          description: 'TechStart Solutions foi adicionada ao sistema',
          time: 'há 5 minutos',
          user: 'João Silva'
        },
        {
          id: '2',
          type: 'task',
          title: 'Task movida para "Concluído"',
          description: 'Proposta comercial finalizada',
          time: 'há 15 minutos',
          user: 'Maria Santos'
        },
        {
          id: '3',
          type: 'message',
          title: 'Nova mensagem no chat',
          description: 'Discussão sobre próximos passos do projeto',
          time: 'há 30 minutos',
          user: 'Pedro Costa'
        },
        {
          id: '4',
          type: 'community',
          title: 'Novo membro na comunidade',
          description: 'Ana Rodrigues se juntou à equipe de vendas',
          time: 'há 1 hora',
          user: 'Sistema'
        }
      ]);

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      // Em caso de erro, usar dados simulados para demo
      setStats({
        companies: 25,
        tasks: 87,
        messages: 234,
        communities: 6,
        users: 18,
        revenue: 450000
      });
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráfico de linha (crescimento ao longo do tempo)
  const lineChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Empresas Cadastradas',
        data: [5, 8, 12, 18, 22, 25],
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Deals Fechados',
        data: [2, 4, 7, 11, 15, 19],
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Dados para gráfico de barras (atividade por módulo)
  const barChartData = {
    labels: ['Empresas', 'Kanban', 'Chat', 'Comunidades'],
    datasets: [
      {
        label: 'Atividade Diária',
        data: [stats.companies, stats.tasks, stats.messages / 10, stats.communities * 3],
        backgroundColor: [
          '#1890ff',
          '#52c41a', 
          '#faad14',
          '#722ed1'
        ],
        borderRadius: 4
      }
    ]
  };

  // Dados para gráfico de rosca (distribuição de tasks)
  const doughnutData = {
    labels: ['A Fazer', 'Em Progresso', 'Concluído'],
    datasets: [
      {
        data: [30, 45, 25],
        backgroundColor: [
          '#ff4d4f',
          '#faad14', 
          '#52c41a'
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };
  return (
    <MainLayout>
      <div className="dashboard-container">
        <PageHeader
          title="Dashboard"
          subtitle="Visão geral do seu sistema de gestão"
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Carregando métricas...</Text>
            </div>
          </div>
          ) : (
            <>
              {/* Cards de Estatísticas Principais - Layout Horizontal Otimizado */}
              <div className="dashboard-stats-grid">
                <Card className="stats-card">
                  <Statistic
                    title="Empresas Cadastradas"
                    value={stats.companies}
                    prefix={<BankOutlined />}
                  />
                  {/* <Progress 
                    percent={Math.min((stats.companies / 50) * 100, 100)} 
                    showInfo={false} 
                    strokeColor="var(--tech-primary)"
                    className="dashboard-stats-progress"
                  /> */}
                </Card>
                
                <Card className="stats-card">
                  <Statistic
                    title="Tasks Ativas"
                    value={stats.tasks}
                    prefix={<RiseOutlined />}
                  />
                  {/* <Progress 
                    percent={Math.min((stats.tasks / 100) * 100, 100)} 
                    showInfo={false} 
                    strokeColor="var(--tech-success)"
                    className="dashboard-stats-progress"
                  /> */}
                </Card>
                
                <Card className="stats-card">
                  <Statistic
                    title="Mensagens Enviadas"
                    value={stats.messages}
                    prefix={<MessageOutlined />}
                  />
                  {/* <Progress 
                    percent={Math.min((stats.messages / 1000) * 100, 100)} 
                    showInfo={false} 
                    strokeColor="var(--tech-warning)"
                    className="dashboard-stats-progress"
                  /> */}
                </Card>
                
                <Card className="stats-card">
                  <Statistic
                    title="Faturamento"
                    value={stats.revenue}
                    prefix="R$"
                    suffix={<DollarCircleOutlined />}
                    precision={0}
                  />
                  {/* <Text className="dashboard-stats-helper">
                    +12% este mês
                  </Text> */}
                </Card>
              </div>

            {/* Gráficos */}
            <Row gutter={[16, 16]} className="dashboard-charts-row">
              <Col xs={24} lg={12}>
                <Card 
                  className="chart-card"
                  title="Crescimento Mensal" 
                  extra={<Tag color="blue">Últimos 6 meses</Tag>}
                >
                  <div style={{ height: 300 }}>
                    <Line data={lineChartData} options={chartOptions} />
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card 
                  className="chart-card"
                  title="Atividade por Módulo" 
                  extra={<Tag color="green">Hoje</Tag>}
                >
                  <div style={{ height: 300 }}>
                    <Bar data={barChartData} options={chartOptions} />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Status do Pipeline e Atividades Recentes */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={8}>
                <Card 
                  className="chart-card"
                  title="Status do Pipeline" 
                  extra={<Tag color="purple">Kanban</Tag>}
                >
                  <div style={{ height: 250 }}>
                    <Doughnut data={doughnutData} options={chartOptions} />
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} lg={16}>
                <Card 
                  className="chart-card"
                  title="Atividades Recentes" 
                  extra={<Tag color="orange">Tempo Real</Tag>}
                >
                  <List
                    dataSource={activities}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar style={{ 
                              backgroundColor: 
                                item.type === 'company' ? '#1890ff' :
                                item.type === 'task' ? '#52c41a' :
                                item.type === 'message' ? '#faad14' : '#722ed1'
                            }}>
                              {item.type === 'company' ? <BankOutlined /> :
                               item.type === 'task' ? <RiseOutlined /> :
                               item.type === 'message' ? <MessageOutlined /> : <TeamOutlined />}
                            </Avatar>
                          }
                          title={<Text strong>{item.title}</Text>}
                          description={
                            <Space direction="vertical" size={0}>
                              <Text type="secondary">{item.description}</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {item.user} • {item.time}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>

            {/* Cards de Resumo Rápido */}
            <Row gutter={[16, 16]} className="dashboard-summary-cards">
              <Col xs={24} sm={8}>
                <Card className="tech-dashboard-stat-card tech-dashboard-users">
                  <Statistic
                    title="Usuários Ativos"
                    value={stats.users}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={8}>
                <Card className="tech-dashboard-stat-card tech-dashboard-communities">
                  <Statistic
                    title="Comunidades"
                    value={stats.communities}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={8}>
                <Card className="tech-dashboard-stat-card tech-dashboard-conversion">
                  <Statistic
                    title="Taxa de Conversão"
                    value={87}
                    suffix="%"
                    prefix={<TrophyOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;