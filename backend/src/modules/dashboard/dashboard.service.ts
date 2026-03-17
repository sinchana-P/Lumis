import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';

@Injectable()
export class DashboardService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getSummary(userId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Parallel fetch all data
    const [
      interactionsRes,
      incidentsRes,
      journalRes,
      patternsRes,
      membersRes,
      numerologyRes,
    ] = await Promise.all([
      supabase.from('interactions').select('id, quality, date, member_id').eq('user_id', userId).is('deleted_at', null).gte('date', since7d),
      supabase.from('incidents').select('id, date, title, severity, member_id').eq('user_id', userId).is('deleted_at', null).gte('date', since7d),
      supabase.from('journal_entries').select('id, date, member_id').eq('user_id', userId).is('deleted_at', null).gte('date', since7d),
      supabase.from('patterns').select('id, title, frequency, member_id').eq('user_id', userId).is('deleted_at', null).order('updated_at', { ascending: false }).limit(5),
      supabase.from('members').select('id, full_name, relation_type, photo_url').eq('user_id', userId).is('deleted_at', null),
      supabase.from('numerology_profiles').select('timing_numbers').eq('user_id', userId).is('member_id', null).maybeSingle(),
    ]);

    const interactions = interactionsRes.data ?? [];
    const incidents = incidentsRes.data ?? [];
    const journal = journalRes.data ?? [];
    const patterns = patternsRes.data ?? [];
    const members = membersRes.data ?? [];
    const numerology = numerologyRes.data;

    // Build member lookup
    const memberMap: Record<string, string> = {};
    members.forEach((m: any) => { memberMap[m.id] = m.full_name?.split(' ')[0] || 'someone'; });

    // Emotional weather from interaction quality
    const weatherResult = this.deriveEmotionalWeather(interactions);

    // Activity stats
    const activity7d = {
      interactions: interactions.length,
      incidents: incidents.length,
      journalEntries: journal.length,
      patternsActive: patterns.length,
    };

    // Recent signals (last 5 notable events)
    const recentSignals: Array<{ type: string; memberName: string; title: string; date: string }> = [];

    incidents.slice(0, 3).forEach((inc: any) => {
      recentSignals.push({
        type: 'incident',
        memberName: memberMap[inc.member_id] ?? 'someone',
        title: inc.title ?? 'Incident logged',
        date: inc.date,
      });
    });

    patterns.slice(0, 3).forEach((pat: any) => {
      recentSignals.push({
        type: 'pattern',
        memberName: memberMap[pat.member_id] ?? 'someone',
        title: pat.title ?? 'Pattern detected',
        date: new Date().toISOString().split('T')[0],
      });
    });

    recentSignals.sort((a, b) => b.date.localeCompare(a.date));

    // Member stats
    const memberStats = {
      total: members.length,
      friends: members.filter((m: any) => m.relation_type === 'Friend').length,
      family: members.filter((m: any) => m.relation_type === 'Family').length,
    };

    // Numerology timing snapshot
    const numerologySnapshot = numerology
      ? {
          personalYear: numerology.timing_numbers?.personalYear,
          personalMonth: numerology.timing_numbers?.personalMonth,
        }
      : null;

    return {
      emotionalWeather: weatherResult,
      activity7d,
      recentSignals: recentSignals.slice(0, 5),
      memberStats,
      numerologySnapshot,
      generatedAt: new Date().toISOString(),
    };
  }

  private deriveEmotionalWeather(interactions: any[]): { summary: string; vibe: string } {
    if (!interactions.length) {
      return {
        vibe: 'Still',
        summary: 'Quiet in your orbit this week. A good time to reflect and log what you notice.',
      };
    }

    const qualityMap: Record<string, number> = {
      'excellent': 5, 'good': 4, 'okay': 3, 'neutral': 3,
      'difficult': 2, 'poor': 1, 'draining': 1,
    };

    const scores = interactions
      .map((i: any) => qualityMap[String(i.quality).toLowerCase()] ?? 3)
      .filter(Boolean);

    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 3;

    if (avg >= 4.2) return { vibe: 'Luminous', summary: 'Your connections are glowing this week — positive energy is circulating through your orbit.' };
    if (avg >= 3.5) return { vibe: 'Serene', summary: 'Mostly peaceful this week, with a warm undercurrent of connection and ease.' };
    if (avg >= 2.8) return { vibe: 'Steady', summary: 'A mixed week — some friction, some warmth. The kind of weather that builds resilience.' };
    if (avg >= 2.0) return { vibe: 'Turbulent', summary: 'Some turbulence moving through your orbit. A good week to slow down and check in.' };
    return { vibe: 'Heavy', summary: 'This week has asked a lot of you. Notice where you need rest, and where a conversation might help.' };
  }
}
