'use client';

import { useState } from 'react';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { useLumenSelfReportQuery } from '@/store/api/lumenApi';

// ── Paragraph block ───────────────────────────────────────────────────────────

function ReportBlock({ text }: { text: string }) {
  return (
    <p className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.8 }}>
      {text}
    </p>
  );
}

export function UserSelfReportTab() {
  const [generated, setGenerated] = useState(false);
  const { data: response, isLoading, isFetching, refetch } = useLumenSelfReportQuery(undefined, {
    skip: !generated,
  });

  const report = response?.data?.text ?? '';
  const paragraphs = report
    ? report.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
    : [];

  if (!generated) {
    return (
      <div style={{ paddingTop: 48, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <p className="font-serif" style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.6 }}>
          Your Self-Intelligence Report
        </p>
        <p className="font-serif italic" style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 32, lineHeight: 1.7 }}>
          Lumen will synthesise your numerology, astrology, and self-tracked traits into a personal intelligence portrait — a reflection of who you are and how you move through the world.
        </p>
        <button
          onClick={() => setGenerated(true)}
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: 11, padding: '10px 28px', borderRadius: 8, border: '1px solid var(--accent-ai)', background: 'transparent', color: 'var(--accent-ai)', cursor: 'pointer' }}>
          Generate Report
        </button>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div style={{ paddingTop: 48, textAlign: 'center' }}>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          Lumen is reflecting…
        </p>
        <p className="font-serif italic" style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 8 }}>
          This may take a moment.
        </p>
      </div>
    );
  }

  if (!response || !report) {
    return (
      <div style={{ paddingTop: 48, textAlign: 'center' }}>
        <p className="font-serif italic" style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 20 }}>
          Could not generate report. Make sure you have your birth date, time, and place set in your profile.
        </p>
        <button onClick={() => refetch()}
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: 10, padding: '8px 20px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8 }}>
          Lumen · Self Intelligence Report
        </p>
        <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
          Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <DottedDivider style={{ marginBottom: 28 }} />

      {/* Report body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {paragraphs.map((p, i) => <ReportBlock key={i} text={p} />)}
      </div>

      <DottedDivider style={{ marginTop: 32, marginBottom: 20 }} />

      {/* Regenerate */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => refetch()} disabled={isFetching}
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: 10, padding: '7px 18px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-tertiary)', cursor: isFetching ? 'default' : 'pointer', opacity: isFetching ? 0.5 : 1 }}>
          Regenerate
        </button>
      </div>
    </div>
  );
}
