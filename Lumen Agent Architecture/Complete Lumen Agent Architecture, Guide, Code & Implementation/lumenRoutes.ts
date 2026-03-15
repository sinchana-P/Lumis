// ═══════════════════════════════════════════════════════════════
// LUMIS AI — API ROUTES (NestJS)
// All endpoints for Lumen, numerology, astrology, compatibility.
//
// INSTALL:
//   npm i @nestjs/common @nestjs/core
//   npm i @google/generative-ai groq-sdk cohere-ai
//   npm i swisseph
//   npm i @supabase/supabase-js
// ═══════════════════════════════════════════════════════════════

import {
  Controller, Post, Get, Body, Param,
  Res, HttpCode, UseGuards, Request as Req
} from "@nestjs/common";
import { Response } from "express";
import { LumenAgent } from "../agents/lumenAgent";
import { AstrologyEngine } from "../astrology/astrologyEngine";
import {
  buildNumerologyProfile, lifePath, expression, soulUrge,
  personality, birthday, maturity, personalYear, personalMonth,
  lifeCycle, pinnacles, challenges, compatibilityScores
} from "../numerology/numerologyEngine";
import { LumenRequest, LumenMode, AnalysisDepth } from "../types";

// ── LUMEN CONTROLLER ─────────────────────────────────────────
@Controller("lumen")
export class LumenController {
  constructor(private lumenAgent: LumenAgent) {}

  /**
   * POST /lumen/ask
   * Standard Lumen chat request
   */
  @Post("ask")
  @HttpCode(200)
  async ask(@Body() body: {
    prompt: string;
    mode: LumenMode;
    depth: AnalysisDepth;
    memberIds: string[];
    history?: { role: "user"|"assistant"; content: string }[];
  }, @Req() req: any) {
    const { userId, members, userProfile } = await this.getUserContext(req.user.id);

    const lumenReq: LumenRequest = {
      userId,
      prompt: body.prompt,
      mode: body.mode || "ANALYSIS",
      depth: body.depth || "FULL_SPECTRUM",
      memberIds: body.memberIds || [],
      history: body.history || [],
    };

    const response = await this.lumenAgent.chat(lumenReq, members, userProfile);

    return {
      text: response.text,
      mode: response.mode,
      model: response.model,
      intent: response.intentDetected,
      latencyMs: response.latencyMs,
    };
  }

  /**
   * POST /lumen/ask/stream
   * Streaming Lumen chat — use for Vent/Guided modes
   * Returns SSE (Server-Sent Events)
   */
  @Post("ask/stream")
  async askStream(@Body() body: {
    prompt: string;
    mode: LumenMode;
    depth: AnalysisDepth;
    memberIds: string[];
    history?: { role: "user"|"assistant"; content: string }[];
  }, @Req() req: any, @Res() res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
      const { userId, members, userProfile } = await this.getUserContext(req.user.id);

      const lumenReq: LumenRequest = {
        userId,
        prompt: body.prompt,
        mode: body.mode || "ANALYSIS",
        depth: body.depth || "FULL_SPECTRUM",
        memberIds: body.memberIds || [],
        history: body.history || [],
      };

      for await (const chunk of this.lumenAgent.chatStream(lumenReq, members, userProfile)) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    } finally {
      res.end();
    }
  }

  /**
   * POST /lumen/self-report
   * Generate user's own Self Intelligence Report
   */
  @Post("self-report")
  @HttpCode(200)
  async selfReport(@Req() req: any) {
    const { user, userProfile } = await this.getUserContext(req.user.id);
    const report = await this.lumenAgent.generateSelfReport(user, userProfile);
    return { report };
  }

  /**
   * POST /lumen/relationship-report/:memberId
   * Generate full relationship intelligence report
   */
  @Post("relationship-report/:memberId")
  @HttpCode(200)
  async relationshipReport(
    @Param("memberId") memberId: string,
    @Body() body: { depth?: AnalysisDepth },
    @Req() req: any
  ) {
    const { user, members, userProfile } = await this.getUserContext(req.user.id);
    const member = members.find(m => m.id === memberId);
    if (!member) throw new Error("Member not found");

    const report = await this.lumenAgent.generateRelationshipReport(
      user, member, userProfile, body.depth || "FULL_SPECTRUM"
    );
    return { report };
  }

  /**
   * POST /lumen/weekly-digest
   * Generate the user's weekly relationship digest
   */
  @Post("weekly-digest")
  @HttpCode(200)
  async weeklyDigest(@Req() req: any) {
    const { user, members, userProfile } = await this.getUserContext(req.user.id);
    const digest = await this.lumenAgent.generateWeeklyDigest(user, members, userProfile);
    return { digest };
  }

  private async getUserContext(userId: string) {
    // TODO: fetch from Supabase
    return { userId, user: {}, members: [], userProfile: {} } as any;
  }
}

// ── NUMEROLOGY CONTROLLER ────────────────────────────────────
@Controller("members/:memberId/numerology")
export class NumerologyController {
  /**
   * GET /members/:memberId/numerology
   * Returns the full numerology profile for a member.
   * Pure calculation — no AI, instant.
   */
  @Get()
  getNumerology(@Param("memberId") memberId: string, @Req() req: any) {
    // TODO: fetch member from DB
    const dob = "1995-08-23";
    const fullName = "Arjun Sharma";

    const profile = buildNumerologyProfile(dob, fullName);
    return {
      memberId,
      numbers: profile.coreNumbers,
      timing: profile.timingNumbers,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * POST /members/:memberId/numerology/generate
   * Generates full numerology profile including AI interpretations.
   * Persists to DB and returns complete payload.
   */
  @Post("generate")
  @HttpCode(200)
  async generateNumerology(@Param("memberId") memberId: string, @Req() req: any) {
    // TODO: fetch member and user from DB, then call lumenAgent.generateMemberProfileData()
    return { message: "Numerology profile generation queued", memberId };
  }
}

// ── ASTROLOGY CONTROLLER ─────────────────────────────────────
@Controller("members/:memberId/astrology")
export class AstrologyController {
  private engine = new AstrologyEngine();

  /**
   * GET /members/:memberId/astrology
   * Returns stored astrology profile
   */
  @Get()
  async getAstrology(@Param("memberId") memberId: string, @Req() req: any) {
    // TODO: fetch from astrology_profiles table
    return { message: "Fetch from astrology_profiles where member_id = memberId" };
  }

  /**
   * POST /members/:memberId/astrology/calculate
   * Recalculates Vedic chart from birth data
   */
  @Post("calculate")
  @HttpCode(200)
  async calculateAstrology(
    @Param("memberId") memberId: string,
    @Body() body: {
      dob: string;
      birthTime: string;
      birthPlace: string;
      lat?: number;
      lon?: number;
      utcOffset?: number;
    }
  ) {
    // Geocode if lat/lon not provided
    let { lat, lon, utcOffset } = body;
    if (!lat || !lon) {
      const geo = await AstrologyEngine.geocode(body.birthPlace);
      lat = geo.lat; lon = geo.lon; utcOffset = geo.utcOffset;
    }

    const computed = await this.engine.calculate({
      dob: body.dob,
      birthTime: body.birthTime,
      lat: lat!,
      lon: lon!,
      utcOffset: utcOffset || 5.5,
    });

    return { memberId, computed };
  }

  /**
   * POST /members/geocode
   * Convert place name to lat/lon + UTC offset
   */
  @Post("/geocode")
  @HttpCode(200)
  async geocode(@Body() body: { place: string }) {
    return AstrologyEngine.geocode(body.place);
  }
}

// ── COMPATIBILITY CONTROLLER ──────────────────────────────────
@Controller("compatibility")
export class CompatibilityController {
  /**
   * POST /compatibility
   * Calculate compatibility between user and a member
   */
  @Post()
  @HttpCode(200)
  async calculate(@Body() body: {
    userDob: string; userName: string;
    memberDob: string; memberName: string;
  }) {
    const scores = compatibilityScores(
      body.userDob, body.memberDob, body.userName, body.memberName
    );
    return {
      scores: {
        lifePath: scores.lifePathScore,
        soulUrge: scores.soulUrgeScore,
        expression: scores.expressionScore,
        yearAlignment: scores.yearAlignmentScore,
        overall: scores.overallScore,
      },
      numbers: scores.numbers,
    };
  }
}

// ── MEMBERS CONTROLLER ────────────────────────────────────────
@Controller("members")
export class MembersController {
  constructor(private lumenAgent: LumenAgent) {}

  /**
   * POST /members
   * Create a new member and trigger profile generation
   */
  @Post()
  @HttpCode(201)
  async createMember(@Body() body: {
    name: string; fullName?: string; relation: string;
    dob: string; birthTime?: string; birthPlace?: string;
  }, @Req() req: any) {
    // TODO: create member in DB, then trigger profile generation
    return { message: "Member created and profile generation queued" };
  }

  /**
   * POST /members/:memberId/generate-profile
   * Trigger (re)generation of numerology + astrology profile
   * Can be called manually or on a schedule
   */
  @Post(":memberId/generate-profile")
  @HttpCode(200)
  async generateProfile(@Param("memberId") memberId: string, @Req() req: any) {
    // TODO: fetch member from DB, run lumenAgent.generateMemberProfileData()
    return { message: "Profile generation triggered", memberId };
  }
}

// ── DATABASE SCHEMA (Supabase SQL) ────────────────────────────
/*

-- ── PROFILES ────────────────────────────────────────────────
CREATE TABLE numerology_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID UNIQUE NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dob_hash TEXT NOT NULL,
  name_hash TEXT NOT NULL,
  core_numbers JSONB NOT NULL,
  timing_numbers JSONB NOT NULL,
  insights JSONB NOT NULL,
  compatibility JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE astrology_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID UNIQUE NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  computed JSONB NOT NULL,
  insights JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI INSIGHTS (cached generated text) ─────────────────────
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  text TEXT NOT NULL,
  model_used TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (member_id, user_id, section)
);

-- ── COMPATIBILITY REPORTS ────────────────────────────────────
CREATE TABLE compatibility_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  numerology_compat JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, member_id)
);

-- ── VECTOR MEMORY (pgvector) ─────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE vector_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1024),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (member_id, source_id)
);

CREATE INDEX ON vector_memory USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Similarity search function
CREATE OR REPLACE FUNCTION search_member_memory(
  p_member_id UUID, p_embedding VECTOR(1024),
  p_top_k INT DEFAULT 5, p_source_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (id UUID, source_type TEXT, source_id TEXT,
               content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE SQL AS $$
  SELECT id, source_type, source_id, content, metadata,
         1 - (embedding <=> p_embedding) AS similarity
  FROM vector_memory
  WHERE member_id = p_member_id
    AND (p_source_types IS NULL OR source_type = ANY(p_source_types))
  ORDER BY embedding <=> p_embedding
  LIMIT p_top_k;
$$;

-- Cache invalidation: regenerate profiles when new data is added
CREATE OR REPLACE FUNCTION invalidate_member_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new incident/interaction/journal is added,
  -- mark the member profile as needing regeneration
  UPDATE members SET profile_outdated = true
  WHERE id = NEW.member_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_incident_insert
AFTER INSERT ON incidents
FOR EACH ROW EXECUTE FUNCTION invalidate_member_cache();

CREATE TRIGGER after_interaction_insert
AFTER INSERT ON interactions
FOR EACH ROW EXECUTE FUNCTION invalidate_member_cache();

CREATE TRIGGER after_journal_insert
AFTER INSERT ON journal_entries
FOR EACH ROW EXECUTE FUNCTION invalidate_member_cache();

*/

// ── .ENV REQUIRED ─────────────────────────────────────────────
/*
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
COHERE_API_KEY=...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
PROKERALA_CLIENT_ID=...          # optional, for Vedic API fallback
PROKERALA_CLIENT_SECRET=...      # optional
TIMEZONEDB_API_KEY=...           # optional, for accurate UTC offsets
*/

// ── INSTALL ───────────────────────────────────────────────────
/*
npm install \
  @nestjs/common @nestjs/core @nestjs/platform-express \
  @google/generative-ai \
  groq-sdk \
  cohere-ai \
  swisseph \
  @supabase/supabase-js \
  crypto-js \
  @nestjs/config
*/
