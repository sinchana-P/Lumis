import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../services/supabase.service';

/**
 * AuthGuard validates JWT tokens and attaches user to request context
 * Integrates with Supabase Auth for token validation
 * Requirements: 7.2, 7.3, 7.4
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided',
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      });
    }

    try {
      // Validate token with Supabase Auth
      const { user, error } = await this.supabaseService.verifyToken(token);

      if (error || !user) {
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
          meta: {
            timestamp: new Date().toISOString(),
            request_id: this.generateRequestId(),
          },
        });
      }

      // Ensure user exists in our database
      await this.ensureUserExists(user);

      // Attach user object to request context
      request.user = {
        id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider || 'local',
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      });
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Ensure user exists in our database
   * Create user record if it doesn't exist (for OAuth users)
   */
  private async ensureUserExists(supabaseUser: any): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();

    // Check if user exists in our database
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', supabaseUser.id)
      .single();

    if (!existingUser) {
      // Create user record
      await supabase
        .from('users')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          full_name: supabaseUser.user_metadata?.full_name || null,
          avatar_url: supabaseUser.user_metadata?.avatar_url || null,
          provider: supabaseUser.app_metadata?.provider || 'local',
          analysis_depth_mode: 'full-spectrum',
        });
    }
  }
}
