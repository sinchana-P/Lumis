import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AuthFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

/**
 * AuthFormField Component
 * 
 * Wraps shadcn/ui input components with Lumis theme styling for auth forms.
 * Features:
 * - Applies Lumis theme tokens
 * - Uses Crimson Pro serif font
 * - Focus glow effects with soft sage accent (#9CAF9E)
 * - Displays field-specific error messages below inputs
 * - Generous spacing
 * 
 * Requirements: 8.3, 10.3, 10.4, 10.5, 10.6, 10.8
 */
export const AuthFormField = forwardRef<HTMLInputElement, AuthFormFieldProps>(
  ({ label, error, hint, className, required, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {/* Label */}
        <label
          htmlFor={props.id || props.name}
          className="block text-sm font-sans font-medium text-primary"
        >
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>

        {/* Hint Text (only show if no error) */}
        {hint && !error && (
          <p className="text-xs font-sans text-tertiary">
            {hint}
          </p>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          required={required}
          className={cn(
            // Base styles
            'w-full px-4 py-3 rounded-md',
            'bg-primary border-2 border-primary',
            'font-serif text-base text-primary',
            'placeholder:text-tertiary placeholder:font-serif',
            'transition-all duration-200',
            // Focus state with soft sage glow
            'focus:border-accent-primary focus:outline-none',
            'focus:ring-4 focus:ring-lumis-accent-primary-light',
            'focus:shadow-sm',
            // Hover state
            'hover:border-accent-primary-light',
            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary',
            // Error state
            error && 'border-lumis-error-border focus:border-lumis-error focus:ring-lumis-error-border',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.name}-error` : undefined}
          {...props}
        />

        {/* Error Message */}
        {error && (
          <div
            id={`${props.name}-error`}
            className="flex items-start gap-1.5 text-sm font-serif text-error"
            role="alert"
          >
            <svg
              className="h-4 w-4 mt-0.5 flex-shrink-0"
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
            <span className="leading-relaxed">{error}</span>
          </div>
        )}
      </div>
    );
  }
);

AuthFormField.displayName = 'AuthFormField';
