import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { NumerologyService } from './numerology.service';
import { CalculateNumerologyDto } from './dto';

@ApiTags('numerology')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('numerology')
export class NumerologyController {
  constructor(private readonly numerologyService: NumerologyService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate and persist numerology profile for a member or self' })
  async calculate(@User() user: any, @Body() dto: CalculateNumerologyDto) {
    const userFullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.full_name || user.email;
    const userProfile = user.date_of_birth
      ? { dob: user.date_of_birth, fullName: userFullName }
      : undefined;
    const result = await this.numerologyService.calculate(user.id, dto, userProfile);
    return { success: true, data: result };
  }

  @Post('self')
  @ApiOperation({ summary: 'Calculate and persist self numerology profile (no compatibility)' })
  async calculateSelf(@User() user: any) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.full_name || user.email;
    if (!user.date_of_birth || !fullName) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Date of birth and name are required' } };
    }
    const result = await this.numerologyService.calculateSelf(user.id, user.date_of_birth, fullName);
    return { success: true, data: result };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get numerology profile for the authenticated user' })
  async getMyProfile(@User() user: any) {
    const result = await this.numerologyService.getForUser(user.id, user.date_of_birth);
    return { success: true, data: result };
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get numerology profile for a specific member' })
  async getMemberProfile(@User() user: any, @Param('memberId') memberId: string) {
    const result = await this.numerologyService.getByMember(user.id, memberId);
    return { success: true, data: result };
  }
}
