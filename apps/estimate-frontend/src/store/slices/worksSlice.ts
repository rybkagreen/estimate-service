import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Work } from '../../types/estimate.types';

interface WorksState {
  works: Work[];
  selectedWorkId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorksState = {
  works: [],
  selectedWorkId: null,
  isLoading: false,
  error: null,
};

const worksSlice = createSlice({
  name: 'works',
  initialState,
  reducers: {
    setWorks: (state, action: PayloadAction<Work[]>) => {
      state.works = action.payload;
    },

    addWork: (state, action: PayloadAction<Work>) => {
      state.works.push(action.payload);
    },

    updateWork: (state, action: PayloadAction<{ id: string; updates: Partial<Work> }>) => {
      const { id, updates } = action.payload;
      const index = state.works.findIndex(w => w.id === id);
      if (index !== -1) {
        state.works[index] = { ...state.works[index], ...updates };
      }
    },

    deleteWork: (state, action: PayloadAction<string>) => {
      state.works = state.works.filter(w => w.id !== action.payload);
    },

    selectWork: (state, action: PayloadAction<string | null>) => {
      state.selectedWorkId = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setWorks,
  addWork,
  updateWork,
  deleteWork,
  selectWork,
  setLoading,
  setError,
} = worksSlice.actions;

export default worksSlice.reducer;

// Selectors
export const selectAllWorks = (state: { works: WorksState }) => state.works.works;

export const selectWorkById = (id: string) => (state: { works: WorksState }) =>
  state.works.works.find(w => w.id === id) || null;

export const selectSelectedWork = (state: { works: WorksState }) => {
  const selectedWorkId = state.works.selectedWorkId;
  return selectedWorkId ? state.works.works.find(w => w.id === selectedWorkId) : null;
};

export const selectWorksByCategory = (category: string) => (state: { works: WorksState }) =>
  state.works.works.filter(w => w.category === category);
