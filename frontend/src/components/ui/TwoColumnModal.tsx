'use client';

import { useEffect } from 'react';

interface TwoColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  header: string;
  saveLabel: string;
  saveColor?: string;
  canSave: boolean;
  saving: boolean;
  leftWidth?: number;
  left: React.ReactNode;
  right: React.ReactNode;
}

/**
 * Reusable two-column modal shell.
 * Left panel: compact/short fields (date, toggles, pills, selects).
 * Right panel: large text areas (title, description, resolution, examples).
 */
export function TwoColumnModal({
  isOpen, onClose, onSave,
  header, saveLabel, saveColor = 'var(--accent-primary)',
  canSave, saving,
  leftWidth = 260,
  left, right,
}: TwoColumnModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full"
        style={{
          maxWidth: 780,
          maxHeight: '92vh',
          background: 'var(--bg-primary)',
          border: '1px solid var(--bg-tertiary)',
          borderRadius: 16,
          boxShadow: '0 24px 56px rgba(0,0,0,0.16)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--bg-tertiary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', margin: 0 }}>
            {header}
          </p>
          <button
            type="button" onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px 4px', display: 'flex', alignItems: 'center' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* Left — compact fields */}
          <div
            style={{
              width: leftWidth,
              flexShrink: 0,
              borderRight: '1px solid var(--bg-tertiary)',
              padding: '20px 18px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {left}
          </div>

          {/* Right — large text areas */}
          <div
            style={{
              flex: 1,
              padding: '20px 22px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {right}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--bg-tertiary)', display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            type="button" onClick={onClose}
            className="font-mono uppercase tracking-widest"
            style={{ flex: 1, padding: '9px 0', fontSize: 10, borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button" onClick={onSave} disabled={!canSave}
            className="font-mono uppercase tracking-widest"
            style={{
              flex: 2, padding: '9px 0', fontSize: 10, borderRadius: 8, border: 'none',
              cursor: canSave ? 'pointer' : 'default',
              background: canSave ? saveColor : 'var(--bg-tertiary)',
              color: canSave ? '#fff' : 'var(--text-tertiary)',
              transition: 'background 200ms',
            }}
          >
            {saving ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
