import React, { useState, useEffect } from 'react';
import {
  Modal,
  List,
  Avatar,
  Tag,
  Button,
  Input,
  Select,
  Popconfirm,
  message,
  Empty,
  Space,
  Tooltip,
  Spin,
} from 'antd';
import {
  UserOutlined,
  CrownOutlined,
  SafetyOutlined,
  CloseOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import {
  fetchRoomMembers,
  addRoomMember,
  removeRoomMember,
  changeMemberRole,
} from '../../redux/slices/chatSlice';
import type { ChatRoomMember } from '../../redux/slices/chatSlice';

interface MembersModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
}

const MembersModal: React.FC<MembersModalProps> = ({ visible, onClose, roomId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentRoom } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'moderator' | 'admin'>('member');

  // Get current user's role
  const currentUserMember = currentRoom?.members?.find(m => m.user.id === user?.id);
  const isAdmin = currentUserMember?.role === 'admin';
  const isModerator = currentUserMember?.role === 'moderator';
  const canManageMembers = isAdmin || isModerator;

  useEffect(() => {
    if (visible && roomId) {
      loadMembers();
    }
  }, [visible, roomId]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      await dispatch(fetchRoomMembers(roomId)).unwrap();
    } catch (error: any) {
      message.error(error?.message || 'Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      message.warning('Digite o email do usuário');
      return;
    }

    setLoading(true);
    try {
      // Aqui você precisaria ter um endpoint para buscar usuário por email
      // Por enquanto, vamos simular que o email é o ID do usuário
      await dispatch(addRoomMember({
        roomId,
        userId: newMemberEmail, // Temporário: assumir que email = userId
        role: newMemberRole,
      })).unwrap();
      
      message.success('Membro adicionado com sucesso!');
      setNewMemberEmail('');
      setNewMemberRole('member');
      setShowAddMember(false);
    } catch (error: any) {
      message.error(error?.message || 'Erro ao adicionar membro');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (member: ChatRoomMember) => {
    setLoading(true);
    try {
      await dispatch(removeRoomMember({
        roomId,
        userId: String(member.user.id),
      })).unwrap();
      
      message.success(`${member.user.username} foi removido`);
    } catch (error: any) {
      message.error(error?.message || 'Erro ao remover membro');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (member: ChatRoomMember, newRole: 'admin' | 'moderator' | 'member') => {
    setLoading(true);
    try {
      await dispatch(changeMemberRole({
        roomId,
        userId: String(member.user.id),
        role: newRole,
      })).unwrap();
      
      message.success(`Papel de ${member.user.username} alterado para ${getRoleLabel(newRole)}`);
    } catch (error: any) {
      message.error(error?.message || 'Erro ao alterar papel');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <CrownOutlined />;
      case 'moderator':
        return <SafetyOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderador';
      default:
        return 'Membro';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'gold';
      case 'moderator':
        return 'blue';
      default:
        return 'default';
    }
  };

  const filteredMembers = currentRoom?.members?.filter(member =>
    member.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          <span>Membros da Sala</span>
          <Tag color="blue">{currentRoom?.participant_count || 0}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="members-modal"
    >
      <Spin spinning={loading}>
        {/* Search and Add */}
        <div className="mb-4">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Search */}
            <Input
              placeholder="Buscar membros..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />

            {/* Add Member Button */}
            {canManageMembers && !showAddMember && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setShowAddMember(true)}
                block
              >
                Adicionar Membro
              </Button>
            )}

            {/* Add Member Form */}
            {showAddMember && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="Email ou ID do usuário"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    onPressEnter={handleAddMember}
                  />
                  <Select
                    style={{ width: '100%' }}
                    value={newMemberRole}
                    onChange={setNewMemberRole}
                    options={[
                      { value: 'member', label: 'Membro' },
                      { value: 'moderator', label: 'Moderador' },
                      ...(isAdmin ? [{ value: 'admin' as const, label: 'Admin' }] : []),
                    ]}
                  />
                  <Space>
                    <Button type="primary" onClick={handleAddMember} size="small">
                      Adicionar
                    </Button>
                    <Button onClick={() => setShowAddMember(false)} size="small">
                      Cancelar
                    </Button>
                  </Space>
                </Space>
              </div>
            )}
          </Space>
        </div>

        {/* Members List */}
        <List
          dataSource={filteredMembers}
          locale={{ emptyText: <Empty description="Nenhum membro encontrado" /> }}
          renderItem={(member) => {
            const isCurrentUser = member.user.id === user?.id;
            const canRemoveThisMember = isAdmin || (isModerator && member.role === 'member');
            const canChangeRole = isAdmin;

            return (
              <List.Item
                actions={[
                  // Change Role (only admin)
                  canChangeRole && !isCurrentUser && (
                    <Select
                      size="small"
                      value={member.role}
                      onChange={(newRole) => handleChangeRole(member, newRole)}
                      style={{ width: 120 }}
                      disabled={loading}
                    >
                      <Select.Option value="member">Membro</Select.Option>
                      <Select.Option value="moderator">Moderador</Select.Option>
                      <Select.Option value="admin">Admin</Select.Option>
                    </Select>
                  ),
                  // Remove Member
                  canRemoveThisMember && !isCurrentUser && (
                    <Popconfirm
                      title="Remover membro?"
                      description={`Tem certeza que deseja remover ${member.user.username}?`}
                      onConfirm={() => handleRemoveMember(member)}
                      okText="Sim"
                      cancelText="Não"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<CloseOutlined />}
                        disabled={loading}
                      >
                        Remover
                      </Button>
                    </Popconfirm>
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size="large"
                      style={{
                        backgroundColor: member.is_online ? '#52c41a' : '#d9d9d9',
                      }}
                    >
                      {member.user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <span className="font-medium">
                        {member.user.full_name || member.user.username}
                      </span>
                      {isCurrentUser && <Tag color="green">Você</Tag>}
                      <Tooltip title={member.is_online ? 'Online' : 'Offline'}>
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            member.is_online ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </Tooltip>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {member.user.email || member.user.username}
                      </span>
                      <Tag
                        icon={getRoleIcon(member.role)}
                        color={getRoleColor(member.role)}
                      >
                        {getRoleLabel(member.role)}
                      </Tag>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Spin>
    </Modal>
  );
};

export default MembersModal;
