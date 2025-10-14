import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Space,
  Typography,
  message,
  Spin,
  Empty,
  Badge,
  Tabs,
  Statistic,
  Tooltip,
} from 'antd';
import './communities-responsive.css';
import {
  PlusOutlined,
  TeamOutlined,
  GlobalOutlined,
  LockOutlined,
  UserOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import PageHeader from '../components/layout/PageHeader';
import CommunityCard from '../components/communities/CommunityCard';
import CommunityModal from '../components/communities/CommunityModal';
import { Community, CommunityCreateData, CommunityUpdateData } from '../types/community';
import { communitiesApi } from '../services/communitiesApi';

const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface CommunityFilters {
  search: string;
  is_public?: boolean;
  ordering: string;
  only_member: boolean;
}

const CommunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | undefined>();
  const [filters, setFilters] = useState<CommunityFilters>({
    search: '',
    ordering: '-created_at',
    only_member: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    myCommunitiesCount: 0,
    publicCount: 0,
    privateCount: 0,
  });

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const params: any = {
        search: filters.search || undefined,
        is_public: filters.is_public,
        ordering: filters.ordering,
      };

      const response = await communitiesApi.getCommunities(params);
      let filteredCommunities = response.results;

      // Filter by membership if needed
      if (filters.only_member) {
        filteredCommunities = filteredCommunities.filter(c => c.is_member);
      }

      setCommunities(filteredCommunities);

      // Update stats
      const myCommunitiesCount = response.results.filter(c => c.is_member).length;
      const publicCount = response.results.filter(c => c.is_public).length;
      const privateCount = response.results.filter(c => !c.is_public).length;

      setStats({
        total: response.count,
        myCommunitiesCount,
        publicCount,
        privateCount,
      });
    } catch (error) {
      console.error('Error loading communities:', error);
      message.error('Erro ao carregar comunidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, [filters]);

  const handleCreateCommunity = async (data: CommunityCreateData) => {
    setModalLoading(true);
    try {
      const newCommunity = await communitiesApi.createCommunity(data);
      message.success('Comunidade criada com sucesso!');
      setModalVisible(false);
      await loadCommunities(); // Reload to get updated data
    } catch (error: any) {
      console.error('Error creating community:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Erro ao criar comunidade';
      message.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditCommunity = async (data: CommunityUpdateData) => {
    if (!editingCommunity) return;

    setModalLoading(true);
    try {
      await communitiesApi.updateCommunity(editingCommunity.id, data);
      message.success('Comunidade atualizada com sucesso!');
      setModalVisible(false);
      setEditingCommunity(undefined);
      await loadCommunities();
    } catch (error: any) {
      console.error('Error updating community:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Erro ao atualizar comunidade';
      message.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleJoinCommunity = async (community: Community) => {
    try {
      await communitiesApi.joinCommunity(community.id);
      message.success(`Você entrou na comunidade "${community.name}"!`);
      await loadCommunities();
    } catch (error: any) {
      console.error('Error joining community:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Erro ao entrar na comunidade';
      message.error(errorMessage);
    }
  };

  const handleLeaveCommunity = async (community: Community) => {
    try {
      await communitiesApi.leaveCommunity(community.id);
      message.success(`Você saiu da comunidade "${community.name}"`);
      await loadCommunities();
    } catch (error: any) {
      console.error('Error leaving community:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Erro ao sair da comunidade';
      message.error(errorMessage);
    }
  };

  const handleViewCommunity = (community: Community) => {
    navigate(`/communities/${community.id}`);
  };

  const openCreateModal = () => {
    setEditingCommunity(undefined);
    setModalVisible(true);
  };

  const openEditModal = (community: Community) => {
    setEditingCommunity(community);
    setModalVisible(true);
  };

  const updateFilters = (key: keyof CommunityFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      ordering: '-created_at',
      only_member: false,
    });
  };

  return (
    <MainLayout>
      <PageHeader
        title="Comunidades"
        subtitle="Conecte-se com outros usuários em comunidades de interesse"
        actions={[
          <Button 
            key="refresh"
            icon={<ReloadOutlined />} 
            onClick={loadCommunities}
          >
            Atualizar
          </Button>,
          <Button 
            key="create"
            type="primary" 
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Criar Comunidade
          </Button>
        ]}
      />
      
      <div style={{ padding: '24px' }}>
        {/* Stats Cards */}
        {window.innerWidth > 700 ? (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Total"
                    value={stats.total}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Minhas Comunidades"
                    value={stats.myCommunitiesCount}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Públicas"
                    value={stats.publicCount}
                    prefix={<GlobalOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Privadas"
                    value={stats.privateCount}
                    prefix={<LockOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <Card size="small">
                <Statistic
                  title="Total"
                  value={stats.total}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
              <Card size="small">
                <Statistic
                  title="Minhas Comunidades"
                  value={stats.myCommunitiesCount}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
              <Card size="small">
                <Statistic
                  title="Públicas"
                  value={stats.publicCount}
                  prefix={<GlobalOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
              <Card size="small">
                <Statistic
                  title="Privadas"
                  value={stats.privateCount}
                  prefix={<LockOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8}>
                <Search
                  placeholder="Pesquisar comunidades..."
                  value={filters.search}
                  onChange={(e) => updateFilters('search', e.target.value)}
                  onSearch={(value) => updateFilters('search', value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  placeholder="Visibilidade"
                  value={filters.is_public}
                  onChange={(value) => updateFilters('is_public', value)}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value={true}>
                    <Space>
                      <GlobalOutlined />
                      Públicas
                    </Space>
                  </Option>
                  <Option value={false}>
                    <Space>
                      <LockOutlined />
                      Privadas
                    </Space>
                  </Option>
                </Select>
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  value={filters.ordering}
                  onChange={(value) => updateFilters('ordering', value)}
                  style={{ width: '100%' }}
                >
                  <Option value="-created_at">Mais Recentes</Option>
                  <Option value="created_at">Mais Antigas</Option>
                  <Option value="name">Nome A-Z</Option>
                  <Option value="-name">Nome Z-A</Option>
                  <Option value="-member_count">Mais Membros</Option>
                </Select>
              </Col>
              <Col xs={24} sm={8}>
                <Space>
                  <Tooltip title="Atualizar">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={loadCommunities}
                      loading={loading}
                    />
                  </Tooltip>
                  <Tooltip title="Limpar filtros">
                    <Button
                      icon={<FilterOutlined />}
                      onClick={resetFilters}
                    >
                      Limpar
                    </Button>
                  </Tooltip>
                </Space>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={filters.only_member ? 'my' : 'all'}
          onChange={(key) => updateFilters('only_member', key === 'my')}
          items={[
            {
              key: 'all',
              label: (
                <Badge count={stats.total} showZero>
                  <span style={{ marginRight: 8 }}>Todas</span>
                </Badge>
              ),
            },
            {
              key: 'my',
              label: (
                <Badge count={stats.myCommunitiesCount} showZero>
                  <span style={{ marginRight: 8 }}>Minhas</span>
                </Badge>
              ),
            },
          ]}
        />

        {/* Communities Grid */}
        <div style={{ marginTop: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Carregando comunidades...</Text>
              </div>
            </div>
          ) : communities.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                filters.search || filters.is_public !== undefined || filters.only_member
                  ? 'Nenhuma comunidade encontrada com os filtros aplicados'
                  : 'Nenhuma comunidade encontrada'
              }
              style={{ padding: '40px 0' }}
            >
              {!filters.search && !filters.only_member && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                  Criar a Primeira Comunidade
                </Button>
              )}
            </Empty>
          ) : (
            <div
              className="communities-board-responsive"
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 16,
                overflowX: 'auto',
                paddingBottom: 8,
                scrollbarWidth: 'thin',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {communities.map((community) => (
                <div
                  key={community.id}
                  className="community-card-responsive"
                  style={{
                    minWidth: 300,
                    maxWidth: 340,
                    flex: '0 0 auto',
                  }}
                >
                  <CommunityCard
                    community={community}
                    onJoin={handleJoinCommunity}
                    onLeave={handleLeaveCommunity}
                    onEdit={openEditModal}
                    onView={handleViewCommunity}
                  />
                </div>
              ))}
            </div>
          )}

        {/* Create/Edit Modal */}
        <CommunityModal
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingCommunity(undefined);
          }}
          onSubmit={editingCommunity 
            ? (data) => handleEditCommunity(data as CommunityUpdateData)
            : (data) => handleCreateCommunity(data as CommunityCreateData)
          }
          community={editingCommunity}
          loading={modalLoading}
          mode={editingCommunity ? 'edit' : 'create'}
        />
      </div>
    </MainLayout>
  );
};

export default CommunitiesPage;
