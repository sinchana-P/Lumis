'use client';

import { useState } from 'react';
import { useGetMyNumerologyQuery } from '@/store/api/numerologyApi';
import { TabFooter } from '@/components/ui/TabFooter';

// ── Archetype + heading lookup tables ─────────────────────────────────────────

const LP_ARCHETYPES: Record<number, string> = {
  1: 'The Pioneer', 2: 'The Peacemaker', 3: 'The Expressive', 4: 'The Builder',
  5: 'The Free Spirit', 6: 'The Nurturer', 7: 'The Seeker', 8: 'The Powerhouse',
  9: 'The Humanitarian', 11: 'The Illuminator', 22: 'The Master Builder', 33: 'The Master Teacher',
};
const EXPR_ARCHETYPES: Record<number, string> = {
  1: 'The Leader', 2: 'The Mediator', 3: 'The Communicator', 4: 'The Craftsman',
  5: 'The Adapter', 6: 'The Caretaker', 7: 'The Analyst', 8: 'The Executive', 9: 'The Sage',
  11: 'The Visionary', 22: 'The Architect', 33: 'The Healer',
};
const SU_ARCHETYPES: Record<number, string> = {
  1: 'The Sovereign', 2: 'The Receiver', 3: 'The Creator', 4: 'The Anchor',
  5: 'The Explorer', 6: 'The Devoted', 7: 'The Seeker', 8: 'The Architect',
  9: 'The Servant', 11: 'The Intuitive', 22: 'The Builder', 33: 'The Channel',
};
const PERS_ARCHETYPES: Record<number, string> = {
  1: 'The Decisive', 2: 'The Approachable', 3: 'The Radiant', 4: 'The Solid',
  5: 'The Magnetic', 6: 'The Warm', 7: 'The Still', 8: 'The Commander',
  9: 'The Compassionate', 11: 'The Luminary', 22: 'The Capable', 33: 'The Refuge',
};
const BD_ARCHETYPES: Record<number, string> = {
  1: 'The Initiator', 2: 'The Sensitive', 3: 'The Creator', 4: 'The Builder',
  5: 'The Adventurer', 6: 'The Nurturer', 7: 'The Analyst', 8: 'The Executive',
  9: 'The Sage',
};

const LP_HEADINGS: Record<number, string> = {
  1: 'Independence, leadership & original thought',
  2: 'Sensitivity, partnership & deep attunement',
  3: 'Expression, creativity & authentic joy',
  4: 'Structure, discipline & foundations',
  5: 'Freedom, change & sensory adventure',
  6: 'Love, nurturing & responsibility',
  7: 'Solitude, truth & inner wisdom',
  8: 'Power, authority & material mastery',
  9: 'Compassion, completion & universal love',
  11: 'Illumination, intuition & spiritual depth',
  22: 'Vision, mastery & civilisational scale',
  33: 'Unconditional love, healing & service',
};
const EXPR_HEADINGS: Record<number, string> = {
  1: 'Leadership, initiative & natural authority',
  2: 'Empathy, tact & quiet perception',
  3: 'Creativity, expression & infectious energy',
  4: 'Competence, precision & deep reliability',
  5: 'Persuasion, adaptability & magnetic presence',
  6: 'Warmth, responsibility & genuine care',
  7: 'Depth, precision & quiet intelligence',
  8: 'Authority, ambition & commanding presence',
  9: 'Wisdom, compassion & universal expression',
  11: 'Inspiration, intuitive charge & visionary voice',
  22: 'Vision, structure & civilisational scale',
  33: 'Love as expression, teaching & transformation',
};
const SU_HEADINGS: Record<number, string> = {
  1: 'Self-determination & the right to lead',
  2: 'Reciprocity, depth & being truly received',
  3: 'Expression, celebration & creative joy',
  4: 'Security, order & reliable foundations',
  5: 'Freedom, movement & boundless experience',
  6: 'Love, belonging & nurturing connection',
  7: 'Truth, depth & real understanding',
  8: 'Legacy, mastery & meaningful power',
  9: 'Meaning, service & universal contribution',
  11: 'Illumination, intuition & self-determination',
};
const PERS_HEADINGS: Record<number, string> = {
  1: 'Decisiveness, authority & certainty',
  2: 'Warmth, approachability & quiet ease',
  3: 'Joy, brightness & natural expressiveness',
  4: 'Stability, reliability & solid groundedness',
  5: 'Excitement, energy & magnetic possibility',
  6: 'Safety, warmth & competent care',
  7: 'Intelligence, thoughtfulness & still presence',
  8: 'Authority, competence & commanding presence',
  9: 'Depth, compassion & quiet wisdom',
  11: 'Authority, decisiveness & certainty',
};

const PERSONAL_YEAR_THEMES: Record<number, string> = {
  1: 'New Beginnings', 2: 'Patience & Deepening', 3: 'Creativity & Expansion',
  4: 'Work & Foundation', 5: 'Change & Freedom', 6: 'Love & Responsibility',
  7: 'Inner Reflection', 8: 'Power & Results', 9: 'Completion & Release',
};

// Section orb colors
const ORB_COLORS: Record<string, string> = {
  core: 'var(--accent-primary)',
  presence: 'var(--accent-secondary)',
  evolution: 'var(--accent-ai)',
  emotional: 'var(--accent-primary)',
  lifework: '#C4A87A',
  shadow: '#C47A7A',
  cycle: 'var(--accent-primary)',
  architecture: 'var(--accent-secondary)',
};

type InnerTab = 'blueprint' | 'insights' | 'rightnow';

const INNER_TABS: { id: InnerTab; label: string }[] = [
  { id: 'blueprint', label: 'Blueprint' },
  { id: 'insights',  label: 'Deep Insights' },
  { id: 'rightnow',  label: 'Right Now' },
];

// ── Layout atoms ──────────────────────────────────────────────────────────────

const TYPE_LABEL: React.CSSProperties = {
  fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500,
  letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-tertiary)',
  marginBottom: 6,
};

const ARCHETYPE_LABEL: React.CSSProperties = {
  fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 400,
  letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-tertiary)',
  marginTop: 8,
};

// ── Section label with orb + underline ───────────────────────────────────────

function SectionLabel({ children, orbColor, first }: { children: React.ReactNode; orbColor: string; first?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      paddingTop: first ? 16 : 20, paddingBottom: 12, marginBottom: 4,
      borderBottom: '1px solid var(--bg-tertiary)',
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: orbColor, opacity: 0.7, flexShrink: 0 }} />
      <p style={{
        fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500,
        letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-tertiary)',
        margin: 0,
      }}>
        {children}
      </p>
    </div>
  );
}

// ── Number row ────────────────────────────────────────────────────────────────

function NumberRow({
  number, typeLabel, archetype, heading, description, color,
}: {
  number: number; typeLabel: string; archetype?: string; heading: string;
  description: string; color: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const truncated = description.length > 240;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '0 32px', padding: '20px 0' }}>
        {/* Left: type label + big number + archetype */}
        <div style={{ paddingTop: 2 }}>
          <p style={TYPE_LABEL}>{typeLabel}</p>
          <p className="font-serif" style={{ fontSize: 52, fontWeight: 300, color, lineHeight: 1 }}>
            {number}
          </p>
          {archetype && <p style={ARCHETYPE_LABEL}>{archetype}</p>}
        </div>
        {/* Right: serif heading + description */}
        <div style={{ paddingTop: 4 }}>
          <h3 className="font-serif" style={{
            fontSize: 18, fontWeight: 400, color: 'var(--text-primary)',
            marginBottom: 10, letterSpacing: '0.01em', lineHeight: 1.3,
          }}>
            {heading}
          </h3>
          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            {expanded || !truncated ? description : `${description.slice(0, 240)}…`}
          </p>
          {truncated && (
            <button onClick={() => setExpanded(v => !v)} style={{
              marginTop: 10, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 400,
              letterSpacing: '0.18em', textTransform: 'uppercase', color,
              background: 'none', border: 'none', borderBottom: '1px solid transparent',
              cursor: 'pointer', padding: 0, transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderBottomColor = color)}
              onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {expanded ? 'Show less ←' : 'Read more →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Text row (for insight paragraphs) ────────────────────────────────────────

function TextRow({ typeLabel, heading, text, accentColor }: {
  typeLabel: string; heading: string; text: string; accentColor?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const truncated = text.length > 300;
  const color = accentColor || 'var(--accent-primary)';

  return (
    <div>
      <div style={{ padding: '18px 0' }}>
        <p style={{ ...TYPE_LABEL, marginBottom: 8 }}>{typeLabel}</p>
        <h3 className="font-serif" style={{
          fontSize: 18, fontWeight: 400, color: 'var(--text-primary)',
          marginBottom: 10, letterSpacing: '0.01em', lineHeight: 1.3,
        }}>
          {heading}
        </h3>
        <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {expanded || !truncated ? text : `${text.slice(0, 300)}…`}
        </p>
        {truncated && (
          <button onClick={() => setExpanded(v => !v)} style={{
            marginTop: 10, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 400,
            letterSpacing: '0.18em', textTransform: 'uppercase', color,
            background: 'none', border: 'none', borderBottom: '1px solid transparent',
            cursor: 'pointer', padding: 0, transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderBottomColor = color)}
            onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
          >
            {expanded ? 'Show less ←' : 'Read more →'}
          </button>
        )}
      </div>
    </div>
  );
}

// Section group wrapper — adds spacing between sections
function SectionGroup({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 8 }}>{children}</div>;
}

// ── Inner tab bar ─────────────────────────────────────────────────────────────

function InnerTabBar({ active, onChange }: { active: InnerTab; onChange: (t: InnerTab) => void }) {
  return (
    <div style={{
      display: 'flex', gap: 0,
      borderBottom: '1px solid var(--bg-tertiary)',
      padding: '0 48px', flexShrink: 0,
    }}>
      {INNER_TABS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: isActive ? 600 : 400,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
            background: 'none', border: 'none',
            borderBottom: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
            padding: '14px 20px 14px 0', marginRight: 20,
            cursor: 'pointer', transition: 'color 0.15s', marginBottom: -1,
          }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Blueprint tab ─────────────────────────────────────────────────────────────

function BlueprintTab({ c, ins }: { c: any; ins: any }) {
  const bdReduced = ((c.birthday - 1) % 9) + 1;
  return (
    <div style={{ padding: '0 48px 24px' }}>
      <SectionGroup>
        <SectionLabel orbColor={ORB_COLORS.core} first>Core Numbers</SectionLabel>
        <NumberRow
          number={c.lifePath} typeLabel="Life Path"
          archetype={LP_ARCHETYPES[c.lifePath]}
          heading={LP_HEADINGS[c.lifePath] || 'Your life path'}
          description={ins.lifePathMeaning || ''} color="var(--accent-primary)"
        />
        <NumberRow
          number={c.expression} typeLabel="Expression"
          archetype={EXPR_ARCHETYPES[c.expression]}
          heading={EXPR_HEADINGS[c.expression] || 'How you express yourself'}
          description={ins.expressionMeaning || ''} color="var(--accent-secondary)"
        />
        <NumberRow
          number={c.soulUrge} typeLabel="Soul Urge"
          archetype={SU_ARCHETYPES[c.soulUrge]}
          heading={SU_HEADINGS[c.soulUrge] || 'Your deepest desire'}
          description={ins.soulUrgeMeaning || ''} color="var(--accent-ai)"
                 />
      </SectionGroup>

      <SectionGroup>
        <SectionLabel orbColor={ORB_COLORS.presence}>Your Presence</SectionLabel>
        <NumberRow
          number={c.personality} typeLabel="Personality"
          archetype={PERS_ARCHETYPES[c.personality]}
          heading={PERS_HEADINGS[c.personality] || 'How others perceive you'}
          description={ins.personalityMeaning || ''} color="#C4A87A"
        />
        <NumberRow
          number={c.birthday} typeLabel="Birthday Gift"
          archetype={BD_ARCHETYPES[bdReduced]}
          heading="Natural talent & immediate expression"
          description={ins.birthdayMeaning || ''} color="#C4A87A"
                 />
      </SectionGroup>

      <SectionGroup>
        <SectionLabel orbColor={ORB_COLORS.evolution}>Your Evolution</SectionLabel>
        <NumberRow
          number={c.maturity} typeLabel="Maturity"
          archetype={LP_ARCHETYPES[c.maturity]}
          heading={LP_HEADINGS[c.maturity] || 'Who you are becoming'}
          description={ins.maturityMeaning || ''} color="var(--accent-primary)"
                 />
      </SectionGroup>
    </div>
  );
}

// ── Deep Insights tab ─────────────────────────────────────────────────────────

function InsightsTab({ ins }: { ins: any }) {
  return (
    <div style={{ padding: '0 48px 24px' }}>
      <SectionGroup>
        <SectionLabel orbColor={ORB_COLORS.emotional} first>Emotional Intelligence</SectionLabel>
        {ins.emotionalCore && (
          <TextRow typeLabel="Your Emotional Core" heading="Your emotional wiring" text={ins.emotionalCore} accentColor="var(--accent-primary)" />
        )}
        {ins.innerConflict && (
          <TextRow typeLabel="Inner Tension" heading="The tension within" text={ins.innerConflict} accentColor="var(--accent-ai)" />
        )}
        {ins.behaviorPattern && (
          <TextRow typeLabel="Behaviour Pattern" heading="How you move through the world" text={ins.behaviorPattern} accentColor="var(--accent-secondary)" />
        )}
      </SectionGroup>

      <SectionGroup>
        <SectionLabel orbColor={ORB_COLORS.lifework}>Life & Work</SectionLabel>
        {ins.careerAlignment && (
          <TextRow typeLabel="Career Alignment" heading="Where you thrive — and where you drain" text={ins.careerAlignment} accentColor="#C4A87A" />
        )}
        {ins.relationshipPattern && (
          <TextRow typeLabel="Relationship Pattern" heading="Your emotional architecture in close bonds" text={ins.relationshipPattern} accentColor="var(--accent-ai)" />
        )}
      </SectionGroup>

      <SectionGroup>
        <SectionLabel orbColor={ORB_COLORS.shadow}>Shadow & Growth</SectionLabel>
        {ins.shadowAndSabotage && (
          <TextRow typeLabel="Shadow & Self-Sabotage" heading="The pattern beneath the pattern" text={ins.shadowAndSabotage} accentColor="#C47A7A" />
        )}
        {ins.growthPath && (
          <TextRow typeLabel="Growth Path" heading="Who you are in the process of becoming" text={ins.growthPath} accentColor="var(--accent-primary)" />
        )}
      </SectionGroup>
    </div>
  );
}

// ── Right Now tab ─────────────────────────────────────────────────────────────

function RightNowTab({ t, ins }: { t: any; ins: any }) {
  return (
    <div style={{ padding: '0 48px 24px' }}>
      <SectionGroup>
        <SectionLabel orbColor={ORB_COLORS.cycle} first>Current Cycle</SectionLabel>
        <NumberRow
          number={t.personalYear} typeLabel="Personal Year"
          archetype={PERSONAL_YEAR_THEMES[t.personalYear]}
          heading={`A year of ${(PERSONAL_YEAR_THEMES[t.personalYear] || '').toLowerCase()}`}
          description={ins.personalYearMeaning || ''} color="var(--accent-primary)"
        />
        <NumberRow
          number={t.personalMonth} typeLabel="Personal Month"
          heading="The month's energetic quality"
          description={ins.personalMonthMeaning || ''} color="var(--accent-secondary)"
        />
        <NumberRow
          number={t.personalDay} typeLabel="Personal Day"
          heading="Today's signature"
          description="The day number tints every interaction and decision with a specific quality of attention — the energetic flavour available to you right now."
          color="var(--accent-ai)"        />
      </SectionGroup>

      <SectionGroup>
        <SectionLabel orbColor={ORB_COLORS.architecture}>Life Architecture</SectionLabel>
        {ins.pinnacleInsight && (
          <TextRow typeLabel="Current Pinnacle" heading="Your current chapter" text={ins.pinnacleInsight} accentColor="var(--accent-primary)" />
        )}
        {ins.challengeInsight && (
          <TextRow typeLabel="Core Challenge" heading="The recurring invitation" text={ins.challengeInsight} accentColor="#C47A7A" />
        )}
      </SectionGroup>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function UserNumerologyTab() {
  const { data: profile, isLoading } = useGetMyNumerologyQuery();
  const [activeTab, setActiveTab] = useState<InnerTab>('blueprint');

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="font-serif" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: 14 }}>Reading your numbers…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 48px' }}>
        <p className="font-serif" style={{ color: 'var(--text-secondary)', fontSize: 15, textAlign: 'center' }}>
          Your numerology blueprint hasn&apos;t been generated yet.
        </p>
        <p className="font-serif" style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', fontStyle: 'italic' }}>
          Use the Generate button above to calculate your personal reading.
        </p>
      </div>
    );
  }

  const { coreNumbers: c, timingNumbers: t, insights } = profile;
  const ins = insights as any;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <InnerTabBar active={activeTab} onChange={setActiveTab} />

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {activeTab === 'blueprint' && <BlueprintTab c={c} ins={ins} />}
        {activeTab === 'insights'  && <InsightsTab ins={ins} />}
        {activeTab === 'rightnow'  && <RightNowTab t={t} ins={ins} />}
      </div>

      <TabFooter
        stats={[
          { val: c.lifePath,      label: 'Life Path',      color: 'var(--accent-primary)' },
          { val: t.personalYear,  label: 'Personal Year',  color: 'var(--accent-secondary)' },
          { val: t.personalMonth, label: 'Personal Month', color: 'var(--accent-ai)' },
        ]}
        tagline="Numbers are not fate — they are the frequency you were born to work with."
      />
    </div>
  );
}
