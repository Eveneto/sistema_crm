import React, { useEffect, useState } from 'react';
import { Typography, Card, Statistic, Space, Avatar, List, Tag, Spin } from 'antd';
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

const { Text } = Typography;

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
    <MainLayout title="Dashboard" subtitle="Visão geral do seu sistema de gestão">
      {loading ? (
        <div className="crm-flex-center crm-padding-responsive">
          <Spin size="large" />
          <div className="crm-margin-responsive">
            <Text>Carregando métricas...</Text>
          </div>
        </div>
                    ) : (
          <>
            {/* Cards de Estatísticas Principais - Layout Otimizado com Tailwind */}
            <div className="crm-dashboard-stats">
                <Card className="crm-metric-card crm-fade-in crm-hover-lift">
                  <Statistic
                    title="Empresas Cadastradas"
                    value={stats.companies}
                    prefix={<BankOutlined />}
                  />
                </Card>

                <Card className="crm-metric-card crm-fade-in crm-hover-lift">
                  <Statistic
                    title="Tasks Ativas"
                    value={stats.tasks}
                    prefix={<RiseOutlined />}
                  />
                </Card>

                <Card className="crm-metric-card crm-fade-in crm-hover-lift">
                  <Statistic
                    title="Mensagens Enviadas"
                    value={stats.messages}
                    prefix={<MessageOutlined />}
                  />
                </Card>

                <Card className="crm-metric-card crm-fade-in crm-hover-lift">
                  <Statistic
                    title="Faturamento"
                    value={stats.revenue}
                    prefix="R$"
                    suffix={<DollarCircleOutlined />}
                    precision={0}
                  />
                </Card>
              </div>

            {/* Gráficos - Layout Responsivo com Tailwind */}
            <div className="crm-grid-responsive crm-gap-responsive">
              <div className="crm-col-span-1 crm-tablet:col-span-2">
                <Card
                  className="crm-metric-card crm-slide-up crm-hover-lift"
                  title="Crescimento Mensal"
                  extra={<Tag color="blue">Últimos 6 meses</Tag>}
                >
                  <div className="crm-dashboard-chart-height">
                    <Line data={lineChartData} options={chartOptions} />
                  </div>
                </Card>
              </div>

              <div className="crm-col-span-1">
                <Card
                  className="crm-metric-card crm-slide-up crm-hover-lift"
                  title="Atividade por Módulo"
                  extra={<Tag color="green">Hoje</Tag>}
                >
                  <div className="crm-dashboard-chart-height">
                    <Bar data={barChartData} options={chartOptions} />
                  </div>
                </Card>
              </div>
            </div>

            {/* Status do Pipeline e Atividades Recentes - Layout Responsivo */}
            <div className="crm-grid-responsive crm-gap-responsive">
              <div className="crm-col-span-1">
                <Card
                  className="crm-metric-card crm-bounce-in crm-hover-lift"
                  title="Status do Pipeline"
                  extra={<Tag color="purple">Kanban</Tag>}
                >
                  <div className="crm-dashboard-chart-small">
                    <Doughnut data={doughnutData} options={chartOptions} />
                  </div>
                </Card>
              </div>

              <div className="crm-col-span-1 crm-tablet:col-span-2">
                <Card
                  className="crm-metric-card crm-bounce-in crm-hover-lift"
                  title="Atividades Recentes"
                  extra={<Tag color="orange">Tempo Real</Tag>}
                >
                  <List
                    dataSource={activities}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar className={
                              item.type === 'company' ? 'crm-avatar crm-avatar-primary' :
                              item.type === 'task' ? 'crm-avatar crm-avatar-success' :
                              item.type === 'message' ? 'crm-avatar crm-avatar-info' : 'crm-avatar crm-avatar-warning'
                            }>
                              {item.type === 'company' ? <BankOutlined /> :
                               item.type === 'task' ? <RiseOutlined /> :
                               item.type === 'message' ? <MessageOutlined /> : <TeamOutlined />}
                            </Avatar>
                          }
                          title={<Text strong>{item.title}</Text>}
                          description={
                            <Space direction="vertical" size={0}>
                              <Text type="secondary">{item.description}</Text>
                              <Text type="secondary" className="crm-text-xs">
                                {item.user} • {item.time}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </div>
            </div>

            {/* Cards de Resumo Rápido - Grid Responsivo */}
            <div className="crm-grid-responsive crm-gap-responsive">
              <Card className="crm-stats-card crm-stats-card-info">
                <Statistic
                  title="Usuários Ativos"
                  value={stats.users}
                  prefix={<UserOutlined />}
                />
              </Card>

              <Card className="crm-stats-card crm-stats-card-success">
                <Statistic
                  title="Comunidades"
                  value={stats.communities}
                  prefix={<TeamOutlined />}
                />
              </Card>

              <Card className="crm-stats-card crm-stats-card-warning">
                <Statistic
                  title="Taxa de Conversão"
                  value={87}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </div>
          </>
        )}
    </MainLayout>
  );
};

export default Dashboard;