'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout, SignInForm, GoogleSignInButton } from '@/components/auth';

/**
 * Sign In Page
 * 
 * Subtask 14.3: Create sign in page
 * - Uses AuthLayout wrapper
 * - Includes SignInForm component
 * - Add link to sign up page
 * - Add GoogleSignInButton as alternative
 * 
 * Requirements: 10.1, 10.2
 */
export default function LoginPage() {
  const [googleError, setGoogleError] = useState<string | undefined>();

  return (
    <AuthLayout>
      {/* Google Error Display */}
      {googleError && (
        <div 
          className="p-4 rounded-md bg-error-bg border border-lumis-error-border"
          role="alert"
        >
          <p className="text-sm font-serif text-error">{googleError}</p>
        </div>
      )}

      {/* Priority 1: Google Sign In Button */}
      <GoogleSignInButton 
        onError={(error) => setGoogleError(error)}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-surface-elevated text-tertiary font-sans">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Priority 3: Local Sign In Form */}
      <SignInForm />

      {/* Sign Up Link */}
      <div className="text-center text-sm text-secondary font-sans">
        Don&apos;t have an account?{' '}
        <Link 
          href="/signup" 
          className="text-accent-primary hover:text-accent-primary-hover font-medium transition-colors"
        >
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
}
