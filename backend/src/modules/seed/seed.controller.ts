import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SeedService } from './seed.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('seed')
@UseGuards(AuthGuard)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  /**
   * POST /api/v1/seed/demo-luminary
   * Creates the demo luminary (Mia Rosewood) for the authenticated user.
   * Idempotent — calling it multiple times is safe.
   */
  @Post('demo-luminary')
  async seedDemoLuminary(@Req() req: any) {
    const userId: string = req.user.id;
    const result = await this.seedService.seedDemoLuminary(userId);
    return {
      success: true,
      data: {
        created: result.created,
        memberId: result.memberId,
        message: result.created
          ? "Your demo luminary 'System Node' has been added. Explore their profile to see how all sections work."
          : 'Demo luminary already exists in your orbit.',
      },
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
