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