import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmailVerificationNotice: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee', background: '#fff', textAlign: 'center' }}>
      <h2>Cadastro realizado!</h2>
      <p>Verifique seu e-mail para ativar sua conta antes de acessar o sistema.</p>
      <button style={{ marginTop: 24 }} onClick={() => navigate('/login')}>Ir para Login</button>
    </div>
  );
};

export default EmailVerificationNotice;
