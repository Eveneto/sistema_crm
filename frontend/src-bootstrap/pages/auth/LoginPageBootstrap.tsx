import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner,
  InputGroup
} from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import toastService from '../../services/toastService';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginPageBootstrap: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { themeMode } = useTheme();

  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const resultAction = await dispatch(loginUser({
        username_or_email: formData.email,
        password: formData.password
      }) as any);

      if (loginUser.fulfilled.match(resultAction)) {
        toastService.success('Login realizado com sucesso!');
        navigate(from, { replace: true });
      } else {
        const errorMessage = resultAction.payload?.message || 'Erro ao fazer login';
        setError(errorMessage);
        toastService.error('Erro no login', errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro inesperado';
      setError(errorMessage);
      toastService.error('Erro no login', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    toastService.info('Google login será implementado em breve');
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: themeMode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card 
              className="shadow-lg border-0"
              style={{ 
                borderRadius: '15px',
                backdropFilter: 'blur(10px)',
                backgroundColor: themeMode === 'dark' 
                  ? 'rgba(42, 42, 42, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <Card.Body className="p-4">
                {/* Logo/Title */}
                <div className="text-center mb-4">
                  <div className="display-4 mb-2">🏢</div>
                  <h2 className="fw-bold text-primary mb-1">CRM System</h2>
                  <p className="text-muted">Faça login para continuar</p>
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
                    <InputGroup>
                      <InputGroup.Text>📧</InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Senha</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>🔒</InputGroup.Text>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Sua senha"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Check
                    type="checkbox"
                    name="rememberMe"
                    label="Lembrar-me"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="mb-3"
                    disabled={isLoading}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
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
                <div className="text-center mb-3">
                  <span className="text-muted">ou</span>
                </div>

                {/* Google Login */}
                <Button
                  variant="outline-danger"
                  className="w-100 mb-3"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <span className="me-2">🔍</span>
                  Continuar com Google
                </Button>

                {/* Register Link */}
                <div className="text-center">
                  <span className="text-muted">Não tem conta? </span>
                  <Link 
                    to="/auth/register" 
                    className="text-decoration-none fw-medium"
                  >
                    Criar conta
                  </Link>
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
