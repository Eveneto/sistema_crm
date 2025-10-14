import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';

const LoginPageBootstrap: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await dispatch(loginUser({ 
        username_or_email: email, 
        password, 
        rememberMe 
      }) as any);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card className="shadow-custom">
              <Card.Body className="p-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <h1 className="h3 text-primary-custom fw-bold mb-2">
                    🏢 CRM System
                  </h1>
                  <p className="text-muted mb-0">
                    Faça login para acessar sua conta
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Lembrar-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </Form>

                {/* Divider */}
                <hr className="my-4" />

                {/* Links */}
                <div className="text-center">
                  <p className="mb-2">
                    Não tem uma conta?{' '}
                    <Link 
                      to="/register" 
                      className="text-primary-custom text-decoration-none fw-semibold"
                    >
                      Cadastre-se
                    </Link>
                  </p>
                  <p className="mb-0">
                    <Link 
                      to="/forgot-password" 
                      className="text-muted text-decoration-none small"
                    >
                      Esqueceu sua senha?
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Demo Info */}
            <Card className="mt-3 bg-info bg-opacity-10 border-info">
              <Card.Body className="p-3">
                <div className="text-center">
                  <h6 className="text-info mb-2">🧪 Demo</h6>
                  <p className="small mb-1">
                    <strong>Email:</strong> demo@crm.com
                  </p>
                  <p className="small mb-0">
                    <strong>Senha:</strong> demo123
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPageBootstrap;
