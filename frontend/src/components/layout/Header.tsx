'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeSelectorModal } from '@/components/ui/ThemeSelectorModal';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [themeModalOpen, setThemeModalOpen] = useState(false);

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
            { path: '/dashboard', label: 'Dashboard', tourAttr: 'nav-dashboard' },
            { path: '/orbit',     label: 'Orbit',     tourAttr: 'nav-orbit' },
            { path: '/lumen',     label: 'Lumen',     tourAttr: 'nav-lumen' },
            { path: '/profile',   label: 'Profile',   tourAttr: 'nav-profile' },
          ].map(({ path, label, tourAttr }) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="transition-colors"
              data-tour={tourAttr}
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
          <button
            onClick={() => router.push('/methodology')}
            className="p-2 transition-colors"
            title="How Lumis works"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button className="p-2 text-tertiary hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={() => setThemeModalOpen(true)}
            className="p-2 transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
      <ThemeSelectorModal isOpen={themeModalOpen} onClose={() => setThemeModalOpen(false)} />
    </header>
  );
}
