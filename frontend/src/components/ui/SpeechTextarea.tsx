'use client';

import { useSpeechToText, Waveform } from './SpeechInput';

interface SpeechTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  minHeight?: number;
  accentColor?: string;
  accentLightColor?: string;
}

/**
 * Textarea with built-in speech-to-text.
 * Glows + shows waveform when listening — same pattern as Journal.
 */
export function SpeechTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  minHeight,
  accentColor = 'var(--accent-primary)',
  accentLightColor = 'var(--accent-primary-light)',
}: SpeechTextareaProps) {
  const speech = useSpeechToText({
    onCapture: (data) => onChange(value ? value + ' ' + data.text : data.text),
  });

  const listening = speech.state === 'listening';

  return (
    <div
      style={{
        borderRadius: 10,
        border: `1.5px solid ${listening ? accentColor : 'var(--bg-tertiary)'}`,
        background: 'var(--bg-secondary)',
        boxShadow: listening ? `0 0 0 3px ${accentLightColor}` : 'none',
        transition: 'border-color 200ms, box-shadow 200ms',
        overflow: 'hidden',
      }}
    >
      {/* Waveform row — visible only while listening */}
      {listening && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px',
            borderBottom: '1px solid var(--bg-tertiary)',
          }}
        >
          <Waveform active />
          {speech.interimText && (
            <span className="font-serif" style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              {speech.interimText}
            </span>
          )}
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          padding: '10px 12px',
          fontFamily: 'var(--font-serif, serif)',
          fontSize: 14,
          color: 'var(--text-primary)',
          lineHeight: 1.6,
          ...(minHeight ? { minHeight } : {}),
        }}
      />

      {/* Bottom bar: status + mic button */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px',
          borderTop: '1px solid var(--bg-tertiary)',
        }}
      >
        <span className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>
          {listening ? `${speech.duration}s · listening` : 'tap mic to speak'}
        </span>

        <button
          type="button"
          onClick={listening ? speech.stop : speech.start}
          style={{
            width: 28, height: 28,
            borderRadius: '50%',
            border: `1px solid ${listening ? accentColor : 'var(--bg-tertiary)'}`,
            background: listening ? accentLightColor : 'transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 200ms',
          }}
        >
          {listening ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="5" width="14" height="14" rx="2" fill={accentColor} />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="var(--text-tertiary)" />
              <path d="M5 11c0 3.866 3.134 7 7 7s7-3.134 7-7" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="9" y1="22" x2="15" y2="22" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
