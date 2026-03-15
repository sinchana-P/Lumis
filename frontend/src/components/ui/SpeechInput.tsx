'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Luxury Color Tokens ──────────────────────────────────────────────────────

const T = {
  bg:          '#FDFAF7',
  surface:     '#F7F2EC',
  surface2:    '#F0E9DF',
  border:      '#E2D5C5',
  borderSoft:  '#EDE5DA',
  accent:      '#9B6E5A',
  accentSoft:  '#B8896F',
  accentGlow:  'rgba(155,110,90,0.10)',
  text:        '#2E1F14',
  textDim:     '#7A5C48',
  textMuted:   '#B09880',
  textFaint:   '#CDBAA8',
  sage:        '#5A7A52',
  sageBg:      'rgba(90,122,82,0.07)',
  rose:        '#9A5060',
  roseBg:      'rgba(154,80,96,0.07)',
  cosmic:      '#6A5890',
  cosmicBg:    'rgba(106,88,144,0.07)',
  red:         '#C04040',
  redBg:       'rgba(192,64,64,0.08)',
  gold:        '#A08050',
  goldBg:      'rgba(160,128,80,0.08)',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpeechCaptureData {
  text: string;
  context: string;
  memberId: string | null;
  duration: number;
  wordCount: number;
  timestamp: string;
  confidence: number | null;
  engine: 'webspeech' | 'whisper';
  segments: Array<{ word: string; time: number }>;
  raw: unknown;
  edited?: boolean;
}

export interface SpeechInputProps {
  context?: string;
  memberId?: string | null;
  placeholder?: string;
  onCapture: (data: SpeechCaptureData) => void;
  compact?: boolean;
  useWhisper?: boolean;
  showMeta?: boolean;
  label?: string;
  className?: string;
}

type SpeechState = 'idle' | 'listening' | 'processing' | 'done' | 'error';

const WHISPER_ENDPOINT = process.env.NEXT_PUBLIC_WHISPER_ENDPOINT ?? null;

// ─── Post-processing ──────────────────────────────────────────────────────────

const VOICE_COMMANDS: [RegExp, string][] = [
  [/\b(period|full stop)\b/gi, '.'],
  [/\bcomma\b/gi, ','],
  [/\bquestion mark\b/gi, '?'],
  [/\bexclamation mark\b/gi, '!'],
  [/\bcolon\b/gi, ':'],
  [/\bsemicolon\b/gi, ';'],
  [/\bdash\b/gi, '—'],
  [/\bellipsis\b/gi, '...'],
  [/\bnew paragraph\b/gi, '\n\n'],
  [/\bnew line\b/gi, '\n'],
  [/\bopen quote\b/gi, '\u201C'],
  [/\bclose quote\b/gi, '\u201D'],
];

function processTranscript(raw: string): { text: string; corrected: boolean } {
  let text = raw;
  const original = text;
  for (const [pattern, replacement] of VOICE_COMMANDS) text = text.replace(pattern, replacement);
  text = text.replace(/ ([.,?!:;])/g, '$1');
  text = text.replace(/\bi\b/g, 'I');
  text = text.replace(/^[a-z]/, (c) => c.toUpperCase());
  text = text.replace(/([.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase());
  text = text.replace(/  +/g, ' ').trim();
  return { text, corrected: text !== original };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSpeechToText({
  onCapture,
  context = 'note',
  memberId = null,
  useWhisper = false,
}: {
  onCapture?: (data: SpeechCaptureData) => void;
  context?: string;
  memberId?: string | null;
  useWhisper?: boolean;
}) {
  const [state, setState] = useState<SpeechState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<'webspeech' | 'whisper'>('webspeech');
  const [wasAutoCorrected, setWasAutoCorrected] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTranscriptRef = useRef('');
  const isListeningRef = useRef(false);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (state === 'listening') {
      timerRef.current = setInterval(() => {
        setDuration(parseFloat(((Date.now() - startTimeRef.current) / 1000).toFixed(1)));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  const buildOutput = useCallback(
    (text: string, extras: Partial<SpeechCaptureData> = {}): SpeechCaptureData => ({
      text: text.trim(),
      context,
      memberId,
      duration,
      wordCount: text.trim().split(/\s+/).filter(Boolean).length,
      timestamp: new Date().toISOString(),
      confidence: extras.confidence ?? null,
      engine: extras.engine ?? engine,
      segments: extras.segments ?? [],
      raw: extras.raw ?? null,
    }),
    [context, memberId, duration, engine]
  );

  const startWebSpeech = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Speech recognition not available in this browser'); setState('error'); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setEngine('webspeech'); setState('listening'); isListeningRef.current = true; startTimeRef.current = Date.now(); setError(null); };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = finalTranscriptRef.current;
      let lastConfidence: number | null = null;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const { text: cleaned, corrected } = processTranscript(result[0].transcript);
          final += cleaned + ' ';
          lastConfidence = result[0].confidence;
          if (corrected) setWasAutoCorrected(true);
        } else { interim += result[0].transcript; }
      }
      finalTranscriptRef.current = final;
      setTranscript(final);
      setInterimText(interim);
      if (lastConfidence) setConfidence(lastConfidence);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      setError(`Microphone error: ${event.error}`);
      setState('error');
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      if (isListeningRef.current) { try { recognition.start(); return; } catch { /* fall through */ } }
      setInterimText('');
      const finalText = finalTranscriptRef.current;
      if (finalText.trim()) { setState('done'); onCapture?.(buildOutput(finalText, { confidence, engine: 'webspeech' })); }
      else setState('idle');
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch { setError('Failed to start speech recognition'); setState('error'); }
  }, [buildOutput, confidence, onCapture]);

  const startWhisper = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        setState('processing');
        stream.getTracks().forEach((t) => t.stop());
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');
          const res = await fetch(WHISPER_ENDPOINT!, { method: 'POST', body: formData });
          const data = await res.json();
          const text = data.text ?? '';
          setTranscript(text); setState('done'); setEngine('whisper');
          onCapture?.(buildOutput(text, { engine: 'whisper', raw: data, segments: data.segments ?? [] }));
        } catch { setError('Whisper transcription failed.'); setState('error'); }
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setEngine('whisper'); setState('listening'); startTimeRef.current = Date.now(); setError(null);
    } catch { setError('Microphone access denied.'); setState('error'); }
  }, [buildOutput, onCapture]);

  const start = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript(''); setInterimText(''); setDuration(0); setConfidence(null); setError(null); setWasAutoCorrected(false);
    if (useWhisper && WHISPER_ENDPOINT) { startWhisper(); }
    else if (!isSupported) { setError('Speech recognition not supported. Use Chrome or Edge.'); setState('error'); }
    else startWebSpeech();
  }, [useWhisper, isSupported, startWebSpeech, startWhisper]);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    stop(); setState('idle'); setTranscript(''); setInterimText(''); setDuration(0);
    setConfidence(null); setError(null); setWasAutoCorrected(false); finalTranscriptRef.current = '';
  }, [stop]);

  return { state, transcript, interimText, confidence, duration, error, engine, wasAutoCorrected, isSupported, start, stop, reset };
}

// ─── Waveform ─────────────────────────────────────────────────────────────────

export function Waveform({ active }: { active: boolean }) {
  const bars = [0.45, 0.8, 0.55, 1, 0.65, 0.9, 0.5, 1, 0.7, 0.6, 0.85, 0.45];
  return (
    <>
      <style>{`
        @keyframes lx-wave { 0%{transform:scaleY(0.3)} 100%{transform:scaleY(1)} }
        @keyframes lx-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes lx-spin { to{transform:rotate(360deg)} }
        @keyframes lx-rise { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lx-fade { from{opacity:0} to{opacity:1} }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 20 }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            width: 2,
            borderRadius: 2,
            background: active ? T.accent : T.border,
            height: active ? `${h * 20}px` : '3px',
            transformOrigin: 'bottom',
            animation: active ? `lx-wave ${0.4 + i * 0.06}s ease-in-out ${i * 0.04}s infinite alternate` : 'none',
            transition: 'height 0.2s ease, background 0.3s ease',
          }} />
        ))}
      </div>
    </>
  );
}

// ─── Mic Button ───────────────────────────────────────────────────────────────

function MicButton({ state, onStart, onStop, compact = false }: {
  state: SpeechState; onStart: () => void; onStop: () => void; compact?: boolean;
}) {
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const size = compact ? 36 : 52;
  const iconSize = compact ? 14 : 19;

  return (
    <button
      type="button"
      onClick={isListening ? onStop : onStart}
      disabled={isProcessing}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        border: `1.5px solid ${isListening ? T.accent : T.border}`,
        background: isListening ? T.accentGlow : T.surface,
        cursor: isProcessing ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, outline: 'none',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: isListening
          ? `0 0 0 4px ${T.accentGlow}, 0 2px 12px rgba(155,110,90,0.15)`
          : `0 1px 4px rgba(46,31,20,0.06)`,
        opacity: isProcessing ? 0.5 : 1,
      }}
    >
      {isProcessing ? (
        <div style={{
          width: 14, height: 14, borderRadius: '50%',
          border: `1.5px solid ${T.borderSoft}`,
          borderTopColor: T.accent,
          animation: 'lx-spin 0.8s linear infinite',
        }} />
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <rect x="9" y="2" width="6" height="12" rx="3"
            fill={isListening ? T.accent : T.textMuted} />
          <path d="M5 11c0 3.866 3.134 7 7 7s7-3.134 7-7"
            stroke={isListening ? T.accent : T.textMuted}
            strokeWidth="1.8" strokeLinecap="round" />
          <line x1="12" y1="18" x2="12" y2="22"
            stroke={isListening ? T.accent : T.textMuted}
            strokeWidth="1.8" strokeLinecap="round" />
          <line x1="9" y1="22" x2="15" y2="22"
            stroke={isListening ? T.accent : T.textMuted}
            strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SpeechInput({
  context = 'note',
  memberId = null,
  placeholder = 'Tap the mic and speak freely...',
  onCapture,
  compact = false,
  useWhisper = false,
  showMeta = true,
  label,
  className = '',
}: SpeechInputProps) {
  const {
    state, transcript, interimText, confidence,
    duration, error, engine, wasAutoCorrected, isSupported,
    start, stop, reset,
  } = useSpeechToText({ onCapture, context, memberId, useWhisper });

  const [editableText, setEditableText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (transcript) setEditableText(transcript);
  }, [transcript]);

  const handleSave = () => {
    if (!editableText.trim()) return;
    onCapture({
      text: editableText.trim(), context, memberId, duration,
      wordCount: editableText.trim().split(/\s+/).filter(Boolean).length,
      timestamp: new Date().toISOString(), confidence, engine, segments: [], raw: null, edited: true,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const showInterim = state === 'listening' && interimText;
  const wordCount = editableText.trim().split(/\s+/).filter(Boolean).length;

  // ── Compact Mode ──
  if (compact) {
    return (
      <div className={className}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px', borderRadius: 14,
          background: T.surface,
          border: `1.5px solid ${state === 'listening' ? T.accent : T.borderSoft}`,
          boxShadow: state === 'listening' ? `0 0 0 3px ${T.accentGlow}` : '0 1px 4px rgba(46,31,20,0.05)',
          transition: 'all 0.3s ease',
        }}>
          <MicButton state={state} onStart={start} onStop={stop} compact />
          <div style={{
            flex: 1, fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: 14, lineHeight: 1.5,
            color: editableText ? T.textDim : T.textFaint,
            fontStyle: editableText ? 'normal' : 'italic',
          }}>
            {showInterim
              ? <span style={{ color: T.textFaint, fontStyle: 'italic' }}>{interimText}</span>
              : editableText || placeholder}
          </div>
          {state === 'listening' && <Waveform active />}
          {editableText && state !== 'listening' && (
            <button type="button" onClick={reset} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: T.textFaint, fontSize: 14, lineHeight: 1, padding: 2,
              transition: 'color 0.2s',
            }}>×</button>
          )}
        </div>
        {error && (
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: T.red, marginTop: 6, letterSpacing: '0.04em' }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  // ── Full Mode ──
  return (
    <div className={className}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 18, height: 1, background: T.accent, opacity: 0.4 }} />
          <span style={{
            fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase',
            letterSpacing: '0.15em', color: T.textMuted,
          }}>
            {label}
          </span>
        </div>
      )}

      <div style={{
        borderRadius: 16, overflow: 'hidden',
        background: T.bg,
        border: `1.5px solid ${state === 'listening' ? T.accent : T.border}`,
        boxShadow: state === 'listening'
          ? `0 0 0 4px ${T.accentGlow}, 0 4px 24px rgba(155,110,90,0.10)`
          : `0 2px 16px rgba(46,31,20,0.06), 0 1px 4px rgba(46,31,20,0.04)`,
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}>

        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px',
          borderBottom: `1px solid ${T.borderSoft}`,
          background: T.surface,
        }}>
          <MicButton state={state} onStart={start} onStop={stop} />

          <div style={{ flex: 1 }}>
            {state === 'idle' && (
              <p style={{
                fontFamily: "'Crimson Pro', Georgia, serif", fontSize: 14,
                fontStyle: 'italic', color: T.textFaint, margin: 0,
              }}>
                {!isSupported ? 'Voice input requires Chrome or Edge' : 'Tap to begin speaking'}
              </p>
            )}

            {state === 'listening' && (
              <div style={{ animation: 'lx-rise 0.2s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: T.accent,
                    animation: 'lx-pulse 1.2s ease-in-out infinite',
                  }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: T.accent }}>
                    Listening
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: T.textFaint }}>
                    · {duration}s
                  </span>
                </div>
                <Waveform active />
              </div>
            )}

            {state === 'processing' && (
              <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: 14, fontStyle: 'italic', color: T.textMuted, margin: 0 }}>
                Transcribing with Whisper...
              </p>
            )}

            {state === 'done' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, animation: 'lx-rise 0.2s ease-out' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: T.sage }}>
                  Captured
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: T.textFaint }}>
                  · {duration}s · {wordCount} words
                </span>
              </div>
            )}

            {state === 'error' && (
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: T.red, margin: 0, letterSpacing: '0.04em' }}>
                {error}
              </p>
            )}
          </div>

          {/* Engine badge */}
          {state !== 'idle' && (
            <span style={{
              fontFamily: 'monospace', fontSize: 9, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: T.textFaint,
              background: T.surface2, border: `1px solid ${T.borderSoft}`,
              padding: '2px 8px', borderRadius: 99,
            }}>
              {engine === 'whisper' ? 'Whisper' : 'Web Speech'}
            </span>
          )}

          {(state === 'done' || editableText) && (
            <button type="button" onClick={reset} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: T.textFaint, fontSize: 16, lineHeight: 1, padding: 4,
              transition: 'color 0.2s',
            }}>×</button>
          )}
        </div>

        {/* ── Transcript area ── */}
        <div style={{ position: 'relative', padding: '18px 20px', minHeight: 110 }}>
          {/* Fine paper texture line */}
          <div style={{
            position: 'absolute', left: 44, top: 0, bottom: 0, width: 1,
            background: `linear-gradient(to bottom, transparent, ${T.borderSoft} 10%, ${T.borderSoft} 90%, transparent)`,
            opacity: 0.5, pointerEvents: 'none',
          }} />

          {showInterim && (
            <p style={{
              position: 'absolute', bottom: 18, left: 20, right: 20,
              fontFamily: "'Crimson Pro', Georgia, serif", fontSize: 15,
              fontStyle: 'italic', color: T.textFaint,
              lineHeight: 1.85, margin: 0, pointerEvents: 'none',
            }}>
              {interimText}
            </p>
          )}

          {state === 'listening' && !interimText && !editableText && (
            <p style={{
              fontFamily: "'Crimson Pro', Georgia, serif", fontSize: 15,
              fontStyle: 'italic', color: T.textFaint, lineHeight: 1.85, margin: 0,
            }}>
              Speak freely — your words appear here in real time.
            </p>
          )}

          <textarea
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            placeholder={state === 'listening' ? '' : placeholder}
            rows={4}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              outline: 'none', resize: 'none',
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: 15.5, color: T.text,
              lineHeight: 1.9, letterSpacing: '0.012em',
              caretColor: T.accent,
            }}
          />
        </div>

        {/* ── Footer ── */}
        {(state === 'done' || editableText) && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 18px',
            borderTop: `1px solid ${T.borderSoft}`,
            background: T.surface,
            animation: 'lx-rise 0.25s ease-out',
          }}>
            {showMeta ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {confidence !== null && (
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: T.textFaint, letterSpacing: '0.08em' }}>
                    {Math.round(confidence * 100)}% confidence
                  </span>
                )}
                {wasAutoCorrected && (
                  <span style={{
                    fontFamily: 'monospace', fontSize: 9, textTransform: 'uppercase',
                    letterSpacing: '0.12em', color: T.gold,
                    background: T.goldBg, border: `1px solid rgba(160,128,80,0.2)`,
                    padding: '2px 7px', borderRadius: 4,
                  }}>
                    auto-corrected
                  </span>
                )}
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: T.textFaint, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {context}
                </span>
              </div>
            ) : <div />}

            <button
              type="button"
              onClick={handleSave}
              style={{
                fontFamily: 'monospace', fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '0.14em',
                padding: '6px 18px', borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${saved ? T.sage : T.accent}`,
                background: saved ? T.sageBg : T.accentGlow,
                color: saved ? T.sage : T.accent,
                transition: 'all 0.25s ease',
              }}
            >
              {saved ? '✓ Saved' : 'Use This Text'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
