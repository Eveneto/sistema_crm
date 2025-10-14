import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Alert, Button } from 'antd';
import api from '../../services/api';

const { Title } = Typography;

const EmailVerificationPage: React.FC = () => {
  // Controle para evitar requisições duplicadas
  const requestedRef = React.useRef(false);
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'invalid' | 'used' | 'already' | 'error' | null>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/auth/verify-email/${token}/`);
        console.log('[EmailVerification][API Response]:', response.data);
        if (response.status === 200 && (response.data.success === true || response.data.message?.toLowerCase().includes('sucesso'))) {
          setStatus('success');
          setMessage('Seu e-mail foi verificado com sucesso! Agora você pode acessar sua conta normalmente.');
        } else {
          const msg = response.data.message?.toLowerCase() || '';
          if (msg.includes('já foi utilizado')) {
            setStatus('used');
            setMessage('Este link de verificação já foi utilizado. Caso já tenha verificado, faça login normalmente.');
          } else if (msg.includes('já está verificado')) {
            setStatus('already');
            setMessage('Este e-mail já está verificado. Você pode acessar sua conta normalmente.');
          } else {
            setStatus('success');
            setMessage('Seu e-mail foi verificado!');
          }
        }
      } catch (error: any) {
        console.log('[EmailVerification][API Error]:', error.response?.data);
        const errMsg = error.response?.data?.error?.toLowerCase() || '';
        if (errMsg.includes('inválido') || errMsg.includes('invalid')) {
          setStatus('invalid');
          setMessage('O link de verificação é inválido ou expirou. Solicite um novo ou tente novamente.');
        } else if (errMsg.includes('já foi utilizado')) {
          setStatus('used');
          setMessage('Este link de verificação já foi utilizado. Caso já tenha verificado, faça login normalmente.');
        } else if (errMsg.includes('já está verificado')) {
          setStatus('already');
          setMessage('Este e-mail já está verificado. Você pode acessar sua conta normalmente.');
        } else {
          setStatus('error');
          setMessage('Ocorreu um erro ao verificar seu e-mail. Tente novamente ou solicite um novo link.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (token && !requestedRef.current) {
      requestedRef.current = true;
      verifyEmail();
    }
  }, [token]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <Title level={3} style={{ textAlign: 'center', color: '#1890ff' }}>Verificação de E-mail</Title>
        {loading ? (
          <Spin tip="Verificando..." style={{ width: '100%' }} />
        ) : status ? (
          <Alert
            message={
              status === 'success' ? 'E-mail verificado!'
              : status === 'invalid' ? 'Link inválido ou expirado'
              : status === 'used' ? 'Link já utilizado'
              : status === 'already' ? 'E-mail já verificado'
              : 'Erro'
            }
            description={message}
            type={status === 'success' ? 'success' : 'error'}
            showIcon
            style={{ marginBottom: 24 }}
          />
        ) : null}
        <Button type="primary" block onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
          Ir para Login
        </Button>
      </Card>
    </div>
  );
};

export default EmailVerificationPage;
