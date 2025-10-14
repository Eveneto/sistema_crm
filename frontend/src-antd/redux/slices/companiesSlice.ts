/**
 * Companies Redux Slice
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'prospect';
  industry: string;
  size: 'small' | 'medium' | 'large';
  created_at: string;
  updated_at: string;
}

export interface CompaniesState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  filters: Record<string, any>;
}

const initialState: CompaniesState = {
  companies: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  filters: {},
};

// Async thunks (placeholder for actual API calls)
export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async () => {
    // This would be replaced with actual API call
    return { results: [], count: 0 };
  }
);

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      state.companies = action.payload;
    },
    addCompany: (state, action: PayloadAction<Company>) => {
      state.companies.push(action.payload);
    },
    updateCompany: (state, action: PayloadAction<Company>) => {
      const index = state.companies.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.companies[index] = action.payload;
      }
    },
    removeCompany: (state, action: PayloadAction<number>) => {
      state.companies = state.companies.filter(c => c.id !== action.payload);
    },
    setFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.filters = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch companies';
      });
  },
});

export const {
  setLoading,
  setError,
  setCompanies,
  addCompany,
  updateCompany,
  removeCompany,
  setFilters,
  setCurrentPage,
} = companiesSlice.actions;

export default companiesSlice.reducer;
