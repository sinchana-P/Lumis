import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { VectorMemoryService } from '../lumen/vector-memory.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';

@Injectable()
export class JournalService {
  constructor(
    private supabaseService: SupabaseService,
    private vectorMemory: VectorMemoryService,
  ) {}

  async findAll(userId: string, memberId: string) {
    const supabase = this.supabaseService.getAdminClient();
    await this.assertMemberOwnership(userId, memberId);

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('member_id', memberId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async create(userId: string, memberId: string, dto: CreateJournalEntryDto) {
    const supabase = this.supabaseService.getAdminClient();
    await this.assertMemberOwnership(userId, memberId);

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id:    userId,
        member_id:  memberId,
        content:    dto.content,
        title:      dto.title      ?? null,
        date:       dto.date       ?? new Date().toISOString().split('T')[0],
        emotions:   dto.emotions   ?? [],
        tags:       dto.tags       ?? [],
        is_private: dto.isPrivate  ?? false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    this.vectorMemory.storeJournalEntry(
      { id: data.id, memberId, text: data.content, date: data.date },
      userId,
    ).catch(() => {/* non-fatal */});
    return data;
  }

  async update(userId: string, memberId: string, id: string, dto: CreateJournalEntryDto) {
    const supabase = this.supabaseService.getAdminClient();
    await this.assertOwnership(userId, id);

    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        content:    dto.content,
        title:      dto.title      ?? null,
        date:       dto.date       ?? new Date().toISOString().split('T')[0],
        emotions:   dto.emotions   ?? [],
        tags:       dto.tags       ?? [],
        is_private: dto.isPrivate  ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw new Error(error.message);
    this.vectorMemory.storeJournalEntry(
      { id: data.id, memberId, text: data.content, date: data.date },
      userId,
    ).catch(() => {/* non-fatal */});
    return data;
  }

  async remove(userId: string, id: string) {
    const supabase = this.supabaseService.getAdminClient();
    await this.assertOwnership(userId, id);

    const { error } = await supabase
      .from('journal_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  private async assertMemberOwnership(userId: string, memberId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data } = await supabase
      .from('members')
      .select('id')
      .eq('id', memberId)
      .eq('user_id', userId)
      .single();
    if (!data) throw new ForbiddenException('Member not found');
  }

  private async assertOwnership(userId: string, entryId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('id', entryId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();
    if (!data) throw new NotFoundException('Journal entry not found');
  }
}
