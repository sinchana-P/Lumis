'use client';

import { DottedDivider } from '@/components/ui/DottedDivider';

interface UserSelfReportTabProps {
  reportText?: string | null;
  isLoading?: boolean;
  error?: string | null;
}

interface ReportSection {
  title: string;
  body: string;
}

// ─── Parse text into sections ─────────────────────────────────────────────────

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
        .replace(/\s*[—–(].*$/, '')
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

const SECTION_ACCENTS = [
  'var(--accent-ai)',
  'var(--accent-primary)',
  'var(--accent-gold, #C4A87A)',
  'var(--accent-secondary)',
];

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: 640, paddingTop: 8 }}>
      <div style={{ marginBottom: 24 }}>
        <div className="rounded" style={{ height: 10, width: 180, background: 'var(--bg-tertiary)', marginBottom: 10 }} />
        <div className="rounded" style={{ height: 10, width: 240, background: 'var(--bg-tertiary)' }} />
      </div>
      <div style={{ height: 1, background: 'var(--bg-tertiary)', marginBottom: 24 }} />
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ paddingTop: 20, paddingBottom: 20, borderTop: '1px solid var(--bg-tertiary)' }}>
          <div className="rounded" style={{ height: 9, width: 130, background: 'var(--bg-tertiary)', marginBottom: 14 }} />
          {[100, 88, 70].map((w, j) => (
            <div key={j} className="rounded" style={{ height: 12, width: `${w}%`, background: 'var(--bg-tertiary)', marginBottom: 10, opacity: 0.6 - j * 0.1 }} />
          ))}
        </div>
      ))}
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
        Lumen is reflecting…
      </p>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ error }: { error?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'color-mix(in srgb, var(--accent-ai) 14%, transparent)' }}
      >
        <svg className="w-7 h-7" style={{ color: 'var(--accent-ai)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 className="font-serif text-2xl font-light mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        Your Self-Intelligence Report
      </h3>
      <p className="font-serif font-light max-w-xs" style={{ fontSize: 15, color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
        Lumen will synthesise your numerology, astrology, and self-tracked data into a personal portrait — a reflection of who you are and how you move through the world.
      </p>
      {error && (
        <p className="font-mono text-xs mt-4" style={{ color: '#ef4444', letterSpacing: '0.05em' }}>{error}</p>
      )}
    </div>
  );
}

// ─── Report view ──────────────────────────────────────────────────────────────

function ReportView({ reportText }: { reportText: string }) {
  const { intro, sections } = parseReport(reportText);
  const generatedAt = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Metadata */}
      <div style={{ marginBottom: 24 }}>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 5, letterSpacing: '0.12em' }}>
          Lumen · Self Intelligence Report
        </p>
        <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
          Generated {generatedAt}
        </p>
      </div>

      <DottedDivider style={{ marginBottom: 28 }} />

      {/* Intro */}
      {intro && (
        <div style={{ marginBottom: 8 }}>
          {intro.split('\n\n').map((para, i) => (
            <p key={i} className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.85, marginBottom: 16 }}>
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Sections */}
      {sections.map((section, i) => {
        const accent = SECTION_ACCENTS[i % SECTION_ACCENTS.length];
        return (
          <div key={i} style={{ paddingTop: 24, paddingBottom: 24, borderTop: '1px solid var(--bg-tertiary)' }}>
            <p
              className="font-mono uppercase tracking-widest"
              style={{ fontSize: 10, color: accent, marginBottom: 14, letterSpacing: '0.12em' }}
            >
              {section.title}
            </p>
            {section.body.split('\n\n').map((para, j) => (
              <p key={j} className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.85, marginBottom: 14 }}>
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

export function UserSelfReportTab({ reportText, isLoading, error }: UserSelfReportTabProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (!reportText) return <EmptyState error={error} />;
  return <ReportView reportText={reportText} />;
}
