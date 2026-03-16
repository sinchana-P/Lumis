'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { type TourStep } from './tourSteps';

interface TourModalProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onEnd: () => void;
  speakerEnabled?: boolean;
  onToggleSpeaker?: () => void;
}

function useModalPosition(
  target: string | null,
  position: TourStep['position'],
  padding = 8,
) {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
  });

  useEffect(() => {
    if (!target || position === 'center') {
      setStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)',
      });
      return;
    }

    const MODAL_W = 296;
    const MODAL_H = 220; // estimate
    const GAP = 16;

    const compute = () => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top = 0, left = 0;

      switch (position) {
        case 'bottom':
          top = r.bottom + padding + GAP;
          left = r.left + r.width / 2 - MODAL_W / 2;
          break;
        case 'top':
          top = r.top - padding - GAP - MODAL_H;
          left = r.left + r.width / 2 - MODAL_W / 2;
          break;
        case 'right':
          top = r.top + r.height / 2 - MODAL_H / 2;
          left = r.right + padding + GAP;
          break;
        case 'left':
          top = r.top + r.height / 2 - MODAL_H / 2;
          left = r.left - padding - GAP - MODAL_W;
          break;
        default:
          top = r.bottom + padding + GAP;
          left = r.left + r.width / 2 - MODAL_W / 2;
      }

      // Clamp to viewport
      left = Math.max(12, Math.min(left, vw - MODAL_W - 12));
      top = Math.max(12, Math.min(top, vh - MODAL_H - 12));

      setStyle({ position: 'fixed', top, left });
    };

    let attempts = 0;
    const tryCompute = () => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      if (el) { compute(); }
      else if (++attempts < 20) { setTimeout(tryCompute, 150); }
    };
    tryCompute();

    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [target, position, padding]);

  return style;
}

export function TourModal({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onEnd,
  speakerEnabled = false,
  onToggleSpeaker,
}: TourModalProps) {
  const modalStyle = useModalPosition(step.target, step.position, step.spotlightPadding);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  if (typeof document === 'undefined') return null;

  const modal = (
    <div
      style={{
        ...modalStyle,
        zIndex: 9995,
        width: 296,
      }}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--bg-tertiary)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Progress bar */}
        <div style={{ height: 2, background: 'var(--bg-tertiary)' }}>
          <div
            style={{
              height: '100%',
              width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              background: 'var(--accent-primary)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 12px' }}>
          {/* Step counter + title */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span
              className="font-mono"
              style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase', flexShrink: 0 }}
            >
              {stepIndex + 1} / {totalSteps}
            </span>
            <h3
              className="font-serif"
              style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}
            >
              {step.title}
            </h3>
          </div>

          {/* Body */}
          <p
            className="font-serif"
            style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 300 }}
          >
            {step.body}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--bg-tertiary)' }} />

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            gap: 6,
          }}
        >
          {/* Speaker placeholder */}
          <button
            onClick={onToggleSpeaker}
            title="Audio guide (coming soon)"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'default',
              padding: '4px 5px',
              borderRadius: 6,
              color: 'var(--text-tertiary)',
              opacity: 0.35,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
            </svg>
          </button>

          <div style={{ flex: 1 }} />

          {/* Skip */}
          <button
            onClick={onEnd}
            className="font-mono"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 10,
              color: 'var(--text-tertiary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '4px 6px',
              borderRadius: 5,
            }}
          >
            Skip
          </button>

          {/* Prev */}
          {!isFirst && (
            <button
              onClick={onPrev}
              className="font-mono"
              style={{
                background: 'none',
                border: '1px solid var(--bg-tertiary)',
                cursor: 'pointer',
                fontSize: 10,
                color: 'var(--text-secondary)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: 6,
              }}
            >
              Back
            </button>
          )}

          {/* Next / Finish */}
          <button
            onClick={isLast ? onEnd : onNext}
            className="font-mono"
            style={{
              background: 'var(--accent-primary)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 10,
              color: '#fff',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '4px 12px',
              borderRadius: 6,
            }}
          >
            {isLast ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
