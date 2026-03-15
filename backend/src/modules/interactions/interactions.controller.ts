import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InteractionsService } from './interactions.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { CreateInteractionDto, UpdateInteractionDto, InteractionsQueryDto } from './dto';

@ApiTags('Interactions')
@Controller('members/:memberId/interactions')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class InteractionsController {
  constructor(private interactionsService: InteractionsService) {}

  @Post()
  @ApiOperation({ summary: 'Log a new interaction' })
  async create(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Body() dto: CreateInteractionDto,
  ) {
    const interaction = await this.interactionsService.create(user.id, memberId, dto);
    return this.ok(interaction);
  }

  @Get()
  @ApiOperation({ summary: 'List interactions for a member' })
  async findAll(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Query() query: InteractionsQueryDto,
  ) {
    const interactions = await this.interactionsService.findAll(user.id, memberId, query);
    return this.ok(interactions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single interaction' })
  async findOne(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Param('id') id: string,
  ) {
    const interaction = await this.interactionsService.findOne(user.id, memberId, id);
    return this.ok(interaction);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an interaction' })
  async update(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInteractionDto,
  ) {
    const interaction = await this.interactionsService.update(user.id, memberId, id, dto);
    return this.ok(interaction);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an interaction' })
  async remove(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Param('id') id: string,
  ) {
    await this.interactionsService.remove(user.id, memberId, id);
  }

  private ok(data: any) {
    return { success: true, data, meta: { timestamp: new Date().toISOString() } };
  }
}
