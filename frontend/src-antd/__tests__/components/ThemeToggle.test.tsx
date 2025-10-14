/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    // Reset DOM
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.className = 'theme-light';
    
    // Clear mocks
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('light');
  });

  test('should render correctly', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle-switch')).toBeInTheDocument();
  });

  test('should show correct text for light theme', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByText('Modo Claro')).toBeInTheDocument();
  });

  test('should show correct text for dark theme', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByText('Modo Escuro')).toBeInTheDocument();
  });

  test('should toggle theme when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    // Should start with light mode
    expect(screen.getByText('Modo Claro')).toBeInTheDocument();
    
    // Click to toggle
    await user.click(screen.getByTestId('theme-toggle-switch'));
    
    // Should change to dark mode
    expect(screen.getByText('Modo Escuro')).toBeInTheDocument();
  });

  test('should work with different sizes', () => {
    const { rerender } = render(
      <ThemeProvider>
        <ThemeToggle size="small" />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <ThemeToggle size="default" />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  test('should work with iconOnly prop', () => {
    render(
      <ThemeProvider>
        <ThemeToggle iconOnly={true} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    // When iconOnly is true, the text should not be visible
    expect(screen.queryByText('Modo Claro')).not.toBeInTheDocument();
  });

  test('should work with custom tooltip text', () => {
    render(
      <ThemeProvider>
        <ThemeToggle tooltipText="Custom tooltip" />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });
});
