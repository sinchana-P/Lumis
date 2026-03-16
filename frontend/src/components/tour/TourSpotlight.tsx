'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourSpotlightProps {
  target: string | null; // data-tour attribute value
  padding?: number;
  onClickOutside?: () => void;
}

function useTargetRect(target: string | null, padding = 8): SpotlightRect | null {
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  useEffect(() => {
    if (!target) { setRect(null); return; }

    let attempts = 0;
    const maxAttempts = 60; // 60 × 200ms = 12s — enough for slow page loads

    const find = () => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        // Element found but not yet painted (zero size) — retry
        if (r.width === 0 && r.height === 0) {
          if (++attempts < maxAttempts) { setTimeout(find, 200); return; }
        }
        setRect({
          top: r.top - padding,
          left: r.left - padding,
          width: r.width + padding * 2,
          height: r.height + padding * 2,
        });
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (++attempts < maxAttempts) {
        setTimeout(find, 200);
      }
    };

    find();

    const onResize = () => {
      attempts = 0; // reset retry counter on resize
      find();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [target, padding]);

  return rect;
}

export function TourSpotlight({ target, padding = 8, onClickOutside }: TourSpotlightProps) {
  const rect = useTargetRect(target, padding);

  if (typeof document === 'undefined') return null;

  const overlay = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        pointerEvents: 'all',
      }}
      onClick={onClickOutside}
    >
      {rect ? (
        <>
          {/* Four dark panels around the spotlight hole */}
          {/* Top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: rect.top, background: 'rgba(0,0,0,0.55)' }} />
          {/* Bottom */}
          <div style={{ position: 'absolute', top: rect.top + rect.height, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)' }} />
          {/* Left */}
          <div style={{ position: 'absolute', top: rect.top, left: 0, width: rect.left, height: rect.height, background: 'rgba(0,0,0,0.55)' }} />
          {/* Right */}
          <div style={{ position: 'absolute', top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height, background: 'rgba(0,0,0,0.55)' }} />
          {/* Spotlight border ring */}
          <div
            style={{
              position: 'absolute',
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              borderRadius: 10,
              boxShadow: '0 0 0 2px rgba(255,255,255,0.12)',
              pointerEvents: 'none',
            }}
          />
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}

export { useTargetRect };
