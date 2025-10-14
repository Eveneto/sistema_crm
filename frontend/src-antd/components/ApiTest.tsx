import React, { useState } from 'react';
import { Button, Card, Typography, Alert } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const ApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🧪 Testando conexão com API...');
      
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        username: 'admin',
        password: 'admin123'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Resposta da API:', response.data);
      setResult(`✅ SUCCESS: ${JSON.stringify(response.data, null, 2)}`);
      
    } catch (error: any) {
      console.error('❌ Erro na API:', error);
      
      if (error.response) {
        setResult(`❌ ERROR: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setResult(`❌ NETWORK ERROR: ${error.message}`);
      } else {
        setResult(`❌ UNKNOWN ERROR: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Card>
        <Title level={3}>🧪 Teste de Conectividade API</Title>
        
        <Button 
          type="primary" 
          onClick={testAPI}
          loading={loading}
          style={{ marginBottom: '20px' }}
        >
          Testar Login API
        </Button>
        
        {result && (
          <Alert
            message="Resultado do Teste"
            description={<pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>{result}</pre>}
            type={result.includes('SUCCESS') ? 'success' : 'error'}
            style={{ marginTop: '20px' }}
          />
        )}
      </Card>
    </div>
  );
};

export default ApiTest;
