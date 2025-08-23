import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Checkbox, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';
import { useAuth } from '../../hooks/useAuth';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  // Pega a rota que o usuário tentou acessar antes de ser redirecionado para login
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onFinish = async (values: { username_or_email: string; password: string }) => {
    console.log('🔐 Iniciando processo de login...', values);
    try {
      const result = await dispatch(loginUser({ ...values, rememberMe })).unwrap();
      console.log('✅ Login bem-sucedido!', result);
      message.success('Login realizado com sucesso!');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      if (error.response?.status === 401) {
        message.error('Credenciais inválidas. Verifique seu usuário, e-mail ou senha.');
      } else if (error.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Falha no login. Tente novamente.');
      }
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            🏢 CRM System
          </Title>
          <Typography.Text type="secondary">
            Entre na sua conta
          </Typography.Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username_or_email"
            rules={[{ required: true, message: 'Por favor, insira seu usuário ou e-mail!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Usuário ou E-mail"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Senha"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              >
                Lembrar-me
              </Checkbox>
              <Typography.Link style={{ color: '#1890ff', fontSize: '14px' }}>
                Esqueceu a senha?
              </Typography.Link>
            </div>
          </Form.Item>

          {error && (
            <Alert
              message="Erro no login"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              closable
            />
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ width: '100%' }}
            >
              Entrar
            </Button>
          </Form.Item>

          <Divider>ou</Divider>

          <Form.Item>
            {/* Google OAuth temporariamente desabilitado - necessária configuração no Google Cloud Console */}
            {/* <GoogleLoginButton disabled={isLoading} loading={isLoading} /> */}
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Typography.Text type="secondary">
              Não tem uma conta? <Link to="/register">Registre-se</Link>
            </Typography.Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
