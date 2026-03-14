/**
 * Unit tests for form validation utilities
 * Tests email and password validation functions
 */

import { validateEmail, validatePassword, validateCredentials } from '../validation';

describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBeNull();
    expect(validateEmail('test.user@domain.co.uk')).toBeNull();
    expect(validateEmail('name+tag@company.org')).toBeNull();
  });

  it('rejects empty email', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('   ')).toBe('Email is required');
  });

  it('rejects invalid email format', () => {
    expect(validateEmail('notanemail')).toBe('Please enter a valid email address');
    expect(validateEmail('missing@domain')).toBe('Please enter a valid email address');
    expect(validateEmail('@nodomain.com')).toBe('Please enter a valid email address');
    expect(validateEmail('no@.com')).toBe('Please enter a valid email address');
  });
});

describe('validatePassword', () => {
  it('accepts valid passwords', () => {
    expect(validatePassword('Password123')).toEqual([]);
    expect(validatePassword('SecurePass1')).toEqual([]);
    expect(validatePassword('MyP@ssw0rd')).toEqual([]);
  });

  it('rejects empty password', () => {
    const errors = validatePassword('');
    expect(errors).toContain('Password is required');
    expect(errors.length).toBe(1);
  });

  it('rejects password shorter than 8 characters', () => {
    const errors = validatePassword('Pass1');
    expect(errors).toContain('Password must be at least 8 characters');
  });

  it('rejects password without uppercase letter', () => {
    const errors = validatePassword('password123');
    expect(errors).toContain('Password must contain at least one uppercase letter');
  });

  it('rejects password without lowercase letter', () => {
    const errors = validatePassword('PASSWORD123');
    expect(errors).toContain('Password must contain at least one lowercase letter');
  });

  it('rejects password without number', () => {
    const errors = validatePassword('PasswordOnly');
    expect(errors).toContain('Password must contain at least one number');
  });

  it('returns multiple errors for password with multiple issues', () => {
    const errors = validatePassword('pass');
    expect(errors).toContain('Password must be at least 8 characters');
    expect(errors).toContain('Password must contain at least one uppercase letter');
    expect(errors).toContain('Password must contain at least one number');
    expect(errors.length).toBe(3);
  });
});

describe('validateCredentials', () => {
  it('returns null for valid credentials', () => {
    const result = validateCredentials('user@example.com', 'Password123');
    expect(result).toBeNull();
  });

  it('returns email error for invalid email', () => {
    const result = validateCredentials('invalid-email', 'Password123');
    expect(result).toHaveProperty('email', 'Please enter a valid email address');
    expect(result).not.toHaveProperty('password');
  });

  it('returns password errors for invalid password', () => {
    const result = validateCredentials('user@example.com', 'weak');
    expect(result).toHaveProperty('password');
    expect(result?.password).toContain('Password must be at least 8 characters');
    expect(result).not.toHaveProperty('email');
  });

  it('returns both email and password errors when both invalid', () => {
    const result = validateCredentials('invalid-email', 'weak');
    expect(result).toHaveProperty('email');
    expect(result).toHaveProperty('password');
  });

  it('handles empty credentials', () => {
    const result = validateCredentials('', '');
    expect(result).toHaveProperty('email', 'Email is required');
    expect(result).toHaveProperty('password');
    expect(result?.password).toContain('Password is required');
  });
});
