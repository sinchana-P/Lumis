import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  name,
  error,
  required,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      <label
        htmlFor={name}
        className="block font-sans text-sm font-medium text-primary"
      >
        {label}
        {required && <span className="ml-1 text-error">*</span>}
      </label>
      
      {hint && !error && (
        <p className="text-xs font-sans text-tertiary">{hint}</p>
      )}
      
      {children}
      
      {error && (
        <p className="text-sm font-sans text-error flex items-center gap-1">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
