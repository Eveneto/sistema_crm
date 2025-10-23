import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import ResponsiveSidebar from './SidebarResponsive';
import ContentContainer from './ContentContainer';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sistema de responsividade fluida - usa container queries
  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setIsMobile(mobile);

      // Auto-collapse em mobile
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, [sidebarCollapsed]);

  // Layout fluido baseado em container queries
  const getLayoutStyle = () => {
    if (isMobile) {
      return {
        display: 'flex',
        flexDirection: 'column' as const,
        minHeight: '100vh',
        background: 'var(--crm-bg-primary)',
      };
    }

    return {
      display: 'grid',
      gridTemplateColumns: sidebarCollapsed ? '80px 1fr' : '280px 1fr',
      minHeight: '100vh',
      background: 'var(--crm-bg-primary)',
      transition: 'grid-template-columns var(--crm-transition-base)',
    };
  };

  const getContentStyle = () => {
    return {
      background: 'var(--crm-bg-primary)',
      padding: isMobile ? 'var(--crm-space-2)' : 'var(--crm-space-4)',
      overflow: 'auto',
      minHeight: '100vh',
    };
  };

  return (
    <div style={getLayoutStyle()}>
      {/* Sidebar Responsiva */}
      <ResponsiveSidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        isMobile={isMobile}
      />

      {/* Área de Conteúdo Principal */}
      <div style={getContentStyle()}>
        <ContentContainer>
          {children}
        </ContentContainer>
      </div>

      {/* Mobile backdrop overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarCollapsed(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--crm-bg-overlay)',
            zIndex: 1040,
            transition: 'opacity var(--crm-transition-base)',
          }}
        />
      )}
    </div>
  );
};

export default MainLayout;
