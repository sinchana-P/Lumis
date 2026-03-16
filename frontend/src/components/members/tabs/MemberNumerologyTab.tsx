'use client';

import { useState } from 'react';
import {
  getNumerologyDataForMember,
  type CoreNumberData,
  type TimingNumberData,
  type CompatibilityData,
} from '@/data/mockNumerologyData';

interface Member {
  id: string;
  fullName: string;
  nickname?: string;
  dateOfBirth?: string;
  [key: string]: any;
}

interface MemberNumerologyTabProps {
  member: Member;
}

type TabId = 'core' | 'timing' | 'compatibility';

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥'];

// ─── Theme helpers ────────────────────────────────────────────────────────────

const coreThemes = [
  { bg: 'bg-accent-secondary/5', border: 'border-l-accent-secondary/30', number: 'text-accent-secondary', accent: 'text-accent-secondary/70' },
  { bg: 'bg-accent-ai/5',        border: 'border-l-accent-ai/30',        number: 'text-accent-ai',        accent: 'text-accent-ai/70'        },
  { bg: 'bg-accent-secondary/5', border: 'border-l-accent-secondary/30', number: 'text-accent-secondary', accent: 'text-accent-secondary/70' },
  { bg: 'bg-accent-primary/5',   border: 'border-l-accent-primary/30',   number: 'text-accent-primary',   accent: 'text-accent-primary/70'   },
  { bg: 'bg-accent-secondary/5', border: 'border-l-accent-secondary/30', number: 'text-accent-secondary', accent: 'text-accent-secondary/70' },
  { bg: 'bg-accent-primary/5',   border: 'border-l-accent-primary/30',   number: 'text-accent-primary',   accent: 'text-accent-primary/70'   },
];

const timingThemes = [
  { bg: 'bg-accent-gold/8',    border: 'border-l-accent-gold/40',    number: 'text-accent-gold',    accent: 'text-accent-gold/70',    glow: 'shadow-accent-gold/10'    },
  { bg: 'bg-accent-ai/5',      border: 'border-l-accent-ai/30',      number: 'text-accent-ai',      accent: 'text-accent-ai/70',      glow: 'shadow-accent-ai/5'      },
  { bg: 'bg-accent-primary/5', border: 'border-l-accent-primary/30', number: 'text-accent-primary', accent: 'text-accent-primary/70', glow: 'shadow-accent-primary/5' },
];

function getCompatibilityTheme(score: number) {
  if (score >= 80) return { bg: 'bg-accent-primary/5',   border: 'border-l-accent-primary/30',   number: 'text-accent-primary',   accent: 'text-accent-primary/70',   label: 'Harmonious',    progressBg: 'bg-[#E0D8CC]' };
  if (score >= 60) return { bg: 'bg-accent-gold/5',      border: 'border-l-accent-gold/30',      number: 'text-accent-gold',      accent: 'text-accent-gold/70',      label: 'Complementary', progressBg: 'bg-[#E0D8CC]' };
  if (score >= 40) return { bg: 'bg-accent-secondary/5', border: 'border-l-accent-secondary/30', number: 'text-accent-secondary', accent: 'text-accent-secondary/70', label: 'Challenging',   progressBg: 'bg-[#E0D8CC]' };
  return               { bg: 'bg-tertiary/5',            border: 'border-l-tertiary/30',          number: 'text-tertiary',         accent: 'text-tertiary/70',         label: 'Complex',       progressBg: 'bg-[#E0D8CC]' };
}

// ─── Expand/Collapse chevron ──────────────────────────────────────────────────

function Chevron({ open, accent }: { open: boolean; accent: string }) {
  return (
    <svg className={`w-4 h-4 ${accent} transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
         fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── Expanded insight card ────────────────────────────────────────────────────

function InsightCard({ icon, title, body, accent }: { icon: React.ReactNode; title: React.ReactNode; body: string; accent: string }) {
  return (
    <div className="bg-secondary border border-primary/30 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-4 h-4 ${accent}`}>{icon}</span>
        <h4 className="font-sans text-sm text-primary font-medium">{title}</h4>
      </div>
      <p className="font-serif text-base leading-relaxed italic" style={{ color: 'var(--text-tertiary)' }}>{body}</p>
    </div>
  );
}

// ─── Core Numbers ─────────────────────────────────────────────────────────────

function CoreNumbersContent({ coreNumbers, onToggle }: {
  coreNumbers: CoreNumberData[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Description only - no duplicate header */}
      <p className="font-serif text-base leading-relaxed text-primary font-light mb-4">
        The permanent blueprint — calculated from name and date of birth
      </p>

      {/* Cards */}
      <div className="space-y-3">
        {coreNumbers.map((n, index) => {
          const theme = coreThemes[index] || coreThemes[0];
          const expanded = (n as any).expanded;

          return (
            <div key={n.id} tabIndex={-1}
                 className={`${theme.bg} border border-primary/30 border-l-4 ${theme.border} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 outline-none focus:outline-none`}>

              {/* Collapsed row */}
              <div className="flex items-center gap-5 px-5 py-4 cursor-pointer outline-none" onClick={() => onToggle(n.id)}>

                {/* Number */}
                <div className="flex flex-col items-center min-w-[52px]">
                  <span className={`text-5xl font-serif italic font-light leading-none ${theme.number}`}>
                    {n.number}
                  </span>
                  <span className={`font-serif text-xs uppercase tracking-widest ${theme.accent} mt-1 text-center leading-tight font-medium`}>
                    {n.subtitle}
                  </span>
                </div>

                {/* Divider */}
                <div className="w-px h-10 bg-primary/20 flex-shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h3 className="font-serif text-xl font-medium text-primary leading-tight" style={{ letterSpacing: '-0.01em' }}>{n.title}</h3>
                  </div>
                  <div className={`font-serif text-xs uppercase tracking-widest ${theme.accent} mb-1 font-medium`}>
                    {n.traits.join(' · ')}
                  </div>
                  <p className="font-serif text-base text-primary leading-snug">{n.description}</p>
                </div>

                <Chevron open={expanded} accent={theme.accent} />
              </div>

              {/* Expanded content */}
              {expanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-primary/10 pt-4">
                  <p className="font-serif text-base leading-relaxed text-primary">{n.expandedDescription}</p>
                  <InsightCard
                    accent={theme.accent}
                    title="Their Number in Your Life"
                    body={n.wisdomInsight}
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Timing Numbers ───────────────────────────────────────────────────────────

function TimingNumbersContent({ timingNumbers, onToggle, member }: {
  timingNumbers: TimingNumberData[];
  onToggle: (id: string) => void;
  member: Member;
}) {
  const currentYear = new Date().getFullYear();
  const personalYear = timingNumbers.find(t => t.period === 'Personal Year');

  return (
    <div className="space-y-4">
      {/* Description only - no duplicate header */}
      <p className="font-serif text-base leading-relaxed text-primary font-light mb-3">
        The cyclical influences — energies that shift and evolve through time,
        revealing the cosmic rhythm of {member.fullName}{member.nickname && <span className="ml-1 italic" style={{ color: 'var(--text-tertiary)' }}>&ldquo;{member.nickname}&rdquo;</span>}'s journey.
      </p>

      {/* Current year banner */}
      <div className="bg-accent-gold/12 border border-accent-gold/30 rounded-xl px-5 py-3 flex items-center gap-3 mb-2">
        <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse flex-shrink-0" />
        <div>
          <span className="font-mono text-xs uppercase tracking-widest font-medium mr-2" style={{ color: '#8B6A3E' }}>
            Current Year Energy: {currentYear}
          </span>
          <span className="font-serif text-sm text-primary">
            {personalYear ? `${personalYear.title} — ${personalYear.influence}` : `Deep inner work and intentional growth.`}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {timingNumbers.map((n, index) => {
          const isCurrentYear = n.year === currentYear;
          const theme = isCurrentYear ? timingThemes[0] : timingThemes[index] || timingThemes[1];
          const expanded = (n as any).expanded;

          return (
            <div key={n.id} tabIndex={-1}
                 className={`${theme.bg} border border-primary/30 border-l-4 ${theme.border} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 outline-none focus:outline-none`}>

              {/* Collapsed row */}
              <div className="flex items-center gap-5 px-5 py-4 cursor-pointer outline-none" onClick={() => onToggle(n.id)}>

                {/* Number */}
                <div className="flex flex-col items-center min-w-[52px]">
                  <span className={`text-5xl font-serif italic font-light leading-none ${theme.number}`}>
                    {n.number}
                  </span>
                  <span className={`font-serif text-xs uppercase tracking-widest ${theme.accent} mt-1 text-center leading-tight font-medium`}>
                    {n.period}
                  </span>
                </div>

                {/* Divider */}
                <div className="w-px h-10 bg-primary/20 flex-shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif text-xl font-medium text-primary leading-tight" style={{ letterSpacing: '-0.01em' }}>{n.title}</h3>
                    {n.period === 'Personal Year' && (
                      <span className="px-2 py-0.5 bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/25 rounded-full font-serif text-xs uppercase tracking-wider font-medium">
                        Live
                      </span>
                    )}
                    {n.period === 'Personal Month' && (
                      <span className="px-2 py-0.5 bg-accent-ai/15 text-accent-ai border border-accent-ai/25 rounded-full font-mono text-xs uppercase tracking-wider font-medium">
                        This Month
                      </span>
                    )}
                    {n.period === 'Life Cycles' && (
                      <span className="px-2 py-0.5 bg-accent-primary/15 text-accent-primary border border-accent-primary/25 rounded-full font-mono text-xs uppercase tracking-wider font-medium">
                        Current Phase
                      </span>
                    )}
                  </div>
                  <div className={`font-serif text-xs uppercase tracking-widest ${theme.accent} mb-1 font-medium`}>
                    {n.year ? `${n.year} • ${n.period}` : n.period}
                  </div>
                  <p className="font-serif text-base text-primary leading-snug">{n.description}</p>
                </div>

                <Chevron open={expanded} accent={theme.accent} />
              </div>

              {/* Expanded content */}
              {expanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-primary/10 pt-4">
                  <p className="font-serif text-base leading-relaxed text-primary">{n.expandedDescription}</p>
                  <InsightCard
                    accent={theme.accent}
                    title={<>Guidance for {member.fullName}{member.nickname && <span className="ml-1 italic" style={{ color: 'var(--text-tertiary)' }}>&ldquo;{member.nickname}&rdquo;</span>}</>}
                    body={n.guidanceText}
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Compatibility ────────────────────────────────────────────────────────────

function CompatibilityContent({ compatibility, member }: {
  compatibility: CompatibilityData;
  member: Member;
}) {
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const toggleCard = (id: string) => setExpandedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const getCompatibilityDescription = (score: number) => {
    if (score >= 80) return 'Deep harmonic resonance — your souls recognize each other';
    if (score >= 60) return 'Natural resonance with working friction points';
    if (score >= 40) return 'Growth through navigating contrast and difference';
    return 'Profound transformation through fundamental tension';
  };

  const overallTheme = getCompatibilityTheme(compatibility.overallScore);
  const cards = [compatibility.lifePath, compatibility.soulUrge, compatibility.compatibilityScore];

  return (
    <div className="space-y-4">
      {/* Description only - no duplicate header */}
      <p className="font-serif text-base leading-relaxed text-primary font-light mb-3">
        How your numerological blueprint meets theirs — both sides examined
      </p>

      {/* Overall score card */}
      <div className={`${overallTheme.bg} border border-primary/30 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-6 mb-2`}>
        <div className="flex flex-col items-center min-w-[64px]">
          <span className={`text-5xl font-serif italic font-light leading-none ${overallTheme.number}`}>
            {compatibility.overallScore}
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-tertiary mt-1">Overall</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-base text-primary leading-snug mb-2">{getCompatibilityDescription(compatibility.overallScore)}</p>
          <div className="h-[2px] w-full rounded-full mb-1" style={{ background: 'linear-gradient(to right, #9CAF9E, #C9A58F)' }} />
          <div className="flex justify-between font-mono text-xs uppercase tracking-widest text-tertiary">
            <span>You — LP {compatibility.lifePath.yourNumber}</span>
            <span>{member.fullName} — LP {compatibility.lifePath.theirNumber}</span>
          </div>
        </div>
      </div>

      {/* Compatibility cards */}
      <div className="space-y-3">
        {cards.map((card) => {
          const theme = getCompatibilityTheme(card.score);
          const isExpanded = expandedCards.includes(card.id);

          return (
            <div key={card.id}
                 className={`${theme.bg} border border-primary/30 border-l-4 ${theme.border} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 outline-none focus:outline-none`}>

              {/* Collapsed row */}
              <div className="flex items-center gap-5 px-5 py-4 cursor-pointer outline-none" onClick={() => toggleCard(card.id)}>

                {/* Two numbers */}
                <div className="flex items-center gap-2 min-w-[80px]">
                  <span className={`text-3xl font-serif italic font-light leading-none ${theme.number}`}>{card.yourNumber}</span>
                  <svg className={`w-5 h-4 ${theme.accent} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18m0 0l-4-4m4 4l-4 4" />
                  </svg>
                  <span className={`text-3xl font-serif italic font-light leading-none ${theme.number}`}>{card.theirNumber}</span>
                </div>

                {/* Divider */}
                <div className="w-px h-10 bg-primary/20 flex-shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-xl font-medium text-primary leading-tight mb-0.5" style={{ letterSpacing: '-0.01em' }}>{card.title}</h3>
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 h-1.5 ${theme.progressBg} rounded-full overflow-hidden`}>
                      <div className={`h-full ${theme.number.replace('text-', 'bg-')} transition-all duration-700`} style={{ width: `${card.score}%` }} />
                    </div>
                    <span className={`font-mono text-xs uppercase tracking-wider ${theme.accent} font-medium flex-shrink-0`}>
                      {card.score}% · {theme.label}
                    </span>
                  </div>
                </div>

                <Chevron open={isExpanded} accent={theme.accent} />
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-primary/10 pt-4">
                  <p className="font-serif text-base leading-relaxed text-primary">{card.expandedContent}</p>
                  <InsightCard
                    accent={theme.accent}
                    title="Lumis Assessment"
                    body={card.lumisAssessment}
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                      </svg>
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function MemberNumerologyTab({ member }: MemberNumerologyTabProps) {
  const [activeTab, setActiveTab] = useState<TabId>('core');
  const data = getNumerologyDataForMember(member.id);

  const [coreNumbers, setCoreNumbers] = useState(data.coreNumbers.map(n => ({ ...n, expanded: false })));
  const [timingNumbers, setTimingNumbers] = useState(data.timingNumbers.map(n => ({ ...n, expanded: false })));
  const compatibility = data.compatibility;

  const toggleCoreNumber = (id: string) =>
    setCoreNumbers(prev => prev.map(n => n.id === id ? { ...n, expanded: !n.expanded } : n));
  const toggleTimingNumber = (id: string) =>
    setTimingNumbers(prev => prev.map(n => n.id === id ? { ...n, expanded: !n.expanded } : n));

  const tabStyle = (id: TabId, color: string) =>
    `group flex items-center gap-2 pb-4 whitespace-nowrap transition-all duration-300 font-mono text-xs uppercase tracking-widest font-medium outline-none focus:outline-none ${
      activeTab === id ? `${color} border-b border-current` : 'text-tertiary hover:text-primary'
    }`;

  return (
    <div className="w-full max-w-none">
      {/* Tab Navigation */}
      <div className="flex border-b border-primary/20 gap-10 overflow-x-auto mb-8">
        <button onClick={() => setActiveTab('core')} className={tabStyle('core', 'text-accent-primary')}>
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTab === 'core' ? 'bg-accent-primary' : 'bg-tertiary group-hover:bg-primary'}`} />
          Core Numbers
        </button>
        <button onClick={() => setActiveTab('timing')} className={tabStyle('timing', 'text-accent-ai')}>
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTab === 'timing' ? 'bg-accent-ai' : 'bg-tertiary group-hover:bg-primary'}`} />
          Timing Numbers
        </button>
        <button onClick={() => setActiveTab('compatibility')} className={tabStyle('compatibility', 'text-accent-secondary')}>
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTab === 'compatibility' ? 'bg-accent-secondary' : 'bg-tertiary group-hover:bg-primary'}`} />
          Compatibility
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'core' && <CoreNumbersContent coreNumbers={coreNumbers} onToggle={toggleCoreNumber} />}
        {activeTab === 'timing' && <TimingNumbersContent timingNumbers={timingNumbers} onToggle={toggleTimingNumber} member={member} />}
        {activeTab === 'compatibility' && <CompatibilityContent compatibility={compatibility} member={member} />}
      </div>
    </div>
  );
}
