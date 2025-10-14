import React from 'react';
import { Layout, Typography, Divider } from 'antd';
import NavigationTabs from './NavigationTabs';
import UserProfileDropdown from './UserProfileDropdown';

const { Header } = Layout;
const { Title } = Typography;

interface TopNavigationProps {
  style?: React.CSSProperties;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ style }) => {
  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--rd-bg)',
        borderBottom: '1px solid var(--rd-border)',
        boxShadow: 'var(--rd-shadow-light)',
        padding: '0 24px',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        ...style,
      }}
      className="rd-top-navigation"
    >
      {/* Logo e Navegação Principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--rd-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            C
          </div>
          <Title 
            level={4} 
            style={{ 
              margin: 0, 
              color: 'var(--rd-text)',
              fontWeight: 600,
              fontSize: '18px',
            }}
          >
            CRM System
          </Title>
        </div>

        {/* Divider vertical */}
        <Divider 
          type="vertical" 
          style={{ 
            height: '32px', 
            borderColor: 'var(--rd-border)',
            margin: '0 8px',
          }} 
        />

        {/* Navegação Principal */}
        <NavigationTabs />
      </div>

      {/* Área do Usuário */}
      <UserProfileDropdown />
    </Header>
  );
};

export default TopNavigation;
