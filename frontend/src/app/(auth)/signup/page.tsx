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
      <div className="space-y-2">
        <h2 className="text-2xl font-serif text-primary text-center">
          Create your account
        </h2>
        <p className="text-sm text-secondary text-center font-sans">
          Begin your journey of self-discovery
        </p>
      </div>

      {/* Google Sign In Button */}
      <GoogleSignInButton />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-surface-elevated text-tertiary font-sans">
            or continue with email
          </span>
        </div>
      </div>

      {/* Sign Up Form */}
      <SignUpForm />

      {/* Link to Sign In */}
      <div className="text-center">
        <p className="text-sm text-secondary font-sans">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-accent-primary hover:text-accent-primary-hover font-medium transition-colors duration-200 underline decoration-1 underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
