'use client';

import type { ReactNode } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type AnalysisDepthMode = 'cosmic' | 'behavioral' | 'full-spectrum';

interface AnalysisDepthModeConfig {
  id: AnalysisDepthMode;
  label: string;
  tagline: string;
  icon: ReactNode;
  description: string;
  color: string;
}

// Crescent moon — Cosmic
const IconCosmic = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// Ascending bars — Behavioral
const IconBehavioral = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="6"  y1="20" x2="6"  y2="14" />
    <line x1="12" y1="20" x2="12" y2="6"  />
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="3"  y1="20" x2="21" y2="20" />
  </svg>
);

// Eight-point asterisk — Full Spectrum
const IconFullSpectrum = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="12" y1="2"    x2="12" y2="22"   />
    <line x1="2"  y1="12"   x2="22" y2="12"   />
    <line x1="4.93" y1="4.93"   x2="19.07" y2="19.07" />
    <line x1="19.07" y1="4.93" x2="4.93"  y2="19.07" />
  </svg>
);

const ANALYSIS_DEPTH_MODES: AnalysisDepthModeConfig[] = [
  {
    id: 'cosmic',
    label: 'Cosmic',
    tagline: 'Insights from the stars and numbers',
    icon: <IconCosmic />,
    description: 'Uses only numerology and astrology data',
    color: 'var(--accent-gold)',
  },
  {
    id: 'behavioral',
    label: 'Behavioral',
    tagline: "Insights from what you've observed",
    icon: <IconBehavioral />,
    description: 'Uses only logged traits, incidents, and patterns',
    color: 'var(--accent-primary)',
  },
  {
    id: 'full-spectrum',
    label: 'Full Spectrum',
    tagline: 'Complete insights from all sources',
    icon: <IconFullSpectrum />,
    description: 'Uses all available data for comprehensive analysis',
    color: 'var(--accent-ai)',
  },
];

// ─── Component (kept for potential future use) ──────────────────────────────────

interface AnalysisDepthSelectorProps {
  currentDepth: AnalysisDepthMode;
  onDepthChange: (depth: AnalysisDepthMode) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}

export function AnalysisDepthSelector({
  currentDepth,
  onDepthChange,
  showDropdown,
  setShowDropdown,
}: AnalysisDepthSelectorProps) {
  const currentMode = ANALYSIS_DEPTH_MODES.find((m) => m.id === currentDepth)!;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 transition-all duration-200"
        style={{
          padding: '6px 12px',
          background: 'transparent',
          border: '1px solid var(--bg-tertiary)',
          borderRadius: 8,
          cursor: 'pointer',
          color: 'var(--text-secondary)',
        }}
      >
        {currentMode.icon}
        <span className="font-mono uppercase tracking-wider" style={{ fontSize: 'clamp(9px, 0.9vw, 11px)', color: 'var(--text-secondary)' }}>
          {currentMode.label}
        </span>
        <svg
          width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ color: 'var(--text-tertiary)', transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div
          className="absolute top-full right-0 mt-2 z-50"
          style={{ width: 280, background: 'var(--bg-primary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10 }}
        >
          <div className="px-4 pt-3 pb-1">
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
              Analysis Depth
            </p>
          </div>
          {ANALYSIS_DEPTH_MODES.map((mode, i) => (
            <button
              key={mode.id}
              onClick={() => { onDepthChange(mode.id); setShowDropdown(false); }}
              className="w-full text-left transition-all duration-150"
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderTop: i > 0 ? '1px solid var(--bg-tertiary)' : 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              <div className="flex items-start gap-3">
                <span style={{ marginTop: 2, flexShrink: 0 }}>{mode.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-serif" style={{ fontSize: 'clamp(13px, 1.2vw, 15px)', color: currentDepth === mode.id ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {mode.label}
                    </span>
                    {mode.id === 'full-spectrum' && (
                      <span className="font-mono uppercase tracking-wider" style={{ fontSize: 12, color: 'var(--accent-gold)' }}>
                        Recommended
                      </span>
                    )}
                    {currentDepth === mode.id && (
                      <div className="w-1 h-1 rounded-full ml-auto" style={{ background: 'var(--accent-primary)' }} />
                    )}
                  </div>
                  <p className="font-mono" style={{ fontSize: 'clamp(9px, 0.85vw, 11px)', color: 'var(--text-tertiary)' }}>
                    {mode.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
          <div style={{ height: 8 }} />
        </div>
      )}
    </div>
  );
}

export type { AnalysisDepthMode };
export { ANALYSIS_DEPTH_MODES };
