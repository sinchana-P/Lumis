import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-md border-2 bg-primary px-4 py-3',
            'font-serif text-base text-primary',
            'transition-all duration-200',
            'placeholder:text-tertiary',
            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lumis-accent-primary-light',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-lumis-error focus-visible:border-lumis-error'
              : 'border-primary focus-visible:border-accent-primary',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm font-sans text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
