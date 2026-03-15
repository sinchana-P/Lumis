import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let subscription: any = null;

    const initializeAuth = async () => {
      try {
        // Lazy import supabase to avoid build-time initialization
        const { supabase, authHelpers } = await import('@/lib/supabase');
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession) {
          authHelpers.setSession(currentSession);
        }

        // Listen for auth changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, currentSession: Session | null) => {
            console.log('Auth state changed:', event);
            
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (currentSession) {
              authHelpers.setSession(currentSession);
            } else {
              authHelpers.clearSession();
            }

            // Handle specific events
            if (event === 'SIGNED_IN') {
              router.push('/');
            } else if (event === 'SIGNED_OUT') {
              router.push('/login');
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed successfully');
            }
          }
        );

        subscription = authSubscription;
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [router]);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  };
}
