'use client';

import { ReactNode } from 'react';

interface MinimalButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
}

export function MinimalButton({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'default',
  size = 'md',
  className = '' 
}: MinimalButtonProps) {
  const baseStyles = 'inline-flex items-center gap-2 font-rounded text-xs uppercase tracking-widest transition-all duration-200 rounded-lg border';
  
  const variants = {
    default: 'bg-surface-elevated text-primary border-primary hover:bg-surface-hover hover:shadow-sm',
    primary: 'bg-accent-primary text-inverse border-accent-primary hover:bg-accent-primary-hover hover:shadow-md',
    ghost: 'bg-transparent text-tertiary border-transparent hover:text-primary hover:bg-surface-elevated'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-xs'
  };
  
  const disabledStyles = 'opacity-50 cursor-not-allowed hover:bg-surface-elevated hover:shadow-none';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? disabledStyles : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}