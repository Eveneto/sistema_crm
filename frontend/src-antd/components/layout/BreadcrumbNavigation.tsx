import React from 'react';
import { Breadcrumb, Typography } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbNavigationProps {
  pageTitle?: string;
  customBreadcrumbs?: BreadcrumbItem[];
  showPageTitle?: boolean;
  style?: React.CSSProperties;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  pageTitle,
  customBreadcrumbs,
  showPageTitle = true,
  style,
}) => {
  const location = useLocation();

  // Mapear rotas para breadcrumbs
  const routeMap: Record<string, string> = {
    '/dashboard': 'Início',
    '/companies': 'Empresas',
    '/kanban': 'Negociações',
    '/communities': 'Contatos',
    '/chat': 'Marketing',
  };

  // Gerar breadcrumbs automaticamente se não fornecidos
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        title: 'Início',
        path: '/dashboard',
        icon: <HomeOutlined />,
      },
    ];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const title = routeMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      if (currentPath !== '/dashboard') {
        breadcrumbs.push({
          title,
          path: currentPath === location.pathname ? undefined : currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Gerar itens do Breadcrumb do Ant Design
  const breadcrumbItems = breadcrumbs.map((item, index) => ({
    title: item.path ? (
      <Link to={item.path} style={{ color: 'var(--rd-text-secondary)' }}>
        {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
        {item.title}
      </Link>
    ) : (
      <span style={{ color: 'var(--rd-text)' }}>
        {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
        {item.title}
      </span>
    ),
  }));

  const currentPageTitle = pageTitle || breadcrumbs[breadcrumbs.length - 1]?.title || 'Página';

  return (
    <div
      style={{
        marginBottom: showPageTitle ? 24 : 16,
        padding: '16px 0',
        borderBottom: showPageTitle ? '1px solid var(--rd-border-light)' : 'none',
        ...style,
      }}
      className="rd-breadcrumb-navigation"
    >
      {/* Breadcrumb */}
      <Breadcrumb
        items={breadcrumbItems}
        style={{
          marginBottom: showPageTitle ? 8 : 0,
          fontSize: '13px',
        }}
      />

      {/* Page Title */}
      {showPageTitle && (
        <Title
          level={2}
          style={{
            margin: 0,
            color: 'var(--rd-text)',
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: 1.3,
          }}
        >
          {currentPageTitle}
        </Title>
      )}
    </div>
  );
};

export default BreadcrumbNavigation;
