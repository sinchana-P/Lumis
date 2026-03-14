import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, authHelpers } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession) {
          authHelpers.setSession(currentSession);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
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

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  };
}
