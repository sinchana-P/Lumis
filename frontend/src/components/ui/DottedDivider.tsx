'use client';

interface DottedDividerProps {
  style?: React.CSSProperties;
}

/**
 * Standard dotted horizontal divider used across all member tab pages.
 * Uses --text-tertiary at 45% opacity so it's visible but subtle.
 */
export function DottedDivider({ style }: DottedDividerProps) {
  return (
    <div
      style={{
        width: '100%',
        height: 1,
        backgroundImage: 'repeating-linear-gradient(to right, var(--text-tertiary) 0px, var(--text-tertiary) 4px, transparent 4px, transparent 8px)',
        opacity: 0.45,
        ...style,
      }}
    />
  );
}
