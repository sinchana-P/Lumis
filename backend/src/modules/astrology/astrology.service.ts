import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { AstrologyEngineService, BirthData } from './astrology-engine.service';
import { AstrologyInterpreterService } from './astrology-interpreter.service';
import { CalculateAstrologyDto } from './dto';

@Injectable()
export class AstrologyService {
  private readonly logger = new Logger(AstrologyService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly engine: AstrologyEngineService,
    private readonly interpreter: AstrologyInterpreterService,
  ) {}

  async calculate(userId: string, dto: CalculateAstrologyDto, userName = 'You') {
    const supabase = this.supabaseService.getAdminClient();

    const birthData: BirthData = {
      dob: dto.dob,
      birthTime: dto.birthTime,
      lat: dto.lat,
      lon: dto.lon,
      utcOffset: dto.utcOffset,
    };

    const computed = await this.engine.calculate(birthData);

    const isSelf = !dto.memberId;
    const insights = await this.interpreter.buildInsights(
      computed,
      dto.memberName || (isSelf ? userName : 'them'),
      dto.memberRelation || 'person',
      userName,
      isSelf,
    );

    const record = {
      user_id: userId,
      member_id: dto.memberId ?? null,
      computed,
      insights,
      updated_at: new Date().toISOString(),
    };

    let data: any;
    let error: any;

    if (dto.memberId) {
      // Member profile — upsert on member_id unique constraint
      ({ data, error } = await supabase
        .from('astrology_profiles')
        .upsert(record, { onConflict: 'member_id' })
        .select()
        .single());
    } else {
      // Self profile — NULL member_id breaks PostgreSQL unique upsert, do manual check
      const { data: existing } = await supabase
        .from('astrology_profiles')
        .select('id')
        .eq('user_id', userId)
        .is('member_id', null)
        .maybeSingle();

      if (existing) {
        ({ data, error } = await supabase
          .from('astrology_profiles')
          .update(record)
          .eq('id', existing.id)
          .select()
          .single());
      } else {
        ({ data, error } = await supabase
          .from('astrology_profiles')
          .insert(record)
          .select()
          .single());
      }
    }

    if (error) {
      this.logger.error(`Failed to persist astrology profile: ${error.message}`);
      throw new Error(error.message);
    }

    return this.formatProfile(data);
  }

  async getByMember(userId: string, memberId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('astrology_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('member_id', memberId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.formatProfile(data) : null;
  }

  async getForUser(userId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('astrology_profiles')
      .select('*')
      .eq('user_id', userId)
      .is('member_id', null)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.formatProfile(data) : null;
  }

  async geocode(place: string) {
    return AstrologyEngineService.geocode(place);
  }

  private formatProfile(raw: any) {
    return {
      id: raw.id,
      userId: raw.user_id,
      memberId: raw.member_id,
      computed: raw.computed,
      insights: raw.insights,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }
}
