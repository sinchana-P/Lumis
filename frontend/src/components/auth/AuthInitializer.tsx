'use client';

/**
 * AuthInitializer Component
 * 
 * Handles authentication initialization on app startup.
 * Waits for Redux Persist rehydration before checking auth state.
 * 
 * Requirements: 4.3, 4.4
 * Property 14: Token validation on initialization
 */

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { useAuthInit } from '@/hooks/useAuthInit';
import { isPublicRoute } from '@/lib/auth';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isRehydrated, setIsRehydrated] = useState(false);
  
  // Initialize auth state from tokens
  useAuthInit();
  
  // Get auth state from Redux
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const pathname = usePathname();
  const router = useRouter();

  // Wait for Redux Persist to rehydrate
  useEffect(() => {
    const checkRehydration = () => {
      // Check if persist has rehydrated by looking at localStorage
      const persistState = localStorage.getItem('persist:lumis-root');
      if (persistState) {
        try {
          const parsed = JSON.parse(persistState);
          if (parsed._persist && JSON.parse(parsed._persist).rehydrated) {
            console.log('AuthInitializer: Redux Persist rehydrated');
            setIsRehydrated(true);
            return;
          }
        } catch (e) {
          console.error('Error parsing persist state:', e);
        }
      }
      
      // If no persist state, consider it rehydrated (first time user)
      setIsRehydrated(true);
    };

    // Check immediately and also after a short delay
    checkRehydration();
    const timeout = setTimeout(checkRehydration, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Only run redirect logic after rehydration
    if (!isRehydrated) {
      console.log('AuthInitializer: Waiting for rehydration...');
      return;
    }

    console.log('AuthInitializer: Effect running after rehydration', { isAuthenticated, pathname });
    
    // Redirect logic based on authentication state
    if (!isAuthenticated && !isPublicRoute(pathname)) {
      console.log('AuthInitializer: Not authenticated, redirecting to login', { 
        isAuthenticated, 
        pathname, 
        isPublic: isPublicRoute(pathname) 
      });
      router.push('/login');
    } else if (isAuthenticated && pathname === '/') {
      console.log('AuthInitializer: Authenticated on root, redirecting to dashboard');
      router.push('/dashboard');
    } else {
      console.log('AuthInitializer: No redirect needed', { isAuthenticated, pathname });
    }
  }, [isAuthenticated, pathname, router, isRehydrated]);

  // Show loading while waiting for rehydration
  if (!isRehydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="animate-spin h-8 w-8 border-2 border-accent-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <>{children}</>;
}
