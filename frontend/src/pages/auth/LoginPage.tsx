import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';
import { useAuth } from '../../hooks/useAuth';
import googleLoginService from '../../services/googleLoginService';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error, user } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form] = Form.useForm();

  // Pega a rota que o usuário tentou acessar antes de ser redirecionado para login
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Login tradicional (email/senha) via Django
  const onFinish = async (values: { username_or_email: string; password: string }) => {
    try {
      console.log('🔑 Tentando login tradicional:', values.username_or_email);
      
      const result = await dispatch(loginUser({
        username_or_email: values.username_or_email,
        password: values.password,
        rememberMe
      })).unwrap();
      
      console.log('✅ Login tradicional sucesso:', result.user.email);
      message.success('Login realizado com sucesso!');
      navigate(from, { replace: true });
      
    } catch (error: any) {
      console.error('❌ Erro no login tradicional:', error);
      message.error(error || 'Erro no login');
    }
  };

  // Login com Google usando novo serviço simplificado
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      console.log('🔍 Iniciando login Google...');
      
      const result = await googleLoginService.loginWithGoogle();
      
      console.log('✅ Login Google sucesso:', result.user.email);
      message.success('Login com Google realizado com sucesso!');
      navigate(from, { replace: true });
      
    } catch (error: any) {
      console.error('❌ Erro no login Google:', error);
      message.error(error.message || 'Erro no login com Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Se já está autenticado, redirecionar
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            CRM System
          </Title>
          <Typography.Text type="secondary">
            Faça login para continuar
          </Typography.Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username_or_email"
            rules={[
              { required: true, message: 'Digite seu email ou nome de usuário' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email ou nome de usuário" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Digite sua senha' }
            ]}
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
              >
                Lembrar-me
              </Checkbox>
              <Link to="/forgot-password">Esqueceu a senha?</Link>
            </div>
          </Form.Item>

          {error && (
            <Form.Item>
              <div style={{ color: '#ff4d4f', marginBottom: 16 }}>
                {error}
              </div>
            </Form.Item>
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              block
              size="large"
            >
              Entrar
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>ou</Divider>

        <Button
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
          loading={googleLoading}
          block
          size="large"
          style={{ marginBottom: 16 }}
        >
          Continuar com Google
        </Button>

        <div style={{ textAlign: 'center' }}>
          <Typography.Text type="secondary">
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
