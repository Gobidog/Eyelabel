import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import authReducer from './authSlice';
import labelsReducer from './labelsSlice';
import templatesReducer from './templatesSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    labels: labelsReducer,
    templates: templatesReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
