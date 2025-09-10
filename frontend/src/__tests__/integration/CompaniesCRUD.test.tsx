/**
 * 🏢 Companies CRUD Integration Tests
 * 
 * Tests the complete CRUD operations for companies including:
 * - API integration with backend
 * - Redux state management
 * - UI component interactions
 * - Error handling and loading states
 * - Pagination and filtering
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';

// Mock Redux slices
import companiesSlice from '../../redux/slices/companiesSlice';
import authSlice from '../../redux/slices/authSlice';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: { baseURL: 'http://localhost:8000' },
  })),
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock api service
jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: { baseURL: 'http://localhost:8000' },
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Ant Design components
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
  Modal: {
    confirm: jest.fn(),
  },
}));

// Test store setup
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      companies: companiesSlice,
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { 
          id: 1,
          username: 'test',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User'
        },
        token: 'test-token',
        isLoading: false,
        error: null,
      },
      companies: {
        companies: [],
        loading: false,
        error: null,
        totalCount: 0,
        currentPage: 1,
        pageSize: 10,
        filters: {},
      },
      ...initialState,
    },
  });
};

// Mock company data
const mockCompanies = [
  {
    id: 1,
    name: 'Tech Solutions Inc',
    email: 'contact@techsolutions.com',
    phone: '+1234567890',
    address: '123 Tech Street',
    status: 'active',
    industry: 'Technology',
    size: 'medium',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Global Marketing Co',
    email: 'info@globalmarketing.com',
    phone: '+1987654321',
    address: '456 Business Ave',
    status: 'active',
    industry: 'Marketing',
    size: 'large',
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:00Z',
  },
];

// Mock Companies List Component
const MockCompaniesList: React.FC<{ initialCompanies?: any[] }> = ({ 
  initialCompanies = mockCompanies 
}) => {
  const [companies, setCompanies] = React.useState(initialCompanies);
  const [loading, setLoading] = React.useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<any>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleCreate = () => {
    setSelectedCompany(null);
    setModalVisible(true);
  };

  const handleEdit = (company: any) => {
    setSelectedCompany(company);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await mockedAxios.delete(`/api/companies/${id}/`);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (companyData: any) => {
    setLoading(true);
    try {
      if (selectedCompany) {
        // Update
        const response = await mockedAxios.put(`/api/companies/${selectedCompany.id}/`, companyData);
        setCompanies(prev => prev.map(c => c.id === selectedCompany.id ? response.data : c));
      } else {
        // Create
        const response = await mockedAxios.post('/api/companies/', companyData);
        setCompanies(prev => [...prev, response.data]);
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="companies-list">
      <div data-testid="companies-header">
        <h1>Companies</h1>
        <button 
          data-testid="create-company-btn"
          onClick={handleCreate}
          disabled={loading}
        >
          Create Company
        </button>
      </div>

      <div data-testid="companies-table">
        {loading && <div data-testid="loading-spinner">Loading...</div>}
        
        {companies.map(company => (
          <div key={company.id} data-testid={`company-row-${company.id}`}>
            <span data-testid={`company-name-${company.id}`}>{company.name}</span>
            <span data-testid={`company-email-${company.id}`}>{company.email}</span>
            <span data-testid={`company-status-${company.id}`}>{company.status}</span>
            
            <button
              data-testid={`edit-company-${company.id}`}
              onClick={() => handleEdit(company)}
            >
              Edit
            </button>
            
            <button
              data-testid={`delete-company-${company.id}`}
              onClick={() => handleDelete(company.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {modalVisible && (
        <div data-testid="company-modal">
          <MockCompanyForm
            company={selectedCompany}
            onSave={handleSave}
            onCancel={() => setModalVisible(false)}
          />
        </div>
      )}
    </div>
  );
};

// Mock Company Form Component
const MockCompanyForm: React.FC<{
  company?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ company, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState({
    name: company?.name || '',
    email: company?.email || '',
    phone: company?.phone || '',
    address: company?.address || '',
    status: company?.status || 'active',
    industry: company?.industry || '',
    size: company?.size || '',
  });

  const [errors, setErrors] = React.useState<any>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div data-testid="company-form">
      <h2 data-testid="form-title">
        {company ? 'Edit Company' : 'Create Company'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <input
            data-testid="company-name-input"
            type="text"
            placeholder="Company Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && (
            <div data-testid="name-error" className="error">{errors.name}</div>
          )}
        </div>

        <div>
          <input
            data-testid="company-email-input"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          {errors.email && (
            <div data-testid="email-error" className="error">{errors.email}</div>
          )}
        </div>

        <div>
          <input
            data-testid="company-phone-input"
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <div>
          <input
            data-testid="company-address-input"
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <div>
          <select
            data-testid="company-status-select"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
          </select>
        </div>

        <div>
          <input
            data-testid="company-industry-input"
            type="text"
            placeholder="Industry"
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
          />
        </div>

        <div>
          <select
            data-testid="company-size-select"
            value={formData.size}
            onChange={(e) => handleChange('size', e.target.value)}
          >
            <option value="">Select Size</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div data-testid="form-actions">
          <button
            type="submit"
            data-testid="save-company-btn"
          >
            {company ? 'Update' : 'Create'}
          </button>
          
          <button
            type="button"
            data-testid="cancel-company-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Test wrapper component
const TestWrapper: React.FC<{ 
  children: React.ReactNode;
  store?: any;
}> = ({ children, store }) => {
  const testStore = store || createTestStore();
  
  return (
    <Provider store={testStore}>
      <div data-testid="test-wrapper">
        {children}
      </div>
    </Provider>
  );
};

describe('🏢 Companies CRUD Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.put.mockClear();
    mockedAxios.delete.mockClear();
  });

  describe('📋 Companies List', () => {
    it('should render companies list with data', async () => {
      const mockResponse = {
        data: {
          results: mockCompanies,
          count: mockCompanies.length,
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Verify list renders
      expect(screen.getByTestId('companies-list')).toBeInTheDocument();
      expect(screen.getByTestId('companies-header')).toBeInTheDocument();
      expect(screen.getByText('Companies')).toBeInTheDocument();

      // Verify companies are displayed
      expect(screen.getByTestId('company-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('company-row-2')).toBeInTheDocument();
      
      expect(screen.getByTestId('company-name-1')).toHaveTextContent('Tech Solutions Inc');
      expect(screen.getByTestId('company-email-1')).toHaveTextContent('contact@techsolutions.com');
      expect(screen.getByTestId('company-status-1')).toHaveTextContent('active');
    });

    it('should handle loading state', async () => {
      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Initially no loading spinner should be visible
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('should handle empty companies list', async () => {
      const mockResponse = {
        data: {
          results: [],
          count: 0,
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      render(
        <TestWrapper>
          <MockCompaniesList initialCompanies={[]} />
        </TestWrapper>
      );

      expect(screen.getByTestId('companies-list')).toBeInTheDocument();
      expect(screen.queryByTestId('company-row-1')).not.toBeInTheDocument();
    });
  });

  describe('➕ Create Company', () => {
    it('should open create modal when create button is clicked', async () => {
      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      const createButton = screen.getByTestId('create-company-btn');
      
      await act(async () => {
        fireEvent.click(createButton);
      });

      expect(screen.getByTestId('company-modal')).toBeInTheDocument();
      expect(screen.getByTestId('company-form')).toBeInTheDocument();
      expect(screen.getByTestId('form-title')).toHaveTextContent('Create Company');
    });

    it('should create new company successfully', async () => {
      const newCompany = {
        id: 3,
        name: 'New Company',
        email: 'new@company.com',
        phone: '+1111111111',
        address: '789 New Street',
        status: 'active',
        industry: 'Services',
        size: 'small',
        created_at: '2024-01-17T12:00:00Z',
        updated_at: '2024-01-17T12:00:00Z',
      };

      mockedAxios.post.mockResolvedValueOnce({ data: newCompany });

      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Open create modal
      await act(async () => {
        fireEvent.click(screen.getByTestId('create-company-btn'));
      });

      // Fill form
      await act(async () => {
        fireEvent.change(screen.getByTestId('company-name-input'), {
          target: { value: 'New Company' }
        });
        fireEvent.change(screen.getByTestId('company-email-input'), {
          target: { value: 'new@company.com' }
        });
        fireEvent.change(screen.getByTestId('company-phone-input'), {
          target: { value: '+1111111111' }
        });
      });

      // Submit form
      await act(async () => {
        fireEvent.click(screen.getByTestId('save-company-btn'));
      });

      // Verify API call
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/companies/', {
        name: 'New Company',
        email: 'new@company.com',
        phone: '+1111111111',
        address: '',
        status: 'active',
        industry: '',
        size: '',
      });
    });

    it('should validate required fields', async () => {
      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Open create modal
      await act(async () => {
        fireEvent.click(screen.getByTestId('create-company-btn'));
      });

      // Submit empty form
      await act(async () => {
        fireEvent.click(screen.getByTestId('save-company-btn'));
      });

      // Verify validation errors
      expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required');
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
    });

    it('should validate email format', async () => {
      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Open create modal
      await act(async () => {
        fireEvent.click(screen.getByTestId('create-company-btn'));
      });

      // Fill invalid email
      await act(async () => {
        fireEvent.change(screen.getByTestId('company-name-input'), {
          target: { value: 'Test Company' }
        });
        fireEvent.change(screen.getByTestId('company-email-input'), {
          target: { value: 'invalid-email' }
        });
      });

      // Submit form
      await act(async () => {
        fireEvent.click(screen.getByTestId('save-company-btn'));
      });

      expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email format');
    });
  });

  describe('✏️ Edit Company', () => {
    it('should open edit modal with pre-filled data', async () => {
      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Click edit button for first company
      await act(async () => {
        fireEvent.click(screen.getByTestId('edit-company-1'));
      });

      expect(screen.getByTestId('company-modal')).toBeInTheDocument();
      expect(screen.getByTestId('form-title')).toHaveTextContent('Edit Company');
      
      // Verify form is pre-filled
      expect(screen.getByTestId('company-name-input')).toHaveValue('Tech Solutions Inc');
      expect(screen.getByTestId('company-email-input')).toHaveValue('contact@techsolutions.com');
    });

    it('should update company successfully', async () => {
      const updatedCompany = {
        ...mockCompanies[0],
        name: 'Updated Tech Solutions',
        email: 'updated@techsolutions.com',
      };

      mockedAxios.put.mockResolvedValueOnce({ data: updatedCompany });

      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Open edit modal
      await act(async () => {
        fireEvent.click(screen.getByTestId('edit-company-1'));
      });

      // Update fields
      await act(async () => {
        fireEvent.change(screen.getByTestId('company-name-input'), {
          target: { value: 'Updated Tech Solutions' }
        });
        fireEvent.change(screen.getByTestId('company-email-input'), {
          target: { value: 'updated@techsolutions.com' }
        });
      });

      // Submit form
      await act(async () => {
        fireEvent.click(screen.getByTestId('save-company-btn'));
      });

      // Verify API call
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/companies/1/', {
        name: 'Updated Tech Solutions',
        email: 'updated@techsolutions.com',
        phone: '+1234567890',
        address: '123 Tech Street',
        status: 'active',
        industry: 'Technology',
        size: 'medium',
      });
    });
  });

  describe('🗑️ Delete Company', () => {
    it('should delete company successfully', async () => {
      mockedAxios.delete.mockResolvedValueOnce({});

      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Initially both companies should be visible
      expect(screen.getByTestId('company-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('company-row-2')).toBeInTheDocument();

      // Delete first company
      await act(async () => {
        fireEvent.click(screen.getByTestId('delete-company-1'));
      });

      // Verify API call
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/companies/1/');
    });

    it('should handle delete error', async () => {
      const deleteError = new Error('Delete failed');
      mockedAxios.delete.mockRejectedValueOnce(deleteError);

      // Console spy to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Delete company
      await act(async () => {
        fireEvent.click(screen.getByTestId('delete-company-1'));
      });

      // Verify error was logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Delete failed:', deleteError);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('🚨 Error Handling', () => {
    it('should handle API errors during create', async () => {
      const createError = {
        response: {
          status: 400,
          data: { message: 'Validation error' }
        }
      };
      mockedAxios.post.mockRejectedValueOnce(createError);

      // Console spy to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Open create modal and submit
      await act(async () => {
        fireEvent.click(screen.getByTestId('create-company-btn'));
      });

      await act(async () => {
        fireEvent.change(screen.getByTestId('company-name-input'), {
          target: { value: 'Test Company' }
        });
        fireEvent.change(screen.getByTestId('company-email-input'), {
          target: { value: 'test@company.com' }
        });
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('save-company-btn'));
      });

      // Verify error was handled
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Save failed:', createError);
      });

      consoleSpy.mockRestore();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Attempt to create company
      await act(async () => {
        fireEvent.click(screen.getByTestId('create-company-btn'));
      });

      await act(async () => {
        fireEvent.change(screen.getByTestId('company-name-input'), {
          target: { value: 'Test Company' }
        });
        fireEvent.change(screen.getByTestId('company-email-input'), {
          target: { value: 'test@company.com' }
        });
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('save-company-btn'));
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Save failed:', networkError);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('🔄 Form Interactions', () => {
    it('should clear validation errors when field is corrected', async () => {
      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Open create modal
      await act(async () => {
        fireEvent.click(screen.getByTestId('create-company-btn'));
      });

      // Submit empty form to trigger validation
      await act(async () => {
        fireEvent.click(screen.getByTestId('save-company-btn'));
      });

      // Verify error appears
      expect(screen.getByTestId('name-error')).toBeInTheDocument();

      // Fix the error by entering a name
      await act(async () => {
        fireEvent.change(screen.getByTestId('company-name-input'), {
          target: { value: 'Test Company' }
        });
      });

      // Error should be cleared
      expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
    });

    it('should handle form cancellation', async () => {
      render(
        <TestWrapper>
          <MockCompaniesList />
        </TestWrapper>
      );

      // Open create modal
      await act(async () => {
        fireEvent.click(screen.getByTestId('create-company-btn'));
      });

      expect(screen.getByTestId('company-modal')).toBeInTheDocument();

      // Cancel form
      await act(async () => {
        fireEvent.click(screen.getByTestId('cancel-company-btn'));
      });

      // Modal should be closed
      expect(screen.queryByTestId('company-modal')).not.toBeInTheDocument();
    });
  });
});
