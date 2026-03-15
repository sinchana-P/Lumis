import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('members/:memberId/journal')
@UseGuards(AuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  async findAll(@Request() req: any, @Param('memberId') memberId: string) {
    const data = await this.journalService.findAll(req.user.id, memberId);
    return { success: true, data };
  }

  @Post()
  async create(
    @Request() req: any,
    @Param('memberId') memberId: string,
    @Body() dto: CreateJournalEntryDto,
  ) {
    const data = await this.journalService.create(req.user.id, memberId, dto);
    return { success: true, data };
  }

  @Put(':id')
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
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.journalService.remove(req.user.id, id);
    return { success: true };
  }
}
