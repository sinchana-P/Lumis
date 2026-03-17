import { Injectable } from '@nestjs/common';
import { NumerologyEngineService, LIFE_PATH_LABELS, SOUL_URGE_LABELS, PERSONAL_YEAR_THEMES, DASHA_PLANET_THEMES } from '../numerology/numerology-engine.service';
import { MOON_SIGN_EMOTIONAL } from '../astrology/astrology-interpreter.service';
import { VectorMemoryService } from './vector-memory.service';
import { AnalysisDepth, AstroNumerologySignals, LumenMember, LumenUserProfile } from './lumen-types';

@Injectable()
export class ContextBuilderService {
  constructor(
    private readonly engine: NumerologyEngineService,
    private readonly vectorMemory: VectorMemoryService,
  ) {}

  // ── SIGNAL PROCESSING ───────────────────────────────────────
  buildSignals(member: LumenMember): AstroNumerologySignals {
    const yr = new Date().getFullYear();
    const mo = new Date().getMonth() + 1;
    const fullName = member.fullName || member.name;

    const lp = this.engine.lifePath(member.dob);
    const su = this.engine.soulUrge(fullName);
    const pyNum = this.engine.personalYear(member.dob, yr);
    const pmNum = this.engine.personalMonth(member.dob, yr, mo);
    const lc = this.engine.lifeCycle(member.dob);

    const moonSign = member.astrologyData?.computed.moonSign || 'Unknown';
    const nakshatra = member.astrologyData?.computed.nakshatra || 'Unknown';
    const nakshatraLord = member.astrologyData?.computed.nakshatraLord || 'Unknown';
    const currentDasha = member.astrologyData?.computed.dasha.currentMahadasha.planet || 'Unknown';
    const lagna = member.astrologyData?.computed.ascendant || 'Unknown';
    const marsHouse = member.astrologyData?.computed.planets.find(p => p.name === 'Mars')?.house || 0;

    const emotionalStyle = this.deriveEmotionalStyle(moonSign);
    const conflictMode = this.deriveConflictMode(moonSign, marsHouse);
    const dashaTheme = DASHA_PLANET_THEMES[currentDasha] || 'general life themes';
    const currentCycleTheme = `${PERSONAL_YEAR_THEMES[pyNum] || 'personal growth'} — ${dashaTheme}`;
    const availabilitySignal = ['Jupiter','Venus','Moon'].includes(currentDasha) ? 'open' :
      ['Saturn','Rahu','Ketu'].includes(currentDasha) ? 'contracted' : 'transitional';

    return {
      lifePathNumber: lp,
      lifePathLabel: LIFE_PATH_LABELS[lp] || '',
      soulUrgeNumber: su,
      soulUrgeLabel: SOUL_URGE_LABELS[su] || '',
      personalYearNumber: pyNum,
      personalYearTheme: PERSONAL_YEAR_THEMES[pyNum] || '',
      personalMonthNumber: pmNum,
      lifeCycle: lc,
      moonSign, nakshatra, nakshatraLord, currentDasha, lagna,
      emotionalStyle, conflictMode, currentCycleTheme, availabilitySignal,
      coreWound: this.deriveCoreWound(lp),
      coreGift: this.deriveCoreGift(lp),
    };
  }

  // ── DATA ACCESS SUMMARY ──────────────────────────────────────
  buildDataAccessSummary(depth: AnalysisDepth): string {
    switch (depth) {
      case 'BEHAVIORAL':
        return 'Data in context: logged traits, incidents, interactions, journal entries. NOT available: numerology, astrology, birth chart data.';
      case 'COSMIC':
        return 'Data in context: numerology numbers, Vedic astrology chart. NOT available: logged behavioral observations, incidents, interaction history.';
      case 'FULL_SPECTRUM':
      default:
        return 'Data in context: full behavioral logs AND complete numerology + astrology.';
    }
  }

  // ── DEPTH FILTERING ──────────────────────────────────────────
  private applyDepthFilterToMember(member: LumenMember, depth: AnalysisDepth): LumenMember {
    const filtered = { ...member };
    if (depth === 'BEHAVIORAL') {
      filtered.numerologyData = undefined;
      filtered.astrologyData = undefined;
    } else if (depth === 'COSMIC') {
      filtered.traits = undefined;
      filtered.incidents = undefined;
      filtered.interactions = undefined;
      filtered.journalEntries = undefined;
    }
    return filtered;
  }

  private applyDepthFilterToUser(user: LumenUserProfile, depth: AnalysisDepth): LumenUserProfile {
    const filtered = { ...user };
    if (depth === 'BEHAVIORAL') {
      filtered.numerologyData = undefined;
      filtered.astrologyData = undefined;
    } else if (depth === 'COSMIC') {
      filtered.traits = undefined;
    }
    return filtered;
  }

  // ── FULL CONTEXT (for ANALYSIS/ADVICE/TIMING modes) ─────────
  async buildFullContext(
    user: LumenUserProfile,
    members: LumenMember[],
    selectedMemberIds: string[],
    query: string,
    depth: AnalysisDepth = 'FULL_SPECTRUM',
  ): Promise<string> {
    const filteredUser = this.applyDepthFilterToUser(user, depth);
    const userAsMember = { ...filteredUser, relation: 'self' } as unknown as LumenMember;
    const userSignals = filteredUser.dob ? this.buildSignals({ ...userAsMember, dob: filteredUser.dob }) : null;
    let ctx = this.buildUserContextText(filteredUser, userSignals, depth);

    const selected = members.filter(m => selectedMemberIds.includes(m.id));
    if (selected.length) {
      ctx += '\n══ MEMBERS IN CONTEXT ══\n';
      for (const member of selected) {
        const filteredMember = this.applyDepthFilterToMember(member, depth);
        const signals = this.buildSignals(filteredMember);
        ctx += this.buildMemberContextText(filteredMember, signals, depth);
        try {
          const memories = await this.vectorMemory.buildContextString(member.id, query);
          if (memories && !memories.includes('No specific')) {
            ctx += `\nRelevant memories for query:\n${memories}\n`;
          }
        } catch {
          // Memory retrieval failure is non-fatal
        }
      }
    }

    return ctx;
  }

  // ── QUICK CONTEXT (for VENT mode) ────────────────────────────
  async buildQuickContext(
    user: { id: string; name: string; dob: string },
    members: LumenMember[],
    selectedMemberIds: string[],
    depth: AnalysisDepth = 'FULL_SPECTRUM',
  ): Promise<string> {
    const selected = members.filter(m => selectedMemberIds.includes(m.id));
    if (!selected.length) return `User: ${user.name}`;

    return selected.map(m => {
      const filteredMember = this.applyDepthFilterToMember(m, depth);
      const signals = this.buildSignals(filteredMember);
      const lastInteraction = filteredMember.interactions?.[0];

      const parts: string[] = [];
      if (depth === 'BEHAVIORAL') {
        parts.push(`${filteredMember.name} (${filteredMember.relation})`);
        parts.push(`Emotional style: observed from behavioral data`);
      } else {
        parts.push(`${filteredMember.name} (${filteredMember.relation}): LP ${signals.lifePathNumber}, Moon ${signals.moonSign}, Dasha ${signals.currentDasha}`);
        parts.push(`Emotional style: ${signals.emotionalStyle}`);
      }
      if (lastInteraction) {
        parts.push(`Last felt: ${lastInteraction.feeling}${lastInteraction.note ? ` — ${lastInteraction.note}` : ''}`);
      }
      return parts.filter(Boolean).join('. ');
    }).join('\n');
  }

  // ── TEXT BUILDERS ────────────────────────────────────────────
  private buildMemberContextText(member: LumenMember, signals: AstroNumerologySignals, depth: AnalysisDepth = 'FULL_SPECTRUM'): string {
    let ctx = `\n══ ${member.name} (${member.relation}) ══\n`;

    // Cosmic data — only included when depth is not BEHAVIORAL
    if (depth !== 'BEHAVIORAL') {
      ctx += `Numerology:\n`;
      ctx += `  Life Path ${signals.lifePathNumber} — ${signals.lifePathLabel}\n`;
      ctx += `  Soul Urge ${signals.soulUrgeNumber} — ${signals.soulUrgeLabel}\n`;
      ctx += `  Personal Year ${signals.personalYearNumber} (${signals.personalYearTheme})\n`;
      ctx += `  Personal Month ${signals.personalMonthNumber}\n`;
      ctx += `  Life Cycle: ${signals.lifeCycle === 1 ? 'First (Forming)' : signals.lifeCycle === 2 ? 'Second (Building)' : 'Third (Distilling)'}\n`;
      ctx += `Vedic Astrology:\n`;
      ctx += `  Moon: ${signals.moonSign} — Nakshatra: ${signals.nakshatra} (lord: ${signals.nakshatraLord})\n`;
      ctx += `  Lagna: ${signals.lagna}\n`;
      ctx += `  Current Dasha: ${signals.currentDasha}\n`;
      ctx += `Derived Signals:\n`;
      ctx += `  Emotional style: ${signals.emotionalStyle}\n`;
      ctx += `  Conflict mode: ${signals.conflictMode}\n`;
      ctx += `  Current cycle theme: ${signals.currentCycleTheme}\n`;
      ctx += `  Availability: ${signals.availabilitySignal}\n`;
      ctx += `  Core wound: ${signals.coreWound}\n`;
      ctx += `  Core gift: ${signals.coreGift}\n`;
    }

    // Behavioral data — only included when depth is not COSMIC
    if (depth !== 'COSMIC') {
      if (member.traits?.length) {
        const pros = member.traits.filter(t => t.category === 'pro').map(t => t.description);
        const cons = member.traits.filter(t => t.category === 'con').map(t => t.description);
        const needs = member.traits.filter(t => t.category === 'need').map(t => t.description);
        const triggers = member.traits.filter(t => t.category === 'trigger').map(t => t.description);
        if (pros.length) ctx += `Strengths: ${pros.join(', ')}\n`;
        if (cons.length) ctx += `Shadows: ${cons.join(', ')}\n`;
        if (needs.length) ctx += `Core Needs: ${needs.join(', ')}\n`;
        if (triggers.length) ctx += `Triggers: ${triggers.join(', ')}\n`;
      }

      if (member.interactions?.length) {
        const recent = member.interactions.slice(0, 5);
        const drain = recent.filter(i => i.feeling === 'drained').length;
        const connect = recent.filter(i => ['connected','safe','energised'].includes(i.feeling)).length;
        ctx += `Recent interactions (last ${recent.length}): ${connect} energising, ${drain} draining\n`;
        if (recent[0]?.note) ctx += `Last interaction note: "${recent[0].note}"\n`;
      }

      if (member.journalEntries?.length) {
        ctx += `Latest journal: "${member.journalEntries[0].text.substring(0, 200)}..."\n`;
      }
    }

    return ctx;
  }

  private buildUserContextText(user: LumenUserProfile, signals: AstroNumerologySignals | null, depth: AnalysisDepth = 'FULL_SPECTRUM'): string {
    let ctx = `\n══ USER: ${user.name} ══\n`;

    // Cosmic data — only included when depth is not BEHAVIORAL
    if (depth !== 'BEHAVIORAL' && signals) {
      ctx += `Life Path ${signals.lifePathNumber} (${signals.lifePathLabel})\n`;
      ctx += `Soul Urge ${signals.soulUrgeNumber} — ${signals.soulUrgeLabel}\n`;
      ctx += `Personal Year ${signals.personalYearNumber} (${signals.personalYearTheme})\n`;
      ctx += `Moon: ${signals.moonSign}, Nakshatra: ${signals.nakshatra}\n`;
      ctx += `Emotional style: ${signals.emotionalStyle}\n`;
      ctx += `Core wound: ${signals.coreWound}\n`;
      ctx += `Core gift: ${signals.coreGift}\n`;
    }

    // Behavioral data — only included when depth is not COSMIC
    if (depth !== 'COSMIC' && user.traits?.length) {
      const needs = user.traits.filter(t => t.category === 'need').map(t => t.description);
      const triggers = user.traits.filter(t => t.category === 'trigger').map(t => t.description);
      if (needs.length) ctx += `Needs: ${needs.join(', ')}\n`;
      if (triggers.length) ctx += `Triggers: ${triggers.join(', ')}\n`;
    }

    return ctx;
  }

  // ── SIGNAL DERIVATIONS ───────────────────────────────────────
  private deriveEmotionalStyle(moonSign: string): string {
    const moon = moonSign.split(' ')[0];
    const fast = ['Mesha','Mithuna','Simha','Dhanu','Kumbha'];
    const slow = ['Vrishabha','Karkata','Kanya','Makara','Meena'];
    if (fast.includes(moon)) return 'fast processor — feels, reacts, moves on';
    if (slow.includes(moon)) return 'slow integrator — needs time before they can open';
    return 'moderate processor — context-dependent';
  }

  private deriveConflictMode(moonSign: string, marsHouse: number): string {
    const moon = moonSign.split(' ')[0];
    const withdrawers = ['Karkata','Vrischika','Meena','Vrishabha','Makara'];
    const confronters = ['Mesha','Simha','Vrischika'];
    if (withdrawers.includes(moon) || marsHouse === 12) return 'withdraws inward under pressure';
    if (confronters.includes(moon) || marsHouse === 1) return 'confronts directly, processes out loud';
    if (['Mithuna','Kanya'].includes(moon)) return 'over-explains and intellectualises under stress';
    return 'complex conflict response — context-dependent';
  }

  private deriveCoreWound(lp: number): string {
    const wounds: Record<number, string> = {
      1:'invisibility as a leader, being made to follow',
      2:'not being received, invisible despite constant giving',
      3:'creative self suppressed, never celebrated authentically',
      4:'instability, groundlessness, unreliability from others',
      5:'containment, loss of freedom, being trapped',
      6:'being unloved when no longer useful',
      7:'being misunderstood, having depth dismissed',
      8:'powerlessness, failure, not achieving what they came for',
      9:'being loved only for what they give',
      11:'overwhelm from sensitivity, not being understood',
      22:'potential wasted, never building what they envisioned',
    };
    return wounds[lp] || 'deep fear of being unseen for who they truly are';
  }

  private deriveCoreGift(lp: number): string {
    const gifts: Record<number, string> = {
      1:'the courage to begin things others won\'t',
      2:'the ability to make people feel completely seen',
      3:'infectious creative energy and joy',
      4:'reliability — the rarest form of love',
      5:'aliveness, the ability to make anything feel possible',
      6:'unconditional nurturing presence',
      7:'perception that cuts beneath every surface',
      8:'the authority to lead transformation at scale',
      9:'love large enough to hold both grief and joy',
      11:'illumination — lighting something up in others just by being near',
      22:'the capacity to build what the world needs',
    };
    return gifts[lp] || 'a rare quality of presence that changes the room';
  }
}
