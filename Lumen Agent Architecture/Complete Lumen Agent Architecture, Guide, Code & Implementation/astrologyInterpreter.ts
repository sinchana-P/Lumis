// ═══════════════════════════════════════════════════════════════
// LUMIS AI — ASTROLOGY INTERPRETER
// Generates all human-readable insight sections for the Astrology tab.
// This is where Gemini does the heavy lifting — given computed data,
// produce every UI section the frontend needs.
// ═══════════════════════════════════════════════════════════════

import { AstrologyComputed, AstrologyInsights } from "../types";
import { GeminiClient } from "../ai/geminiClient";
import { DASHA_SEQUENCE } from "./astrologyEngine";

// Nakshatra emotional signatures (used to seed AI prompts)
const NAKSHATRA_EMOTIONAL_SIGNATURE: Record<string, string> = {
  "Ashwini":"Quick to act and quick to recover. Emotions are processed through movement, not stillness.",
  "Bharani":"Holds deep feelings with intensity. Transformation is their emotional language.",
  "Krittika":"Sharp emotional world. Can cut through fog — or cut people. Processes through clarity.",
  "Rohini":"Emotions are rich, sensuous, and slow-moving. They feel through attachment and beauty.",
  "Mrigashira":"Restless emotional nature. Processes through questions, conversation, and seeking.",
  "Ardra":"Storm before calm. Emotions arrive with force and transform everything they touch.",
  "Punarvasu":"Resilient. Can find peace again after disturbance. Optimism is their default return state.",
  "Pushya":"Nurturing emotional core. Processes through caretaking and being needed.",
  "Ashlesha":"Deep, coiled emotional intelligence. Can sense what others hide. Processes through insight.",
  "Magha":"Pride and honour as emotional core. Processes through recognition and lineage.",
  "Purva Phalguni":"Joy and pleasure as emotional default. Processes through beauty and rest.",
  "Uttara Phalguni":"Steady, service-oriented emotional nature. Processes through reliability.",
  "Hasta":"Quick-handed emotional processor. Practical care is how they love.",
  "Chitra":"Aesthetic emotional world. Processes through beauty, craft, and refinement.",
  "Swati":"Adaptable emotional nature. Processes through flexibility and social connection.",
  "Vishakha":"Focused intensity. Emotions are channelled toward goals and achievement.",
  "Anuradha":"Devotion as emotional core. Processes through loyalty and deep friendship.",
  "Jyeshtha":"Elder-energy emotional nature. Processes through protecting and being respected.",
  "Mula":"Goes to the root of things. Processes through letting go and investigating truth.",
  "Purva Ashadha":"Philosophical emotional nature. Processes through wider meaning.",
  "Uttara Ashadha":"Patient, victorious emotional core. Processes through service and universal purpose.",
  "Shravana":"Deep listener. Processes through hearing and learning.",
  "Dhanishtha":"Abundant, ambitious emotional nature. Processes through achievement and music.",
  "Shatabhisha":"Healer's emotional nature. Processes through solitude and hidden knowledge.",
  "Purva Bhadrapada":"Intensity and fire. Processes through transformation and spiritual aspiration.",
  "Uttara Bhadrapada":"Still depths. Processes through compassion and wisdom.",
  "Revati":"Gentle, complete emotional nature. Processes through completion and nurturing.",
};

const MOON_SIGN_EMOTIONAL: Record<string, string> = {
  "Mesha":"Their emotional world moves quickly. They feel, react, and then move on. Lingering is uncomfortable.",
  "Vrishabha":"Their emotional world is slow-moving and sensory. They need stability and beauty to feel safe.",
  "Mithuna":"Their emotional world moves through conversation and thought. Talking is processing for them.",
  "Karkata":"Their emotional world is tidal — deeply feeling, nurturing, and attached to home and past.",
  "Simha":"Their emotional world is expressive and proud. They need recognition to feel genuinely loved.",
  "Kanya":"Their emotional world runs through analysis. They process feelings by understanding them.",
  "Tula":"Their emotional world seeks balance and harmony. Conflict is genuinely painful for them.",
  "Vrischika":"Their emotional world runs deep, still, and intense. They feel everything but reveal little.",
  "Dhanu":"Their emotional world is expansive and philosophical. They need freedom and meaning to feel well.",
  "Makara":"Their emotional world is disciplined and contained. They process through structure and work.",
  "Kumbha":"Their emotional world is detached and universal. They can observe their own feelings from a distance.",
  "Meena":"Their emotional world is oceanic — permeable, empathic, and easily dissolved into the other.",
};

export class AstrologyInterpreter {
  constructor(private gemini: GeminiClient) {}

  // ── MAIN: generate all UI insight sections ───────────────────
  async buildInsights(
    computed: AstrologyComputed,
    memberName: string,
    memberRelation: string,
    userName: string
  ): Promise<AstrologyInsights> {
    // Build a compact signal object for the AI prompt
    const signals = this.buildSignalContext(computed);

    // Generate all sections in parallel
    const [
      emotionalNature,
      emotionalGift,
      whatTriggersWithdrawal,
      whatMakesThemFeelSafe,
      emotionalAvailabilityData,
      whenThingsGoWrong,
      relationshipGuidance,
      planetarySignatures,
      dashaInfluence,
    ] = await Promise.all([
      this.genEmotionalNature(signals, memberName),
      this.genEmotionalGift(signals, memberName),
      this.genWhatTriggersWithdrawal(signals, memberName),
      this.genWhatMakesThemFeelSafe(signals, memberName),
      this.genEmotionalAvailability(signals, memberName),
      this.genWhenThingsGoWrong(signals, memberName),
      this.genRelationshipGuidance(signals, memberName, memberRelation, userName),
      this.genPlanetarySignatures(computed, memberName),
      this.genDashaInfluence(computed, memberName),
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

  // ── SIGNAL CONTEXT (compact, AI-readable) ────────────────────
  private buildSignalContext(computed: AstrologyComputed) {
    const moonSign = computed.moonSign.split(" ")[0]; // "Vrischika"
    const lagna = computed.ascendant.split(" ")[0];
    const sunSign = computed.sunSign.split(" ")[0];
    const moon = computed.planets.find(p => p.name === "Moon");
    const sun = computed.planets.find(p => p.name === "Sun");
    const mars = computed.planets.find(p => p.name === "Mars");
    const venus = computed.planets.find(p => p.name === "Venus");
    const mercury = computed.planets.find(p => p.name === "Mercury");
    const jupiter = computed.planets.find(p => p.name === "Jupiter");
    const saturn = computed.planets.find(p => p.name === "Saturn");

    return {
      moonSign, lagna, sunSign,
      nakshatra: computed.nakshatra,
      nakshatraLord: computed.nakshatraLord,
      nakshatraPada: computed.nakshatraPada,
      nakshatraSignature: NAKSHATRA_EMOTIONAL_SIGNATURE[computed.nakshatra] || "",
      moonEmotional: MOON_SIGN_EMOTIONAL[moonSign] || "",
      moonHouse: moon?.house || 0,
      moonDignity: moon?.dignity || "neutral",
      marsHouse: mars?.house || 0,
      venusHouse: venus?.house || 0,
      venusSign: venus?.sign || "",
      mercuryHouse: mercury?.house || 0,
      jupiterHouse: jupiter?.house || 0,
      saturnHouse: saturn?.house || 0,
      currentDasha: computed.dasha.currentMahadasha.planet,
      currentAntardasha: computed.dasha.currentAntardasha.planet,
      dashaEnd: computed.dasha.currentMahadasha.endDate,
      yogas: computed.yogas.filter(y => y.isPresent).map(y => y.name).join(", "),
    };
  }

  // ── GENERATION METHODS ───────────────────────────────────────
  private async genEmotionalNature(s: ReturnType<typeof this.buildSignalContext>, name: string): Promise<string> {
    const prompt = `You are Lumen, a Vedic astrology and psychology specialist.
Write the "Emotional Nature" section for ${name}.
Length: 3-4 sentences. Style: warm, specific, layman-readable. No jargon. No bullet points.
First sentence: how their emotional world moves (fast/slow, internal/external, etc.).
Second sentence: how they process feelings.
Third sentence: what this means practically in relationships.

Key signals:
Moon sign: ${s.moonSign} (${s.moonEmotional})
Nakshatra: ${s.nakshatra} — ${s.nakshatraSignature}
Moon dignity: ${s.moonDignity}
Moon house: ${s.moonHouse}
Current Mahadasha: ${s.currentDasha}`;

    return this.gemini.generate(prompt, 200);
  }

  private async genEmotionalGift(s: ReturnType<typeof this.buildSignalContext>, name: string): Promise<string> {
    const prompt = `You are Lumen.
Write the "Emotional Gift" section for ${name}.
Length: 2-3 sentences. What is their emotional superpower in relationships?
Be specific to their chart. No generic compliments.

Moon sign: ${s.moonSign}
Nakshatra: ${s.nakshatra}
Moon house: ${s.moonHouse}
Yogas present: ${s.yogas || "none noted"}`;

    return this.gemini.generate(prompt, 150);
  }

  private async genWhatTriggersWithdrawal(s: ReturnType<typeof this.buildSignalContext>, name: string): Promise<string> {
    const prompt = `You are Lumen.
Write "What Triggers Withdrawal" for ${name}.
Length: 3 sentences. What makes them emotionally close down?
Be specific — not generic. Use Vedic chart indicators.
First sentence: the specific trigger pattern.
Second sentence: what withdrawal looks like for them.
Third sentence: what it doesn't mean (reframe the behaviour for the reader).

Moon sign: ${s.moonSign}
Nakshatra: ${s.nakshatra}
Mars house: ${s.marsHouse} (conflict style)
Saturn house: ${s.saturnHouse} (restriction patterns)`;

    return this.gemini.generate(prompt, 180);
  }

  private async genWhatMakesThemFeelSafe(s: ReturnType<typeof this.buildSignalContext>, name: string): Promise<string> {
    const prompt = `You are Lumen.
Write "What Makes Them Feel Safe" for ${name}.
Length: 3-4 sentences. What does this person need to feel genuinely safe in relationship?
Be concrete and actionable — not vague. Use Vedic chart indicators.

Moon sign: ${s.moonSign}
Nakshatra: ${s.nakshatra}
Moon house: ${s.moonHouse}
Lagna (ascendant): ${s.lagna}
Venus house: ${s.venusHouse}
Jupiter house: ${s.jupiterHouse}`;

    return this.gemini.generate(prompt, 180);
  }

  private async genEmotionalAvailability(s: ReturnType<typeof this.buildSignalContext>, name: string): Promise<{ label: string; detail: string }> {
    const prompt = `You are Lumen.
Based on the current Vedic transits and dasha, assess ${name}'s emotional availability RIGHT NOW.
Return ONLY a JSON object: { "label": "...", "detail": "..." }
Label must be one of: "Reaching outward", "Pulling inward", "In transition", "Deeply receptive", "Contracted and rebuilding", "Expansive and open"
Detail: 2 sentences explaining the current phase and what it means for approaching them.

Current Mahadasha: ${s.currentDasha}
Current Antardasha: ${s.currentAntardasha}
Mahadasha ends: ${s.dashaEnd}
Moon sign: ${s.moonSign}
Nakshatra: ${s.nakshatra}`;

    try {
      const raw = await this.gemini.generateJSON(prompt);
      return raw as { label: string; detail: string };
    } catch {
      return {
        label: s.currentDasha === "Saturn" ? "Contracted and rebuilding" : s.currentDasha === "Jupiter" ? "Expansive and open" : "In transition",
        detail: `Currently in ${s.currentDasha} Mahadasha / ${s.currentAntardasha} Antardasha — a period of ${s.currentDasha === "Saturn" ? "discipline and inner restructuring" : "expansion and growth"}. Approach with patience and allow them space to process at their own pace.`,
      };
    }
  }

  private async genWhenThingsGoWrong(s: ReturnType<typeof this.buildSignalContext>, name: string): Promise<string> {
    const prompt = `You are Lumen.
Write "When Things Go Wrong" for ${name}.
Length: 3 sentences. How does this person behave under pressure or in conflict?
First sentence: their specific defence mechanism or coping pattern.
Second sentence: what it looks like from outside.
Third sentence: the reframe — what it actually is (not what it appears to be).

Moon sign: ${s.moonSign}
Nakshatra: ${s.nakshatra}
Mars house: ${s.marsHouse}
Lagna: ${s.lagna}`;

    return this.gemini.generate(prompt, 180);
  }

  private async genRelationshipGuidance(
    s: ReturnType<typeof this.buildSignalContext>,
    memberName: string, relation: string, userName: string
  ): Promise<AstrologyInsights["relationshipGuidance"]> {
    const prompt = `You are Lumen. Generate the Relationship Guidance section for ${userName}'s relationship with ${memberName} (${relation}).
Return ONLY a JSON object with exactly these keys:
{
  "whatThisRelationshipAsksOfYou": "2-3 sentences — what ${userName} must cultivate or develop for this relationship to work",
  "whatLandsWell": "2 sentences — what approach, words, gestures work well with ${memberName}",
  "whereFrictionLives": "2-3 sentences — the specific friction point in this dynamic, named honestly",
  "howToMeetThemWell": "2-3 sentences — practical, specific guidance for ${userName}",
  "bestMomentToApproach": "1-2 sentences — timing guidance based on their emotional cycle",
  "avoidWhen": "1-2 sentences — when NOT to approach or expect openness"
}

${memberName} chart signals:
Moon: ${s.moonSign}, Nakshatra: ${s.nakshatra} (${s.nakshatraSignature})
Emotional pattern: ${s.moonEmotional}
Mars house: ${s.marsHouse}, Venus house: ${s.venusHouse}
Current dasha: ${s.currentDasha}/${s.currentAntardasha}`;

    try {
      const raw = await this.gemini.generateJSON(prompt);
      return raw as AstrologyInsights["relationshipGuidance"];
    } catch {
      return {
        whatThisRelationshipAsksOfYou: `This relationship asks ${userName} to understand ${memberName}'s emotional language — which runs differently from most. Patience with the pace of their processing is not optional; it is the price of genuine connection with them.`,
        whatLandsWell: `Direct, honest communication that doesn't require them to guess what you mean. They respond to specificity, not implications.`,
        whereFrictionLives: `The friction tends to live in timing — ${userName} may need something exactly when ${memberName} is least available to give it. Neither is at fault. The cycles just don't always align.`,
        howToMeetThemWell: `Meet them with curiosity rather than expectation. What works today may not work tomorrow — and that's not inconsistency, it's their nature.`,
        bestMomentToApproach: `Approach in their naturally expansive moments — when they've had space and rest. Not when they've just come from something demanding.`,
        avoidWhen: `Avoid important conversations when they're visibly contracted, tired, or in a processing phase. They cannot access openness on demand.`,
      };
    }
  }

  private async genPlanetarySignatures(computed: AstrologyComputed, name: string): Promise<string> {
    const strongPlanets = computed.planets
      .filter(p => p.dignity === "exalted" || p.dignity === "own")
      .map(p => `${p.name} (${p.dignity} in ${p.sign.split(" ")[0]}, house ${p.house})`);
    const retrograde = computed.planets.filter(p => p.isRetrograde).map(p => p.name);

    const prompt = `You are Lumen. Write a 3-sentence "Planetary Signatures" summary for ${name}.
Synthesise the most important planetary placements into human-readable insight about their character.
Focus on what the dominant planets reveal about how they move through life.

Strong planets: ${strongPlanets.join(", ") || "none exalted or own-sign"}
Retrograde planets: ${retrograde.join(", ") || "none"}
Moon: ${computed.moonSign} house ${computed.planets.find(p => p.name === "Moon")?.house}
Yogas: ${computed.yogas.filter(y => y.isPresent).map(y => y.name).join(", ") || "none detected"}
Lagna: ${computed.ascendant}`;

    return this.gemini.generate(prompt, 200);
  }

  private async genDashaInfluence(computed: AstrologyComputed, name: string): Promise<string> {
    const dasha = computed.dasha;
    const dashaThemes: Record<string, string> = {
      Sun:"authority, self-expression, ego work, father energy",
      Moon:"emotional fluctuation, home, mother energy, nurturing themes",
      Mars:"action, conflict, drive, ambition, impatience",
      Mercury:"communication, learning, mental agility, sibling themes",
      Jupiter:"expansion, wisdom, growth, spirituality, abundance",
      Venus:"love, pleasure, creativity, relationships, beauty",
      Saturn:"discipline, restriction, hard work, karmic lessons",
      Rahu:"obsession, ambition, unconventional paths, foreign influence",
      Ketu:"detachment, spiritual seeking, past-life themes, isolation",
    };

    const prompt = `You are Lumen. Write a 3-sentence "Dasha Influence" section for ${name}.
Explain what their current Vimshottari Dasha period means for how they show up in life and relationships.
Be specific. No jargon. Write for someone who doesn't know astrology.

Current Mahadasha: ${dasha.currentMahadasha.planet} (${dashaThemes[dasha.currentMahadasha.planet] || ""})
Current Antardasha: ${dasha.currentAntardasha.planet} (${dashaThemes[dasha.currentAntardasha.planet] || ""})
Period: ${dasha.currentMahadasha.startDate} to ${dasha.currentMahadasha.endDate}
Next Mahadasha: ${dasha.nextMahadasha.planet} starting ${dasha.nextMahadasha.startDate}`;

    return this.gemini.generate(prompt, 180);
  }
}
