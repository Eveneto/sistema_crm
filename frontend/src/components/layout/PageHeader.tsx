import React from 'react';
import { Button, Space, Typography, Divider } from 'antd';
import BreadcrumbNavigation from './BreadcrumbNavigation';

const { Title, Text } = Typography;

interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode[];
  extra?: React.ReactNode;
  showBreadcrumb?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  extra,
  showBreadcrumb = true,
  style,
  children,
}) => {
  return (
    <div
      style={{
        background: 'var(--rd-bg)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid var(--rd-border-light)',
        boxShadow: 'var(--rd-shadow-light)',
        ...style,
      }}
      className="rd-page-header"
    >
      {/* Breadcrumb */}
      {showBreadcrumb && (
        <BreadcrumbNavigation
          pageTitle={title}
          customBreadcrumbs={breadcrumbs}
          showPageTitle={false}
          style={{ marginBottom: 16, padding: 0, borderBottom: 'none' }}
        />
      )}

      {/* Header Content */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Title and Subtitle */}
        <div style={{ flex: 1 }}>
          {title && (
            <Title
              level={1}
              style={{
                margin: 0,
                marginBottom: subtitle ? 4 : 0,
                color: 'var(--rd-text)',
                fontWeight: 600,
                fontSize: '28px',
                lineHeight: 1.2,
              }}
            >
              {title}
            </Title>
          )}
          {subtitle && (
            <Text
              style={{
                color: 'var(--rd-text-secondary)',
                fontSize: '16px',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </Text>
          )}
        </div>

        {/* Actions */}
        {(actions || extra) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {actions && (
              <Space size="middle">
                {actions.map((action, index) => (
                  <React.Fragment key={index}>{action}</React.Fragment>
                ))}
              </Space>
            )}
            {actions && extra && (
              <Divider
                type="vertical"
                style={{
                  height: '24px',
                  borderColor: 'var(--rd-border)',
                  margin: '0 8px',
                }}
              />
            )}
            {extra}
          </div>
        )}
      </div>

      {/* Additional Content */}
      {children && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--rd-border-light)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
