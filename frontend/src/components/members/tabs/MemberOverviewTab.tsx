'use client';

import { DottedDivider } from '@/components/ui/DottedDivider';

interface Member {
  id: string;
  fullName: string;
  nickname?: string;
  relationType: string;
  relationTypeCustom?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

interface MemberOverviewTabProps {
  member: Member;
}


const mockData = {
  activityPulse: {
    daysSinceLast: 23,
    interactionsThisMonth: 7,
    avgDaysBetween: 4,
    totalInteractions: 12,
    journalEntries: 6,
  },
  lastJournalEntry: {
    date: 'Mar 10',
    snippet: 'She made coffee like it was a meditation. I noticed how the morning felt different just being near her calm.',
  },
  topEmotions: ['safe', 'grateful', 'energized', 'understood', 'at ease'],
  health: {
    score: 92, label: 'Flourishing',
    comm: 8.4, commLabel: 'Resonant',
    growth: 76, growthLabel: 'Expanding',
  },
};

function Pill({ label }: { label: string }) {
  return (
    <span
      className="font-serif text-xs px-2.5 py-0.5 rounded-full capitalize"
      style={{ background: 'var(--surface)', border: '1px solid var(--bg-tertiary)', color: 'var(--text-secondary)' }}
    >
      {label}
    </span>
  );
}

export function MemberOverviewTab({ member }: MemberOverviewTabProps) {
  const d = mockData;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      {/* ── Identity ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>Relationship</p>
          <p className="font-serif text-base capitalize" style={{ color: 'var(--text-primary)' }}>
            {member.relationTypeCustom || member.relationType}
            {member.nickname && (
              <span className="ml-2 italic" style={{ color: 'var(--text-tertiary)' }}>
                &ldquo;{member.nickname}&rdquo;
              </span>
            )}
          </p>
        </div>
        {member.dateOfBirth && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>Date of Birth</p>
            <p className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>
              {new Date(member.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              {member.timeOfBirth && (
                <span className="font-mono text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>{member.timeOfBirth}</span>
              )}
            </p>
          </div>
        )}
        {member.placeOfBirth && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>Origin</p>
            <p className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>{member.placeOfBirth}</p>
          </div>
        )}
      </div>

      <DottedDivider />

      {/* ── Activity Pulse ───────────────────────────────── */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-tertiary)' }}>Activity Pulse</p>
        <div className="flex items-end gap-8">
          {[
            { value: d.activityPulse.daysSinceLast,         label: 'days since last' },
            { value: d.activityPulse.interactionsThisMonth, label: 'this month' },
            { value: d.activityPulse.avgDaysBetween,        label: 'avg days between' },
            { value: d.activityPulse.totalInteractions,     label: 'total interactions' },
            { value: d.activityPulse.journalEntries,        label: 'journal entries' },
          ].map(({ value, label }, i, arr) => (
            <div key={label} className="flex items-end gap-8">
              <div>
                <span className="font-serif" style={{ fontSize: 32, lineHeight: 1, color: 'var(--text-primary)' }}>{value}</span>
                <p className="font-mono text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
              </div>
              {i < arr.length - 1 && (
                <span className="font-serif text-lg pb-1.5" style={{ color: 'var(--bg-tertiary)' }}>&middot;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <DottedDivider />

      {/* ── Last Journal Signal ───────────────────────────── */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>Last Journal Signal</p>
        <div className="flex items-start gap-3">
          <span
            className="font-mono text-xs uppercase tracking-widest flex-shrink-0 mt-0.5 px-2 py-0.5 rounded"
            style={{ background: 'var(--surface)', color: 'var(--text-tertiary)', border: '1px solid var(--bg-tertiary)' }}
          >
            {d.lastJournalEntry.date}
          </span>
          <p className="font-serif text-base leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>
            {d.lastJournalEntry.snippet}
          </p>
        </div>
      </div>

      <DottedDivider />

      {/* ── How You Tend to Feel Around Them ─────────────── */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>How You Tend to Feel Around Them</p>
        <div className="flex flex-wrap gap-2">
          {d.topEmotions.map((e) => <Pill key={e} label={e} />)}
        </div>
      </div>

      <DottedDivider />

      {/* ── Connection Health ─────────────────────────────── */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-tertiary)' }}>Connection Health</p>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Relationship Health', value: `${d.health.score}%`, fill: d.health.score,     status: d.health.label,      color: 'var(--accent-primary)' },
            { label: 'Communication Flow',  value: `${d.health.comm}`,   fill: d.health.comm * 10, status: d.health.commLabel,  color: 'var(--accent-secondary)' },
            { label: 'Growth Potential',    value: 'High',               fill: d.health.growth,    status: d.health.growthLabel, color: 'var(--accent-ai)' },
          ].map(({ label, value, fill, status, color }) => (
            <div key={label} className="flex items-center gap-4">
              <p className="font-mono text-xs uppercase tracking-widest flex-shrink-0 w-32" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
              <div className="flex-1 h-px relative" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="absolute left-0 top-0 h-px" style={{ width: `${fill}%`, background: color }} />
              </div>
              <span className="font-serif text-base w-10 text-right flex-shrink-0" style={{ color }}>{value}</span>
              <span className="font-mono text-xs uppercase tracking-widest w-20 flex-shrink-0" style={{ color, opacity: 0.7 }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Essence ───────────────────────────────────────── */}
      {member.notes && (
        <>
          <DottedDivider />
          <div className="relative pl-5">
            <span
              className="absolute left-0 top-0 font-serif select-none"
              style={{ fontSize: 36, color: 'var(--accent-gold)', opacity: 0.3, lineHeight: 0.75 }}
            >
              &ldquo;
            </span>
            <p className="font-serif text-base leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>{member.notes}</p>
          </div>
        </>
      )}

    </div>
  );
}
