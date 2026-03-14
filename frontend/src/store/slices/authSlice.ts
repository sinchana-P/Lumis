import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// User interface matching the backend User entity
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  provider: 'google' | 'local';
  analysis_depth_mode: 'full-spectrum' | 'quick-scan';
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false, // Changed to false since persist will handle rehydration
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      console.log('authSlice: setUser called', action.payload?.email);
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    clearUser: (state) => {
      console.log('authSlice: clearUser called');
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setUser, clearUser, setLoading, setError } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
