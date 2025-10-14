import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BuildOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  UserOutlined
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import MainLayout from '../components/layout/MainLayout';
import PageHeader from '../components/layout/PageHeader';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface Company {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: string;
  address?: string;
  notes?: string;
  contact_count: number;
  created_by_name?: string;
  created_at: string;
}

interface CompanyStats {
  total_companies: number;
  by_size: { [key: string]: { label: string; count: number } };
  by_industry: { [key: string]: number };
  recent_companies: number;
}

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup' },
  { value: 'small', label: 'Small (1-50)' },
  { value: 'medium', label: 'Medium (51-200)' },
  { value: 'large', label: 'Large (201-1000)' },
  { value: 'enterprise', label: 'Enterprise (1000+)' },
];

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();

  // Carregar empresas e estatísticas
  useEffect(() => {
    fetchCompanies();
    fetchStats();
  }, []);

  const fetchCompanies = async (search?: string) => {
    try {
      setLoading(true);
      const endpoint = search 
        ? `/api/companies/companies/search/?q=${encodeURIComponent(search)}`
        : '/api/companies/companies/';
      
      const response = await api.get(endpoint);
      
      let companiesData = [];
      if (search && response.data.results) {
        companiesData = response.data.results;
      } else if (response.data.results) {
        companiesData = response.data.results;
      } else {
        companiesData = Array.isArray(response.data) ? response.data : [];
      }
      
      setCompanies(companiesData);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/companies/companies/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Ignore stats error for now, not critical
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      fetchCompanies(value);
    } else {
      fetchCompanies();
    }
  };

  const showModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      form.setFieldsValue(company);
    } else {
      setEditingCompany(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingCompany(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCompany) {
        // Atualizar empresa
        console.log('🔧 Atualizando empresa ID:', editingCompany.id);
        console.log('📦 Dados enviados:', values);
        
        const response = await api.patch(`/api/companies/companies/${editingCompany.id}/`, values);
        console.log('✅ Resposta do UPDATE:', response.data);
        
        // PROBLEMA POTENCIAL: response.data do PATCH não inclui id completo
        // Vamos usar os dados da empresa existente + novos dados
        const updatedCompany = { ...editingCompany, ...response.data };
        
        setCompanies(companies.map(c => c.id === editingCompany.id ? updatedCompany : c));
        message.success('Empresa atualizada com sucesso!');
      } else {
        // Criar nova empresa
        console.log('➕ Criando nova empresa');
        console.log('📦 Dados enviados:', values);
        
        const response = await api.post('/api/companies/companies/', values);
        console.log('✅ Resposta do CREATE:', response.data);
        
        setCompanies([response.data, ...companies]);
        message.success('Empresa criada com sucesso!');
      }
      
      setModalVisible(false);
      setEditingCompany(null);
      form.resetFields();
      fetchStats(); // Atualizar estatísticas
    } catch (error: any) {
      console.error('❌ Erro ao salvar empresa:', error);
      console.error('📋 Erro completo:', error.response?.data);
      if (error.response?.data) {
        const errorData = error.response.data;
        Object.keys(errorData).forEach(field => {
          message.error(`${field}: ${errorData[field]}`);
        });
      } else {
        message.error('Erro ao salvar empresa');
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Validação importante para evitar IDs inválidos
      if (!id || id === undefined || id === null) {
        message.error('ID da empresa é inválido');
        return;
      }
      
      await api.delete(`/api/companies/companies/${id}/`);
      setCompanies(companies.filter(c => c.id !== id));
      message.success('Empresa excluída com sucesso!');
      fetchStats(); // Atualizar estatísticas
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      message.error('Erro ao excluir empresa');
    }
  };

  const getSizeColor = (size?: string) => {
    const colors: { [key: string]: string } = {
      startup: 'blue',
      small: 'green',
      medium: 'orange',
      large: 'purple',
      enterprise: 'red'
    };
    return colors[size || ''] || 'default';
  };

  const getSizeLabel = (size?: string) => {
    if (!size) return '-';
    const sizeObj = COMPANY_SIZES.find(s => s.value === size);
    return sizeObj?.label || size;
  };

  const columns: ColumnsType<Company> = [
    {
      title: 'Empresa',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Company) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size="small" icon={<BuildOutlined />} />
            <Text strong>{name}</Text>
          </div>
          {record.industry && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.industry}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Contato',
      key: 'contact',
      render: (_, record: Company) => (
        <div>
          {record.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <MailOutlined style={{ fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{record.email}</Text>
            </div>
          )}
          {record.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <PhoneOutlined style={{ fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{record.phone}</Text>
            </div>
          )}
          {record.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <GlobalOutlined style={{ fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{record.website}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Tamanho',
      dataIndex: 'size',
      key: 'size',
      render: (size: string) => size ? (
        <Tag color={getSizeColor(size)}>{getSizeLabel(size)}</Tag>
      ) : '-',
    },
    {
      title: 'Contatos',
      dataIndex: 'contact_count',
      key: 'contact_count',
      render: (count: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <UserOutlined />
          <span>{count}</span>
        </div>
      ),
    },
    {
      title: 'Criado por',
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      render: (name: string) => name || '-',
    },
    {
      title: 'Data',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record: Company) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
            data-testid={`edit-company-${record.id}`}
          />
          <Popconfirm
            title="Excluir empresa"
            description="Tem certeza que deseja excluir esta empresa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
            data-testid={`delete-confirm-${record.id}`}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              data-testid={`delete-company-${record.id}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Empresas"
        subtitle="Gerencie sua carteira de clientes e prospects"
        actions={[
          <Button
            key="new-company"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            data-testid="new-company-button"
          >
            Nova Empresa
          </Button>
        ]}
      />

      {/* Estatísticas */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total de Empresas"
                value={stats.total_companies}
                prefix={<BuildOutlined />}
                data-testid="total-companies"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pequenas"
                value={stats.by_size?.small?.count || 0}
                prefix={<BuildOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Médias"
                value={stats.by_size?.medium?.count || 0}
                prefix={<BuildOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Grandes"
                value={(stats.by_size?.large?.count || 0) + (stats.by_size?.enterprise?.count || 0)}
                prefix={<BuildOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Controles */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input.Search
              placeholder="Buscar empresas..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
              style={{ maxWidth: 400 }}
              prefix={<SearchOutlined />}
              data-testid="companies-search-input"
            />
          </Col>
        </Row>
      </Card>

      {/* Tabela ou Cards (responsivo) */}
      {window.innerWidth > 700 ? (
        <Card>
          <Table
            columns={columns}
            dataSource={companies}
            rowKey="id"
            loading={loading}
            data-testid="companies-table"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total: ${total} empresas`,
            }}
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {companies.map(company => (
            <Card key={company.id} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar size="large" icon={<BuildOutlined />} />
                <div>
                  <Text strong>{company.name}</Text>
                  {company.industry && (
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>{company.industry}</Text>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                {company.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MailOutlined style={{ fontSize: 12 }} />
                    <Text style={{ fontSize: 12 }}>{company.email}</Text>
                  </div>
                )}
                {company.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <PhoneOutlined style={{ fontSize: 12 }} />
                    <Text style={{ fontSize: 12 }}>{company.phone}</Text>
                  </div>
                )}
                {company.website && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <GlobalOutlined style={{ fontSize: 12 }} />
                    <Text style={{ fontSize: 12 }}>{company.website}</Text>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Tag color={getSizeColor(company.size)}>{getSizeLabel(company.size)}</Tag>
                <span><UserOutlined /> {company.contact_count}</span>
                <span>{company.created_by_name || '-'}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criar/Editar */}
      <Modal
        title={editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
        data-testid="company-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          data-testid="company-form"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nome da Empresa"
                rules={[
                  { required: true, message: 'Nome é obrigatório' },
                  { min: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                ]}
              >
                <Input placeholder="Ex: Acme Corporation" data-testid="company-name-input" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="industry"
                label="Setor"
              >
                <Input placeholder="Ex: Tecnologia, Saúde, Educação" data-testid="company-industry-input" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Email inválido' }
                ]}
              >
                <Input placeholder="contato@empresa.com" data-testid="company-email-input" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Telefone"
              >
                <Input placeholder="(11) 99999-9999" data-testid="company-phone-input" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="website"
                label="Website"
              >
                <Input placeholder="https://empresa.com" data-testid="company-website-input" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="size"
                label="Tamanho"
              >
                <Select placeholder="Selecione o tamanho">
                  {COMPANY_SIZES.map(size => (
                    <Option key={size.value} value={size.value}>
                      {size.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Endereço"
          >
            <Input.TextArea 
              rows={2}
              placeholder="Endereço completo da empresa"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Observações"
          >
            <Input.TextArea 
              rows={3}
              placeholder="Informações adicionais sobre a empresa"
            />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default CompaniesPage;
