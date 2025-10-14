import React from 'react';
import { Result, Button, Typography, Card, Space } from 'antd';
import { 
  ExclamationCircleOutlined, 
  ReloadOutlined, 
  HomeOutlined,
  BugOutlined 
} from '@ant-design/icons';
import './ErrorBoundary.css';

const { Paragraph, Text } = Typography;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  navigateHome: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  navigateHome 
}) => (
  <div className="error-boundary-container">
    <Result
      status="error"
      icon={<ExclamationCircleOutlined />}
      title="Oops! Algo deu errado"
      subTitle="Ocorreu um erro inesperado. Não se preocupe, nossa equipe já foi notificada."
      extra={[
        <Button 
          key="retry" 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={resetError}
          size="large"
        >
          Tentar Novamente
        </Button>,
        <Button 
          key="home" 
          icon={<HomeOutlined />}
          onClick={navigateHome}
          size="large"
        >
          Voltar ao Início
        </Button>
      ]}
    >
      <div className="error-details">
        <Card 
          title={
            <Space>
              <BugOutlined />
              <span>Detalhes do Erro</span>
            </Space>
          }
          size="small"
          className="error-card"
        >
          <Paragraph>
            <Text strong>Erro:</Text> {error.message}
          </Paragraph>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="error-stack">
              <summary>Stack Trace (Desenvolvimento)</summary>
              <pre>{error.stack}</pre>
            </details>
          )}
          
          <Paragraph className="error-help">
            <Text type="secondary">
              Se o problema persistir, entre em contato com o suporte ou 
              tente recarregar a página.
            </Text>
          </Paragraph>
        </Card>
      </div>
    </Result>
  </div>
);

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log do erro para serviços de monitoramento
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    // Callback personalizado para tratamento de erro
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Em produção, enviaria para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
  };

  navigateHome = () => {
    this.resetError();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          navigateHome={this.navigateHome}
        />
      );
    }

    return this.props.children;
  }
}

// Hook para capturar erros em componentes funcionais
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: any) => {
    console.error('Erro capturado:', error, errorInfo);
    
    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  };
};

// Componente para erros específicos de chat
export const ChatErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError 
}) => (
  <Result
    status="error"
    title="Falha na conexão do chat"
    subTitle="Não foi possível conectar ao sistema de chat. Verifique sua conexão."
    extra={[
      <Button key="retry" type="primary" onClick={resetError}>
        Reconectar
      </Button>
    ]}
  />
);

// Componente para erros de autenticação
export const AuthErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError,
  navigateHome 
}) => (
  <Result
    status="403"
    title="Erro de Autenticação"
    subTitle="Sua sessão expirou ou você não tem permissão para acessar esta página."
    extra={[
      <Button key="login" type="primary" onClick={navigateHome}>
        Fazer Login
      </Button>,
      <Button key="retry" onClick={resetError}>
        Tentar Novamente
      </Button>
    ]}
  />
);

export default ErrorBoundary;
