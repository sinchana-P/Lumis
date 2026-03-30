import { Injectable } from '@nestjs/common';
import { GeminiService } from '../ai/gemini.service';
import {
  LIFE_PATH_LABELS, SOUL_URGE_LABELS, PERSONAL_YEAR_THEMES,
  NumerologyEngineService,
} from './numerology-engine.service';

// ── PRE-WRITTEN LIBRARY ──────────────────────────────────────────
const LIFE_PATH_FULL: Record<number, { title: string; full: string }> = {
  1: { title:'The Pioneer', full:'Life Path 1 is the number of leadership, originality, and self-determination. You came into this life to forge your own path — not follow someone else\'s. There is an innate drive within you to initiate, to begin things, to stand at the front. At your best you are courageous, creative, and fiercely original. At your shadow you can become domineering, isolated, or unable to ask for help. In relationships you need a partner who respects your autonomy deeply — you give space to others instinctively because you need it so deeply yourself.' },
  2: { title:'The Peacemaker', full:'Life Path 2 is the number of partnership, sensitivity, and deep emotional intelligence. You came here not to lead loudly but to hold space brilliantly. You sense what others feel before they say it. You are the glue in every group. At your shadow, you over-adapt, shrink in dominant company, and mistake people-pleasing for kindness. Your core wound is invisibility. Your core gift is making every person you love feel completely seen.' },
  3: { title:'The Expressive', full:'Life Path 3 is the number of self-expression, creativity, and joy. You came here to communicate — through words, art, presence, humour. Life around you feels lighter. At your best you are magnetic, inspiring, and endlessly generative. At your shadow you scatter your gifts, avoid depth, and use humour to deflect vulnerability. In relationships you need creative freedom and a partner who celebrates rather than contains you.' },
  4: { title:'The Builder', full:'Life Path 4 is the number of structure, discipline, and building things that last. You came here to create solid foundations in work, family, and community. You are the most reliable person in every room. At your shadow you become rigid, controlling of process, and resistant to change. In relationships you show love through acts of service and consistent presence. You need a partner who values reliability as deeply as you do.' },
  5: { title:'The Free Spirit', full:'Life Path 5 is the number of freedom, change, and sensory experience. You came here to live fully — to taste, travel, transform. You bring energy and aliveness to every space you enter. At your shadow you become restless, commitment-avoidant, and addicted to stimulation over depth. In relationships you need space and a partner who is secure enough not to chase you.' },
  6: { title:'The Nurturer', full:'Life Path 6 is the number of love, family, and responsibility. You came here to nurture — to hold people together, to create beauty, to be the home for those around you. At your best you are deeply loving and healing to be around. At your shadow you martyr yourself, take on others\' burdens, and confuse love with control. Your deepest fear is that if you stop being useful, people will stop needing you.' },
  7: { title:'The Seeker', full:'Life Path 7 is the number of the inner world — analysis, solitude, spiritual seeking, and the search for truth. You came here not to accumulate, but to understand. At your best you are profoundly wise and incisive. At your shadow you become isolated, emotionally unavailable, and so lost in your mind that your relationships starve. You need someone who gives you silence without making it rejection.' },
  8: { title:'The Powerhouse', full:'Life Path 8 is the number of power, authority, and material mastery. You came here to build empires — inner and outer. You are drawn to excellence and the kind of success that changes lives. At your shadow you become domineering and conflate worth with achievement. In relationships you need a partner who doesn\'t wilt under your intensity — someone who brings their own authority to the table.' },
  9: { title:'The Humanitarian', full:'Life Path 9 is the number of completion, wisdom, and universal love. You came here with the deepest emotional range of all numbers. At your best you are profoundly compassionate and generous without limit. At your shadow you give so much to strangers that your closest relationships quietly starve. You must learn that being loved is not weakness.' },
  11: { title:'The Illuminator', full:'Life Path 11 is the first master number — illumination, spiritual leadership, and heightened intuition. Your sensitivity runs deeper than most people can imagine. At your shadow you become anxious, scattered, and overwhelmed by the weight of your own perception. You need someone who understands that your depth is not a burden — it is the whole of who you are.' },
  22: { title:'The Master Builder', full:'Life Path 22 is the Master Builder — the most powerful of all life path numbers. You came here to build something lasting at civilisational scale. The tension between your enormous vision and the practical patience it requires is the central challenge of your life. At your shadow, the pressure of your own potential becomes paralysis.' },
  33: { title:'The Master Teacher', full:'Life Path 33 is the Master Teacher — the rarest of all life path numbers. You carry the combined gifts of illumination and building in service of unconditional love. You came here not simply to achieve but to uplift whole communities. At your shadow, the weight of this calling can become self-sacrifice that empties rather than replenishes you. Your deepest work is learning that you deserve what you so freely give.' },
};

const SOUL_URGE_FULL: Record<number, string> = {
  1:'Soul Urge 1: beneath everything, the deepest desire is for self-determination and the right to lead their own life. When this is thwarted they resist or leave. When it is honoured they are generous and inspiring.',
  2:'Soul Urge 2: beneath the composed exterior, what they most deeply crave is to be fully received. Not just loved — received. To say something true and have someone hold it gently. When this need is unmet, they get quiet and begin editing themselves before they even speak.',
  3:'Soul Urge 3: the deepest hunger is for genuine creative expression and the joy of being celebrated for it. When suppressed, something essential in them dims. When nurtured, they are extraordinarily alive.',
  4:'Soul Urge 4: what they quietly hunger for is stability — a world that makes sense, where commitments mean something. When this need goes chronically unmet, they become rigid or anxious about details others find trivial.',
  5:'Soul Urge 5: the deepest need is for freedom — to move, to change, to experience without containment. When blocked, they become restless in ways that confuse everyone around them. When honoured, they are magnetic.',
  6:'Soul Urge 6: the deepest desire is to create a world of genuine care — a home, a family, a community where everyone is held. Their greatest spiritual work is learning that they deserve what they so generously give.',
  7:'Soul Urge 7: they are not easily satisfied by surface connection. What they crave is truth — in themselves, in others. They want to understand, not just to know. When frustrated, they disappear into their own minds.',
  8:'Soul Urge 8: the deepest desire is to build something that matters. They are driven by a deep belief that they came here to do something significant. When blocked, it shows as frustration and impatience that can be hard to be around.',
  9:'Soul Urge 9: they are not easily satisfied by personal happiness alone. They need to feel their presence in the world is mattering. They feel most alive in service and healing. Their challenge is that they sometimes use this as an escape from ordinary intimacy.',
  11:'Soul Urge 11: beneath everything, the deepest desire is to illuminate — to be a genuine channel for insight, beauty, or truth that moves others. What they crave most is to matter at a depth beyond the surface. When this calling is thwarted they become anxious, over-stimulated, and disconnected from the very intuition that is their greatest gift.',
  22:'Soul Urge 22: the deepest hunger is to build something that outlasts them — something with real permanence at scale. They are not satisfied by personal comfort or small victories. When this drive has no outlet, it turns inward as restlessness, frustration, and the quiet despair of feeling that their potential has nowhere to land.',
  33:'Soul Urge 33: what they most deeply desire is to love without limit and to serve as a vessel for healing in others. They are driven not by ambition but by an almost impossible tenderness toward human suffering. Their deepest challenge is accepting that they too are allowed to need.',
};

const PERSONAL_YEAR_FULL: Record<number, string> = {
  1:'A Personal Year 1 is a year to begin — to plant seeds that carry unusual weight. Whatever is started this year has longevity. The energy supports bold moves and fresh starts. In relationships this is a year to establish new dynamics — old patterns have permission to end.',
  2:'A Personal Year 2 is a year for patience and deepening what already exists. Relationships are highlighted: what you give and receive will both become very clear. Pay attention to who shows up when you stop performing.',
  3:'A Personal Year 3 is a year for creativity, communication, and social expansion. Life brightens. Conversations you\'ve been avoiding can finally happen with ease.',
  4:'A Personal Year 4 is a year of work, discipline, and building. Nothing glamorous — but what is built here is permanent. A year to organise your life and lay groundwork in your most important relationships.',
  5:'A Personal Year 5 is a year of change and the unexpected. Life refuses to stay still. Relationships may shift dramatically. Stay fluid — the 5 year rewards those who trust disruption as preparation.',
  6:'A Personal Year 6 is a year where love and responsibility take centre stage. Relationships demand and reward your attention. It is a year to show up for the people who need you.',
  7:'A Personal Year 7 is a year for going inward. Something is ripening in you that requires quiet. A year for deep study and honest self-examination. Communicate this clearly so the people who love you don\'t interpret your depth as distance.',
  8:'A Personal Year 8 is a year for results. What you have built is ready to come to fruition. Don\'t shrink from your own power. The danger is letting ambition crowd out the relationships that made the work worth doing.',
  9:'A Personal Year 9 is a year of completion, release, and preparing for an entirely new cycle. Things that have run their course will end. Do not try to hold on. Grief is appropriate here. So is gratitude.',
  11:'A Personal Year 11 carries the heightened charge of a master year — illumination, heightened intuition, and unexpected openings in perception. Life feels more vivid and more demanding simultaneously. The call is to trust your instincts completely, even when logic cannot justify them.',
  22:'A Personal Year 22 is a rare master year — a period when the ambition to build something lasting is not just appropriate but supported at every level. What you invest in this year has the potential to become permanent. The demand is disciplined commitment in the face of the vision.',
  33:'A Personal Year 33 is the rarest of master years — a time of unconditional giving and profound service. Life opens you up in ways that can feel almost overwhelming. The invitation is to let your love become your leadership, and to receive as openly as you give.',
};

// ── RULE ENGINE — TRAIT TABLES ──────────────────────────────────
// These feed the AI prompts with accurate numerological ground truth.
// Number → Emotion → Real-life explanation (not just descriptions).

const LP_TRAITS: Record<number, { emotion: string; shadow: string; motivation: string; behavior: string; career: string }> = {
  1: { emotion: 'self-directed and internally motivated — you process emotions privately and instinctively turn inward before showing anything outward', shadow: 'pride, rigidity, inability to ask for help, isolation when wounded', motivation: 'autonomy, personal excellence, being first or original', behavior: 'initiates quickly, prefers to lead, resists being told what to do', career: 'entrepreneurship, leadership, independent roles, pioneering and creative work' },
  2: { emotion: 'emotionally attuned and deeply sensitive — you absorb others\' moods almost unconsciously and need recovery time after intense interactions', shadow: 'people-pleasing, self-erasure, passive aggression when needs go unexpressed', motivation: 'genuine connection, being truly received, harmony in your immediate world', behavior: 'mediates, listens deeply, adapts to others\' style, avoids direct confrontation', career: 'counselling, diplomacy, support roles, partnership-based work, healing' },
  3: { emotion: 'emotionally expressive on the surface but can carry unexpressed depths beneath the brightness', shadow: 'scattering energy, emotional avoidance through humour, fear of being boring or ordinary', motivation: 'creative expression, joy, being celebrated for your authentic self', behavior: 'communicates with enthusiasm, generates ideas quickly, thrives in social settings', career: 'creative arts, writing, speaking, teaching, entertainment, marketing, coaching' },
  4: { emotion: 'emotionally steady but slow to open — you need time and safety before expressing vulnerability, and unpredictability genuinely destabilises you', shadow: 'rigidity, controlling behaviour when anxious, emotional shutdown under pressure, workaholism', motivation: 'security, order, building things that last, knowing what to expect', behavior: 'methodical, reliable, keeps every commitment, struggles with spontaneity and pivoting', career: 'engineering, project management, finance, systems design, architecture, operations' },
  5: { emotion: 'emotionally stimulation-seeking — you need variety and experience to feel alive, and stagnation shows in your mood before you can name it', shadow: 'restlessness, commitment avoidance, addictive tendencies, boredom-driven chaos', motivation: 'freedom, new experiences, living fully without containment', behavior: 'adaptable, persuasive, jumps between interests, connects with almost anyone easily', career: 'sales, travel, media, entrepreneurship, consulting, any role with variety and movement' },
  6: { emotion: 'emotionally nurturing and deeply responsible — you feel others\' pain as your own and consistently prioritise care for others over care for yourself', shadow: 'martyrdom, emotional control disguised as love, deep difficulty receiving care gracefully', motivation: 'love, family, beauty, creating a world where everyone feels held', behavior: 'takes responsibility naturally, creates harmony, can become over-involved in others\' lives', career: 'healthcare, counselling, teaching, interior design, community work, family businesses' },
  7: { emotion: 'emotionally private and deeply interior — you process in solitude and can appear distant when actually you are most intensely present within yourself', shadow: 'emotional unavailability, over-intellectualisation of feeling, withdrawal disguised as independence', motivation: 'truth, depth, understanding the hidden order beneath surface reality', behavior: 'analytical, observational, quality over quantity in all things, long silences before speaking', career: 'research, philosophy, technology, psychology, writing, spirituality, academia' },
  8: { emotion: 'emotionally self-contained and intense — you have profound depth but rarely display it publicly, equating vulnerability with weakness', shadow: 'domineering behaviour, conflating worth with achievement, emotional unavailability to those closest to you', motivation: 'power, legacy, building something that outlasts you', behavior: 'decisive, ambitious, high standards for self and others, can overwhelm those with less drive', career: 'executive roles, finance, law, entrepreneurship, medicine, large-scale leadership' },
  9: { emotion: 'emotionally vast and deeply empathetic — you feel everything, absorb collective pain, and need regular release or you become heavy with what you have absorbed', shadow: 'using service as a way to avoid personal intimacy, difficulty receiving, emotional martyrdom', motivation: 'meaning, contributing to something larger than yourself, universal love and compassion', behavior: 'generous, compassionate, idealistic, can overgive and then retreat without warning', career: 'healing, activism, the arts, social work, teaching, global-scale mission-driven work' },
  11: { emotion: 'emotionally hyper-sensitive and spiritually attuned — you pick up on undercurrents others miss entirely, making the world both richer and more overwhelming', shadow: 'anxiety, nervous system overwhelm, self-doubt coexisting beneath the spiritual confidence', motivation: 'illumination, uplifting others, being a channel for something larger than yourself', behavior: 'intuitive leaps, inspirational communication, can struggle with mundane day-to-day execution', career: 'counselling, spiritual teaching, arts, healing, media, any inspirational or visionary role' },
  22: { emotion: 'emotionally driven by an enormous sense of purpose — you feel the weight of your potential and can swing between profound confidence and crippling self-doubt', shadow: 'paralysis under the pressure of your own vision, control, emotional unavailability to loved ones', motivation: 'building something at civilisational scale, leaving a mark that outlasts you', behavior: 'visionary and systematic simultaneously, operates on a larger stage than most people expect', career: 'architecture, large-scale engineering, institution building, executive leadership, social change' },
  33: { emotion: 'emotionally boundless and deeply compassionate — you feel others\' pain as if it were your own and carry a tenderness that is both a gift and a vulnerability', shadow: 'self-sacrifice that depletes rather than replenishes, martyrdom, giving until there is nothing left', motivation: 'unconditional love, healing, being a source of uplift for those around and beyond you', behavior: 'nurturing at scale, inspires through presence, can struggle with protecting their own emotional reserves', career: 'healing arts, teaching, spiritual leadership, community work, any role that combines love and service at scale' },
};

const SU_TRAITS: Record<number, { desire: string; hiddenNeed: string; unmetPattern: string; relationship: string }> = {
  1: { desire: 'self-determination — to chart your own course without needing anyone\'s permission', hiddenNeed: 'to be respected as an individual first, not as a role or a function', unmetPattern: 'when controlled or micromanaged, you shut down internally or leave', relationship: 'you need a partner who celebrates your autonomy rather than fearing or resenting it' },
  2: { desire: 'to be truly received — not just loved, but understood in your full complexity', hiddenNeed: 'reciprocity: to be met with the same attentiveness you naturally bring to others', unmetPattern: 'when unacknowledged, you grow quiet and begin editing yourself before you even speak', relationship: 'you thrive with someone who notices the small things and mirrors them back to you' },
  3: { desire: 'to express and be celebrated for who you authentically are — not a performance, but the real thing', hiddenNeed: 'an audience that genuinely appreciates rather than just tolerates your brightness', unmetPattern: 'when creatively suppressed, something essential in you dims visibly', relationship: 'you need someone who celebrates your expression rather than just tolerating it' },
  4: { desire: 'security — a world where commitments are kept and things make reliable sense', hiddenNeed: 'predictability and consistency from the people you depend on', unmetPattern: 'when destabilised, you become rigid or anxious about details others find trivial', relationship: 'you need a partner who keeps their word, especially in the small everyday things' },
  5: { desire: 'freedom — to move, change, and experience without containment or permission', hiddenNeed: 'a life that never fully settles into complete predictability', unmetPattern: 'when confined, you become restless in ways that confuse and inadvertently hurt those closest to you', relationship: 'you need a partner secure enough not to chase you when you need space to breathe' },
  6: { desire: 'to create a world of genuine care — a home where everyone is truly held', hiddenNeed: 'to receive care with the same ease and openness that you give it', unmetPattern: 'when your care goes unacknowledged, you quietly accumulate resentment that eventually surfaces', relationship: 'you need someone who notices and reciprocates your caregiving rather than simply accepting it' },
  7: { desire: 'truth and depth — real understanding rather than surface-level connection or small talk', hiddenNeed: 'intellectual and spiritual companionship, not just emotional warmth or social proximity', unmetPattern: 'when surrounded by superficiality, you withdraw into your own mind and become unreachable', relationship: 'you need someone who can follow you into the deep end of a conversation without flinching' },
  8: { desire: 'to build something that genuinely matters — legacy, mastery, and real significance', hiddenNeed: 'to be seen as capable of greatness, not just functional competence', unmetPattern: 'when blocked or underestimated, frustration and impatience can be very hard for others to be around', relationship: 'you need someone who brings their own authority and ambition to the relationship' },
  9: { desire: 'to matter beyond the personal — to feel your presence is contributing to something larger', hiddenNeed: 'to be loved for who you are, not only for what you do for others', unmetPattern: 'you use service as an escape from ordinary intimacy, then feel alone even in a crowded room', relationship: 'you need someone who actively pulls you back toward personal, not just universal, connection' },
  11: { desire: 'illumination — to channel insight, beauty, or truth that genuinely moves and uplifts others', hiddenNeed: 'to be understood at the level of intuition and depth, not just intellect or emotion', unmetPattern: 'when your sensitivity is dismissed or your vision goes unrecognised, anxiety and self-doubt flood in', relationship: 'you need a partner who honours your depth without being threatened by it or trying to simplify it' },
  22: { desire: 'to build something permanent and meaningful at a scale larger than personal ambition', hiddenNeed: 'to feel that the enormity of your vision has somewhere real to land', unmetPattern: 'when the outlet for your building drive is blocked, it turns to frustration and restlessness that others find hard to be around', relationship: 'you need someone who is grounded enough not to be intimidated by the scale of what you are trying to create' },
  33: { desire: 'to love without limit and to serve as a living vessel for healing and uplift', hiddenNeed: 'to receive tenderness with the same openness you extend to everyone else', unmetPattern: 'you give until you are empty and then disappear without warning, leaving those closest to you confused and hurt', relationship: 'you need someone who actively insists on reciprocity — who gives back before you are depleted rather than after' },
};

const EXPR_TRAITS: Record<number, { style: string; strength: string; challenge: string; workStyle: string }> = {
  1: { style: 'direct, authoritative, and self-assured', strength: 'natural leadership, original thinking, the ability to start things others won\'t', challenge: 'asking for help, expressing vulnerability without interpreting it as weakness, delegating genuinely', workStyle: 'independent, leads by example, performs best with significant autonomy and clear ownership' },
  2: { style: 'empathetic, tactful, and quietly perceptive', strength: 'mediation, deep listening, building trust in relationships and teams', challenge: 'advocating for yourself, expressing your own needs directly, holding firm boundaries', workStyle: 'collaborative, behind-the-scenes, detail-oriented, thrives in partnership-driven environments' },
  3: { style: 'expressive, enthusiastic, and naturally engaging', strength: 'communication, creative generation, lifting the energy of any room', challenge: 'following through, bringing depth alongside width, maintaining focus', workStyle: 'thrives in creative and social environments, dislikes routine and repetitive structure' },
  4: { style: 'methodical, precise, and utterly dependable', strength: 'execution, building systems that last, being the most reliable person in any room', challenge: 'flexibility, emotional expression, tolerating ambiguity without anxiety', workStyle: 'structured, process-oriented, high follow-through on every commitment made' },
  5: { style: 'persuasive, adaptable, and energetically magnetic', strength: 'selling ideas, navigating change with ease, connecting meaningfully with almost anyone', challenge: 'consistency, long-term commitment, staying engaged when things become ordinary', workStyle: 'performs best with variety, autonomy, travel, or frequently changing environments' },
  6: { style: 'warm, responsible, and naturally caring', strength: 'creating harmony, nurturing the talent of others, taking full ownership of what matters', challenge: 'saying no, separating personal responsibility from professional or relational over-involvement', workStyle: 'service-oriented, functions well in team environments, instinctively takes ownership' },
  7: { style: 'precise, reserved, and intellectually rigorous', strength: 'deep analysis, research quality, identifying patterns and gaps that others miss entirely', challenge: 'emotional communication, thriving in high-social or open-plan environments', workStyle: 'independent research and sustained deep focus; genuinely suffers from interruption' },
  8: { style: 'commanding, ambitious, and results-focused', strength: 'strategy, leadership in high-stakes situations, driving outcomes others give up on', challenge: 'warmth expression, patience with slower or less driven processes and people', workStyle: 'thrives with authority, clear accountability, and measurable results on a meaningful scale' },
  9: { style: 'compassionate, universal, and quietly wise', strength: 'empathy at scale, seeing the bigger picture, elevating the people around you', challenge: 'maintaining personal boundaries, focusing rather than diffusing your considerable energy', workStyle: 'mission-driven; functions at the highest level when the work feels genuinely meaningful' },
  11: { style: 'intuitive, visionary, and quietly electrifying', strength: 'inspiration, channelling insight that others haven\'t thought to look for, elevating the perception of every room', challenge: 'grounding vision into practical execution, managing nervous system sensitivity', workStyle: 'thrives as a thought leader, creative force, or inspired teacher; needs space for intuition to operate' },
  22: { style: 'visionary and systematic simultaneously — rare combination', strength: 'translating enormous ideas into real, lasting structures', challenge: 'patience with smaller-scale thinking, emotional vulnerability with those closest to them', workStyle: 'functions best at the intersection of vision and architecture; needs to be building something genuinely large' },
  33: { style: 'radiant, nurturing, and quietly transformational', strength: 'healing through presence, teaching through love, creating safety for others to become more fully themselves', challenge: 'self-protection, saying no, distinguishing genuine service from self-erasure', workStyle: 'leads through love not authority; functions best in roles that allow both creative expression and deep human care' },
};

const PERSONAL_MONTH_THEMES: Record<number, string> = {
  1: 'initiation — the month to start, decide, and act rather than wait',
  2: 'patience — a month to listen, cooperate, and receive rather than push',
  3: 'expression — creativity, social connection, and communication come alive',
  4: 'organisation — the month to build systems, clear backlogs, and do steady work',
  5: 'change — expect the unexpected; stay fluid rather than force continuity',
  6: 'responsibility — relationships, home, and care take centre stage',
  7: 'reflection — go inward; the quality of your thinking matters more than your output',
  8: 'results — the month where effort converts; push for what you have been building toward',
  9: 'completion — finish what is unfinished; release what has run its course',
};

// ── INTERFACES ──────────────────────────────────────────────────

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

export interface NumerologySelfInsights {
  // Core number descriptions (static library)
  lifePathMeaning: string;
  expressionMeaning: string;
  soulUrgeMeaning: string;
  personalityMeaning: string;
  birthdayMeaning: string;
  maturityMeaning: string;
  // Timing (dynamic)
  personalYearMeaning: string;
  personalMonthMeaning: string;
  // Deep AI insights — identity layer
  emotionalCore: string;
  innerConflict: string;
  behaviorPattern: string;
  // Deep AI insights — application layer
  careerAlignment: string;
  relationshipPattern: string;
  shadowAndSabotage: string;
  // Evolution layer
  growthPath: string;
  pinnacleInsight: string;
  challengeInsight: string;
}

export interface NumerologyCompatibility {
  lifePathScore: number;
  expressionScore: number;
  soulUrgeScore: number;
  yearAlignmentScore: number;
  overallScore: number;
  overallSummary: string;
  dimensionTexts: Record<string, string>;
}

@Injectable()
export class NumerologyInterpreterService {
  constructor(
    private readonly gemini: GeminiService,
    private readonly engine: NumerologyEngineService,
  ) {}

  async buildInsights(
    memberNumbers: { lp: number; su: number; expr: number; pers: number; bd: number; mat: number; py: number; pm: number },
    memberName: string,
    memberRelation: string,
    userName: string,
    userNumbers: { lp: number; su: number; expr: number; py: number },
  ): Promise<NumerologyInsights> {
    const lifePathMeaning = (LIFE_PATH_FULL[memberNumbers.lp] || LIFE_PATH_FULL[1]).full;
    const soulUrgeMeaning = SOUL_URGE_FULL[memberNumbers.su] || SOUL_URGE_FULL[1];
    const personalYearMeaning = PERSONAL_YEAR_FULL[memberNumbers.py] || PERSONAL_YEAR_FULL[1];
    const personalMonthMeaning = `Personal Month ${memberNumbers.pm} — ${PERSONAL_MONTH_THEMES[memberNumbers.pm] || 'a focused period of specific energetic theme'}.`;

    const expressionMeaning = this.getExpressionDescription(memberNumbers.expr);
    const personalityMeaning = this.getPersonalityDescription(memberNumbers.pers);
    const birthdayMeaning = this.getBirthdayDescription(memberNumbers.bd);
    const maturityMeaning = this.getMaturityDescription(memberNumbers.mat);

    const theirNumberInYourLife = await this.generateTheirNumbersInYourLife(
      memberNumbers, memberName, memberRelation, userName, userNumbers,
    );

    return {
      lifePathMeaning, expressionMeaning, soulUrgeMeaning,
      personalityMeaning, birthdayMeaning, maturityMeaning,
      personalYearMeaning, personalMonthMeaning, theirNumberInYourLife,
    };
  }

  async buildCompatibility(
    userDob: string, memberDob: string,
    userName: string, memberName: string,
    memberRelation: string,
  ): Promise<NumerologyCompatibility> {
    const scores = this.engine.compatibilityScores(userDob, memberDob, userName, memberName);
    const { lifePathScore, expressionScore, soulUrgeScore, yearAlignmentScore, overallScore, numbers } = scores;

    const overallSummary = overallScore > 75
      ? 'Natural resonance with working friction points — understanding comes easier here than in most pairs.'
      : overallScore > 55
      ? 'Productive contrast — growth is possible, friction is real. The friction is the curriculum, not the problem.'
      : 'Significant contrast — requires active understanding and stretching from both sides. Neither is wrong. Both are different.';

    const dimensionTexts = await this.generateCompatibilityTexts(
      numbers, userName, memberName, memberRelation,
      { lifePathScore, soulUrgeScore, expressionScore, yearAlignmentScore },
    );

    return { lifePathScore, expressionScore, soulUrgeScore, yearAlignmentScore, overallScore, overallSummary, dimensionTexts };
  }

  async buildSelfInsights(
    numbers: { lp: number; su: number; expr: number; pers: number; bd: number; mat: number; py: number; pm: number; pinnacle: number; challenge: number },
    firstName: string,
  ): Promise<NumerologySelfInsights> {
    // Static library — instant, deterministic
    const lifePathMeaning = (LIFE_PATH_FULL[numbers.lp] || LIFE_PATH_FULL[1]).full;
    const soulUrgeMeaning = SOUL_URGE_FULL[numbers.su] || SOUL_URGE_FULL[1];
    const personalYearMeaning = PERSONAL_YEAR_FULL[numbers.py] || PERSONAL_YEAR_FULL[1];
    const personalMonthMeaning = this.buildPersonalMonthText(numbers.pm, numbers.py);
    const expressionMeaning = this.getSelfExpressionDescription(numbers.expr);
    const personalityMeaning = this.getSelfPersonalityDescription(numbers.pers);
    const birthdayMeaning = this.getSelfBirthdayDescription(numbers.bd);
    const maturityMeaning = this.getMaturityDescription(numbers.mat);

    // AI insights — 3 parallel batch calls (each returns JSON with multiple fields)
    const [identityBatch, applicationBatch, evolutionBatch] = await Promise.all([
      this.generateIdentityInsights(numbers, firstName),
      this.generateApplicationInsights(numbers, firstName),
      this.generateEvolutionInsights(numbers, firstName),
    ]);

    return {
      lifePathMeaning, expressionMeaning, soulUrgeMeaning,
      personalityMeaning, birthdayMeaning, maturityMeaning,
      personalYearMeaning, personalMonthMeaning,
      emotionalCore: identityBatch.emotionalCore,
      innerConflict: identityBatch.innerConflict,
      behaviorPattern: identityBatch.behaviorPattern,
      careerAlignment: applicationBatch.careerAlignment,
      relationshipPattern: applicationBatch.relationshipPattern,
      shadowAndSabotage: applicationBatch.shadowAndSabotage,
      growthPath: evolutionBatch.growthPath,
      pinnacleInsight: evolutionBatch.pinnacleInsight,
      challengeInsight: evolutionBatch.challengeInsight,
    };
  }

  // ── IDENTITY BATCH ───────────────────────────────────────────────
  // emotionalCore: Life Path + Soul Urge — "why you feel this way"
  // innerConflict: LP vs SU tension — "what keeps you stuck"
  // behaviorPattern: LP + Expression — "how you actually act"

  private async generateIdentityInsights(
    n: { lp: number; su: number; expr: number; pers: number; bd: number; mat: number; py: number; pm: number },
    name: string,
  ): Promise<{ emotionalCore: string; innerConflict: string; behaviorPattern: string }> {
    const lp = LP_TRAITS[n.lp] || LP_TRAITS[1];
    const su = SU_TRAITS[n.su] || SU_TRAITS[1];
    const expr = EXPR_TRAITS[n.expr] || EXPR_TRAITS[1];

    const prompt = `You are Lumen, the intelligence core of Lumis — a private self-understanding platform.
Write three emotionally precise, second-person insights for ${name} based on their numerology.
These are NOT descriptions of numbers. They are emotional explanations — what it feels like to live as these numbers.

RULE: Always follow the pattern → Number → what it creates emotionally → why that happens in real life → what it looks like in behaviour.

Numerology data:
- Life Path ${n.lp}: emotionally ${lp.emotion}. Shadow: ${lp.shadow}. Drive: ${lp.motivation}.
- Soul Urge ${n.su}: craves ${su.desire}. Hidden need: ${su.hiddenNeed}. When unmet: ${su.unmetPattern}.
- Expression ${n.expr}: style is ${expr.style}. Strength: ${expr.strength}. Challenge: ${expr.challenge}.

Return ONLY valid JSON with these exact keys:

"emotionalCore": 3-4 complete sentences. Combine LP ${n.lp} and Soul Urge ${n.su}. Explain the emotional wiring — why ${name} feels the way they feel, what drives their emotional responses beneath the surface. Do NOT mention numbers explicitly. Write as if you understand their inner world personally. Start with the dominant emotional truth.

"innerConflict": 3 complete sentences. Identify the specific tension between LP ${n.lp}'s nature (${lp.motivation}) and Soul Urge ${n.su}'s desire (${su.desire}). Explain where and how this tension shows up as real-life friction, stuck points, or contradictions. Why does this feel so hard? Make it specific and honest, not generic.

"behaviorPattern": 3 complete sentences. Combine LP ${n.lp} behaviour (${lp.behavior}) with Expression ${n.expr} style (${expr.style}). Describe exactly how ${name} moves through the world — how they make decisions, how they respond under pressure, what consistent patterns others see in them that they may not fully see themselves.`;

    try {
      const raw = await this.gemini.generateJSON(prompt);
      const result = raw as any;
      return {
        emotionalCore: result.emotionalCore || this.fallbackEmotionalCore(n.lp, n.su),
        innerConflict: result.innerConflict || this.fallbackInnerConflict(n.lp, n.su),
        behaviorPattern: result.behaviorPattern || this.fallbackBehaviorPattern(n.lp, n.expr),
      };
    } catch {
      return {
        emotionalCore: this.fallbackEmotionalCore(n.lp, n.su),
        innerConflict: this.fallbackInnerConflict(n.lp, n.su),
        behaviorPattern: this.fallbackBehaviorPattern(n.lp, n.expr),
      };
    }
  }

  // ── APPLICATION BATCH ────────────────────────────────────────────
  // careerAlignment: LP + Expression + Birthday
  // relationshipPattern: SU + Personality + LP
  // shadowAndSabotage: shadow traits under stress

  private async generateApplicationInsights(
    n: { lp: number; su: number; expr: number; pers: number; bd: number; mat: number; py: number; pm: number },
    name: string,
  ): Promise<{ careerAlignment: string; relationshipPattern: string; shadowAndSabotage: string }> {
    const lp = LP_TRAITS[n.lp] || LP_TRAITS[1];
    const su = SU_TRAITS[n.su] || SU_TRAITS[1];
    const expr = EXPR_TRAITS[n.expr] || EXPR_TRAITS[1];

    const prompt = `You are Lumen, the intelligence core of Lumis — a private self-understanding platform.
Write three insight paragraphs for ${name} that translate numerology into emotionally specific real-life explanations.

RULE: Make every sentence specific to these numbers. No vague generalities. Real-life situations and patterns only.

Numerology data:
- Life Path ${n.lp}: career fit is ${lp.career}. Motivation: ${lp.motivation}.
- Expression ${n.expr}: work style is ${expr.workStyle}. Career strength: ${expr.strength}. Challenge: ${expr.challenge}.
- Birthday number: ${n.bd} (natural talent, effortless ability).
- Soul Urge ${n.su}: in relationships craves ${su.desire}. Pattern when unmet: ${su.unmetPattern}. Relationship need: ${su.relationship}.
- Shadow across all numbers: ${lp.shadow}.

Return ONLY valid JSON with these exact keys:

"careerAlignment": 3-4 complete sentences. Based on LP ${n.lp} + Expression ${n.expr} + Birthday ${n.bd}: describe the exact environments where ${name} thrives (what makes them come alive at work), where they drain quickly (what environments or dynamics kill their energy), what kind of work makes them feel most like themselves. End with one specific sentence on what career risk they need to watch.

"relationshipPattern": 3-4 complete sentences. Based on Soul Urge ${n.su} + Life Path ${n.lp}: describe how ${name} actually behaves in close relationships — their attachment style, what they need to feel emotionally safe, what repeated pattern tends to cause them problems in relationships, and what kind of person brings out their best. Be honest, warm, and specific. Not generic attachment theory — this person specifically.

"shadowAndSabotage": 3 complete sentences. Be direct and compassionate. Describe the specific shadow behaviours that emerge when ${name} is under stress or when their core needs go unmet (from ${lp.shadow}). What self-defeating pattern do they repeat? What is the unconscious belief driving it? What does it cost them?`;

    try {
      const raw = await this.gemini.generateJSON(prompt);
      const result = raw as any;
      return {
        careerAlignment: result.careerAlignment || this.fallbackCareer(n.lp, n.expr),
        relationshipPattern: result.relationshipPattern || this.fallbackRelationship(n.su, n.lp),
        shadowAndSabotage: result.shadowAndSabotage || this.fallbackShadow(n.lp),
      };
    } catch {
      return {
        careerAlignment: this.fallbackCareer(n.lp, n.expr),
        relationshipPattern: this.fallbackRelationship(n.su, n.lp),
        shadowAndSabotage: this.fallbackShadow(n.lp),
      };
    }
  }

  // ── EVOLUTION BATCH ──────────────────────────────────────────────
  // growthPath: maturity + what to develop
  // pinnacleInsight: current chapter
  // challengeInsight: recurring test

  private async generateEvolutionInsights(
    n: { lp: number; su: number; expr: number; pers: number; bd: number; mat: number; py: number; pm: number; pinnacle: number; challenge: number },
    name: string,
  ): Promise<{ growthPath: string; pinnacleInsight: string; challengeInsight: string }> {
    const matBase = LIFE_PATH_FULL[n.mat] || LIFE_PATH_FULL[1];
    const pinnacleBase = LIFE_PATH_FULL[n.pinnacle] || LIFE_PATH_FULL[1];
    const lp = LP_TRAITS[n.lp] || LP_TRAITS[1];

    const prompt = `You are Lumen, the intelligence core of Lumis — a private self-understanding platform.
Write three evolution-focused insights for ${name} in second person, warm and honest.

Numerology data:
- Life Path: ${n.lp} (${(LIFE_PATH_FULL[n.lp] || LIFE_PATH_FULL[1]).title})
- Maturity Number: ${n.mat} (${matBase.title}) — who ${name} is becoming over time
- Current Pinnacle: ${n.pinnacle} (${pinnacleBase.title}) — the chapter they are currently living
- Personal Year: ${n.py} — ${PERSONAL_YEAR_THEMES[n.py] || 'a significant year'}
- Core Challenge: ${n.challenge} — recurring life theme
- Current shadow pattern: ${lp.shadow}

Return ONLY valid JSON with these exact keys:

"growthPath": 3 complete sentences. Based on Maturity ${n.mat} and Life Path ${n.lp}: describe who ${name} is in the process of becoming — not who they are now, but what quality or capacity is slowly developing in them across time. What does their next level actually require them to do differently? What do they need to let go of from their current way of being to access it?

"pinnacleInsight": 3 complete sentences. Based on Pinnacle ${n.pinnacle} during Personal Year ${n.py}: describe what this current life chapter is asking of ${name}. What is being built, tested, or resolved right now? What does this particular combination of energies mean for the next 1-3 years?

"challengeInsight": 3 complete sentences. Based on Challenge number ${n.challenge} against Life Path ${n.lp}: identify the specific recurring pattern that keeps showing up across different areas of ${name}'s life. What is the life lesson that keeps returning? What is the invitation within this difficulty — what becomes available when they finally meet it fully?`;

    try {
      const raw = await this.gemini.generateJSON(prompt);
      const result = raw as any;
      return {
        growthPath: result.growthPath || this.fallbackGrowthPath(n.mat, n.lp),
        pinnacleInsight: result.pinnacleInsight || this.fallbackPinnacle(n.pinnacle, n.py),
        challengeInsight: result.challengeInsight || this.fallbackChallenge(n.challenge, n.lp),
      };
    } catch {
      return {
        growthPath: this.fallbackGrowthPath(n.mat, n.lp),
        pinnacleInsight: this.fallbackPinnacle(n.pinnacle, n.py),
        challengeInsight: this.fallbackChallenge(n.challenge, n.lp),
      };
    }
  }

  private buildPersonalMonthText(pm: number, py: number): string {
    const monthTheme = PERSONAL_MONTH_THEMES[pm] || 'a focused energetic period';
    const yearTheme = PERSONAL_YEAR_THEMES[py] || '';
    return `Personal Month ${pm} — ${monthTheme}. Within your Personal Year ${py} of ${yearTheme}, this month narrows the theme further: ${this.getMonthInYearContext(pm, py)}.`;
  }

  private getMonthInYearContext(pm: number, py: number): string {
    if (pm === py) return 'the year\'s central theme comes into sharpest focus this month — what you do now sets the tone for the rest of the cycle';
    if (pm === 1) return 'even within this larger year cycle, fresh starts and decisive moves are available to you right now';
    if (pm === 9) return 'this month asks for release and completion — clear what is finished before the next cycle opens';
    if (pm === 7) return 'pull inward this month; reflection deepens what the year is building';
    if (pm === 5) return 'something unexpected may shift your plans — stay fluid rather than forcing the original direction';
    return 'the month\'s energy adds a specific texture to this year\'s larger work — pay attention to what it is asking of you';
  }

  // ── SELF-SPECIFIC STATIC DESCRIPTIONS ──────────────────────────

  private getSelfExpressionDescription(n: number): string {
    const e = EXPR_TRAITS[n] || EXPR_TRAITS[1];
    const desc: Record<number, string> = {
      1: `Your Expression 1 means you naturally show up as a leader and initiator — authority radiates from you before you have even spoken. Your style is ${e.style}, and your greatest professional strength is ${e.strength}. The challenge you will keep meeting is learning that asking for help is not weakness; it is proof of security.`,
      2: `Your Expression 2 means you communicate through sensitivity, attunement, and a rare ability to hold two sides of a conflict without losing yourself. Your style is ${e.style}, and you are most powerful through ${e.strength}. The recurring challenge is expressing your own needs with the same eloquence you bring to everyone else's.`,
      3: `Your Expression 3 means language, creativity, and infectious energy are your natural currencies. Your style is ${e.style} — people feel lighter after time with you. The challenge is bringing depth into your expression, not just width and brightness.`,
      4: `Your Expression 4 means you express yourself through competence, precision, and doing what you say you will do. Your style is ${e.style}. People trust you structurally before they trust you emotionally. The recurring challenge is expressing emotional openness with the same fluency you bring to tasks.`,
      5: `Your Expression 5 means you naturally persuade, inspire, and communicate through enthusiasm and lived experience. Your style is ${e.style} and your strength is ${e.strength}. The challenge that will follow you is expressing commitment in ways that others find genuinely believable over time.`,
      6: `Your Expression 6 means you express yourself through warmth, responsibility, and care — your style is ${e.style}. People feel your love through what you do for them. The recurring challenge is expressing your own needs before they solidify into unexpressed resentment.`,
      7: `Your Expression 7 means you express yourself with precision, depth, and an economy of words that makes every sentence count. Your style is ${e.style}. When you speak, people listen. The challenge — the one that costs you most — is expressing emotion as freely as you express thought.`,
      8: `Your Expression 8 means you naturally project authority, ambition, and competence. Your style is ${e.style} and you thrive through ${e.workStyle}. The recurring challenge is expressing the warmth and vulnerability that exist inside — the parts of you that never quite find their way out.`,
      9: `Your Expression 9 means you express yourself through wisdom, empathy, and a kind of love that transcends ordinary categories. Your style is ${e.style}. The challenge is expressing limits with the same love you express acceptance — and learning that boundaries are an act of care, not rejection.`,
      11: 'Your Expression 11 means your words and presence carry an unusual charge. People feel something shift when you speak — not because of what you say but because of how it lands. You communicate insight before analysis, intuition before logic. The recurring challenge is grounding your perception into forms others can receive, not just sense.',
      22: 'Your Expression 22 means you communicate on two levels simultaneously — the visionary and the structural. You can articulate what doesn\'t exist yet in enough concrete detail to build it. This is an extraordinary combination. The challenge is patience with people who cannot see what you can already see in full.',
      33: 'Your Expression 33 means you express yourself through love as a living act — through warmth, teaching, and a quality of presence that genuinely creates safety for others to grow. People feel held by your expression, not just heard. The challenge is keeping your own voice intact within the depth of care you offer.',
    };
    return desc[n] || desc[1];
  }

  private getSelfPersonalityDescription(n: number): string {
    const desc: Record<number, string> = {
      1: 'Your Personality 1 means the world perceives decisiveness and certainty in you before you have proven them. Your bearing communicates authority. This is an enormous advantage — and can become an isolating pressure when you are actually uncertain.',
      2: 'Your Personality 2 means you read as naturally approachable and easy to be around. People are drawn to you without knowing why. The gap between how you appear and the complexity you carry inside is often wider than anyone suspects.',
      3: 'Your Personality 3 means the world sees joy, expressiveness, and light. People feel better just being near you. The distance between how you appear and how you actually feel can be quietly exhausting to sustain.',
      4: 'Your Personality 4 means the world reads you as stable, dependable, and solid. People lean on this projection instinctively, often before knowing you well. The weight of that expectation is real and rarely acknowledged.',
      5: 'Your Personality 5 means the world perceives excitement, possibility, and energy. Your presence suggests that something interesting is about to happen. This draws people toward you — and creates expectations you may not always want to carry.',
      6: 'Your Personality 6 means the world perceives warmth, safety, and competent care. People assume you will take care of things. This is both a gift and a burden that can become invisible over time.',
      7: 'Your Personality 7 means the world reads you as thoughtful, reserved, and deeply intelligent. There is a quality of stillness that reads as confidence even when it is actually inwardness. This creates both respect and a particular kind of distance.',
      8: 'Your Personality 8 means the world perceives authority before you have demonstrated it. Something in how you hold your presence says: this person knows what they are doing. This opens doors — and attracts projections you will need to manage.',
      9: 'Your Personality 9 means people perceive depth and compassion before you have done anything to earn it. They feel they can tell you things. This is a profound gift — and a relational responsibility that can become very heavy if unexamined.',
      11: 'Your Personality 11 means the world perceives decisiveness and certainty in you before you have proven them. Your bearing communicates a kind of luminous authority — something between intuition and conviction. This is an enormous advantage — and can become an isolating pressure when you feel uncertain inside but the world expects you to know.',
      22: 'Your Personality 22 means the world perceives capability and solidity on an unusual scale. People sense that you can handle things they could not. This projects authority and magnetism — and carries with it the weight of others\' expectations that you build, fix, or lead.',
      33: 'Your Personality 33 means the world perceives warmth, wisdom, and unconditional care in you — a rare quality that makes people feel immediately safe. You are drawn to as a refuge. The gift is profound. The challenge is that the need others have for your warmth can exceed what is sustainable without active boundaries.',
    };
    return desc[n] || desc[1];
  }

  private getSelfBirthdayDescription(bd: number): string {
    const ord = bd === 1 ? 'st' : bd === 2 ? 'nd' : bd === 3 ? 'rd' : 'th';
    return `Born on the ${bd}${ord}, this is the natural gift — the thing you can do without trying that others spend years trying to develop. It is the most immediate expression of your energy and simultaneously the thing most easily taken for granted, including by you. When life goes sideways, this number is always the first place to return to.`;
  }

  // ── FALLBACKS (deterministic — no AI needed) ─────────────────────

  private fallbackEmotionalCore(lp: number, su: number): string {
    const l = LP_TRAITS[lp] || LP_TRAITS[1];
    const s = SU_TRAITS[su] || SU_TRAITS[1];
    return `You are emotionally wired to be ${l.emotion}. At your deepest level, what you crave is ${s.desire} — and when life denies you this, ${s.unmetPattern}. The gap between how you process emotion internally and what others see from the outside is one of the defining tensions of your inner life.`;
  }

  private fallbackInnerConflict(lp: number, su: number): string {
    const l = LP_TRAITS[lp] || LP_TRAITS[1];
    const s = SU_TRAITS[su] || SU_TRAITS[1];
    return `Your Life Path drives you toward ${l.motivation}, but your Soul Urge quietly hungers for ${s.desire}. These two forces do not always point in the same direction — and the friction between them is where your deepest stuck points live. The work is not choosing one over the other, but learning how they can serve each other.`;
  }

  private fallbackBehaviorPattern(lp: number, expr: number): string {
    const l = LP_TRAITS[lp] || LP_TRAITS[1];
    const e = EXPR_TRAITS[expr] || EXPR_TRAITS[1];
    return `You move through the world in a way that is ${e.style} on the surface, driven underneath by ${l.motivation}. Your behavioural pattern is: ${l.behavior}. The strength people experience in you is ${e.strength}; the recurring challenge is ${e.challenge}.`;
  }

  private fallbackCareer(lp: number, expr: number): string {
    const l = LP_TRAITS[lp] || LP_TRAITS[1];
    const e = EXPR_TRAITS[expr] || EXPR_TRAITS[1];
    return `You are built for ${l.career} — environments where ${e.workStyle}. Your professional strength is ${e.strength}. The career risk to watch is ${e.challenge}, which can quietly limit how far your ability actually takes you.`;
  }

  private fallbackRelationship(su: number, lp: number): string {
    const s = SU_TRAITS[su] || SU_TRAITS[1];
    return `In close relationships, your deepest need is ${s.desire}. ${s.relationship}. The pattern that tends to cost you most is what happens when this need goes unmet: ${s.unmetPattern}.`;
  }

  private fallbackShadow(lp: number): string {
    const l = LP_TRAITS[lp] || LP_TRAITS[1];
    return `Under stress or when your core needs go unmet, your shadow pattern is: ${l.shadow}. This is not who you are — it is what you default to when the system is under too much pressure. Recognising this pattern is the first and most important step in interrupting it.`;
  }

  private fallbackGrowthPath(mat: number, lp: number): string {
    const base = LIFE_PATH_FULL[mat] || LIFE_PATH_FULL[1];
    return `Your Maturity Number ${mat} — ${base.title} — describes who you are in the process of becoming, not who you are right now. The qualities of this number become increasingly available to you as you move through your life. Your next level requires releasing some of the harder-edged patterns of your Life Path ${lp} to make room for what is trying to emerge.`;
  }

  private fallbackPinnacle(pinnacle: number, py: number): string {
    const base = LIFE_PATH_FULL[pinnacle] || LIFE_PATH_FULL[1];
    return `Your current Pinnacle is ${pinnacle} — ${base.title}. ${base.full.split('.')[0]}. This pinnacle, combined with your Personal Year ${py}, is shaping the major themes and tests of this particular chapter of your life.`;
  }

  private fallbackChallenge(challenge: number, lp: number): string {
    return `Your Core Challenge is ${challenge} — a recurring theme that life keeps presenting until something essential is learned. Against your Life Path ${lp}, this challenge is not a flaw to fix; it is the friction that refines you. The invitation within it becomes clearer the more honestly you face it.`;
  }

  // ── MEMBER-FACING METHODS (unchanged) ────────────────────────────

  private async generateTheirNumbersInYourLife(
    m: { lp: number; su: number; expr: number; pers: number; bd: number; mat: number; py: number; pm: number },
    memberName: string, relation: string, userName: string,
    u: { lp: number; su: number; expr: number; py: number },
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

  private async generateCompatibilityTexts(
    numbers: { uLP: number; mLP: number; uSU: number; mSU: number; uExpr: number; mExpr: number; uPY: number; mPY: number },
    userName: string, memberName: string, relation: string,
    scores: { lifePathScore: number; soulUrgeScore: number; expressionScore: number; yearAlignmentScore: number },
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
        lifePath: `Life Path ${numbers.uLP} and Life Path ${numbers.mLP} approach life from ${Math.abs(numbers.uLP - numbers.mLP) <= 2 ? 'compatible angles' : 'notably different angles'}, creating ${scores.lifePathScore > 70 ? 'natural harmony' : 'productive friction'} in how you each understand purpose and direction.`,
        soulUrge: `Your Soul Urge ${numbers.uSU} and their Soul Urge ${numbers.mSU} reveal ${scores.soulUrgeScore > 70 ? 'overlapping' : 'contrasting'} deep needs — understanding this distinction changes how you interpret their hardest behaviours.`,
        expression: `Expression ${numbers.uExpr} meets Expression ${numbers.mExpr}: your communication registers ${scores.expressionScore > 70 ? 'overlap naturally' : 'differ enough'} to require either ease or deliberate translation between you.`,
        yearAlignment: `${userName} is in a Personal Year ${numbers.uPY} while ${memberName} is in a Personal Year ${numbers.mPY} — ${Math.abs(numbers.uPY - numbers.mPY) <= 2 ? 'your cycles are reasonably aligned this year' : 'your life phases are out of sync, which explains some of the timing frustrations between you'}.`,
        synthesis: `The numerological contrast between ${userName} and ${memberName} is both the source of their friction and the engine of their growth. Understanding this at a structural level moves the relationship from a struggle for sameness to an appreciation of genuine contrast.`,
      };
    }
  }

  private getExpressionDescription(n: number): string {
    const desc: Record<number, string> = {
      1:'Expression 1 means the world sees them as a natural leader and initiator. Their presence carries authority even when they aren\'t trying. Their challenge is learning to express vulnerability without interpreting it as weakness.',
      2:'Expression 2 means they express themselves through sensitivity, tact, and an extraordinary ability to understand both sides. Their challenge is expressing their own needs with the same eloquence they use for everyone else\'s.',
      3:'Expression 3 means they express themselves through language, creativity, and infectious optimism. People feel lighter after spending time with them. Their challenge is developing depth of expression — not just width.',
      4:'Expression 4 means they express themselves through competence, reliability, and careful execution. People trust them because they do what they say. Their challenge is expressing spontaneity and emotional openness.',
      5:'Expression 5 means they express themselves through enthusiasm, variety, and an ability to persuade. Their challenge is expressing commitment in ways that others find believable.',
      6:'Expression 6 means they express themselves through warmth, care, and responsibility. Their challenge is expressing their own needs instead of anticipating everyone else\'s.',
      7:'Expression 7 means they express themselves through careful observation, precision, and depth. When they do speak, people listen. Their challenge is expressing emotion as freely as they express intellect.',
      8:'Expression 8 means they naturally express authority, competence, and ambition. Their challenge is expressing warmth — the parts of them that exist but rarely find voice.',
      9:'Expression 9 means they express themselves through wisdom, empathy, and a kind of love that is difficult to put into boxes. Their challenge is expressing boundaries with the same love they express acceptance.',
      11:'Expression 11 means they communicate with a kind of quiet electricity — their words land differently than others\'. People feel illuminated after conversations with them. Their challenge is grounding their vision into forms others can receive, not just feel.',
      22:'Expression 22 means they express themselves through vision and architecture simultaneously — they can see what doesn\'t yet exist and describe it in concrete enough terms to build it. Their challenge is patience with people operating at smaller scale.',
      33:'Expression 33 means they express themselves through love as a creative force — warmth, teaching, and a quality of presence that makes others feel genuinely safe to grow. Their challenge is maintaining their own voice within the depth of care they offer.',
    };
    return desc[n] || desc[1];
  }

  private getPersonalityDescription(n: number): string {
    const desc: Record<number, string> = {
      1:'Personality 1: the world sees decisiveness before they\'ve proven it. Their bearing communicates certainty. This is an enormous advantage — and can be an isolating pressure.',
      2:'Personality 2: the world perceives them as someone easy to be around. People feel comfortable approaching them. The gap between how they appear and the complexity within can be significant.',
      3:'Personality 3: the world sees someone naturally joyful and expressive. People feel lighter around them quickly. The gap between how they appear and how they feel internally can be exhausting to maintain.',
      4:'Personality 4: the world perceives them as stable and solid. People lean on this projection even before they know them well.',
      5:'Personality 5: the world sees excitement and energy. Their presence communicates possibility. This draws people in and can create expectations they may not want to carry.',
      6:'Personality 6: the world perceives safety and warmth. People assume they will take care of things. This is a gift — and a weight.',
      7:'Personality 7: the world perceives them as thoughtful, somewhat reserved, and deeply intelligent. There is a quality of calm that reads as confidence even when it is actually introversion.',
      8:'Personality 8: the world sees authority before they demonstrate it. Something in how they hold their presence communicates competence and direction.',
      9:'Personality 9: the world perceives depth and compassion before they\'ve done anything to earn it. People feel they can tell them things. This is a profound gift and a relational responsibility.',
      11:'Personality 11: the world perceives luminous authority — a quality of certainty and intuition that reads as wisdom before it has been demonstrated. This is a powerful advantage — and an isolating pressure when uncertainty is what is actually present.',
      22:'Personality 22: the world perceives capability on an unusual scale. People sense they can handle what others cannot. This attracts both admiration and the weight of others\' expectations to build, fix, or lead.',
      33:'Personality 33: the world perceives warmth, wisdom, and a quality of unconditional care that is rare and immediately felt. People are drawn to them as a safe harbour. The weight of this perception is that others may need from them more than is sustainable.',
    };
    return desc[n] || desc[1];
  }

  private getBirthdayDescription(bd: number): string {
    const ord = bd === 1 ? 'st' : bd === 2 ? 'nd' : bd === 3 ? 'rd' : 'th';
    return `Born on the ${bd}${ord}, this is the natural gift — the thing they can do without trying that others work years to develop. It is the easiest expression of their energy and simultaneously the thing most easily taken for granted by those around them.`;
  }

  private getMaturityDescription(n: number): string {
    const base = LIFE_PATH_FULL[n] || LIFE_PATH_FULL[1];
    return `Maturity Number ${n} — ${base.title}: ${base.full.split('.').slice(0, 2).join('.')}. This number activates gradually, becoming more prominent after the midpoint of life.`;
  }

  private fallbackTheirNumbers(
    m: { lp: number; su: number; expr: number; pers: number; bd: number; mat: number; py: number; pm: number },
    memberName: string, userName: string,
  ): Record<string, string> {
    return {
      lifePath: `Their Life Path ${m.lp} (${LIFE_PATH_LABELS[m.lp]}) is the direction their soul is pointed — not their personality, but their purpose. Understanding this number is the key to understanding why they do what they do, especially in the moments that confuse ${userName} most.`,
      expression: `Their Expression ${m.expr} is how they naturally show up in the world. When their expression doesn\'t match what ${userName} needs, it is rarely intentional.`,
      soulUrge: `Their Soul Urge ${m.su} — ${SOUL_URGE_LABELS[m.su] || ''} — is what they are quietly hungry for beneath every interaction. When this need goes unmet, the behaviours that are hardest to be around tend to emerge.`,
      personality: `Their Personality ${m.pers} is the first impression. The gap between how they appear and how they actually feel is often wider than people expect.`,
      birthday: `Their Birthday ${m.bd} is the gift they were born carrying. When ${memberName} suppresses this gift, ${userName} tends to see a dimmer version of who they actually are.`,
      maturity: `Their Maturity Number ${m.mat} is who they are in the process of becoming. The version of them in your relationship today is transitional.`,
      personalYear: `Their Personal Year ${m.py} (${PERSONAL_YEAR_THEMES[m.py] || ''}) shapes everything they bring to your relationship this year. This is not personal to ${userName} — it is the weather their soul is moving through.`,
      personalMonth: `Their Personal Month ${m.pm} colours every interaction right now. Understanding this is the difference between taking their behaviour personally and reading it for what it actually is.`,
    };
  }
}
