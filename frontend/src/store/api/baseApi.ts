import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '@/lib/tokenStorage';
import { Mutex } from 'async-mutex';

// Mutex to prevent multiple simultaneous refresh requests
const mutex = new Mutex();

/**
 * Base query with automatic token refresh on 401 responses
 * 
 * Subtask 9.1: Set up base query with token injection
 * Subtask 9.2: Implement automatic token refresh on 401
 * Requirements: 5.6, 5.7, 7.1, 7.5
 * Property 19: Automatic retry with token refresh on 401
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait for any ongoing refresh to complete
  await mutex.waitForUnlock();
  
  // Create base query with token injection
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    prepareHeaders: (headers) => {
      // Add authentication token to all requests
      const token = getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Add content type
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      
      return headers;
    },
  });
  
  // Try the original request
  let result = await baseQuery(args, api, extraOptions);

  // If we got a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    // Check if we're not already refreshing
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      
      try {
        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
          // No refresh token available, clear everything and redirect
          clearTokens();
          
          // Import and dispatch clearUser action
          const { clearUser } = await import('../slices/authSlice');
          api.dispatch(clearUser());
          
          if (typeof window !== 'undefined') {
            window.location.href = '/sign-in';
          }
          
          return result;
        }

        // Try to refresh the token
        const refreshResult = await fetchBaseQuery({
          baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
        })({
          url: '/auth/refresh',
          method: 'POST',
          body: { refresh_token: refreshToken },
        }, api, extraOptions);

        if (refreshResult.data) {
          const authResponse = refreshResult.data as any;
          
          // Store new tokens
          storeTokens(authResponse.data.tokens);
          
          // Update user state
          const { setUser } = await import('../slices/authSlice');
          api.dispatch(setUser(authResponse.data.user));
          
          // Retry the original request with new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed, clear tokens and redirect
          clearTokens();
          
          const { clearUser } = await import('../slices/authSlice');
          api.dispatch(clearUser());
          
          if (typeof window !== 'undefined') {
            window.location.href = '/sign-in';
          }
        }
      } finally {
        release();
      }
    } else {
      // Wait for the ongoing refresh to complete, then retry
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

// Base API configuration for RTK Query
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'UserNumerology',
    'UserVedic',
    'Traits',
    'UserTraits',
    'UserReport',
    'Members',
    'Member',
    'MemberNumerology',
    'MemberAstrology',
    'MemberVedic',
    'MemberTraits',
    'Incidents',
    'MemberIncidents',
    'Patterns',
    'MemberPatterns',
    'Interactions',
    'MemberInteractions',
    'MemberJournal',
    'MemberReport',
    'LumenConversations',
    'LumenMessages',
    'DashboardSummary',
    'Insights',
    'Notifications',
    'ShareLinks',
  ],
  endpoints: () => ({}),
});
