/**
 * Form validation utilities for authentication flows
 * Validates email format and password requirements
 */

/**
 * Validates email format using a standard email regex pattern
 * @param email - The email address to validate
 * @returns Error message if invalid, null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }

  // Standard email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
}

/**
 * Password validation requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * 
 * @param password - The password to validate
 * @returns Array of error messages for unmet requirements, empty array if valid
 */
export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return errors;
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return errors;
}

/**
 * Validates user credentials for authentication
 * @param email - The email address
 * @param password - The password
 * @returns Object with email and password errors, or null if all valid
 */
export function validateCredentials(
  email: string,
  password: string
): { email?: string; password?: string[] } | null {
  const emailError = validateEmail(email);
  const passwordErrors = validatePassword(password);

  if (emailError || passwordErrors.length > 0) {
    return {
      ...(emailError && { email: emailError }),
      ...(passwordErrors.length > 0 && { password: passwordErrors }),
    };
  }

  return null;
}
