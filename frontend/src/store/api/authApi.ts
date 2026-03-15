/**
 * Auth API Slice
 * 
 * RTK Query API slice for authentication endpoints with automatic token refresh.
 * Extends baseApi with auth-specific endpoints and token management.
 * 
 * Features:
 * - Automatic token injection via baseApi
 * - Automatic token refresh on 401 responses
 * - Token storage after successful authentication
 * - Auth state updates via onQueryStarted hooks
 */

import { baseApi } from './baseApi';
import { storeTokens, clearTokens } from '@/lib/tokenStorage';
import { setUser, clearUser } from '../slices/authSlice';
import type { User } from '../slices/authSlice';

// Response types matching backend API structure
interface AuthTokens {
  auth_token: string;
  access_token: string;
  refresh_token: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
  meta: {
    timestamp: string;
    request_id: string;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    request_id: string;
  };
}

// Request DTOs matching backend
interface GoogleCallbackRequest {
  code: string;
}

interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface SignInRequest {
  email: string;
  password: string;
}

interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Auth API endpoints
 * 
 * Subtask 9.3: Create auth API endpoints
 * Subtask 9.4: Implement token storage on successful authentication
 * Requirements: 1.2, 2.2, 3.1, 5.1, 6.1
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Google OAuth callback endpoint
     * 
     * Requirements: 1.2, 1.3, 1.4, 1.5
     * Property 1: Google OAuth callback API invocation
     * Property 2: Backend token exchange for valid OAuth codes
     */
    googleCallback: builder.mutation<AuthResponse, GoogleCallbackRequest>({
      query: (credentials) => ({
        url: '/auth/google/callback',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Store tokens in localStorage
          storeTokens(data.data.tokens);
          
          // Update auth state with user data
          dispatch(setUser(data.data.user));
        } catch (error) {
          // Error handling is done by RTK Query
          console.error('Google callback failed:', error);
        }
      },
      invalidatesTags: ['User'],
    }),

    /**
     * Sign up endpoint
     * 
     * Requirements: 2.2, 2.6, 2.7
     * Property 7: Valid credentials trigger API call
     * Property 9: User account creation
     */
    signUp: builder.mutation<AuthResponse, SignUpRequest>({
      query: (credentials) => ({
        url: '/auth/signup',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Store tokens in localStorage
          storeTokens(data.data.tokens);
          
          // Update auth state with user data
          dispatch(setUser(data.data.user));
        } catch (error) {
          console.error('Sign up failed:', error);
        }
      },
      invalidatesTags: ['User'],
    }),

    /**
     * Sign in endpoint
     * 
     * Requirements: 3.1, 3.4, 3.5
     * Property 7: Valid credentials trigger API call
     * Property 12: User authentication via Supabase
     */
    signIn: builder.mutation<AuthResponse, SignInRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Store tokens in localStorage
          storeTokens(data.data.tokens);
          
          // Update auth state with user data
          dispatch(setUser(data.data.user));
        } catch (error) {
          console.error('Sign in failed:', error);
        }
      },
      invalidatesTags: ['User'],
    }),

    /**
     * Refresh token endpoint
     * 
     * Requirements: 5.1, 5.2, 5.3, 5.4
     * Property 16: Automatic token refresh on expiration
     * Property 17: Backend token refresh processing
     */
    refreshToken: builder.mutation<AuthResponse, RefreshTokenRequest>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Update tokens in localStorage
          storeTokens(data.data.tokens);
          
          // Update auth state with user data
          dispatch(setUser(data.data.user));
        } catch (error) {
          // If refresh fails, clear tokens and redirect
          clearTokens();
          dispatch(clearUser());
          
          if (typeof window !== 'undefined') {
            window.location.href = '/sign-in';
          }
        }
      },
    }),

    /**
     * Sign out endpoint
     * 
     * Requirements: 6.1, 6.2, 6.3, 6.4
     * Property 20: Sign out API invocation
     * Property 22: Token cleanup on sign out
     */
    signOut: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          // Even if backend fails, still clear local state
          console.error('Sign out request failed:', error);
        } finally {
          // Always clear tokens and user state
          clearTokens();
          dispatch(clearUser());
          
          // Redirect to sign in page
          if (typeof window !== 'undefined') {
            window.location.href = '/sign-in';
          }
        }
      },
      invalidatesTags: ['User'],
    }),

    /**
     * Validate token endpoint
     * 
     * Requirements: 4.4, 7.2
     * Property 14: Token validation on initialization
     */
    validateToken: builder.query<{ success: boolean; data: { user: User } }, void>({
      query: () => '/auth/validate',
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Update auth state with validated user data
          dispatch(setUser(data.data.user));
        } catch (error) {
          // If validation fails, clear tokens
          clearTokens();
          dispatch(clearUser());
        }
      },
      providesTags: ['User'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGoogleCallbackMutation,
  useSignUpMutation,
  useSignInMutation,
  useRefreshTokenMutation,
  useSignOutMutation,
  useValidateTokenQuery,
  useLazyValidateTokenQuery,
} = authApi;
