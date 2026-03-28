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
      className="flex-shrink-0 px-8 pb-3 pt-3"
      style={{
        borderTop: '1px solid var(--bg-tertiary)',
        boxShadow: '0 -8px 20px 0px rgba(0,0,0,0.04)',
        background: 'var(--bg-primary)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4, marginBottom: 6 }}>
        {stats.map(({ val, label, color }, i) => {
          const opacity = 1 - (i / stats.length) * 0.55;
          return (
            <div key={label} className="text-center" style={{ opacity }}>
              <div className="font-serif" style={{ fontSize: 20, fontWeight: 300, color, lineHeight: 1, marginBottom: 2 }}>{val}</div>
              <div className="font-rounded uppercase" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.07em' }}>{label}</div>
            </div>
          );
        })}
      </div>
      <p className="font-serif italic text-center" style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5, opacity: 0.7 }}>
        &ldquo;{tagline}&rdquo;
      </p>
    </div>
  );
}
