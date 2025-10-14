// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Configuração global de mocks para Jest

// Mock do localStorage global
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock do matchMedia global
const matchMediaMock = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock global do ResizeObserver
const ResizeObserverMock = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Aplicar mocks globalmente
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
});

// Mock global para requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: jest.fn((cb) => setTimeout(cb, 16)),
});

// Mock global para cancelAnimationFrame
Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: jest.fn((id) => clearTimeout(id)),
});

// Suprimir warnings de console específicos para testes
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = jest.fn((message, ...args) => {
  // Suprimir warnings específicos do Ant Design em ambiente de teste
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render') ||
     message.includes('Warning: findDOMNode') ||
     message.includes('Warning: componentWillReceiveProps'))
  ) {
    return;
  }
  originalConsoleError(message, ...args);
});

console.warn = jest.fn((message, ...args) => {
  // Suprimir warnings específicos em ambiente de teste
  if (
    typeof message === 'string' &&
    (message.includes('componentWillReceiveProps') ||
     message.includes('deprecated'))
  ) {
    return;
  }
  originalConsoleWarn(message, ...args);
});

// Exportar mocks para uso nos testes
declare global {
  var localStorageMock: {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
    clear: jest.Mock;
  };
  var matchMediaMock: jest.Mock;
  var ResizeObserverMock: jest.Mock;
}

globalThis.localStorageMock = localStorageMock;
globalThis.matchMediaMock = matchMediaMock;
globalThis.ResizeObserverMock = ResizeObserverMock;
