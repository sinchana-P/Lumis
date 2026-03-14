import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Auth helper functions
export const authHelpers = {
  // Get current session from localStorage
  getSession: () => {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('lumis_session');
    return session ? JSON.parse(session) : null;
  },

  // Save session to localStorage
  setSession: (session: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lumis_session', JSON.stringify(session));
  },

  // Remove session from localStorage
  clearSession: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('lumis_session');
    localStorage.removeItem('lumis_user');
  },

  // Get access token
  getAccessToken: () => {
    const session = authHelpers.getSession();
    return session?.access_token || null;
  },

  // Get refresh token
  getRefreshToken: () => {
    const session = authHelpers.getSession();
    return session?.refresh_token || null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = authHelpers.getAccessToken();
    return !!token;
  },
};
