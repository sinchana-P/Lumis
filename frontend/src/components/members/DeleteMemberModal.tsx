'use client';

import { useState } from 'react';
import { useDeleteMemberMutation } from '@/store/api/membersApi';
import type { Member } from '@/store/api/membersApi';

interface DeleteMemberModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteMemberModal({ member, isOpen, onClose, onSuccess }: DeleteMemberModalProps) {
  const [deleteMember, { isLoading }] = useDeleteMemberMutation();
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const isConfirmed = confirmText.toLowerCase() === member.fullName.toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;
    try {
      await deleteMember(member.id).unwrap();
      onSuccess?.();
      onClose();
      setConfirmText('');
      setError('');
    } catch (err: any) {
      setError(err.data?.error?.message || 'Failed to delete luminary');
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
    setConfirmText('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full" style={{
        maxWidth: 360,
        background: 'var(--bg-primary)',
        border: '1px solid var(--bg-tertiary)',
        borderRadius: 14,
        boxShadow: '0 20px 48px rgba(0,0,0,0.18)',
        padding: '24px 24px 20px',
      }}>
        {/* Title */}
        <p className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>
          Remove <span style={{ fontStyle: 'italic' }}>{member.fullName}</span>?
        </p>
        <p className="font-serif" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
          This permanently removes them from your orbit. All logs, patterns, and insights will be lost.
        </p>

        {error && (
          <p className="font-serif italic" style={{ fontSize: 12, color: '#e07070', marginBottom: 12 }}>{error}</p>
        )}

        {/* Confirm input */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8 }}>
            Type "{member.fullName}" to confirm
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => { setConfirmText(e.target.value); setError(''); }}
            placeholder={member.fullName}
            disabled={isLoading}
            autoFocus
            className="w-full font-serif outline-none focus:outline-none"
            style={{
              fontSize: 13,
              padding: '8px 12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-tertiary)',
              borderRadius: 8,
              color: 'var(--text-primary)',
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' && isConfirmed) handleDelete(); }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="font-mono uppercase tracking-widest transition-colors"
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: 10,
              borderRadius: 8,
              border: '1px solid var(--bg-tertiary)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: isLoading ? 'default' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isLoading}
            className="font-mono uppercase tracking-widest transition-all"
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: 10,
              borderRadius: 8,
              border: 'none',
              background: isConfirmed ? '#c0504d' : 'var(--bg-tertiary)',
              color: isConfirmed ? '#fff' : 'var(--text-tertiary)',
              cursor: !isConfirmed || isLoading ? 'default' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}
