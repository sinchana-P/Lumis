import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SignUpDto } from './sign-up.dto';
import { SignInDto } from './sign-in.dto';
import { GoogleCallbackDto } from './google-callback.dto';
import { RefreshTokenDto } from './refresh-token.dto';

/**
 * Unit tests for DTO validation rules
 * Requirements: 2.3, 9.2
 */
describe('DTO Validation', () => {
  describe('SignUpDto', () => {
    it('should accept valid email and password', async () => {
      const dto = plainToInstance(SignUpDto, {
        email: 'user@example.com',
        password: 'Password123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid email format', async () => {
      const dto = plainToInstance(SignUpDto, {
        email: 'invalid-email',
        password: 'Password123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should reject password shorter than 8 characters', async () => {
      const dto = plainToInstance(SignUpDto, {
        email: 'user@example.com',
        password: 'Pass1',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.minLength).toBeDefined();
    });

    it('should reject password without uppercase letter', async () => {
      const dto = plainToInstance(SignUpDto, {
        email: 'user@example.com',
        password: 'password123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.matches).toContain('uppercase');
    });

    it('should reject password without lowercase letter', async () => {
      const dto = plainToInstance(SignUpDto, {
        email: 'user@example.com',
        password: 'PASSWORD123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.matches).toContain('lowercase');
    });

    it('should reject password without number', async () => {
      const dto = plainToInstance(SignUpDto, {
        email: 'user@example.com',
        password: 'PasswordABC',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.matches).toContain('number');
    });

    it('should accept password with all requirements', async () => {
      const validPasswords = [
        'Password123',
        'MySecure1Pass',
        'Test1234Pass',
        'Abcdefgh1',
      ];

      for (const password of validPasswords) {
        const dto = plainToInstance(SignUpDto, {
          email: 'user@example.com',
          password,
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('SignInDto', () => {
    it('should accept valid email and password', async () => {
      const dto = plainToInstance(SignInDto, {
        email: 'user@example.com',
        password: 'anypassword',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid email format', async () => {
      const dto = plainToInstance(SignInDto, {
        email: 'not-an-email',
        password: 'password',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should reject empty password', async () => {
      const dto = plainToInstance(SignInDto, {
        email: 'user@example.com',
        password: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should reject missing email', async () => {
      const dto = plainToInstance(SignInDto, {
        password: 'password',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const emailError = errors.find((e) => e.property === 'email');
      expect(emailError).toBeDefined();
    });

    it('should reject missing password', async () => {
      const dto = plainToInstance(SignInDto, {
        email: 'user@example.com',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError).toBeDefined();
    });
  });

  describe('GoogleCallbackDto', () => {
    it('should accept valid authorization code', async () => {
      const dto = plainToInstance(GoogleCallbackDto, {
        code: '4/0AY0e-g7X_valid_code_example',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject empty code', async () => {
      const dto = plainToInstance(GoogleCallbackDto, {
        code: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('code');
    });

    it('should reject missing code', async () => {
      const dto = plainToInstance(GoogleCallbackDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const codeError = errors.find((e) => e.property === 'code');
      expect(codeError).toBeDefined();
    });

    it('should reject non-string code', async () => {
      const dto = plainToInstance(GoogleCallbackDto, {
        code: 12345,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('code');
    });
  });

  describe('RefreshTokenDto', () => {
    it('should accept valid refresh token', async () => {
      const dto = plainToInstance(RefreshTokenDto, {
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject empty refresh token', async () => {
      const dto = plainToInstance(RefreshTokenDto, {
        refresh_token: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refresh_token');
    });

    it('should reject missing refresh token', async () => {
      const dto = plainToInstance(RefreshTokenDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const tokenError = errors.find((e) => e.property === 'refresh_token');
      expect(tokenError).toBeDefined();
    });

    it('should reject non-string refresh token', async () => {
      const dto = plainToInstance(RefreshTokenDto, {
        refresh_token: { token: 'value' },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refresh_token');
    });
  });
});
