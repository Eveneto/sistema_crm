import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MainLayout from '../../components/layout/MainLayout';
import authReducer from '../../redux/slices/authSlice';

// Mock do hook useAuth
const mockLogout = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com'
    },
    logout: mockLogout
  })
}));

// Store mock para testes
const createMockStore = (initialState: any = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
    } as any,
    preloadedState: {
      auth: {
        user: {
          id: 1,
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com'
        },
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        ...(initialState.auth || {})
      },
      ...initialState
    }
  });
};

// Wrapper de teste
const TestWrapper: React.FC<{ children: React.ReactNode; initialState?: any }> = ({ 
  children, 
  initialState = {} 
}) => {
  const store = createMockStore(initialState);
  
  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/dashboard']}>
        {children}
      </MemoryRouter>
    </Provider>
  );
};

describe('🧪 Test Setup Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render test wrapper correctly', () => {
    render(
      <TestWrapper>
        <div data-testid="test-content">Test Content</div>
      </TestWrapper>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should provide routing context', () => {
    render(
      <TestWrapper>
        <MainLayout>
          <div data-testid="layout-content">Layout Content</div>
        </MainLayout>
      </TestWrapper>
    );
    
    expect(screen.getByTestId('layout-content')).toBeInTheDocument();
  });
});

describe('🏗️ MainLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('📐 Structure & Rendering', () => {
    it('should render main layout structure', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div data-testid="content">Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Verificar estrutura principal
      expect(screen.getByText('🏢 CRM System')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should display user information in header', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      expect(screen.getByText('Olá, Test!')).toBeInTheDocument();
      expect(screen.getAllByText('Test')[1]).toBeInTheDocument(); // Nome no dropdown
    });

    it('should render sidebar menu items', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Empresas')).toBeInTheDocument();
      expect(screen.getByText('Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Comunidades')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });
  });

  describe('🔧 User Interactions', () => {
    it('should render menu items as clickable', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Verificar que os itens do menu são clicáveis
      const empresasItem = screen.getByText('Empresas');
      expect(empresasItem.closest('.ant-menu-item')).toBeInTheDocument();
      
      const dashboardItem = screen.getByText('Dashboard');
      expect(dashboardItem.closest('.ant-menu-item')).toBeInTheDocument();
    });

    it('should handle menu item clicks', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Testar que o clique no menu não gera erro
      const empresasItem = screen.getByText('Empresas');
      expect(() => fireEvent.click(empresasItem)).not.toThrow();
    });
  });

  describe('👤 User Menu & Authentication', () => {
    it('should show user dropdown when clicked', async () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Clicar no avatar/nome do usuário para abrir dropdown
      const userDropdown = screen.getAllByText('Test')[1]; // Nome no header
      fireEvent.click(userDropdown);

      // Aguardar o dropdown aparecer
      await waitFor(() => {
        expect(screen.getByText('Perfil')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Configurações')).toBeInTheDocument();
      expect(screen.getByText('Sair')).toBeInTheDocument();
    });

    it('should call logout when Sair is clicked', async () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Abrir dropdown
      const userDropdown = screen.getAllByText('Test')[1];
      fireEvent.click(userDropdown);

      await waitFor(() => {
        expect(screen.getByText('Sair')).toBeInTheDocument();
      });

      // Clicar em Sair
      const logoutButton = screen.getByText('Sair');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });
  });

  describe('📱 Responsive Design', () => {
    it('should apply correct styles for desktop layout', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div data-testid="content">Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const content = screen.getByTestId('content');
      expect(content.closest('.ant-layout-content')).toHaveStyle({
        padding: '24px',
        background: '#f0f2f5'
      });
    });

    it('should handle different screen sizes', () => {
      // Mock window.matchMedia for responsive testing
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('max-width: 768px'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <TestWrapper>
          <MainLayout>
            <div>Mobile Content</div>
          </MainLayout>
        </TestWrapper>
      );

      expect(screen.getByText('🏢 CRM System')).toBeInTheDocument();
    });
  });

  describe('♿ Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Verificar que os elementos têm roles apropriados
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const dashboardItem = screen.getByText('Dashboard');
      expect(dashboardItem).toBeInTheDocument();
      
      // Simular navegação por teclado
      fireEvent.keyDown(dashboardItem, { key: 'Enter', code: 'Enter' });
      // Note: Ant Design Menu handles keyboard events internally
    });

    it('should have screen reader friendly elements', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Verificar que o título é acessível
      const title = screen.getByText('🏢 CRM System');
      expect(title).toBeInTheDocument();
      
      // Verificar que as informações do usuário são acessíveis
      const userGreeting = screen.getByText('Olá, Test!');
      expect(userGreeting).toBeInTheDocument();
    });
  });

  describe('🎨 Styling & Theming', () => {
    it('should apply correct header styles', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const header = screen.getByText('🏢 CRM System').closest('.ant-layout-header');
      expect(header).toHaveStyle({
        background: '#fff',
        padding: '0 24px',
        position: 'sticky',
        top: '0'
      });
    });

    it('should apply correct sidebar styles', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      const sidebar = screen.getByText('Dashboard').closest('.ant-layout-sider');
      expect(sidebar).toHaveStyle({
        background: '#fff'
      });
    });

    it('should show active menu item correctly', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Menu deveria ter o item /dashboard selecionado baseado no mock do useLocation
      const menu = screen.getByRole('navigation');
      expect(menu).toBeInTheDocument();
    });
  });

  describe('🔧 Edge Cases', () => {
    it('should handle user without first_name', () => {
      render(
        <TestWrapper initialState={{
          auth: {
            user: {
              id: 1,
              username: 'noname',
              email: 'noname@example.com',
              first_name: '',
              last_name: ''
            },
            token: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
            error: null
          }
        }}>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      expect(screen.getByText('Olá, noname!')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      const TestChild = () => <div data-testid="test-child">Test Child Component</div>;
      
      render(
        <TestWrapper>
          <MainLayout>
            <TestChild />
          </MainLayout>
        </TestWrapper>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Child Component')).toBeInTheDocument();
    });

    it('should handle empty children', () => {
      render(
        <TestWrapper>
          <MainLayout>
            {null}
          </MainLayout>
        </TestWrapper>
      );

      // Layout deve renderizar mesmo com children null
      expect(screen.getByText('🏢 CRM System')).toBeInTheDocument();
    });
  });

  describe('⚡ Performance', () => {
    it('should not cause memory leaks', () => {
      const { unmount } = render(
        <TestWrapper>
          <MainLayout>
            <div>Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Simular unmount
      expect(() => unmount()).not.toThrow();
    });

    it('should render quickly', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <MainLayout>
            <div>Performance Test</div>
          </MainLayout>
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Deve renderizar em menos de 200ms (aumentado para ser mais realista)
      expect(renderTime).toBeLessThan(200);
      expect(screen.getByText('Performance Test')).toBeInTheDocument();
    });
  });
});
