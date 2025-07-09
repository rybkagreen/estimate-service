import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import slices
import estimatesReducer from './slices/estimatesSlice';
import estimateItemsReducer from './slices/estimateItemsSlice';
import materialsReducer from './slices/materialsSlice';
import worksReducer from './slices/worksSlice';
import templatesReducer from './slices/templatesSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

// Import API
import { estimateApi } from './api/estimateApi';
import { materialsApi } from './api/materialsApi';
import { worksApi } from './api/worksApi';
import { authApi } from './slices/authSlice';

const rootReducer = combineReducers({
  estimates: estimatesReducer,
  estimateItems: estimateItemsReducer,
  materials: materialsReducer,
  works: worksReducer,
  templates: templatesReducer,
  ui: uiReducer,
  [estimateApi.reducerPath]: estimateApi.reducer,
  [materialsApi.reducerPath]: materialsApi.reducer,
  [worksApi.reducerPath]: worksApi.reducer,
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['estimates', 'templates', 'ui', 'auth'], // Only persist these reducers
  blacklist: ['estimateApi', 'materialsApi', 'worksApi', 'authApi'] // Don't persist API cache
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
    .concat(estimateApi.middleware)
    .concat(materialsApi.middleware)
    .concat(worksApi.middleware)
    .concat(authApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
