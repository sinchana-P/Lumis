// ═══════════════════════════════════════════════════════════════
// LUMIS AI — NUMEROLOGY ENGINE
// Deterministic. No AI. Pure math.
// All numbers respect master numbers 11, 22, 33.
// ═══════════════════════════════════════════════════════════════

import { NumerologyProfile } from "../types";

// ── PYTHAGOREAN VALUES ───────────────────────────────────────────
const LETTER_VALUES: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
  j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8,
};
const VOWELS = new Set(["a","e","i","o","u"]);

// ── REDUCTION ────────────────────────────────────────────────────
export function reduce(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((s, d) => s + parseInt(d), 0);
  }
  return n;
}

function digitSum(n: number): number {
  return String(n).split("").reduce((s, d) => s + parseInt(d), 0);
}

// ── CORE CALCULATIONS ────────────────────────────────────────────

export function lifePath(dob: string): number {
  const [y, m, d] = dob.split("-").map(Number);
  return reduce(reduce(m) + reduce(d) + reduce(digitSum(y)));
}

export function expression(fullName: string): number {
  const letters = fullName.toLowerCase().replace(/[^a-z]/g, "");
  return reduce(letters.split("").reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0));
}

export function soulUrge(fullName: string): number {
  const vowels = fullName.toLowerCase().replace(/[^a-z]/g, "").split("").filter(c => VOWELS.has(c));
  return reduce(vowels.reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0));
}

export function personality(fullName: string): number {
  const consonants = fullName.toLowerCase().replace(/[^a-z]/g, "").split("").filter(c => !VOWELS.has(c));
  return reduce(consonants.reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0));
}

export function birthday(dob: string): number {
  return parseInt(dob.split("-")[2], 10);
}

export function maturity(lp: number, expr: number): number {
  return reduce(lp + expr);
}

// ── TIMING ───────────────────────────────────────────────────────

export function personalYear(dob: string, year: number = new Date().getFullYear()): number {
  const [, m, d] = dob.split("-").map(Number);
  return reduce(reduce(m) + reduce(d) + reduce(year));
}

export function personalMonth(dob: string, year?: number, month?: number): number {
  const y = year ?? new Date().getFullYear();
  const mo = month ?? (new Date().getMonth() + 1);
  return reduce(personalYear(dob, y) + mo);
}

export function personalDay(dob: string, date?: Date): number {
  const d = date ?? new Date();
  return reduce(personalMonth(dob, d.getFullYear(), d.getMonth() + 1) + d.getDate());
}

export function lifeCycle(dob: string): 1 | 2 | 3 {
  const age = new Date().getFullYear() - parseInt(dob.split("-")[0]);
  return age < 28 ? 1 : age < 56 ? 2 : 3;
}

// ── PINNACLES ────────────────────────────────────────────────────
// Pinnacle 1: Reduced(Month) + Reduced(Day)
// Pinnacle 2: Reduced(Day) + Reduced(Year)
// Pinnacle 3: Pinnacle1 + Pinnacle2
// Pinnacle 4: Reduced(Month) + Reduced(Year)

export function pinnacles(dob: string): [number, number, number, number] {
  const [y, m, d] = dob.split("-").map(Number);
  const rm = reduce(m);
  const rd = reduce(d);
  const ry = reduce(digitSum(y));
  const p1 = reduce(rm + rd);
  const p2 = reduce(rd + ry);
  const p3 = reduce(p1 + p2);
  const p4 = reduce(rm + ry);
  return [p1, p2, p3, p4];
}

// ── CHALLENGES ───────────────────────────────────────────────────
// Challenge 1: |Reduced(Month) - Reduced(Day)|
// Challenge 2: |Reduced(Day) - Reduced(Year)|
// Challenge 3: |Challenge1 - Challenge2|
// Challenge 4: |Reduced(Month) - Reduced(Year)|

export function challenges(dob: string): [number, number, number, number] {
  const [y, m, d] = dob.split("-").map(Number);
  const rm = reduce(m);
  const rd = reduce(d);
  const ry = reduce(digitSum(y));
  const c1 = Math.abs(rm - rd);
  const c2 = Math.abs(rd - ry);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(rm - ry);
  return [c1, c2, c3, c4];
}

// ── COMPATIBILITY SCORE ──────────────────────────────────────────
function scoreTwo(a: number, b: number, maxRange = 9): number {
  const dist = Math.abs(a - b);
  return Math.max(20, Math.round(100 - (dist / maxRange) * 80));
}

export function compatibilityScores(
  userDob: string, memberDob: string,
  userName?: string, memberName?: string
) {
  const uLP = lifePath(userDob);
  const mLP = lifePath(memberDob);
  const uExpr = userName ? expression(userName) : uLP;
  const mExpr = memberName ? expression(memberName) : mLP;
  const uSU = userName ? soulUrge(userName) : uLP;
  const mSU = memberName ? soulUrge(memberName) : mLP;
  const uPY = personalYear(userDob);
  const mPY = personalYear(memberDob);

  const lifePathScore = scoreTwo(uLP, mLP);
  const expressionScore = scoreTwo(uExpr, mExpr);
  const soulUrgeScore = scoreTwo(uSU, mSU);
  const yearAlignmentScore = scoreTwo(uPY, mPY);
  const overallScore = Math.round(
    lifePathScore * 0.30 +
    soulUrgeScore * 0.30 +
    expressionScore * 0.20 +
    yearAlignmentScore * 0.20
  );

  return { lifePathScore, expressionScore, soulUrgeScore, yearAlignmentScore, overallScore,
    numbers: { uLP, mLP, uExpr, mExpr, uSU, mSU, uPY, mPY } };
}

// ── FULL PROFILE ─────────────────────────────────────────────────
export function buildNumerologyProfile(dob: string, fullName: string): Omit<NumerologyProfile, "insights" | "compatibility"> {
  const lp = lifePath(dob);
  const expr = expression(fullName);
  const [p1, p2, p3, p4] = pinnacles(dob);
  const [c1, c2, c3, c4] = challenges(dob);

  return {
    coreNumbers: {
      lifePath: lp,
      expression: expr,
      soulUrge: soulUrge(fullName),
      personality: personality(fullName),
      birthday: birthday(dob),
      maturity: maturity(lp, expr),
    },
    timingNumbers: {
      personalYear: personalYear(dob),
      personalMonth: personalMonth(dob),
      personalDay: personalDay(dob),
      lifeCycle: lifeCycle(dob),
      pinnacle1: p1, pinnacle2: p2, pinnacle3: p3, pinnacle4: p4,
      challenge1: c1, challenge2: c2,
    },
  };
}

// ── LABELS (for signals & prompts) ──────────────────────────────
export const LIFE_PATH_LABELS: Record<number, string> = {
  1:"The Pioneer", 2:"The Peacemaker", 3:"The Expressive", 4:"The Builder",
  5:"The Free Spirit", 6:"The Nurturer", 7:"The Seeker", 8:"The Powerhouse",
  9:"The Humanitarian", 11:"The Illuminator", 22:"The Master Builder", 33:"The Master Teacher",
};

export const SOUL_URGE_LABELS: Record<number, string> = {
  1:"Craves independence and self-direction",
  2:"Craves reciprocity and being truly received",
  3:"Craves creative expression and joy",
  4:"Craves stability, order, and reliability",
  5:"Craves freedom and sensory experience",
  6:"Craves love, belonging, and nurturing",
  7:"Craves truth, depth, and solitude",
  8:"Craves mastery, power, and legacy",
  9:"Craves meaning and universal contribution",
};

export const PERSONAL_YEAR_THEMES: Record<number, string> = {
  1:"new beginnings, planting seeds, bold moves",
  2:"patience, deepening, receiving, subtle cooperation",
  3:"creativity, self-expression, social expansion",
  4:"discipline, building foundations, hard work",
  5:"change, disruption, freedom, the unexpected",
  6:"love, responsibility, home, family, service",
  7:"reflection, solitude, spiritual deepening, inner work",
  8:"power, achievement, harvest, material results",
  9:"completion, release, endings, preparing for renewal",
};

export const DASHA_PLANET_THEMES: Record<string, string> = {
  Sun: "authority, self-expression, ego, father figures",
  Moon: "emotions, home, mother, fluctuation, nurturing",
  Mars: "action, conflict, drive, courage, impatience",
  Mercury: "communication, intellect, siblings, trade",
  Jupiter: "expansion, wisdom, spirituality, wealth, growth",
  Venus: "love, beauty, pleasure, relationships, creativity",
  Saturn: "discipline, delay, karma, restriction, hard lessons",
  Rahu: "obsession, ambition, foreignness, unconventional desires",
  Ketu: "detachment, spirituality, past karma, isolation",
};
