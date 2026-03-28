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
    <div className="flex-shrink-0 px-8 pb-6 pt-4" style={{ borderTop: '1px solid var(--bg-tertiary)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, marginBottom: 12 }}>
        {stats.map(({ val, label, color }) => (
          <div key={label} className="text-center">
            <div className="font-serif" style={{ fontSize: 26, fontWeight: 300, color, lineHeight: 1, marginBottom: 3 }}>{val}</div>
            <div className="font-sans" style={{ fontSize: 12, color: 'var(--text-tertiary)', letterSpacing: '0.01em' }}>{label}</div>
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
