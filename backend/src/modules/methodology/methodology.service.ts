import { Injectable } from '@nestjs/common';

export interface FormulaBlock  { type: 'formula';     label: string; expression: string; note?: string }
export interface TableBlock    { type: 'table';      headers: string[]; rows: string[][] }
export interface ListBlock     { type: 'list';       items: { label: string; text: string; color?: string }[] }
export interface ParaBlock     { type: 'paragraph';  text: string }
export interface NoteBlock     { type: 'note';       text: string }
export interface HeadingBlock  { type: 'heading';    text: string }
export type ContentBlock = FormulaBlock | TableBlock | ListBlock | ParaBlock | NoteBlock | HeadingBlock;

export interface MethodologySection {
  id: string;
  title: string;
  subtitle: string;
  accent: string;   // hex color for left border / icon
  icon: string;     // svg path
  blocks: ContentBlock[];
}

export interface MethodologyResponse {
  version: string;
  lastUpdated: string;
  sections: MethodologySection[];
}

@Injectable()
export class MethodologyService {
  getMethodology(): MethodologyResponse {
    return {
      version: '1.0',
      lastUpdated: '2026-03-17',
      sections: [

        // ── 1. BOND SCORE ──────────────────────────────────────────────────────
        {
          id: 'bond-score',
          title: 'Bond Score',
          subtitle: 'How relationship health is calculated',
          accent: '#7AC4A8',
          icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
          blocks: [
            { type: 'paragraph', text: 'The Bond Score is a 0–100 index that reflects the overall health of a relationship based on all logged data. It is recalculated in real-time whenever new data is added.' },
            { type: 'formula', label: 'Final Score', expression: 'clamp( 50 + Traits + Interactions + Incidents + Patterns, 0, 100 )', note: 'Base of 50. Each component adjusts up or down within its allocated range.' },
            { type: 'heading', text: 'Component Weights' },
            { type: 'table',
              headers: ['Component', 'Range', 'Data Source'],
              rows: [
                ['Traits',       '±20', 'Logged pros, cons, needs, triggers'],
                ['Interactions', '±20', 'Last 10 interaction quality scores'],
                ['Incidents',    '±20', 'All logged incidents, severity × resolution'],
                ['Patterns',     '±10', 'Logged recurring dynamics'],
              ]
            },
            { type: 'heading', text: 'Traits Component' },
            { type: 'formula', label: 'Trait Score', expression: '( pros_weight − cons_weight ) / total_weight  ×  20', note: 'pros = categories: pro, strength, positive · cons = categories: con, shadow, negative, trigger, conflict' },
            { type: 'table',
              headers: ['Intensity', 'Weight'],
              rows: [['Mild', '1'], ['Moderate', '2'], ['Strong', '3']]
            },
            { type: 'heading', text: 'Interactions Component' },
            { type: 'formula', label: 'Interaction Score', expression: 'avg_quality_score( last 10 )  ×  ( 20 / 3 )' },
            { type: 'table',
              headers: ['Quality', 'Score'],
              rows: [
                ['Energised',           '+3'],
                ['Connected / Safe',    '+2'],
                ['Neutral',              '0'],
                ['Drained',             '−2'],
                ['Tense / Conflicted',  '−3'],
              ]
            },
            { type: 'heading', text: 'Incidents Component' },
            { type: 'formula', label: 'Incident Net', expression: 'Σ  resolved → +severity  |  unresolved → −severity × 1.5' },
            { type: 'formula', label: 'Incident Score', expression: 'clamp( net / max( total_incidents × 3, 1 )  ×  20,  −20, 20 )' },
            { type: 'table',
              headers: ['Severity', 'Weight'],
              rows: [['Low', '1'], ['Medium', '2'], ['High', '3']]
            },
            { type: 'note', text: 'Unresolved incidents are penalised 1.5× to reflect the ongoing emotional cost of unaddressed conflict.' },
            { type: 'heading', text: 'Patterns Component' },
            { type: 'formula', label: 'Pattern Score', expression: '( positive − negative ) / max( total, 1 )  ×  10' },
            { type: 'table',
              headers: ['Impact', 'Value'],
              rows: [['Positive', '+1'], ['Neutral', '0'], ['Negative', '−1']]
            },
          ],
        },

        // ── 2. NUMEROLOGY ──────────────────────────────────────────────────────
        {
          id: 'numerology',
          title: 'Numerology',
          subtitle: 'How every number is derived from your name and date of birth',
          accent: '#9B8DC4',
          icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
          blocks: [
            { type: 'paragraph', text: 'Lumis uses Pythagorean numerology for core numbers. Every letter maps to a digit 1–9. Compound numbers are reduced by summing digits, except Master Numbers 11, 22, and 33.' },
            { type: 'heading', text: 'Letter-to-Number Cipher' },
            { type: 'table',
              headers: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
              rows: [['A J S', 'B K T', 'C L U', 'D M V', 'E N W', 'F O X', 'G P Y', 'H Q Z', 'I R']]
            },
            { type: 'heading', text: 'Life Path Number' },
            { type: 'paragraph', text: 'The most important core number. Derived from the full date of birth.' },
            { type: 'formula', label: 'Life Path', expression: 'reduce( DD + MM + YYYY )  →  keep 11, 22, 33', note: 'Each unit (day, month, year) is reduced separately, then summed and reduced again.' },
            { type: 'heading', text: 'Soul Urge Number' },
            { type: 'paragraph', text: 'Your inner motivation and deepest desire. Derived only from the vowels in your full birth name.' },
            { type: 'formula', label: 'Soul Urge', expression: 'sum_of_vowel_values( full_birth_name ) → reduce' },
            { type: 'heading', text: 'Expression Number' },
            { type: 'paragraph', text: 'Your natural talents and abilities. Derived from all letters in the full birth name.' },
            { type: 'formula', label: 'Expression', expression: 'sum_of_all_letter_values( full_birth_name ) → reduce' },
            { type: 'heading', text: 'Personal Year' },
            { type: 'paragraph', text: 'A 9-year cycle that governs the major theme of each calendar year.' },
            { type: 'formula', label: 'Personal Year', expression: 'reduce( birth_DD + birth_MM + current_YYYY )' },
            { type: 'table',
              headers: ['Year', 'Theme'],
              rows: [
                ['1', 'New Beginnings — seeding intentions'],
                ['2', 'Patience & Partnership — relationships deepen'],
                ['3', 'Creativity & Expression — expansion and joy'],
                ['4', 'Foundation & Work — building structure'],
                ['5', 'Freedom & Change — major shifts'],
                ['6', 'Responsibility & Nurturing — home and service'],
                ['7', 'Introspection & Spirituality — inner truth'],
                ['8', 'Power & Abundance — material mastery'],
                ['9', 'Completion & Release — endings, harvest'],
              ]
            },
            { type: 'heading', text: 'Personal Month' },
            { type: 'formula', label: 'Personal Month', expression: 'reduce( Personal_Year + current_MM )' },
            { type: 'heading', text: 'Life Cycles' },
            { type: 'paragraph', text: 'Three major life phases, each approximately 27–28 years, derived from the birth date.' },
            { type: 'table',
              headers: ['Cycle', 'Period', 'Derivation'],
              rows: [
                ['First',  '0 to (36 − Life Path)', 'reduce( birth_MM )'],
                ['Second', 'Follows First',          'reduce( birth_DD )'],
                ['Third',  'Follows Second',         'reduce( birth_YYYY )'],
              ]
            },
            { type: 'heading', text: 'Core Wounds & Gifts by Life Path' },
            { type: 'table',
              headers: ['LP', 'Core Wound', 'Core Gift'],
              rows: [
                ['1',  'Invisibility as a leader',             'Courage to begin things others won\'t'],
                ['2',  'Invisible despite constant giving',    'Making people feel completely seen'],
                ['3',  'Creative self suppressed',             'Infectious creative energy and joy'],
                ['4',  'Instability, groundlessness',          'Reliability — the rarest form of love'],
                ['5',  'Containment, loss of freedom',         'Aliveness — making anything feel possible'],
                ['6',  'Being unloved when no longer useful',  'Unconditional nurturing presence'],
                ['7',  'Depth dismissed, misunderstood',       'Perception that cuts beneath every surface'],
                ['8',  'Powerlessness, failure',               'Authority to lead transformation at scale'],
                ['9',  'Loved only for what they give',        'Love large enough to hold grief and joy'],
                ['11', 'Overwhelm from sensitivity',           'Illumination — lighting up others by proximity'],
                ['22', 'Potential wasted',                     'Capacity to build what the world needs'],
              ]
            },
          ],
        },

        // ── 3. VEDIC ASTROLOGY ────────────────────────────────────────────────
        {
          id: 'astrology',
          title: 'Vedic Astrology',
          subtitle: 'Signals derived from the birth chart',
          accent: '#C4A87A',
          icon: 'M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
          blocks: [
            { type: 'paragraph', text: 'Lumis uses the Sidereal (Vedic) zodiac. Planetary positions are computed from date, time, and place of birth using Swiss Ephemeris. The chart forms the basis for three key signals used in Lumen context.' },
            { type: 'heading', text: 'Emotional Style (Moon Sign)' },
            { type: 'paragraph', text: 'The Moon sign governs how a person processes and expresses emotion. Lumis derives a simple two-category style:' },
            { type: 'table',
              headers: ['Style', 'Moon Signs', 'Meaning'],
              rows: [
                ['Fast Processor',    'Mesha, Mithuna, Simha, Dhanu, Kumbha',    'Feels → reacts → moves on quickly'],
                ['Slow Integrator',   'Vrishabha, Karkata, Kanya, Makara, Meena', 'Needs time and safety before opening'],
                ['Moderate',         'Tula, Vrischika',                           'Context-dependent emotional rhythm'],
              ]
            },
            { type: 'heading', text: 'Conflict Mode (Moon + Mars)' },
            { type: 'table',
              headers: ['Mode', 'Condition', 'Behaviour'],
              rows: [
                ['Withdraws inward',              'Moon in Karkata/Vrischika/Meena/Vrishabha/Makara  OR  Mars in 12th', 'Shuts down, needs alone time'],
                ['Confronts directly',            'Moon in Mesha/Simha/Vrischika  OR  Mars in 1st',                     'Processes out loud, needs direct engagement'],
                ['Over-explains / intellectualises', 'Moon in Mithuna/Kanya',                                           'Rationalises emotion under stress'],
                ['Complex / context-dependent',   'All other combinations',                                              'Varies by situation'],
              ]
            },
            { type: 'heading', text: 'Availability Signal (Mahadasha)' },
            { type: 'paragraph', text: 'The current Mahadasha (major planetary period) indicates whether a person is emotionally open or contracted. Each period lasts 6–20 years.' },
            { type: 'table',
              headers: ['Signal', 'Dasha Planets', 'Meaning'],
              rows: [
                ['Open',         'Jupiter, Venus, Moon',  'Expansive — receptive to growth, connection'],
                ['Contracted',   'Saturn, Rahu, Ketu',    'Inward — withdrawing, boundaries tightened'],
                ['Transitional', 'Sun, Mars, Mercury',    'Active — shifting, mid-cycle energy'],
              ]
            },
            { type: 'heading', text: 'Dasha Planet Themes' },
            { type: 'table',
              headers: ['Planet', 'Theme'],
              rows: [
                ['Sun',     'Identity, authority, self-expression'],
                ['Moon',    'Emotional receptivity, home, belonging'],
                ['Mars',    'Drive, conflict, assertion'],
                ['Mercury', 'Communication, learning, adaptability'],
                ['Jupiter', 'Expansion, wisdom, abundance'],
                ['Venus',   'Love, beauty, relationships'],
                ['Saturn',  'Discipline, karma, restriction'],
                ['Rahu',    'Obsession, materialism, ambition'],
                ['Ketu',    'Detachment, spirituality, loss'],
              ]
            },
            { type: 'heading', text: 'Nakshatra' },
            { type: 'paragraph', text: 'The 27 Nakshatras are lunar mansions that refine the Moon sign into a more precise emotional signature. Each Nakshatra has a ruling planet (lord) that further shades how the Moon energy expresses itself.' },
            { type: 'note', text: 'Birth time and place are required for accurate ascendant and house positions. Without them, Lumen uses Moon sign and Dasha only.' },
          ],
        },

        // ── 4. LUMEN AI ───────────────────────────────────────────────────────
        {
          id: 'lumen-ai',
          title: 'Lumen AI',
          subtitle: 'How the AI agent builds responses',
          accent: '#7BAFD4',
          icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
          blocks: [
            { type: 'paragraph', text: 'Lumen is a context-aware AI agent that synthesises five data layers — traits, incidents, patterns, numerology, and astrology — into emotionally intelligent responses.' },
            { type: 'heading', text: 'Model Routing' },
            { type: 'table',
              headers: ['Model', 'Role', 'Used For'],
              rows: [
                ['Gemini 1.5 Flash', 'Primary — deep analysis, 1M token window', 'Reports, Analysis, Advice, Timing modes'],
                ['Groq Llama 3.3 70B', 'Speed layer — 128k window', 'Vent, Guided modes · Gemini fallback on quota'],
                ['Cohere embed-english-v3.0', 'Embeddings — semantic search', 'Journal retrieval, memory similarity'],
              ]
            },
            { type: 'note', text: 'When Gemini hits its daily quota limit (429 / quota exceeded), Lumen automatically falls back to Groq with no disruption to the user.' },
            { type: 'heading', text: 'Conversation Modes' },
            { type: 'list', items: [
              { label: 'Vent',     color: '#C4876A', text: 'Listen only. Validate emotions. No analysis unless explicitly requested. Groq model.' },
              { label: 'Guided',   color: '#C4A87A', text: 'Ask reflective questions to deepen self-awareness. No conclusions pushed. Groq model.' },
              { label: 'Analysis', color: '#9B8DC4', text: 'Full context-aware breakdown of the dynamic. Gemini model.' },
              { label: 'Advice',   color: '#7AC4A8', text: 'Actionable NVC-based guidance for navigating the situation. Gemini model.' },
              { label: 'Timing',   color: '#7BAFD4', text: 'Numerology and astrology-based window analysis — when to act vs. wait. Gemini model.' },
            ]},
            { type: 'heading', text: 'Analysis Depth Modes' },
            { type: 'list', items: [
              { label: '✨ Full Spectrum', color: '#9B8DC4', text: 'All data layers: behavioral logs + numerology + astrology. Default mode.' },
              { label: '📊 Behavioral',   color: '#7AC4A8', text: 'Traits, incidents, patterns, interactions, journal only. Cosmic data excluded.' },
              { label: '🌙 Cosmic',        color: '#C4A87A', text: 'Numerology and astrology only. Behavioral observations excluded.' },
            ]},
            { type: 'heading', text: 'Context Assembly (per query)' },
            { type: 'list', items: [
              { label: 'User profile',   text: 'Life Path, Soul Urge, Personal Year, Moon sign, Nakshatra, Dasha, emotional style, core wound & gift, self-tracked needs & triggers' },
              { label: 'Member profile', text: 'All above fields + pros/cons/needs/triggers + last 5 interactions + last 10 incidents + last 3 journal entries (200 chars each)' },
              { label: 'Semantic memory', text: 'Vector search over all journal entries — top 3 most relevant passages to the current query (Cohere embeddings + pgvector)' },
              { label: 'Depth filter',   text: 'Depth mode strips irrelevant data layers before context is assembled' },
            ]},
            { type: 'heading', text: 'Report Generation Flow' },
            { type: 'list', items: [
              { label: '1. Load context', text: 'User + member data fetched from Supabase in parallel (numerology, astrology, traits, incidents, interactions, journals)' },
              { label: '2. Build signals', text: 'ContextBuilderService derives emotional style, conflict mode, availability signal, cycle theme from raw numbers' },
              { label: '3. Assemble prompt', text: 'System prompt (psychology frameworks) + structured context string passed to AI model' },
              { label: '4. Generate',      text: 'Gemini 1.5 Flash generates up to 4096 tokens. Falls back to Groq on quota error.' },
              { label: '5. Persist',       text: 'Full report stored in lumen_conversations table. Retrieved on next load.' },
            ]},
          ],
        },

        // ── 5. PSYCHOLOGICAL FRAMEWORKS ───────────────────────────────────────
        {
          id: 'frameworks',
          title: 'Psychological Frameworks',
          subtitle: 'The lenses Lumen uses to interpret your data',
          accent: '#C4876A',
          icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
          blocks: [
            { type: 'paragraph', text: 'Lumen\'s system prompt is grounded in five well-established psychological frameworks. These are not used diagnostically — they are interpretive lenses for generating insight.' },
            { type: 'list', items: [
              {
                label: 'Attachment Theory',
                color: '#9B8DC4',
                text: 'Bowlby & Ainsworth. Four styles — secure, anxious-preoccupied, dismissive-avoidant, fearful-avoidant. Lumen uses trait and interaction patterns to infer attachment tendencies and frame communication needs accordingly.',
              },
              {
                label: 'NVC — Nonviolent Communication',
                color: '#7AC4A8',
                text: 'Marshall Rosenberg. Observation → Feeling → Need → Request. All advice Lumen gives is structured around unmet needs, not blame. Conflict is reframed as two people with legitimate, unmet needs.',
              },
              {
                label: 'Jungian Shadow Work',
                color: '#C4A87A',
                text: 'Carl Jung. The shadow is the unconscious self — suppressed traits that project outward onto others. Core wounds map to shadow themes. Lumen surfaces them gently rather than confrontationally.',
              },
              {
                label: 'Cognitive Distortions',
                color: '#C4876A',
                text: 'CBT framework (Beck, Ellis). Patterns like catastrophising, mind-reading, black-and-white thinking, personalisation. Lumen names these when they appear in the user\'s framing without pathologising.',
              },
              {
                label: 'Polyvagal Theory',
                color: '#7BAFD4',
                text: 'Stephen Porges. The nervous system\'s three states — ventral vagal (safe), sympathetic (fight/flight), dorsal vagal (freeze/shutdown). Lumen reads availability signals and interaction quality to infer nervous system state.',
              },
            ]},
            { type: 'note', text: 'Lumis is not a therapeutic tool and does not diagnose psychological conditions. All AI output is for self-reflection and personal insight only.' },
          ],
        },

        // ── 6. DATA LAYERS ────────────────────────────────────────────────────
        {
          id: 'data-layers',
          title: 'Data Layers',
          subtitle: 'What you log and how it is used',
          accent: '#C47AA8',
          icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
          blocks: [
            { type: 'table',
              headers: ['Layer', 'What it captures', 'Used in'],
              rows: [
                ['Traits',       'Pros, cons, needs, triggers, strengths, shadows — with intensity (mild/moderate/strong)',  'Bond Score, Lumen context, reports'],
                ['Incidents',    'Significant events with date, type, severity, emotions, resolution status',                'Bond Score, Lumen context, timeline'],
                ['Interactions', 'Individual meetups/calls — quality before/after, duration, note',                         'Bond Score, Lumen context, patterns'],
                ['Journal',      'Free-text reflections — private, read by Lumen via semantic search',                       'Lumen context (top 3 relevant passages)'],
                ['Patterns',     'Named recurring dynamics with impact (positive/neutral/negative)',                          'Bond Score, Lumen context'],
                ['Numerology',   'Life Path, Soul Urge, Expression, Personal Year/Month, Life Cycles',                       'Lumen context, reports, Timing mode'],
                ['Astrology',    'Moon, Nakshatra, Dasha, Ascendant, house positions',                                       'Lumen context, reports, Timing mode'],
              ]
            },
            { type: 'heading', text: 'Privacy Principles' },
            { type: 'list', items: [
              { label: 'No public profiles',   text: 'Nothing in Lumis is public. There is no social feed, no discovery layer.' },
              { label: 'No AI training',        text: 'Your data is never used to train AI models.' },
              { label: 'Intentional sharing',   text: 'Sharing is always explicit and link-based. You control every share.' },
              { label: 'Soft deletes only',     text: 'Data is never hard-deleted — archived with deleted_at timestamps, recoverable on request.' },
              { label: 'User-scoped data',      text: 'All database tables have Row-Level Security. No query can access another user\'s data.' },
              { label: 'Encrypted in transit',  text: 'All traffic is TLS. JWT tokens expire in 15 minutes. Refresh tokens are httpOnly cookies.' },
            ]},
          ],
        },

      ],
    };
  }
}
