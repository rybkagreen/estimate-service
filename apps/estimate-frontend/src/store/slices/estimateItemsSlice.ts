import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EstimateItem } from '../../types/estimate.types';

interface EstimateItemsState {
  items: Record<string, EstimateItem[]>; // Grouped by estimateId
  selectedItemId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EstimateItemsState = {
  items: {},
  selectedItemId: null,
  isLoading: false,
  error: null,
};

const estimateItemsSlice = createSlice({
  name: 'estimateItems',
  initialState,
  reducers: {
    // Set items for an estimate
    setEstimateItems: (state, action: PayloadAction<{ estimateId: string; items: EstimateItem[] }>) => {
      const { estimateId, items } = action.payload;
      state.items[estimateId] = items;
    },

    // Add item to estimate
    addEstimateItem: (state, action: PayloadAction<{ estimateId: string; item: EstimateItem }>) => {
      const { estimateId, item } = action.payload;
      if (!state.items[estimateId]) {
        state.items[estimateId] = [];
      }
      state.items[estimateId].push(item);
    },

    // Update item
    updateEstimateItem: (state, action: PayloadAction<{ estimateId: string; itemId: string; updates: Partial<EstimateItem> }>) => {
      const { estimateId, itemId, updates } = action.payload;
      if (state.items[estimateId]) {
        const itemIndex = state.items[estimateId].findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          state.items[estimateId][itemIndex] = {
            ...state.items[estimateId][itemIndex],
            ...updates,
          };
        }
      }
    },

    // Delete item
    deleteEstimateItem: (state, action: PayloadAction<{ estimateId: string; itemId: string }>) => {
      const { estimateId, itemId } = action.payload;
      if (state.items[estimateId]) {
        state.items[estimateId] = state.items[estimateId].filter(item => item.id !== itemId);
      }
    },

    // Reorder items
    reorderEstimateItems: (state, action: PayloadAction<{ estimateId: string; items: EstimateItem[] }>) => {
      const { estimateId, items } = action.payload;
      state.items[estimateId] = items;
    },

    // Select item
    selectEstimateItem: (state, action: PayloadAction<string | null>) => {
      state.selectedItemId = action.payload;
    },

    // Clear items for estimate
    clearEstimateItems: (state, action: PayloadAction<string>) => {
      delete state.items[action.payload];
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setEstimateItems,
  addEstimateItem,
  updateEstimateItem,
  deleteEstimateItem,
  reorderEstimateItems,
  selectEstimateItem,
  clearEstimateItems,
  setLoading,
  setError,
} = estimateItemsSlice.actions;

export default estimateItemsSlice.reducer;

// Selectors
export const selectEstimateItems = (estimateId: string) => (state: { estimateItems: EstimateItemsState }) =>
  state.estimateItems.items[estimateId] || [];

export const selectSelectedItem = (state: { estimateItems: EstimateItemsState }) => {
  if (!state.estimateItems.selectedItemId) return null;
  
  for (const items of Object.values(state.estimateItems.items)) {
    const item = items.find(i => i.id === state.estimateItems.selectedItemId);
    if (item) return item;
  }
  return null;
};
