import React from 'react';
import { Card, Typography } from 'antd';
import { useResponsive } from '../../hooks/useResponsive';

const { Title, Text } = Typography;

const ResponsiveExample: React.FC = () => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

  return (
    <div className="crm-container-responsive">
      <Card className="crm-card">
        <Title level={3} className="crm-title-responsive">
          Exemplo de Responsividade com Tailwind + React Responsive
        </Title>

        <div className="crm-margin-responsive">
          <Text className="crm-text-responsive">
            Este componente demonstra como usar os hooks responsivos criados.
          </Text>
        </div>

        {/* Exemplo de conteúdo que muda baseado no dispositivo */}
        <div className="crm-flex-responsive crm-margin-responsive">
          <Card className="crm-card flex-1">
            <Title level={4}>Dispositivo Atual</Title>
            <div className="space-y-2">
              <div className={`p-2 rounded ${isMobile ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
                Mobile: {isMobile ? 'Sim' : 'Não'}
              </div>
              <div className={`p-2 rounded ${isTablet ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                Tablet: {isTablet ? 'Sim' : 'Não'}
              </div>
              <div className={`p-2 rounded ${isDesktop ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}`}>
                Desktop: {isDesktop ? 'Sim' : 'Não'}
              </div>
              <div className={`p-2 rounded ${isLargeDesktop ? 'bg-orange-100 text-orange-800' : 'bg-gray-100'}`}>
                Large Desktop: {isLargeDesktop ? 'Sim' : 'Não'}
              </div>
            </div>
          </Card>

          {/* Exemplo de grid responsivo */}
          <div className="crm-card flex-1">
            <Title level={4}>Grid Responsivo</Title>
            <div className="crm-grid-responsive">
              <div className="crm-card bg-blue-50 p-4 text-center">
                Item 1
              </div>
              <div className="crm-card bg-green-50 p-4 text-center">
                Item 2
              </div>
              <div className="crm-card bg-yellow-50 p-4 text-center">
                Item 3
              </div>
              <div className="crm-card bg-red-50 p-4 text-center">
                Item 4
              </div>
            </div>
          </div>
        </div>

        {/* Exemplo de conteúdo condicional */}
        {isMobile && (
          <Card className="crm-card bg-yellow-50">
            <Text strong>📱 Você está em um dispositivo móvel!</Text>
            <br />
            <Text>O layout se adaptou automaticamente.</Text>
          </Card>
        )}

        {isDesktop && (
          <Card className="crm-card bg-blue-50">
            <Text strong>🖥️ Você está em um desktop!</Text>
            <br />
            <Text>Aproveite o espaço extra disponível.</Text>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default ResponsiveExample;
