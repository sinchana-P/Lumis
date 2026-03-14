import { Controller, Get, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';
import {
  GoogleCallbackDto,
  SignUpDto,
  SignInDto,
  RefreshTokenDto,
} from './dto';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google/callback')
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Exchange Google OAuth code for tokens' })
  async googleCallback(@Body() dto: GoogleCallbackDto): Promise<any> {
    try {
      const result = await this.authService.handleGoogleCallback(dto.code);
      return {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @Post('signup')
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Create new user account with email and password' })
  async signUp(@Body() dto: SignUpDto): Promise<any> {
    try {
      const result = await this.authService.signUp(dto.email, dto.password);
      return {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @Post('login')
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  async signIn(@Body() dto: SignInDto): Promise<any> {
    try {
      const result = await this.authService.signIn(dto.email, dto.password);
      return {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @Post('refresh')
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Obtain new access token using refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<any> {
    try {
      const result = await this.authService.refreshToken(dto.refresh_token);
      return {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate user session and tokens' })
  async signOut(@User() user: any): Promise<any> {
    try {
      await this.authService.signOut(user.id);
      return {
        success: true,
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @Get('validate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate current access token and return user data' })
  async validateToken(@User() user: any): Promise<any> {
    try {
      const userData = await this.authService.validateToken(user.id);
      return {
        success: true,
        data: { user: userData },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@User() user: any): Promise<any> {
    try {
      return {
        success: true,
        data: user,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @Get('status')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check authentication status' })
  async getStatus(@User() user: any): Promise<any> {
    try {
      const hasOnboarding = await this.authService.hasCompletedOnboarding(user.id);

      return {
        success: true,
        data: {
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
          },
          has_completed_onboarding: hasOnboarding,
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId(),
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private handleError(error: any) {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    // Map known error types to standard error codes
    let errorCode = 'INTERNAL_ERROR';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let details = {};

    if (error.message?.includes('Invalid login credentials')) {
      errorCode = 'UNAUTHORIZED';
      statusCode = HttpStatus.UNAUTHORIZED;
      message = 'Invalid email or password';
    } else if (error.message?.includes('User already registered')) {
      errorCode = 'CONFLICT';
      statusCode = HttpStatus.CONFLICT;
      message = 'An account with this email already exists';
    } else if (error.message?.includes('Invalid refresh token')) {
      errorCode = 'UNAUTHORIZED';
      statusCode = HttpStatus.UNAUTHORIZED;
      message = 'Invalid or expired refresh token';
    } else if (error.name === 'ValidationError') {
      errorCode = 'VALIDATION_ERROR';
      statusCode = HttpStatus.BAD_REQUEST;
      message = error.message;
      details = error.details || {};
    }

    throw new HttpException(
      {
        success: false,
        error: {
          code: errorCode,
          message,
          details,
        },
        meta: {
          timestamp,
          request_id: requestId,
        },
      },
      statusCode,
    );
  }
}
