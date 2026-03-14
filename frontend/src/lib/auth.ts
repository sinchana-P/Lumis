/**
 * Auth Initialization Utilities
 * 
 * Handles authentication initialization on app startup, including
 * token validation and user state restoration.
 * 
 * Requirements: 4.3, 4.4
 * Property 14: Token validation on initialization
 */

/**
 * Check if route is public (doesn't require authentication)
 * 
 * @param pathname - Current route pathname
 * @returns true if route is public
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ['/login', '/signup', '/auth/callback'];
  // Only match exact root path, not all paths starting with /
  if (pathname === '/') return true;
  return publicRoutes.some(route => pathname.startsWith(route));
}
