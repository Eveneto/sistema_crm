import React from 'react';
import { Menu, MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BuildOutlined,
  ProjectOutlined,
  MessageOutlined,
  TeamOutlined,
} from '@ant-design/icons';

interface NavigationTabsProps {
  style?: React.CSSProperties;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ style }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Itens do menu horizontal principal
  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      label: 'Início',
      icon: <DashboardOutlined />,
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/companies',
      label: 'Empresas',
      icon: <BuildOutlined />,
      onClick: () => navigate('/companies'),
    },
    {
      key: '/kanban',
      label: 'Negociações',
      icon: <ProjectOutlined />,
      onClick: () => navigate('/kanban'),
    },
    {
      key: '/communities',
      label: 'Contatos',
      icon: <TeamOutlined />,
      onClick: () => navigate('/communities'),
    },
    {
      key: '/chat',
      label: 'Marketing',
      icon: <MessageOutlined />,
      onClick: () => navigate('/chat'),
    },
  ];

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[location.pathname]}
      items={menuItems}
      style={{
        border: 'none',
        background: 'transparent',
        fontSize: '14px',
        fontWeight: 500,
        ...style,
      }}
      className="rd-navigation-tabs"
    />
  );
};

export default NavigationTabs;
