import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('Journal')
@Controller('members/:memberId/journal')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  @ApiOperation({ summary: 'Get all journal entries for a member (use "self" for your own)' })
  async findAll(@Request() req: any, @Param('memberId') memberId: string) {
    const resolvedId = memberId === 'self' ? null : memberId;
    const data = await this.journalService.findAll(req.user.id, resolvedId);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new journal entry (use "self" for your own)' })
  async create(
    @Request() req: any,
    @Param('memberId') memberId: string,
    @Body() dto: CreateJournalEntryDto,
  ) {
    const resolvedId = memberId === 'self' ? null : memberId;
    const data = await this.journalService.create(req.user.id, resolvedId, dto);
    return { success: true, data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a journal entry' })
  async update(
    @Request() req: any,
    @Param('memberId') memberId: string,
    @Param('id') id: string,
    @Body() dto: CreateJournalEntryDto,
  ) {
    const data = await this.journalService.update(req.user.id, memberId, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a journal entry' })
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.journalService.remove(req.user.id, id);
    return { success: true };
  }
}
