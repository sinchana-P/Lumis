'use client';

import { useEffect } from 'react';

interface ConfirmDeleteModalProps {
  /** Short label shown in the mono header, e.g. "Remove Trait", "Delete Member" */
  title?: string;
  /** A snippet of the item being deleted — shown quoted in serif */
  itemLabel?: string;
  /** Custom warning message — defaults to the standard line */
  message?: string;
  /** Text on the confirm button — defaults to "Remove" */
  confirmLabel?: string;
  /** Whether the delete mutation is in flight */
  deleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  title = 'Remove',
  itemLabel,
  message = 'This will be removed permanently. Are you sure?',
  confirmLabel = 'Remove',
  deleting = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
        onClick={onCancel}
      />
      <div
        className="relative w-full"
        style={{
          maxWidth: 360,
          background: 'var(--bg-primary)',
          border: '1px solid var(--bg-tertiary)',
          borderRadius: 16,
          boxShadow: '0 20px 48px rgba(0,0,0,0.12)',
          padding: '24px 24px 20px',
        }}
      >
        <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 12 }}>
          {title}
        </p>

        {itemLabel && (
          <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 6 }}>
            "{itemLabel.length > 80 ? itemLabel.slice(0, 80) + '…' : itemLabel}"
          </p>
        )}

        <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24 }}>
          {message}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="font-rounded uppercase tracking-widest"
            style={{
              flex: 1, padding: '9px 0', fontSize: 10, borderRadius: 8,
              border: '1px solid var(--bg-tertiary)', background: 'transparent',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="font-rounded uppercase tracking-widest"
            style={{
              flex: 1, padding: '9px 0', fontSize: 10, borderRadius: 8,
              border: 'none', cursor: deleting ? 'default' : 'pointer',
              background: '#C47A7A', color: '#fff',
              opacity: deleting ? 0.6 : 1, transition: 'opacity 150ms',
            }}
          >
            {deleting ? 'Removing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
