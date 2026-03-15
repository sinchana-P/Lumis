'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { useSignOutMutation } from '@/store/api/authApi';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '✦' },
  { name: 'Members', href: '/orbit', icon: '◉' },
  { name: 'Lumen', href: '/lumen', icon: '◈' },
  { name: 'Insights', href: '/insights', icon: '◇' },
  { name: 'Profile', href: '/profile', icon: '◎' },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [signOut, { isLoading: isSigningOut }] = useSignOutMutation();

  /**
   * Handle sign out
   * 
   * Subtask 16.1: Create sign out function
   * - Call signOut mutation
   * - Clear all tokens from localStorage (handled by mutation)
   * - Clear auth slice state (handled by mutation)
   * - Redirect to sign in page (handled by mutation)
   * - Handle backend errors gracefully (still clear tokens)
   * 
   * Requirements: 6.1, 6.3, 6.4, 6.5
   * Property 20: Sign out API invocation
   * Property 22: Token cleanup on sign out
   */
  const handleSignOut = async () => {
    try {
      await signOut().unwrap();
      // Mutation handles token clearing, state clearing, and redirect
    } catch (error) {
      // Even if backend fails, mutation still clears tokens and redirects
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-lumis-text-primary/20 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 lg:static',
          'bg-surface-elevated border-r border-primary',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-primary px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary text-white">
              <span className="text-lg">✦</span>
            </div>
            <h1 className="font-serif text-xl font-medium tracking-tight text-primary">
              Lumis
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 font-serif text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-accent-primary/10 text-accent-primary border-l-2 border-accent-primary'
                      : 'text-secondary hover:bg-surface hover:text-primary'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-primary p-4 space-y-3">
            {/* Sign Out Button - Subtask 16.2 */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={cn(
                'w-full flex items-center gap-3 rounded-md px-3 py-2.5 font-serif text-sm font-medium transition-all duration-200',
                'text-secondary hover:bg-surface hover:text-primary',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <span className="text-lg">⎋</span>
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
            
            <p className="font-mono text-xs uppercase tracking-widest text-tertiary opacity-50">
              Designed for clarity & connection
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
