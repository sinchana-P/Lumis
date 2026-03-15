'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

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

// Set to your Whisper server URL to enable offline/high-accuracy mode
const WHISPER_ENDPOINT = process.env.NEXT_PUBLIC_WHISPER_ENDPOINT ?? null;

// ─── Post-processing ───────────────────────────────────────────────────────────

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
  [/\bopen quote\b/gi, '"'],
  [/\bclose quote\b/gi, '"'],
];

function processTranscript(raw: string): { text: string; corrected: boolean } {
  let text = raw;
  let corrected = false;
  const original = text;

  // Voice commands → punctuation
  for (const [pattern, replacement] of VOICE_COMMANDS) {
    text = text.replace(pattern, replacement);
  }

  // Remove space before punctuation: "hello ." → "hello."
  text = text.replace(/ ([.,?!:;])/g, '$1');

  // Fix standalone "i" → "I"
  text = text.replace(/\bi\b/g, 'I');

  // Capitalize first character
  text = text.replace(/^[a-z]/, (c) => c.toUpperCase());

  // Capitalize after sentence-ending punctuation
  text = text.replace(/([.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase());

  // Collapse multiple spaces
  text = text.replace(/  +/g, ' ').trim();

  if (text !== original) corrected = true;
  return { text, corrected };
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

  // Timer tick
  useEffect(() => {
    if (state === 'listening') {
      timerRef.current = setInterval(() => {
        setDuration(parseFloat(((Date.now() - startTimeRef.current) / 1000).toFixed(1)));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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

  // Web Speech API
  const startWebSpeech = useCallback(() => {
    console.log('🎤 Initializing Web Speech API...');
    
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ SpeechRecognition not available');
      setError('Speech recognition not available in this browser');
      setState('error');
      return;
    }
    
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('✅ Speech recognition started');
      setEngine('webspeech');
      setState('listening');
      isListeningRef.current = true;
      startTimeRef.current = Date.now();
      setError(null);
    };

    recognition.onresult = (event: any) => {
      console.log('🎤 Speech result received:', event);
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
          console.log('✅ Final transcript:', cleaned);
        } else {
          interim += result[0].transcript;
          console.log('⏳ Interim transcript:', interim);
        }
      }

      finalTranscriptRef.current = final;
      setTranscript(final);
      setInterimText(interim);
      if (lastConfidence) setConfidence(lastConfidence);
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Speech recognition error:', event.error, event);
      if (event.error === 'no-speech') {
        console.log('⚠️ No speech detected, continuing...');
        return;
      }
      // aborted = user stopped intentionally, not an error
      if (event.error === 'aborted') {
        console.log('⚠️ Speech recognition aborted by user');
        return;
      }
      setError(`Microphone error: ${event.error}`);
      setState('error');
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      // Auto-restart if still in listening state (Web Speech stops after ~10s silence)
      if (isListeningRef.current) {
        console.log('🔄 Auto-restarting speech recognition...');
        try {
          recognition.start();
          return;
        } catch (error) {
          console.error('❌ Failed to restart recognition:', error);
          // recognition already started or unavailable — fall through
        }
      }

      setInterimText('');
      const finalText = finalTranscriptRef.current;
      if (finalText.trim()) {
        console.log('✅ Speech capture complete:', finalText);
        setState('done');
        const output = buildOutput(finalText, { confidence, engine: 'webspeech' });
        onCapture?.(output);
      } else {
        console.log('⚠️ No speech captured, returning to idle');
        setState('idle');
      }
    };

    recognitionRef.current = recognition;
    
    try {
      console.log('🎤 Starting recognition...');
      recognition.start();
    } catch (error) {
      console.error('❌ Failed to start recognition:', error);
      setError('Failed to start speech recognition');
      setState('error');
    }
  }, [buildOutput, confidence, onCapture]);

  // Whisper fallback
  const startWhisper = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

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

          setTranscript(text);
          setState('done');
          setEngine('whisper');
          onCapture?.(buildOutput(text, { engine: 'whisper', raw: data, segments: data.segments ?? [] }));
        } catch {
          setError('Whisper transcription failed. Is the server running?');
          setState('error');
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setEngine('whisper');
      setState('listening');
      startTimeRef.current = Date.now();
      setError(null);
    } catch {
      setError('Microphone access denied.');
      setState('error');
    }
  }, [buildOutput, onCapture]);

  const start = useCallback(() => {
    console.log('🎤 Starting speech recognition...');
    console.log('Browser support:', isSupported);
    console.log('Use Whisper:', useWhisper);
    console.log('Whisper endpoint:', WHISPER_ENDPOINT);
    
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimText('');
    setDuration(0);
    setConfidence(null);
    setError(null);
    setWasAutoCorrected(false);

    if (useWhisper && WHISPER_ENDPOINT) {
      console.log('🎤 Using Whisper mode');
      startWhisper();
    } else {
      if (!isSupported) {
        console.error('❌ Speech recognition not supported');
        setError('Speech recognition not supported. Use Chrome or Edge.');
        setState('error');
        return;
      }
      console.log('🎤 Using Web Speech API');
      startWebSpeech();
    }
  }, [useWhisper, isSupported, startWebSpeech, startWhisper]);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setState('idle');
    setTranscript('');
    setInterimText('');
    setDuration(0);
    setConfidence(null);
    setError(null);
    setWasAutoCorrected(false);
    finalTranscriptRef.current = '';
  }, [stop]);

  return { state, transcript, interimText, confidence, duration, error, engine, wasAutoCorrected, isSupported, start, stop, reset };
}

// ─── Waveform ─────────────────────────────────────────────────────────────────

export function Waveform({ active }: { active: boolean }) {
  const heights = [0.6, 1, 0.75, 1, 0.5, 0.85, 0.65, 1, 0.7, 0.9];
  return (
    <div className="flex items-center gap-0.5" style={{ height: 18 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className={`rounded-sm transition-all duration-150 ${
            active ? 'bg-lumis-accent-secondary' : 'bg-lumis-text-tertiary/30'
          }`}
          style={{
            width: 2.5,
            height: active ? `${h * 18}px` : '3px',
            animation: active ? `lumis-wave ${0.5 + i * 0.07}s ease-in-out infinite alternate` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes lumis-wave { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }
        @keyframes lumis-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes lumis-spin { to { transform: rotate(360deg); } }
        @keyframes lumis-rise { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

// ─── Mic Button ───────────────────────────────────────────────────────────────

function MicButton({
  state,
  onStart,
  onStop,
  compact = false,
}: {
  state: SpeechState;
  onStart: () => void;
  onStop: () => void;
  compact?: boolean;
}) {
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const size = compact ? 36 : 48;

  return (
    <button
      type="button"
      onClick={isListening ? onStop : onStart}
      disabled={isProcessing}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1.5px solid ${isListening ? 'var(--accent-secondary)' : 'var(--bg-tertiary)'}`,
        background: isListening
          ? 'var(--accent-secondary-light)'
          : 'var(--surface)',
        cursor: isProcessing ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.25s',
        boxShadow: isListening ? '0 0 0 4px var(--accent-secondary-light)' : 'none',
        flexShrink: 0,
        outline: 'none',
        opacity: isProcessing ? 0.6 : 1,
      }}
    >
      {isProcessing ? (
        <div style={{
          width: 13, height: 13, borderRadius: '50%',
          border: '2px solid var(--bg-tertiary)',
          borderTopColor: 'var(--accent-secondary)',
          animation: 'lumis-spin 0.7s linear infinite',
        }} />
      ) : (
        <svg width={compact ? 15 : 18} height={compact ? 15 : 18} viewBox="0 0 24 24" fill="none">
          <rect x="9" y="2" width="6" height="12" rx="3"
            fill={isListening ? 'var(--accent-secondary)' : 'var(--text-tertiary)'} />
          <path d="M5 11c0 3.866 3.134 7 7 7s7-3.134 7-7"
            stroke={isListening ? 'var(--accent-secondary)' : 'var(--text-tertiary)'}
            strokeWidth="1.8" strokeLinecap="round" />
          <line x1="12" y1="18" x2="12" y2="22"
            stroke={isListening ? 'var(--accent-secondary)' : 'var(--text-tertiary)'}
            strokeWidth="1.8" strokeLinecap="round" />
          <line x1="9" y1="22" x2="15" y2="22"
            stroke={isListening ? 'var(--accent-secondary)' : 'var(--text-tertiary)'}
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
  placeholder = 'Tap the mic and speak...',
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

  // Sync transcript → editable field
  useEffect(() => {
    if (transcript) setEditableText(transcript);
  }, [transcript]);

  const handleSave = () => {
    if (!editableText.trim()) return;
    onCapture({
      text: editableText.trim(),
      context,
      memberId,
      duration,
      wordCount: editableText.trim().split(/\s+/).filter(Boolean).length,
      timestamp: new Date().toISOString(),
      confidence,
      engine,
      segments: [],
      raw: null,
      edited: true,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const showInterim = state === 'listening' && interimText;

  // ── Compact Mode ──
  if (compact) {
    return (
      <div className={className}>
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-250"
          style={{
            background: 'var(--surface)',
            border: `1.5px solid ${state === 'listening' ? 'var(--accent-secondary)' : 'var(--bg-tertiary)'}`,
          }}
        >
          <MicButton state={state} onStart={start} onStop={stop} compact />
          <div
            className="flex-1 font-serif text-sm leading-snug"
            style={{
              color: editableText ? 'var(--text-secondary)' : 'var(--text-tertiary)',
              fontStyle: editableText ? 'normal' : 'italic',
            }}
          >
            {showInterim
              ? <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{interimText}</span>
              : editableText || placeholder}
          </div>
          {state === 'listening' && <Waveform active />}
          {editableText && state !== 'listening' && (
            <button
              type="button"
              onClick={reset}
              className="font-mono text-xs transition-colors hover:text-primary"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
            >
              ✕
            </button>
          )}
        </div>
        {error && (
          <p className="font-mono text-xs mt-1.5 tracking-wide" style={{ color: 'var(--error)' }}>
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
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-px" style={{ background: 'var(--accent-secondary)', opacity: 0.5 }} />
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
            {label}
          </span>
        </div>
      )}

      <div
        className="rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: 'var(--surface)',
          border: `1.5px solid ${state === 'listening' ? 'var(--accent-secondary)' : 'var(--bg-tertiary)'}`,
          boxShadow: state === 'listening' ? '0 0 0 3px var(--accent-secondary-light)' : 'none',
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--bg-tertiary)' }}
        >
          <MicButton state={state} onStart={start} onStop={stop} />

          <div className="flex-1">
            {state === 'idle' && (
              <p className="font-serif text-sm italic" style={{ color: 'var(--text-tertiary)' }}>
                {!isSupported ? 'Use Chrome or Edge for voice input' : 'Tap mic to start speaking'}
              </p>
            )}
            {state === 'listening' && (
              <div style={{ animation: 'lumis-rise 0.2s ease-out' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--accent-secondary)', animation: 'lumis-pulse 1s ease-in-out infinite' }}
                  />
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--accent-secondary)' }}>
                    Listening
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    · {duration}s
                  </span>
                </div>
                <Waveform active />
              </div>
            )}
            {state === 'processing' && (
              <p className="font-serif text-sm italic" style={{ color: 'var(--text-tertiary)' }}>
                Processing with Whisper...
              </p>
            )}
            {state === 'done' && (
              <div className="flex items-center gap-2" style={{ animation: 'lumis-rise 0.2s ease-out' }}>
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--accent-primary)' }}>
                  Captured
                </span>
                <span className="font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  · {duration}s · {editableText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            )}
            {state === 'error' && (
              <p className="font-mono text-xs tracking-wide" style={{ color: 'var(--error)' }}>
                {error}
              </p>
            )}
          </div>

          {/* Engine badge */}
          {state !== 'idle' && (
            <span
              className="font-mono text-xs uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--surface-hover)',
                color: 'var(--text-tertiary)',
                border: '1px solid var(--bg-tertiary)',
              }}
            >
              {engine === 'whisper' ? 'Whisper' : 'Web Speech'}
            </span>
          )}

          {(state === 'done' || editableText) && (
            <button
              type="button"
              onClick={reset}
              className="font-mono text-sm transition-colors"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', lineHeight: 1 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Transcript area */}
        <div className="relative px-4 py-3" style={{ minHeight: 96 }}>
          {showInterim && (
            <p
              className="absolute bottom-3 left-4 right-4 font-serif text-sm leading-relaxed pointer-events-none"
              style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}
            >
              {interimText}
            </p>
          )}

          {state === 'listening' && !interimText && !editableText && (
            <p className="font-serif text-sm italic leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              Speak freely. Transcript appears here in real time.
            </p>
          )}

          <textarea
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            placeholder={state === 'listening' ? '' : placeholder}
            rows={4}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'var(--font-serif, serif)',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              lineHeight: 1.85,
              letterSpacing: '0.01em',
            }}
          />
        </div>

        {/* Footer: meta + save */}
        {(state === 'done' || editableText) && (
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderTop: '1px solid var(--bg-tertiary)', animation: 'lumis-rise 0.25s ease-out' }}
          >
            {showMeta ? (
              <div className="flex items-center gap-3">
                {confidence !== null && (
                  <span className="font-mono text-xs tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                    {Math.round(confidence * 100)}% confidence
                  </span>
                )}
                {wasAutoCorrected && (
                  <span
                    className="font-mono text-xs uppercase tracking-widest px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)' }}
                  >
                    auto-corrected
                  </span>
                )}
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                  {context}
                </span>
              </div>
            ) : <div />}

            <button
              type="button"
              onClick={handleSave}
              className="font-mono text-xs uppercase tracking-widest px-4 py-1.5 rounded-lg transition-all duration-200"
              style={{
                border: `1px solid ${saved ? 'var(--accent-primary)' : 'var(--accent-secondary)'}`,
                background: saved ? 'var(--accent-primary-light)' : 'var(--accent-secondary-light)',
                color: saved ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                cursor: 'pointer',
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
