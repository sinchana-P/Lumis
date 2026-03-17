import { Injectable } from '@nestjs/common';

// ── PYTHAGOREAN VALUES ───────────────────────────────────────────
const LETTER_VALUES: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
  j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8,
};
const VOWELS = new Set(['a','e','i','o','u']);

export const LIFE_PATH_LABELS: Record<number, string> = {
  1:'The Pioneer', 2:'The Peacemaker', 3:'The Expressive', 4:'The Builder',
  5:'The Free Spirit', 6:'The Nurturer', 7:'The Seeker', 8:'The Powerhouse',
  9:'The Humanitarian', 11:'The Illuminator', 22:'The Master Builder', 33:'The Master Teacher',
};

export const SOUL_URGE_LABELS: Record<number, string> = {
  1:'Craves independence and self-direction',
  2:'Craves reciprocity and being truly received',
  3:'Craves creative expression and joy',
  4:'Craves stability, order, and reliability',
  5:'Craves freedom and sensory experience',
  6:'Craves love, belonging, and nurturing',
  7:'Craves truth, depth, and solitude',
  8:'Craves mastery, power, and legacy',
  9:'Craves meaning and universal contribution',
};

export const PERSONAL_YEAR_THEMES: Record<number, string> = {
  1:'new beginnings, planting seeds, bold moves',
  2:'patience, deepening, receiving, subtle cooperation',
  3:'creativity, self-expression, social expansion',
  4:'discipline, building foundations, hard work',
  5:'change, disruption, freedom, the unexpected',
  6:'love, responsibility, home, family, service',
  7:'reflection, solitude, spiritual deepening, inner work',
  8:'power, achievement, harvest, material results',
  9:'completion, release, endings, preparing for renewal',
};

export const DASHA_PLANET_THEMES: Record<string, string> = {
  Sun:'authority, self-expression, ego, father figures',
  Moon:'emotions, home, mother, fluctuation, nurturing',
  Mars:'action, conflict, drive, courage, impatience',
  Mercury:'communication, intellect, siblings, trade',
  Jupiter:'expansion, wisdom, spirituality, wealth, growth',
  Venus:'love, beauty, pleasure, relationships, creativity',
  Saturn:'discipline, delay, karma, restriction, hard lessons',
  Rahu:'obsession, ambition, foreignness, unconventional desires',
  Ketu:'detachment, spirituality, past karma, isolation',
};

export interface NumerologyCoreNumbers {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  birthday: number;
  maturity: number;
}

export interface NumerologyTimingNumbers {
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
}

export interface NumerologyBaseProfile {
  coreNumbers: NumerologyCoreNumbers;
  timingNumbers: NumerologyTimingNumbers;
}

@Injectable()
export class NumerologyEngineService {
  reduce(n: number): number {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce((s, d) => s + parseInt(d), 0);
    }
    return n;
  }

  private digitSum(n: number): number {
    return String(n).split('').reduce((s, d) => s + parseInt(d), 0);
  }

  lifePath(dob: string): number {
    const [y, m, d] = dob.split('-').map(Number);
    return this.reduce(this.reduce(m) + this.reduce(d) + this.reduce(this.digitSum(y)));
  }

  expression(fullName: string): number {
    const letters = fullName.toLowerCase().replace(/[^a-z]/g, '');
    return this.reduce(letters.split('').reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0));
  }

  soulUrge(fullName: string): number {
    const vowels = fullName.toLowerCase().replace(/[^a-z]/g, '').split('').filter(c => VOWELS.has(c));
    return this.reduce(vowels.reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0));
  }

  personality(fullName: string): number {
    const consonants = fullName.toLowerCase().replace(/[^a-z]/g, '').split('').filter(c => !VOWELS.has(c));
    return this.reduce(consonants.reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0));
  }

  birthday(dob: string): number {
    return parseInt(dob.split('-')[2], 10);
  }

  maturity(lp: number, expr: number): number {
    return this.reduce(lp + expr);
  }

  personalYear(dob: string, year: number = new Date().getFullYear()): number {
    const [, m, d] = dob.split('-').map(Number);
    return this.reduce(this.reduce(m) + this.reduce(d) + this.reduce(year));
  }

  personalMonth(dob: string, year?: number, month?: number): number {
    const y = year ?? new Date().getFullYear();
    const mo = month ?? (new Date().getMonth() + 1);
    return this.reduce(this.personalYear(dob, y) + mo);
  }

  personalDay(dob: string, date?: Date): number {
    const d = date ?? new Date();
    return this.reduce(this.personalMonth(dob, d.getFullYear(), d.getMonth() + 1) + d.getDate());
  }

  lifeCycle(dob: string): 1 | 2 | 3 {
    const age = new Date().getFullYear() - parseInt(dob.split('-')[0]);
    return age < 28 ? 1 : age < 56 ? 2 : 3;
  }

  pinnacles(dob: string): [number, number, number, number] {
    const [y, m, d] = dob.split('-').map(Number);
    const rm = this.reduce(m);
    const rd = this.reduce(d);
    const ry = this.reduce(this.digitSum(y));
    const p1 = this.reduce(rm + rd);
    const p2 = this.reduce(rd + ry);
    const p3 = this.reduce(p1 + p2);
    const p4 = this.reduce(rm + ry);
    return [p1, p2, p3, p4];
  }

  challenges(dob: string): [number, number, number, number] {
    const [y, m, d] = dob.split('-').map(Number);
    const rm = this.reduce(m);
    const rd = this.reduce(d);
    const ry = this.reduce(this.digitSum(y));
    const c1 = Math.abs(rm - rd);
    const c2 = Math.abs(rd - ry);
    const c3 = Math.abs(c1 - c2);
    const c4 = Math.abs(rm - ry);
    return [c1, c2, c3, c4];
  }

  compatibilityScores(
    userDob: string, memberDob: string,
    userName?: string, memberName?: string,
  ) {
    const uLP = this.lifePath(userDob);
    const mLP = this.lifePath(memberDob);
    const uExpr = userName ? this.expression(userName) : uLP;
    const mExpr = memberName ? this.expression(memberName) : mLP;
    const uSU = userName ? this.soulUrge(userName) : uLP;
    const mSU = memberName ? this.soulUrge(memberName) : mLP;
    const uPY = this.personalYear(userDob);
    const mPY = this.personalYear(memberDob);

    const scoreTwo = (a: number, b: number) => Math.max(20, Math.round(100 - (Math.abs(a - b) / 9) * 80));

    const lifePathScore = scoreTwo(uLP, mLP);
    const expressionScore = scoreTwo(uExpr, mExpr);
    const soulUrgeScore = scoreTwo(uSU, mSU);
    const yearAlignmentScore = scoreTwo(uPY, mPY);
    const overallScore = Math.round(
      lifePathScore * 0.30 + soulUrgeScore * 0.30 + expressionScore * 0.20 + yearAlignmentScore * 0.20,
    );

    return { lifePathScore, expressionScore, soulUrgeScore, yearAlignmentScore, overallScore,
      numbers: { uLP, mLP, uExpr, mExpr, uSU, mSU, uPY, mPY } };
  }

  buildProfile(dob: string, fullName: string): NumerologyBaseProfile {
    const lp = this.lifePath(dob);
    const expr = this.expression(fullName);
    const [p1, p2, p3, p4] = this.pinnacles(dob);
    const [c1, c2] = this.challenges(dob);

    return {
      coreNumbers: {
        lifePath: lp,
        expression: expr,
        soulUrge: this.soulUrge(fullName),
        personality: this.personality(fullName),
        birthday: this.birthday(dob),
        maturity: this.maturity(lp, expr),
      },
      timingNumbers: {
        personalYear: this.personalYear(dob),
        personalMonth: this.personalMonth(dob),
        personalDay: this.personalDay(dob),
        lifeCycle: this.lifeCycle(dob),
        pinnacle1: p1, pinnacle2: p2, pinnacle3: p3, pinnacle4: p4,
        challenge1: c1, challenge2: c2,
      },
    };
  }
}
