import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreateInteractionDto, UpdateInteractionDto, InteractionsQueryDto } from './dto';

@Injectable()
export class InteractionsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, memberId: string, dto: CreateInteractionDto) {
    const supabase = this.supabaseService.getAdminClient();
    await this.assertMemberOwnership(userId, memberId);

    const { data, error } = await supabase
      .from('interactions')
      .insert({
        user_id:      userId,
        member_id:    memberId,
        title:        dto.title,
        description:  dto.description,
        date:         dto.date,
        type:         dto.type         ?? null,
        duration:     dto.duration     ?? null,
        quality:      dto.quality      ?? null,
        mood_before:  dto.moodBefore   ?? null,
        mood_after:   dto.moodAfter    ?? null,
        energy_level: dto.energyLevel  ?? null,
        topics:       dto.topics       ?? [],
        tags:         dto.tags         ?? [],
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create interaction: ${error.message}`);
    return this.format(data);
  }

  async findAll(userId: string, memberId: string, query: InteractionsQueryDto) {
    const supabase = this.supabaseService.getAdminClient();

    let q = supabase
      .from('interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('member_id', memberId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (query.type)    q = q.eq('type', query.type);
    if (query.quality) q = q.eq('quality', query.quality);
    if (query.tags?.length) q = q.contains('tags', query.tags);

    const page  = query.page  ?? 1;
    const limit = query.limit ?? 50;
    q = q.range((page - 1) * limit, page * limit - 1);

    const { data, error } = await q;
    if (error) throw new Error(`Failed to fetch interactions: ${error.message}`);
    return data.map(r => this.format(r));
  }

  async findOne(userId: string, memberId: string, interactionId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('id', interactionId)
      .eq('user_id', userId)
      .eq('member_id', memberId)
      .is('deleted_at', null)
      .single();

    if (error || !data) throw new NotFoundException('Interaction not found');
    return this.format(data);
  }

  async update(userId: string, memberId: string, interactionId: string, dto: UpdateInteractionDto) {
    const supabase = this.supabaseService.getAdminClient();
    await this.findOne(userId, memberId, interactionId);

    const payload: Record<string, any> = {};
    if (dto.title        !== undefined) payload.title        = dto.title;
    if (dto.description  !== undefined) payload.description  = dto.description;
    if (dto.date         !== undefined) payload.date         = dto.date;
    if (dto.type         !== undefined) payload.type         = dto.type;
    if (dto.duration     !== undefined) payload.duration     = dto.duration;
    if (dto.quality      !== undefined) payload.quality      = dto.quality;
    if (dto.moodBefore   !== undefined) payload.mood_before  = dto.moodBefore;
    if (dto.moodAfter    !== undefined) payload.mood_after   = dto.moodAfter;
    if (dto.energyLevel  !== undefined) payload.energy_level = dto.energyLevel;
    if (dto.topics       !== undefined) payload.topics       = dto.topics;
    if (dto.tags         !== undefined) payload.tags         = dto.tags;

    const { data, error } = await supabase
      .from('interactions')
      .update(payload)
      .eq('id', interactionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Interaction not found');
    return this.format(data);
  }

  async remove(userId: string, memberId: string, interactionId: string) {
    const supabase = this.supabaseService.getAdminClient();
    await this.findOne(userId, memberId, interactionId);

    const { error } = await supabase
      .from('interactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', interactionId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete interaction: ${error.message}`);
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
      date:        row.date,
      type:        row.type,
      duration:    row.duration,
      quality:     row.quality,
      moodBefore:  row.mood_before,
      moodAfter:   row.mood_after,
      energyLevel: row.energy_level,
      topics:      row.topics ?? [],
      tags:        row.tags   ?? [],
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
    };
  }
}
