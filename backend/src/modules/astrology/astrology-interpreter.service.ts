import { Injectable } from '@nestjs/common';
import { GeminiService } from '../ai/gemini.service';
import { AstrologyComputed } from './astrology-engine.service';

export const NAKSHATRA_EMOTIONAL_SIGNATURE: Record<string, string> = {
  'Ashwini':'Quick to act and quick to recover. Emotions are processed through movement, not stillness.',
  'Bharani':'Holds deep feelings with intensity. Transformation is their emotional language.',
  'Krittika':'Sharp emotional world. Can cut through fog — or cut people. Processes through clarity.',
  'Rohini':'Emotions are rich, sensuous, and slow-moving. They feel through attachment and beauty.',
  'Mrigashira':'Restless emotional nature. Processes through questions, conversation, and seeking.',
  'Ardra':'Storm before calm. Emotions arrive with force and transform everything they touch.',
  'Punarvasu':'Resilient. Can find peace again after disturbance. Optimism is their default return state.',
  'Pushya':'Nurturing emotional core. Processes through caretaking and being needed.',
  'Ashlesha':'Deep, coiled emotional intelligence. Can sense what others hide. Processes through insight.',
  'Magha':'Pride and honour as emotional core. Processes through recognition and lineage.',
  'Purva Phalguni':'Joy and pleasure as emotional default. Processes through beauty and rest.',
  'Uttara Phalguni':'Steady, service-oriented emotional nature. Processes through reliability.',
  'Hasta':'Quick-handed emotional processor. Practical care is how they love.',
  'Chitra':'Aesthetic emotional world. Processes through beauty, craft, and refinement.',
  'Swati':'Adaptable emotional nature. Processes through flexibility and social connection.',
  'Vishakha':'Focused intensity. Emotions are channelled toward goals and achievement.',
  'Anuradha':'Devotion as emotional core. Processes through loyalty and deep friendship.',
  'Jyeshtha':'Elder-energy emotional nature. Processes through protecting and being respected.',
  'Mula':'Goes to the root of things. Processes through letting go and investigating truth.',
  'Purva Ashadha':'Philosophical emotional nature. Processes through wider meaning.',
  'Uttara Ashadha':'Patient, victorious emotional core. Processes through service and universal purpose.',
  'Shravana':'Deep listener. Processes through hearing and learning.',
  'Dhanishtha':'Abundant, ambitious emotional nature. Processes through achievement and music.',
  'Shatabhisha':'Healer\'s emotional nature. Processes through solitude and hidden knowledge.',
  'Purva Bhadrapada':'Intensity and fire. Processes through transformation and spiritual aspiration.',
  'Uttara Bhadrapada':'Still depths. Processes through compassion and wisdom.',
  'Revati':'Gentle, complete emotional nature. Processes through completion and nurturing.',
};

export const MOON_SIGN_EMOTIONAL: Record<string, string> = {
  'Mesha':'Their emotional world moves quickly. They feel, react, and then move on. Lingering is uncomfortable.',
  'Vrishabha':'Their emotional world is slow-moving and sensory. They need stability and beauty to feel safe.',
  'Mithuna':'Their emotional world moves through conversation and thought. Talking is processing for them.',
  'Karkata':'Their emotional world is tidal — deeply feeling, nurturing, and attached to home and past.',
  'Simha':'Their emotional world is expressive and proud. They need recognition to feel genuinely loved.',
  'Kanya':'Their emotional world runs through analysis. They process feelings by understanding them.',
  'Tula':'Their emotional world seeks balance and harmony. Conflict is genuinely painful for them.',
  'Vrischika':'Their emotional world runs deep, still, and intense. They feel everything but reveal little.',
  'Dhanu':'Their emotional world is expansive and philosophical. They need freedom and meaning to feel well.',
  'Makara':'Their emotional world is disciplined and contained. They process through structure and work.',
  'Kumbha':'Their emotional world is detached and universal. They can observe their own feelings from a distance.',
  'Meena':'Their emotional world is oceanic — permeable, empathic, and easily dissolved into the other.',
};

export interface AstrologyInsights {
  emotionalNature: string;
  emotionalGift: string;
  whatTriggersWithdrawal: string;
  whatMakesThemFeelSafe: string;
  emotionalAvailability: string;
  emotionalAvailabilityDetail: string;
  whenThingsGoWrong: string;
  relationshipGuidance: {
    whatThisRelationshipAsksOfYou: string;
    whatLandsWell: string;
    whereFrictionLives: string;
    howToMeetThemWell: string;
    bestMomentToApproach: string;
    avoidWhen: string;
  };
  planetarySignatures: string;
  dashaInfluence: string;
}

@Injectable()
export class AstrologyInterpreterService {
  constructor(private readonly gemini: GeminiService) {}

  async buildInsights(
    computed: AstrologyComputed,
    memberName: string,
    memberRelation: string,
    userName: string,
  ): Promise<AstrologyInsights> {
    const s = this.buildSignalContext(computed);

    const [
      emotionalNature, emotionalGift, whatTriggersWithdrawal,
      whatMakesThemFeelSafe, emotionalAvailabilityData,
      whenThingsGoWrong, relationshipGuidance,
      planetarySignatures, dashaInfluence,
    ] = await Promise.all([
      this.gemini.generate(this.promptEmotionalNature(s, memberName), 200),
      this.gemini.generate(this.promptEmotionalGift(s, memberName), 150),
      this.gemini.generate(this.promptWhatTriggersWithdrawal(s, memberName), 180),
      this.gemini.generate(this.promptWhatMakesThemFeelSafe(s, memberName), 180),
      this.genEmotionalAvailability(s, memberName),
      this.gemini.generate(this.promptWhenThingsGoWrong(s, memberName), 180),
      this.genRelationshipGuidance(s, memberName, memberRelation, userName),
      this.gemini.generate(this.promptPlanetarySignatures(computed, memberName), 200),
      this.gemini.generate(this.promptDashaInfluence(computed, memberName), 180),
    ]);

    return {
      emotionalNature,
      emotionalGift,
      whatTriggersWithdrawal,
      whatMakesThemFeelSafe,
      emotionalAvailability: emotionalAvailabilityData.label,
      emotionalAvailabilityDetail: emotionalAvailabilityData.detail,
      whenThingsGoWrong,
      relationshipGuidance,
      planetarySignatures,
      dashaInfluence,
    };
  }

  private buildSignalContext(computed: AstrologyComputed) {
    const moonSign = computed.moonSign.split(' ')[0];
    const lagna = computed.ascendant.split(' ')[0];
    const sunSign = computed.sunSign.split(' ')[0];
    const moon = computed.planets.find(p => p.name === 'Moon');
    const mars = computed.planets.find(p => p.name === 'Mars');
    const venus = computed.planets.find(p => p.name === 'Venus');
    const mercury = computed.planets.find(p => p.name === 'Mercury');
    const jupiter = computed.planets.find(p => p.name === 'Jupiter');
    const saturn = computed.planets.find(p => p.name === 'Saturn');

    return {
      moonSign, lagna, sunSign,
      nakshatra: computed.nakshatra,
      nakshatraLord: computed.nakshatraLord,
      nakshatraPada: computed.nakshatraPada,
      nakshatraSignature: NAKSHATRA_EMOTIONAL_SIGNATURE[computed.nakshatra] || '',
      moonEmotional: MOON_SIGN_EMOTIONAL[moonSign] || '',
      moonHouse: moon?.house || 0,
      moonDignity: moon?.dignity || 'neutral',
      marsHouse: mars?.house || 0,
      venusHouse: venus?.house || 0,
      venusSign: venus?.sign || '',
      mercuryHouse: mercury?.house || 0,
      jupiterHouse: jupiter?.house || 0,
      saturnHouse: saturn?.house || 0,
      currentDasha: computed.dasha.currentMahadasha.planet,
      currentAntardasha: computed.dasha.currentAntardasha.planet,
      dashaEnd: computed.dasha.currentMahadasha.endDate,
      yogas: computed.yogas.filter(y => y.isPresent).map(y => y.name).join(', '),
    };
  }

  private promptEmotionalNature(s: ReturnType<typeof this.buildSignalContext>, name: string) {
    return `You are Lumen, a Vedic astrology and psychology specialist.
Write the "Emotional Nature" section for ${name}.
Length: 3-4 sentences. Style: warm, specific, layman-readable. No jargon. No bullet points.
First sentence: how their emotional world moves. Second: how they process feelings. Third: what this means in relationships.

Moon sign: ${s.moonSign} (${s.moonEmotional})
Nakshatra: ${s.nakshatra} — ${s.nakshatraSignature}
Moon dignity: ${s.moonDignity}, Moon house: ${s.moonHouse}
Current Mahadasha: ${s.currentDasha}`;
  }

  private promptEmotionalGift(s: ReturnType<typeof this.buildSignalContext>, name: string) {
    return `You are Lumen.
Write the "Emotional Gift" section for ${name}.
Length: 2-3 sentences. What is their emotional superpower in relationships? Be specific.

Moon sign: ${s.moonSign}, Nakshatra: ${s.nakshatra}
Moon house: ${s.moonHouse}, Yogas present: ${s.yogas || 'none noted'}`;
  }

  private promptWhatTriggersWithdrawal(s: ReturnType<typeof this.buildSignalContext>, name: string) {
    return `You are Lumen.
Write "What Triggers Withdrawal" for ${name}. Length: 3 sentences.
First: specific trigger pattern. Second: what withdrawal looks like. Third: reframe for the reader.

Moon sign: ${s.moonSign}, Nakshatra: ${s.nakshatra}
Mars house: ${s.marsHouse}, Saturn house: ${s.saturnHouse}`;
  }

  private promptWhatMakesThemFeelSafe(s: ReturnType<typeof this.buildSignalContext>, name: string) {
    return `You are Lumen.
Write "What Makes Them Feel Safe" for ${name}. Length: 3-4 sentences. Be concrete and actionable.

Moon sign: ${s.moonSign}, Nakshatra: ${s.nakshatra}
Moon house: ${s.moonHouse}, Lagna: ${s.lagna}
Venus house: ${s.venusHouse}, Jupiter house: ${s.jupiterHouse}`;
  }

  private promptWhenThingsGoWrong(s: ReturnType<typeof this.buildSignalContext>, name: string) {
    return `You are Lumen.
Write "When Things Go Wrong" for ${name}. Length: 3 sentences.
First: specific defence mechanism. Second: what it looks like from outside. Third: the reframe.

Moon sign: ${s.moonSign}, Nakshatra: ${s.nakshatra}
Mars house: ${s.marsHouse}, Lagna: ${s.lagna}`;
  }

  private async genEmotionalAvailability(s: ReturnType<typeof this.buildSignalContext>, name: string): Promise<{ label: string; detail: string }> {
    const prompt = `You are Lumen.
Based on current Vedic dasha, assess ${name}'s emotional availability RIGHT NOW.
Return ONLY JSON: { "label": "...", "detail": "..." }
Label must be one of: "Reaching outward", "Pulling inward", "In transition", "Deeply receptive", "Contracted and rebuilding", "Expansive and open"
Detail: 2 sentences — current phase and what it means for approaching them.

Current Mahadasha: ${s.currentDasha}, Antardasha: ${s.currentAntardasha}
Mahadasha ends: ${s.dashaEnd}, Moon sign: ${s.moonSign}, Nakshatra: ${s.nakshatra}`;

    try {
      const raw = await this.gemini.generateJSON(prompt);
      return raw as { label: string; detail: string };
    } catch {
      return {
        label: s.currentDasha === 'Saturn' ? 'Contracted and rebuilding' : s.currentDasha === 'Jupiter' ? 'Expansive and open' : 'In transition',
        detail: `Currently in ${s.currentDasha} Mahadasha / ${s.currentAntardasha} Antardasha. Approach with patience and allow them space to process at their own pace.`,
      };
    }
  }

  private async genRelationshipGuidance(
    s: ReturnType<typeof this.buildSignalContext>,
    memberName: string, relation: string, userName: string,
  ): Promise<AstrologyInsights['relationshipGuidance']> {
    const prompt = `You are Lumen. Generate Relationship Guidance for ${userName}'s relationship with ${memberName} (${relation}).
Return ONLY JSON with keys: whatThisRelationshipAsksOfYou, whatLandsWell, whereFrictionLives, howToMeetThemWell, bestMomentToApproach, avoidWhen
Each value: 1-3 sentences. Warm, honest, specific.

${memberName} chart: Moon ${s.moonSign}, Nakshatra ${s.nakshatra} (${s.nakshatraSignature})
Emotional pattern: ${s.moonEmotional}
Mars house: ${s.marsHouse}, Venus house: ${s.venusHouse}, Dasha: ${s.currentDasha}/${s.currentAntardasha}`;

    try {
      const raw = await this.gemini.generateJSON(prompt);
      return raw as AstrologyInsights['relationshipGuidance'];
    } catch {
      return {
        whatThisRelationshipAsksOfYou: `This relationship asks ${userName} to understand ${memberName}'s emotional language, which runs differently from most.`,
        whatLandsWell: 'Direct, honest communication that doesn\'t require them to guess what you mean.',
        whereFrictionLives: 'The friction tends to live in timing — when you each need something the other is least available to give.',
        howToMeetThemWell: 'Meet them with curiosity rather than expectation.',
        bestMomentToApproach: 'Approach when they\'ve had space and rest — not when they\'ve just come from something demanding.',
        avoidWhen: 'Avoid important conversations when they\'re visibly contracted, tired, or in a processing phase.',
      };
    }
  }

  private promptPlanetarySignatures(computed: AstrologyComputed, name: string) {
    const strongPlanets = computed.planets
      .filter(p => p.dignity === 'exalted' || p.dignity === 'own')
      .map(p => `${p.name} (${p.dignity} in ${p.sign.split(' ')[0]}, house ${p.house})`);
    const retrograde = computed.planets.filter(p => p.isRetrograde).map(p => p.name);
    return `You are Lumen. Write a 3-sentence "Planetary Signatures" summary for ${name}.
Synthesise dominant planetary placements into human-readable insight about their character.

Strong planets: ${strongPlanets.join(', ') || 'none'}
Retrograde: ${retrograde.join(', ') || 'none'}
Moon: ${computed.moonSign} house ${computed.planets.find(p => p.name === 'Moon')?.house}
Yogas: ${computed.yogas.filter(y => y.isPresent).map(y => y.name).join(', ') || 'none'}
Lagna: ${computed.ascendant}`;
  }

  private promptDashaInfluence(computed: AstrologyComputed, name: string) {
    const themes: Record<string, string> = {
      Sun:'authority, self-expression, ego work',
      Moon:'emotional fluctuation, home, nurturing themes',
      Mars:'action, conflict, drive, ambition',
      Mercury:'communication, learning, mental agility',
      Jupiter:'expansion, wisdom, growth, abundance',
      Venus:'love, pleasure, creativity, relationships',
      Saturn:'discipline, restriction, karmic lessons',
      Rahu:'obsession, ambition, unconventional paths',
      Ketu:'detachment, spiritual seeking, isolation',
    };
    const { dasha } = computed;
    return `You are Lumen. Write a 3-sentence "Dasha Influence" section for ${name}.
Explain what the current Vimshottari Dasha means for how they show up in life and relationships.
Be specific. No jargon. Write for someone who doesn't know astrology.

Current Mahadasha: ${dasha.currentMahadasha.planet} (${themes[dasha.currentMahadasha.planet] || ''})
Current Antardasha: ${dasha.currentAntardasha.planet} (${themes[dasha.currentAntardasha.planet] || ''})
Period: ${dasha.currentMahadasha.startDate} to ${dasha.currentMahadasha.endDate}
Next Mahadasha: ${dasha.nextMahadasha.planet} starting ${dasha.nextMahadasha.startDate}`;
  }
}
