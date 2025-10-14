/**
 * Dashboard Redux Slice
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface DashboardStats {
  totalCompanies: number;
  totalContacts: number;
  totalDeals: number;
  totalRevenue: number;
  monthlyGrowth?: {
    companies: number;
    contacts: number;
    deals: number;
    revenue: number;
  };
}

export interface ChartDataPoint {
  month: string;
  count?: number;
  revenue?: number;
  value?: number;
  status?: string;
}

export interface DashboardChartData {
  companiesByMonth: ChartDataPoint[];
  dealsByStatus: ChartDataPoint[];
  revenueByMonth: ChartDataPoint[];
}

export interface DashboardState {
  stats: DashboardStats;
  chartData: DashboardChartData;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  stats: {
    totalCompanies: 0,
    totalContacts: 0,
    totalDeals: 0,
    totalRevenue: 0,
  },
  chartData: {
    companiesByMonth: [],
    dealsByStatus: [],
    revenueByMonth: [],
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks (placeholder for actual API calls)
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    // This would be replaced with actual API call
    return {
      totalCompanies: 0,
      totalContacts: 0,
      totalDeals: 0,
      totalRevenue: 0,
    };
  }
);

export const fetchDashboardCharts = createAsyncThunk(
  'dashboard/fetchCharts',
  async () => {
    // This would be replaced with actual API call
    return {
      companiesByMonth: [],
      dealsByStatus: [],
      revenueByMonth: [],
    };
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setStats: (state, action: PayloadAction<DashboardStats>) => {
      state.stats = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setChartData: (state, action: PayloadAction<DashboardChartData>) => {
      state.chartData = action.payload;
    },
    updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard stats';
      })
      .addCase(fetchDashboardCharts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardCharts.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData = action.payload;
      })
      .addCase(fetchDashboardCharts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard charts';
      });
  },
});

export const {
  setLoading,
  setError,
  setStats,
  setChartData,
  updateStats,
  clearError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
