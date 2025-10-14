import React from 'react';
import { Switch, Tooltip } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

interface ThemeToggleProps {
  /** Tamanho do toggle (default, small) */
  size?: 'default' | 'small';
  /** Se deve mostrar apenas o ícone */
  iconOnly?: boolean;
  /** Texto customizado para tooltip */
  tooltipText?: string;
  /** Posicionamento do switch */
  placement?: 'horizontal' | 'vertical';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'default',
  iconOnly = false,
  tooltipText,
  placement = 'horizontal'
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const getTooltipText = () => {
    if (tooltipText) return tooltipText;
    return isDarkMode ? 'Alternar para modo claro' : 'Alternar para modo escuro';
  };

  const renderToggle = () => {
    const switchElement = (
      <Switch
        checked={isDarkMode}
        onChange={toggleTheme}
        size={size}
        checkedChildren={<BulbFilled style={{ color: '#fff' }} />}
        unCheckedChildren={<BulbOutlined style={{ color: '#666' }} />}
        className={`theme-toggle-switch ${placement}`}
        data-testid="theme-toggle-switch"
      />
    );

    if (iconOnly) {
      return (
        <Tooltip title={getTooltipText()} placement="bottom">
          {switchElement}
        </Tooltip>
      );
    }

    return (
      <div className={`theme-toggle-container ${placement}`}>
        <span className="theme-toggle-label">
          {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
        </span>
        <Tooltip title={getTooltipText()} placement="bottom">
          {switchElement}
        </Tooltip>
      </div>
    );
  };

  return (
    <div className="theme-toggle-wrapper" data-testid="theme-toggle">
      {renderToggle()}
    </div>
  );
};

export default ThemeToggle;
