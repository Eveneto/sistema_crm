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

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-collapse on mobile
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate main content margin based on sidebar state
  const getMainContentStyle = () => {
    if (isMobile) {
      return {
        marginLeft: 0,
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      };
    }
    
    return {
      marginLeft: sidebarCollapsed ? 80 : 280,
      transition: 'margin-left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    };
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Responsive Sidebar */}
      <ResponsiveSidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <Layout style={getMainContentStyle()}>
        <Content
          style={{
            padding: isMobile ? '16px' : '24px',
            background: '#f5f7fa',
            overflow: 'auto',
            minHeight: '100vh',
          }}
          className="main-content-responsive"
        >
          <ContentContainer>
            {children}
          </ContentContainer>
        </Content>
      </Layout>

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
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: 1040,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </Layout>
  );
};

export default MainLayout;
