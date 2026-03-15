'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AuthFormField } from './AuthFormField';
import { AuthErrorDisplay } from './AuthErrorDisplay';
import { useSignUpMutation } from '@/store/api/authApi';
import { validateEmail, validatePassword } from '@/lib/validation';

export interface SignUpFormProps {
  onSuccess?: () => void;
  className?: string;
}

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string[];
  confirmPassword?: string;
}

/**
 * SignUpForm Component
 * 
 * Local sign up form with email, password, and confirm password fields.
 * Features:
 * - Email format validation on blur
 * - Password requirements validation on blur
 * - Confirm password matching validation
 * - Real-time validation feedback
 * - Uses shadcn/ui FormField components with Lumis theme
 * - Generous spacing between fields
 * 
 * Requirements: 2.1, 2.2, 2.9, 8.3, 9.3, 10.1, 10.2, 10.3, 10.7, 10.8
 * Subtask: 13.1, 13.2, 13.3
 */
export function SignUpForm({ onSuccess, className }: SignUpFormProps) {
  const router = useRouter();
  const [signUp, { isLoading }] = useSignUpMutation();

  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Validate first name on blur
  const handleFirstNameBlur = () => {
    setTouched({ ...touched, firstName: true });
    if (!formData.firstName.trim()) {
      setErrors({ ...errors, firstName: 'First name is required' });
    } else {
      setErrors({ ...errors, firstName: undefined });
    }
  };

  // Validate last name on blur
  const handleLastNameBlur = () => {
    setTouched({ ...touched, lastName: true });
    if (!formData.lastName.trim()) {
      setErrors({ ...errors, lastName: 'Last name is required' });
    } else {
      setErrors({ ...errors, lastName: undefined });
    }
  };

  // Validate email on blur
  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    const emailError = validateEmail(formData.email);
    setErrors({ ...errors, email: emailError || undefined });
  };

  // Validate password on blur
  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    const passwordErrors = validatePassword(formData.password);
    setErrors({ 
      ...errors, 
      password: passwordErrors.length > 0 ? passwordErrors : undefined 
    });
  };

  // Validate confirm password on blur
  const handleConfirmPasswordBlur = () => {
    setTouched({ ...touched, confirmPassword: true });
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
    } else {
      setErrors({ ...errors, confirmPassword: undefined });
    }
  };

  // Handle input changes
  const handleChange = (field: keyof SignUpFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });

    // Clear field error when user starts typing
    if (touched[field]) {
      setErrors({ ...errors, [field]: undefined });
    }

    // Clear API error when user starts typing
    if (apiError) {
      setApiError(null);
    }
  };

  // Validate entire form before submission
  const validateForm = (): boolean => {
    const firstNameError = !formData.firstName.trim() ? 'First name is required' : null;
    const lastNameError = !formData.lastName.trim() ? 'Last name is required' : null;
    const emailError = validateEmail(formData.email);
    const passwordErrors = validatePassword(formData.password);
    const confirmPasswordError =
      formData.password !== formData.confirmPassword
        ? 'Passwords do not match'
        : null;

    const newErrors: FormErrors = {
      firstName: firstNameError || undefined,
      lastName: lastNameError || undefined,
      email: emailError || undefined,
      password: passwordErrors.length > 0 ? passwordErrors : undefined,
      confirmPassword: confirmPasswordError || undefined,
    };

    setErrors(newErrors);
    setTouched({ firstName: true, lastName: true, email: true, password: true, confirmPassword: true });

    return !firstNameError && !lastNameError && !emailError && passwordErrors.length === 0 && !confirmPasswordError;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Call sign up mutation
      await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // Clear sensitive form data from memory (Requirement 9.3)
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default: redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      // Handle API errors
      const errorMessage = error?.data?.error?.message || 'An error occurred during sign up. Please try again.';
      
      // Map specific error codes to user-friendly messages
      if (error?.data?.error?.code === 'EMAIL_ALREADY_EXISTS') {
        setApiError('An account with this email already exists. Please sign in instead.');
      } else if (error?.data?.error?.code === 'VALIDATION_ERROR') {
        setApiError(errorMessage);
      } else if (error?.status === 429) {
        setApiError('Too many attempts. Please wait a moment and try again.');
      } else {
        setApiError(errorMessage);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-3">
        {/* API Error Display */}
        {apiError && (
          <AuthErrorDisplay
            error={apiError}
            onDismiss={() => setApiError(null)}
          />
        )}

        {/* First Name Field */}
        <AuthFormField
          label="First Name"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          onBlur={handleFirstNameBlur}
          error={touched.firstName ? errors.firstName : undefined}
          placeholder="your given name"
          required
          autoComplete="given-name"
          disabled={isLoading}
        />

        {/* Last Name Field */}
        <AuthFormField
          label="Last Name"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange('lastName')}
          onBlur={handleLastNameBlur}
          error={touched.lastName ? errors.lastName : undefined}
          placeholder="your family name"
          required
          autoComplete="family-name"
          disabled={isLoading}
        />

        {/* Email Field */}
        <AuthFormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={handleEmailBlur}
          error={touched.email ? errors.email : undefined}
          placeholder="you@..."
          required
          autoComplete="email"
          disabled={isLoading}
        />

        {/* Password Field */}
        <AuthFormField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange('password')}
          onBlur={handlePasswordBlur}
          error={
            touched.password && errors.password
              ? errors.password.join('. ')
              : undefined
          }
          hint="Minimum 8 characters with uppercase, lowercase, and number"
          placeholder="something only you'd know"
          required
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Confirm Password Field */}
        <AuthFormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleConfirmPasswordBlur}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
          placeholder="say it once more"
          required
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn btn-primary !py-2"
        >
          {isLoading ? 'entering the light...' : 'begin your orbit'}
        </button>
      </div>
    </form>
  );
}
