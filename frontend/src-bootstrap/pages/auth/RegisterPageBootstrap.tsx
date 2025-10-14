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
  InputGroup,
  ProgressBar
} from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../redux/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import toastService from '../../services/toastService';

const RegisterPageBootstrap: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { themeMode } = useTheme();

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength < 25) return 'Muito fraca';
    if (strength < 50) return 'Fraca';
    if (strength < 75) return 'Boa';
    return 'Forte';
  };

  const getPasswordStrengthVariant = (strength: number): string => {
    if (strength < 25) return 'danger';
    if (strength < 50) return 'warning';
    if (strength < 75) return 'info';
    return 'success';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    
    if (passwordStrength < 50) {
      setError('A senha deve ser mais forte');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const resultAction = await dispatch(registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName
      }) as any);

      if (registerUser.fulfilled.match(resultAction)) {
        toastService.success('Conta criada com sucesso!', 'Faça login para continuar');
        navigate('/auth/login');
      } else {
        const errorMessage = resultAction.payload?.message || 'Erro ao criar conta';
        setError(errorMessage);
        toastService.error('Erro no registro', errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro inesperado';
      setError(errorMessage);
      toastService.error('Erro no registro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        background: themeMode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
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
                  <h2 className="fw-bold text-primary mb-1">Criar Conta</h2>
                  <p className="text-muted">Preencha os dados para se cadastrar</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                {/* Register Form */}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>👤</InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="firstName"
                            placeholder="Seu nome"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Sobrenome</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>👤</InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="lastName"
                            placeholder="Seu sobrenome"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Usuário</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>@</InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="username"
                        placeholder="Seu usuário"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </InputGroup>
                  </Form.Group>

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
                    {formData.password && (
                      <div className="mt-2">
                        <ProgressBar 
                          now={passwordStrength} 
                          variant={getPasswordStrengthVariant(passwordStrength)}
                          style={{ height: '6px' }}
                        />
                        <small className="text-muted">
                          Força da senha: {getPasswordStrengthLabel(passwordStrength)}
                        </small>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirmar Senha</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>🔒</InputGroup.Text>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        isInvalid={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
                      />
                      <Form.Control.Feedback type="invalid">
                        As senhas não coincidem
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

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
                        Criando conta...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                </Form>

                {/* Login Link */}
                <div className="text-center">
                  <span className="text-muted">Já tem conta? </span>
                  <Link 
                    to="/auth/login" 
                    className="text-decoration-none fw-medium"
                  >
                    Fazer login
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

export default RegisterPageBootstrap;
