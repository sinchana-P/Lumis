'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const PAGES = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/orbit',     label: 'Orbit'     },
  { path: '/lumen',     label: 'Lumen'     },
  { path: '/profile',   label: 'Profile'   },
];

const HIDDEN_ON = ['/', '/login', '/signup', '/auth'];

export function BottomNav() {
  const router   = useRouter();
  const pathname = usePathname();

  const hidden = HIDDEN_ON.some(p => pathname === p || pathname.startsWith('/auth'));

  const activeIndex = PAGES.findIndex(p =>
    p.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(p.path)
  );

  const navigate = (index: number) => {
    if (index >= 0 && index < PAGES.length) router.push(PAGES[index].path);
  };

  useGlobalSwipe(activeIndex, navigate);

  if (hidden || activeIndex === -1) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 32,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 4,
      }}
    >
      {PAGES.map((page, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={page.path}
            title={page.label}
            onClick={() => navigate(i)}
            style={{
              width:  isActive ? 10 : 5,
              height: isActive ? 10 : 5,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              transition: 'width 280ms cubic-bezier(0.4,0,0.2,1), height 280ms cubic-bezier(0.4,0,0.2,1), background 280ms ease, opacity 280ms ease',
              background: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              opacity: isActive ? 1 : 0.3,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Global swipe/drag hook ── */
function useGlobalSwipe(activeIndex: number, onSwipe: (index: number) => void) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        onSwipe(dx < 0 ? activeIndex + 1 : activeIndex - 1);
      }
      startX.current = null;
      startY.current = null;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend',   onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend',   onTouchEnd);
    };
  }, [activeIndex, onSwipe]);
}
