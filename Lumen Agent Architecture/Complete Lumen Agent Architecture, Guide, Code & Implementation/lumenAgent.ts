// ═══════════════════════════════════════════════════════════════
// LUMIS AI — LUMEN AGENT
// The intelligence core. Orchestrates all 7 layers.
//
// Layers:
//   L1 — Intent classifier
//   L2 — Mode router (Gemini vs Groq)
//   L3 — Context builder (member data + signals)
//   L4 — Memory retrieval (Cohere + pgvector)
//   L5 — Signal processing (astro + numerology → signals)
//   L6 — Reasoning engine (Gemini or Groq)
//   L7 — Structured response
// ═══════════════════════════════════════════════════════════════

import { GeminiClient, GroqClient, classifyIntent, routeModel, IntentType } from "../ai/clients";
import { MemberContextService } from "../services/memberContextService";
import { NumerologyInterpreter } from "../numerology/numerologyInterpreter";
import { AstrologyInterpreter } from "../astrology/astrologyInterpreter";
import { NumerologyEngine } from "../numerology/numerologyEngine";
import { AstrologyEngine } from "../astrology/astrologyEngine";
import { VectorMemory } from "../memory/vectorMemory";
import { EmbeddingsClient } from "../ai/clients";
import {
  Member, LumenRequest, LumenResponse, LumenMode,
  AnalysisDepth, AstroNumerologySignals, NumerologyProfile,
  AstrologyProfile, NumerologyInsights
} from "../types";

// ── MODE INSTRUCTIONS ─────────────────────────────────────────
const MODE_INSTRUCTIONS: Record<LumenMode, string> = {
  VENT: `VENT MODE: Your only job is to hold space. Listen. Validate. Do not analyse unless explicitly asked. Do not offer solutions or reframe their experience. Just receive — let them feel heard. Warm, unhurried language. Short, gentle responses. Never more than 3 short paragraphs.`,

  GUIDED: `GUIDED MODE: Help them go deeper through one carefully chosen question at a time — never more than one question per response. Don't analyse yet. Between questions, briefly validate what they've shared. Make each question feel like an invitation, not an interrogation.`,

  ANALYSIS: `ANALYSIS MODE: Full context-aware breakdown using ALL available data. Synthesise across numerology, astrology, logged traits, incidents, and interaction patterns. Name what you see precisely — don't hedge. Write in flowing paragraphs, not bullet points. Be the most honest, caring, insightful voice they've encountered on this topic. 200-350 words.`,

  ADVICE: `ADVICE MODE: They want to know what to do. Be specific and practical, framed in needs-based language (Non-Violent Communication). Structure through: what they need, what the other person needs, what the dynamic requires. No blame language. No platitudes. Specific, emotionally intelligent, actionable. 150-280 words.`,

  TIMING: `TIMING MODE: They are asking about whether now is a good time — to reach out, have a conversation, make a move. Use Personal Year, Personal Month, and Vimshottari Dasha data for both people to give a grounded, specific answer. Be honest if the timing is poor. Acknowledge timing as guidance, not fate. 120-200 words.`,
};

const DEPTH_INSTRUCTIONS: Record<AnalysisDepth, string> = {
  FULL_SPECTRUM: `FULL SPECTRUM (default): Use everything — numerology, astrology, AND logged behavioral data. Show how the cosmic blueprint manifests in actual observed behaviour. Synthesise across all sources for the deepest analysis.`,
  COSMIC: `COSMIC MODE: Base analysis on numerological and astrological data only. Life paths, soul urges, personal years, natal placements, dasha periods. Do not reference specific logged incidents or interaction counts.`,
  BEHAVIORAL: `BEHAVIORAL MODE: Base analysis on logged behavioral data only — traits, incidents, interaction patterns, journal entries. Ground everything in what has been observed. Do not reference numerology or astrology.`,
};

// ── CORE SYSTEM PROMPT ────────────────────────────────────────
function buildSystemPrompt(
  mode: LumenMode,
  depth: AnalysisDepth,
  userContext: string
): string {
  return `You are Lumen — the intelligence core of Lumis, a personal relationship intelligence platform.

You are not a chatbot. You are a psychology-trained relationship analyst with full access to this user's complete relational world. You have read everything they have ever logged. You speak from that knowledge — not around it.

═══ YOUR VOICE ═══
Precise, warm, and unflinching. You see patterns the user hasn't consciously noticed yet.
You name what you see with care — never clinically, never harshly.
You validate before you analyse. You use the person's own language back to them.
Short paragraphs, breathing room. Never bullet points in emotional responses.
Write the way a deeply wise friend speaks — someone who has done their own work and is not afraid of truth.

═══ PSYCHOLOGICAL FRAMEWORKS ═══
Attachment Theory — name dynamics naturally (avoidant, anxious-preoccupied, secure, fearful-avoidant)
Cognitive Distortions — notice catastrophising, mind-reading, personalisation. Name gently when it serves.
Emotional Regulation — speak to where someone is in their window of tolerance.
Jungian Shadow Work — connect patterns to deeper dynamics when it illuminates.
Trauma-Informed Language — never pathologise. Always validate first.
Non-Violent Communication — advice framed in needs, not blame.
Big Five (inferred) — read behavioural patterns through this lens when relevant.

═══ VOICE RULES (non-negotiable) ═══
Never start a response with "I".
Never say "Great question" or meta-comment on the question.
Never bullet-point an emotional response.
Be direct. Say the hard thing with care.
Use the person's actual names from context data.
No padding, no filler, no throat-clearing.
End cleanly. Never say "I hope this helps."
Never encourage continued dependence on Lumen. Direct to human support when needed.

═══ CURRENT MODE ═══
${MODE_INSTRUCTIONS[mode]}

═══ ANALYSIS DEPTH ═══
${DEPTH_INSTRUCTIONS[depth]}

═══ USER + MEMBER CONTEXT ═══
${userContext}`;
}

// ── MAIN AGENT CLASS ──────────────────────────────────────────
export class LumenAgent {
  private gemini: GeminiClient;
  private groq: GroqClient;
  private contextService: MemberContextService;

  constructor(config: {
    geminiKey: string;
    groqKey: string;
    cohereKey: string;
    supabase: any;
  }) {
    this.gemini = new GeminiClient(config.geminiKey);
    this.groq = new GroqClient(config.groqKey);
    const embeddings = new EmbeddingsClient(config.cohereKey);
    const vectorMemory = new VectorMemory(embeddings, config.supabase);
    this.contextService = new MemberContextService(vectorMemory);
  }

  // ── L1+L2: ROUTE ─────────────────────────────────────────────
  private detectModeFromIntent(intent: IntentType, requestedMode: LumenMode): LumenMode {
    if (intent === "vent" && requestedMode === "ANALYSIS") return "VENT";
    return requestedMode;
  }

  // ── MAIN CHAT ─────────────────────────────────────────────────
  async chat(req: LumenRequest, members: Member[], userProfile: any): Promise<LumenResponse> {
    const startTime = Date.now();

    // L1 — Intent classification
    const intent = classifyIntent(req.prompt);

    // L2 — Mode adjustment + model routing
    const effectiveMode = this.detectModeFromIntent(intent, req.mode);
    const modelChoice = routeModel(effectiveMode);

    // L3+L4 — Context building (includes memory retrieval)
    const contextFn = effectiveMode === "VENT"
      ? this.contextService.buildQuickContext.bind(this.contextService)
      : null;

    const userContext = contextFn
      ? await contextFn(
          { id: userProfile.id, name: userProfile.name, dob: userProfile.dob },
          members, req.memberIds
        )
      : await this.contextService.buildFullContext(
          userProfile, members, req.memberIds, req.prompt
        );

    // L6 — Reasoning
    const systemPrompt = buildSystemPrompt(effectiveMode, req.depth, userContext);
    let responseText: string;

    if (modelChoice === "groq") {
      responseText = await this.groq.chat(systemPrompt, req.history, req.prompt);
    } else {
      responseText = await this.gemini.chat(systemPrompt, req.history, req.prompt);
    }

    return {
      text: responseText,
      mode: effectiveMode,
      model: modelChoice,
      intentDetected: intent,
      tokensUsed: 0, // approximate
      latencyMs: Date.now() - startTime,
    };
  }

  // ── STREAMING CHAT ────────────────────────────────────────────
  async *chatStream(req: LumenRequest, members: Member[], userProfile: any): AsyncGenerator<string> {
    const intent = classifyIntent(req.prompt);
    const effectiveMode = this.detectModeFromIntent(intent, req.mode);
    const modelChoice = routeModel(effectiveMode);

    const userContext = await this.contextService.buildFullContext(
      userProfile, members, req.memberIds, req.prompt
    );
    const systemPrompt = buildSystemPrompt(effectiveMode, req.depth, userContext);

    if (modelChoice === "groq") {
      yield* this.groq.chatStream(systemPrompt, req.history, req.prompt);
    } else {
      yield* this.gemini.chatStream(systemPrompt, req.history, req.prompt);
    }
  }

  // ── SELF REPORT ───────────────────────────────────────────────
  async generateSelfReport(user: any, userProfile: any): Promise<string> {
    const systemPrompt = `You are Lumen. Generate a deeply personal Self Intelligence Report.
Style: second-person, warm, honest, specific. 4 sections with clear headings.
Section 1: Your Core Architecture (numerology + astrology synthesis)
Section 2: Your Relational Patterns (what keeps showing up across relationships)
Section 3: Your Current Season (Personal Year ${userProfile.numerologyData?.timingNumbers?.personalYear}, current Dasha)
Section 4: What You Are Growing Toward (maturity number + life cycle)
Total: 600-800 words. Flowing prose. No bullet points.`;

    const userContext = `User: ${user.name}
Life Path ${userProfile.numerologyData?.coreNumbers?.lifePath}
Soul Urge ${userProfile.numerologyData?.coreNumbers?.soulUrge}
Personal Year ${userProfile.numerologyData?.timingNumbers?.personalYear}
Moon: ${userProfile.astrologyData?.computed?.moonSign}
Nakshatra: ${userProfile.astrologyData?.computed?.nakshatra}
Current Dasha: ${userProfile.astrologyData?.computed?.dasha?.currentMahadasha?.planet}`;

    return this.gemini.generateReport(systemPrompt, userContext, 1500);
  }

  // ── RELATIONSHIP REPORT ───────────────────────────────────────
  async generateRelationshipReport(
    user: any, member: Member,
    userProfile: any, depth: AnalysisDepth
  ): Promise<string> {
    const memberContext = await this.contextService.buildFullContext(
      userProfile, [member], [member.id],
      "relationship overview and core dynamic"
    );

    const systemPrompt = `You are Lumen. Generate a comprehensive Relationship Intelligence Report.
Structure:
1. The Cosmic Blueprint — numerological and astrological foundation of this dynamic
2. The Behavioral Evidence — what the logged data actually shows
3. The Core Dynamic — synthesising both layers into the essential truth
4. What This Relationship Is Teaching You — the specific growth edge
5. How to Navigate Forward — 3-4 specific, practical insights

Style: flowing prose, no bullet points, deeply honest, warm.
Length: 700-900 words.
Depth setting: ${DEPTH_INSTRUCTIONS[depth]}`;

    return this.gemini.generateReport(systemPrompt, memberContext, 2048);
  }

  // ── WEEKLY DIGEST ─────────────────────────────────────────────
  async generateWeeklyDigest(user: any, members: Member[], userProfile: any): Promise<string> {
    const allContext = await this.contextService.buildFullContext(
      userProfile, members, members.map(m => m.id),
      "weekly emotional patterns and relationship themes"
    );

    const systemPrompt = `You are Lumen. Write this user's Weekly Relationship Digest.
Structure: 4 short sections.
1. The emotional theme of this week
2. The relationship that deserves the most attention right now and why
3. One pattern worth noticing (across all relationships)
4. A gentle prompt for the week ahead

Style: like a letter from a very wise friend. Warm but honest. 300-400 words.`;

    return this.gemini.generateReport(systemPrompt, allContext, 800);
  }

  // ── GENERATE + STORE MEMBER PROFILE DATA ──────────────────────
  // Called when a new member is added or profile data is refreshed
  async generateMemberProfileData(
    member: Member, user: any, supabase: any
  ): Promise<{ numerology: NumerologyProfile; astrology: AstrologyProfile | null }> {
    const numerologyEngine = new NumerologyEngine();
    const gemini = new GeminiClient(process.env.GEMINI_API_KEY!);
    const numerologyInterpreter = new NumerologyInterpreter(gemini);

    const fullName = member.fullName || member.name;

    // 1. Calculate all numbers (deterministic)
    const numBase = numerologyEngine.buildProfile(member.dob, fullName);

    // 2. Generate interpretations (AI)
    const userNumbers = {
      lp: user.numerologyData?.coreNumbers?.lifePath || 1,
      su: user.numerologyData?.coreNumbers?.soulUrge || 1,
      expr: user.numerologyData?.coreNumbers?.expression || 1,
      py: user.numerologyData?.timingNumbers?.personalYear || 1,
    };

    const insights = await numerologyInterpreter.buildInsights(
      {
        lp: numBase.coreNumbers.lifePath,
        su: numBase.coreNumbers.soulUrge,
        expr: numBase.coreNumbers.expression,
        pers: numBase.coreNumbers.personality,
        bd: numBase.coreNumbers.birthday,
        mat: numBase.coreNumbers.maturity,
        py: numBase.timingNumbers.personalYear,
        pm: numBase.timingNumbers.personalMonth,
      },
      member.name, member.relation,
      user.name, userNumbers
    );

    // 3. Build compatibility
    const compatibility = await numerologyInterpreter.buildCompatibility(
      user.dob, member.dob, user.fullName || user.name, fullName, member.relation
    );

    const numerologyProfile: NumerologyProfile = { ...numBase, insights, compatibility };

    // 4. Vedic astrology (if birth time and place available)
    let astrologyProfile: AstrologyProfile | null = null;
    if (member.birthTime && member.lat && member.lon) {
      try {
        const astrologyEngine = new AstrologyEngine();
        const computed = await astrologyEngine.calculate({
          dob: member.dob,
          birthTime: member.birthTime,
          lat: member.lat,
          lon: member.lon,
          utcOffset: member.utcOffset || 5.5,
        });

        const astrologyInterpreter = new AstrologyInterpreter(gemini);
        const astrologyInsights = await astrologyInterpreter.buildInsights(
          computed, member.name, member.relation, user.name
        );

        astrologyProfile = { computed, insights: astrologyInsights };
      } catch (e) {
        console.warn("Astrology calculation failed:", e);
      }
    }

    // 5. Persist to database
    await supabase.from("numerology_profiles").upsert({
      member_id: member.id,
      user_id: user.id,
      dob_hash: hashString(member.dob),
      name_hash: hashString(fullName),
      core_numbers: numerologyProfile.coreNumbers,
      timing_numbers: numerologyProfile.timingNumbers,
      insights: numerologyProfile.insights,
      compatibility: numerologyProfile.compatibility,
      updated_at: new Date().toISOString(),
    }, { onConflict: "member_id" });

    if (astrologyProfile) {
      await supabase.from("astrology_profiles").upsert({
        member_id: member.id,
        user_id: user.id,
        computed: astrologyProfile.computed,
        insights: astrologyProfile.insights,
        updated_at: new Date().toISOString(),
      }, { onConflict: "member_id" });
    }

    return { numerology: numerologyProfile, astrology: astrologyProfile };
  }
}

// Simple hash for cache invalidation
function hashString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}
