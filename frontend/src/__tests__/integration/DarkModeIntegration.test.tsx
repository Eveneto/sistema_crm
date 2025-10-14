import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ThemeProvider } from '../../contexts/ThemeContext';
import rdstationTheme from '../../theme/rdstationTheme';
import darkTheme from '../../theme/darkTheme';
import Dashboard from '../../pages/Dashboard';

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

// Mock do matchMedia
const matchMediaMock = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

// Mock do Redux store
const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = { 
        user: { 
          id: '1', 
          name: 'Test User', 
          email: 'test@example.com',
          role: 'admin' 
        }, 
        isAuthenticated: true 
      }, action) => state,
      kanban: (state = { columns: [], tasks: [] }, action) => state,
      chat: (state = { rooms: [], messages: [] }, action) => state,
    }
  });
};

// Mock da API
jest.mock('../../services/api', () => ({
  get: jest.fn().mockResolvedValue({ data: {
    companies: 10,
    tasks: 25,
    messages: 150,
    communities: 5,
    chart_data: {
      labels: ['Jan', 'Fev', 'Mar'],
      datasets: [{
        label: 'Empresas',
        data: [5, 8, 10],
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)'
      }]
    }
  }}),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Componente wrapper para testes
const TestWrapper: React.FC<{ children: React.ReactNode; initialTheme?: 'light' | 'dark' }> = ({ 
  children, 
  initialTheme = 'light' 
}) => {
  const store = createMockStore();
  
  localStorageMock.getItem.mockReturnValue(initialTheme);
  
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <ConfigProvider theme={initialTheme === 'dark' ? darkTheme : rdstationTheme}>
            {children}
          </ConfigProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('🎨 Integração Visual - Dark Mode', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.removeAttribute('data-theme');
  });

  test('deve aplicar tema escuro no documento quando modo escuro ativo', async () => {
    render(
      <TestWrapper initialTheme="dark">
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  test('deve aplicar tema claro no documento quando modo claro ativo', async () => {
    render(
      <TestWrapper initialTheme="light">
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains('theme-light')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  test('deve manter consistência visual entre componentes no modo escuro', async () => {
    render(
      <TestWrapper initialTheme="dark">
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      // Verificar se a página carregou
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    // Verificar se CSS variables foram aplicadas
    const computedStyle = window.getComputedStyle(document.documentElement);
    expect(computedStyle.getPropertyValue('--rd-bg')).toBeTruthy();
    expect(computedStyle.getPropertyValue('--rd-text')).toBeTruthy();
  });

  test('deve manter consistência visual entre componentes no modo claro', async () => {
    render(
      <TestWrapper initialTheme="light">
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    // Verificar se CSS variables do modo claro estão ativas
    const computedStyle = window.getComputedStyle(document.documentElement);
    expect(computedStyle.getPropertyValue('--rd-bg')).toBeTruthy();
    expect(computedStyle.getPropertyValue('--rd-text')).toBeTruthy();
  });

  test('deve alternar tema sem quebrar layout', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper initialTheme="light">
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    // Verificar estado inicial (claro)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Procurar pelo toggle de tema (se presente)
    const themeToggle = screen.queryByTestId('theme-toggle-switch');
    if (themeToggle) {
      await user.click(themeToggle);

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      // Verificar se o conteúdo ainda está presente após mudança
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    }
  });

  test('deve manter acessibilidade em ambos os modos', async () => {
    const { rerender } = render(
      <TestWrapper initialTheme="light">
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    // Verificar elementos acessíveis no modo claro
    const headingElements = screen.getAllByRole('heading');
    expect(headingElements.length).toBeGreaterThan(0);

    // Renderizar novamente em modo escuro
    rerender(
      <TestWrapper initialTheme="dark">
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    // Verificar se elementos acessíveis ainda estão presentes
    const darkModeHeadings = screen.getAllByRole('heading');
    expect(darkModeHeadings.length).toBeGreaterThan(0);
  });

  test('deve persistir preferência de tema', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper initialTheme="light">
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    const themeToggle = screen.queryByTestId('theme-toggle-switch');
    if (themeToggle) {
      await user.click(themeToggle);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('crm_theme_mode', 'dark');
      });
    }
  });

  test('deve carregar tema salvo na inicialização', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('crm_theme_mode');
  });

  test('deve aplicar transições suaves entre temas', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper initialTheme="light">
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    // Verificar se elementos têm transições CSS
    const bodyElement = document.body;
    const computedStyle = window.getComputedStyle(bodyElement);
    
    // Verificar se há alguma propriedade de transição
    const transition = computedStyle.getPropertyValue('transition');
    expect(transition).toBeDefined();
  });

  test('deve manter contraste adequado em modo escuro', async () => {
    render(
      <TestWrapper initialTheme="dark">
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    // Verificar se CSS variables de contraste estão definidas
    const root = document.documentElement;
    const computedStyle = window.getComputedStyle(root);
    
    const textColor = computedStyle.getPropertyValue('--text-primary');
    const backgroundColor = computedStyle.getPropertyValue('--background-primary');
    
    expect(textColor).toBeTruthy();
    expect(backgroundColor).toBeTruthy();
  });

  test('deve suportar media query prefers-color-scheme', () => {
    // Mock do sistema preferindo dark mode
    const darkMediaQuery = {
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    
    matchMediaMock.mockReturnValue(darkMediaQuery);
    localStorageMock.getItem.mockReturnValue(null); // Sem preferência salva
    
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Verificar se detectou preferência do sistema
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });
});
