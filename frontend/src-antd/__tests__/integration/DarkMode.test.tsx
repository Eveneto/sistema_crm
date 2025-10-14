/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider } from 'antd';
import { ThemeProvider } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/theme/ThemeToggle';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Componente de teste para integração
const TestApp = () => {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <div data-testid="app-content">
          <h1>Test App</h1>
          <ThemeToggle />
          <div data-testid="theme-indicator">
            Current theme: {document.documentElement.getAttribute('data-theme')}
          </div>
        </div>
      </ThemeProvider>
    </ConfigProvider>
  );
};

describe('Dark Mode Integration', () => {
  beforeEach(() => {
    // Reset DOM
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.className = 'theme-light';
    
    // Clear mocks
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('light');
  });

  test('should integrate theme context with Ant Design ConfigProvider', () => {
    render(<TestApp />);

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
    expect(screen.getByText('Test App')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  test('should apply theme changes to document element', async () => {
    const user = userEvent.setup();
    
    render(<TestApp />);

    // Should start with light theme
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    // Toggle to dark theme
    await user.click(screen.getByTestId('theme-toggle-switch'));
    
    // Should update document element
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('should persist theme across component remount', async () => {
    const user = userEvent.setup();
    
    const { unmount } = render(<TestApp />);
    
    // Toggle to dark
    await user.click(screen.getByTestId('theme-toggle-switch'));
    
    // Verify localStorage was called
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('crm_theme_mode', 'dark');
    
    // Unmount and remount
    unmount();
    
    // Mock localStorage to return dark theme
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    render(<TestApp />);
    
    // Should maintain dark theme
    expect(screen.getByText('Modo Escuro')).toBeInTheDocument();
  });

  test('should work with system preference detection', () => {
    // Mock system preference for dark mode
    const matchMediaMock = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)' ? true : false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
    
    // No stored preference
    mockLocalStorage.getItem.mockReturnValue(null);
    
    render(<TestApp />);
    
    // Should detect system preference
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });
});
