import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'default' | 'large';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Carregando...', 
  size = 'large' 
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '48px 64px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Spin indicator={antIcon} />
        <Typography.Title level={4} style={{ marginTop: 24, marginBottom: 0, color: '#1890ff' }}>
          🏢 CRM System
        </Typography.Title>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          {message}
        </Typography.Text>
      </div>
    </div>
  );
};

export default LoadingScreen;
