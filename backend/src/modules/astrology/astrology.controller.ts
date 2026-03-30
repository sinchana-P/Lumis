import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { AstrologyService } from './astrology.service';
import { CalculateAstrologyDto, GeocodeDto } from './dto';

@ApiTags('astrology')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('astrology')
export class AstrologyController {
  constructor(private readonly astrologyService: AstrologyService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate and persist Vedic astrology profile' })
  async calculate(@User() user: any, @Body() dto: CalculateAstrologyDto) {
    const userName = user.full_name?.split(' ')[0] || 'You';
    const result = await this.astrologyService.calculate(user.id, dto, userName);
    return { success: true, data: result };
  }

  @Post('self')
  @ApiOperation({ summary: 'Calculate and persist self astrology profile (personal insights only)' })
  async calculateSelf(@User() user: any, @Body() dto: CalculateAstrologyDto) {
    const firstName = user.full_name?.split(' ')[0] || user.first_name || 'You';
    const result = await this.astrologyService.calculateSelf(user.id, dto, firstName);
    return { success: true, data: result };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get Vedic astrology profile for the authenticated user' })
  async getMyProfile(@User() user: any) {
    const result = await this.astrologyService.getForUser(user.id);
    return { success: true, data: result };
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get Vedic astrology profile for a specific member' })
  async getMemberProfile(@User() user: any, @Param('memberId') memberId: string) {
    const result = await this.astrologyService.getByMember(user.id, memberId);
    return { success: true, data: result };
  }

  @Get('geocode')
  @ApiOperation({ summary: 'Geocode a place name to lat/lon/utcOffset' })
  async geocode(@Query() query: GeocodeDto) {
    const result = await this.astrologyService.geocode(query.place);
    return { success: true, data: result };
  }
}
