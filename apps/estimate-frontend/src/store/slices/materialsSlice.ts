import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Material } from '../../types/estimate.types';

interface MaterialsState {
  materials: Material[];
  selectedMaterialId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MaterialsState = {
  materials: [],
  selectedMaterialId: null,
  isLoading: false,
  error: null,
};

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    setMaterials: (state, action: PayloadAction<Material[]>) => {
      state.materials = action.payload;
    },

    addMaterial: (state, action: PayloadAction<Material>) => {
      state.materials.push(action.payload);
    },

    updateMaterial: (state, action: PayloadAction<{ id: string; updates: Partial<Material> }>) => {
      const { id, updates } = action.payload;
      const index = state.materials.findIndex(m => m.id === id);
      if (index !== -1) {
        state.materials[index] = { ...state.materials[index], ...updates };
      }
    },

    deleteMaterial: (state, action: PayloadAction<string>) => {
      state.materials = state.materials.filter(m => m.id !== action.payload);
    },

    selectMaterial: (state, action: PayloadAction<string | null>) => {
      state.selectedMaterialId = action.payload;
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
  setMaterials,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  selectMaterial,
  setLoading,
  setError,
} = materialsSlice.actions;

export default materialsSlice.reducer;

// Selectors
export const selectAllMaterials = (state: { materials: MaterialsState }) => state.materials.materials;

export const selectMaterialById = (id: string) => (state: { materials: MaterialsState }) =>
  state.materials.materials.find(m => m.id === id) || null;

export const selectSelectedMaterial = (state: { materials: MaterialsState }) => {
  const selectedMaterialId = state.materials.selectedMaterialId;
  return selectedMaterialId ? state.materials.materials.find(m => m.id === selectedMaterialId) : null;
};

