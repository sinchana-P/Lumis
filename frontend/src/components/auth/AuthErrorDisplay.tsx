'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface AuthErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
  className?: string;
}

/**
 * AuthErrorDisplay Component
 * 
 * Displays authentication error messages with warm styling following Lumis design system.
 * Features:
 * - Warm styling with soft sage accents
 * - Crimson Pro serif font
 * - Dismissible alert
 * - Auto-dismiss after 5 seconds
 * 
 * Requirements: 8.1, 8.6
 */
export function AuthErrorDisplay({ 
  error, 
  onDismiss,
  className 
}: AuthErrorDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [error]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      // Delay callback to allow fade-out animation
      setTimeout(onDismiss, 200);
    }
  };

  if (!error || !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'p-4 rounded-md bg-error-bg border border-lumis-error-border',
        'transition-all duration-250 ease-in-out',
        'animate-in fade-in slide-in-from-top-2',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Error Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="h-5 w-5 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div className="flex-1">
          <p className="text-sm font-serif text-primary leading-relaxed">
            {error}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-secondary hover:text-primary transition-colors duration-200"
          aria-label="Dismiss error"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
