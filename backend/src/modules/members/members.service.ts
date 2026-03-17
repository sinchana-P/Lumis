import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreateMemberDto, UpdateMemberDto, MembersQueryDto } from './dto';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class MembersService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, createMemberDto: CreateMemberDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('members')
      .insert({
        user_id: userId,
        full_name: createMemberDto.fullName,
        nickname: createMemberDto.nickname || null,
        date_of_birth: createMemberDto.dateOfBirth || null,
        time_of_birth: createMemberDto.timeOfBirth || null,
        place_of_birth: createMemberDto.placeOfBirth || null,
        relation_type: createMemberDto.relationType,
        relation_type_custom: createMemberDto.relationTypeCustom || null,
        notes: createMemberDto.notes || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create member: ${error.message}`);
    }

    return this.formatMember(data);
  }

  async findAll(userId: string, query: MembersQueryDto) {
    const supabase = this.supabaseService.getAdminClient();

    let queryBuilder = supabase
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    // Add filters if provided
    if (query.relationType) {
      queryBuilder = queryBuilder.eq('relation_type', query.relationType);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to fetch members: ${error.message}`);
    }

    return data.map(member => this.formatMember(member));
  }

  async findOne(userId: string, memberId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .eq('id', memberId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Member not found');
    }

    return this.formatMember(data);
  }

  async update(userId: string, memberId: string, updateMemberDto: UpdateMemberDto, photo?: MulterFile) {
    const supabase = this.supabaseService.getAdminClient();

    // Build update payload — only include defined fields (PATCH semantics)
    const updatePayload: Record<string, any> = {};
    if (updateMemberDto.fullName !== undefined)           updatePayload.full_name = updateMemberDto.fullName;
    if (updateMemberDto.nickname !== undefined)           updatePayload.nickname = updateMemberDto.nickname || null;
    if (updateMemberDto.dateOfBirth !== undefined)        updatePayload.date_of_birth = updateMemberDto.dateOfBirth || null;
    if (updateMemberDto.timeOfBirth !== undefined)        updatePayload.time_of_birth = updateMemberDto.timeOfBirth || null;
    if (updateMemberDto.placeOfBirth !== undefined)       updatePayload.place_of_birth = updateMemberDto.placeOfBirth || null;
    if (updateMemberDto.relationType !== undefined)       updatePayload.relation_type = updateMemberDto.relationType;
    if (updateMemberDto.relationTypeCustom !== undefined) updatePayload.relation_type_custom = updateMemberDto.relationTypeCustom || null;
    if (updateMemberDto.notes !== undefined)              updatePayload.notes = updateMemberDto.notes || null;

    // Handle photo upload
    if (photo && photo.buffer && photo.buffer.length > 0) {
      const ext = (photo.originalname.split('.').pop() ?? 'jpg').toLowerCase();
      const storagePath = `members/${userId}/${memberId}.${ext}`;
      const BUCKET = 'member-photos';

      // Ensure bucket exists (creates it if missing)
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === BUCKET);
      if (!bucketExists) {
        await supabase.storage.createBucket(BUCKET, { public: true });
      }

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, photo.buffer, {
          contentType: photo.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error(`Photo upload failed: ${uploadError.message}`);
        throw new Error(`Photo upload failed: ${uploadError.message}`);
      }

      updatePayload.photo_url = this.supabaseService.getPublicUrl(BUCKET, storagePath);
    } else if ((updateMemberDto as any).photoUrl === '') {
      // Explicit removal — frontend sends photoUrl: '' when user cleared the photo
      updatePayload.photo_url = null;
    }

    const { data, error } = await supabase
      .from('members')
      .update(updatePayload)
      .eq('user_id', userId)
      .eq('id', memberId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Member not found');
    }

    return this.formatMember(data);
  }

  async remove(userId: string, memberId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase
      .from('members')
      .update({ archived: true })
      .eq('user_id', userId)
      .eq('id', memberId);

    if (error) {
      throw new Error(`Failed to archive member: ${error.message}`);
    }
  }

  // ── RELATIONSHIP HEALTH SCORE ────────────────────────────────
  //
  // Formula (base 50, clamped 0–100):
  //   Traits (±20)       : (pros_weight - cons_weight) / total_weight * 20
  //   Interactions (±20) : avg quality score × (20/3)
  //   Incidents (±20)    : net resolved vs unresolved, weighted by severity
  //   Patterns (±10)     : (positive - negative) / max(total, 1) * 10
  //
  // Intensity weights  : mild=1, moderate=2, strong=3
  // Interaction scores : energised=3, connected/safe=2, neutral=0, drained=-2, tense/conflicted=-3
  // Incident severity  : low=1, medium=2, high=3  |  resolved=+sev, unresolved=-sev*1.5
  // Pattern impact     : positive=+1, neutral=0, negative=-1

  async getHealthScores(userId: string): Promise<{ memberId: string; score: number; breakdown: Record<string, number> }[]> {
    const supabase = this.supabaseService.getAdminClient();

    const { data: members } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', userId)
      .eq('archived', false);

    if (!members?.length) return [];

    const memberIds = members.map(m => m.id);

    // Batch-fetch all relevant data in parallel
    const [traitsRes, interactionsRes, incidentsRes, patternsRes] = await Promise.all([
      supabase.from('traits').select('member_id,category,intensity').in('member_id', memberIds).is('deleted_at', null),
      supabase.from('interactions').select('member_id,quality').in('member_id', memberIds).is('deleted_at', null).order('date', { ascending: false }),
      supabase.from('incidents').select('member_id,severity,outcome').in('member_id', memberIds).is('deleted_at', null),
      supabase.from('patterns').select('member_id,impact').in('member_id', memberIds).is('deleted_at', null),
    ]);

    const intensityWeight = (i: string | null) => i === 'strong' ? 3 : i === 'moderate' ? 2 : 1;
    const qualityScore = (q: string | null) => {
      if (!q) return 0;
      if (q === 'energised') return 3;
      if (q === 'connected' || q === 'safe') return 2;
      if (q === 'neutral') return 0;
      if (q === 'drained') return -2;
      return -3; // tense, conflicted, etc.
    };
    const severityWeight = (s: string | null) => s === 'high' ? 3 : s === 'medium' ? 2 : 1;

    return memberIds.map(memberId => {
      // ── Traits component ──────────────────────────────────────
      const traits = (traitsRes.data || []).filter(t => t.member_id === memberId);
      const posCategories = ['pro', 'strength', 'positive'];
      const negCategories = ['con', 'shadow', 'negative', 'trigger', 'conflict'];
      const prosW = traits.filter(t => posCategories.includes(t.category)).reduce((s, t) => s + intensityWeight(t.intensity), 0);
      const consW = traits.filter(t => negCategories.includes(t.category)).reduce((s, t) => s + intensityWeight(t.intensity), 0);
      const totalTraitW = prosW + consW;
      const traitScore = totalTraitW > 0 ? ((prosW - consW) / totalTraitW) * 20 : 0;

      // ── Interactions component ──────────────────────────────────
      const interactions = (interactionsRes.data || []).filter(i => i.member_id === memberId).slice(0, 10);
      const interactionScore = interactions.length > 0
        ? (interactions.reduce((s, i) => s + qualityScore(i.quality), 0) / interactions.length) * (20 / 3)
        : 0;

      // ── Incidents component ──────────────────────────────────────
      const incidents = (incidentsRes.data || []).filter(i => i.member_id === memberId);
      const incidentNet = incidents.reduce((s, i) => {
        const w = severityWeight(i.severity);
        const resolved = i.outcome === 'resolved' || i.outcome === 'positive';
        return s + (resolved ? w : -w * 1.5);
      }, 0);
      const maxIncidentScore = Math.max(incidents.length * 3, 1);
      const incidentScore = Math.max(-20, Math.min(20, (incidentNet / maxIncidentScore) * 20));

      // ── Patterns component ──────────────────────────────────────
      const patterns = (patternsRes.data || []).filter(p => p.member_id === memberId);
      const patternNet = patterns.reduce((s, p) => {
        if (p.impact === 'positive') return s + 1;
        if (p.impact === 'negative') return s - 1;
        return s;
      }, 0);
      const patternScore = patterns.length > 0 ? (patternNet / Math.max(patterns.length, 1)) * 10 : 0;

      const raw = 50 + traitScore + interactionScore + incidentScore + patternScore;
      const score = Math.round(Math.max(0, Math.min(100, raw)));

      return {
        memberId,
        score,
        breakdown: {
          base: 50,
          traits: Math.round(traitScore * 10) / 10,
          interactions: Math.round(interactionScore * 10) / 10,
          incidents: Math.round(incidentScore * 10) / 10,
          patterns: Math.round(patternScore * 10) / 10,
        },
      };
    });
  }

  private formatMember(member: any) {
    return {
      id: member.id,
      fullName: member.full_name,
      nickname: member.nickname,
      dateOfBirth: member.date_of_birth,
      timeOfBirth: member.time_of_birth,
      placeOfBirth: member.place_of_birth,
      relationType: member.relation_type,
      relationTypeCustom: member.relation_type_custom,
      photoUrl: member.photo_url,
      notes: member.notes,
      archived: member.archived,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
    };
  }
}