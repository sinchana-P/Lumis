import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, clearUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { clearTokens, storeTokens } from '@/lib/tokenStorage';
import { supabase } from '@/lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Hook to initialize and refresh authentication state on every app mount.
 * Always fetches the full user profile from GET /auth/me so that fields
 * like first_name, date_of_birth, etc. are always up-to-date regardless
 * of what is cached in redux-persist.
 */
export function useAuthInit() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          clearTokens();
          dispatch(clearUser());
          return;
        }

        const accessToken = data.session.access_token;

        // Always store latest tokens
        storeTokens({
          auth_token: accessToken,
          access_token: accessToken,
          refresh_token: data.session.refresh_token,
        });

        // Always fetch fresh full user profile from backend
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Cache-Control': 'no-cache',
            },
          });

          if (res.ok) {
            const json = await res.json();
            dispatch(setUser({
              ...json.data,
              provider: (data.session.user.app_metadata?.provider === 'google' ? 'google' : 'local') as 'google' | 'local',
            }));
            return;
          }
        } catch {
          // Fall through to minimal user below
        }

        // Fallback: minimal user from session metadata if /auth/me fails
        dispatch(setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.full_name || null,
          avatar_url: data.session.user.user_metadata?.avatar_url || null,
          provider: (data.session.user.app_metadata?.provider === 'google' ? 'google' : 'local') as 'google' | 'local',
          analysis_depth_mode: 'full-spectrum' as const,
          created_at: data.session.user.created_at || new Date().toISOString(),
        }));
      } catch {
        clearTokens();
        dispatch(clearUser());
      }
    };

    initAuth();
  }, [dispatch]);

  return { isAuthenticated };
}
