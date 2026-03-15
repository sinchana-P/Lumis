'use client';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
  onClick?: () => void;
  className?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'sm', 
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
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      style={getVariantStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </button>
  );
}