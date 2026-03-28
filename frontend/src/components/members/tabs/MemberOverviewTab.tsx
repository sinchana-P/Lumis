'use client';

import React from 'react';
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

const LABEL: React.CSSProperties = {
  fontFamily: "'Nunito', sans-serif",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
};

export function MemberOverviewTab({ member }: MemberOverviewTabProps) {
  const d = mockData;

  return (
    <div className="h-full overflow-y-auto flex flex-col gap-6" style={{ padding: '32px' }}>

      {/* ── Identity ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-x-12 gap-y-3">
        <div>
          <p style={{ ...LABEL, marginBottom: 4 }}>Relationship</p>
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
            <p style={{ ...LABEL, marginBottom: 4 }}>Date of Birth</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)', flexShrink: 0, display: 'block' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1 }}>
                {new Date(member.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              {member.timeOfBirth && (
                <>
                  <span style={{ width: 12 }} />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)', flexShrink: 0, display: 'block' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1 }}>{member.timeOfBirth}</span>
                </>
              )}
            </div>
          </div>
        )}
        {member.placeOfBirth && (
          <div>
            <p style={{ ...LABEL, marginBottom: 4 }}>Origin</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)', flexShrink: 0, display: 'block' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1 }}>{member.placeOfBirth}</span>
            </div>
          </div>
        )}
      </div>

      <DottedDivider />

      {/* ── Activity Pulse ───────────────────────────────── */}
      <div>
        <p style={{ ...LABEL, marginBottom: 16 }}>Activity Pulse</p>
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
                <p style={{ ...LABEL, marginTop: 4 }}>{label}</p>
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
        <p style={{ ...LABEL, marginBottom: 12 }}>Last Journal Signal</p>
        <div className="flex items-start gap-3">
          <span
            style={{ ...LABEL, flexShrink: 0, marginTop: 2, padding: '2px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--bg-tertiary)', opacity: 1, color: 'var(--text-tertiary)' }}
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
        <p style={{ ...LABEL, marginBottom: 12 }}>How You Tend to Feel Around Them</p>
        <div className="flex flex-wrap gap-2">
          {d.topEmotions.map((e) => <Pill key={e} label={e} />)}
        </div>
      </div>

      <DottedDivider />

      {/* ── Connection Health ─────────────────────────────── */}
      <div>
        <p style={{ ...LABEL, marginBottom: 16 }}>Connection Health</p>
        <div style={{ border: '1px solid var(--bg-tertiary)', borderRadius: 12, overflow: 'hidden' }}>
          {[
            { label: 'Relationship Health', value: `${d.health.score}%`, fill: d.health.score,     status: d.health.label,      color: 'var(--accent-primary)' },
            { label: 'Communication Flow',  value: `${d.health.comm}`,   fill: d.health.comm * 10, status: d.health.commLabel,  color: 'var(--accent-secondary)' },
            { label: 'Growth Potential',    value: 'High',               fill: d.health.growth,    status: d.health.growthLabel, color: 'var(--accent-ai)' },
          ].map(({ label, value, fill, status, color }, i, arr) => (
            <div
              key={label}
              className="flex items-center gap-6"
              style={{
                padding: '16px 20px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--bg-tertiary)' : 'none',
              }}
            >
              <p className="font-serif flex-shrink-0" style={{ fontSize: 14, color: 'var(--text-primary)', width: 160 }}>{label}</p>
              <div className="flex-1 relative" style={{ height: 1, background: 'var(--bg-tertiary)' }}>
                <div className="absolute left-0 top-0" style={{ height: 1, width: `${fill}%`, background: color }} />
              </div>
              <span className="font-serif flex-shrink-0 text-right" style={{ fontSize: 15, fontWeight: 600, color, width: 40 }}>{value}</span>
              <span className="font-rounded uppercase tracking-widest flex-shrink-0" style={{ fontSize: 11, color, width: 88 }}>{status}</span>
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
