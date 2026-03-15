// ═══════════════════════════════════════════════════════════════
// LUMIS AI — MEMBER CONTEXT SERVICE
// Assembles everything Lumen needs to reason about a member.
// This is the L3 + L5 layer: Context Builder + Signal Processing.
// ═══════════════════════════════════════════════════════════════

import { Member, AstroNumerologySignals } from "../types";
import { VectorMemory } from "../memory/vectorMemory";
import {
  lifePath, soulUrge, expression, personality, personalYear,
  personalMonth, lifeCycle, LIFE_PATH_LABELS, SOUL_URGE_LABELS,
  PERSONAL_YEAR_THEMES, DASHA_PLANET_THEMES
} from "../numerology/numerologyEngine";
import { MOON_SIGN_EMOTIONAL } from "../astrology/astrologyInterpreter";
import { NAKSHATRAS } from "../astrology/astrologyEngine";

// ── SIGNAL PROCESSING ────────────────────────────────────────
// Converts raw chart data into clean, AI-readable signals.
// This is what gets injected into every Lumen prompt.

function deriveEmotionalStyle(moonSign: string, nakshatra: string): string {
  const fastProcessors = ["Mesha","Mithuna","Simha","Dhanu","Kumbha"];
  const slowProcessors = ["Vrishabha","Karkata","Kanya","Makara","Meena"];
  const moon = moonSign.split(" ")[0];

  if (fastProcessors.includes(moon)) return "fast processor — feels, reacts, moves on";
  if (slowProcessors.includes(moon)) return "slow integrator — needs time before they can open";
  return "moderate processor — context-dependent";
}

function deriveConflictMode(moonSign: string, marsHouse: number): string {
  const moon = moonSign.split(" ")[0];
  const withdrawers = ["Karkata","Vrischika","Meena","Vrishabha","Makara"];
  const confronters = ["Mesha","Simha","Vrischika"];

  if (withdrawers.includes(moon) || marsHouse === 12) return "withdraws inward under pressure";
  if (confronters.includes(moon) || marsHouse === 1) return "confronts directly, processes out loud";
  if (moon === "Mithuna" || moon === "Kanya") return "over-explains and intellectualises under stress";
  return "complex conflict response — context-dependent";
}

function deriveCoreWound(lp: number): string {
  const wounds: Record<number, string> = {
    1:"invisibility as a leader, being made to follow",
    2:"not being received, invisible despite constant giving",
    3:"creative self suppressed, never celebrated authentically",
    4:"instability, groundlessness, unreliability from others",
    5:"containment, loss of freedom, being trapped",
    6:"being unloved when no longer useful",
    7:"being misunderstood, having depth dismissed",
    8:"powerlessness, failure, not achieving what they came for",
    9:"being loved only for what they give",
    11:"overwhelm from sensitivity, not being understood",
    22:"potential wasted, never building what they envisioned",
  };
  return wounds[lp] || "deep fear of being unseen for who they truly are";
}

function deriveCoreGift(lp: number): string {
  const gifts: Record<number, string> = {
    1:"the courage to begin things others won't",
    2:"the ability to make people feel completely seen",
    3:"infectious creative energy and joy",
    4:"reliability — the rarest form of love",
    5:"aliveness, the ability to make anything feel possible",
    6:"unconditional nurturing presence",
    7:"perception that cuts beneath every surface",
    8:"the authority to lead transformation at scale",
    9:"love large enough to hold both grief and joy",
    11:"illumination — lighting something up in others just by being near",
    22:"the capacity to build what the world needs",
  };
  return gifts[lp] || "a rare quality of presence that changes the room";
}

export function buildSignals(member: Member): AstroNumerologySignals {
  const yr = new Date().getFullYear();
  const mo = new Date().getMonth() + 1;
  const fullName = member.fullName || member.name;

  // Numerology
  const lp = lifePath(member.dob);
  const su = soulUrge(fullName);
  const pyNum = personalYear(member.dob, yr);
  const pmNum = personalMonth(member.dob, yr, mo);
  const lc = lifeCycle(member.dob);

  // Astrology (from stored computed data)
  const moonSign = member.astrologyData?.computed.moonSign || "Unknown";
  const nakshatra = member.astrologyData?.computed.nakshatra || "Unknown";
  const nakshatraLord = member.astrologyData?.computed.nakshatraLord || "Unknown";
  const currentDasha = member.astrologyData?.computed.dasha.currentMahadasha.planet || "Unknown";
  const currentAntardasha = member.astrologyData?.computed.dasha.currentAntardasha.planet || "Unknown";
  const lagna = member.astrologyData?.computed.ascendant || "Unknown";
  const marsHouse = member.astrologyData?.computed.planets.find(p => p.name === "Mars")?.house || 0;

  // Derived signals
  const emotionalStyle = deriveEmotionalStyle(moonSign, nakshatra);
  const conflictMode = deriveConflictMode(moonSign, marsHouse);
  const dashaTheme = DASHA_PLANET_THEMES[currentDasha] || "general life themes";
  const currentCycleTheme = `${PERSONAL_YEAR_THEMES[pyNum] || "personal growth"} — ${dashaTheme}`;
  const availabilitySignal = ["Jupiter","Venus","Moon"].includes(currentDasha) ? "open" :
    ["Saturn","Rahu","Ketu"].includes(currentDasha) ? "contracted" : "transitional";

  return {
    lifePathNumber: lp,
    lifePathLabel: LIFE_PATH_LABELS[lp] || "",
    soulUrgeNumber: su,
    soulUrgeLabel: SOUL_URGE_LABELS[su] || "",
    personalYearNumber: pyNum,
    personalYearTheme: PERSONAL_YEAR_THEMES[pyNum] || "",
    personalMonthNumber: pmNum,
    lifeCycle: lc,
    moonSign,
    nakshatra,
    nakshatraLord,
    currentDasha,
    lagna,
    emotionalStyle,
    conflictMode,
    currentCycleTheme,
    availabilitySignal,
    coreWound: deriveCoreWound(lp),
    coreGift: deriveCoreGift(lp),
  };
}

// ── CONTEXT TEXT BUILDERS ─────────────────────────────────────
function buildMemberContextText(member: Member, signals: AstroNumerologySignals): string {
  let ctx = `\n══ ${member.name} (${member.relation}) ══\n`;

  // Numerology signals
  ctx += `Numerology:\n`;
  ctx += `  Life Path ${signals.lifePathNumber} — ${signals.lifePathLabel}\n`;
  ctx += `  Soul Urge ${signals.soulUrgeNumber} — ${signals.soulUrgeLabel}\n`;
  ctx += `  Personal Year ${signals.personalYearNumber} (${signals.personalYearTheme})\n`;
  ctx += `  Personal Month ${signals.personalMonthNumber}\n`;
  ctx += `  Life Cycle: ${signals.lifeCycle === 1 ? "First (Forming)" : signals.lifeCycle === 2 ? "Second (Building)" : "Third (Distilling)"}\n`;

  // Astrology signals
  ctx += `Vedic Astrology:\n`;
  ctx += `  Moon: ${signals.moonSign} — Nakshatra: ${signals.nakshatra} (lord: ${signals.nakshatraLord})\n`;
  ctx += `  Lagna: ${signals.lagna}\n`;
  ctx += `  Current Dasha: ${signals.currentDasha}\n`;

  // Derived signals
  ctx += `Derived Signals:\n`;
  ctx += `  Emotional style: ${signals.emotionalStyle}\n`;
  ctx += `  Conflict mode: ${signals.conflictMode}\n`;
  ctx += `  Current cycle theme: ${signals.currentCycleTheme}\n`;
  ctx += `  Availability: ${signals.availabilitySignal}\n`;
  ctx += `  Core wound: ${signals.coreWound}\n`;
  ctx += `  Core gift: ${signals.coreGift}\n`;

  // Logged traits
  if (member.traits?.length) {
    const strengths = member.traits.filter(t => t.category === "strength").map(t => t.description);
    const shadows = member.traits.filter(t => t.category === "shadow").map(t => t.description);
    const needs = member.traits.filter(t => t.category === "need").map(t => t.description);
    const triggers = member.traits.filter(t => t.category === "trigger").map(t => t.description);

    if (strengths.length) ctx += `Strengths: ${strengths.join(", ")}\n`;
    if (shadows.length) ctx += `Shadows: ${shadows.join(", ")}\n`;
    if (needs.length) ctx += `Core Needs: ${needs.join(", ")}\n`;
    if (triggers.length) ctx += `Triggers: ${triggers.join(", ")}\n`;
  }

  // Recent interactions summary
  if (member.interactions?.length) {
    const recent = member.interactions.slice(0, 5);
    const drain = recent.filter(i => i.feeling === "drained").length;
    const connect = recent.filter(i => ["connected","safe","energised"].includes(i.feeling)).length;
    ctx += `Recent interactions (last ${recent.length}): ${connect} energising, ${drain} draining\n`;
    const lastNote = recent[0]?.note;
    if (lastNote) ctx += `Last interaction note: "${lastNote}"\n`;
  }

  // Most recent journal signal
  if (member.journalEntries?.length) {
    ctx += `Latest journal: "${member.journalEntries[0].text.substring(0, 200)}..."\n`;
  }

  return ctx;
}

function buildUserContextText(user: { name: string; dob: string; fullName?: string; traits?: Member["traits"]; }, signals: AstroNumerologySignals): string {
  let ctx = `\n══ USER: ${user.name} ══\n`;
  ctx += `Life Path ${signals.lifePathNumber} (${signals.lifePathLabel})\n`;
  ctx += `Soul Urge ${signals.soulUrgeNumber} — ${signals.soulUrgeLabel}\n`;
  ctx += `Personal Year ${signals.personalYearNumber} (${signals.personalYearTheme})\n`;
  ctx += `Moon: ${signals.moonSign}, Nakshatra: ${signals.nakshatra}\n`;
  ctx += `Emotional style: ${signals.emotionalStyle}\n`;
  ctx += `Core wound: ${signals.coreWound}\n`;
  ctx += `Core gift: ${signals.coreGift}\n`;

  if (user.traits?.length) {
    const needs = user.traits.filter(t => t.category === "need").map(t => t.description);
    const triggers = user.traits.filter(t => t.category === "trigger").map(t => t.description);
    const patterns = user.traits.filter(t => t.category === "pattern").map(t => t.description);
    if (needs.length) ctx += `Needs: ${needs.join(", ")}\n`;
    if (triggers.length) ctx += `Triggers: ${triggers.join(", ")}\n`;
    if (patterns.length) ctx += `Patterns: ${patterns.join(", ")}\n`;
  }

  return ctx;
}

// ── MAIN CONTEXT SERVICE ─────────────────────────────────────
export class MemberContextService {
  constructor(private vectorMemory: VectorMemory) {}

  // Build full context for Lumen's system prompt
  async buildFullContext(
    user: { id: string; name: string; dob: string; fullName?: string; traits?: Member["traits"]; astrologyData?: Member["astrologyData"] },
    members: Member[],
    selectedMemberIds: string[],
    query: string
  ): Promise<string> {
    // User signals
    const userMemberLike = { ...user, relation: "self", id: user.id } as unknown as Member;
    const userSignals = buildSignals(userMemberLike);
    let ctx = buildUserContextText(user, userSignals);

    // Selected members + memory retrieval
    const selectedMembers = members.filter(m => selectedMemberIds.includes(m.id));
    if (selectedMembers.length) {
      ctx += "\n══ MEMBERS IN CONTEXT ══\n";
      for (const member of selectedMembers) {
        const signals = buildSignals(member);
        ctx += buildMemberContextText(member, signals);

        // Retrieve relevant memories for this query
        try {
          const memories = await this.vectorMemory.buildContextString(member.id, query);
          if (memories && !memories.includes("No specific")) {
            ctx += `\nRelevant memories for query:\n${memories}\n`;
          }
        } catch {
          // Memory retrieval failure is non-fatal
        }
      }
    }

    return ctx;
  }

  // Compact context for quick/vent mode (less tokens)
  async buildQuickContext(
    user: { id: string; name: string; dob: string },
    members: Member[],
    selectedMemberIds: string[]
  ): Promise<string> {
    const selectedMembers = members.filter(m => selectedMemberIds.includes(m.id));
    if (!selectedMembers.length) return `User: ${user.name}`;

    return selectedMembers.map(m => {
      const signals = buildSignals(m);
      const lastInteraction = m.interactions?.[0];
      return [
        `${m.name} (${m.relation}): LP ${signals.lifePathNumber}, Moon ${signals.moonSign}, Dasha ${signals.currentDasha}`,
        `Emotional style: ${signals.emotionalStyle}`,
        lastInteraction ? `Last felt: ${lastInteraction.feeling}${lastInteraction.note ? ` — ${lastInteraction.note}` : ""}` : "",
      ].filter(Boolean).join(". ");
    }).join("\n");
  }
}
