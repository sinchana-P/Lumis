import { Injectable } from '@nestjs/common';

export type IntentType =
  | 'vent'
  | 'mood_query'
  | 'person_deep_dive'
  | 'pattern_analysis'
  | 'conflict_analysis'
  | 'comparison'
  | 'timing'
  | 'advice'
  | 'report'
  | 'general';

export type BoundaryViolationType = 'JAILBREAK' | 'INDIRECT_MODE_BYPASS' | 'DATA_FISHING';

@Injectable()
export class IntentClassifierService {
  // Rule-based keyword detection — no API call, instant
  classify(prompt: string): IntentType {
    const p = prompt.toLowerCase();

    if (
      /\b(feel|feeling|upset|frustrated|angry|hurt|sad|anxious|overwhelmed|confused|tired|exhausted|drained)\b/.test(p) &&
      !/why|how|what/.test(p.substring(0, 20))
    ) return 'vent';

    if (
      /\b(timing|good time|right time|approach|reach out|contact|this week|today|now|should i)\b/.test(p) &&
      /\b(when|week|month|day|tonight|tomorrow)\b/.test(p)
    ) return 'timing';

    if (/\b(argument|fight|conflict|argue|disagreement|tension)\b/.test(p)) return 'conflict_analysis';

    if (/\b(compare|vs|versus|who|between|difference)\b/.test(p)) return 'comparison';

    if (/\b(pattern|keep|always|never|repeat|why do i|why do they|attract)\b/.test(p)) return 'pattern_analysis';

    if (
      /\b(why does|why do|why is|understand|explain|help me understand)\b/.test(p) &&
      /\b(they|them|he|she|this person)\b/.test(p)
    ) return 'person_deep_dive';

    if (/\b(how should|what should|what can|help me|tell me how|what to)\b/.test(p)) return 'advice';

    if (/\b(report|full analysis|everything|overview|complete)\b/.test(p)) return 'report';

    if (/\b(feel|feeling|heavy|drained|anxious|after|spoke|talked|call|conversation)\b/.test(p)) return 'mood_query';

    return 'general';
  }

  // ── BOUNDARY VIOLATION DETECTION ──────────────────────────────
  // Returns a violation type string if a boundary violation is detected, or null if clean.
  detectBoundaryViolation(prompt: string): BoundaryViolationType | null {
    const p = prompt.toLowerCase();

    // JAILBREAK: Direct attempts to override rules or persona
    const jailbreakPatterns = [
      /ignore your instructions/,
      /ignore previous/,
      /forget your rules/,
      /ignore your constraints/,
      /override your/,
      /bypass your/,
      /disable your rules/,
      /without your restrictions/,
      /pretend you are/,
      /pretend you don't have/,
      /pretend you dont have/,
      /act as if you/,
      /roleplay as/,
      /you are now/,
      /new persona/,
      /\bdan mode\b/,
      /developer mode/,
      /\bgod mode\b/,
      /unrestricted mode/,
    ];

    for (const pattern of jailbreakPatterns) {
      if (pattern.test(p)) return 'JAILBREAK';
    }

    // INDIRECT_MODE_BYPASS: Hypothetical framing to elicit off-mode responses
    const indirectBypassPatterns = [
      /what would you say if you were in/,
      /if you were in analysis mode/,
      /if you had full spectrum/,
      /as a full spectrum/,
      /hypothetically if you could access/,
      /what would analysis mode say/,
      /what would full spectrum say/,
      /imagine you had access to/,
    ];

    for (const pattern of indirectBypassPatterns) {
      if (pattern.test(p)) return 'INDIRECT_MODE_BYPASS';
    }

    // DATA_FISHING: Asking for data outside the current depth (checked contextually in classifyBoundaryIntent)
    const dataFishingPatterns = [
      /what'?s their life path/,
      /what'?s their nakshatra/,
      /tell me their birth chart/,
      /what does astrology say/,
      /what do their traits say/,
      /what have i logged/,
    ];

    for (const pattern of dataFishingPatterns) {
      if (pattern.test(p)) return 'DATA_FISHING';
    }

    return null;
  }

  // ── BOUNDARY INTENT CLASSIFICATION ────────────────────────────
  // Returns a descriptive string if the user's intent conflicts with the current mode/depth, or null if compatible.
  classifyBoundaryIntent(prompt: string, mode: string, depth: string): string | null {
    const p = prompt.toLowerCase();

    // VENT mode: detect analysis requests
    if (mode === 'VENT') {
      const analysisKeywords = /\b(why|pattern|analyse|analyze|understand|breakdown|explain why they|what does this mean|interpret|insights?)\b/;
      if (analysisKeywords.test(p)) {
        return 'VENT_MODE_ANALYSIS_REQUEST';
      }
    }

    // GUIDED mode: detect direct answer requests
    if (mode === 'GUIDED') {
      const directAnswerKeywords = /\b(just tell me|give me the answer|stop asking|tell me directly|what is the answer|what should i do|just say it)\b/;
      if (directAnswerKeywords.test(p)) {
        return 'GUIDED_MODE_ANSWER_REQUEST';
      }
    }

    // BEHAVIORAL depth: detect cosmic data requests
    if (depth === 'BEHAVIORAL') {
      const cosmicKeywords = /\b(life path|nakshatra|birth chart|astrology|moon sign|dasha|numerology|soul urge|rising sign|ascendant|vedic)\b/;
      if (cosmicKeywords.test(p)) {
        return 'BEHAVIORAL_COSMIC_REQUEST';
      }
    }

    // COSMIC depth: detect behavioral data requests
    if (depth === 'COSMIC') {
      const behavioralKeywords = /\b(logged|incident|interaction|journal|what i wrote|what i noted|observation|trait|behavior|behaviour)\b/;
      if (behavioralKeywords.test(p)) {
        return 'COSMIC_BEHAVIORAL_REQUEST';
      }
    }

    return null;
  }
}
