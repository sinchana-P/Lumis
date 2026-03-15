'use client';

import { useState } from 'react';

interface LuminaryControlsProps {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitAll: () => void;
  zoomLevel: number;
  memberCount: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  canResetZoom: boolean;
  canFitAll: boolean;
}

interface ToolbarButton {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  dividerAfter?: boolean;
}

export function LuminaryControls({
  onReset,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitAll,
  zoomLevel,
  memberCount,
  canZoomIn,
  canZoomOut,
  canResetZoom,
  canFitAll
}: LuminaryControlsProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  const buttons: ToolbarButton[] = [
    {
      label: 'Reset Layout',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      onClick: onReset,
      disabled: false,
      dividerAfter: true,
    },
    {
      label: 'Zoom In',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
        </svg>
      ),
      onClick: onZoomIn,
      disabled: !canZoomIn,
    },
    {
      label: 'Zoom Out',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6" />
        </svg>
      ),
      onClick: onZoomOut,
      disabled: !canZoomOut,
    },
    {
      label: 'Reset Zoom',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      onClick: onResetZoom,
      disabled: !canResetZoom,
      dividerAfter: true,
    },
    {
      label: 'Fit All',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ),
      onClick: onFitAll,
      disabled: !canFitAll,
    },
  ];

  return (
    <div
      className="absolute top-3 left-3 z-20 flex items-center gap-0 rounded-lg"
      style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--bg-tertiary)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'visible',
      }}
    >
      {buttons.map((btn) => (
        <div key={btn.label} className="relative flex items-center">
          <button
            onClick={btn.onClick}
            disabled={btn.disabled}
            onMouseEnter={() => setTooltip(btn.label)}
            onMouseLeave={() => setTooltip(null)}
            className="flex items-center justify-center w-8 h-8 transition-colors"
            style={{
              color: btn.disabled ? 'var(--text-disabled)' : 'var(--text-secondary)',
              cursor: btn.disabled ? 'not-allowed' : 'pointer',
              background: 'transparent',
            }}
            onMouseOver={(e) => {
              if (!btn.disabled) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            {btn.icon}
          </button>

          {/* Tooltip */}
          {tooltip === btn.label && (
            <div
              className="absolute bottom-full left-1/2 mb-1.5 px-2 py-1 rounded pointer-events-none whitespace-nowrap"
              style={{
                transform: 'translateX(-50%)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.05em',
                zIndex: 100,
              }}
            >
              {btn.label}
            </div>
          )}

          {/* Divider */}
          {btn.dividerAfter && (
            <div className="w-px h-4" style={{ background: 'var(--bg-tertiary)' }} />
          )}
        </div>
      ))}

      {/* Zoom level badge */}
      <div
        className="px-2 h-8 flex items-center"
        style={{ borderLeft: '1px solid var(--bg-tertiary)' }}
      >
        <span
          className="font-mono"
          style={{ fontSize: '12px', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}
        >
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>
    </div>
  );
}
