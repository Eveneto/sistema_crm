import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Badge,
  Alert,
  Spinner,
  Dropdown,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext';
import MainLayoutBootstrap from '../components/layout/MainLayoutBootstrap';
import toastService from '../services/toastService';
import api from '../services/api';

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
  updated_at: string;
}

interface CompanyStats {
  total: number;
  new_this_month: number;
  active: number;
  inactive: number;
}

const CompaniesPageBootstrap: React.FC = () => {
  const { themeMode } = useTheme();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<CompanyStats>({
    total: 0,
    new_this_month: 0,
    active: 0,
    inactive: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    size: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchCompanies();
    fetchStats();
  }, []);

  const fetchCompanies = async (search?: string) => {
    try {
      setLoading(true);
      let url = '/api/companies/companies/';
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      
      const response = await api.get(url);
      const companiesData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setCompanies(companiesData);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toastService.error('Erro ao carregar empresas');
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
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        fetchCompanies(value);
      } else {
        fetchCompanies();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const showModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        industry: company.industry || '',
        size: company.size || '',
        address: company.address || '',
        notes: company.notes || ''
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        website: '',
        industry: '',
        size: '',
        address: '',
        notes: ''
      });
    }
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingCompany(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      website: '',
      industry: '',
      size: '',
      address: '',
      notes: ''
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCompany) {
        // Update company
        await api.put(`/api/companies/companies/${editingCompany.id}/`, formData);
        toastService.success('Empresa atualizada com sucesso!');
      } else {
        // Create new company
        await api.post('/api/companies/companies/', formData);
        toastService.success('Empresa criada com sucesso!');
      }
      
      handleModalClose();
      fetchCompanies();
      fetchStats();
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar empresa';
      toastService.error('Erro', errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await api.delete(`/api/companies/companies/${id}/`);
        toastService.success('Empresa excluída com sucesso!');
        fetchCompanies();
        fetchStats();
      } catch (error: any) {
        console.error('Erro ao excluir empresa:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao excluir empresa';
        toastService.error('Erro', errorMessage);
      }
    }
  };

  const getIndustryBadgeVariant = (industry?: string) => {
    const variants = {
      'Tecnologia': 'primary',
      'Saúde': 'success',
      'Educação': 'info',
      'Financeiro': 'warning',
      'Varejo': 'secondary'
    };
    return variants[industry as keyof typeof variants] || 'outline-secondary';
  };

  const getSizeBadgeVariant = (size?: string) => {
    const variants = {
      'Pequena': 'light',
      'Média': 'primary',
      'Grande': 'success'
    };
    return variants[size as keyof typeof variants] || 'outline-secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = companies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(companies.length / itemsPerPage);

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <Button
                variant={currentPage === page ? 'primary' : 'outline-primary'}
                size="sm"
                className="mx-1"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <MainLayoutBootstrap>
      <Container fluid>
        {/* Page Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="display-6 fw-bold text-primary mb-1">
                  <span className="me-3">🏢</span>
                  Empresas
                </h1>
                <p className="text-muted mb-0">Gerencie empresas do seu CRM</p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => showModal()}
                className="d-flex align-items-center"
              >
                <span className="me-2">➕</span>
                Nova Empresa
              </Button>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px' }}
                    >
                      🏢
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.total}</div>
                    <div className="text-muted small">Total de Empresas</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px' }}
                    >
                      📈
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.new_this_month}</div>
                    <div className="text-muted small">Novas este Mês</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px' }}
                    >
                      ✅
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.active}</div>
                    <div className="text-muted small">Ativas</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px' }}
                    >
                      ⏸️
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.inactive}</div>
                    <div className="text-muted small">Inativas</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search and Actions */}
        <Row className="mb-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Pesquisar empresas..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>
          </Col>
          <Col md={6} className="d-flex justify-content-end">
            <span className="text-muted small align-self-center">
              {companies.length} empresa(s) encontrada(s)
            </span>
          </Col>
        </Row>

        {/* Companies Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <div className="mt-2">Carregando empresas...</div>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-5">
                <div className="display-1 text-muted mb-3">🏢</div>
                <h5>Nenhuma empresa encontrada</h5>
                <p className="text-muted">
                  {searchTerm ? 'Tente ajustar os filtros de pesquisa' : 'Comece criando sua primeira empresa'}
                </p>
                {!searchTerm && (
                  <Button variant="primary" onClick={() => showModal()}>
                    <span className="me-2">➕</span>
                    Criar Primeira Empresa
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Empresa</th>
                        <th>Contato</th>
                        <th>Setor</th>
                        <th>Tamanho</th>
                        <th>Criado em</th>
                        <th className="text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCompanies.map((company) => (
                        <tr key={company.id}>
                          <td>
                            <div>
                              <div className="fw-bold">{company.name}</div>
                              {company.website && (
                                <small className="text-muted">
                                  <span className="me-1">🌐</span>
                                  {company.website}
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              {company.email && (
                                <div className="small">
                                  <span className="me-1">📧</span>
                                  {company.email}
                                </div>
                              )}
                              {company.phone && (
                                <div className="small">
                                  <span className="me-1">📞</span>
                                  {company.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {company.industry && (
                              <Badge bg={getIndustryBadgeVariant(company.industry)}>
                                {company.industry}
                              </Badge>
                            )}
                          </td>
                          <td>
                            {company.size && (
                              <Badge bg={getSizeBadgeVariant(company.size)}>
                                {company.size}
                              </Badge>
                            )}
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(company.created_at)}
                              {company.created_by_name && (
                                <div>por {company.created_by_name}</div>
                              )}
                            </small>
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-1">
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Editar empresa</Tooltip>}
                              >
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => showModal(company)}
                                >
                                  ✏️
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Excluir empresa</Tooltip>}
                              >
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(company.id)}
                                >
                                  🗑️
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                
                {/* Pagination */}
                <div className="p-3 border-top">
                  <Pagination />
                </div>
              </>
            )}
          </Card.Body>
        </Card>

        {/* Create/Edit Modal */}
        <Modal show={modalVisible} onHide={handleModalClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome da Empresa *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      placeholder="Digite o nome da empresa"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="contato@empresa.com"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="(11) 99999-9999"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleFormChange}
                      placeholder="https://www.empresa.com"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Setor</Form.Label>
                    <Form.Select
                      name="industry"
                      value={formData.industry}
                      onChange={handleFormChange}
                    >
                      <option value="">Selecione o setor</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Saúde">Saúde</option>
                      <option value="Educação">Educação</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Varejo">Varejo</option>
                      <option value="Manufatura">Manufatura</option>
                      <option value="Serviços">Serviços</option>
                      <option value="Outro">Outro</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tamanho</Form.Label>
                    <Form.Select
                      name="size"
                      value={formData.size}
                      onChange={handleFormChange}
                    >
                      <option value="">Selecione o tamanho</option>
                      <option value="Pequena">Pequena (1-50 funcionários)</option>
                      <option value="Média">Média (51-500 funcionários)</option>
                      <option value="Grande">Grande (500+ funcionários)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Endereço</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Endereço completo da empresa"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Observações</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Observações sobre a empresa..."
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleModalClose}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {editingCompany ? 'Atualizar' : 'Criar'} Empresa
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </MainLayoutBootstrap>
  );
};

export default CompaniesPageBootstrap;
