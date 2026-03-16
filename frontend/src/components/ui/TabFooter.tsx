'use client';

interface StatItem {
  val: string | number;
  label: string;
  color: string;
}

interface TabFooterProps {
  stats: StatItem[];
  tagline: string;
  columns?: number;
}

export function TabFooter({ stats, tagline, columns }: TabFooterProps) {
  const cols = columns ?? stats.length;

  return (
    <div style={{ marginTop: 28, padding: '14px 20px', border: '1px solid var(--bg-tertiary)', borderRadius: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, marginBottom: 12 }}>
        {stats.map(({ val, label, color }) => (
          <div key={label} className="text-center">
            <div className="font-serif" style={{ fontSize: 26, fontWeight: 300, color, lineHeight: 1, marginBottom: 3 }}>{val}</div>
            <div className="font-serif" style={{ fontSize: 12, color: 'var(--text-tertiary)', letterSpacing: '0.01em' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 10, borderTop: '1px solid var(--bg-tertiary)' }}>
        <p className="font-serif italic text-center" style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          &ldquo;{tagline}&rdquo;
        </p>
      </div>
    </div>
  );
}
