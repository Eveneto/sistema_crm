import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Divider,
  message,
  Alert,
} from 'antd';
import {
  UserAddOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TestingToolsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const generateTestEmails = () => {
    const timestamp = Date.now();
    const testEmails = [
      `test.user1.${timestamp}@example.com`,
      `test.user2.${timestamp}@example.com`,
      `test.user3.${timestamp}@example.com`,
      `admin.${timestamp}@example.com`,
      `moderator.${timestamp}@example.com`,
    ];

    form.setFieldsValue({
      testEmails: testEmails.join('\n')
    });

    message.success('Emails de teste gerados!');
  };

  const simulateUserRegistration = async (values: { email: string; name: string }) => {
    try {
      setLoading(true);
      
      // Simular registro do usuário
      console.log('🧪 Simulating user registration:', {
        email: values.email,
        name: values.name,
        timestamp: new Date().toISOString()
      });

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success(`Usuário ${values.email} registrado com sucesso (simulado)!`);
      form.resetFields();
    } catch (error) {
      message.error('Erro na simulação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Title level={2}>
          <ExperimentOutlined /> Ferramentas de Teste - Comunidades
        </Title>
        <Paragraph>
          Use estas ferramentas para testar as funcionalidades de gerenciamento de membros em ambiente de desenvolvimento.
        </Paragraph>

        <Alert
          message="Ambiente de Desenvolvimento"
          description="Estas ferramentas são apenas para teste. Em produção, os usuários devem se registrar normalmente."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Gerar Emails de Teste */}
          <Card title="1. Emails de Teste" extra={<DatabaseOutlined />}>
            <Paragraph>
              Gere emails únicos para testar convites e gerenciamento de membros:
            </Paragraph>
            <Form form={form} layout="vertical">
              <Form.Item label="Emails de Teste Gerados" name="testEmails">
                <TextArea
                  rows={5}
                  placeholder="Clique em 'Gerar Emails' para criar emails únicos para teste"
                  readOnly
                />
              </Form.Item>
              <Button
                type="primary"
                onClick={generateTestEmails}
                icon={<UserAddOutlined />}
              >
                Gerar Emails de Teste
              </Button>
            </Form>
          </Card>

          {/* Instruções de Teste */}
          <Card title="2. Como Testar Gerenciamento de Membros">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={4}>Cenários de Teste:</Title>
                <Paragraph>
                  <strong>A. Teste com Usuários Existentes:</strong>
                  <br />• Use emails de usuários já cadastrados no sistema
                  <br />• Convide-os para suas comunidades
                  <br />• Teste mudança de roles (member → moderator → admin)
                </Paragraph>

                <Paragraph>
                  <strong>B. Teste com Múltiplas Contas:</strong>
                  <br />• Abra o sistema em navegadores diferentes (Chrome, Firefox)
                  <br />• Faça login com contas diferentes em cada navegador
                  <br />• Teste convites e gerenciamento entre as contas
                </Paragraph>

                <Paragraph>
                  <strong>C. Teste de Regras de Negócio:</strong>
                  <br />• Tente remover o último admin (deve falhar)
                  <br />• Tente sair sendo o único admin (deve falhar)
                  <br />• Teste permissões (apenas admins podem gerenciar)
                </Paragraph>
              </div>

              <Divider />

              <div>
                <Title level={4}>Comandos de Backend para Criar Usuários de Teste:</Title>
                <Alert
                  type="info"
                  message="Execute estes comandos no terminal do backend para criar usuários reais:"
                  description={
                    <pre style={{ margin: '8px 0', fontSize: '12px' }}>
{`cd backend
python manage.py shell

# No shell do Django:
from django.contrib.auth.models import User
from apps.authentication.models import UserProfile

# Criar usuários de teste
users_data = [
    {'email': 'admin@test.com', 'name': 'Admin Test'},
    {'email': 'user1@test.com', 'name': 'User 1 Test'},
    {'email': 'user2@test.com', 'name': 'User 2 Test'},
]

for data in users_data:
    user, created = User.objects.get_or_create(
        username=data['email'],
        email=data['email'],
        defaults={
            'first_name': data['name'].split()[0],
            'last_name': ' '.join(data['name'].split()[1:]),
        }
    )
    if created:
        user.set_password('123456')
        user.save()
        print(f"Usuário {data['email']} criado com senha: 123456")
    else:
        print(f"Usuário {data['email']} já existe")

exit()`}
                    </pre>
                  }
                />
              </div>
            </Space>
          </Card>

          {/* Simular Registro */}
          <Card title="3. Simular Registro de Usuário" extra={<UserAddOutlined />}>
            <Form onFinish={simulateUserRegistration} layout="vertical">
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Email obrigatório' },
                  { type: 'email', message: 'Email inválido' }
                ]}
              >
                <Input placeholder="test@example.com" />
              </Form.Item>
              <Form.Item
                label="Nome"
                name="name"
                rules={[{ required: true, message: 'Nome obrigatório' }]}
              >
                <Input placeholder="Nome do Usuário" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Simular Registro
              </Button>
            </Form>
          </Card>

          {/* URLs Úteis */}
          <Card title="4. URLs Úteis para Teste">
            <Space direction="vertical">
              <Text>
                <strong>Django Admin:</strong> <a href="http://localhost:8000/admin" target="_blank" rel="noreferrer">http://localhost:8000/admin</a>
              </Text>
              <Text>
                <strong>API Communities:</strong> <a href="http://localhost:8000/api/communities/communities/" target="_blank" rel="noreferrer">http://localhost:8000/api/communities/communities/</a>
              </Text>
              <Text>
                <strong>Frontend (Dev):</strong> <a href="http://localhost:3000" target="_blank" rel="noreferrer">http://localhost:3000</a>
              </Text>
            </Space>
          </Card>
        </Space>
      </div>
    </MainLayout>
  );
};

export default TestingToolsPage;
