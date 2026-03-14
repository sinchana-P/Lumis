'use client';

import { ReactNode } from 'react';

interface MinimalButtonGroupProps {
  children: ReactNode;
  className?: string;
}

interface MinimalButtonGroupItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}

export function MinimalButtonGroup({ children, className = '' }: MinimalButtonGroupProps) {
  return (
    <div className={`inline-flex bg-surface-elevated border border-primary rounded-xl p-1 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function MinimalButtonGroupItem({ 
  children, 
  onClick, 
  disabled = false, 
  active = false,
  className = '' 
}: MinimalButtonGroupItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all duration-200
        ${active 
          ? 'bg-accent-primary text-white shadow-sm' 
          : 'text-tertiary hover:text-primary hover:bg-surface-hover'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}