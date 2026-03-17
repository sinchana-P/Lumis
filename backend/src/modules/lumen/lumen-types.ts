import { AstrologyComputed } from '../astrology/astrology-engine.service';
import { AstrologyInsights } from '../astrology/astrology-interpreter.service';
import { NumerologyCoreNumbers, NumerologyTimingNumbers } from '../numerology/numerology-engine.service';
import { NumerologyInsights, NumerologyCompatibility } from '../numerology/numerology-interpreter.service';

export type LumenMode = 'VENT' | 'GUIDED' | 'ANALYSIS' | 'ADVICE' | 'TIMING';
export type AnalysisDepth = 'FULL_SPECTRUM' | 'COSMIC' | 'BEHAVIORAL';
export type ModelProvider = 'gemini' | 'groq';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LumenRequest {
  userId: string;
  prompt: string;
  mode: LumenMode;
  depth: AnalysisDepth;
  memberIds: string[];
  history: ChatMessage[];
  conversationId?: string;
}

export interface LumenResponse {
  text: string;
  mode: LumenMode;
  model: ModelProvider;
  intentDetected: string;
  contextSummary?: string;
  tokensUsed: number;
  latencyMs: number;
  conversationId?: string;
}

export interface AstroNumerologySignals {
  lifePathNumber: number;
  lifePathLabel: string;
  soulUrgeNumber: number;
  soulUrgeLabel: string;
  personalYearNumber: number;
  personalYearTheme: string;
  personalMonthNumber: number;
  lifeCycle: number;
  moonSign: string;
  nakshatra: string;
  nakshatraLord: string;
  currentDasha: string;
  lagna: string;
  emotionalStyle: string;
  conflictMode: string;
  currentCycleTheme: string;
  availabilitySignal: string;
  coreWound: string;
  coreGift: string;
}

// Minimal member shape for Lumen context building
export interface LumenMember {
  id: string;
  userId: string;
  name: string;
  fullName?: string;
  relation: string;
  dob: string;
  birthTime?: string;
  birthPlace?: string;
  lat?: number;
  lon?: number;
  utcOffset?: number;
  numerologyData?: {
    coreNumbers: NumerologyCoreNumbers;
    timingNumbers: NumerologyTimingNumbers;
    insights: NumerologyInsights;
    compatibility?: NumerologyCompatibility;
  };
  astrologyData?: {
    computed: AstrologyComputed;
    insights: AstrologyInsights;
  };
  traits?: { id: string; category: string; description: string; intensity?: string }[];
  incidents?: { id: string; date: string; type: string; title: string; description: string; emotions: string[]; intensity: string; resolution?: string }[];
  interactions?: { id: string; date: string; feeling: string; note?: string; duration?: number }[];
  journalEntries?: { id: string; date: string; text: string }[];
}

export interface LumenUserProfile {
  id: string;
  name: string;
  fullName?: string;
  dob?: string;
  numerologyData?: {
    coreNumbers: NumerologyCoreNumbers;
    timingNumbers: NumerologyTimingNumbers;
  };
  astrologyData?: {
    computed: AstrologyComputed;
  };
  traits?: { id: string; category: string; description: string }[];
}
