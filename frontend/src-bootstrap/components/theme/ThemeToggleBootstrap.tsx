import React from 'react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggleBootstrap: React.FC = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <Button
      variant={themeMode === 'dark' ? 'outline-light' : 'outline-dark'}
      size="sm"
      onClick={toggleTheme}
      className="d-flex align-items-center"
      title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="me-2">
        {themeMode === 'dark' ? '☀️' : '🌙'}
      </span>
      <span className="d-none d-md-inline">
        {themeMode === 'dark' ? 'Light' : 'Dark'}
      </span>
    </Button>
  );
};

export default ThemeToggleBootstrap;
