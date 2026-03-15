'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthErrorDisplay } from '@/components/auth/AuthErrorDisplay';

/**
 * OAuth Callback Page
 * 
 * Handles the OAuth callback from Google, exchanges the authorization code
 * for tokens via the backend API, and redirects to the dashboard.
 * 
 * Subtask 12.3: Create OAuth callback page
 * Requirements: 1.2, 1.7
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Lazy import supabase to avoid build-time initialization
        const { supabase } = await import('@/lib/supabase');
        
        // Handle Supabase OAuth callback (tokens in URL fragment)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase session error:', error);
          setError('Unable to complete sign in. Please try again.');
          return;
        }

        if (!data.session) {
          setError('No session found. Please try signing in again.');
          return;
        }

        // Store tokens in localStorage
        const tokens = {
          auth_token: data.session.access_token,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        };
        
        // Import and use token storage
        const { storeTokens } = await import('@/lib/tokenStorage');
        storeTokens(tokens);

        // Create user object from Supabase session
        const user = {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || null,
          avatar_url: data.session.user.user_metadata?.avatar_url || data.session.user.user_metadata?.picture || null,
          provider: 'google' as const,
          analysis_depth_mode: 'full-spectrum' as const, // Default for new users
          created_at: new Date().toISOString(),
        };

        // Update auth state
        const { setUser } = await import('@/store/slices/authSlice');
        const { store } = await import('@/store');
        store.dispatch(setUser(user));

        // Check if user has completed onboarding (you can add this logic later)
        // For now, redirect to dashboard
        router.push('/dashboard');
        
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError('Unable to complete sign in. Please try again.');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
      <div className="w-full max-w-md space-y-6">
        {/* Lumis Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif text-primary">
            ✦ LUMIS
          </h1>
        </div>

        {/* Main Content Card */}
        <div className="card space-y-6">
          {error ? (
            // Error State
            <>
              <AuthErrorDisplay 
                error={error}
                onDismiss={() => setError(null)}
              />
              
              <div className="text-center space-y-4">
                <p className="text-secondary font-serif">
                  Something went wrong during sign in.
                </p>
                
                <button
                  onClick={() => router.push('/login')}
                  className="btn btn-primary w-full"
                >
                  Return to Sign In
                </button>
              </div>
            </>
          ) : (
            // Loading State
            <div className="text-center space-y-4 py-8">
              {/* Loading Spinner */}
              <div className="flex justify-center">
                <svg
                  className="animate-spin h-12 w-12 text-accent-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              
              <p className="text-secondary font-serif">
                Completing sign in...
              </p>
              
              <p className="text-xs text-tertiary font-sans">
                Please wait while we securely authenticate your account
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
