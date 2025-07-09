import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
  modals: {
    createEstimate: boolean;
    editEstimate: boolean;
    deleteConfirm: boolean;
    importExport: boolean;
  };
  activeView: 'list' | 'grid' | 'detail';
  searchQuery: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'system',
  notifications: [],
  modals: {
    createEstimate: false,
    editEstimate: false,
    deleteConfirm: false,
    importExport: false,
  },
  activeView: 'list',
  searchQuery: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },

    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      state.notifications.push({
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      });
    },

    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },

    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },

    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },

    setActiveView: (state, action: PayloadAction<'list' | 'grid' | 'detail'>) => {
      state.activeView = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  markNotificationRead,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setActiveView,
  setSearchQuery,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectUnreadNotifications = (state: { ui: UIState }) => 
  state.ui.notifications.filter(n => !n.read);
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectActiveView = (state: { ui: UIState }) => state.ui.activeView;
export const selectSearchQuery = (state: { ui: UIState }) => state.ui.searchQuery;
