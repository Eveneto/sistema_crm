import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { useMediaQuery } from 'react-responsive';
import AppHeader from './header/AppHeader';
import AppSidebar from './sidebar/AppSidebar';
import AppContent from './content/AppContent';

const { Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  // Auto-collapse sidebar em dispositivos móveis
  useEffect(() => {
    if (isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [isMobile, sidebarCollapsed]);

  const sidebarWidth = sidebarCollapsed ? 80 : 280;

  return (
    <Layout className="crm-app-layout min-h-screen bg-crm-bg-primary">
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        width={sidebarWidth}
        className="crm-sidebar"
        style={{
          background: 'var(--crm-bg-secondary)',
          borderRight: '1px solid var(--crm-border)',
        }}
        trigger={null}
      >
        <AppSidebar collapsed={sidebarCollapsed} />
      </Sider>

      {/* Main Content Area */}
      <Layout className="crm-main-layout">
        {/* Header */}
        <AppHeader
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={title}
          subtitle={subtitle}
          isMobile={isMobile}
        />

        {/* Content */}
        <Content className="crm-content">
          <AppContent>
            {children}
          </AppContent>
        </Content>
      </Layout>

      {/* Mobile Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-crm-bg-overlay z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </Layout>
  );
};

export default AppLayout;
