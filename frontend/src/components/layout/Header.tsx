'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { ThemeSelectorModal } from '@/components/ui/ThemeSelectorModal';
import { clearUser } from '@/store/slices/authSlice';
import { clearTokens } from '@/lib/tokenStorage';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    clearTokens();
    dispatch(clearUser());
    router.push('/login');
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
        <div className="flex items-center gap-4">
          {/* Theme */}
          <button
            onClick={() => setThemeModalOpen(true)}
            className="p-2 transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            title="Change Theme"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 2C6.477 2 2 6.477 2 12c0 5.522 4.477 10 10 10a2 2 0 002-2c0-.535-.215-1.02-.557-1.371a2 2 0 011.435-3.408H17a5 5 0 005-5c0-4.418-4.477-8-10-8z" />
              <circle cx="8.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
            </svg>
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="p-2 transition-colors"
              style={{ color: userMenuOpen ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => { if (!userMenuOpen) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              title="Account"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
              </svg>
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-1 py-1"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--bg-tertiary)',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  minWidth: 160,
                  zIndex: 100,
                }}
              >
                {[
                  { label: 'My Self', path: '/profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
                  { label: 'The Alchemy', path: '/methodology', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                ].map(({ label, path, icon }) => (
                  <button
                    key={label}
                    onClick={() => { setUserMenuOpen(false); router.push(path); }}
                    className="w-full flex items-center gap-3 px-4 py-1.5 transition-colors text-left"
                    style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                    <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 500 }}>{label}</span>
                  </button>
                ))}

                <div style={{ height: 1, background: 'var(--bg-tertiary)', margin: '4px 0' }} />

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-1.5 transition-colors text-left"
                  style={{ color: '#C0504A', background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 500 }}>Go Quiet</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ThemeSelectorModal isOpen={themeModalOpen} onClose={() => setThemeModalOpen(false)} />
    </header>
  );
}
