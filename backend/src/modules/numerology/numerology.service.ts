import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { NumerologyEngineService } from './numerology-engine.service';
import { NumerologyInterpreterService, NumerologyInsights, NumerologyCompatibility, NumerologySelfInsights } from './numerology-interpreter.service';
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

  async calculateSelf(userId: string, dob: string, fullName: string): Promise<any> {
    const supabase = this.supabaseService.getAdminClient();
    const dobHash = hashString(dob);
    const nameHash = hashString(fullName + '_self');

    // POST always regenerates — re-runs AI to pick up any updated interpretations
    const base = this.engine.buildProfile(dob, fullName);
    const firstName = fullName.split(' ')[0];

    const pinnacle = base.timingNumbers.pinnacle1 ?? base.timingNumbers.personalYear ?? 1;
    const challenge = base.timingNumbers.challenge1 ?? 1;

    const insights: NumerologySelfInsights = await this.interpreter.buildSelfInsights(
      {
        lp: base.coreNumbers.lifePath,
        su: base.coreNumbers.soulUrge,
        expr: base.coreNumbers.expression,
        pers: base.coreNumbers.personality,
        bd: base.coreNumbers.birthday,
        mat: base.coreNumbers.maturity,
        py: base.timingNumbers.personalYear,
        pm: base.timingNumbers.personalMonth,
        pinnacle,
        challenge,
      },
      firstName,
    );

    const record = {
      user_id: userId,
      member_id: null,
      dob_hash: dobHash,
      name_hash: nameHash,
      core_numbers: base.coreNumbers,
      timing_numbers: base.timingNumbers,
      insights,
      compatibility: null,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from('numerology_profiles')
      .select('id')
      .eq('user_id', userId)
      .is('member_id', null)
      .maybeSingle();

    let data: any, error: any;
    if (existing) {
      ({ data, error } = await supabase.from('numerology_profiles').update(record).eq('id', existing.id).select().single());
    } else {
      ({ data, error } = await supabase.from('numerology_profiles').insert(record).select().single());
    }

    if (error) throw new Error(error.message);
    return this.formatSelfProfile(data);
  }

  private formatSelfProfile(raw: any) {
    return {
      id: raw.id,
      userId: raw.user_id,
      coreNumbers: raw.core_numbers,
      timingNumbers: raw.timing_numbers,
      insights: raw.insights,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }

  // Always recompute timing numbers from today's date — Personal Day/Month/Year must be live
  private withFreshTiming(raw: any, dob: string): any {
    const freshTiming = {
      personalYear:  this.engine.personalYear(dob),
      personalMonth: this.engine.personalMonth(dob),
      personalDay:   this.engine.personalDay(dob),
      lifeCycle:     this.engine.lifeCycle(dob),
      // Pinnacles and challenges are static — keep from stored record
      pinnacle1: raw.timing_numbers?.pinnacle1,
      pinnacle2: raw.timing_numbers?.pinnacle2,
      pinnacle3: raw.timing_numbers?.pinnacle3,
      pinnacle4: raw.timing_numbers?.pinnacle4,
      challenge1: raw.timing_numbers?.challenge1,
      challenge2: raw.timing_numbers?.challenge2,
    };

    // Also refresh Personal Year/Month meaning text if the numbers changed
    const storedPY = raw.timing_numbers?.personalYear;
    const storedPM = raw.timing_numbers?.personalMonth;
    let insights = raw.insights;
    if (storedPY !== freshTiming.personalYear || storedPM !== freshTiming.personalMonth) {
      const py = freshTiming.personalYear;
      const pm = freshTiming.personalMonth;
      const PERSONAL_YEAR_FULL: Record<number, string> = {
        1:'A Personal Year 1 is a year to begin — to plant seeds that carry unusual weight. Whatever is started this year has longevity. The energy supports bold moves and fresh starts.',
        2:'A Personal Year 2 is a year for patience and deepening what already exists. Relationships are highlighted: what you give and receive will both become very clear.',
        3:'A Personal Year 3 is a year for creativity, communication, and social expansion. Life brightens. Conversations you\'ve been avoiding can finally happen with ease.',
        4:'A Personal Year 4 is a year of work, discipline, and building. Nothing glamorous — but what is built here is permanent.',
        5:'A Personal Year 5 is a year of change and the unexpected. Life refuses to stay still. Stay fluid — the 5 year rewards those who trust disruption as preparation.',
        6:'A Personal Year 6 is a year where love and responsibility take centre stage. Relationships demand and reward your attention.',
        7:'A Personal Year 7 is a year for going inward. Something is ripening in you that requires quiet.',
        8:'A Personal Year 8 is a year for results. What you have built is ready to come to fruition. Don\'t shrink from your own power.',
        9:'A Personal Year 9 is a year of completion, release, and preparing for an entirely new cycle. Do not try to hold on.',
      };
      const MONTH_THEMES: Record<number, string> = {
        1:'initiation — the month to start, decide, and act rather than wait',
        2:'patience — a month to listen, cooperate, and receive rather than push',
        3:'expression — creativity, social connection, and communication come alive',
        4:'organisation — the month to build systems, clear backlogs, and do steady work',
        5:'change — expect the unexpected; stay fluid rather than force continuity',
        6:'responsibility — relationships, home, and care take centre stage',
        7:'reflection — go inward; the quality of your thinking matters more than your output',
        8:'results — the month where effort converts; push for what you have been building toward',
        9:'completion — finish what is unfinished; release what has run its course',
      };
      insights = {
        ...insights,
        personalYearMeaning: PERSONAL_YEAR_FULL[py] || PERSONAL_YEAR_FULL[1],
        personalMonthMeaning: `Personal Month ${pm} — ${MONTH_THEMES[pm] || 'a focused energetic period'}. Within your Personal Year ${py}, this month narrows the theme into a specific quality of attention and action.`,
      };
    }

    return { ...raw, timing_numbers: freshTiming, insights };
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

  async getForUser(userId: string, dob?: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('numerology_profiles')
      .select('*')
      .eq('user_id', userId)
      .is('member_id', null)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    // Always refresh timing numbers from today's date if DOB is available
    const refreshed = dob ? this.withFreshTiming(data, dob) : data;
    // Detect self profile by absence of member_id and presence of self-specific insight keys
    const isSelfProfile = !data.member_id && data.insights?.emotionalCore !== undefined;
    return isSelfProfile ? this.formatSelfProfile(refreshed) : this.formatProfile(refreshed);
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
