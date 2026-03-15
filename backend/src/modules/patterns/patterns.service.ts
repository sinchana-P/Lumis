import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreatePatternDto, UpdatePatternDto, PatternsQueryDto } from './dto';

@Injectable()
export class PatternsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, memberId: string, dto: CreatePatternDto) {
    const supabase = this.supabaseService.getAdminClient();
    await this.assertMemberOwnership(userId, memberId);

    const { data, error } = await supabase
      .from('patterns')
      .insert({
        user_id:      userId,
        member_id:    memberId,
        title:        dto.title,
        description:  dto.description,
        pattern_type: dto.category ?? 'behavioral',
        category:     dto.category   ?? null,
        frequency:    dto.frequency  ?? null,
        impact:       dto.impact     ?? null,
        triggers:     dto.triggers   ?? [],
        examples:     dto.examples   ?? [],
        tags:         dto.tags       ?? [],
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create pattern: ${error.message}`);
    return this.format(data);
  }

  async findAll(userId: string, memberId: string, query: PatternsQueryDto) {
    const supabase = this.supabaseService.getAdminClient();

    let q = supabase
      .from('patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('member_id', memberId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (query.category) q = q.eq('category', query.category);
    if (query.impact)   q = q.eq('impact', query.impact);
    if (query.tags?.length) q = q.contains('tags', query.tags);

    const page  = query.page  ?? 1;
    const limit = query.limit ?? 50;
    q = q.range((page - 1) * limit, page * limit - 1);

    const { data, error } = await q;
    if (error) throw new Error(`Failed to fetch patterns: ${error.message}`);
    return data.map(r => this.format(r));
  }

  async findOne(userId: string, memberId: string, patternId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('patterns')
      .select('*')
      .eq('id', patternId)
      .eq('user_id', userId)
      .eq('member_id', memberId)
      .is('deleted_at', null)
      .single();

    if (error || !data) throw new NotFoundException('Pattern not found');
    return this.format(data);
  }

  async update(userId: string, memberId: string, patternId: string, dto: UpdatePatternDto) {
    const supabase = this.supabaseService.getAdminClient();
    await this.findOne(userId, memberId, patternId);

    const payload: Record<string, any> = {};
    if (dto.title       !== undefined) payload.title       = dto.title;
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.category    !== undefined) payload.category    = dto.category;
    if (dto.frequency   !== undefined) payload.frequency   = dto.frequency;
    if (dto.impact      !== undefined) payload.impact      = dto.impact;
    if (dto.triggers    !== undefined) payload.triggers    = dto.triggers;
    if (dto.examples    !== undefined) payload.examples    = dto.examples;
    if (dto.tags        !== undefined) payload.tags        = dto.tags;

    const { data, error } = await supabase
      .from('patterns')
      .update(payload)
      .eq('id', patternId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Pattern not found');
    return this.format(data);
  }

  async remove(userId: string, memberId: string, patternId: string) {
    const supabase = this.supabaseService.getAdminClient();
    await this.findOne(userId, memberId, patternId);

    const { error } = await supabase
      .from('patterns')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', patternId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete pattern: ${error.message}`);
  }

  private async assertMemberOwnership(userId: string, memberId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('members').select('id').eq('id', memberId).eq('user_id', userId).single();
    if (error || !data) throw new ForbiddenException('Member not found');
  }

  private format(row: any) {
    return {
      id:          row.id,
      userId:      row.user_id,
      memberId:    row.member_id,
      title:       row.title,
      description: row.description,
      category:    row.category,
      frequency:   row.frequency,
      impact:      row.impact,
      triggers:    row.triggers  ?? [],
      examples:    row.examples  ?? [],
      tags:        row.tags      ?? [],
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
    };
  }
}
