/**
 * LUMIS — SPEECH TO TEXT
 * ─────────────────────────────────────────────────────────
 * TECH CHOICE: Web Speech API (Primary) + Whisper (Fallback)
 *
 * Web Speech API:
 *   ✓ 100% Free — forever, no API key, no limits
 *   ✓ Zero install — built into Chrome, Edge, Safari
 *   ✓ Real-time streaming transcript
 *   ✓ Works immediately in any React app
 *   ✗ Chrome uses Google servers (needs internet)
 *   ✗ Firefox not supported
 *
 * Whisper Local (fallback for recorded audio):
 *   ✓ 100% Free — runs on your machine
 *   ✓ Best accuracy of any model
 *   ✓ Supports 99 languages
 *   ✗ Needs Python backend (setup below)
 *   ✗ Slower — processes after recording ends
 *
 * FOR YOUR PLATFORM: Web Speech API is the right call.
 * Daily logging, journaling, voice notes — all real-time, zero cost.
 *
 * ─────────────────────────────────────────────────────────
 * WHISPER LOCAL SETUP (optional — for offline/accuracy):
 *
 *   pip install openai-whisper
 *   pip install flask flask-cors
 *
 *   # whisper_server.py
 *   from flask import Flask, request, jsonify
 *   from flask_cors import CORS
 *   import whisper, tempfile, os
 *
 *   app = Flask(__name__)
 *   CORS(app)
 *   model = whisper.load_model("base")  # tiny|base|small|medium|large
 *
 *   @app.route("/transcribe", methods=["POST"])
 *   def transcribe():
 *       audio = request.files["audio"]
 *       with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
 *           audio.save(f.name)
 *           result = model.transcribe(f.name)
 *           os.unlink(f.name)
 *       return jsonify({ "text": result["text"], "language": result["language"] })
 *
 *   app.run(port=5001)
 *
 *   # Run: python whisper_server.py
 *   # Then set WHISPER_ENDPOINT = "http://localhost:5001/transcribe"
 * ─────────────────────────────────────────────────────────
 *
 * USAGE EXAMPLES:
 *
 *   // 1. Journal entry
 *   <SpeechInput
 *     context="journal"
 *     memberId="abc123"
 *     onCapture={(data) => saveJournalEntry(data)}
 *   />
 *
 *   // 2. Interaction log
 *   <SpeechInput
 *     context="interaction"
 *     memberId="abc123"
 *     placeholder="Describe what happened..."
 *     onCapture={(data) => logInteraction(data)}
 *   />
 *
 *   // 3. Quick note (inline, compact)
 *   <SpeechInput
 *     context="note"
 *     compact
 *     onCapture={(data) => console.log(data)}
 *   />
 *
 * RETURNED DATA SHAPE:
 *   {
 *     text: "Full transcript text",
 *     context: "journal" | "interaction" | "note" | "custom",
 *     memberId: "abc123",
 *     duration: 14.3,           // seconds
 *     wordCount: 47,
 *     timestamp: "2026-03-14T17:42:00Z",
 *     confidence: 0.94,         // 0-1, Web Speech API only
 *     engine: "webspeech" | "whisper",
 *     segments: [               // word-level if available
 *       { word: "hello", time: 0.4 }
 *     ],
 *     raw: { ... }              // full API response
 *   }
 */

import { useState, useRef, useEffect, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const WHISPER_ENDPOINT = null; // Set to "http://localhost:5001/transcribe" if using local Whisper

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Mono:ital,wght@0,300;0,400;1,300&family=Lora:ital,wght@0,400;0,500;1,400;1,500&display=swap');`;

const T = {
  bg: "#FDFAF7", surface: "#F7F2EC", surface2: "#F0E9DF",
  border: "#E2D5C5", borderSoft: "#EDE5DA",
  accent: "#9B6E5A", accentSoft: "#B8896F", accentGlow: "rgba(155,110,90,0.08)",
  text: "#2E1F14", textDim: "#7A5C48", textMuted: "#B09880", textFaint: "#CDBAA8",
  sage: "#5A7A52", sageBg: "rgba(90,122,82,0.07)",
  rose: "#9A5060", roseBg: "rgba(154,80,96,0.07)",
  cosmic: "#6A5890", cosmicBg: "rgba(106,88,144,0.07)",
  red: "#C04040", redBg: "rgba(192,64,64,0.08)",
};

// ─── HOOK — all speech logic lives here ──────────────────────────────────────
function useSpeechToText({ onCapture, context = "note", memberId = null, useWhisper = false }) {
  const [state, setState] = useState("idle"); // idle | listening | processing | done | error
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [engine, setEngine] = useState("webspeech");

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const finalTranscriptRef = useRef("");

  // ── Check browser support ──
  const isSupported = typeof window !== "undefined" && (
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window
  );

  // ── Timer tick ──
  useEffect(() => {
    if (state === "listening") {
      timerRef.current = setInterval(() => {
        setDuration(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [state]);

  // ── Build final output object ──
  const buildOutput = useCallback((text, extras = {}) => ({
    text: text.trim(),
    context,
    memberId,
    duration: parseFloat(duration),
    wordCount: text.trim().split(/\s+/).filter(Boolean).length,
    timestamp: new Date().toISOString(),
    confidence: extras.confidence || null,
    engine: extras.engine || engine,
    segments: extras.segments || [],
    raw: extras.raw || null,
  }), [context, memberId, duration, engine]);

  // ── Web Speech API path ──
  const startWebSpeech = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setEngine("webspeech");
      setState("listening");
      startTimeRef.current = Date.now();
      setError(null);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = finalTranscriptRef.current;
      let lastConfidence = null;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
          lastConfidence = result[0].confidence;
        } else {
          interim += result[0].transcript;
        }
      }

      finalTranscriptRef.current = final;
      setTranscript(final);
      setInterimText(interim);
      if (lastConfidence) setConfidence(lastConfidence);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") return; // ignore silence
      setError(`Microphone error: ${event.error}`);
      setState("error");
    };

    recognition.onend = () => {
      const finalText = finalTranscriptRef.current;
      if (finalText.trim()) {
        setState("done");
        const output = buildOutput(finalText, { confidence, engine: "webspeech" });
        onCapture?.(output);
      } else {
        setState("idle");
      }
      setInterimText("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [buildOutput, confidence, onCapture]);

  // ── Whisper path (records audio, sends to local server) ──
  const startWhisper = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setState("processing");
        stream.getTracks().forEach((t) => t.stop());

        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");

          const res = await fetch(WHISPER_ENDPOINT, { method: "POST", body: formData });
          const data = await res.json();

          const text = data.text || "";
          setTranscript(text);
          setState("done");
          setEngine("whisper");

          const output = buildOutput(text, { engine: "whisper", raw: data, segments: data.segments || [] });
          onCapture?.(output);
        } catch (err) {
          setError("Whisper transcription failed. Is the server running?");
          setState("error");
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setEngine("whisper");
      setState("listening");
      startTimeRef.current = Date.now();
      setError(null);
    } catch (err) {
      setError("Microphone access denied.");
      setState("error");
    }
  }, [buildOutput, onCapture]);

  // ── Start ──
  const start = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimText("");
    setDuration(0);
    setConfidence(null);
    setError(null);

    if (useWhisper && WHISPER_ENDPOINT) {
      startWhisper();
    } else {
      if (!isSupported) {
        setError("Speech recognition not supported in this browser. Use Chrome or Edge.");
        setState("error");
        return;
      }
      startWebSpeech();
    }
  }, [useWhisper, isSupported, startWebSpeech, startWhisper]);

  // ── Stop ──
  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Reset ──
  const reset = useCallback(() => {
    stop();
    setState("idle");
    setTranscript("");
    setInterimText("");
    setDuration(0);
    setConfidence(null);
    setError(null);
    finalTranscriptRef.current = "";
  }, [stop]);

  return { state, transcript, interimText, confidence, duration, error, engine, isSupported, start, stop, reset };
}

// ─── WAVEFORM ANIMATION ───────────────────────────────────────────────────────
function Waveform({ active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 20 }}>
      {[0.6, 1, 0.75, 1, 0.5, 0.85, 0.65, 1, 0.7, 0.9].map((h, i) => (
        <div key={i} style={{
          width: 2.5, height: active ? `${h * 20}px` : "4px",
          background: active ? T.accent : T.border,
          borderRadius: 2,
          transition: "height 0.15s ease",
          animation: active ? `wave ${0.5 + i * 0.07}s ease-in-out infinite alternate` : "none",
        }}/>
      ))}
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

// ─── MIC BUTTON ──────────────────────────────────────────────────────────────
function MicButton({ state, onStart, onStop, compact }) {
  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const size = compact ? 40 : 52;

  return (
    <button
      onClick={isListening ? onStop : onStart}
      disabled={isProcessing}
      style={{
        width: size, height: size, borderRadius: "50%",
        border: `1.5px solid ${isListening ? T.accent + "60" : T.border}`,
        background: isListening
          ? `radial-gradient(circle, ${T.accentGlow} 0%, ${T.surface} 100%)`
          : T.surface,
        cursor: isProcessing ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.25s",
        boxShadow: isListening ? `0 0 0 4px ${T.accent}12` : "none",
        flexShrink: 0,
        outline: "none",
      }}
    >
      {isProcessing ? (
        <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${T.border}`, borderTopColor: T.accent, animation: "spin 0.7s linear infinite" }}/>
      ) : (
        <svg width={compact ? 16 : 20} height={compact ? 16 : 20} viewBox="0 0 24 24" fill="none">
          <rect x="9" y="2" width="6" height="12" rx="3" fill={isListening ? T.accent : T.textMuted}/>
          <path d="M5 11c0 3.866 3.134 7 7 7s7-3.134 7-7" stroke={isListening ? T.accent : T.textMuted} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="12" y1="18" x2="12" y2="22" stroke={isListening ? T.accent : T.textMuted} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="9" y1="22" x2="15" y2="22" stroke={isListening ? T.accent : T.textMuted} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

// ─── MAIN REUSABLE COMPONENT ──────────────────────────────────────────────────
export function SpeechInput({
  context = "note",
  memberId = null,
  placeholder = "Tap the mic and speak...",
  onCapture,
  compact = false,
  useWhisper = false,
  showMeta = true,
  autoSave = false,
  label = null,
}) {
  const {
    state, transcript, interimText, confidence,
    duration, error, engine, isSupported,
    start, stop, reset,
  } = useSpeechToText({ onCapture, context, memberId, useWhisper });

  const [editableText, setEditableText] = useState("");
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef(null);

  // Sync transcript into editable field
  useEffect(() => {
    if (transcript) setEditableText(transcript);
  }, [transcript]);

  const handleSave = () => {
    if (!editableText.trim()) return;
    onCapture?.({
      text: editableText.trim(),
      context, memberId,
      duration: parseFloat(duration),
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

  const displayText = editableText || (interimText ? "" : "");
  const showInterim = state === "listening" && interimText;

  if (compact) {
    return (
      <>
        <style>{FONTS}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: T.surface, borderRadius: 10, border: `1px solid ${state === "listening" ? T.accent + "40" : T.borderSoft}`, transition: "border-color 0.25s" }}>
          <MicButton state={state} onStart={start} onStop={stop} compact/>
          <div style={{ flex: 1, fontFamily: "'Lora',serif", fontSize: 12, color: displayText ? T.textDim : T.textFaint, fontStyle: displayText ? "normal" : "italic", lineHeight: 1.5 }}>
            {showInterim ? <span style={{ color: T.textMuted }}>{interimText}</span> : displayText || placeholder}
          </div>
          {state === "listening" && <Waveform active/>}
          {displayText && state !== "listening" && (
            <button onClick={reset} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.textFaint, padding: "2px 4px" }}>✕</button>
          )}
        </div>
        {error && <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: T.red, marginTop: 6, letterSpacing: "0.5px" }}>{error}</div>}
      </>
    );
  }

  return (
    <>
      <style>{FONTS}</style>
      <style>{`@keyframes rise { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <div style={{ background: T.bg, fontFamily: "'DM Mono',monospace", color: T.text }}>

        {label && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ width: 12, height: 1, background: T.accent, opacity: 0.4, display: "inline-block" }}/>
            <span style={{ fontSize: 8, letterSpacing: "2.5px", color: T.textMuted, textTransform: "uppercase" }}>{label}</span>
          </div>
        )}

        {/* Main recording area */}
        <div style={{ background: T.surface, border: `1.5px solid ${state === "listening" ? T.accent + "50" : T.borderSoft}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.3s, box-shadow 0.3s", boxShadow: state === "listening" ? `0 0 0 3px ${T.accent}10` : "none" }}>

          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${T.borderSoft}` }}>
            <MicButton state={state} onStart={start} onStop={stop}/>

            <div style={{ flex: 1 }}>
              {state === "idle" && (
                <div style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontSize: 12, color: T.textMuted }}>
                  {!isSupported ? "Use Chrome or Edge for voice input" : "Tap to start speaking"}
                </div>
              )}
              {state === "listening" && (
                <div style={{ animation: "rise 0.2s ease-out" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, animation: "pulse 1s ease-in-out infinite" }}/>
                    <span style={{ fontSize: 8, letterSpacing: "2px", color: T.accent, textTransform: "uppercase" }}>Listening</span>
                    <span style={{ fontSize: 8, color: T.textFaint, letterSpacing: "1px" }}>· {duration}s</span>
                  </div>
                  <Waveform active/>
                </div>
              )}
              {state === "processing" && (
                <div style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontSize: 12, color: T.textMuted }}>Processing with Whisper...</div>
              )}
              {state === "done" && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 8, letterSpacing: "1.5px", color: T.sage, textTransform: "uppercase" }}>Captured</span>
                  <span style={{ fontSize: 7, color: T.textFaint }}>· {duration}s · {editableText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              )}
              {state === "error" && (
                <div style={{ fontSize: 9, color: T.red, letterSpacing: "0.5px" }}>{error}</div>
              )}
            </div>

            {/* Engine badge */}
            {state !== "idle" && (
              <span style={{ fontSize: 7, padding: "2px 8px", borderRadius: 20, background: T.surface2, color: T.textFaint, border: `1px solid ${T.border}`, letterSpacing: "1px", textTransform: "uppercase" }}>
                {engine === "whisper" ? "Whisper" : "Web Speech"}
              </span>
            )}

            {(state === "done" || editableText) && (
              <button onClick={reset} style={{ background: "none", border: "none", cursor: "pointer", color: T.textFaint, fontSize: 13, padding: "2px 4px", lineHeight: 1 }}>✕</button>
            )}
          </div>

          {/* Transcript area */}
          <div style={{ padding: "16px 18px", minHeight: 100, position: "relative" }}>
            {state === "listening" && showInterim && (
              <div style={{ position: "absolute", bottom: 14, left: 18, right: 18, fontFamily: "'Lora',serif", fontSize: 12, color: T.textFaint, fontStyle: "italic", lineHeight: 1.7, pointerEvents: "none" }}>
                {interimText}
              </div>
            )}
            {(displayText || state !== "listening") && (
              <textarea
                ref={textareaRef}
                value={displayText}
                onChange={(e) => setEditableText(e.target.value)}
                placeholder={placeholder}
                style={{ width: "100%", minHeight: 90, background: "transparent", border: "none", outline: "none", resize: "none", fontFamily: "'Lora',serif", fontSize: 13.5, color: T.textDim, lineHeight: 1.88, letterSpacing: "0.2px" }}
              />
            )}
            {state === "listening" && !interimText && !displayText && (
              <div style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontSize: 13, color: T.textFaint, lineHeight: 1.7 }}>Speak freely. Transcript appears here in real time.</div>
            )}
          </div>

          {/* Meta + Save */}
          {(state === "done" || editableText) && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderTop: `1px solid ${T.borderSoft}`, animation: "rise 0.25s ease-out" }}>
              {showMeta && (
                <div style={{ display: "flex", gap: 12 }}>
                  {confidence && (
                    <span style={{ fontSize: 8, color: T.textFaint, letterSpacing: "1px" }}>
                      Confidence {Math.round(confidence * 100)}%
                    </span>
                  )}
                  {context && (
                    <span style={{ fontSize: 8, color: T.textFaint, letterSpacing: "1px", textTransform: "uppercase" }}>
                      {context}
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={handleSave}
                style={{ padding: "7px 18px", borderRadius: 8, border: `1px solid ${saved ? T.sage + "60" : T.accent + "50"}`, background: saved ? T.sageBg : T.accentGlow, color: saved ? T.sage : T.accent, fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}>
                {saved ? "✓ Saved" : "Save Entry"}
              </button>
            </div>
          )}
        </div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    </>
  );
}

// ─── DEMO ─────────────────────────────────────────────────────────────────────
export default function SpeechDemo() {
  const [log, setLog] = useState([]);

  const handleCapture = (data) => {
    setLog((prev) => [data, ...prev].slice(0, 5));
    console.log("Captured:", data);
  };

  return (
    <>
      <style>{FONTS}</style>
      <div style={{ background: T.bg, minHeight: "100vh", padding: "36px", fontFamily: "'DM Mono',monospace", maxWidth: 700 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 8, letterSpacing: "2.5px", color: T.textMuted, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 14, height: 1, background: T.accent, opacity: 0.4, display: "inline-block" }}/>
            Speech Input
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 28, color: T.text, lineHeight: 1.2, marginBottom: 6 }}>Voice to Log</div>
          <div style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontSize: 12, color: T.textMuted, lineHeight: 1.65 }}>
            Speak freely. The platform listens, transcribes, and logs in real time.
          </div>
        </div>

        {/* Full journal entry */}
        <div style={{ marginBottom: 28 }}>
          <SpeechInput
            context="journal"
            memberId="698bb743"
            label="Journal Entry"
            placeholder="Describe what happened, how it felt, what you noticed..."
            onCapture={handleCapture}
            showMeta
          />
        </div>

        {/* Compact — interaction note */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 8, letterSpacing: "2px", color: T.textMuted, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 12, height: 1, background: T.accent, opacity: 0.4, display: "inline-block" }}/>
            Quick Interaction Note
          </div>
          <SpeechInput
            context="interaction"
            memberId="698bb743"
            placeholder="Quick note about this interaction..."
            onCapture={handleCapture}
            compact
          />
        </div>

        {/* Log */}
        {log.length > 0 && (
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.borderSoft}` }}>
            <div style={{ fontSize: 8, letterSpacing: "2px", color: T.textMuted, textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 12, height: 1, background: T.accent, opacity: 0.4, display: "inline-block" }}/>
              Captured Entries
            </div>
            {log.map((entry, i) => (
              <div key={i} style={{ padding: "14px 16px", background: T.surface, borderRadius: 10, border: `1px solid ${T.borderSoft}`, marginBottom: 8, animation: "rise 0.3s ease-out" }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 7, padding: "2px 8px", borderRadius: 20, background: T.accentGlow, color: T.accent, border: `1px solid ${T.accent}25`, letterSpacing: "1px", textTransform: "uppercase" }}>{entry.context}</span>
                  <span style={{ fontSize: 7, color: T.textFaint, letterSpacing: "0.5px" }}>{entry.wordCount} words · {entry.duration}s · {entry.engine}</span>
                </div>
                <div style={{ fontFamily: "'Lora',serif", fontSize: 12.5, color: T.textDim, lineHeight: 1.82 }}>{entry.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
