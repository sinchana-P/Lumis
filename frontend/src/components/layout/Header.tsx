'use client';

import { useRouter, usePathname } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary shadow-sm">
      <div className="flex items-center justify-between px-12 py-3">
        {/* Logo */}
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-accent-secondary rounded-full flex items-center justify-center text-inverse">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h2 className="text-primary font-bold tracking-tight text-xl">Lumis</h2>
        </button>
        
        {/* Navigation */}
        <nav className="flex items-center gap-12">
          <button 
            onClick={() => router.push('/dashboard')}
            className={`font-mono text-sm uppercase tracking-widest transition-colors ${
              isActive('/dashboard')
                ? 'text-primary border-b border-primary'
                : 'text-tertiary hover:text-primary'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => router.push('/members')}
            className={`font-mono text-sm uppercase tracking-widest transition-colors ${
              isActive('/members')
                ? 'text-primary border-b border-primary'
                : 'text-tertiary hover:text-primary'
            }`}
          >
            Members
          </button>
          <button 
            onClick={() => router.push('/numerology')}
            className={`font-mono text-sm uppercase tracking-widest transition-colors ${
              isActive('/numerology')
                ? 'text-primary border-b border-primary'
                : 'text-tertiary hover:text-primary'
            }`}
          >
            Lumen
          </button>
          <button 
            onClick={() => router.push('/profile')}
            className={`font-mono text-sm uppercase tracking-widest transition-colors ${
              isActive('/profile')
                ? 'text-primary border-b border-primary'
                : 'text-tertiary hover:text-primary'
            }`}
          >
            Profile
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="p-2 text-tertiary hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
