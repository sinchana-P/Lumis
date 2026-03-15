'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

/**
 * Sign Up Page
 * 
 * User registration page with local email/password sign up and Google OAuth option.
 * Features:
 * - Uses AuthLayout wrapper for consistent styling
 * - Includes SignUpForm component
 * - Includes GoogleSignInButton as alternative
 * - Link to sign in page for existing users
 * - Follows Lumis design system with generous spacing
 * 
 * Requirements: 2.1, 2.2, 10.1, 10.2
 * Subtask: 13.4
 */
export default function SignUpPage() {
  return (
    <AuthLayout>
      {/* Page Title */}
      <h2 className="text-xl font-serif text-primary text-center">your orbit begins here</h2>

      {/* Google Sign In Button */}
      <GoogleSignInButton />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-surface-elevated text-tertiary font-sans text-xs">
            or 
          </span>
        </div>
      </div>

      {/* Sign Up Form */}
      <SignUpForm />

      {/* Link to Sign In */}
      <div className="text-center">
        <p className="text-sm text-secondary font-sans">
          already orbiting?{' '}
          <Link
            href="/login"
            className="text-accent-primary hover:text-accent-primary-hover font-medium transition-colors duration-200 underline decoration-1 underline-offset-2"
          >
            step back in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
