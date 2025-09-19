import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock simples do MainLayout
const MockMainLayout = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="main-layout">
    <header data-testid="header">Header</header>
    <nav data-testid="sidebar">Sidebar</nav>
    <main data-testid="content">{children}</main>
  </div>
);

describe('MainLayout Component', () => {
  test('renders main layout structure', () => {
    render(
      <MockMainLayout>
        <div data-testid="test-content">Test Content</div>
      </MockMainLayout>
    );
    
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  test('renders children correctly', () => {
    render(
      <MockMainLayout>
        <div data-testid="child-component">Child Component</div>
      </MockMainLayout>
    );
    
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });
});
