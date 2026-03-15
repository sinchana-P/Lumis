import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';

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
  async signUp(firstName: string, lastName: string, email: string, password: string) {
    try {
      console.log('SignUp attempt:', { firstName, lastName, email });
      const supabase = this.supabaseService.getAdminClient(); // Use admin client for auto-confirmation

      const fullName = `${firstName} ${lastName}`.trim();

      // Create user account via Supabase Auth with auto-confirmation
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm to skip email verification
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          signup_method: 'email',
          auto_confirmed: true
        }
      });

      console.log('Supabase signUp result:', { 
        data: !!data, 
        user: !!data?.user,
        error: error?.message 
      });

      if (error) {
        console.error('Supabase signUp error:', error);
        if (error.message.includes('already registered') || error.message.includes('already exists') || error.code === 'email_exists') {
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
        if (error.message.includes('Password should be at least')) {
          throw new ConflictException({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Password must be at least 6 characters long',
            },
            meta: {
              timestamp: new Date().toISOString(),
              request_id: this.generateRequestId(),
            },
          });
        }
        throw new InternalServerErrorException({
          success: false,
          error: {
            code: 'SIGNUP_ERROR',
            message: error.message || 'Failed to create account',
          },
          meta: {
            timestamp: new Date().toISOString(),
            request_id: this.generateRequestId(),
          },
        });
      }

      if (!data.user) {
        console.log('No user in signup response');
        throw new InternalServerErrorException({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create user account',
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

      // Generate session for immediate login
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: data.user.email!,
      });

      if (sessionError) {
        console.error('Session generation error:', sessionError);
        // Return user without tokens - they can login separately
        return {
          user,
          tokens: null,
          email_confirmation_required: false,
          message: 'Account created successfully. Please login to continue.',
        };
      }

      // Create a session for the user
      const clientSupabase = this.supabaseService.getClient();
      const { data: signInData, error: signInError } = await clientSupabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData.session) {
        // User created but couldn't auto-login, they can login manually
        return {
          user,
          tokens: null,
          email_confirmation_required: false,
          message: 'Account created successfully. Please login to continue.',
        };
      }

      return {
        user,
        tokens: {
          auth_token: signInData.session.access_token,
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
        },
        email_confirmation_required: false,
      };
    } catch (error: any) {
      console.error('SignUp error:', error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during signup',
          details: error?.message || 'Unknown error',
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
      const { user: userData, error: userError } = await this.supabaseService.getUserById(
        data.user.id,
      );

      if (userError) {
        console.error('Error getting user data:', userError);
        // Continue with basic user data if database lookup fails
      }

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
      const { user: userData, error: userError } = await this.supabaseService.getUserById(
        data.user!.id,
      );

      if (userError) {
        console.error('Error getting user data:', userError);
        // Continue with basic user data if database lookup fails
      }

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
    const { user: userData, error } = await this.supabaseService.getUserById(userId);

    if (error || !userData) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: userId,
      email: userData.email || null,
      name: userData.full_name || null,
      avatar_url: userData.avatar_url || null,
      provider: userData.provider || 'local',
      analysis_depth_mode: userData.analysis_depth_mode || 'full-spectrum',
      created_at: userData.created_at || new Date().toISOString(),
    };
  }

  /**
   * Create or update user record in database
   * Requirements: 1.4, 1.6, 2.4, 2.5, 11.3, 11.4
   */
  private async createOrUpdateUser(supabaseUser: any, provider: string) {
    const supabase = this.supabaseService.getAdminClient(); // Use admin client to bypass RLS

    try {
      // Extract names from user metadata or Google profile
      let firstName = null;
      let lastName = null;
      let fullName = null;

      if (provider === 'google') {
        // For Google login, extract from user metadata
        fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name;
        firstName = supabaseUser.user_metadata?.given_name;
        lastName = supabaseUser.user_metadata?.family_name;
        
        // If we don't have first/last names but have full name, try to split it
        if (!firstName && !lastName && fullName) {
          const nameParts = fullName.split(' ');
          firstName = nameParts[0] || null;
          lastName = nameParts.slice(1).join(' ') || null;
        }
      } else {
        // For email signup, get from user metadata
        firstName = supabaseUser.user_metadata?.first_name;
        lastName = supabaseUser.user_metadata?.last_name;
        fullName = supabaseUser.user_metadata?.full_name;
        
        // If no full name but have first/last, create it
        if (!fullName && (firstName || lastName)) {
          fullName = `${firstName || ''} ${lastName || ''}`.trim();
        }
      }

      // Check if user exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('Error checking existing user:', selectError);
        throw selectError;
      }

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            email: supabaseUser.email,
            full_name: fullName || existingUser.full_name,
            first_name: firstName || existingUser.first_name,
            last_name: lastName || existingUser.last_name,
            avatar_url: supabaseUser.user_metadata?.avatar_url || existingUser.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', supabaseUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user:', updateError);
          throw updateError;
        }

        return {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.full_name,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          avatar_url: updatedUser.avatar_url,
          provider: updatedUser.provider || provider,
          analysis_depth_mode: updatedUser.analysis_depth_mode,
          created_at: updatedUser.created_at,
        };
      }

      // Create new user with preferences
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          avatar_url: supabaseUser.user_metadata?.avatar_url || null,
          provider,
          analysis_depth_mode: 'full-spectrum', // Initialize preference
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        throw insertError;
      }

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.full_name,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        avatar_url: newUser.avatar_url,
        provider: newUser.provider,
        analysis_depth_mode: newUser.analysis_depth_mode,
        created_at: newUser.created_at,
      };
    } catch (error) {
      console.error('Error in createOrUpdateUser:', error);
      throw error;
    }
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
  async updateProfile(userId: string, updateData: any) {
    const supabase = this.supabaseService.getAdminClient();

    // Build update object with only provided fields
    const updateFields: any = {};

    // Coerce empty strings to null so DB nulls are set correctly
    const val = (v: any) => (v === '' ? null : v);

    if (updateData.first_name !== undefined) updateFields.first_name = val(updateData.first_name);
    if (updateData.last_name !== undefined) updateFields.last_name = val(updateData.last_name);
    if (updateData.full_name !== undefined) updateFields.full_name = val(updateData.full_name);
    if (updateData.date_of_birth !== undefined) updateFields.date_of_birth = val(updateData.date_of_birth);
    if (updateData.time_of_birth !== undefined) updateFields.time_of_birth = val(updateData.time_of_birth);
    if (updateData.place_of_birth !== undefined) updateFields.place_of_birth = val(updateData.place_of_birth);
    if (updateData.avatar_url !== undefined) updateFields.avatar_url = val(updateData.avatar_url);
    if (updateData.analysis_depth_mode !== undefined) updateFields.analysis_depth_mode = updateData.analysis_depth_mode;

    // Auto-sync full_name from first+last if not explicitly provided
    if (!updateData.full_name && (updateData.first_name !== undefined || updateData.last_name !== undefined)) {
      const first = updateFields.first_name ?? '';
      const last = updateFields.last_name ?? '';
      updateFields.full_name = `${first} ${last}`.trim() || null;
    }

    updateFields.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // First verify current password by attempting to sign in
    const { data: userData } = await this.supabaseService.getAdminClient()
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    // Verify current password
    const { error: signInError } = await this.supabaseService.getClient()
      .auth.signInWithPassword({
        email: userData.email,
        password: currentPassword,
      });

    if (signInError) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const { error: updateError } = await this.supabaseService.getAdminClient()
      .auth.admin.updateUserById(userId, {
        password: newPassword,
      });

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw new Error('Failed to update password');
    }

    return true;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
