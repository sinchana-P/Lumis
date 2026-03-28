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
    <div
      className="flex-shrink-0 px-8 pb-4 pt-3"
      style={{
        boxShadow: '0 -12px 18px 0px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, marginBottom: 8 }}>
        {stats.map(({ val, label, color }, i) => {
          const opacity = 1 - (i / stats.length) * 0.6;
          return (
            <div key={label} className="text-center" style={{ opacity }}>
              <div className="font-serif" style={{ fontSize: 22, fontWeight: 300, color, lineHeight: 1, marginBottom: 2 }}>{val}</div>
              <div className="font-rounded uppercase" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.07em' }}>{label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ paddingTop: 8, borderTop: '1px solid var(--bg-tertiary)' }}>
        <p className="font-serif italic text-center" style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          &ldquo;{tagline}&rdquo;
        </p>
      </div>
    </div>
  );
}
