'use client';

import { useTour } from '@/contexts/TourContext';

interface TourButtonProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function TourButton({ variant = 'default', className = '' }: TourButtonProps) {
  const { start } = useTour();

  if (variant === 'compact') {
    return (
      <button
        onClick={() => start()}
        className={`font-mono uppercase tracking-widest flex items-center gap-1.5 transition-all hover:opacity-100 ${className}`}
        style={{
          fontSize: 10,
          color: 'var(--text-secondary)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--bg-tertiary)',
          borderRadius: 20,
          cursor: 'pointer',
          padding: '5px 10px',
          opacity: 0.75,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Tour
      </button>
    );
  }

  return (
    <button
      onClick={() => start()}
      className={`flex items-center gap-2 font-mono uppercase tracking-widest transition-all ${className}`}
      style={{
        fontSize: 11,
        color: 'var(--text-secondary)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-tertiary)',
        borderRadius: 8,
        cursor: 'pointer',
        padding: '6px 12px',
      }}
    >
      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Platform Tour
    </button>
  );
}
