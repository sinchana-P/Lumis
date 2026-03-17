import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { CreateIncidentDto, UpdateIncidentDto, IncidentsQueryDto } from './dto';

@ApiTags('Incidents')
@Controller('members/:memberId/incidents')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class IncidentsController {
  constructor(private incidentsService: IncidentsService) {}

  @Post()
  @ApiOperation({ summary: 'Log a new incident (use "self" as memberId for your own)' })
  async create(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Body() dto: CreateIncidentDto,
  ) {
    const resolvedId = memberId === 'self' ? null : memberId;
    const incident = await this.incidentsService.create(user.id, resolvedId, dto);
    return this.ok(incident);
  }

  @Get()
  @ApiOperation({ summary: 'List incidents for a member (use "self" for your own)' })
  async findAll(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Query() query: IncidentsQueryDto,
  ) {
    const resolvedId = memberId === 'self' ? null : memberId;
    const incidents = await this.incidentsService.findAll(user.id, resolvedId, query);
    return this.ok(incidents);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single incident' })
  async findOne(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Param('id') id: string,
  ) {
    const resolvedId = memberId === 'self' ? null : memberId;
    const incident = await this.incidentsService.findOne(user.id, resolvedId, id);
    return this.ok(incident);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an incident' })
  async update(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    const resolvedId = memberId === 'self' ? null : memberId;
    const incident = await this.incidentsService.update(user.id, resolvedId, id, dto);
    return this.ok(incident);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an incident' })
  async remove(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Param('id') id: string,
  ) {
    const resolvedId = memberId === 'self' ? null : memberId;
    await this.incidentsService.remove(user.id, resolvedId, id);
  }

  private ok(data: any) {
    return { success: true, data, meta: { timestamp: new Date().toISOString() } };
  }
}
