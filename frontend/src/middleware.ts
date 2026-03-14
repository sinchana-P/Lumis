import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle auth routes (login/signup) - let AuthInitializer handle protected routes
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // For now, we'll let the client-side AuthInitializer handle all route protection
  // since our tokens are in localStorage, not cookies
  
  // Only redirect auth routes if they have a session cookie (basic check)
  if (isAuthRoute) {
    // Check for any Supabase session indicators
    const hasSupabaseSession = request.cookies.get('sb-access-token')?.value;
    
    if (hasSupabaseSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
