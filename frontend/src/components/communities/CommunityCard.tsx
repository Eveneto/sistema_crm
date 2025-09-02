import React from 'react';
import { Card, Tag, Avatar, Button, Space, Typography, Tooltip } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Community } from '../../types/community';

const { Text, Title } = Typography;

// Função simples para formatar tempo relativo
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 1) return 'agora';
  if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  if (diffInDays < 7) return `${diffInDays}d atrás`;
  if (diffInWeeks < 4) return `${diffInWeeks}sem atrás`;
  if (diffInMonths < 12) return `${diffInMonths}mes atrás`;
  return `${diffInYears}ano${diffInYears > 1 ? 's' : ''} atrás`;
};

interface CommunityCardProps {
  community: Community;
  onJoin?: (community: Community) => void;
  onLeave?: (community: Community) => void;
  onEdit?: (community: Community) => void;
  onView?: (community: Community) => void;
  loading?: boolean;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  onJoin,
  onLeave,
  onEdit,
  onView,
  loading = false,
}) => {
  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
        return <CrownOutlined style={{ color: '#f39c12' }} />;
      case 'moderator':
        return <SafetyCertificateOutlined style={{ color: '#3498db' }} />;
      default:
        return <UserOutlined style={{ color: '#95a5a6' }} />;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'gold';
      case 'moderator':
        return 'blue';
      default:
        return 'default';
    }
  };

  const canEdit = community.user_role === 'admin' || community.user_role === 'moderator';

  return (
    <Card
      loading={loading}
      hoverable
      actions={[
        ...(community.is_member ? [
          <Tooltip title="Sair da comunidade" key="leave">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => onLeave?.(community)}
              danger
            >
              Sair
            </Button>
          </Tooltip>
        ] : [
          <Tooltip title="Entrar na comunidade" key="join">
            <Button
              type="text"
              icon={<LoginOutlined />}
              onClick={() => onJoin?.(community)}
            >
              Entrar
            </Button>
          </Tooltip>
        ]),
        <Tooltip title="Ver detalhes" key="view">
          <Button
            type="text"
            icon={<TeamOutlined />}
            onClick={() => onView?.(community)}
          >
            Ver
          </Button>
        </Tooltip>,
        ...(canEdit ? [
          <Tooltip title="Configurações" key="edit">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => onEdit?.(community)}
            >
              Config
            </Button>
          </Tooltip>
        ] : []),
      ]}
    >
      <Card.Meta
        avatar={
          <Avatar
            size={64}
            icon={<TeamOutlined />}
            style={{
              backgroundColor: community.is_public ? '#52c41a' : '#1890ff',
            }}
          />
        }
        title={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Title level={4} style={{ margin: 0 }}>
                {community.name}
              </Title>
              <Space>
                {community.is_public ? (
                  <Tooltip title="Comunidade pública">
                    <GlobalOutlined style={{ color: '#52c41a' }} />
                  </Tooltip>
                ) : (
                  <Tooltip title="Comunidade privada">
                    <LockOutlined style={{ color: '#faad14' }} />
                  </Tooltip>
                )}
                {community.requires_approval && (
                  <Tooltip title="Requer aprovação">
                    <ClockCircleOutlined style={{ color: '#faad14' }} />
                  </Tooltip>
                )}
              </Space>
            </div>
            
            <Space wrap>
              {community.is_member && (
                <Tag color={getRoleColor(community.user_role)} icon={getRoleIcon(community.user_role)}>
                  {community.user_role === 'admin' ? 'Administrador' :
                   community.user_role === 'moderator' ? 'Moderador' : 'Membro'}
                </Tag>
              )}
              {community.is_full && (
                <Tag color="red">
                  Lotada
                </Tag>
              )}
            </Space>
          </Space>
        }
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text type="secondary" ellipsis={{ tooltip: community.description }}>
              {community.description}
            </Text>
            
            <Space split={<Text type="secondary">•</Text>}>
              <Space>
                <TeamOutlined />
                <Text strong>{community.member_count}</Text>
                <Text type="secondary">
                  {community.member_count === 1 ? 'membro' : 'membros'}
                </Text>
              </Space>
              
              <Text type="secondary">
                Criada {formatTimeAgo(community.created_at)}
              </Text>
            </Space>
            
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Por {community.created_by.full_name || community.created_by.username}
              </Text>
            </div>
          </Space>
        }
      />
    </Card>
  );
};

export default CommunityCard;
