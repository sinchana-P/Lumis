import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabaseClient: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // During build time or if env vars are missing, return a mock client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found. Using mock client.');
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      }),
    } as any;
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
  
  return supabaseClient;
};

export const supabase = getSupabaseClient();

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
