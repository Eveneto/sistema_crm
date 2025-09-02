import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, InputNumber, Space, Typography } from 'antd';
import { TeamOutlined, LockOutlined, GlobalOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Community, CommunityCreateData, CommunityUpdateData } from '../../types/community';

const { TextArea } = Input;
const { Text } = Typography;

interface CommunityModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: CommunityCreateData | CommunityUpdateData) => Promise<void>;
  community?: Community;
  loading?: boolean;
  mode: 'create' | 'edit';
}

const CommunityModal: React.FC<CommunityModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  community,
  loading = false,
  mode,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && community) {
        form.setFieldsValue({
          name: community.name,
          description: community.description,
          is_public: community.is_public,
          requires_approval: community.requires_approval,
          max_members: community.max_members,
        });
      } else {
        form.resetFields();
        // Set default values for create mode
        form.setFieldsValue({
          is_public: true,
          requires_approval: false,
        });
      }
    }
  }, [visible, community, mode, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const title = mode === 'create' ? 'Criar Nova Comunidade' : 'Editar Comunidade';

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          {title}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={mode === 'create' ? 'Criar' : 'Salvar'}
      cancelText="Cancelar"
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="Nome da Comunidade"
          rules={[
            { required: true, message: 'Por favor, insira o nome da comunidade' },
            { min: 3, message: 'O nome deve ter pelo menos 3 caracteres' },
            { max: 100, message: 'O nome deve ter no máximo 100 caracteres' },
          ]}
        >
          <Input
            placeholder="Ex: Desenvolvedores React"
            prefix={<TeamOutlined />}
            showCount
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
          rules={[
            { required: true, message: 'Por favor, insira uma descrição' },
            { min: 10, message: 'A descrição deve ter pelo menos 10 caracteres' },
            { max: 500, message: 'A descrição deve ter no máximo 500 caracteres' },
          ]}
        >
          <TextArea
            placeholder="Descreva o propósito e objetivos da comunidade..."
            rows={4}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          name="is_public"
          label="Visibilidade"
          valuePropName="checked"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Switch
              checkedChildren={<><GlobalOutlined /> Pública</>}
              unCheckedChildren={<><LockOutlined /> Privada</>}
            />
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.is_public !== currentValues.is_public}>
              {({ getFieldValue }) => {
                const isPublic = getFieldValue('is_public');
                return (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {isPublic
                      ? 'Qualquer pessoa pode ver e encontrar esta comunidade'
                      : 'Apenas membros podem ver esta comunidade'
                    }
                  </Text>
                );
              }}
            </Form.Item>
          </Space>
        </Form.Item>

        <Form.Item
          name="requires_approval"
          label="Aprovação de Membros"
          valuePropName="checked"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Switch
              checkedChildren={<><CheckCircleOutlined /> Requer Aprovação</>}
              unCheckedChildren="Entrada Livre"
            />
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.requires_approval !== currentValues.requires_approval}>
              {({ getFieldValue }) => {
                const requiresApproval = getFieldValue('requires_approval');
                return (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {requiresApproval
                      ? 'Novos membros precisam ser aprovados por moderadores'
                      : 'Qualquer pessoa pode entrar na comunidade diretamente'
                    }
                  </Text>
                );
              }}
            </Form.Item>
          </Space>
        </Form.Item>

        <Form.Item
          name="max_members"
          label="Limite de Membros (Opcional)"
          rules={[
            { type: 'number', min: 1, message: 'O limite deve ser pelo menos 1' },
            { type: 'number', max: 10000, message: 'O limite não pode exceder 10.000' },
          ]}
        >
          <InputNumber
            placeholder="Ex: 100"
            style={{ width: '100%' }}
            min={1}
            max={10000}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
          />
        </Form.Item>

        <div style={{ 
          padding: 16, 
          backgroundColor: '#f6f6f6', 
          borderRadius: 6, 
          border: '1px solid #d9d9d9' 
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <strong>Dica:</strong> Após criar a comunidade, você será automaticamente adicionado como administrador. 
            Você poderá convidar outros membros e designar moderadores através das configurações da comunidade.
          </Text>
        </div>
      </Form>
    </Modal>
  );
};

export default CommunityModal;
