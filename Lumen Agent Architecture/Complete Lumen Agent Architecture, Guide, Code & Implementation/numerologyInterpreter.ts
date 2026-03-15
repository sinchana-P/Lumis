// ═══════════════════════════════════════════════════════════════
// LUMIS AI — NUMEROLOGY INTERPRETER
// Generates all human-readable descriptions for UI sections.
// Uses Gemini for "theirNumberInYourLife" (relationship-specific).
// All core descriptions are from the pre-written library.
// ═══════════════════════════════════════════════════════════════

import { NumerologyInsights, NumerologyCompatibility } from "../types";
import { GeminiClient } from "../ai/geminiClient";
import {
  LIFE_PATH_LABELS, SOUL_URGE_LABELS, PERSONAL_YEAR_THEMES,
  compatibilityScores
} from "./numerologyEngine";

// ── PRE-WRITTEN DESCRIPTION LIBRARY ─────────────────────────────
// All full descriptions. Gemini never writes these.
// Gemini ONLY writes the "theirNumberInYourLife" section.

const LIFE_PATH_FULL: Record<number, { title: string; short: string; full: string }> = {
  1: { title:"The Pioneer", short:"Independent · Driven · Original",
    full:"Life Path 1 is the number of leadership, originality, and self-determination. You came into this life to forge your own path — not follow someone else's. There is an innate drive within you to initiate, to begin things, to stand at the front. At your best you are courageous, creative, and fiercely original. At your shadow you can become domineering, isolated, or unable to ask for help. In relationships you need a partner who respects your autonomy deeply — you give space to others instinctively because you need it so deeply yourself." },
  2: { title:"The Peacemaker", short:"Sensitive · Receptive · Diplomatic",
    full:"Life Path 2 is the number of partnership, sensitivity, and deep emotional intelligence. You came here not to lead loudly but to hold space brilliantly. You sense what others feel before they say it. You are the glue in every group. At your shadow, you over-adapt, shrink in dominant company, and mistake people-pleasing for kindness. Your core wound is invisibility. Your core gift is making every person you love feel completely seen." },
  3: { title:"The Expressive", short:"Creative · Joyful · Communicative",
    full:"Life Path 3 is the number of self-expression, creativity, and joy. You came here to communicate — through words, art, presence, humour. Life around you feels lighter. At your best you are magnetic, inspiring, and endlessly generative. At your shadow you scatter your gifts, avoid depth, and use humour to deflect vulnerability. In relationships you need creative freedom and a partner who celebrates rather than contains you." },
  4: { title:"The Builder", short:"Stable · Disciplined · Trustworthy",
    full:"Life Path 4 is the number of structure, discipline, and building things that last. You came here to create solid foundations in work, family, and community. You are the most reliable person in every room. At your shadow you become rigid, controlling of process, and resistant to change. In relationships you show love through acts of service and consistent presence. You need a partner who values reliability as deeply as you do." },
  5: { title:"The Free Spirit", short:"Adventurous · Curious · Magnetic",
    full:"Life Path 5 is the number of freedom, change, and sensory experience. You came here to live fully — to taste, travel, transform. You bring energy and aliveness to every space you enter. At your shadow you become restless, commitment-avoidant, and addicted to stimulation over depth. In relationships you need space and a partner who is secure enough not to chase you." },
  6: { title:"The Nurturer", short:"Caring · Responsible · Devoted",
    full:"Life Path 6 is the number of love, family, and responsibility. You came here to nurture — to hold people together, to create beauty, to be the home for those around you. At your best you are deeply loving and healing to be around. At your shadow you martyr yourself, take on others' burdens, and confuse love with control. Your deepest fear is that if you stop being useful, people will stop needing you." },
  7: { title:"The Seeker", short:"Introspective · Analytical · Spiritual",
    full:"Life Path 7 is the number of the inner world — analysis, solitude, spiritual seeking, and the search for truth. You came here not to accumulate, but to understand. At your best you are profoundly wise and incisive. At your shadow you become isolated, emotionally unavailable, and so lost in your mind that your relationships starve. You need someone who gives you silence without making it rejection." },
  8: { title:"The Powerhouse", short:"Ambitious · Authoritative · Resilient",
    full:"Life Path 8 is the number of power, authority, and material mastery. You came here to build empires — inner and outer. You are drawn to excellence and the kind of success that changes lives. At your shadow you become domineering and conflate worth with achievement. In relationships you need a partner who doesn't wilt under your intensity — someone who brings their own authority to the table." },
  9: { title:"The Humanitarian", short:"Compassionate · Wise · Universal",
    full:"Life Path 9 is the number of completion, wisdom, and universal love. You came here with the deepest emotional range of all numbers. At your best you are profoundly compassionate and generous without limit. At your shadow you give so much to strangers that your closest relationships quietly starve. You must learn that being loved is not weakness." },
  11: { title:"The Illuminator", short:"Visionary · Intuitive · Inspiring",
    full:"Life Path 11 is the first master number — illumination, spiritual leadership, and heightened intuition. Your sensitivity runs deeper than most people can imagine. At your shadow you become anxious, scattered, and overwhelmed by the weight of your own perception. You need someone who understands that your depth is not a burden — it is the whole of who you are." },
  22: { title:"The Master Builder", short:"Visionary · Powerful · Practical",
    full:"Life Path 22 is the Master Builder — the most powerful of all life path numbers. You came here to build something lasting at civilisational scale. The tension between your enormous vision and the practical patience it requires is the central challenge of your life. At your shadow, the pressure of your own potential becomes paralysis." },
};

const SOUL_URGE_FULL: Record<number, string> = {
  1:"Soul Urge 1: beneath everything, the deepest desire is for self-determination and the right to lead their own life. When this is thwarted they resist or leave. When it is honoured they are generous and inspiring.",
  2:"Soul Urge 2: beneath the composed exterior, what they most deeply crave is to be fully received. Not just loved — received. To say something true and have someone hold it gently. When this need is unmet, they get quiet and begin editing themselves before they even speak.",
  3:"Soul Urge 3: the deepest hunger is for genuine creative expression and the joy of being celebrated for it. When suppressed, something essential in them dims. When nurtured, they are extraordinarily alive.",
  4:"Soul Urge 4: what they quietly hunger for is stability — a world that makes sense, where commitments mean something. When this need goes chronically unmet, they become rigid or anxious about details others find trivial.",
  5:"Soul Urge 5: the deepest need is for freedom — to move, to change, to experience without containment. When blocked, they become restless in ways that confuse everyone around them. When honoured, they are magnetic.",
  6:"Soul Urge 6: the deepest desire is to create a world of genuine care — a home, a family, a community where everyone is held. Their greatest spiritual work is learning that they deserve what they so generously give.",
  7:"Soul Urge 7: they are not easily satisfied by surface connection. What they crave is truth — in themselves, in others. They want to understand, not just to know. When frustrated, they disappear into their own minds.",
  8:"Soul Urge 8: the deepest desire is to build something that matters. They are driven by a deep belief that they came here to do something significant. When blocked, it shows as frustration and impatience that can be hard to be around.",
  9:"Soul Urge 9: they are not easily satisfied by personal happiness alone. They need to feel their presence in the world is mattering. They feel most alive in service and healing. Their challenge is that they sometimes use this as an escape from ordinary intimacy.",
};

const PERSONAL_YEAR_FULL: Record<number, string> = {
  1:"A Personal Year 1 is a year to begin — to plant seeds that carry unusual weight. Whatever is started this year has longevity. The energy supports bold moves and fresh starts. In relationships this is a year to establish new dynamics — old patterns have permission to end.",
  2:"A Personal Year 2 is a year for patience and deepening what already exists. Relationships are highlighted: what you give and receive will both become very clear. Pay attention to who shows up when you stop performing.",
  3:"A Personal Year 3 is a year for creativity, communication, and social expansion. Life brightens. Conversations you've been avoiding can finally happen with ease.",
  4:"A Personal Year 4 is a year of work, discipline, and building. Nothing glamorous — but what is built here is permanent. A year to organise your life and lay groundwork in your most important relationships.",
  5:"A Personal Year 5 is a year of change and the unexpected. Life refuses to stay still. Relationships may shift dramatically. Stay fluid — the 5 year rewards those who trust disruption as preparation.",
  6:"A Personal Year 6 is a year where love and responsibility take centre stage. Relationships demand and reward your attention. It is a year to show up for the people who need you.",
  7:"A Personal Year 7 is a year for going inward. Something is ripening in you that requires quiet. A year for deep study and honest self-examination. Communicate this clearly so the people who love you don't interpret your depth as distance.",
  8:"A Personal Year 8 is a year for results. What you have built is ready to come to fruition. Don't shrink from your own power. The danger is letting ambition crowd out the relationships that made the work worth doing.",
  9:"A Personal Year 9 is a year of completion, release, and preparing for an entirely new cycle. Things that have run their course will end. Do not try to hold on. Grief is appropriate here. So is gratitude.",
};

export class NumerologyInterpreter {
  constructor(private gemini: GeminiClient) {}

  // ── MAIN: build all insights ──────────────────────────────────
  async buildInsights(
    memberNumbers: { lp: number; su: number; expr: number; pers: number; bd: number; mat: number; py: number; pm: number },
    memberName: string,
    memberRelation: string,
    userName: string,
    userNumbers: { lp: number; su: number; expr: number; py: number },
  ): Promise<NumerologyInsights> {
    // All pre-written descriptions — no AI needed
    const lifePathMeaning = this.getLifePathDescription(memberNumbers.lp);
    const expressionMeaning = this.getExpressionDescription(memberNumbers.expr);
    const soulUrgeMeaning = SOUL_URGE_FULL[memberNumbers.su] || SOUL_URGE_FULL[1];
    const personalityMeaning = this.getPersonalityDescription(memberNumbers.pers);
    const birthdayMeaning = this.getBirthdayDescription(memberNumbers.bd);
    const maturityMeaning = this.getMaturityDescription(memberNumbers.mat);
    const personalYearMeaning = PERSONAL_YEAR_FULL[memberNumbers.py] || PERSONAL_YEAR_FULL[1];
    const personalMonthMeaning = `Personal Month ${memberNumbers.pm}: ${PERSONAL_YEAR_FULL[memberNumbers.pm]?.split(".")[0] || "A focused period of specific energetic theme."}.`;

    // AI generates ONLY the relationship-specific "their number in your life" blocks
    const theirNumberInYourLife = await this.generateTheirNumbersInYourLife(
      memberNumbers, memberName, memberRelation, userName, userNumbers
    );

    return {
      lifePathMeaning, expressionMeaning, soulUrgeMeaning,
      personalityMeaning, birthdayMeaning, maturityMeaning,
      personalYearMeaning, personalMonthMeaning,
      theirNumberInYourLife,
    };
  }

  // ── BUILD COMPATIBILITY ───────────────────────────────────────
  async buildCompatibility(
    userDob: string, memberDob: string,
    userName: string, memberName: string,
    memberRelation: string
  ): Promise<NumerologyCompatibility> {
    const scores = compatibilityScores(userDob, memberDob, userName, memberName);
    const { lifePathScore, expressionScore, soulUrgeScore, yearAlignmentScore, overallScore, numbers } = scores;

    const overallSummary = overallScore > 75
      ? "Natural resonance with working friction points — understanding comes easier here than in most pairs."
      : overallScore > 55
      ? "Productive contrast — growth is possible, friction is real. The friction is the curriculum, not the problem."
      : "Significant contrast — requires active understanding and stretching from both sides. Neither is wrong. Both are different.";

    // Generate per-dimension analysis texts using Gemini
    const dimensionTexts = await this.generateCompatibilityTexts(
      numbers, userName, memberName, memberRelation,
      { lifePathScore, soulUrgeScore, expressionScore, yearAlignmentScore }
    );

    return { lifePathScore, expressionScore, soulUrgeScore, yearAlignmentScore, overallScore, overallSummary, dimensionTexts };
  }

  // ── AI: Their Number In Your Life ────────────────────────────
  private async generateTheirNumbersInYourLife(
    m: { lp: number; su: number; expr: number; pers: number; bd: number; mat: number; py: number; pm: number },
    memberName: string, relation: string, userName: string,
    u: { lp: number; su: number; expr: number; py: number }
  ): Promise<Record<string, string>> {
    const prompt = `You are Lumen, the intelligence core of Lumis. 
Write "Their Number in Your Life" interpretations — 2-3 sentences each.
Style: warm, direct, specific. No bullet points. Second or third person only. 
Start each with the most essential insight — not a definition, not a setup.
Write as if speaking to ${userName} about ${memberName} (${relation}).

Return ONLY a JSON object with these exact keys:
lifePath, expression, soulUrge, personality, birthday, maturity, personalYear, personalMonth

Context:
${memberName}: LP ${m.lp} (${LIFE_PATH_LABELS[m.lp]}), SU ${m.su}, Expr ${m.expr}, Pers ${m.pers}, BD ${m.bd}, Mat ${m.mat}, PY ${m.py}, PM ${m.pm}
${userName}: LP ${u.lp}, SU ${u.su}, Expr ${u.expr}, PY ${u.py}
Relationship: ${relation}

For each number, explain what it means specifically for how ${memberName} shows up in their relationship with ${userName} — and what ${userName} needs to understand or do differently because of it.`;

    try {
      const raw = await this.gemini.generateJSON(prompt);
      return raw as Record<string, string>;
    } catch {
      return this.fallbackTheirNumbers(m, memberName, userName);
    }
  }

  // ── AI: Compatibility dimension texts ───────────────────────
  private async generateCompatibilityTexts(
    numbers: { uLP: number; mLP: number; uSU: number; mSU: number; uExpr: number; mExpr: number; uPY: number; mPY: number },
    userName: string, memberName: string, relation: string,
    scores: { lifePathScore: number; soulUrgeScore: number; expressionScore: number; yearAlignmentScore: number }
  ): Promise<Record<string, string>> {
    const prompt = `You are Lumen. Write compatibility analysis texts for each dimension.
Style: honest, warm, specific. 2-3 sentences per dimension. No bullet points. Use real names.

Return ONLY a JSON object with keys: lifePath, soulUrge, expression, yearAlignment, synthesis

${userName} and ${memberName} (${relation}):
Life Path: ${userName}=${numbers.uLP}, ${memberName}=${numbers.mLP}, Score=${scores.lifePathScore}%
Soul Urge: ${userName}=${numbers.uSU}, ${memberName}=${numbers.mSU}, Score=${scores.soulUrgeScore}%
Expression: ${userName}=${numbers.uExpr}, ${memberName}=${numbers.mExpr}, Score=${scores.expressionScore}%
Personal Year: ${userName}=${numbers.uPY}, ${memberName}=${numbers.mPY}, Score=${scores.yearAlignmentScore}%

For each dimension: explain what the number difference means in this specific relationship.
For synthesis: 3 sentences summarising the core dynamic and what both people need to understand.`;

    try {
      const raw = await this.gemini.generateJSON(prompt);
      return raw as Record<string, string>;
    } catch {
      return {
        lifePath: `Life Path ${numbers.uLP} and Life Path ${numbers.mLP} approach life from ${Math.abs(numbers.uLP - numbers.mLP) <= 2 ? "compatible angles" : "notably different angles"}, creating ${scores.lifePathScore > 70 ? "natural harmony" : "productive friction"} in how you each understand purpose and direction.`,
        soulUrge: `Your Soul Urge ${numbers.uSU} and their Soul Urge ${numbers.mSU} reveal ${scores.soulUrgeScore > 70 ? "overlapping" : "contrasting"} deep needs — understanding this distinction changes how you interpret their hardest behaviours.`,
        expression: `Expression ${numbers.uExpr} meets Expression ${numbers.mExpr}: your communication registers ${scores.expressionScore > 70 ? "overlap naturally" : "differ enough"} to require either ease or deliberate translation between you.`,
        yearAlignment: `${userName} is in a Personal Year ${numbers.uPY} while ${memberName} is in a Personal Year ${numbers.mPY} — ${Math.abs(numbers.uPY - numbers.mPY) <= 2 ? "your cycles are reasonably aligned this year" : "your life phases are out of sync, which explains some of the timing frustrations between you"}.`,
        synthesis: `The numerological contrast between ${userName} and ${memberName} is both the source of their friction and the engine of their growth. Understanding this at a structural level moves the relationship from a struggle for sameness to an appreciation of genuine contrast.`,
      };
    }
  }

  // ── PRE-WRITTEN DESCRIPTIONS ─────────────────────────────────
  private getLifePathDescription(n: number): string {
    return (LIFE_PATH_FULL[n] || LIFE_PATH_FULL[1]).full;
  }

  private getExpressionDescription(n: number): string {
    const desc: Record<number, string> = {
      1:"Expression 1 means the world sees them as a natural leader and initiator. Their presence carries authority even when they aren't trying. Others follow their lead without understanding why. Their challenge is learning to express vulnerability without interpreting it as weakness.",
      2:"Expression 2 means they express themselves through sensitivity, tact, and an extraordinary ability to understand both sides. They are at their best in mediation and deep listening. Their challenge is expressing their own needs with the same eloquence they use for everyone else's.",
      3:"Expression 3 means they express themselves through language, creativity, and infectious optimism. People feel lighter after spending time with them. Their challenge is developing depth of expression — not just width.",
      4:"Expression 4 means they express themselves through competence, reliability, and careful execution. People trust them because they do what they say. Their challenge is expressing spontaneity and emotional openness.",
      5:"Expression 5 means they express themselves through enthusiasm, variety, and an ability to persuade. They communicate in ways that excite and energise. Their challenge is expressing commitment in ways that others find believable.",
      6:"Expression 6 means they express themselves through warmth, care, and responsibility. They are at their best when someone needs them. Their challenge is expressing their own needs instead of anticipating everyone else's.",
      7:"Expression 7 means they express themselves through careful observation, precision, and depth. They rarely speak first in a room but when they do, people listen. Their challenge is expressing emotion as freely as they express intellect.",
      8:"Expression 8 means they naturally express authority, competence, and ambition. People trust them with leadership because they carry it without seeming to try. Their challenge is expressing warmth — the parts of them that exist but rarely find voice.",
      9:"Expression 9 means they express themselves through wisdom, empathy, and a kind of love that is difficult to put into boxes. People feel seen in their presence. Their challenge is expressing boundaries with the same love they express acceptance.",
    };
    return desc[n] || desc[1];
  }

  private getPersonalityDescription(n: number): string {
    const desc: Record<number, string> = {
      1:"Personality 1: the world sees decisiveness before they've proven it. Their bearing communicates certainty. This is an enormous advantage — and can be an isolating pressure.",
      2:"Personality 2: the world perceives them as someone easy to be around. People feel comfortable approaching them. The gap between how they appear and the complexity within can be significant.",
      3:"Personality 3: the world sees someone naturally joyful and expressive before they even open their mouth. People feel lighter around them quickly. The gap between how they appear and how they feel internally can be exhausting to maintain.",
      4:"Personality 4: the world perceives them as stable and solid. People lean on this projection even before they know them well.",
      5:"Personality 5: the world sees excitement and energy. Their presence communicates possibility. This draws people in and can create expectations they may not want to carry.",
      6:"Personality 6: the world perceives safety and warmth. People assume they will take care of things. This is a gift — and a weight.",
      7:"Personality 7: the world perceives them as thoughtful, somewhat reserved, and deeply intelligent. There is a quality of calm that reads as confidence even when it is actually introversion.",
      8:"Personality 8: the world sees authority before they demonstrate it. Something in how they hold their presence communicates competence and direction.",
      9:"Personality 9: the world perceives depth and compassion before they've done anything to earn it. People feel they can tell them things. This is a profound gift and a relational responsibility.",
    };
    return desc[n] || desc[1];
  }

  private getBirthdayDescription(bd: number): string {
    return `Born on the ${bd}${bd===1?"st":bd===2?"nd":bd===3?"rd":"th"}, this is the natural gift — the thing they can do without trying that others work years to develop. It is the easiest expression of their energy and simultaneously the thing most easily taken for granted by those around them. When suppressed or unacknowledged, it creates low-grade frustration that has no obvious name.`;
  }

  private getMaturityDescription(n: number): string {
    const base = LIFE_PATH_FULL[n] || LIFE_PATH_FULL[1];
    return `Maturity Number ${n} — ${base.title}: ${base.full.split(".").slice(0, 2).join(".")}. This number activates gradually, becoming more prominent after the midpoint of life. The relationship you are in today is also, in part, a relationship with this future self.`;
  }

  // ── FALLBACK ─────────────────────────────────────────────────
  private fallbackTheirNumbers(
    m: { lp: number; su: number; expr: number; pers: number; bd: number; mat: number; py: number; pm: number },
    memberName: string, userName: string
  ): Record<string, string> {
    return {
      lifePath: `Their Life Path ${m.lp} (${LIFE_PATH_LABELS[m.lp]}) is the direction their soul is pointed — not their personality, but their purpose. Understanding this number is the key to understanding why they do what they do, especially in the moments that confuse ${userName} most.`,
      expression: `Their Expression ${m.expr} is how they naturally show up in the world — the register they default to in communication, in conflict, and in care. When their expression doesn't match what ${userName} needs, it is rarely intentional.`,
      soulUrge: `Their Soul Urge ${m.su} is what they are quietly hungry for beneath every interaction. When this need goes unmet, the behaviours that are hardest to be around tend to emerge. When it is met, ${userName} tends to see the best of them.`,
      personality: `Their Personality ${m.pers} is the first impression — the energy people feel before a conversation begins. The gap between how they appear and how they actually feel is often wider than people expect.`,
      birthday: `Their Birthday ${m.bd} is the gift they were born carrying — the natural talent that feels effortless to them. When ${memberName} suppresses this gift, ${userName} tends to see a dimmer version of who they actually are.`,
      maturity: `Their Maturity Number ${m.mat} is who they are in the process of becoming. The version of them in your relationship today is transitional.`,
      personalYear: `Their Personal Year ${m.py} (${PERSONAL_YEAR_THEMES[m.py]}) shapes everything they bring to your relationship this year. This is not personal to ${userName}. It is the weather their soul is moving through.`,
      personalMonth: `Their Personal Month ${m.pm} colours every interaction right now. Understanding this is the difference between taking their behaviour personally and reading it for what it actually is.`,
    };
  }
}
