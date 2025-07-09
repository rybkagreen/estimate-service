import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EstimateTemplate } from '../../types/estimate.types';

interface TemplatesState {
  templates: EstimateTemplate[];
  selectedTemplateId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TemplatesState = {
  templates: [],
  selectedTemplateId: null,
  isLoading: false,
  error: null,
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setTemplates: (state, action: PayloadAction<EstimateTemplate[]>) => {
      state.templates = action.payload;
    },

    addTemplate: (state, action: PayloadAction<EstimateTemplate>) => {
      state.templates.push(action.payload);
    },

    updateTemplate: (state, action: PayloadAction<{ id: string; updates: Partial<EstimateTemplate> }>) => {
      const { id, updates } = action.payload;
      const index = state.templates.findIndex(t => t.id === id);
      if (index !== -1) {
        state.templates[index] = { ...state.templates[index], ...updates };
      }
    },

    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
    },

    selectTemplate: (state, action: PayloadAction<string | null>) => {
      state.selectedTemplateId = action.payload;
    },

    incrementUsageCount: (state, action: PayloadAction<string>) => {
      const template = state.templates.find(t => t.id === action.payload);
      if (template) {
        template.usageCount += 1;
      }
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
  setTemplates,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  selectTemplate,
  incrementUsageCount,
  setLoading,
  setError,
} = templatesSlice.actions;

export default templatesSlice.reducer;

// Selectors
export const selectAllTemplates = (state: { templates: TemplatesState }) => state.templates.templates;

export const selectTemplateById = (id: string) => (state: { templates: TemplatesState }) =>
  state.templates.templates.find(t => t.id === id) || null;

export const selectSelectedTemplate = (state: { templates: TemplatesState }) => {
  const selectedTemplateId = state.templates.selectedTemplateId;
  return selectedTemplateId ? state.templates.templates.find(t => t.id === selectedTemplateId) : null;
};

export const selectTemplatesByCategory = (category: string) => (state: { templates: TemplatesState }) =>
  state.templates.templates.filter(t => t.category === category);

export const selectPublicTemplates = (state: { templates: TemplatesState }) =>
  state.templates.templates.filter(t => t.isPublic);

export const selectMyTemplates = (userId: string) => (state: { templates: TemplatesState }) =>
  state.templates.templates.filter(t => t.createdBy === userId);
