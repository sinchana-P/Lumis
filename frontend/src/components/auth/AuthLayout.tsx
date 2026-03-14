import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * AuthLayout Component
 * 
 * Provides consistent layout for all authentication pages following Lumis design system.
 * Features:
 * - Warm cream background (#F8F6F3)
 * - Centered card with soft shadow
 * - Lumis branding
 * - Generous spacing
 * 
 * Requirements: 10.2, 10.7
 */
export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
      <div className={cn('w-full max-w-md space-y-8', className)}>
        {/* Lumis Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif text-primary">
            ✦ LUMIS
          </h1>
          <p className="text-secondary italic font-serif">
            Your personal intelligence platform
          </p>
        </div>

        {/* Main Content Card */}
        <div className="card space-y-6">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-tertiary font-sans">
          By continuing, you agree to Lumis&apos;s Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
