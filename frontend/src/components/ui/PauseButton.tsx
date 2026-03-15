'use client';

// ─── Reusable Pause/Stop Button Component ─────────────────────────────────────

interface PauseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function PauseButton({ 
  onClick, 
  disabled = false, 
  size = 'md',
  animated = false,
  className = '' 
}: PauseButtonProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: { width: 8, height: 8 },
    md: { width: 12, height: 12 },
    lg: { width: 16, height: 16 }
  };

  return (
    <>
      {animated && (
        <style>{`
          @keyframes lumis-border-pulse {
            0%, 100% { box-shadow: 0 0 0 0 var(--accent-primary-light); }
            50%       { box-shadow: 0 0 0 4px var(--accent-primary-light); }
          }
        `}</style>
      )}
      
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`
          flex items-center justify-center rounded-full transition-all duration-200 
          bg-lumis-text-tertiary/20 border-none cursor-pointer relative
          hover:bg-lumis-text-tertiary/30
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${className}
        `}
        style={animated ? {
          animation: 'lumis-border-pulse 1.5s ease-in-out infinite'
        } : undefined}
      >
        <svg 
          width={iconSizes[size].width} 
          height={iconSizes[size].height} 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <rect 
            x="6" 
            y="6" 
            width="12" 
            height="12" 
            rx="2" 
            className="fill-lumis-text-tertiary" 
          />
        </svg>
      </button>
    </>
  );
}