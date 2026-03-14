import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, clearUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { hasTokens, getTokens, clearTokens } from '@/lib/tokenStorage';
import { supabase } from '@/lib/supabase';

/**
 * Hook to initialize authentication state from localStorage tokens
 * This ensures Redux state is synced with stored tokens on app startup
 */
export function useAuthInit() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    const initAuth = async () => {
      console.log('useAuthInit: Initializing auth state...', { isAuthenticated });
      
      // If already authenticated in Redux, no need to check tokens
      if (isAuthenticated) {
        console.log('useAuthInit: Already authenticated in Redux');
        return;
      }

      // Check if we have tokens in localStorage
      if (!hasTokens()) {
        console.log('useAuthInit: No tokens found');
        dispatch(clearUser());
        return;
      }

      console.log('useAuthInit: Tokens found, getting user from Supabase...');
      
      try {
        // Get current session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          console.log('useAuthInit: No valid Supabase session, clearing tokens', { error });
          clearTokens();
          dispatch(clearUser());
          return;
        }

        // Create user object and set in Redux
        const user = {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || null,
          avatar_url: data.session.user.user_metadata?.avatar_url || data.session.user.user_metadata?.picture || null,
          provider: 'google' as const,
          analysis_depth_mode: 'full-spectrum' as const,
          created_at: data.session.user.created_at || new Date().toISOString(),
        };

        console.log('useAuthInit: Setting user in Redux:', user.email);
        dispatch(setUser(user));
        
      } catch (error) {
        console.error('useAuthInit: Error getting session:', error);
        clearTokens();
        dispatch(clearUser());
      }
    };

    initAuth();
  }, [dispatch, isAuthenticated]);

  return { isAuthenticated };
}