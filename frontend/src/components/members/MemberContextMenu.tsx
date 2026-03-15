'use client';

import React, { useEffect, useRef } from 'react';
import type { Member } from '@/store/api/membersApi';

interface MemberContextMenuProps {
  member: Member;
  position: { x: number; y: number };
  isOpen: boolean;
  onClose: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MemberContextMenu({ member, position, isOpen, onClose, onView, onEdit, onDelete }: MemberContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iconBtn = (title: string, onClick: () => void, icon: React.ReactNode, danger = false) => (
    <button
      onClick={() => { onClick(); onClose(); }}
      title={title}
      className="transition-colors flex items-center justify-center"
      style={{
        width: 32, height: 32,
        borderRadius: 6,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: danger ? '#c0504d' : 'var(--text-secondary)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? 'rgba(192,80,77,0.08)' : 'var(--bg-tertiary)';
        e.currentTarget.style.color = danger ? '#c0504d' : 'var(--text-primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = danger ? '#c0504d' : 'var(--text-secondary)';
      }}
    >
      {icon}
    </button>
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        background: 'var(--bg-primary)',
        border: '1px solid var(--bg-tertiary)',
        borderRadius: 8,
        boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        padding: '6px 8px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid var(--bg-tertiary)' }}>
        <p style={{ fontSize: 12, fontFamily: 'var(--font-serif, serif)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          {member.fullName}
        </p>
        <p style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 1 }}>
          {member.relationTypeCustom || member.relationType}
        </p>
      </div>

      {/* Icon row */}
      <div className="flex items-center gap-1">
        {iconBtn('View Profile', onView,
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
        {iconBtn('Edit Details', onEdit,
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
          </svg>
        )}
        <div style={{ width: 1, height: 18, background: 'var(--bg-tertiary)', margin: '0 2px' }} />
        {iconBtn('Delete', onDelete,
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>,
          true
        )}
      </div>
    </div>
  );
}
