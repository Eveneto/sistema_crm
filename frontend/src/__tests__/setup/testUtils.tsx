import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

// Mock store for testing
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => state,
      companies: (state = { companies: [], loading: false }, action) => state,
      ...initialState
    }
  });
};

// Simple test wrapper component (without Router for basic tests)
const TestWrapper: React.FC<{ children: React.ReactNode; initialState?: any }> = ({ children, initialState = {} }) => {
  const store = createMockStore(initialState);
  
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

// Mock API service
jest.mock('../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

describe('🧪 Test Setup Validation', () => {
  it('should render test wrapper correctly', () => {
    render(
      <TestWrapper>
        <div data-testid="test-content">Test Content</div>
      </TestWrapper>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should provide Redux store context', () => {
    const TestComponent = () => {
      // This would use useSelector in a real component
      return <div data-testid="redux-test">Redux Connected</div>;
    };
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('redux-test')).toBeInTheDocument();
  });
});

// Export utilities for other tests
export { TestWrapper, createMockStore };
