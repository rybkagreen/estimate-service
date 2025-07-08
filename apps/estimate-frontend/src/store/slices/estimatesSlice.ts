import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Estimate, EstimateStatus, EstimateFilter, EstimateSortOptions } from '../../types/estimate.types';

interface EstimatesState {
  estimates: Record<string, Estimate>;
  selectedEstimateId: string | null;
  filter: EstimateFilter;
  sortOptions: EstimateSortOptions;
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
}

const initialState: EstimatesState = {
  estimates: {},
  selectedEstimateId: null,
  filter: {},
  sortOptions: {
    field: 'updatedAt',
    direction: 'desc'
  },
  isLoading: false,
  error: null,
  lastSync: null
};

const estimatesSlice = createSlice({
  name: 'estimates',
  initialState,
  reducers: {
    // CRUD operations
    setEstimates: (state, action: PayloadAction<Estimate[]>) => {
      state.estimates = {};
      action.payload.forEach(estimate => {
        state.estimates[estimate.id] = estimate;
      });
      state.lastSync = new Date().toISOString();
    },
    
    addEstimate: (state, action: PayloadAction<Estimate>) => {
      state.estimates[action.payload.id] = action.payload;
    },
    
    updateEstimate: (state, action: PayloadAction<{ id: string; updates: Partial<Estimate> }>) => {
      const { id, updates } = action.payload;
      if (state.estimates[id]) {
        state.estimates[id] = {
          ...state.estimates[id],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    
    deleteEstimate: (state, action: PayloadAction<string>) => {
      delete state.estimates[action.payload];
      if (state.selectedEstimateId === action.payload) {
        state.selectedEstimateId = null;
      }
    },
    
    // Selection
    selectEstimate: (state, action: PayloadAction<string | null>) => {
      state.selectedEstimateId = action.payload;
    },
    
    // Status management
    updateEstimateStatus: (state, action: PayloadAction<{ id: string; status: EstimateStatus }>) => {
      const { id, status } = action.payload;
      if (state.estimates[id]) {
        state.estimates[id].status = status;
        state.estimates[id].updatedAt = new Date().toISOString();
        
        if (status === EstimateStatus.APPROVED) {
          state.estimates[id].approvedAt = new Date().toISOString();
        }
      }
    },
    
    // Filtering and sorting
    setFilter: (state, action: PayloadAction<EstimateFilter>) => {
      state.filter = action.payload;
    },
    
    setSortOptions: (state, action: PayloadAction<EstimateSortOptions>) => {
      state.sortOptions = action.payload;
    },
    
    // Batch operations
    updateMultipleEstimates: (state, action: PayloadAction<{ ids: string[]; updates: Partial<Estimate> }>) => {
      const { ids, updates } = action.payload;
      const timestamp = new Date().toISOString();
      
      ids.forEach(id => {
        if (state.estimates[id]) {
          state.estimates[id] = {
            ...state.estimates[id],
            ...updates,
            updatedAt: timestamp
          };
        }
      });
    },
    
    // Version management
    incrementVersion: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.estimates[id]) {
        state.estimates[id].version += 1;
        state.estimates[id].updatedAt = new Date().toISOString();
      }
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Clear state
    clearEstimates: (state) => {
      state.estimates = {};
      state.selectedEstimateId = null;
      state.error = null;
    }
  }
});

export const {
  setEstimates,
  addEstimate,
  updateEstimate,
  deleteEstimate,
  selectEstimate,
  updateEstimateStatus,
  setFilter,
  setSortOptions,
  updateMultipleEstimates,
  incrementVersion,
  setLoading,
  setError,
  clearEstimates
} = estimatesSlice.actions;

export default estimatesSlice.reducer;

// Selectors
export const selectAllEstimates = (state: { estimates: EstimatesState }) => 
  Object.values(state.estimates.estimates);

export const selectEstimateById = (id: string) => (state: { estimates: EstimatesState }) => 
  state.estimates.estimates[id];

export const selectSelectedEstimate = (state: { estimates: EstimatesState }) => 
  state.estimates.selectedEstimateId ? state.estimates.estimates[state.estimates.selectedEstimateId] : null;

export const selectFilteredEstimates = (state: { estimates: EstimatesState }) => {
  const { filter, estimates } = state.estimates;
  let filtered = Object.values(estimates);
  
  // Apply filters
  if (filter.status?.length) {
    filtered = filtered.filter(e => filter.status!.includes(e.status));
  }
  
  if (filter.projectId) {
    filtered = filtered.filter(e => e.projectId === filter.projectId);
  }
  
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(e => 
      e.name.toLowerCase().includes(searchLower) ||
      e.description?.toLowerCase().includes(searchLower)
    );
  }
  
  if (filter.minCost !== undefined) {
    filtered = filtered.filter(e => e.totalCost >= filter.minCost!);
  }
  
  if (filter.maxCost !== undefined) {
    filtered = filtered.filter(e => e.totalCost <= filter.maxCost!);
  }
  
  // Apply sorting
  const { field, direction } = state.estimates.sortOptions;
  filtered.sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });
  
  return filtered;
};
