import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

interface AppContentProps {
  children: React.ReactNode;
}

const AppContent: React.FC<AppContentProps> = ({ children }) => {
  const location = useLocation();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ title: React.ReactNode; href?: string }> = [
      { title: <><HomeOutlined /> Dashboard</>, href: '/dashboard' }
    ];

    if (pathSegments.length > 0) {
      const currentPath = pathSegments[pathSegments.length - 1];
      const pathMap: Record<string, string> = {
        companies: 'Empresas',
        kanban: 'Kanban',
        communities: 'Comunidades',
        chat: 'Chat',
        analytics: 'Analytics',
        settings: 'Configurações',
      };

      if (pathMap[currentPath]) {
        breadcrumbs.push({ title: <span>{pathMap[currentPath]}</span> });
      }
    }

    return breadcrumbs;
  };

  return (
    <div className="crm-app-content min-h-screen bg-crm-bg-primary">
      {/* Breadcrumb Navigation */}
      <div className="crm-breadcrumb px-6 py-4 bg-crm-bg-secondary border-b border-crm-border">
        <Breadcrumb
          items={generateBreadcrumbs()}
          className="crm-breadcrumb-nav"
        />
      </div>

      {/* Main Content */}
      <div className="crm-content-wrapper p-6">
        <div className="crm-content-container max-w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppContent;
