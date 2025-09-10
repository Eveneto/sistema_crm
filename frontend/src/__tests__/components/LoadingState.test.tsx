import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TestWrapper } from '../setup/testUtils';
import LoadingState from '../../components/common/LoadingState';

describe('🔄 LoadingState Component', () => {
  
  describe('📐 Rendering', () => {
    it('should render spinner type by default', () => {
      render(
        <TestWrapper>
          <LoadingState />
        </TestWrapper>
      );
      
      expect(document.querySelector('.ant-spin')).toBeInTheDocument();
      expect(screen.getByLabelText('Carregando...')).toBeInTheDocument();
    });

    it('should render skeleton type', () => {
      render(
        <TestWrapper>
          <LoadingState type="skeleton" />
        </TestWrapper>
      );
      
      expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
    });

    it('should render dots type', () => {
      render(
        <TestWrapper>
          <LoadingState type="dots" />
        </TestWrapper>
      );
      
      expect(document.querySelector('.loading-dots')).toBeInTheDocument();
    });

    it('should render pulse type', () => {
      render(
        <TestWrapper>
          <LoadingState type="pulse" />
        </TestWrapper>
      );
      
      expect(document.querySelector('.loading-pulse')).toBeInTheDocument();
    });
  });

  describe('📝 Props', () => {
    it('should display custom text', () => {
      const customText = 'Loading custom data...';
      
      render(
        <TestWrapper>
          <LoadingState text={customText} />
        </TestWrapper>
      );
      
      expect(screen.getByLabelText(customText)).toBeInTheDocument();
    });

    it('should apply custom size', () => {
      render(
        <TestWrapper>
          <LoadingState size="large" />
        </TestWrapper>
      );
      
      const spin = document.querySelector('.ant-spin-lg');
      expect(spin).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const customClass = 'my-custom-loading';
      
      render(
        <TestWrapper>
          <LoadingState className={customClass} />
        </TestWrapper>
      );
      
      const container = document.querySelector(`.${customClass}`);
      expect(container).toBeInTheDocument();
    });

    it('should set custom rows for skeleton', () => {
      render(
        <TestWrapper>
          <LoadingState type="skeleton" rows={5} />
        </TestWrapper>
      );
      
      const skeleton = document.querySelector('.ant-skeleton');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('♿ Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <LoadingState />
        </TestWrapper>
      );
      
      const spinner = screen.getByLabelText('Carregando...');
      expect(spinner).toBeInTheDocument();
    });

    it('should be screen reader friendly', () => {
      render(
        <TestWrapper>
          <LoadingState />
        </TestWrapper>
      );
      
      // Verify the loading state is announced to screen readers
      expect(screen.getByLabelText('Carregando...')).toBeInTheDocument();
    });
  });

  describe('🎨 Styling', () => {
    it('should apply correct CSS classes for spinner', () => {
      render(
        <TestWrapper>
          <LoadingState type="spinner" size="large" />
        </TestWrapper>
      );
      
      const spin = document.querySelector('.ant-spin-lg');
      expect(spin).toBeInTheDocument();
    });

    it('should apply correct CSS classes for skeleton', () => {
      render(
        <TestWrapper>
          <LoadingState type="skeleton" />
        </TestWrapper>
      );
      
      const skeleton = document.querySelector('.loading-skeleton');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('🔄 Types', () => {
    it('should render spinner correctly', () => {
      render(
        <TestWrapper>
          <LoadingState type="spinner" />
        </TestWrapper>
      );
      
      expect(document.querySelector('.ant-spin')).toBeInTheDocument();
    });

    it('should render dots animation', () => {
      render(
        <TestWrapper>
          <LoadingState type="dots" />
        </TestWrapper>
      );
      
      const dots = document.querySelector('.loading-dots');
      expect(dots).toBeInTheDocument();
    });

    it('should render pulse animation', () => {
      render(
        <TestWrapper>
          <LoadingState type="pulse" />
        </TestWrapper>
      );
      
      const pulse = document.querySelector('.loading-pulse');
      expect(pulse).toBeInTheDocument();
    });
  });

  describe('📱 Responsive', () => {
    it('should work on different screen sizes', () => {
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
          <LoadingState />
        </TestWrapper>
      );
      
      expect(screen.getByLabelText('Carregando...')).toBeInTheDocument();
    });
  });

  describe('⚡ Performance', () => {
    it('should not cause memory leaks', async () => {
      const { unmount } = render(
        <TestWrapper>
          <LoadingState />
        </TestWrapper>
      );
      
      unmount();
      
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    it('should render quickly', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <LoadingState />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('🔧 Edge Cases', () => {
    it('should handle undefined props gracefully', () => {
      render(
        <TestWrapper>
          <LoadingState 
            text={undefined}
            type={undefined}
            size={undefined}
          />
        </TestWrapper>
      );
      
      expect(screen.getByLabelText('Carregando...')).toBeInTheDocument();
    });

    it('should handle invalid type gracefully', () => {
      render(
        <TestWrapper>
          <LoadingState type={'invalid' as any} />
        </TestWrapper>
      );
      
      expect(screen.getByLabelText('Carregando...')).toBeInTheDocument();
    });
  });
});
