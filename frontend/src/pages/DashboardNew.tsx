import React, { useEffect, useState } from 'react';
import { Typography, Spin } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  MessageOutlined,
  DollarCircleOutlined,
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

const { Title } = Typography;

interface DashboardStats {
  companies: number;
  tasks: number;
  messages: number;
  communities: number;
  users: number;
  revenue: number;
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar dados das APIs existentes
      const [companiesRes, tasksRes, communitiesRes] = await Promise.all([
        api.get('/companies/companies/'),
        api.get('/kanban/tasks/'),
        api.get('/communities/communities/')
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
        revenue: Math.floor(Math.random() * 50000) + 25000 // Simulado para demo
      });
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      // Dados mock em caso de erro
      setStats({
        companies: 12,
        tasks: 45,
        messages: 234,
        communities: 8,
        users: 23,
        revenue: 45670
      });
    } finally {
      setLoading(false);
    }
  };

  // Configuração dos gráficos
  const lineChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Empresas',
        data: [5, 8, 12, 18, 22, stats.companies],
        borderColor: 'var(--crm-accent)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'var(--crm-accent)',
        pointBorderColor: 'var(--crm-text-primary)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Tasks',
        data: [12, 19, 25, 32, 41, stats.tasks],
        borderColor: 'var(--crm-success)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'var(--crm-success)',
        pointBorderColor: 'var(--crm-text-primary)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const barChartData = {
    labels: ['Empresas', 'Tasks', 'Mensagens', 'Comunidades'],
    datasets: [
      {
        label: 'Atividade',
        data: [stats.companies, stats.tasks, stats.messages / 10, stats.communities],
        backgroundColor: [
          'var(--crm-accent)',
          'var(--crm-success)',
          'var(--crm-warning)',
          'var(--crm-info)'
        ],
        borderRadius: 8,
        borderSkipped: false,
        borderWidth: 0,
        barThickness: 40,
        maxBarThickness: 50
      }
    ]
  };

  const doughnutData = {
    labels: ['A Fazer', 'Em Progresso', 'Concluído'],
    datasets: [
      {
        data: [
          Math.floor(stats.tasks * 0.4),
          Math.floor(stats.tasks * 0.35),
          Math.floor(stats.tasks * 0.25)
        ],
        backgroundColor: [
          'var(--crm-warning)',
          'var(--crm-accent)',
          'var(--crm-success)'
        ],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'var(--crm-text-primary)',
          font: {
            size: 12,
            weight: 500
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'var(--crm-bg-elevated)',
        titleColor: 'var(--crm-text-primary)',
        bodyColor: 'var(--crm-text-secondary)',
        borderColor: 'var(--crm-border)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: {
          color: 'var(--crm-border)',
          borderColor: 'var(--crm-border)'
        },
        ticks: {
          color: 'var(--crm-text-secondary)',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      y: {
        grid: {
          color: 'var(--crm-border)',
          borderColor: 'var(--crm-border)'
        },
        ticks: {
          color: 'var(--crm-text-secondary)',
          font: {
            size: 12,
            weight: 500
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="crm-loading">
          <div className="crm-loading-spinner"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Visão Geral" subtitle="Bem-vindo ao seu painel de controle">
      <div className="crm-dashboard">

        {/* Stats Cards */}
        <div className="crm-dashboard-stats">
          <div className="crm-stats-card">
            <div className="crm-stats-icon crm-stats-icon-accent">
              <BankOutlined />
            </div>
            <div className="crm-stats-content">
              <div className="crm-stats-value">{stats.companies}</div>
              <div className="crm-stats-label">Empresas</div>
            </div>
          </div>

          <div className="crm-stats-card">
            <div className="crm-stats-icon crm-stats-icon-success">
              <ProjectOutlined />
            </div>
            <div className="crm-stats-content">
              <div className="crm-stats-value">{stats.tasks}</div>
              <div className="crm-stats-label">Tasks Ativas</div>
            </div>
          </div>

          <div className="crm-stats-card">
            <div className="crm-stats-icon crm-stats-icon-warning">
              <MessageOutlined />
            </div>
            <div className="crm-stats-content">
              <div className="crm-stats-value">{stats.messages}</div>
              <div className="crm-stats-label">Mensagens</div>
            </div>
          </div>

          <div className="crm-stats-card">
            <div className="crm-stats-icon crm-stats-icon-info">
              <TeamOutlined />
            </div>
            <div className="crm-stats-content">
              <div className="crm-stats-value">{stats.communities}</div>
              <div className="crm-stats-label">Comunidades</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="crm-dashboard-grid">
          {/* Growth Chart */}
          <div className="crm-chart-container">
            <div className="crm-chart-header">
              <h3 className="crm-chart-title">Crescimento Mensal</h3>
            </div>
            <div className="crm-chart-wrapper">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          {/* Activity Chart */}
          <div className="crm-chart-container">
            <div className="crm-chart-header">
              <h3 className="crm-chart-title">Atividade por Módulo</h3>
            </div>
            <div className="crm-chart-wrapper">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>

          {/* Task Distribution */}
          <div className="crm-chart-container">
            <div className="crm-chart-header">
              <h3 className="crm-chart-title">Distribuição de Tasks</h3>
            </div>
            <div className="crm-chart-wrapper-doughnut">
              <Doughnut
                data={doughnutData}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: true,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'bottom' as const
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Revenue Card */}
          <div className="crm-stats-card crm-stats-card-span-1">
            <div className="crm-stats-icon crm-stats-icon-success">
              <DollarCircleOutlined />
            </div>
            <div className="crm-stats-content">
              <div className="crm-stats-value">R$ {stats.revenue.toLocaleString()}</div>
              <div className="crm-stats-label">Faturamento</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
