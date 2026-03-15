'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSignOutMutation } from '@/store/api/authApi';

const navigation = [
  { name: 'Home', href: '/', icon: '✦' },
  { name: 'Members', href: '/orbit', icon: '◉' },
  { name: 'Lumen', href: '/lumen', icon: '◈' },
  { name: 'Insights', href: '/insights', icon: '◇' },
  { name: 'Profile', href: '/profile', icon: '◎' },
];

export function MobileNav() {
  const pathname = usePathname();
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-surface-elevated border-t border-primary">
      <div className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-accent-primary bg-accent-primary/10'
                  : 'text-tertiary hover:text-primary'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-serif text-xs font-medium uppercase tracking-wider">
                {item.name}
              </span>
            </Link>
          );
        })}
        
        {/* Sign Out Button - Subtask 16.2 */}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]',
            'text-tertiary hover:text-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <span className="text-xl">⎋</span>
          <span className="font-serif text-xs font-medium uppercase tracking-wider">
            {isSigningOut ? 'Out' : 'Sign Out'}
          </span>
        </button>
      </div>
    </nav>
  );
}
