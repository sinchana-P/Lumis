// Mock Numerology Data for Development
// This file contains sample numerology data to showcase the numerology components.
// When building the API, each field here maps directly to an API response field.

// ─── Interfaces ──────────────────────────────────────────────────────────────

export type CoreNumberType = 'lifePath' | 'expression' | 'soulUrge' | 'personality' | 'birthday' | 'maturity';
export type TimingPeriod = 'Personal Year' | 'Personal Month' | 'Personal Day' | 'Life Cycles';

export interface CoreNumberData {
  id: string;
  number: number;
  title: string;
  /** Label shown under the big number e.g. "Life Path", "Expression" */
  subtitle: string;
  /** Short tagline shown on the collapsed card e.g. "Their core purpose & personality" */
  description: string;
  traits: string[];
  type: CoreNumberType;
  /** Long paragraph revealed when the card is expanded */
  expandedDescription: string;
  /** "Their Number in Your Life" insight card text */
  wisdomInsight: string;
}

export interface TimingNumberData {
  id: string;
  number: number;
  title: string;
  period: TimingPeriod;
  /** Short tagline shown on the collapsed card */
  description: string;
  /** Short phrase used inside the expanded guidance card */
  influence: string;
  /** Calendar year (only relevant for Personal Year) */
  year?: number;
  /** Long paragraph revealed when the card is expanded */
  expandedDescription: string;
  /** Full guidance paragraph shown in the inner "Guidance" card when expanded */
  guidanceText: string;
}

export interface CompatibilityCardData {
  id: string;
  yourNumber: number;
  theirNumber: number;
  title: string;
  subtitle: string;
  score: number;
  /** Short description used as the score label */
  description: string;
  /** Main paragraph shown in the expanded view */
  expandedContent: string;
  /** "Lumis Assessment" inner card paragraph */
  lumisAssessment: string;
}

export interface CompatibilityData {
  overallScore: number;
  /** Sentence shown in the gold "Current Year Energy" banner */
  currentYearEnergyText: string;
  lifePath: CompatibilityCardData;
  soulUrge: CompatibilityCardData;
  compatibilityScore: CompatibilityCardData;
}

export interface NumerologyData {
  coreNumbers: CoreNumberData[];
  timingNumbers: TimingNumberData[];
  compatibility: CompatibilityData;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockNumerologyProfile: NumerologyData = {
  coreNumbers: [
    {
      id: '1',
      number: 1,
      title: 'The Pioneer',
      subtitle: 'Life Path',
      description: 'Their core purpose & personality',
      traits: ['Independent', 'Driven', 'Original'],
      type: 'lifePath',
      expandedDescription:
        'Life Path 1 is the number of leadership, originality, and self-determination. You came into this life to forge your own path — not follow someone else\'s. There is an innate drive within you to initiate, to begin things, to stand at the front. At your best you are courageous, creative, and fiercely original. At your shadow you can become domineering, isolated, or unable to ask for help. In relationships, you need a partner who respects your autonomy. You give space to others instinctively because you need it so deeply yourself.',
      wisdomInsight:
        'Their Life Path 1 means their core orientation in life is fundamentally about independence and self-expression. Understanding this number is the key to understanding why they do what they do, especially in the moments that confuse you most.',
    },
    {
      id: '2',
      number: 8,
      title: 'The Executive',
      subtitle: 'Expression',
      description: 'How they show up in the world',
      traits: ['Commanding', 'Strategic', 'Decisive'],
      type: 'expression',
      expandedDescription:
        'Expression Number 8 is the number of power, authority, and material mastery. This person shows up in the world as a natural leader and organizer. They carry an executive energy — capable of seeing the big picture and making decisive moves. At their best they inspire confidence and build lasting structures. At their shadow they can become controlling or overly focused on status. In relationships, they need to feel respected and capable.',
      wisdomInsight:
        'Their Expression 8 explains how they project themselves outward — commanding, strategic, and result-oriented. When they seem detached or driven, remember this is not coldness but their natural mode of operating in the world.',
    },
    {
      id: '3',
      number: 8,
      title: 'Craves Mastery',
      subtitle: 'Soul Urge',
      description: 'What they secretly want/need',
      traits: ['To Achieve', 'To Leave A Legacy'],
      type: 'soulUrge',
      expandedDescription:
        'Soul Urge 8 reveals a deep inner hunger for mastery, achievement, and legacy. At the core of this person\'s being is a need to accomplish something significant — to prove to themselves that they can rise and succeed. This is not vanity; it is a soul-level drive toward excellence. They may suppress this hunger but it never disappears. Without meaningful work and recognition, they feel quietly hollow.',
      wisdomInsight:
        'Their Soul Urge 8 means they need to feel capable and significant. Even in personal moments, honor their need to lead, achieve, or contribute. Criticism of their competence cuts deeper than almost anything else.',
    },
    {
      id: '4',
      number: 3,
      title: 'Appears Radiant',
      subtitle: 'Personality',
      description: 'How others perceive them',
      traits: ['Warm', 'Approachable', 'Expressive'],
      type: 'personality',
      expandedDescription:
        'Personality Number 3 is the mask others see first — radiant, expressive, and full of warmth. People are naturally drawn to this person\'s energy. They seem light, social, and optimistic. This outward presentation may or may not reflect the inner world (see Soul Urge and Life Path for that). But they have a gift for making people feel welcome and at ease in their presence.',
      wisdomInsight:
        'Their Personality 3 means first impressions of them are often "bright" or "fun." But do not mistake the social ease for shallowness — beneath the radiance is everything the other numbers reveal.',
    },
    {
      id: '5',
      number: 14,
      title: 'Gift of Adaptability',
      subtitle: 'Birthday',
      description: 'Their natural talent/gift',
      traits: ['Fluid', 'Resourceful', 'Perceptive'],
      type: 'birthday',
      expandedDescription:
        'Birthday Number 14 reveals an innate talent for navigating change and uncertainty. Born on the 14th, this person has a gift for reading shifting conditions and adapting fluidly. They are resourceful under pressure and often find solutions others miss. This adaptability is a superpower, though it can sometimes manifest as restlessness or difficulty settling.',
      wisdomInsight:
        'Their Birthday Number 14 means change does not frighten them the way it does others. In fact, stagnation is harder for them than disruption. Remember this when plans shift — they are often more comfortable in motion than in stillness.',
    },
    {
      id: '6',
      number: 9,
      title: 'The Humanitarian',
      subtitle: 'Maturity',
      description: 'Who they\'re becoming with age',
      traits: ['Wise', 'Compassionate', 'Universal'],
      type: 'maturity',
      expandedDescription:
        'Maturity Number 9 describes the person they are gradually growing into — someone of wisdom, compassion, and universal perspective. As they age, the personal ambitions soften and a broader love for humanity begins to take shape. They become less concerned with personal gain and more drawn to service, teaching, and understanding. This is the arc of their life.',
      wisdomInsight:
        'Their Maturity Number 9 means their later chapters are marked by generosity and wisdom. The drive and ambition of earlier years will give way to something quieter and more profound. Be part of that evolution.',
    },
  ],

  timingNumbers: [
    {
      id: '1',
      number: 7,
      title: 'Year of Spiritual Growth',
      period: 'Personal Year',
      description: 'What energy they\'re in RIGHT NOW',
      influence: 'Focus on meditation, study, and inner wisdom.',
      year: 2026,
      expandedDescription:
        'Personal Year 7 represents a profound period of spiritual awakening and inner development. This is not a time for material pursuits, but rather for deep introspection, meditation, and connecting with higher wisdom. The energy calls for stepping back from the external world to focus on inner growth and understanding. Research, analysis, and seeking truth become paramount during this transformative cycle.',
      guidanceText:
        'Focus on meditation, study, and inner wisdom. This is their time to trust their intuition and seek deeper understanding of life\'s mysteries. Support their need for solitude and contemplation. Avoid pressuring them into social activities or material decisions. Instead, encourage their spiritual journey and respect their need for quiet reflection.',
    },
    {
      id: '2',
      number: 3,
      title: 'Month of Creative Expression',
      period: 'Personal Month',
      description: 'This month\'s emotional climate',
      influence: 'Time for creativity, communication, and social connection.',
      expandedDescription:
        'Personal Month 3 opens a window of creative expression, communication, and social joy. Within the larger Personal Year cycle, this month invites lightness and connection. Ideas flow more easily. Conversations carry more meaning. Creative projects started now have the backing of strong expressive energy. It is a good time to initiate dialogue, share feelings, and lean into collaborative work.',
      guidanceText:
        'Time for creativity, communication, and social connection. This is a month to invite them into joyful, expressive activities. Shared experiences — art, music, conversation, travel — carry extra resonance now. It is also a good time for important conversations, as their communication opens naturally under this energy.',
    },
    {
      id: '3',
      number: 11,
      title: 'Master Number Awakening',
      period: 'Life Cycles',
      description: 'Which phase of life they\'re in',
      influence: 'Trust your intuition and embrace your spiritual gifts.',
      expandedDescription:
        'Life Cycle 11 is a Master Number — one of the highest vibrations in numerology. This life phase is not comfortable by design. It asks for spiritual courage, heightened sensitivity, and a willingness to be a conduit for something larger than the self. People in an 11 Life Cycle often feel like they are living two realities simultaneously — the ordinary world and a deeper knowing beneath it. This is the phase of the visionary, the empath, and the inspired teacher.',
      guidanceText:
        'Trust your intuition and embrace your spiritual gifts. This is one of the most spiritually significant cycles in numerology. Support their deeper calling during this time. They may feel overwhelmed by sensitivity or pulled between the material and the mystical. Grounding practices and patient understanding are the greatest gifts you can offer.',
    },
  ],

  compatibility: {
    overallScore: 77,
    currentYearEnergyText:
      'This year brings the transformative energy of spiritual growth and inner reflection. A time to trust intuition and seek deeper wisdom.',
    lifePath: {
      id: 'lifePath',
      yourNumber: 2,
      theirNumber: 1,
      title: 'Life Path vs Life Path',
      subtitle: 'Natural harmony or friction',
      score: 85,
      description: 'Natural harmony or friction',
      expandedContent:
        'Your Life Path 2 and their Life Path 1 carry a natural resonance — both numbers orient toward the same fundamental questions. There is an ease of understanding here that most pairs never find. The 1\'s independence is something the 2 can genuinely respect, and the 2\'s relational intelligence is something the 1 quietly relies on.',
      lumisAssessment:
        'Natural harmony or friction. This pairing has a deep underlying ease. Understanding these numerical dynamics helps navigate the relationship with greater awareness and compassion for both perspectives.',
    },
    soulUrge: {
      id: 'soulUrge',
      yourNumber: 2,
      theirNumber: 8,
      title: 'Soul Urge vs Soul Urge',
      subtitle: 'Do your needs align',
      score: 74,
      description: 'Do your needs align',
      expandedContent:
        'The tension you feel with them — the sense of not being received, of conversations that leave you carrying more than you brought to them — is written in the numerical contrast. Your Soul Urge 2 craves reciprocity. Their Soul Urge 8 craves mastery. Neither is wrong. But without conscious attention, the 2 gives endlessly and the 8 takes without noticing.',
      lumisAssessment:
        'Do your needs align. The gap between Soul Urge 2 and Soul Urge 8 is real but bridgeable. When both people understand what the other is fundamentally hungry for, acts of care become more precisely targeted and far more effective.',
    },
    compatibilityScore: {
      id: 'overall',
      yourNumber: 77,
      theirNumber: 77,
      title: 'Compatibility Score',
      subtitle: 'Overall numerological match',
      score: 77,
      description: 'Overall numerological match',
      expandedContent:
        'A compatibility score of 77 indicates a strong foundation with natural friction points that promote growth. This relationship has the potential for deep understanding when both parties honor their numerical differences. The tension is not a flaw — it is the mechanism through which both people expand.',
      lumisAssessment:
        'Overall numerological match. 77 is a score of real potential. High enough that the connection feels significant, complex enough that it demands both people show up consciously. This relationship is worth the work.',
    },
  },
};

// ─── Accessor ─────────────────────────────────────────────────────────────────

/**
 * Returns numerology data for a given member.
 * In production this will be replaced by an API call using the member's
 * date of birth, full name, and the authenticated user's own numerology data.
 */
export const getNumerologyDataForMember = (_memberId: string): NumerologyData => {
  // TODO: replace with API call → GET /api/v1/members/:id/numerology
  return mockNumerologyProfile;
};
