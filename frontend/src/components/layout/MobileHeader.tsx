import React from 'react';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';

const { Title } = Typography;

interface MobileHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  title?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  sidebarCollapsed,
  onToggleSidebar,
  title = 'CRM System'
}) => {
  return (
    <header className="crm-mobile-header">
      <div className="crm-mobile-header-content">
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuOutlined /> : <CloseOutlined />}
          onClick={onToggleSidebar}
          className="crm-mobile-menu-btn"
          aria-label={sidebarCollapsed ? 'Abrir menu' : 'Fechar menu'}
        />

        <div className="crm-mobile-header-title">
          <Title level={4} className="crm-mobile-title">
            {title}
          </Title>
        </div>

        <div className="crm-mobile-header-spacer" />
      </div>
    </header>
  );
};

export default MobileHeader;