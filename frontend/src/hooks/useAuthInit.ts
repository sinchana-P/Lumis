import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, clearUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { clearTokens } from '@/lib/tokenStorage';
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
      // If already authenticated in Redux, no need to check
      if (isAuthenticated) return;

      try {
        // Always check Supabase session directly — it persists its own keys
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          clearTokens();
          dispatch(clearUser());
          return;
        }

        const user = {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || null,
          avatar_url: data.session.user.user_metadata?.avatar_url || data.session.user.user_metadata?.picture || null,
          provider: (data.session.user.app_metadata?.provider === 'google' ? 'google' : 'local') as 'google' | 'local',
          analysis_depth_mode: 'full-spectrum' as const,
          created_at: data.session.user.created_at || new Date().toISOString(),
        };

        dispatch(setUser(user));
      } catch (error) {
        clearTokens();
        dispatch(clearUser());
      }
    };

    initAuth();
  }, [dispatch, isAuthenticated]);

  return { isAuthenticated };
}