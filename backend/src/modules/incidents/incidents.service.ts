import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreateIncidentDto, UpdateIncidentDto, IncidentsQueryDto } from './dto';

@Injectable()
export class IncidentsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, memberId: string, dto: CreateIncidentDto) {
    const supabase = this.supabaseService.getAdminClient();
    await this.assertMemberOwnership(userId, memberId);

    const { data, error } = await supabase
      .from('incidents')
      .insert({
        user_id: userId,
        member_id: memberId,
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
    return this.format(data);
  }

  async findAll(userId: string, memberId: string, query: IncidentsQueryDto) {
    const supabase = this.supabaseService.getAdminClient();

    let q = supabase
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .eq('member_id', memberId)
      .order('date', { ascending: false });

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

  async findOne(userId: string, memberId: string, incidentId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .eq('user_id', userId)
      .eq('member_id', memberId)
      .single();

    if (error || !data) throw new NotFoundException('Incident not found');
    return this.format(data);
  }

  async update(userId: string, memberId: string, incidentId: string, dto: UpdateIncidentDto) {
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
    return this.format(data);
  }

  async remove(userId: string, memberId: string, incidentId: string) {
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
