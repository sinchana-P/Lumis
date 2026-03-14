import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            'flex min-h-[120px] w-full rounded-md border-2 bg-primary px-4 py-3',
            'font-serif text-base text-primary',
            'transition-all duration-200',
            'placeholder:text-tertiary',
            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lumis-accent-primary-light',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-y',
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

Textarea.displayName = 'Textarea';

export { Textarea };
