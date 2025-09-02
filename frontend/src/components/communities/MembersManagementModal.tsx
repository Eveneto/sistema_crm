import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Input,
  Select,
  Form,
  Space,
  message,
  Popconfirm,
  Tag,
  Avatar,
  Typography,
  Divider,
} from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  CrownOutlined,
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Community, CommunityMember } from '../../types/community';
import communitiesApi from '../../services/communitiesApi';
import { format } from 'date-fns';

const { Text } = Typography;
const { Option } = Select;

interface MembersManagementModalProps {
  visible: boolean;
  onCancel: () => void;
  community: Community;
  onMembersUpdated: () => void;
}

const MembersManagementModal: React.FC<MembersManagementModalProps> = ({
  visible,
  onCancel,
  community,
  onMembersUpdated,
}) => {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteForm] = Form.useForm();
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (visible) {
      loadMembers();
    }
  }, [visible, community.id]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await communitiesApi.getCommunityMembers(community.id);
      setMembers(data.results || []);
    } catch (error) {
      console.error('Error loading members:', error);
      message.error('Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (values: { email: string; role: string }) => {
    try {
      setInviting(true);
      await communitiesApi.inviteMember(community.id, {
        user_email: values.email,
        role: values.role,
      });
      message.success('Membro convidado com sucesso!');
      inviteForm.resetFields();
      loadMembers();
      onMembersUpdated();
    } catch (error: any) {
      console.error('Error inviting member:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Erro ao convidar membro';
      message.error(errorMsg);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await communitiesApi.removeMember(community.id, memberId);
      message.success('Membro removido com sucesso!');
      loadMembers();
      onMembersUpdated();
    } catch (error: any) {
      console.error('Error removing member:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Erro ao remover membro';
      message.error(errorMsg);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    try {
      await communitiesApi.updateMemberRole(community.id, memberId, { role: newRole });
      message.success('Função alterada com sucesso!');
      loadMembers();
      onMembersUpdated();
    } catch (error: any) {
      console.error('Error changing role:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Erro ao alterar função';
      message.error(errorMsg);
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

  const currentUserEmail = localStorage.getItem('user_email');
  const isCurrentUserAdmin = members.find(m => m.user.email === currentUserEmail)?.role === 'admin';

  const columns = [
    {
      title: 'Membro',
      key: 'member',
      render: (_: any, record: CommunityMember) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{record.user.full_name || record.user.email}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.user.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Função',
      dataIndex: 'role',
      key: 'role',
      render: (role: 'admin' | 'moderator' | 'member', record: CommunityMember) => (
        <Select
          value={role}
          style={{ width: 120 }}
          disabled={!isCurrentUserAdmin || record.user.email === currentUserEmail}
          onChange={(newRole: 'admin' | 'moderator' | 'member') => handleChangeRole(record.id, newRole)}
        >
          <Option value="member">
            <Space>
              <TeamOutlined />
              Membro
            </Space>
          </Option>
          <Option value="moderator">
            <Space>
              <UserOutlined />
              Moderador
            </Space>
          </Option>
          <Option value="admin">
            <Space>
              <CrownOutlined />
              Admin
            </Space>
          </Option>
        </Select>
      ),
    },
    {
      title: 'Entrada',
      dataIndex: 'joined_at',
      key: 'joined_at',
      render: (date: string) => format(new Date(date), 'dd/MM/yyyy'),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: CommunityMember) => {
        const canRemove = isCurrentUserAdmin && 
                         record.user.email !== currentUserEmail &&
                         !(record.role === 'admin' && members.filter(m => m.role === 'admin').length === 1);
        
        return (
          <Space>
            {canRemove && (
              <Popconfirm
                title="Remover membro"
                description="Tem certeza que deseja remover este membro?"
                onConfirm={() => handleRemoveMember(record.id)}
                okText="Sim"
                cancelText="Não"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Modal
      title={`Gerenciar Membros - ${community.name}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Formulário para convidar membro */}
        {isCurrentUserAdmin && (
          <>
            <div>
              <Text strong>Convidar Novo Membro</Text>
              <Form
                form={inviteForm}
                layout="inline"
                onFinish={handleInviteMember}
                style={{ marginTop: 8 }}
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Email obrigatório' },
                    { type: 'email', message: 'Email inválido' }
                  ]}
                >
                  <Input
                    placeholder="Email do novo membro"
                    prefix={<UserAddOutlined />}
                    style={{ width: 250 }}
                  />
                </Form.Item>
                <Form.Item
                  name="role"
                  initialValue="member"
                  rules={[{ required: true }]}
                >
                  <Select style={{ width: 120 }}>
                    <Option value="member">Membro</Option>
                    <Option value="moderator">Moderador</Option>
                    <Option value="admin">Admin</Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={inviting}
                    icon={<UserAddOutlined />}
                  >
                    Convidar
                  </Button>
                </Form.Item>
              </Form>
            </div>
            <Divider />
          </>
        )}

        {/* Lista de membros */}
        <div>
          <Text strong>Membros Atuais ({members.length})</Text>
          <Table
            columns={columns}
            dataSource={members}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            style={{ marginTop: 8 }}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default MembersManagementModal;
