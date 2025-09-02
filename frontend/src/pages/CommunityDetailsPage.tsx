import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  message,
  Spin,
  Badge,
  List,
  Avatar,
  Space,
  Tooltip,
  Divider,
  Descriptions,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  TeamOutlined,
  UserOutlined,
  CrownOutlined,
  EditOutlined,
  LogoutOutlined,
  CalendarOutlined,
  GlobalOutlined,
  LockOutlined,
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import { Community, CommunityMember } from '../types/community';
import communitiesApi from '../services/communitiesApi';
import { firebaseTokenService } from '../services/firebaseTokenService';
import { format } from 'date-fns';
import CommunityModal from '../components/communities/CommunityModal';
import MembersManagementModal from '../components/communities/MembersManagementModal';

const { Title, Text, Paragraph } = Typography;

const CommunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  
  const currentUserId = localStorage.getItem('user_id');
  const userEmail = localStorage.getItem('user_email');

  useEffect(() => {
    if (id) {
      loadCommunityDetails();
    }
  }, [id]);

  const loadCommunityDetails = async () => {
    if (!id) {
      console.warn('⚠️ No community ID provided');
      return;
    }
    
    console.log('🏘️ Loading community details for ID:', id);
    
    try {
      setLoading(true);
      const communityData = await communitiesApi.getCommunity(id);
      console.log('✅ Community loaded:', communityData);
      setCommunity(communityData);
      await loadMembers();
    } catch (error: any) {
      console.error('❌ Erro ao carregar comunidade:', error);
      console.error('❌ Error details:', error.response?.data);
      message.error('Erro ao carregar detalhes da comunidade');
      navigate('/communities');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!id) {
      console.warn('⚠️ No community ID for loading members');
      return;
    }
    
    console.log('👥 Loading members for community:', id);
    
    try {
      setMembersLoading(true);
      const membersData = await communitiesApi.getCommunityMembers(id);
      console.log('✅ Members loaded:', membersData);
      setMembers(membersData.results || []);
    } catch (error: any) {
      console.error('❌ Erro ao carregar membros:', error);
      console.error('❌ Error details:', error.response?.data);
      message.error('Erro ao carregar membros da comunidade');
      // Não falhar completamente se não conseguir carregar membros
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!community) {
      console.warn('⚠️ Community not found for leave operation');
      return;
    }
    
    console.log('🚪 Attempting to leave community:', community.id, community.name);
    
    try {
      setLeaving(true);
      console.log('🔄 Calling API to leave community...');
      await communitiesApi.leaveCommunity(community.id);
      console.log('✅ Successfully left community');
      message.success('Você saiu da comunidade');
      navigate('/communities');
    } catch (error: any) {
      console.error('❌ Erro ao sair da comunidade:', error);
      console.error('❌ Error details:', error.response?.data);
      
      // Verificar se é erro de regra de negócio (admin único)
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.error || errorData?.detail || 'Erro desconhecido';
        
        if (errorMessage.includes('único administrador')) {
          message.warning(errorMessage);
        } else if (errorMessage.includes('Firebase') || errorMessage.includes('no kid claim')) {
          // Só tratar como erro de token se realmente for
          message.error('Erro de autenticação. Tente fazer login novamente.');
        } else {
          message.error(errorMessage);
        }
      } else {
        message.error('Erro ao sair da comunidade. Tente novamente.');
      }
    } finally {
      setLeaving(false);
    }
  };

  const handleCommunityUpdated = async (updatedData: any) => {
    if (!community) return;
    
    try {
      const updatedCommunity = await communitiesApi.updateCommunity(community.id, updatedData);
      setCommunity(updatedCommunity);
      setShowEditModal(false);
      message.success('Comunidade atualizada com sucesso!');
      loadCommunityDetails(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao atualizar comunidade:', error);
      message.error('Erro ao atualizar comunidade');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'moderator': return 'orange';
      case 'member': return 'blue';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <CrownOutlined />;
      case 'moderator': return <UserOutlined />;
      default: return <TeamOutlined />;
    }
  };

  const canEdit = community?.created_by?.id === Number(currentUserId);
  const currentUserMember = members?.find(m => m.user.email === userEmail);
  const isCreator = community?.created_by?.id === Number(currentUserId);
  
  // Verificação de admin - múltiplas formas para garantir que funcione
  const isAdmin = currentUserMember?.role === 'admin' || 
                 isCreator || 
                 (community?.created_by?.email === userEmail);
                 
  const isOnlyAdmin = currentUserMember?.role === 'admin' && 
                     members?.filter(m => m.role === 'admin').length === 1;
  const canLeave = currentUserMember && !isCreator && !isOnlyAdmin;

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!community) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text>Comunidade não encontrada</Text>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/communities')}
              >
                Voltar
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Community Info */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Title level={2} style={{ margin: 0 }}>
                      {!community.is_public ? <LockOutlined /> : <GlobalOutlined />}
                      {' '}
                      {community.name}
                    </Title>
                    <Text type="secondary">
                      Criada em {format(new Date(community.created_at), 'dd/MM/yyyy')}
                    </Text>
                  </div>
                  
                  <Space>
                    {canEdit && (
                      <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={() => setShowEditModal(true)}
                      >
                        Editar
                      </Button>
                    )}
                    {isAdmin && (
                      <Button 
                        icon={<TeamOutlined />}
                        onClick={() => setShowMembersModal(true)}
                      >
                        Gerenciar Membros
                      </Button>
                    )}
                    {canLeave && (
                      <Button 
                        danger 
                        icon={<LogoutOutlined />}
                        loading={leaving}
                        onClick={handleLeaveCommunity}
                      >
                        Sair
                      </Button>
                    )}
                    {currentUserMember && !canLeave && !canEdit && (
                      <Tooltip title={
                        isOnlyAdmin 
                          ? "Você é o único administrador. Promova outro membro primeiro." 
                          : "Criadores não podem sair da própria comunidade."
                      }>
                        <Button 
                          danger 
                          icon={<LogoutOutlined />}
                          disabled
                        >
                          Sair
                        </Button>
                      </Tooltip>
                    )}
                  </Space>
                </div>

                <Divider />

                <Descriptions column={1}>
                  <Descriptions.Item label="Descrição">
                    <Paragraph>{community.description}</Paragraph>
                  </Descriptions.Item>
                  <Descriptions.Item label="Privacidade">
                    <Tag color={!community.is_public ? 'red' : 'green'}>
                      {!community.is_public ? 'Privada' : 'Pública'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total de Membros">
                    <Badge count={community.member_count} style={{ backgroundColor: '#52c41a' }} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Criada por">
                    <Text>{community.created_by.full_name || community.created_by.email}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title={<><TeamOutlined /> Membros ({members?.length || 0})</>} loading={membersLoading}>
              <List
                dataSource={members || []}
                renderItem={(member) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<UserOutlined />}
                        />
                      }
                      title={
                        <Space>
                          {member.user.full_name || member.user.email}
                          <Tooltip title={`Função: ${member.role}`}>
                            <Tag 
                              color={getRoleColor(member.role)} 
                              icon={getRoleIcon(member.role)}
                            >
                              {member.role}
                            </Tag>
                          </Tooltip>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">{member.user.email}</Text>
                          <Text type="secondary">
                            <CalendarOutlined /> Entrou em {format(new Date(member.joined_at), 'dd/MM/yyyy')}
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

        {/* Edit Modal */}
        <CommunityModal
          visible={showEditModal}
          onCancel={() => setShowEditModal(false)}
          onSubmit={handleCommunityUpdated}
          community={community}
          mode="edit"
        />

        {/* Members Management Modal */}
        <MembersManagementModal
          visible={showMembersModal}
          onCancel={() => setShowMembersModal(false)}
          community={community}
          onMembersUpdated={() => {
            loadCommunityDetails();
            loadMembers();
          }}
        />
      </div>
    </MainLayout>
  );
};

export default CommunityDetailsPage;
