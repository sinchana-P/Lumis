import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AppLayout } from '../AppLayout';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import { baseApi } from '@/store/api/baseApi';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
};

describe('AppLayout', () => {
  it('renders children', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <AppLayout>
          <div>Test content</div>
        </AppLayout>
      </Provider>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('shows sidebar and header in normal mode', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      </Provider>
    );
    expect(screen.getByText('Lumis')).toBeInTheDocument();
  });

  it('hides navigation in journal mode', () => {
    const store = createMockStore({
      ui: {
        theme: 'light',
        sidebarOpen: true,
        journalMode: true,
        analysisDepth: 'full_spectrum',
        lumenMode: 'guided',
        notifications: [],
      },
    });
    
    render(
      <Provider store={store}>
        <AppLayout>
          <div>Journal content</div>
        </AppLayout>
      </Provider>
    );
    
    expect(screen.getByText('Journal content')).toBeInTheDocument();
    expect(screen.queryByText('Lumis')).not.toBeInTheDocument();
  });
});
