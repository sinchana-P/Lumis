'use client';

// ─── Reusable Microphone Button Component ─────────────────────────────────────

interface MicrophoneButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MicrophoneButton({ 
  onClick, 
  disabled = false, 
  size = 'md',
  className = '' 
}: MicrophoneButtonProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: { width: 12, height: 12 },
    md: { width: 17, height: 17 },
    lg: { width: 20, height: 20 }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center rounded-full transition-all duration-200 
        bg-transparent border-none cursor-pointer
        hover:bg-lumis-text-tertiary/10
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <svg 
        width={iconSizes[size].width} 
        height={iconSizes[size].height} 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <rect 
          x="9" 
          y="2" 
          width="6" 
          height="12" 
          rx="3" 
          className="fill-lumis-text-tertiary" 
        />
        <path 
          d="M5 11c0 3.866 3.134 7 7 7s7-3.134 7-7" 
          stroke="currentColor" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          className="text-lumis-text-tertiary" 
        />
        <line 
          x1="12" 
          y1="18" 
          x2="12" 
          y2="22" 
          stroke="currentColor" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          className="text-lumis-text-tertiary" 
        />
        <line 
          x1="9" 
          y1="22" 
          x2="15" 
          y2="22" 
          stroke="currentColor" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          className="text-lumis-text-tertiary" 
        />
      </svg>
    </button>
  );
}