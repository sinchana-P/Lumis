import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../authApi';
import authReducer from '../../slices/authSlice';
import * as tokenStorage from '@/lib/tokenStorage';

// Mock tokenStorage module
jest.mock('@/lib/tokenStorage');

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('authApi', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        [authApi.reducerPath]: authApi.reducer,
        auth: authReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authApi.middleware),
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('googleCallback', () => {
    it('should have correct endpoint configuration', () => {
      const endpoint = authApi.endpoints.googleCallback;
      expect(endpoint).toBeDefined();
    });
  });
});