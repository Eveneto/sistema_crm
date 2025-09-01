import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Tag } from 'antd';
import { Task, CreateTaskData } from '../../services/kanbanApi';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface TaskModalProps {
  open: boolean;
  task: Task | null;
  onCancel: () => void;
  onSubmit: (data: CreateTaskData) => void;
  loading?: boolean;
}

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'green' },
  { value: 'medium', label: 'Média', color: 'orange' },
  { value: 'high', label: 'Alta', color: 'red' },
  { value: 'urgent', label: 'Urgente', color: 'purple' },
];

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  task,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date ? dayjs(task.due_date) : null,
        assigned_to_id: task.assigned_to?.id,
        labels: task.labels || [],
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, task, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: CreateTaskData = {
        title: values.title,
        description: values.description || '',
        priority: values.priority,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD HH:mm:ss') : undefined,
        assigned_to_id: values.assigned_to_id,
        labels: values.labels || [],
      };
      onSubmit(data);
    } catch (error) {
      console.error('Erro na validação:', error);
    }
  };

  const handleAddLabel = (inputValue: string) => {
    const currentLabels = form.getFieldValue('labels') || [];
    if (inputValue && !currentLabels.includes(inputValue)) {
      form.setFieldValue('labels', [...currentLabels, inputValue]);
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const currentLabels = form.getFieldValue('labels') || [];
    form.setFieldValue('labels', currentLabels.filter((label: string) => label !== labelToRemove));
  };

  return (
    <Modal
      title={task ? 'Editar Task' : 'Nova Task'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: 'medium',
          labels: [],
        }}
      >
        <Form.Item
          name="title"
          label="Título"
          rules={[{ required: true, message: 'Título é obrigatório' }]}
        >
          <Input placeholder="Digite o título da task" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
        >
          <TextArea
            rows={3}
            placeholder="Descreva a task (opcional)"
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="priority"
            label="Prioridade"
            style={{ flex: 1 }}
          >
            <Select placeholder="Selecione a prioridade">
              {priorityOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <Tag color={option.color}>{option.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="due_date"
            label="Data de Vencimento"
            style={{ flex: 1 }}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Selecione a data"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="assigned_to_id"
          label="Responsável"
        >
          <Select
            placeholder="Selecione um responsável (opcional)"
            allowClear
          >
            {/* Aqui você precisará carregar a lista de usuários */}
            <Option value={1}>Usuário 1</Option>
            <Option value={2}>Usuário 2</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="labels"
          label="Labels"
        >
          <Select
            mode="tags"
            placeholder="Digite e pressione Enter para adicionar labels"
            style={{ width: '100%' }}
            onInputKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  handleAddLabel(input.value.trim());
                  input.value = '';
                }
              }
            }}
            tagRender={(props) => (
              <Tag
                {...props}
                closable
                onClose={() => handleRemoveLabel(props.value as string)}
                style={{ marginRight: 4, marginBottom: 4 }}
              >
                {props.label}
              </Tag>
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskModal;
