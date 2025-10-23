import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  BankOutlined,
  RiseOutlined,
  TeamOutlined,
  MessageOutlined
} from '@ant-design/icons';

interface BottomNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: BottomNavItem[] = [
    {
      key: 'dashboard',
      label: 'Início',
      icon: <HomeOutlined />,
      path: '/dashboard'
    },
    {
      key: 'companies',
      label: 'Empresas',
      icon: <BankOutlined />,
      path: '/companies'
    },
    {
      key: 'kanban',
      label: 'Negociações',
      icon: <RiseOutlined />,
      path: '/kanban'
    },
    {
      key: 'communities',
      label: 'Contatos',
      icon: <TeamOutlined />,
      path: '/communities'
    },
    {
      key: 'chat',
      label: 'Chat',
      icon: <MessageOutlined />,
      path: '/chat'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="crm-bottom-nav">
      <ul className="crm-bottom-nav-list">
        {navItems.map((item) => (
          <li key={item.key} className="crm-bottom-nav-item">
            <button
              className={`crm-bottom-nav-link ${
                location.pathname === item.path ? 'active' : ''
              }`}
              onClick={() => handleNavigation(item.path)}
              aria-label={item.label}
            >
              <span className="crm-bottom-nav-icon">
                {item.icon}
              </span>
              <span className="crm-bottom-nav-text">
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNavigation;