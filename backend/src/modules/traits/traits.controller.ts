import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TraitsService } from './traits.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { CreateTraitDto, UpdateTraitDto, TraitsQueryDto, TagSearchQueryDto } from './dto';

@ApiTags('Traits')
@Controller('traits')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TraitsController {
  constructor(private traitsService: TraitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a trait (user self-trait or member trait)' })
  async create(@User() user: any, @Body() dto: CreateTraitDto) {
    const trait = await this.traitsService.create(user.id, dto);
    return this.ok(trait);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Cross-entity tag search',
    description: 'Find all traits matching ALL supplied tags. Tags use prefix format: mood:happy, theme:trust, context:work, emotion:frustrated.',
  })
  @ApiQuery({ name: 'tags', type: [String], required: true, example: ['mood:happy', 'theme:trust'] })
  async searchByTags(@User() user: any, @Query() query: TagSearchQueryDto) {
    const results = await this.traitsService.searchByTags(user.id, query);
    return this.ok(results);
  }

  @Get()
  @ApiOperation({ summary: 'List traits — filter by memberId, category, tags' })
  async findAll(@User() user: any, @Query() query: TraitsQueryDto) {
    const traits = await this.traitsService.findAll(user.id, query);
    return this.ok(traits);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single trait' })
  async findOne(@User() user: any, @Param('id') id: string) {
    const trait = await this.traitsService.findOne(user.id, id);
    return this.ok(trait);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a trait' })
  async update(@User() user: any, @Param('id') id: string, @Body() dto: UpdateTraitDto) {
    const trait = await this.traitsService.update(user.id, id, dto);
    return this.ok(trait);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a trait' })
  async remove(@User() user: any, @Param('id') id: string) {
    await this.traitsService.remove(user.id, id);
  }

  private ok(data: any) {
    return {
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
