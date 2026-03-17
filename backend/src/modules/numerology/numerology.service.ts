import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { NumerologyEngineService } from './numerology-engine.service';
import { NumerologyInterpreterService, NumerologyInsights, NumerologyCompatibility } from './numerology-interpreter.service';
import { CalculateNumerologyDto } from './dto';

function hashString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

@Injectable()
export class NumerologyService {
  private readonly logger = new Logger(NumerologyService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly engine: NumerologyEngineService,
    private readonly interpreter: NumerologyInterpreterService,
  ) {}

  // Calculate and persist numerology for any subject (user or member)
  async calculate(userId: string, dto: CalculateNumerologyDto, userProfile?: { dob: string; fullName: string }) {
    const supabase = this.supabaseService.getAdminClient();
    const dobHash = hashString(dto.dob);
    const nameHash = hashString(dto.fullName);

    const compatibilityRequested = Boolean(dto.memberDob && dto.memberFullName);

    // Check cache — if same dob+name, return existing (unless compatibility was requested but missing)
    if (dto.memberId) {
      const { data: cached } = await supabase
        .from('numerology_profiles')
        .select('*')
        .eq('member_id', dto.memberId)
        .eq('dob_hash', dobHash)
        .eq('name_hash', nameHash)
        .maybeSingle();

      if (cached && !(compatibilityRequested && !cached.compatibility)) {
        return this.formatProfile(cached);
      }
    } else {
      const { data: cached } = await supabase
        .from('numerology_profiles')
        .select('*')
        .eq('user_id', userId)
        .is('member_id', null)
        .eq('dob_hash', dobHash)
        .eq('name_hash', nameHash)
        .maybeSingle();

      if (cached && !(compatibilityRequested && !cached.compatibility)) {
        return this.formatProfile(cached);
      }
    }

    // Compute core numbers (pure math)
    const base = this.engine.buildProfile(dto.dob, dto.fullName);

    // Derive user numbers for relationship context
    const userNumbers = userProfile
      ? {
          lp: this.engine.lifePath(userProfile.dob),
          su: this.engine.soulUrge(userProfile.fullName),
          expr: this.engine.expression(userProfile.fullName),
          py: this.engine.personalYear(userProfile.dob),
        }
      : { lp: 1, su: 1, expr: 1, py: 1 };

    const userName = userProfile?.fullName?.split(' ')[0] || 'You';

    // Generate AI interpretations
    const insights: NumerologyInsights = await this.interpreter.buildInsights(
      {
        lp: base.coreNumbers.lifePath,
        su: base.coreNumbers.soulUrge,
        expr: base.coreNumbers.expression,
        pers: base.coreNumbers.personality,
        bd: base.coreNumbers.birthday,
        mat: base.coreNumbers.maturity,
        py: base.timingNumbers.personalYear,
        pm: base.timingNumbers.personalMonth,
      },
      dto.fullName.split(' ')[0],
      dto.memberRelation || 'person',
      userName,
      userNumbers,
    );

    // Compatibility (only if member + user profile provided)
    let compatibility: NumerologyCompatibility | null = null;
    if (dto.memberDob && dto.memberFullName && userProfile) {
      compatibility = await this.interpreter.buildCompatibility(
        userProfile.dob, dto.memberDob,
        userProfile.fullName, dto.memberFullName,
        dto.memberRelation || 'person',
      );
    }

    // Persist
    const record = {
      user_id: userId,
      member_id: dto.memberId ?? null,
      dob_hash: dobHash,
      name_hash: nameHash,
      core_numbers: base.coreNumbers,
      timing_numbers: base.timingNumbers,
      insights,
      compatibility,
      updated_at: new Date().toISOString(),
    };

    let data: any;
    let error: any;

    if (dto.memberId) {
      // Member profile — upsert on member_id unique constraint
      ({ data, error } = await supabase
        .from('numerology_profiles')
        .upsert(record, { onConflict: 'member_id' })
        .select()
        .single());
    } else {
      // Self profile — NULL member_id breaks PostgreSQL unique upsert, do manual check
      const { data: existing } = await supabase
        .from('numerology_profiles')
        .select('id')
        .eq('user_id', userId)
        .is('member_id', null)
        .maybeSingle();

      if (existing) {
        ({ data, error } = await supabase
          .from('numerology_profiles')
          .update(record)
          .eq('id', existing.id)
          .select()
          .single());
      } else {
        ({ data, error } = await supabase
          .from('numerology_profiles')
          .insert(record)
          .select()
          .single());
      }
    }

    if (error) {
      this.logger.error(`Failed to persist numerology profile: ${error.message}`);
      throw new Error(error.message);
    }

    return this.formatProfile(data);
  }

  async getByMember(userId: string, memberId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('numerology_profiles')
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
      .from('numerology_profiles')
      .select('*')
      .eq('user_id', userId)
      .is('member_id', null)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.formatProfile(data) : null;
  }

  private formatProfile(raw: any) {
    return {
      id: raw.id,
      userId: raw.user_id,
      memberId: raw.member_id,
      coreNumbers: raw.core_numbers,
      timingNumbers: raw.timing_numbers,
      insights: raw.insights,
      compatibility: raw.compatibility,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }
}
