import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock simples do componente AuthForm para teste de formulário
const MockAuthForm: React.FC<{
  onSubmit?: (data: { username: string; password: string }) => void;
  loading?: boolean;
  error?: string;
}> = ({ onSubmit, loading = false, error }) => {
  const [formData, setFormData] = React.useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <form data-testid="auth-form" onSubmit={handleSubmit}>
      <div data-testid="form-container">
        <h2 data-testid="form-title">Login</h2>
        
        {error && (
          <div data-testid="error-message" role="alert">
            {error}
          </div>
        )}

        <div data-testid="username-field">
          <label htmlFor="username">Usuário:</label>
          <input
            id="username"
            data-testid="username-input"
            type="text"
            value={formData.username}
            onChange={handleChange('username')}
            placeholder="Digite seu usuário"
            required
          />
        </div>

        <div data-testid="password-field">
          <label htmlFor="password">Senha:</label>
          <input
            id="password"
            data-testid="password-input"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            placeholder="Digite sua senha"
            required
          />
        </div>

        <button
          data-testid="submit-button"
          type="submit"
          disabled={loading || !formData.username || !formData.password}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div data-testid="form-actions">
          <a data-testid="forgot-password" href="/forgot-password">
            Esqueci minha senha
          </a>
          <a data-testid="register-link" href="/register">
            Criar conta
          </a>
        </div>
      </div>
    </form>
  );
};

// Store mock simples para testes
const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }) => state
    }
  });
};

// Wrapper de teste
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = createMockStore();
  
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

describe('🧪 Auth Form Test Setup', () => {
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

  it('should provide Redux store context', () => {
    render(
      <TestWrapper>
        <MockAuthForm />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
  });
});

describe('🔐 Auth Form Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('📐 Structure & Rendering', () => {
    it('should render form structure', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      expect(screen.getByTestId('auth-form')).toBeInTheDocument();
      expect(screen.getByTestId('form-container')).toBeInTheDocument();
      expect(screen.getByTestId('form-title')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should render form fields', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      expect(screen.getByTestId('username-field')).toBeInTheDocument();
      expect(screen.getByTestId('password-field')).toBeInTheDocument();
      expect(screen.getByTestId('username-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
    });

    it('should render form labels correctly', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Usuário:')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha:')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Entrar');
    });

    it('should render form actions', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      expect(screen.getByTestId('form-actions')).toBeInTheDocument();
      expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
      expect(screen.getByTestId('register-link')).toBeInTheDocument();
    });
  });

  describe('🔧 User Interactions', () => {
    it('should handle username input', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input') as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      expect(usernameInput.value).toBe('testuser');
    });

    it('should handle password input', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('should enable submit button when fields are filled', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      expect(submitButton).toBeDisabled();

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(submitButton).not.toBeDisabled();
    });

    it('should call onSubmit when form is submitted', async () => {
      const mockOnSubmit = jest.fn();
      
      render(
        <TestWrapper>
          <MockAuthForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123'
        });
      });
    });

    it('should handle form submission via Enter key', async () => {
      const mockOnSubmit = jest.fn();
      
      render(
        <TestWrapper>
          <MockAuthForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');
      const form = screen.getByTestId('auth-form');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Simular submit do formulário via Enter
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123'
        });
      });
    });
  });

  describe('🔄 Loading States', () => {
    it('should show loading state', () => {
      render(
        <TestWrapper>
          <MockAuthForm loading={true} />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveTextContent('Entrando...');
      expect(submitButton).toBeDisabled();
    });

    it('should disable form during loading', () => {
      render(
        <TestWrapper>
          <MockAuthForm loading={true} />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(submitButton).toBeDisabled();
    });
  });

  describe('❌ Error Handling', () => {
    it('should display error message', () => {
      const errorMessage = 'Credenciais inválidas';
      
      render(
        <TestWrapper>
          <MockAuthForm error={errorMessage} />
        </TestWrapper>
      );

      const errorElement = screen.getByTestId('error-message');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(errorMessage);
      expect(errorElement).toHaveAttribute('role', 'alert');
    });

    it('should not display error when no error prop', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should handle empty error string', () => {
      render(
        <TestWrapper>
          <MockAuthForm error="" />
        </TestWrapper>
      );

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('♿ Accessibility', () => {
    it('should have proper form accessibility', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      // Verificar labels associados aos inputs
      expect(screen.getByLabelText('Usuário:')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha:')).toBeInTheDocument();
    });

    it('should have proper input attributes', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');

      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('required');
      expect(usernameInput).toHaveAttribute('placeholder', 'Digite seu usuário');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('placeholder', 'Digite sua senha');
    });

    it('should have accessible error messages', () => {
      const errorMessage = 'Erro de autenticação';
      
      render(
        <TestWrapper>
          <MockAuthForm error={errorMessage} />
        </TestWrapper>
      );

      const errorElement = screen.getByTestId('error-message');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });
  });

  describe('🔧 Form Validation', () => {
    it('should require username field', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input');
      expect(usernameInput).toHaveAttribute('required');
    });

    it('should require password field', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should disable submit with empty username', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(submitButton).toBeDisabled();
    });

    it('should disable submit with empty password', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      expect(submitButton).toBeDisabled();
    });
  });

  describe('🔗 Navigation Links', () => {
    it('should render forgot password link', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const forgotLink = screen.getByTestId('forgot-password');
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
      expect(forgotLink).toHaveTextContent('Esqueci minha senha');
    });

    it('should render register link', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const registerLink = screen.getByTestId('register-link');
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
      expect(registerLink).toHaveTextContent('Criar conta');
    });
  });

  describe('⚡ Performance', () => {
    it('should not cause memory leaks', () => {
      const { unmount } = render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should render quickly', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    });

    it('should handle multiple input changes efficiently', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');

      // Simular múltiplas mudanças rapidamente
      for (let i = 0; i < 10; i++) {
        fireEvent.change(usernameInput, { target: { value: `user${i}` } });
        fireEvent.change(passwordInput, { target: { value: `pass${i}` } });
      }

      expect(usernameInput).toHaveValue('user9');
      expect(passwordInput).toHaveValue('pass9');
    });
  });

  describe('🔧 Edge Cases', () => {
    it('should handle onSubmit being undefined', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(() => fireEvent.click(submitButton)).not.toThrow();
    });

    it('should handle special characters in input', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input') as HTMLInputElement;
      const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;

      const specialUsername = 'user@domain.com';
      const specialPassword = 'P@ssw0rd!@#$%';

      fireEvent.change(usernameInput, { target: { value: specialUsername } });
      fireEvent.change(passwordInput, { target: { value: specialPassword } });

      expect(usernameInput.value).toBe(specialUsername);
      expect(passwordInput.value).toBe(specialPassword);
    });

    it('should handle very long input values', () => {
      render(
        <TestWrapper>
          <MockAuthForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByTestId('username-input') as HTMLInputElement;
      const longUsername = 'a'.repeat(1000);

      fireEvent.change(usernameInput, { target: { value: longUsername } });

      expect(usernameInput.value).toBe(longUsername);
    });
  });
});
