'use client';

import { useRef, useState } from 'react';

interface Member {
  id: string;
  fullName: string;
  relationType?: string;
  relationTypeCustom?: string;
  photoUrl?: string;
  [key: string]: any;
}

interface MemberAIReportTabProps {
  member: Member;
  reportText?: string | null;
  isLoading?: boolean;
  error?: string | null;
  healthScore?: number;
}

interface ReportSection {
  title: string;
  body: string;
}

// ─── Text parser ──────────────────────────────────────────────────────────────

function parseReport(text: string): { intro: string; sections: ReportSection[] } {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let intro = '';
  const sections: ReportSection[] = [];
  let current: ReportSection | null = null;

  for (const line of lines) {
    const isBold = line.startsWith('**') && line.endsWith('**') && line.length < 120;
    const isHash = /^#{1,3}\s/.test(line) && line.length < 120;
    const isNumbered = /^(\d+\.\s+[A-Z]|Section \d+[:.]\s)/.test(line) && line.length < 120;
    const isHeading = isBold || isHash || isNumbered;

    if (isHeading) {
      if (current) sections.push(current);
      const title = line
        .replace(/^\*\*|\*\*$/g, '')
        .replace(/^#+\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/^Section \d+[:.]?\s*/i, '')
        .replace(/\s*[—–].*$/, '')
        .trim();
      current = { title, body: '' };
    } else {
      if (current) {
        current.body += (current.body ? '\n\n' : '') + line;
      } else {
        intro += (intro ? '\n\n' : '') + line;
      }
    }
  }

  if (current) sections.push(current);
  return { intro, sections: sections.filter(s => s.body.trim()) };
}

// ─── Section accent config ─────────────────────────────────────────────────────

const SECTION_CONFIG = [
  {
    accent: '#9B8DC4',       // soft purple — overview / core
    label: 'Core Insight',
    iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  },
  {
    accent: '#7BAFD4',       // soft blue — behavioral
    label: 'Behavioral Patterns',
    iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    accent: '#C4876A',       // warm terracotta — emotional
    label: 'Emotional Dynamics',
    iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
  {
    accent: '#C4A87A',       // gold — cosmic / timing
    label: 'Cosmic Context',
    iconPath: 'M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    accent: '#7AC4A8',       // sage green — growth / guidance
    label: 'Growth & Guidance',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    accent: '#C47AA8',       // rose — shadow / tension
    label: 'Shadow Work',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
  },
];

// ─── Score arc visual ─────────────────────────────────────────────────────────

function ScoreArc({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? '#7AC4A8' : pct >= 45 ? '#C4A87A' : '#C47AA8';

  return (
    <svg width={72} height={72} viewBox="0 0 72 72">
      <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(155,141,196,0.2)" strokeWidth={5} />
      <circle
        cx={36} cy={36} r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ * 0.25}
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x={36} y={39} textAnchor="middle" fill="currentColor" fontSize={13} fontFamily="'JetBrains Mono', monospace" fontWeight={600}>
        {pct}
      </text>
    </svg>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: 720, paddingTop: 8 }}>
      {/* Header card skeleton */}
      <div className="rounded-2xl" style={{ height: 140, background: 'var(--bg-secondary)', marginBottom: 20 }} />
      {/* Section skeletons */}
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl" style={{ marginBottom: 12, padding: 24, background: 'var(--bg-secondary)' }}>
          <div className="rounded" style={{ height: 9, width: 140, background: 'var(--bg-tertiary)', marginBottom: 14 }} />
          {[100, 88, 72].map((w, j) => (
            <div key={j} className="rounded" style={{ height: 12, width: `${w}%`, background: 'var(--bg-tertiary)', marginBottom: 10, opacity: 0.6 - j * 0.1 }} />
          ))}
        </div>
      ))}
      {/* Pulse */}
      <div className="flex items-center justify-center gap-2 pt-6">
        {[0, 150, 300].map(delay => (
          <div key={delay} className="rounded-full animate-bounce" style={{ width: 5, height: 5, background: 'var(--accent-ai)', animationDelay: `${delay}ms` }} />
        ))}
      </div>
      <p className="font-mono text-center" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 10 }}>
        Lumen is synthesizing…
      </p>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ firstName, error }: { firstName: string; error?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ background: 'color-mix(in srgb, var(--accent-ai) 14%, transparent)' }}>
        <svg className="w-7 h-7" style={{ color: 'var(--accent-ai)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="font-serif text-2xl font-light mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        No report yet
      </h3>
      <p className="font-serif font-light max-w-xs" style={{ fontSize: 15, color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
        Generate {firstName}&apos;s Lumen Relationship Report — a full synthesis of behavioral patterns, cosmic data, and logged insights.
      </p>
      {error && (
        <p className="font-mono text-xs mt-4" style={{ color: '#ef4444', letterSpacing: '0.05em' }}>{error}</p>
      )}
    </div>
  );
}

// ─── PDF download ─────────────────────────────────────────────────────────────

async function downloadReportPDF(el: HTMLElement, memberName: string) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,   // transparent — honour the element's own background
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');

  // ── Custom page size = content size (no pagination, no blank pages) ──────
  const MARGIN = 7;        // mm padding around content
  const BORDER_INSET = 3;  // mm — border line from page edge
  const PAGE_W = 210;      // A4 width in mm
  const imgW = PAGE_W - MARGIN * 2;
  const imgH = (canvas.height * imgW) / canvas.width;
  const PAGE_H = imgH + MARGIN * 2;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [PAGE_W, PAGE_H] });

  pdf.addImage(imgData, 'PNG', MARGIN, MARGIN, imgW, imgH);

  // Single hairline border — soft lavender
  pdf.setDrawColor(155, 141, 196);
  pdf.setLineWidth(0.3);
  pdf.setLineDashPattern([], 0);
  pdf.rect(BORDER_INSET, BORDER_INSET, PAGE_W - BORDER_INSET * 2, PAGE_H - BORDER_INSET * 2);

  pdf.save(`lumen-report-${memberName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

// ─── Report view ──────────────────────────────────────────────────────────────

function ReportView({ reportText, member, healthScore }: { reportText: string; member: Member; healthScore?: number }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { intro, sections } = parseReport(reportText);

  const firstName = member.fullName.split(' ')[0];
  const relation = member.relationTypeCustom || member.relationType || '';
  const initial = member.fullName.charAt(0).toUpperCase();
  const generatedAt = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      await downloadReportPDF(reportRef.current, member.fullName);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>

      {/* ── Download button ────────────────────────────────────── */}
      <div className="flex justify-end" style={{ marginBottom: 20 }}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 transition-all"
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: '1px solid var(--bg-tertiary)',
            background: downloading ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.09em',
            textTransform: 'uppercase' as const,
            cursor: downloading ? 'not-allowed' : 'pointer',
            opacity: downloading ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!downloading) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
        >
          {downloading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
              </svg>
              Preparing…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* ── Capturable report area ─────────────────────────────── */}
      <div ref={reportRef} style={{ background: 'var(--bg-primary)' }}>

        {/* Header card */}
        <div
          className="rounded-2xl"
          style={{
            background: 'var(--bg-secondary)',
            padding: '28px 32px',
            marginBottom: 20,
            position: 'relative' as const,
            overflow: 'hidden',
            border: '1px solid var(--bg-tertiary)',
          }}
        >
          {/* Tinted gradient overlay — pure rgba so html2canvas can render it */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
            background: 'linear-gradient(135deg, rgba(155,141,196,0.18) 0%, rgba(123,175,212,0.10) 60%, rgba(196,168,122,0.08) 100%)',
          }} />

          <div className="flex items-center justify-between" style={{ position: 'relative', zIndex: 1 }}>
            {/* Left: identity */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 52, height: 52, border: '2px solid var(--bg-tertiary)', background: 'var(--accent-primary)' }}>
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={firstName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: 'white', fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 600 }}>
                    {initial}
                  </div>
                )}
              </div>

              <div>
                <p className="font-mono uppercase" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.16em', marginBottom: 4 }}>
                  Lumen · Relationship Intelligence
                </p>
                <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                  {firstName}
                  {relation && <span style={{ fontStyle: 'italic', fontSize: 18, color: 'var(--text-secondary)', marginLeft: 10 }}>— {relation}</span>}
                </h2>
                <p className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 5, letterSpacing: '0.06em' }}>
                  Generated {generatedAt}
                </p>
              </div>
            </div>

            {/* Right: score arc */}
            {healthScore !== undefined && (
              <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ zIndex: 1 }}>
                <ScoreArc score={healthScore} />
                <p className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Bond Score
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Intro card */}
        {intro && (
          <div
            className="rounded-xl"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-tertiary)',
              padding: '24px 28px',
              marginBottom: 12,
              borderLeft: '3px solid var(--accent-ai)',
            }}
          >
            <p className="font-mono uppercase" style={{ fontSize: 9, color: 'var(--accent-ai)', letterSpacing: '0.14em', marginBottom: 14 }}>
              Overview
            </p>
            {intro.split('\n\n').map((para, i) => (
              <p key={i} className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.9, marginBottom: i < intro.split('\n\n').length - 1 ? 14 : 0 }}>
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Section cards */}
        {sections.map((section, i) => {
          const cfg = SECTION_CONFIG[i % SECTION_CONFIG.length];
          return (
            <div
              key={i}
              className="rounded-xl"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--bg-tertiary)',
                padding: '22px 28px',
                marginBottom: 10,
                borderLeft: `3px solid ${cfg.accent}`,
              }}
            >
              {/* Section header */}
              <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                <div
                  className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ width: 26, height: 26, background: `${cfg.accent}22` }}
                >
                  <svg className="w-3.5 h-3.5" style={{ color: cfg.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d={cfg.iconPath} />
                  </svg>
                </div>
                <span className="font-mono uppercase" style={{ fontSize: 10, color: cfg.accent, letterSpacing: '0.13em' }}>
                  {section.title}
                </span>
              </div>

              {/* Body paragraphs */}
              {section.body.split('\n\n').map((para, j) => (
                <p key={j} className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.88, marginBottom: j < section.body.split('\n\n').length - 1 ? 12 : 0 }}>
                  {para}
                </p>
              ))}
            </div>
          );
        })}

        {/* Footer */}
        <div className="flex items-center justify-center gap-3" style={{ padding: '20px 0 4px' }}>
          <div style={{ height: 1, flex: 1, background: 'var(--bg-tertiary)' }} />
          <p className="font-mono uppercase" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.14em' }}>
            Lumen · Lumis · {generatedAt}
          </p>
          <div style={{ height: 1, flex: 1, background: 'var(--bg-tertiary)' }} />
        </div>

      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function MemberAIReportTab({ member, reportText, isLoading, error, healthScore }: MemberAIReportTabProps) {
  const firstName = member.fullName.split(' ')[0];

  if (isLoading) return <LoadingSkeleton />;
  if (!reportText) return <EmptyState firstName={firstName} error={error} />;
  return <ReportView reportText={reportText} member={member} healthScore={healthScore} />;
}
