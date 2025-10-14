import React from 'react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button
      variant="link"
      onClick={toggleTheme}
      className="theme-toggle p-2"
      title={`Mudar para tema ${isDarkMode ? 'claro' : 'escuro'}`}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </Button>
  );
};

export default ThemeToggle;
