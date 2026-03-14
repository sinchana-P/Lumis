'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AuthFormField } from './AuthFormField';
import { validateEmail } from '@/lib/validation';
import { useSignInMutation } from '@/store/api/authApi';

export interface SignInFormProps {
  onSuccess?: () => void;
}

/**
 * SignInForm Component
 * 
 * Local sign in form with email and password fields.
 * Uses validation utilities, AuthFormField component, and authApi.useSignInMutation.
 * Follows Lumis design system with generous spacing.
 * 
 * Subtask 14.1: Create SignInForm component
 * Requirements: 3.1, 9.3, 10.1, 10.2, 10.3, 10.7, 10.8
 */
export function SignInForm({ onSuccess }: SignInFormProps) {
  const router = useRouter();
  const [signIn, { isLoading }] = useSignInMutation();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Error state
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

  /**
   * Validate form fields
   * Requirements: 3.1
   */
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Clear previous errors
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);

    // Validate email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      isValid = false;
    }

    // Validate password (just check if not empty for sign in)
    if (!password || password.trim() === '') {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Handle form submission
   * Subtask 14.2: Implement form submission
   * Requirements: 3.1, 9.3
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Call signIn mutation with credentials
      const result = await signIn({ email, password }).unwrap();
      
      // Clear sensitive form data from memory after submission
      // Requirement 9.3: Form data cleanup after submission
      setPassword('');
      setEmail('');
      
      // Handle success by redirecting to dashboard
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      // Handle errors by displaying error messages
      // Requirement 8.1: Error message display
      const errorMessage = error?.data?.error?.message || 'Invalid email or password. Please try again.';
      setFormError(errorMessage);
      
      // Clear password on error for security
      setPassword('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Error Display */}
      {formError && (
        <div 
          className="p-4 rounded-md bg-error-bg border border-lumis-error-border"
          role="alert"
        >
          <p className="text-sm font-serif text-error">{formError}</p>
        </div>
      )}

      {/* Email Input Field with AuthFormField wrapper */}
      {/* Requirements: 10.1, 10.2, 10.3, 10.7, 10.8 */}
      <AuthFormField
        id="email"
        name="email"
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        placeholder="you@example.com"
        required
        disabled={isLoading}
        autoComplete="email"
      />

      {/* Password Input Field with AuthFormField wrapper */}
      {/* Requirements: 10.1, 10.2, 10.3, 10.7, 10.8 */}
      <AuthFormField
        id="password"
        name="password"
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={passwordError}
        placeholder="••••••••"
        required
        disabled={isLoading}
        autoComplete="current-password"
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn btn-secondary"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
