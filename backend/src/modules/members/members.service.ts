import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreateMemberDto, UpdateMemberDto, MembersQueryDto } from './dto';

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

  async update(userId: string, memberId: string, updateMemberDto: UpdateMemberDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('members')
      .update({
        full_name: updateMemberDto.fullName,
        nickname: updateMemberDto.nickname,
        date_of_birth: updateMemberDto.dateOfBirth,
        time_of_birth: updateMemberDto.timeOfBirth,
        place_of_birth: updateMemberDto.placeOfBirth,
        relation_type: updateMemberDto.relationType,
        relation_type_custom: updateMemberDto.relationTypeCustom,
        notes: updateMemberDto.notes,
      })
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