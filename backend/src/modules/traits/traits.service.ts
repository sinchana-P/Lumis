import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreateTraitDto, UpdateTraitDto, TraitsQueryDto, TagSearchQueryDto } from './dto';

@Injectable()
export class TraitsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, dto: CreateTraitDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Verify member belongs to user when creating member trait
    if (dto.memberId) {
      await this.assertMemberOwnership(userId, dto.memberId);
    }

    const { data, error } = await supabase
      .from('traits')
      .insert({
        user_id: userId,
        member_id: dto.memberId ?? null,
        category: dto.category,
        description: dto.description,
        intensity: dto.intensity ?? null,
        emotion_tag: dto.emotionTag ?? null,
        tags: dto.tags ?? [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create trait: ${error.message}`);
    }

    return this.format(data);
  }

  async findAll(userId: string, query: TraitsQueryDto) {
    const supabase = this.supabaseService.getAdminClient();

    let q = supabase
      .from('traits')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (query.memberId) {
      q = q.eq('member_id', query.memberId);
    } else if (query.memberId === null) {
      q = q.is('member_id', null);
    }

    if (query.category) {
      q = q.eq('category', query.category);
    }

    // Tag filtering — PostgreSQL array overlap (@>) for AND logic
    if (query.tags && query.tags.length > 0) {
      q = q.contains('tags', query.tags);
    }

    const page  = query.page  ?? 1;
    const limit = query.limit ?? 50;
    q = q.range((page - 1) * limit, page * limit - 1);

    const { data, error } = await q;

    if (error) {
      throw new Error(`Failed to fetch traits: ${error.message}`);
    }

    return data.map(t => this.format(t));
  }

  async findOne(userId: string, traitId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('traits')
      .select('*')
      .eq('id', traitId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new NotFoundException('Trait not found');
    }

    return this.format(data);
  }

  async update(userId: string, traitId: string, dto: UpdateTraitDto) {
    const supabase = this.supabaseService.getAdminClient();

    await this.findOne(userId, traitId); // asserts ownership + existence

    const payload: Record<string, any> = {};
    if (dto.description !== undefined)  payload.description  = dto.description;
    if (dto.category    !== undefined)  payload.category     = dto.category;
    if (dto.intensity   !== undefined)  payload.intensity    = dto.intensity;
    if (dto.emotionTag  !== undefined)  payload.emotion_tag  = dto.emotionTag;
    if (dto.tags        !== undefined)  payload.tags         = dto.tags;

    const { data, error } = await supabase
      .from('traits')
      .update(payload)
      .eq('id', traitId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Trait not found');
    }

    return this.format(data);
  }

  async remove(userId: string, traitId: string) {
    const supabase = this.supabaseService.getAdminClient();

    await this.findOne(userId, traitId); // asserts ownership

    const { error } = await supabase
      .from('traits')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', traitId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete trait: ${error.message}`);
    }
  }

  /**
   * Cross-entity tag search.
   * Searches traits table with `tags @> '{tag1, tag2}'` (PostgreSQL array containment).
   * Returns traits grouped by category so the UI can route them to the right tab.
   *
   * Future extension: this same tag convention will be applied to incidents, patterns,
   * interactions, and journal entries — each table gets a `tags TEXT[]` column.
   */
  async searchByTags(userId: string, query: TagSearchQueryDto) {
    const supabase = this.supabaseService.getAdminClient();

    const page  = query.page  ?? 1;
    const limit = query.limit ?? 50;

    const { data, error } = await supabase
      .from('traits')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .contains('tags', query.tags)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw new Error(`Tag search failed: ${error.message}`);
    }

    return data.map(t => this.format(t));
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async assertMemberOwnership(userId: string, memberId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('members')
      .select('id')
      .eq('id', memberId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new ForbiddenException('Member not found or does not belong to this user');
    }
  }

  private format(row: any) {
    return {
      id:          row.id,
      userId:      row.user_id,
      memberId:    row.member_id,
      category:    row.category,
      description: row.description,
      intensity:   row.intensity,
      emotionTag:  row.emotion_tag,
      tags:        row.tags ?? [],
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
    };
  }
}
