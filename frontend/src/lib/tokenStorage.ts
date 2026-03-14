/**
 * Token Storage Utilities
 * 
 * Manages authentication tokens in localStorage with specific key names
 * as defined in the authentication-flows spec.
 * 
 * Keys used:
 * - lumis_auth_token: Primary authentication token (JWT, 15 min expiration)
 * - lumis_access_token: API authorization token (JWT, 15 min expiration)
 * - lumis_refresh_token: Token refresh token (7 day expiration)
 */

export interface AuthTokens {
  auth_token: string;
  access_token: string;
  refresh_token: string;
}

const TOKEN_KEYS = {
  AUTH_TOKEN: 'lumis_auth_token',
  ACCESS_TOKEN: 'lumis_access_token',
  REFRESH_TOKEN: 'lumis_refresh_token',
} as const;

/**
 * Store all three authentication tokens in localStorage
 * 
 * @param tokens - Object containing auth_token, access_token, and refresh_token
 * 
 * Requirements: 4.1, 4.2, 4.5, 4.6, 4.7
 * Property 3: Token storage completeness
 */
export function storeTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(TOKEN_KEYS.AUTH_TOKEN, tokens.auth_token);
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  } catch (error) {
    console.error('Failed to store tokens:', error);
    throw new Error('Failed to store authentication tokens');
  }
}

/**
 * Retrieve all three authentication tokens from localStorage
 * 
 * @returns Object with all three tokens, or null if any token is missing
 * 
 * Requirements: 4.2, 4.3
 */
export function getTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;

  try {
    const auth_token = localStorage.getItem(TOKEN_KEYS.AUTH_TOKEN);
    const access_token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const refresh_token = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);

    // Return null if any token is missing
    if (!auth_token || !access_token || !refresh_token) {
      return null;
    }

    return {
      auth_token,
      access_token,
      refresh_token,
    };
  } catch (error) {
    console.error('Failed to retrieve tokens:', error);
    return null;
  }
}

/**
 * Get only the access token from localStorage
 * Used for API request authentication
 * 
 * @returns Access token string or null if not found
 * 
 * Requirements: 4.2, 7.1
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
}

/**
 * Get only the refresh token from localStorage
 * Used for token refresh operations
 * 
 * @returns Refresh token string or null if not found
 * 
 * Requirements: 5.1
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
}

/**
 * Get only the auth token from localStorage
 * 
 * @returns Auth token string or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(TOKEN_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Failed to retrieve auth token:', error);
    return null;
  }
}

/**
 * Remove all authentication tokens from localStorage
 * Used during sign out or when tokens are invalid
 * 
 * Requirements: 6.3, 5.6
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(TOKEN_KEYS.AUTH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
}

/**
 * Check if tokens exist in localStorage
 * 
 * @returns true if all three tokens exist, false otherwise
 * 
 * Requirements: 4.3
 */
export function hasTokens(): boolean {
  return getTokens() !== null;
}
