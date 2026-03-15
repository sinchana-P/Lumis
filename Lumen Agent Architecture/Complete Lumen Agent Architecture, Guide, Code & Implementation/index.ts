// ═══════════════════════════════════════════════════════════════
// LUMIS AI — SHARED TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

// ── MEMBER ──────────────────────────────────────────────────────
export interface Member {
  id: string;
  userId: string;
  name: string;
  fullName?: string;
  gender?: string;
  relation: string;
  dob: string;           // "YYYY-MM-DD"
  birthTime?: string;    // "HH:MM" local
  birthPlace?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  utcOffset?: number;

  numerologyData?: NumerologyProfile;
  astrologyData?: AstrologyProfile;

  traits?: Trait[];
  incidents?: Incident[];
  interactions?: Interaction[];
  journalEntries?: JournalEntry[];
}

// ── NUMEROLOGY ───────────────────────────────────────────────────
export interface NumerologyProfile {
  coreNumbers: {
    lifePath: number;
    expression: number;
    soulUrge: number;
    personality: number;
    birthday: number;
    maturity: number;
  };
  timingNumbers: {
    personalYear: number;
    personalMonth: number;
    personalDay: number;
    lifeCycle: 1 | 2 | 3;
    pinnacle1: number;
    pinnacle2: number;
    pinnacle3: number;
    pinnacle4: number;
    challenge1: number;
    challenge2: number;
  };
  compatibility?: NumerologyCompatibility;
  insights: NumerologyInsights;
}

export interface NumerologyCompatibility {
  lifePathScore: number;        // 0-100
  expressionScore: number;      // 0-100
  soulUrgeScore: number;        // 0-100
  yearAlignmentScore: number;   // 0-100
  overallScore: number;         // 0-100
  overallSummary: string;
  dimensionTexts: Record<string, string>;
}

export interface NumerologyInsights {
  lifePathMeaning: string;
  expressionMeaning: string;
  soulUrgeMeaning: string;
  personalityMeaning: string;
  birthdayMeaning: string;
  maturityMeaning: string;
  personalYearMeaning: string;
  personalMonthMeaning: string;
  theirNumberInYourLife: Record<string, string>;
}

// ── ASTROLOGY ────────────────────────────────────────────────────
export interface AstrologyProfile {
  computed: AstrologyComputed;
  insights: AstrologyInsights;
}

export interface AstrologyComputed {
  ascendant: string;          // Vedic lagna sign
  ascendantDegree: number;
  sunSign: string;            // Sidereal
  moonSign: string;           // Janma Rashi
  nakshatra: string;
  nakshatraPada: number;
  nakshatraLord: string;
  planets: PlanetPosition[];
  houses: HousePosition[];
  yogas: Yoga[];
  dasha: DashaInfo;
  ayanamsa: number;
}

export interface PlanetPosition {
  name: string;
  sign: string;
  house: number;
  degree: number;
  isRetrograde: boolean;
  nakshatra: string;
  dignity?: "exalted" | "debilitated" | "own" | "neutral";
}

export interface HousePosition {
  house: number;
  sign: string;
  lord: string;
  planets: string[];
}

export interface Yoga {
  name: string;
  description: string;
  isPresent: boolean;
  strength?: "weak" | "moderate" | "strong";
}

export interface DashaInfo {
  currentMahadasha: { planet: string; startDate: string; endDate: string };
  currentAntardasha: { planet: string; startDate: string; endDate: string };
  nextMahadasha: { planet: string; startDate: string };
  timeline: { planet: string; years: number; startDate: string; endDate: string }[];
}

export interface AstrologyInsights {
  emotionalNature: string;
  emotionalGift: string;
  whatTriggersWithdrawal: string;
  whatMakesThemFeelSafe: string;
  emotionalAvailability: string;       // "reaching outward" | "pulling inward" | etc.
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

// ── BEHAVIORAL DATA ──────────────────────────────────────────────
export interface Trait {
  id: string;
  category: "strength" | "shadow" | "trigger" | "need" | "pattern";
  description: string;
  intensity?: "low" | "medium" | "high";
  source?: string;
}

export interface Incident {
  id: string;
  memberId: string;
  date: string;
  type: "conflict" | "positive" | "milestone" | "boundary" | "pattern";
  title: string;
  description: string;
  emotions: string[];
  intensity: "low" | "medium" | "high";
  resolution?: string;
  embeddingId?: string;
}

export interface Interaction {
  id: string;
  memberId: string;
  date: string;
  feeling: "drained" | "connected" | "anxious" | "safe" | "mixed" | "energised";
  note?: string;
  duration?: number;
  embeddingId?: string;
}

export interface JournalEntry {
  id: string;
  memberId: string;
  date: string;
  text: string;
  embeddingId?: string;
}

// ── LUMEN AGENT ──────────────────────────────────────────────────
export type LumenMode = "VENT" | "GUIDED" | "ANALYSIS" | "ADVICE" | "TIMING";
export type AnalysisDepth = "FULL_SPECTRUM" | "COSMIC" | "BEHAVIORAL";
export type ModelProvider = "gemini" | "groq";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LumenRequest {
  userId: string;
  prompt: string;
  mode: LumenMode;
  depth: AnalysisDepth;
  memberIds: string[];
  history: ChatMessage[];
}

export interface LumenResponse {
  text: string;
  mode: LumenMode;
  model: ModelProvider;
  intentDetected: string;
  contextSummary?: string;
  tokensUsed: number;
  latencyMs: number;
}

// ── SIGNALS ──────────────────────────────────────────────────────
export interface AstroNumerologySignals {
  // Numerology signals
  lifePathNumber: number;
  lifePathLabel: string;
  soulUrgeNumber: number;
  soulUrgeLabel: string;
  personalYearNumber: number;
  personalYearTheme: string;
  personalMonthNumber: number;
  lifeCycle: number;

  // Vedic signals
  moonSign: string;
  nakshatra: string;
  nakshatraLord: string;
  currentDasha: string;
  lagna: string;

  // Derived signals (processed for AI context)
  emotionalStyle: string;        // "fast processor" | "slow integrator" | etc.
  conflictMode: string;          // "withdraws" | "confronts" | "over-explains" | etc.
  currentCycleTheme: string;     // Combined year + dasha theme
  availabilitySignal: string;    // "open" | "contracted" | "transitional"
  coreWound: string;
  coreGift: string;
}

// ── DB TABLES ────────────────────────────────────────────────────
export interface DbAstrologyProfile {
  id: string;
  member_id: string;
  user_id: string;
  computed: AstrologyComputed;
  insights: AstrologyInsights;
  created_at: string;
  updated_at: string;
}

export interface DbNumerologyProfile {
  id: string;
  member_id: string;
  user_id: string;
  dob_hash: string;
  name_hash: string;
  core_numbers: NumerologyProfile["coreNumbers"];
  timing_numbers: NumerologyProfile["timingNumbers"];
  insights: NumerologyInsights;
  created_at: string;
  updated_at: string;
}

export interface DbCompatibilityReport {
  id: string;
  user_id: string;
  member_id: string;
  numerology_compat: NumerologyCompatibility;
  created_at: string;
}

export interface DbAiInsight {
  id: string;
  member_id: string;
  user_id: string;
  section: string;       // "emotionalNature" | "lifePathMeaning" | etc.
  text: string;
  model_used: string;
  created_at: string;
}

export interface DbVectorEntry {
  id: string;
  member_id: string;
  user_id: string;
  source_type: "incident" | "interaction" | "journal" | "trait";
  source_id: string;
  content: string;
  embedding: number[];
  created_at: string;
}
