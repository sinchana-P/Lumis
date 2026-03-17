import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatternsService } from './patterns.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { CreatePatternDto, UpdatePatternDto, PatternsQueryDto } from './dto';

@ApiTags('Patterns')
@Controller('members/:memberId/patterns')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PatternsController {
  constructor(private patternsService: PatternsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pattern' })
  async create(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Body() dto: CreatePatternDto,
  ) {
    const mid = memberId === 'self' ? null : memberId;
    const pattern = await this.patternsService.create(user.id, mid, dto);
    return this.ok(pattern);
  }

  @Get()
  @ApiOperation({ summary: 'List patterns for a member' })
  async findAll(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Query() query: PatternsQueryDto,
  ) {
    const mid = memberId === 'self' ? null : memberId;
    const patterns = await this.patternsService.findAll(user.id, mid, query);
    return this.ok(patterns);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single pattern' })
  async findOne(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Param('id') id: string,
  ) {
    const mid = memberId === 'self' ? null : memberId;
    const pattern = await this.patternsService.findOne(user.id, mid, id);
    return this.ok(pattern);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pattern' })
  async update(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePatternDto,
  ) {
    const mid = memberId === 'self' ? null : memberId;
    const pattern = await this.patternsService.update(user.id, mid, id, dto);
    return this.ok(pattern);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a pattern' })
  async remove(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Param('id') id: string,
  ) {
    const mid = memberId === 'self' ? null : memberId;
    await this.patternsService.remove(user.id, mid, id);
  }

  private ok(data: any) {
    return { success: true, data, meta: { timestamp: new Date().toISOString() } };
  }
}
