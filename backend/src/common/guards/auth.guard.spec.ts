import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SupabaseService } from '../services/supabase.service';

/**
 * Unit tests for AuthGuard
 * Requirements: 2.3, 9.2
 */
describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let supabaseService: jest.Mocked<SupabaseService>;

  beforeEach(() => {
    // Create mock SupabaseService
    supabaseService = {
      verifyToken: jest.fn(),
      getClient: jest.fn(),
      getAdminClient: jest.fn(),
      getClientForUser: jest.fn(),
      getUserById: jest.fn(),
      uploadFile: jest.fn(),
      getPublicUrl: jest.fn(),
      deleteFile: jest.fn(),
    } as any;

    authGuard = new AuthGuard(supabaseService);
  });

  const createMockExecutionContext = (
    authorizationHeader?: string,
  ): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authorizationHeader,
      },
      user: undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow access with valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        app_metadata: { provider: 'local' },
      };

      supabaseService.verifyToken.mockResolvedValue(mockUser as any);

      const context = createMockExecutionContext('Bearer valid-token-123');
      const result = await authGuard.canActivate(context);

      expect(result).toBe(true);
      expect(supabaseService.verifyToken).toHaveBeenCalledWith(
        'valid-token-123',
      );

      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual({
        id: 'user-123',
        email: 'user@example.com',
        provider: 'local',
      });
    });

    it('should attach user with google provider to request', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'google@example.com',
        app_metadata: { provider: 'google' },
      };

      supabaseService.verifyToken.mockResolvedValue(mockUser as any);

      const context = createMockExecutionContext('Bearer google-token');
      await authGuard.canActivate(context);

      const request = context.switchToHttp().getRequest();
      expect(request.user.provider).toBe('google');
    });

    it('should default to local provider if not specified', async () => {
      const mockUser = {
        id: 'user-789',
        email: 'user@example.com',
        app_metadata: {},
      };

      supabaseService.verifyToken.mockResolvedValue(mockUser as any);

      const context = createMockExecutionContext('Bearer token-no-provider');
      await authGuard.canActivate(context);

      const request = context.switchToHttp().getRequest();
      expect(request.user.provider).toBe('local');
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      const context = createMockExecutionContext();

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authGuard.canActivate(context)).rejects.toMatchObject({
        response: {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'No token provided',
          },
        },
      });
    });

    it('should throw UnauthorizedException when authorization header is malformed', async () => {
      const context = createMockExecutionContext('InvalidFormat token123');

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      supabaseService.verifyToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      const context = createMockExecutionContext('Bearer invalid-token');

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      supabaseService.verifyToken.mockRejectedValue(
        new Error('Token expired'),
      );

      const context = createMockExecutionContext('Bearer expired-token');

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when verifyToken throws error', async () => {
      supabaseService.verifyToken.mockRejectedValue(
        new Error('Supabase error'),
      );

      const context = createMockExecutionContext('Bearer error-token');

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle Bearer token correctly', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        app_metadata: { provider: 'local' },
      };

      supabaseService.verifyToken.mockResolvedValue(mockUser as any);

      const context = createMockExecutionContext('Bearer valid-token-123');
      const result = await authGuard.canActivate(context);

      expect(result).toBe(true);
      expect(supabaseService.verifyToken).toHaveBeenCalledWith('valid-token-123');
    });

    it('should reject token without Bearer prefix', async () => {
      const context = createMockExecutionContext('token-without-bearer');

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should include request_id in error response', async () => {
      const context = createMockExecutionContext();

      try {
        await authGuard.canActivate(context);
        fail('Should have thrown UnauthorizedException');
      } catch (error: any) {
        expect(error.response.meta.request_id).toBeDefined();
        expect(error.response.meta.request_id).toMatch(/^req_/);
      }
    });

    it('should include timestamp in error response', async () => {
      const context = createMockExecutionContext();

      try {
        await authGuard.canActivate(context);
        fail('Should have thrown UnauthorizedException');
      } catch (error: any) {
        expect(error.response.meta.timestamp).toBeDefined();
        expect(new Date(error.response.meta.timestamp).getTime()).toBeLessThanOrEqual(
          Date.now(),
        );
      }
    });
  });
});
