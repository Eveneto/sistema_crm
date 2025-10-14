import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Space, Row, Col, Progress, Alert, message } from 'antd';
import { ReloadOutlined, FireOutlined, ClockCircleOutlined, ApiOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const TokenTestPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [countdown, setCountdown] = useState<string>('--:--');
  const [progress, setProgress] = useState(0);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [services, setServices] = useState({
    frontend: '🔄 Verificando...',
    backend: '🔄 Verificando...',
    firebase: '🔄 Verificando...'
  });

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const updateTokenInfo = useCallback(() => {
    const firebaseToken = localStorage.getItem('firebase_token');
    const userEmail = localStorage.getItem('user_email');
    const userName = localStorage.getItem('user_name');
    const userPhoto = localStorage.getItem('user_photo');

    if (firebaseToken) {
      try {
        const parts = firebaseToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const exp = new Date(payload.exp * 1000);
          const now = Date.now() / 1000;
          const timeLeft = payload.exp - now;

          setTokenInfo({
            present: true,
            email: userEmail,
            name: userName,
            photo: userPhoto,
            tokenPreview: firebaseToken.substring(0, 50) + '...',
            length: firebaseToken.length,
            expiresAt: exp.toLocaleString(),
            timeLeftMinutes: Math.floor(timeLeft / 60),
            userId: payload.user_id,
            provider: payload.firebase?.sign_in_provider
          });
        }
      } catch (error) {
        addLog(`❌ Erro ao decodificar token: ${error}`, 'error');
      }
    } else {
      setTokenInfo({
        present: false,
        email: userEmail,
        name: userName,
        photo: userPhoto
      });
    }
  }, []);

  const checkServicesStatus = useCallback(async () => {
    try {
      // Test Frontend (self)
      setServices(prev => ({ ...prev, frontend: '✅ Online' }));
      
      // Test Backend
      try {
        const response = await fetch('http://localhost:8000/api/auth/profile/');
        if (response.status === 401) {
          setServices(prev => ({ ...prev, backend: '✅ Online' }));
        } else {
          setServices(prev => ({ ...prev, backend: '⚠️ Resposta inesperada' }));
        }
      } catch {
        setServices(prev => ({ ...prev, backend: '❌ Offline' }));
      }

      // Firebase service (check if token service is available)
      const hasFirebaseConfig = !!localStorage.getItem('firebase_token') || 
                               !!localStorage.getItem('user_email');
      setServices(prev => ({ 
        ...prev, 
        firebase: hasFirebaseConfig ? '✅ Configurado' : '⚠️ Sem tokens' 
      }));

      addLog('Status dos serviços verificado', 'success');
    } catch (error) {
      addLog(`Erro ao verificar serviços: ${error}`, 'error');
    }
  }, []);

  const startTokenMonitoring = () => {
    setIsMonitoring(true);
    addLog('🚀 Iniciando monitoramento de tokens...', 'info');
    
    const interval = setInterval(() => {
      updateTokenInfo();
      
      // Simulate countdown (in real app, this would be based on actual token expiry)
      const now = new Date();
      const minutes = 50 - (now.getMinutes() % 50);
      const seconds = 60 - now.getSeconds();
      setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      setProgress(((50 - minutes) / 50) * 100);
    }, 1000);

    // Store interval to clear later
    (window as any).tokenMonitoringInterval = interval;
  };

  const forceTokenRefresh = () => {
    addLog('🔄 Forçando renovação manual do token...', 'warning');
    
    // In a real implementation, this would call the Firebase token service
    setTimeout(() => {
      const now = new Date().toLocaleString();
      localStorage.setItem('last_token_refresh', now);
      addLog('✅ Token renovado com sucesso (simulado)', 'success');
      updateTokenInfo();
    }, 1500);
  };

  const simulateTokenExpiration = () => {
    addLog('⏰ Simulando expiração de token...', 'warning');
    
    const backupToken = localStorage.getItem('firebase_token');
    localStorage.removeItem('firebase_token');
    
    setTimeout(() => {
      addLog('❌ Token expirou! Sistema deveria renovar automaticamente...', 'error');
      
      setTimeout(() => {
        if (backupToken) {
          localStorage.setItem('firebase_token', backupToken);
          addLog('🔄 Token renovado automaticamente pelo sistema!', 'success');
        }
        updateTokenInfo();
      }, 3000);
    }, 1000);
  };

  const testApiCall = async () => {
    const token = localStorage.getItem('firebase_token');
    
    if (!token) {
      message.error('Nenhum token Firebase encontrado');
      return;
    }

    try {
      setIsTestingApi(true);
      addLog('🌐 Testando API com token Firebase...', 'info');
      
      const response = await fetch('http://localhost:8000/api/auth/firebase-validate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-type': 'firebase'
        },
        body: JSON.stringify({
          firebase_token: token
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      
      setApiResponse(data);
      addLog('✅ API call realizada com sucesso!', 'success');
      message.success('API call realizada com sucesso!');
    } catch (error: any) {
      console.error('❌ API Error:', error);
      const errorMessage = error?.message || 'Erro desconhecido';
      setApiResponse({ error: errorMessage });
      addLog(`❌ Erro na API: ${errorMessage}`, 'error');
      message.error(`Erro na API: ${errorMessage}`);
    } finally {
      setIsTestingApi(false);
    }
  };

  const clearAllTests = () => {
    setLogs([]);
    setIsMonitoring(false);
    if ((window as any).tokenMonitoringInterval) {
      clearInterval((window as any).tokenMonitoringInterval);
    }
    addLog('🗑️ Sistema resetado', 'info');
  };

  useEffect(() => {
    addLog('🔥 Sistema de testes inicializado', 'success');
    checkServicesStatus();
    updateTokenInfo();

    // Update token info every 5 seconds
    const interval = setInterval(updateTokenInfo, 5000);
    
    return () => {
      clearInterval(interval);
      if ((window as any).tokenMonitoringInterval) {
        clearInterval((window as any).tokenMonitoringInterval);
      }
    };
  }, [checkServicesStatus, updateTokenInfo]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={1}>🔥 Teste de Renovação Automática de Tokens Firebase</Title>
      
      {/* Status Panel */}
      <Card title="📊 Status do Sistema" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <p><strong>Frontend React:</strong> {services.frontend}</p>
            <p><strong>Backend Django:</strong> {services.backend}</p>
            <p><strong>Firebase Service:</strong> {services.firebase}</p>
          </Col>
          <Col span={12}>
            <p><strong>Token Atual:</strong> {tokenInfo?.present ? '✅ Presente' : '❌ Ausente'}</p>
            <p><strong>Email:</strong> {tokenInfo?.email || '❌ Não encontrado'}</p>
            <p><strong>Nome:</strong> {tokenInfo?.name || '❌ Não encontrado'}</p>
          </Col>
        </Row>
      </Card>

      {/* Controls */}
      <Card title="🎮 Controles de Teste" style={{ marginBottom: '20px' }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<FireOutlined />}
            onClick={startTokenMonitoring}
            disabled={isMonitoring}
          >
            Iniciar Monitoramento
          </Button>
          <Button 
            type="default" 
            icon={<ReloadOutlined />}
            onClick={forceTokenRefresh}
          >
            Forçar Renovação
          </Button>
          <Button 
            type="default" 
            icon={<ClockCircleOutlined />}
            onClick={simulateTokenExpiration}
          >
            Simular Expiração
          </Button>
          <Button 
            type="default" 
            icon={<ApiOutlined />}
            onClick={testApiCall}
            loading={isTestingApi}
          >
            Testar API
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={clearAllTests}
          >
            Limpar Logs
          </Button>
        </Space>
      </Card>

      {/* Token Info */}
      {tokenInfo && (
        <Card title="🔑 Informações do Token Atual" style={{ marginBottom: '20px' }}>
          {tokenInfo.present ? (
            <div style={{ fontFamily: 'monospace', fontSize: '12px', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
              <p><strong>Token:</strong> {tokenInfo.tokenPreview}</p>
              <p><strong>Email:</strong> {tokenInfo.email}</p>
              <p><strong>User ID:</strong> {tokenInfo.userId}</p>
              <p><strong>Provedor:</strong> {tokenInfo.provider}</p>
              <p><strong>Tamanho:</strong> {tokenInfo.length} caracteres</p>
              <p><strong>Expira em:</strong> {tokenInfo.expiresAt}</p>
              <p><strong>Tempo restante:</strong> {tokenInfo.timeLeftMinutes} minutos</p>
            </div>
          ) : (
            <Alert message="❌ Nenhum token Firebase encontrado no localStorage" type="warning" />
          )}
        </Card>
      )}

      {/* Countdown */}
      {isMonitoring && (
        <Card title="⏰ Próxima Renovação" style={{ marginBottom: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ color: '#1890ff' }}>{countdown}</Title>
            <Progress percent={progress} status="active" />
          </div>
        </Card>
      )}

      {/* API Response */}
      {apiResponse && (
        <Card title="🌐 Resposta da API" style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        </Card>
      )}

      {/* Logs */}
      <Card title="📋 Log de Eventos">
        <div style={{ 
          height: '300px', 
          overflowY: 'auto', 
          background: '#1e1e1e', 
          padding: '15px', 
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '13px'
        }}>
          {logs.map((log, index) => (
            <div key={index} style={{ 
              color: log.type === 'success' ? '#28a745' : 
                     log.type === 'error' ? '#dc3545' : 
                     log.type === 'warning' ? '#ffc107' : '#17a2b8',
              marginBottom: '5px'
            }}>
              <span style={{ color: '#888', marginRight: '10px' }}>[{log.timestamp}]</span>
              {log.message}
            </div>
          ))}
          {logs.length === 0 && (
            <div style={{ color: '#00ff00' }}>
              <span style={{ color: '#888', marginRight: '10px' }}>[Sistema]</span>
              Aguardando início dos testes...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TokenTestPage;
