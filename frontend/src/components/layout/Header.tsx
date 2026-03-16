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
    <header className="fixed top-0 left-0 right-0 z-50 border-b shadow-sm" style={{ background: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)' }}>
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
          <h2 className="text-primary font-medium tracking-tight text-xl">Lumis</h2>
        </button>
        
        {/* Navigation */}
        <nav className="flex items-center gap-12">
          {[
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/orbit',     label: 'Orbit'     },
            { path: '/lumen',     label: 'Lumen'     },
            { path: '/profile',   label: 'Profile'   },
          ].map(({ path, label }) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="transition-colors"
              style={{
                fontFamily: 'var(--font-rounded)',
                fontSize: 12,
                fontWeight: isActive(path) ? 700 : 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: isActive(path) ? 'var(--text-primary)' : 'var(--text-tertiary)',
                borderBottom: isActive(path) ? '1px solid var(--accent-primary)' : '1px solid transparent',
                paddingBottom: 2,
              }}
              onMouseEnter={(e) => { if (!isActive(path)) e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { if (!isActive(path)) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              {label}
            </button>
          ))}
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
