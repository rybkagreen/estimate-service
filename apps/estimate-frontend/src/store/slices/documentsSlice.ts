import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  content?: string;
  file?: File;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentsState {
  files: DocumentFile[];
  selectedFileId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  files: [],
  selectedFileId: null,
  isLoading: false,
  error: null,
};

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    addDocument: (state, action: PayloadAction<DocumentFile>) => {
      state.files.push(action.payload);
    },
    removeDocument: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(f => f.id !== action.payload);
      if (state.selectedFileId === action.payload) {
        state.selectedFileId = null;
      }
    },
    selectDocument: (state, action: PayloadAction<string | null>) => {
      state.selectedFileId = action.payload;
    },
    updateDocumentContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const doc = state.files.find(f => f.id === action.payload.id);
      if (doc) {
        doc.content = action.payload.content;
        doc.updatedAt = new Date().toISOString();
      }
    },
    setDocumentsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDocumentsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addDocument,
  removeDocument,
  selectDocument,
  updateDocumentContent,
  setDocumentsLoading,
  setDocumentsError,
} = documentsSlice.actions;

export default documentsSlice.reducer;
