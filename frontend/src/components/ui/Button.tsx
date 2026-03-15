'use client';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'sm',
  type = 'button',
  disabled = false,
  onClick, 
  className = '' 
}: ButtonProps) {
  const baseStyles = "rounded-lg font-mono text-xs uppercase tracking-widest transition-colors";
  
  const sizeStyles = {
    sm: "px-3 py-1.5",
    md: "px-4 py-2"
  };

  const getVariantStyles = () => {
    if (variant === 'primary') {
      return {
        backgroundColor: 'var(--accent-primary)',
        color: 'var(--text-inverse)'
      };
    } else {
      return {
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border-tertiary)',
        color: 'var(--text-primary)'
      };
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
    } else {
      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
    } else {
      e.currentTarget.style.backgroundColor = 'var(--surface)';
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={getVariantStyles()}
      onMouseEnter={disabled ? undefined : handleMouseEnter}
      onMouseLeave={disabled ? undefined : handleMouseLeave}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
}