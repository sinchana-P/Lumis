import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Handle Google OAuth callback
   * Requirements: 1.2, 1.3, 1.4, 1.6
   */
  async handleGoogleCallback(code: string) {
    try {
      const supabase = this.supabaseService.getClient();

      // Exchange authorization code for tokens
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'INVALID_AUTH_CODE',
            message: 'The authorization code is invalid or expired',
          },
          meta: {
            timestamp: new Date().toISOString(),
            request_id: this.generateRequestId(),
          },
        });
      }

      if (!data.session) {
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'INVALID_AUTH_CODE',
            message: 'The authorization code is invalid or expired',
          },
          meta: {
            timestamp: new Date().toISOString(),
            request_id: this.generateRequestId(),
          },
        });
      }

      // Create or update user in database
      const user = await this.createOrUpdateUser(data.user, 'google');

      return {
        user,
        tokens: {
          auth_token: data.session.access_token,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      });
    }
  }

  /**
   * Sign up new user with email and password
   * Requirements: 2.3, 2.4, 2.5, 2.6
   */
  async signUp(email: string, password: string) {
    try {
      console.log('SignUp attempt:', { email });
      const supabase = this.supabaseService.getClient();

      // Create user account via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('Supabase signUp result:', { data: !!data, error: error?.message });

      if (error) {
        console.error('Supabase signUp error:', error);
        if (error.message.includes('already registered')) {
          throw new ConflictException({
            success: false,
            error: {
              code: 'EMAIL_ALREADY_EXISTS',
              message: 'An account with this email already exists',
            },
            meta: {
              timestamp: new Date().toISOString(),
              request_id: this.generateRequestId(),
            },
          });
        }
        if (error.message.includes('rate limit exceeded')) {
          throw new ConflictException({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many signup attempts. Please wait a few minutes and try again.',
            },
            meta: {
              timestamp: new Date().toISOString(),
              request_id: this.generateRequestId(),
            },
          });
        }
        throw error;
      }

      if (!data.session) {
        console.log('No session in signup response, data:', data);
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create user session',
          },
          meta: {
            timestamp: new Date().toISOString(),
            request_id: this.generateRequestId(),
          },
        });
      }

      console.log('Creating user in database...');
      // Create user record in database with preferences
      const user = await this.createOrUpdateUser(data.user, 'local');
      console.log('User created successfully:', user.id);

      return {
        user,
        tokens: {
          auth_token: data.session.access_token,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      };
    } catch (error) {
      console.error('SignUp error:', error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      });
    }
  }

  /**
   * Sign in user with email and password
   * Requirements: 3.1, 3.2, 3.3, 3.4
   */
  async signIn(email: string, password: string) {
    try {
      const supabase = this.supabaseService.getClient();

      // Authenticate user via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
          meta: {
            timestamp: new Date().toISOString(),
            request_id: this.generateRequestId(),
          },
        });
      }

      // Get user data from database
      const { user: userData } = await this.supabaseService.getUserById(
        data.user.id,
      );

      const user = {
        id: data.user.id,
        email: data.user.email,
        name: userData?.full_name || null,
        avatar_url: userData?.avatar_url || null,
        provider: 'local',
        analysis_depth_mode: userData?.analysis_depth_mode || 'full-spectrum',
        created_at: data.user.created_at,
      };

      return {
        user,
        tokens: {
          auth_token: data.session.access_token,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      });
    }
  }

  /**
   * Refresh access token using refresh token
   * Requirements: 5.1, 5.2, 5.3
   */
  async refreshToken(refreshToken: string) {
    try {
      const supabase = this.supabaseService.getClient();

      // Request new tokens from Supabase Auth
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'The refresh token is invalid or expired',
          },
          meta: {
            timestamp: new Date().toISOString(),
            request_id: this.generateRequestId(),
          },
        });
      }

      // Get user data from database
      const { user: userData } = await this.supabaseService.getUserById(
        data.user!.id,
      );

      const user = {
        id: data.user!.id,
        email: data.user!.email,
        name: userData?.full_name || null,
        avatar_url: userData?.avatar_url || null,
        provider: data.user!.app_metadata?.provider || 'local',
        analysis_depth_mode: userData?.analysis_depth_mode || 'full-spectrum',
        created_at: data.user!.created_at,
      };

      return {
        user,
        tokens: {
          auth_token: data.session.access_token,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      });
    }
  }

  /**
   * Sign out user and invalidate session
   * Requirements: 6.1, 6.2
   */
  async signOut(userId: string) {
    try {
      const supabase = this.supabaseService.getClient();
      await supabase.auth.signOut();
    } catch (error) {
      // Log error but don't throw - client should clear tokens anyway
      console.error('Sign out error:', error);
    }
  }

  /**
   * Validate token and return user data
   * Requirements: 7.2, 7.3
   */
  async validateToken(userId: string) {
    const { user: userData } = await this.supabaseService.getUserById(userId);

    return {
      id: userId,
      email: userData?.email || null,
      name: userData?.full_name || null,
      avatar_url: userData?.avatar_url || null,
      provider: userData?.provider || 'local',
      analysis_depth_mode: userData?.analysis_depth_mode || 'full-spectrum',
      created_at: userData?.created_at || new Date().toISOString(),
    };
  }

  /**
   * Create or update user record in database
   * Requirements: 1.4, 1.6, 2.4, 2.5, 11.3, 11.4
   */
  private async createOrUpdateUser(supabaseUser: any, provider: string) {
    const supabase = this.supabaseService.getClient();

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (existingUser) {
      // Update existing user
      const { data: updatedUser } = await supabase
        .from('users')
        .update({
          email: supabaseUser.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', supabaseUser.id)
        .select()
        .single();

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.full_name,
        avatar_url: updatedUser.avatar_url,
        provider: updatedUser.provider || provider,
        analysis_depth_mode: updatedUser.analysis_depth_mode,
        created_at: updatedUser.created_at,
      };
    }

    // Create new user with preferences
    const { data: newUser } = await supabase
      .from('users')
      .insert({
        id: supabaseUser.id,
        email: supabaseUser.email,
        full_name: supabaseUser.user_metadata?.full_name || null,
        avatar_url: supabaseUser.user_metadata?.avatar_url || null,
        provider,
        analysis_depth_mode: 'full-spectrum', // Initialize preference
      })
      .select()
      .single();

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.full_name,
      avatar_url: newUser.avatar_url,
      provider: newUser.provider,
      analysis_depth_mode: newUser.analysis_depth_mode,
      created_at: newUser.created_at,
    };
  }

  // Validate access token from request
  async validateTokenFromRequest(token: string) {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const { user, error } = await this.supabaseService.verifyToken(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }

  // Get current user from token
  async getCurrentUser(token: string) {
    const user = await this.validateTokenFromRequest(token);

    // Get additional user data from database
    const { user: userData, error } = await this.supabaseService.getUserById(
      user.id,
    );

    if (error) {
      // User exists in auth but not in database yet (new signup)
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        has_profile: false,
      };
    }

    return userData;
  }

  // Check if user has completed onboarding
  async hasCompletedOnboarding(userId: string) {
    const { user } = await this.supabaseService.getUserById(userId);
    return user?.date_of_birth ? true : false;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
