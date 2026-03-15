import { InputHTMLAttributes, forwardRef, useState } from 'react';
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
  ({ label, error, hint, className, required, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1">
        {/* Label */}
        <label
          htmlFor={props.id || props.name}
          className="block text-sm font-serif font-medium text-primary"
        >
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>

        {/* Hint Text (only show if no error) */}
        {hint && !error && (
          <p className="text-xs font-serif text-tertiary">
            {hint}
          </p>
        )}

        {/* Input + Eye toggle wrapper */}
        <div className="relative">
          <input
            ref={ref}
            type={resolvedType}
            required={required}
            className={cn(
              // Base styles
              'w-full px-4 py-2.5 rounded-md',
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
              // Extra right padding for eye button
              isPassword && 'pr-11',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.name}-error` : undefined}
            {...props}
          />

          {/* Eye toggle button */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors duration-150"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                // Eye-off icon
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M1 1l22 22" />
                </svg>
              ) : (
                // Eye icon
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" strokeWidth={1.75} />
                </svg>
              )}
            </button>
          )}
        </div>

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
