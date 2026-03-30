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

export interface AstrologySelfInsights {
  soulPurpose: string;
  innerWorld: string;
  emotionalGift: string;
  shadowAndGrowth: string;
  whatNourishesYou: string;
  whenYouStruggle: string;
  currentLifePhase: string;
  planetaryGifts: string;
  yogaBlessings: string;
  upcomingPhase: string;
}

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

  private async safeGenerate(prompt: string, maxTokens: number, fallback: string): Promise<string> {
    try {
      return await this.gemini.generate(prompt, maxTokens);
    } catch {
      return fallback;
    }
  }

  async buildInsights(
    computed: AstrologyComputed,
    memberName: string,
    memberRelation: string,
    userName: string,
    isSelf = false,
  ): Promise<AstrologyInsights> {
    const s = this.buildSignalContext(computed);
    const p = isSelf
      ? { subj: 'you', poss: 'your', obj: 'you', refl: 'yourself', they: 'you', their: 'your', them: 'you' }
      : { subj: 'they', poss: 'their', obj: 'them', refl: 'themselves', they: 'they', their: 'their', them: 'them' };

    // Batch into two sequential rounds to avoid rate limit (15 req/min)
    const [emotionalNature, emotionalGift, whatTriggersWithdrawal, whatMakesThemFeelSafe, emotionalAvailabilityData] =
      await Promise.all([
        this.safeGenerate(this.promptEmotionalNature(s, memberName, isSelf), 400,
          `${isSelf ? 'Your' : `${memberName}'s`} emotional world moves through ${p.poss} ${s.moonSign} Moon. ${isSelf ? 'You process' : 'They process'} feelings in ways that are deeply personal and shaped by ${p.poss} inner landscape. In relationships, this translates to a need for space and understanding.`),
        this.safeGenerate(this.promptEmotionalGift(s, memberName, isSelf), 300,
          `${isSelf ? 'Your' : `${memberName}'s`} greatest emotional gift is ${p.poss} capacity for depth and genuine presence in relationships. ${isSelf ? 'You bring' : 'They bring'} a quality of attention that makes others feel truly seen.`),
        this.safeGenerate(this.promptWhatTriggersWithdrawal(s, memberName, isSelf), 350,
          `${isSelf ? 'You tend to' : `${memberName} tends to`} withdraw when ${p.subj} feel unseen or pressured to respond before ${p.subj} ${isSelf ? 'have' : 'have'} had time to process. From the outside this can look like distance or coldness. It's worth knowing that this is self-protection, not rejection.`),
        this.safeGenerate(this.promptWhatMakesThemFeelSafe(s, memberName, isSelf), 350,
          `${isSelf ? 'You feel' : `${memberName} feels`} safest with consistency, honest communication, and space to be ${p.refl} without judgment. Predictable, low-pressure environments let ${p.obj} open up naturally.`),
        this.genEmotionalAvailability(s, memberName),
      ]);

    const [whenThingsGoWrong, relationshipGuidance, planetarySignatures, dashaInfluence] =
      await Promise.all([
        this.safeGenerate(this.promptWhenThingsGoWrong(s, memberName, isSelf), 350,
          `When things go wrong, ${isSelf ? 'you tend to' : `${memberName} tends to`} go quiet and inward. From outside this can look like distance, but it's ${p.poss} way of protecting emotional clarity. The most helpful response is to hold space without pressure.`),
        this.genRelationshipGuidance(s, memberName, memberRelation, userName, isSelf),
        this.safeGenerate(this.promptPlanetarySignatures(computed, memberName, isSelf), 350,
          `${isSelf ? 'Your' : `${memberName}'s`} chart shows a distinct pattern shaped by ${p.poss} Moon in ${s.moonSign} and current ${s.currentDasha} Mahadasha. These placements speak to ${p.poss} core nature and the particular quality ${p.subj} bring to all ${p.poss} relationships. The dominant energies in ${p.poss} chart point toward a life shaped by depth, discernment, and inner work.`),
        this.safeGenerate(this.promptDashaInfluence(computed, memberName, isSelf), 350,
          `${isSelf ? 'You are' : `${memberName} is`} currently in ${p.poss} ${s.currentDasha} Mahadasha / ${s.currentAntardasha} Antardasha — a period that shapes how ${p.subj} show up in life and relationships right now. This combination creates a particular flavour in how ${p.subj} engage, what ${p.subj} are drawn to, and where ${p.poss} energy naturally goes.`),
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

  async buildSelfInsights(
    computed: AstrologyComputed,
    firstName: string,
  ): Promise<AstrologySelfInsights> {
    const s = this.buildSignalContext(computed);

    const [soulPurpose, innerWorld, emotionalGift, shadowAndGrowth, whatNourishesYou] =
      await Promise.all([
        this.safeGenerate(this.promptSoulPurpose(s, computed, firstName), 400,
          `Your Sun in ${s.sunSign} and ${s.lagna} Ascendant create a particular signature — the way your inner fire meets the world. Your life is oriented toward self-expression through your ${s.sunSign} solar qualities, filtered through a ${s.lagna} lens that shapes how you actually engage with life.`),
        this.safeGenerate(this.promptInnerWorld(s, firstName), 400,
          `Your Moon in ${s.moonSign} (${s.nakshatra} nakshatra) describes the texture of your inner life. ${s.moonEmotional} You process the world emotionally through the specific frequency of your nakshatra, which shapes what you need to feel settled.`),
        this.safeGenerate(this.promptSelfEmotionalGift(s, firstName), 300,
          `Your greatest emotional gift is a depth of presence that most people only glimpse. Your ${s.moonSign} Moon gives you a specific quality of attunement that others feel but can rarely name.`),
        this.safeGenerate(this.promptSelfShadowAndGrowth(s, firstName), 400,
          `You tend to withdraw or contract when you feel unseen, pressured, or emotionally unsafe. This is a protection pattern, not a flaw. Understanding your own triggers is the beginning of transforming them.`),
        this.safeGenerate(this.promptSelfWhatNourishes(s, computed, firstName), 350,
          `You feel most yourself — most restored — when you have space, meaning, and beauty around you. Your ${s.moonSign} Moon needs specific conditions to feel genuinely safe, and honouring those is not luxury; it is maintenance.`),
      ]);

    const [whenYouStruggle, currentLifePhase, planetaryGifts, yogaBlessings, upcomingPhase] =
      await Promise.all([
        this.safeGenerate(this.promptSelfWhenYouStruggle(s, firstName), 350,
          `When things go wrong, you tend to turn inward and become very quiet. From inside it feels like clarity-seeking. From outside it can look like withdrawal. Your stress pattern is to protect your inner world first — understanding this about yourself changes how you move through hard moments.`),
        this.safeGenerate(this.promptSelfCurrentPhase(computed, firstName), 400,
          `You are currently in your ${s.currentDasha} Mahadasha — a chapter of life that is shaping your priorities, energy, and the kinds of experiences finding you right now. This is not permanent; it is a season with its own gifts and demands.`),
        this.safeGenerate(this.promptSelfPlanetaryGifts(computed, firstName), 350,
          `Your chart carries specific planetary strengths that shape your natural abilities. These are the places where life tends to flow more easily — not because you don't work for it, but because you're moving with your own grain.`),
        this.safeGenerate(this.promptSelfYogas(computed, firstName), 300,
          computed.yogas.filter(y => y.isPresent).length > 0
            ? `Your chart carries ${computed.yogas.filter(y => y.isPresent).map(y => y.name).join(', ')} — auspicious patterns that support particular kinds of growth and expression in your life.`
            : `Your chart carries its own particular strengths even without classical yogas — found in the individual placement of your planets and their relationships to each other.`),
        this.safeGenerate(this.promptSelfUpcomingPhase(computed, firstName), 300,
          `Your next major life chapter — the ${computed.dasha.nextMahadasha.planet} Mahadasha — begins ${computed.dasha.nextMahadasha.startDate}. Knowing it is coming allows you to begin preparing at the soul level.`),
      ]);

    return {
      soulPurpose, innerWorld, emotionalGift, shadowAndGrowth,
      whatNourishesYou, whenYouStruggle, currentLifePhase,
      planetaryGifts, yogaBlessings, upcomingPhase,
    };
  }

  private promptSoulPurpose(s: ReturnType<typeof this.buildSignalContext>, computed: AstrologyComputed, name: string) {
    const themes: Record<string, string> = {
      Sun: 'authority, self-expression, ego work', Moon: 'emotional intelligence, nurturing',
      Mars: 'action, courage, drive', Mercury: 'communication, learning, intellect',
      Jupiter: 'expansion, wisdom, generosity', Venus: 'love, beauty, harmony',
      Saturn: 'discipline, structure, mastery', Rahu: 'unconventional paths, obsession, growth',
      Ketu: 'detachment, wisdom, spirituality',
    };
    return `You are Lumen. Write "Soul Purpose" for ${name} in second person (you/your). 3-4 COMPLETE sentences.
First: what their Sun sign says about their core identity and life mission. Second: how the Ascendant shapes HOW they pursue it. Third-fourth: the synthesis — what they are here to embody.

Sun sign: ${s.sunSign} (house ${computed.planets.find(p => p.name === 'Sun')?.house})
Ascendant (Lagna): ${s.lagna}
Current Mahadasha: ${s.currentDasha} (${themes[s.currentDasha] || ''})
Yogas present: ${s.yogas || 'none'}`;
  }

  private promptInnerWorld(s: ReturnType<typeof this.buildSignalContext>, name: string) {
    return `You are Lumen. Write "Inner World" for ${name} in second person (you/your). 3-4 COMPLETE sentences.
Describe the texture of their emotional life — how they feel, how they process, what they need to feel centred.
Be specific. No jargon. Write for someone who doesn't know Vedic astrology.

Moon sign: ${s.moonSign} (${s.moonEmotional})
Nakshatra: ${s.nakshatra} — ${s.nakshatraSignature}
Moon house: ${s.moonHouse}, dignity: ${s.moonDignity}`;
  }

  private promptSelfEmotionalGift(s: ReturnType<typeof this.buildSignalContext>, name: string) {
    return `You are Lumen. Write "Emotional Gift" for ${name} in second person (you/your). 2-3 COMPLETE sentences.
What is their emotional superpower? What do they naturally offer that others find rare?

Moon: ${s.moonSign}, Nakshatra: ${s.nakshatra}, Moon house: ${s.moonHouse}
Yogas: ${s.yogas || 'none'}`;
  }

  private promptSelfShadowAndGrowth(s: ReturnType<typeof this.buildSignalContext>, name: string) {
    return `You are Lumen. Write "Shadow & Growth" for ${name} in second person (you/your). 3-4 COMPLETE sentences.
What triggers their emotional withdrawal? What does their stress pattern look like? What is the growth invitation within it?

Moon: ${s.moonSign}, Nakshatra: ${s.nakshatra}
Mars house: ${s.marsHouse}, Saturn house: ${s.saturnHouse}`;
  }

  private promptSelfWhatNourishes(s: ReturnType<typeof this.buildSignalContext>, computed: AstrologyComputed, name: string) {
    return `You are Lumen. Write "What Nourishes You" for ${name} in second person (you/your). 3-4 COMPLETE sentences.
What specific conditions restore them? What environments, rhythms, or experiences make them feel genuinely well?

Moon: ${s.moonSign}, Nakshatra: ${s.nakshatra}, Moon house: ${s.moonHouse}
Lagna: ${s.lagna}, Venus house: ${s.venusHouse}, Jupiter house: ${s.jupiterHouse}`;
  }

  private promptSelfWhenYouStruggle(s: ReturnType<typeof this.buildSignalContext>, name: string) {
    return `You are Lumen. Write "When You Struggle" for ${name} in second person (you/your). 3 COMPLETE sentences.
Sentence 1: specific stress/defence pattern. Sentence 2: what it looks like from outside/inside. Sentence 3: the reframe — what this pattern is protecting.

Moon: ${s.moonSign}, Nakshatra: ${s.nakshatra}
Mars house: ${s.marsHouse}, Lagna: ${s.lagna}`;
  }

  private promptSelfCurrentPhase(computed: AstrologyComputed, name: string) {
    const themes: Record<string, string> = {
      Sun: 'identity, authority, ego definition',
      Moon: 'emotional depth, home, inner life',
      Mars: 'action, ambition, courage, conflict',
      Mercury: 'communication, learning, mental expansion',
      Jupiter: 'wisdom, growth, abundance, teaching',
      Venus: 'love, creativity, beauty, relationships',
      Saturn: 'discipline, restriction, long mastery, karma',
      Rahu: 'ambition, obsession, unconventional growth',
      Ketu: 'detachment, spiritual seeking, past patterns releasing',
    };
    const { dasha } = computed;
    return `You are Lumen. Write "Current Life Phase" for ${name} in second person (you/your). 3-4 COMPLETE sentences.
What is the meaning of this Mahadasha/Antardasha combination for how they are showing up in life right now?
What is this phase asking of them? What is it building?

Mahadasha: ${dasha.currentMahadasha.planet} (${themes[dasha.currentMahadasha.planet] || ''}) — ${dasha.currentMahadasha.startDate} to ${dasha.currentMahadasha.endDate}
Antardasha: ${dasha.currentAntardasha.planet} (${themes[dasha.currentAntardasha.planet] || ''})`;
  }

  private promptSelfPlanetaryGifts(computed: AstrologyComputed, name: string) {
    const strong = computed.planets
      .filter(p => p.dignity === 'exalted' || p.dignity === 'own')
      .map(p => `${p.name} (${p.dignity} in ${p.sign.split(' ')[0]}, house ${p.house})`);
    const retro = computed.planets.filter(p => p.isRetrograde).map(p => p.name);
    return `You are Lumen. Write "Planetary Gifts" for ${name} in second person (you/your). 2-3 COMPLETE sentences.
What natural strengths and abilities do their strongest planets give them?

Strong planets: ${strong.join(', ') || 'none at exaltation or own sign'}
Retrograde: ${retro.join(', ') || 'none'}
Moon: ${computed.moonSign}, Lagna: ${computed.ascendant}
Yogas: ${computed.yogas.filter(y => y.isPresent).map(y => y.name).join(', ') || 'none'}`;
  }

  private promptSelfYogas(computed: AstrologyComputed, name: string) {
    const present = computed.yogas.filter(y => y.isPresent);
    if (present.length === 0) return `You are Lumen. Write 2 sentences about ${name}'s chart strengths even without classical yogas. Second person. Focus on what their planetary arrangement naturally supports.`;
    return `You are Lumen. Write "Yoga Blessings" for ${name} in second person (you/your). 2-3 COMPLETE sentences.
Explain what the yogas in their chart mean in plain language — what gifts, tendencies, or life themes they create.

Yogas present: ${present.map(y => y.name).join(', ')}
Moon: ${computed.moonSign}, Lagna: ${computed.ascendant}`;
  }

  private promptSelfUpcomingPhase(computed: AstrologyComputed, name: string) {
    const themes: Record<string, string> = {
      Sun: 'identity, leadership, ego refinement',
      Moon: 'emotional depth, nurturing, home',
      Mars: 'action, courage, ambition',
      Mercury: 'communication, learning, agility',
      Jupiter: 'expansion, wisdom, abundance',
      Venus: 'love, creativity, beauty',
      Saturn: 'discipline, patience, long mastery',
      Rahu: 'growth, unconventional paths',
      Ketu: 'spirituality, detachment, release',
    };
    const next = computed.dasha.nextMahadasha;
    return `You are Lumen. Write "Upcoming Phase" for ${name} in second person (you/your). 2-3 COMPLETE sentences.
What will the next Mahadasha ask of them? How can they prepare at the soul level?

Next Mahadasha: ${next.planet} (${themes[next.planet] || ''}) — begins ${next.startDate}`;
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

  private promptEmotionalNature(s: ReturnType<typeof this.buildSignalContext>, name: string, isSelf: boolean) {
    const pov = isSelf
      ? `Write directly TO ${name} in second person (use "you", "your" — as if speaking to them).`
      : `Write ABOUT ${name} in third person (use "they", "them", "their" — never "you" or "your").`;
    return `You are Lumen, a Vedic astrology and psychology specialist.
Write the "Emotional Nature" section for ${name}. ${pov}
Write 3-4 COMPLETE sentences. Do not stop mid-sentence. Style: warm, specific, layman-readable. No jargon. No bullet points.
First sentence: how their/your emotional world moves. Second: how they/you process feelings. Third: what this means in relationships.

Moon sign: ${s.moonSign} (${s.moonEmotional})
Nakshatra: ${s.nakshatra} — ${s.nakshatraSignature}
Moon dignity: ${s.moonDignity}, Moon house: ${s.moonHouse}
Current Mahadasha: ${s.currentDasha}`;
  }

  private promptEmotionalGift(s: ReturnType<typeof this.buildSignalContext>, name: string, isSelf: boolean) {
    const pov = isSelf
      ? `Write directly TO ${name} in second person (use "you", "your").`
      : `Write ABOUT ${name} in third person (use "they", "them", "their" — never "you" or "your").`;
    return `You are Lumen.
Write the "Emotional Gift" section for ${name}. ${pov}
Write 2-3 COMPLETE sentences. Do not stop mid-sentence. What is their/your emotional superpower in relationships? Be specific.

Moon sign: ${s.moonSign}, Nakshatra: ${s.nakshatra}
Moon house: ${s.moonHouse}, Yogas present: ${s.yogas || 'none noted'}`;
  }

  private promptWhatTriggersWithdrawal(s: ReturnType<typeof this.buildSignalContext>, name: string, isSelf: boolean) {
    const pov = isSelf
      ? `Write directly TO ${name} in second person (use "you", "your").`
      : `Write ABOUT ${name} in third person (use "they", "them", "their" — never "you" or "your").`;
    return `You are Lumen.
Write "What Triggers Withdrawal" for ${name}. ${pov}
Write exactly 3 COMPLETE sentences. Do not stop mid-sentence.
First: specific trigger pattern. Second: what withdrawal looks like. Third: the reframe.

Moon sign: ${s.moonSign}, Nakshatra: ${s.nakshatra}
Mars house: ${s.marsHouse}, Saturn house: ${s.saturnHouse}`;
  }

  private promptWhatMakesThemFeelSafe(s: ReturnType<typeof this.buildSignalContext>, name: string, isSelf: boolean) {
    const pov = isSelf
      ? `Write directly TO ${name} in second person (use "you", "your").`
      : `Write ABOUT ${name} in third person (use "they", "them", "their" — never "you" or "your").`;
    return `You are Lumen.
Write "What Makes ${isSelf ? 'You' : 'Them'} Feel Safe" for ${name}. ${pov}
Write 3-4 COMPLETE sentences. Do not stop mid-sentence. Be concrete and actionable.

Moon sign: ${s.moonSign}, Nakshatra: ${s.nakshatra}
Moon house: ${s.moonHouse}, Lagna: ${s.lagna}
Venus house: ${s.venusHouse}, Jupiter house: ${s.jupiterHouse}`;
  }

  private promptWhenThingsGoWrong(s: ReturnType<typeof this.buildSignalContext>, name: string, isSelf: boolean) {
    const pov = isSelf
      ? `Write directly TO ${name} in second person (use "you", "your").`
      : `Write ABOUT ${name} in third person (use "they", "them", "their" — never "you" or "your").`;
    return `You are Lumen.
Write "When Things Go Wrong" for ${name}. ${pov}
Write exactly 3 COMPLETE sentences. Do not stop mid-sentence.
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
    isSelf = false,
  ): Promise<AstrologyInsights['relationshipGuidance']> {
    const selfContext = isSelf
      ? `This is a self-reflection for ${memberName}. Write all values in second person ("you", "your") as self-insight.`
      : `This is guidance for ${userName} about their relationship with ${memberName} (${relation}).`;
    const prompt = `You are Lumen. Generate Relationship Guidance. ${selfContext}
Return ONLY JSON with keys: whatThisRelationshipAsksOfYou, whatLandsWell, whereFrictionLives, howToMeetThemWell, bestMomentToApproach, avoidWhen
Each value: 1-3 COMPLETE sentences. Warm, honest, specific. Do not stop mid-sentence.

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

  private promptPlanetarySignatures(computed: AstrologyComputed, name: string, isSelf: boolean) {
    const strongPlanets = computed.planets
      .filter(p => p.dignity === 'exalted' || p.dignity === 'own')
      .map(p => `${p.name} (${p.dignity} in ${p.sign.split(' ')[0]}, house ${p.house})`);
    const retrograde = computed.planets.filter(p => p.isRetrograde).map(p => p.name);
    const pov = isSelf
      ? `Write directly TO ${name} in second person (use "you", "your").`
      : `Write ABOUT ${name} in third person (they/them/their — never "you"/"your").`;
    return `You are Lumen. Write a 3-sentence "Planetary Signatures" summary for ${name}. ${pov}
Write 3 COMPLETE sentences. Do not stop mid-sentence. Synthesise dominant planetary placements into human-readable insight about their/your character.

Strong planets: ${strongPlanets.join(', ') || 'none'}
Retrograde: ${retrograde.join(', ') || 'none'}
Moon: ${computed.moonSign} house ${computed.planets.find(p => p.name === 'Moon')?.house}
Yogas: ${computed.yogas.filter(y => y.isPresent).map(y => y.name).join(', ') || 'none'}
Lagna: ${computed.ascendant}`;
  }

  private promptDashaInfluence(computed: AstrologyComputed, name: string, isSelf: boolean) {
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
    const pov = isSelf
      ? `Write directly TO ${name} in second person (use "you", "your").`
      : `Write ABOUT ${name} in third person (they/them/their — never "you"/"your").`;
    return `You are Lumen. Write a 3-sentence "Dasha Influence" section for ${name}. ${pov}
Write 3 COMPLETE sentences. Do not stop mid-sentence.
Explain what the current Vimshottari Dasha means for how they/you show up in life and relationships.
Be specific. No jargon. Write for someone who doesn't know astrology.

Current Mahadasha: ${dasha.currentMahadasha.planet} (${themes[dasha.currentMahadasha.planet] || ''})
Current Antardasha: ${dasha.currentAntardasha.planet} (${themes[dasha.currentAntardasha.planet] || ''})
Period: ${dasha.currentMahadasha.startDate} to ${dasha.currentMahadasha.endDate}
Next Mahadasha: ${dasha.nextMahadasha.planet} starting ${dasha.nextMahadasha.startDate}`;
  }
}
