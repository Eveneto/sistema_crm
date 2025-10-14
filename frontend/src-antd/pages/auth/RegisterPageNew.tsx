import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Progress, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';
import { useAuth } from '../../hooks/useAuth';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Função para calcular força da senha
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    return Math.min(strength, 100);
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 25) return 'Muito fraca';
    if (strength < 50) return 'Fraca';
    if (strength < 75) return 'Média';
    if (strength < 100) return 'Forte';
    return 'Muito forte';
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 25) return '#ff4d4f';
    if (strength < 50) return '#fa8c16';
    if (strength < 75) return '#fadb14';
    return '#52c41a';
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
    
    if (password && strength < 50) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números');
    } else {
      setPasswordError('');
    }
  };

  const onFinish = async (values: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => {
    if (passwordStrength < 50) {
      message.error('Por favor, use uma senha mais forte');
      return;
    }

    try {
      await dispatch(registerUser(values)).unwrap();
      message.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.username) {
          message.error(`Username: ${errorData.username[0]}`);
        } else if (errorData.email) {
          message.error(`Email: ${errorData.email[0]}`);
        } else if (errorData.password) {
          message.error(`Password: ${errorData.password[0]}`);
        } else {
          message.error('Erro ao criar conta. Verifique os dados.');
        }
      } else {
        message.error('Erro ao criar conta. Tente novamente.');
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)'
    }}>
      <Card style={{ width: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            🏢 CRM System
          </Title>
          <Typography.Text type="secondary">
            Crie sua conta
          </Typography.Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Por favor, insira um usuário!' },
              { min: 3, message: 'Usuário deve ter pelo menos 3 caracteres!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Usuário"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor, insira seu email!' },
              { type: 'email', message: 'Por favor, insira um email válido!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item
              name="first_name"
              style={{ flex: 1 }}
            >
              <Input placeholder="Nome" />
            </Form.Item>

            <Form.Item
              name="last_name" 
              style={{ flex: 1 }}
            >
              <Input placeholder="Sobrenome" />
            </Form.Item>
          </div>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Por favor, insira uma senha!' },
              { min: 8, message: 'Senha deve ter pelo menos 8 caracteres!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Senha"
              onChange={onPasswordChange}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          {passwordStrength > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  Força da senha:
                </Typography.Text>
                <Typography.Text 
                  style={{ fontSize: '12px', color: getPasswordStrengthColor(passwordStrength) }}
                >
                  {getPasswordStrengthText(passwordStrength)}
                </Typography.Text>
              </div>
              <Progress
                percent={passwordStrength}
                showInfo={false}
                strokeColor={getPasswordStrengthColor(passwordStrength)}
                size="small"
              />
              {passwordError && (
                <Alert
                  message={passwordError}
                  type="warning"
                  showIcon
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
          )}

          <Form.Item
            name="password_confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor, confirme sua senha!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('As senhas não coincidem!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirmar senha"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          {error && (
            <Alert
              message="Erro no registro"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ width: '100%' }}
            >
              Criar Conta
            </Button>
          </Form.Item>

          <Divider>ou</Divider>

          <Form.Item>
            <GoogleLoginButton disabled={isLoading} loading={isLoading} />
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Typography.Text type="secondary">
              Já tem uma conta? <Link to="/login">Faça login</Link>
            </Typography.Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
