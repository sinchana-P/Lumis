import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { VectorMemoryService } from '../lumen/vector-memory.service';
import { CreateIncidentDto, UpdateIncidentDto, IncidentsQueryDto } from './dto';

@Injectable()
export class IncidentsService {
  constructor(
    private supabaseService: SupabaseService,
    private vectorMemory: VectorMemoryService,
  ) {}

  async create(userId: string, memberId: string | null, dto: CreateIncidentDto) {
    const supabase = this.supabaseService.getAdminClient();
    if (memberId) await this.assertMemberOwnership(userId, memberId);

    const { data, error } = await supabase
      .from('incidents')
      .insert({
        user_id: userId,
        member_id: memberId ?? null,
        title: dto.title,
        description: dto.description,
        date: dto.date,
        category: dto.category ?? null,
        severity: dto.severity ?? null,
        outcome: dto.outcome ?? null,
        emotions: dto.emotions ?? [],
        tags: dto.tags ?? [],
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create incident: ${error.message}`);
    const formatted = this.format(data);
    this.vectorMemory.storeIncident(
      { id: formatted.id, memberId: formatted.memberId, title: formatted.title, description: formatted.description,
        emotions: formatted.emotions, type: formatted.category ?? 'general', intensity: formatted.severity ?? 'moderate',
        resolution: formatted.outcome, date: formatted.date },
      userId,
    ).catch(() => {/* non-fatal */});
    return formatted;
  }

  async findAll(userId: string, memberId: string | null, query: IncidentsQueryDto) {
    const supabase = this.supabaseService.getAdminClient();

    let q = supabase
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (memberId) q = q.eq('member_id', memberId);
    else          q = q.is('member_id', null);

    if (query.category) q = q.eq('category', query.category);
    if (query.severity)  q = q.eq('severity', query.severity);
    if (query.tags?.length) q = q.contains('tags', query.tags);

    const page  = query.page  ?? 1;
    const limit = query.limit ?? 50;
    q = q.range((page - 1) * limit, page * limit - 1);

    const { data, error } = await q;
    if (error) throw new Error(`Failed to fetch incidents: ${error.message}`);
    return data.map(r => this.format(r));
  }

  async findOne(userId: string, memberId: string | null, incidentId: string) {
    const supabase = this.supabaseService.getAdminClient();
    let q = supabase.from('incidents').select('*').eq('id', incidentId).eq('user_id', userId);
    if (memberId) q = q.eq('member_id', memberId);
    else          q = q.is('member_id', null);
    const { data, error } = await (q as any).single();

    if (error || !data) throw new NotFoundException('Incident not found');
    return this.format(data);
  }

  async update(userId: string, memberId: string | null, incidentId: string, dto: UpdateIncidentDto) {
    const supabase = this.supabaseService.getAdminClient();
    await this.findOne(userId, memberId, incidentId);

    const payload: Record<string, any> = {};
    if (dto.title       !== undefined) payload.title       = dto.title;
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.date        !== undefined) payload.date        = dto.date;
    if (dto.category    !== undefined) payload.category    = dto.category;
    if (dto.severity    !== undefined) payload.severity    = dto.severity;
    if (dto.outcome     !== undefined) payload.outcome     = dto.outcome;
    if (dto.emotions    !== undefined) payload.emotions    = dto.emotions;
    if (dto.tags        !== undefined) payload.tags        = dto.tags;

    const { data, error } = await supabase
      .from('incidents')
      .update(payload)
      .eq('id', incidentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Incident not found');
    const formatted = this.format(data);
    this.vectorMemory.storeIncident(
      { id: formatted.id, memberId: formatted.memberId, title: formatted.title, description: formatted.description,
        emotions: formatted.emotions, type: formatted.category ?? 'general', intensity: formatted.severity ?? 'moderate',
        resolution: formatted.outcome, date: formatted.date },
      userId,
    ).catch(() => {/* non-fatal */});
    return formatted;
  }

  async remove(userId: string, memberId: string | null, incidentId: string) {
    const supabase = this.supabaseService.getAdminClient();
    await this.findOne(userId, memberId, incidentId);

    // Hard delete until migration adds deleted_at column (run add-incidents-columns.sql first)
    const { error } = await supabase
      .from('incidents')
      .delete()
      .eq('id', incidentId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete incident: ${error.message}`);
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
      category:    row.category,
      severity:    row.severity,
      outcome:     row.outcome,
      emotions:    row.emotions ?? [],
      tags:        row.tags ?? [],
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
    };
  }
}
