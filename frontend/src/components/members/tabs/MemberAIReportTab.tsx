'use client';

interface Member {
  id: string;
  fullName: string;
  relationType?: string;
  relationTypeCustom?: string;
  [key: string]: any;
}

interface MemberAIReportTabProps {
  member: Member;
  reportText?: string | null;
  isLoading?: boolean;
  error?: string | null;
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

// ─── Section accent + icon config ─────────────────────────────────────────────

const SECTION_CONFIG = [
  {
    accent: 'var(--accent-ai)',
    iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  },
  {
    accent: 'var(--accent-secondary)',
    iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    accent: 'var(--accent-primary)',
    iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
  {
    accent: 'var(--accent-gold, #C4A87A)',
    iconPath: 'M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    accent: 'var(--accent-secondary)',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl" style={{ paddingTop: 8 }}>
      {/* Simulated report header */}
      <div style={{ marginBottom: 24 }}>
        <div className="rounded" style={{ height: 10, width: 200, background: 'var(--bg-tertiary)', marginBottom: 10 }} />
        <div className="rounded" style={{ height: 10, width: 280, background: 'var(--bg-tertiary)' }} />
      </div>
      <div style={{ height: 1, background: 'var(--bg-tertiary)', marginBottom: 24 }} />

      {/* Simulated intro paragraph */}
      <div style={{ marginBottom: 28 }}>
        {[100, 90, 75].map((w, i) => (
          <div key={i} className="rounded" style={{ height: 13, width: `${w}%`, background: 'var(--bg-tertiary)', marginBottom: 10, opacity: 0.7 - i * 0.1 }} />
        ))}
      </div>

      {/* Simulated sections */}
      {[1, 2, 3].map(i => (
        <div key={i} style={{ paddingTop: 24, paddingBottom: 24, borderTop: '1px solid var(--bg-tertiary)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            <div className="rounded-full" style={{ width: 14, height: 14, background: 'var(--bg-tertiary)' }} />
            <div className="rounded" style={{ height: 9, width: 140, background: 'var(--bg-tertiary)' }} />
          </div>
          {[100, 88, 72].map((w, j) => (
            <div key={j} className="rounded" style={{ height: 12, width: `${w}%`, background: 'var(--bg-tertiary)', marginBottom: 10, opacity: 0.6 - j * 0.1 }} />
          ))}
        </div>
      ))}

      {/* Pulse indicator */}
      <div className="flex items-center justify-center gap-2 pt-8">
        {[0, 150, 300].map(delay => (
          <div
            key={delay}
            className="rounded-full animate-bounce"
            style={{ width: 5, height: 5, background: 'var(--accent-ai)', animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
      <p className="font-mono text-center" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 12 }}>
        Lumen is synthesizing…
      </p>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ firstName, error }: { firstName: string; error?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'color-mix(in srgb, var(--accent-ai) 14%, transparent)' }}
      >
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

// ─── Report view ──────────────────────────────────────────────────────────────

function ReportView({ reportText, member }: { reportText: string; member: Member }) {
  const { intro, sections } = parseReport(reportText);
  const firstName = member.fullName.split(' ')[0];
  const relation = member.relationTypeCustom || member.relationType || '';
  const generatedAt = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Report metadata */}
      <div style={{ marginBottom: 24 }}>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 5, letterSpacing: '0.12em' }}>
          Lumen · Relationship Intelligence Report
        </p>
        <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
          {firstName}{relation ? ` · ${relation}` : ''} · Generated {generatedAt}
        </p>
      </div>

      <div style={{ height: 1, background: 'var(--bg-tertiary)', marginBottom: 28 }} />

      {/* Intro paragraphs */}
      {intro && (
        <div style={{ marginBottom: 8 }}>
          {intro.split('\n\n').map((para, i) => (
            <p
              key={i}
              className="font-serif"
              style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.85, marginBottom: 16 }}
            >
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Sections */}
      {sections.map((section, i) => {
        const cfg = SECTION_CONFIG[i % SECTION_CONFIG.length];
        return (
          <div
            key={i}
            style={{ paddingTop: 28, paddingBottom: 28, borderTop: '1px solid var(--bg-tertiary)' }}
          >
            {/* Section label */}
            <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: cfg.accent }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d={cfg.iconPath} />
              </svg>
              <span
                className="font-mono uppercase tracking-widest"
                style={{ fontSize: 10, color: cfg.accent, letterSpacing: '0.12em' }}
              >
                {section.title}
              </span>
            </div>

            {/* Section body */}
            {section.body.split('\n\n').map((para, j) => (
              <p
                key={j}
                className="font-serif"
                style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.85, marginBottom: 14 }}
              >
                {para}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function MemberAIReportTab({ member, reportText, isLoading, error }: MemberAIReportTabProps) {
  const firstName = member.fullName.split(' ')[0];

  if (isLoading) return <LoadingSkeleton />;
  if (!reportText) return <EmptyState firstName={firstName} error={error} />;
  return <ReportView reportText={reportText} member={member} />;
}
