import React from 'react';
import MainLayoutBootstrap from '../components/layout/MainLayoutBootstrap';
import { Container, Row, Col, Card } from 'react-bootstrap';

const DashboardPageBootstrap: React.FC = () => {
  return (
    <MainLayoutBootstrap>
      <Container fluid className="p-4">
        <Row>
          <Col>
            <h2 className="mb-4">Dashboard</h2>
            
            <Row>
              <Col md={3} className="mb-3">
                <Card className="text-center">
                  <Card.Body>
                    <Card.Title>🏢</Card.Title>
                    <Card.Text>
                      <strong>Empresas</strong><br />
                      <span className="text-muted">Gerenciar empresas</span>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} className="mb-3">
                <Card className="text-center">
                  <Card.Body>
                    <Card.Title>👥</Card.Title>
                    <Card.Text>
                      <strong>Comunidades</strong><br />
                      <span className="text-muted">Participar de comunidades</span>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} className="mb-3">
                <Card className="text-center">
                  <Card.Body>
                    <Card.Title>📋</Card.Title>
                    <Card.Text>
                      <strong>Kanban</strong><br />
                      <span className="text-muted">Em desenvolvimento</span>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} className="mb-3">
                <Card className="text-center">
                  <Card.Body>
                    <Card.Title>💬</Card.Title>
                    <Card.Text>
                      <strong>Chat</strong><br />
                      <span className="text-muted">Em desenvolvimento</span>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Row className="mt-4">
              <Col>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Bem-vindo ao CRM Bootstrap!</h5>
                  </Card.Header>
                  <Card.Body>
                    <p>Sistema migrado com sucesso para Bootstrap. Funcionalidades disponíveis:</p>
                    <ul>
                      <li>✅ <strong>Empresas</strong> - CRUD completo implementado</li>
                      <li>✅ <strong>Comunidades</strong> - CRUD completo implementado</li>
                      <li>⏳ <strong>Kanban</strong> - Em migração (Fase 8)</li>
                      <li>⏳ <strong>Chat</strong> - Em migração (Fase 8)</li>
                    </ul>
                    <p className="text-muted mb-0">
                      Use o menu lateral para navegar entre as seções.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </MainLayoutBootstrap>
  );
};

export default DashboardPageBootstrap;
