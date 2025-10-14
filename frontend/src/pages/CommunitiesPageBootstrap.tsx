import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Alert
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MainLayoutBootstrap from '../components/layout/MainLayoutBootstrap';
import toastService from '../services/toastService';
import api from '../services/api';

interface Community {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  requires_approval: boolean;
  max_members?: number;
  member_count: number;
  is_member: boolean;
  is_admin: boolean;
  created_by_name: string;
  created_at: string;
}

interface CommunityStats {
  total: number;
  public_communities: number;
  private_communities: number;
  my_communities: number;
}

const CommunitiesPageBootstrap: React.FC = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    total: 0,
    public_communities: 0,
    private_communities: 0,
    my_communities: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true,
    requires_approval: false,
    max_members: ''
  });

  useEffect(() => {
    fetchCommunities();
    fetchStats();
  }, [showOnlyMine]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      let url = '/api/communities/communities/';
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (showOnlyMine) {
        params.append('only_member', 'true');
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      const communitiesData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setCommunities(communitiesData);
    } catch (error) {
      console.error('Erro ao carregar comunidades:', error);
      toastService.error('Erro ao carregar comunidades');
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/communities/communities/stats/');
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
      fetchCommunities();
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const showModal = (community?: Community) => {
    if (community) {
      setEditingCommunity(community);
      setFormData({
        name: community.name || '',
        description: community.description || '',
        is_public: community.is_public,
        requires_approval: community.requires_approval,
        max_members: community.max_members?.toString() || ''
      });
    } else {
      setEditingCommunity(null);
      setFormData({
        name: '',
        description: '',
        is_public: true,
        requires_approval: false,
        max_members: ''
      });
    }
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingCommunity(null);
    setFormData({
      name: '',
      description: '',
      is_public: true,
      requires_approval: false,
      max_members: ''
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        max_members: formData.max_members ? parseInt(formData.max_members) : null
      };

      if (editingCommunity) {
        // Update community
        await api.put(`/api/communities/communities/${editingCommunity.id}/`, submitData);
        toastService.success('Comunidade atualizada com sucesso!');
      } else {
        // Create new community
        await api.post('/api/communities/communities/', submitData);
        toastService.success('Comunidade criada com sucesso!');
      }
      
      handleModalClose();
      fetchCommunities();
      fetchStats();
    } catch (error: any) {
      console.error('Erro ao salvar comunidade:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar comunidade';
      toastService.error('Erro', errorMessage);
    }
  };

  const handleJoinLeave = async (community: Community) => {
    try {
      if (community.is_member) {
        // Leave community
        await api.post(`/api/communities/communities/${community.id}/leave/`);
        toastService.success('Você saiu da comunidade');
      } else {
        // Join community
        await api.post(`/api/communities/communities/${community.id}/join/`);
        toastService.success(
          community.requires_approval 
            ? 'Solicitação enviada! Aguarde aprovação' 
            : 'Você entrou na comunidade'
        );
      }
      
      fetchCommunities();
    } catch (error: any) {
      console.error('Erro ao entrar/sair da comunidade:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao processar solicitação';
      toastService.error('Erro', errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
                  <span className="me-3">👥</span>
                  Comunidades
                </h1>
                <p className="text-muted mb-0">Explore e participe de comunidades</p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => showModal()}
                className="d-flex align-items-center"
              >
                <span className="me-2">➕</span>
                Nova Comunidade
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
                      👥
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.total}</div>
                    <div className="text-muted small">Total</div>
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
                      🌍
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.public_communities}</div>
                    <div className="text-muted small">Públicas</div>
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
                      🔒
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.private_communities}</div>
                    <div className="text-muted small">Privadas</div>
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
                      ⭐
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold h4 mb-0">{stats.my_communities}</div>
                    <div className="text-muted small">Minhas</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search and Filters */}
        <Row className="mb-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Pesquisar comunidades..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>
          </Col>
          <Col md={6} className="d-flex justify-content-end align-items-center gap-3">
            <Form.Check
              type="switch"
              id="show-only-mine"
              label="Apenas minhas comunidades"
              checked={showOnlyMine}
              onChange={(e) => setShowOnlyMine(e.target.checked)}
            />
            <span className="text-muted small">
              {communities.length} comunidade(s) encontrada(s)
            </span>
          </Col>
        </Row>

        {/* Communities Grid */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2">Carregando comunidades...</div>
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-5">
            <div className="display-1 text-muted mb-3">👥</div>
            <h5>Nenhuma comunidade encontrada</h5>
            <p className="text-muted">
              {searchTerm ? 'Tente ajustar os filtros de pesquisa' : 'Comece criando sua primeira comunidade'}
            </p>
            {!searchTerm && (
              <Button variant="primary" onClick={() => showModal()}>
                <span className="me-2">➕</span>
                Criar Primeira Comunidade
              </Button>
            )}
          </div>
        ) : (
          <Row>
            {communities.map((community) => (
              <Col key={community.id} lg={4} md={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0">{community.name}</h5>
                      <div className="d-flex gap-1">
                        <Badge bg={community.is_public ? 'success' : 'warning'}>
                          {community.is_public ? '🌍 Público' : '🔒 Privado'}
                        </Badge>
                        {community.requires_approval && (
                          <Badge bg="info">
                            ✋ Aprovação
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="card-text text-muted">
                      {community.description || 'Sem descrição'}
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-muted">
                        👤 {community.member_count} 
                        {community.max_members && ` / ${community.max_members}`} membros
                      </small>
                      <small className="text-muted">
                        por {community.created_by_name}
                      </small>
                    </div>
                    
                    <div className="d-flex gap-2">
                      {!community.is_admin && (
                        <Button
                          variant={community.is_member ? 'outline-danger' : 'primary'}
                          size="sm"
                          onClick={() => handleJoinLeave(community)}
                          className="flex-grow-1"
                        >
                          {community.is_member ? 'Sair' : 'Entrar'}
                        </Button>
                      )}
                      
                      {community.is_admin && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => showModal(community)}
                        >
                          ✏️ Editar
                        </Button>
                      )}
                      
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate(`/communities/${community.id}`)}
                      >
                        👀 Ver
                      </Button>
                    </div>
                  </Card.Body>
                  <Card.Footer className="text-muted small">
                    Criada em {formatDate(community.created_at)}
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Create/Edit Modal */}
        <Modal show={modalVisible} onHide={handleModalClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingCommunity ? 'Editar Comunidade' : 'Nova Comunidade'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nome da Comunidade *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Digite o nome da comunidade"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Descreva sobre o que é esta comunidade..."
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="is_public"
                      name="is_public"
                      label="Comunidade Pública"
                      checked={formData.is_public}
                      onChange={handleFormChange}
                    />
                    <Form.Text className="text-muted">
                      {formData.is_public 
                        ? 'Qualquer pessoa pode ver e entrar' 
                        : 'Apenas pessoas convidadas podem ver'
                      }
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="requires_approval"
                      name="requires_approval"
                      label="Requer Aprovação"
                      checked={formData.requires_approval}
                      onChange={handleFormChange}
                    />
                    <Form.Text className="text-muted">
                      {formData.requires_approval 
                        ? 'Admins devem aprovar novos membros' 
                        : 'Entrada livre para novos membros'
                      }
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Limite de Membros (opcional)</Form.Label>
                <Form.Control
                  type="number"
                  name="max_members"
                  value={formData.max_members}
                  onChange={handleFormChange}
                  placeholder="Deixe vazio para ilimitado"
                  min="1"
                  max="10000"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleModalClose}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {editingCommunity ? 'Atualizar' : 'Criar'} Comunidade
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </MainLayoutBootstrap>
  );
};

export default CommunitiesPageBootstrap;
