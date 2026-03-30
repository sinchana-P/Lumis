'use client';

import { useState } from 'react';
import { useGetMyAstrologyQuery } from '@/store/api/astrologyApi';
import { TabFooter } from '@/components/ui/TabFooter';
import type { AstrologySelfInsights, AstrologyComputed } from '@/store/api/astrologyApi';

const LABEL: React.CSSProperties = {
  fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 500,
  letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-tertiary)',
  marginBottom: 5,
};

function SignRow({
  value, label, description, color, showDivider = true,
}: {
  value: string; label: string; description: string;
  color: string; showDivider?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const truncated = description.length > 220;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0 28px', padding: '20px 0' }}>
        <div style={{ paddingTop: 2 }}>
          <p style={LABEL}>{label}</p>
          <p className="font-serif" style={{ fontSize: 22, fontWeight: 300, color, lineHeight: 1.2, marginBottom: 0 }}>
            {value}
          </p>
        </div>
        <div style={{ paddingTop: 2 }}>
          <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            {expanded || !truncated ? description : `${description.slice(0, 220)}…`}
          </p>
          {truncated && (
            <button onClick={() => setExpanded(v => !v)} style={{
              marginTop: 8, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase', color, background: 'none',
              border: 'none', cursor: 'pointer', padding: 0,
            }}>
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
      {showDivider && <div style={{ height: 1, background: 'var(--bg-tertiary)', opacity: 0.6 }} />}
    </div>
  );
}

function TextRow({ label, text, color, showDivider = true }: {
  label: string; text: string; color?: string; showDivider?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const truncated = text.length > 280;

  return (
    <div>
      <div style={{ padding: '18px 0' }}>
        <p style={{ ...LABEL, color: color || 'var(--text-tertiary)' }}>{label}</p>
        <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {expanded || !truncated ? text : `${text.slice(0, 280)}…`}
        </p>
        {truncated && (
          <button onClick={() => setExpanded(v => !v)} style={{
            marginTop: 8, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: color || 'var(--text-tertiary)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
      {showDivider && <div style={{ height: 1, background: 'var(--bg-tertiary)', opacity: 0.6 }} />}
    </div>
  );
}

function DashaRow({
  mahadasha, antardasha, insight, showDivider = true,
}: {
  mahadasha: AstrologyComputed['dasha']['currentMahadasha'];
  antardasha: AstrologyComputed['dasha']['currentAntardasha'];
  insight?: string;
  showDivider?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const truncated = (insight?.length ?? 0) > 280;

  return (
    <div>
      <div style={{ padding: '20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0 28px' }}>
          <div>
            <p style={LABEL}>Mahadasha</p>
            <p className="font-serif" style={{ fontSize: 22, fontWeight: 300, color: 'var(--accent-primary)', lineHeight: 1.2 }}>
              {mahadasha.planet}
            </p>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>
              until {mahadasha.endDate}
            </p>
          </div>
          <div>
            <p style={LABEL}>Antardasha</p>
            <p className="font-serif" style={{ fontSize: 22, fontWeight: 300, color: 'var(--accent-secondary)', lineHeight: 1.2 }}>
              {antardasha.planet}
            </p>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>
              until {antardasha.endDate}
            </p>
          </div>
        </div>
        {insight && (
          <div style={{ marginTop: 16 }}>
            <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {expanded || !truncated ? insight : `${insight.slice(0, 280)}…`}
            </p>
            {truncated && (
              <button onClick={() => setExpanded(v => !v)} style={{
                marginTop: 8, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}>
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}
      </div>
      {showDivider && <div style={{ height: 1, background: 'var(--bg-tertiary)', opacity: 0.6 }} />}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: 'var(--text-tertiary)', opacity: 0.55,
      paddingTop: 24, paddingBottom: 4,
    }}>
      {children}
    </p>
  );
}

function PlanetsTable({ planets }: { planets: AstrologyComputed['planets'] }) {
  const dignityColor: Record<string, string> = {
    exalted: 'var(--accent-primary)',
    own: 'var(--accent-secondary)',
    debilitated: '#C47A7A',
    neutral: 'var(--text-tertiary)',
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
          {['Planet', 'Sign', 'House', 'Dignity'].map(h => (
            <th
              key={h}
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 8, letterSpacing: '0.1em', color: 'var(--text-tertiary)',
                padding: '8px 0', textAlign: 'left', fontWeight: 500,
                textTransform: 'uppercase',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {planets.map((p, i) => (
          <tr
            key={p.name}
            style={{ borderBottom: i < planets.length - 1 ? '1px solid var(--bg-tertiary)' : 'none' }}
          >
            <td style={{ padding: '8px 0' }}>
              <span className="font-rounded" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                {p.name}
                {p.isRetrograde && (
                  <span style={{ marginLeft: 3, fontSize: 9, color: '#C4A87A' }}>R</span>
                )}
              </span>
            </td>
            <td style={{ padding: '8px 0' }}>
              <span className="font-serif" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {p.sign.split(' ')[0]}
              </span>
            </td>
            <td style={{ padding: '8px 0' }}>
              <span className="font-rounded" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {p.house}
              </span>
            </td>
            <td style={{ padding: '8px 0' }}>
              <span
                className="font-rounded capitalize"
                style={{
                  fontSize: 10,
                  color: dignityColor[p.dignity || 'neutral'] || 'var(--text-tertiary)',
                }}
              >
                {p.dignity || 'neutral'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function UserAstrologyTab() {
  const { data: profile, isLoading } = useGetMyAstrologyQuery();

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="font-serif" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: 14 }}>
          Reading your chart…
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 48px' }}>
        <p className="font-serif" style={{ color: 'var(--text-secondary)', fontSize: 15, textAlign: 'center' }}>
          Your Vedic astrology reading hasn't been generated yet.
        </p>
        <p className="font-serif" style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', fontStyle: 'italic' }}>
          Use the Generate button above to calculate your birth chart reading.
        </p>
      </div>
    );
  }

  const { computed, insights } = profile;
  const ins = insights as unknown as AstrologySelfInsights;

  const moonSignShort = computed.moonSign.split(' ')[0];
  const lagnaShort = computed.ascendant.split(' ')[0];
  const sunSignShort = computed.sunSign.split(' ')[0];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 16px' }}>

        {/* Birth Signature */}
        <SectionLabel>Birth Signature</SectionLabel>
        <SignRow value={moonSignShort} label="Moon Sign" description="Your emotional instincts, inner rhythms, and the quality of feeling that runs beneath your surface." color="var(--accent-ai)" />
        <SignRow value={computed.nakshatra} label="Nakshatra" description={`${computed.nakshatra} — the lunar mansion that shades the tone of your Moon, adding specific qualities to how you process feeling and make meaning.`} color="var(--accent-primary)" />
        <SignRow value={lagnaShort} label="Ascendant" description="Your rising sign — the lens through which you meet the world and the mask the world first sees." color="var(--accent-secondary)" />
        <SignRow value={sunSignShort} label="Sun Sign" description="Your solar identity — the core of your conscious self-expression and the life-force you are here to radiate." color="#C4A87A" />

        {/* Soul Purpose */}
        {ins.soulPurpose && (
          <>
            <SectionLabel>Soul Purpose</SectionLabel>
            <TextRow label="Why You Are Here" text={ins.soulPurpose} color="var(--accent-primary)" showDivider={false} />
          </>
        )}

        {/* Inner World */}
        {(ins.innerWorld || ins.emotionalGift) && (
          <>
            <SectionLabel>Inner World</SectionLabel>
            {ins.innerWorld && <TextRow label="How You Feel" text={ins.innerWorld} color="var(--accent-ai)" />}
            {ins.emotionalGift && <TextRow label="Emotional Gift" text={ins.emotionalGift} color="var(--accent-ai)" showDivider={false} />}
          </>
        )}

        {/* Shadow & Nourishment */}
        {(ins.shadowAndGrowth || ins.whatNourishesYou) && (
          <>
            <SectionLabel>Shadow & Nourishment</SectionLabel>
            {ins.shadowAndGrowth && <TextRow label="Shadow & Growth" text={ins.shadowAndGrowth} color="#C47A7A" />}
            {ins.whatNourishesYou && <TextRow label="What Nourishes You" text={ins.whatNourishesYou} color="#7FA87A" showDivider={false} />}
          </>
        )}

        {/* Current Life Phase */}
        <SectionLabel>Current Life Phase</SectionLabel>
        <DashaRow
          mahadasha={computed.dasha.currentMahadasha}
          antardasha={computed.dasha.currentAntardasha}
          insight={ins.currentLifePhase}
        />
        {ins.whenYouStruggle && <TextRow label="When You Struggle" text={ins.whenYouStruggle} color="#C4A87A" showDivider={false} />}

        {/* Planetary Gifts */}
        {(ins.planetaryGifts || ins.yogaBlessings) && (
          <>
            <SectionLabel>Your Chart</SectionLabel>
            {ins.planetaryGifts && <TextRow label="Planetary Gifts" text={ins.planetaryGifts} color="var(--accent-primary)" />}
            {ins.yogaBlessings && <TextRow label="Yoga Blessings" text={ins.yogaBlessings} color="var(--accent-secondary)" showDivider={false} />}
          </>
        )}

        {/* Upcoming Phase */}
        {ins.upcomingPhase && (
          <>
            <SectionLabel>Upcoming Phase</SectionLabel>
            <div style={{ padding: '6px 0 4px' }}>
              <p style={LABEL}>Next — {computed.dasha.nextMahadasha.planet} Mahadasha begins {computed.dasha.nextMahadasha.startDate}</p>
            </div>
            <TextRow label="" text={ins.upcomingPhase} color="var(--accent-ai)" showDivider={false} />
          </>
        )}

        {/* Planets */}
        <SectionLabel>Planets</SectionLabel>
        <div style={{ paddingTop: 8, paddingBottom: 16 }}>
          <PlanetsTable planets={computed.planets} />
        </div>

        <div style={{ height: 8 }} />
      </div>

      <TabFooter
        stats={[
          { val: moonSignShort, label: 'Moon Sign', color: 'var(--accent-ai)' },
          { val: computed.dasha.currentMahadasha.planet, label: 'Mahadasha', color: 'var(--accent-primary)' },
          { val: computed.nakshatra, label: 'Nakshatra', color: 'var(--accent-secondary)' },
        ]}
        tagline="The sky at your birth is not your destiny — it is your instruction manual."
      />
    </div>
  );
}
