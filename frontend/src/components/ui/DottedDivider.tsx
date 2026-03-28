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
        borderTop: '1px dashed',
        borderColor: 'color-mix(in srgb, var(--text-primary) 20%, transparent)',
        ...style,
      }}
    />
  );
}
