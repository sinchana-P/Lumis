'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { useSpeechToText, Waveform } from '@/components/ui/SpeechInput';
import { MicrophoneButton, PauseButton } from '@/components/ui/AudioButtons';
import { type AnalysisDepthMode, ANALYSIS_DEPTH_MODES } from '@/components/lumen/AnalysisDepthSelector';
import { MemberContextSelector } from '@/components/lumen/MemberContextSelector';
import { LumenHistory } from '@/components/lumen/LumenHistory';

// ─── Types ─────────────────────────────────────────────────────────────────────

type LumenMode = 'vent' | 'guided' | 'analysis' | 'advice' | 'timing';

interface Member {
  id: string;
  fullName: string;
  relationType: string;
  relationTypeCustom?: string;
  dateOfBirth?: string;
  numerology?: {
    lifePath: number;
    soulUrge: number;
    personalYear: number;
    personalMonth: number;
  };
  astrology?: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
  };
  traits?: {
    pros: Array<{ text: string; intensity: number; emotionTag?: string }>;
    cons: Array<{ text: string; intensity: number; emotionTag?: string }>;
  };
  recentInteractions?: Array<{
    date: string;
    moodBefore: string;
    moodAfter: string;
    description: string;
  }>;
  incidents?: Array<{
    date: string;
    description: string;
    emotionalImpact: number;
  }>;
  patterns?: Array<{
    description: string;
    frequency: string;
  }>;
}

interface MemberContext {
  member: Member;
  dataLayers: string[];
  addedAt: Date;
}

interface Message {
  id: string;
  role: 'user' | 'lumen';
  text: string;
  timestamp: Date;
  mode?: LumenMode;
  analysisDepth?: AnalysisDepthMode;
}

// ─── Mode config with CSS token colors ─────────────────────────────────────────

const MODES: { id: LumenMode; label: string; tagline: string; model: string; color: string }[] = [
  { id: 'vent',     label: 'Vent',     tagline: 'Be heard, no analysis',       model: 'Groq · Llama',  color: '#B08898'                 },
  { id: 'guided',   label: 'Guided',   tagline: 'Deepen your reflection',      model: 'Groq · Llama',  color: 'var(--accent-gold)'      },
  { id: 'analysis', label: 'Analysis', tagline: 'Full context breakdown',      model: 'Gemini Flash',  color: 'var(--accent-ai)'        },
  { id: 'advice',   label: 'Advice',   tagline: 'NVC-based guidance',          model: 'Gemini Flash',  color: 'var(--accent-primary)'   },
  { id: 'timing',   label: 'Timing',   tagline: 'Numerology & astrology lens', model: 'Gemini Flash',  color: '#9B8EC4'                 },
];

const WELCOME_PROMPTS: Record<LumenMode, Record<AnalysisDepthMode, string>> = {
  vent: {
    cosmic: "This is a safe space. Share what's weighing on you — I'll hold it with cosmic understanding, not dissect it.",
    behavioral: "This is a safe space. Say whatever is on your mind — I'll listen with awareness of your patterns, not analyze them.",
    'full-spectrum': "This is a safe space. Say whatever is on your mind — I'll hold it with you, drawing on everything I know about you.",
  },
  guided: {
    cosmic: "Let's explore together through the lens of your cosmic blueprint. What's been sitting with you?",
    behavioral: "Let's go deeper using what I've observed about your patterns. Tell me what's been on your mind.",
    'full-spectrum': "Let's go deeper together, drawing on both your cosmic nature and observed patterns. What's been sitting with you?",
  },
  analysis: {
    cosmic: "Share what's happening and I'll analyze it through numerology and astrology — the cosmic forces at play.",
    behavioral: "Tell me what's been happening and I'll analyze it through your logged patterns, traits, and relationship dynamics.",
    'full-spectrum': "Share what's been happening with someone in your life. I'll draw on everything — cosmic blueprints and observed patterns.",
  },
  advice: {
    cosmic: "Describe the situation and I'll offer guidance rooted in cosmic timing and numerological compatibility.",
    behavioral: "Describe the situation and I'll offer practical guidance based on your documented patterns and relationship dynamics.",
    'full-spectrum': "Describe the situation. I'll offer comprehensive guidance combining cosmic insights with your observed patterns.",
  },
  timing: {
    cosmic: "What decision or situation are you navigating? I'll read the numerological and astrological currents at play.",
    behavioral: "What timing question do you have? I'll analyze based on your documented interaction patterns and emotional cycles.",
    'full-spectrum': "What decision or situation are you navigating? I'll read both cosmic currents and your behavioral patterns for optimal timing.",
  },
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const mockMembers: Member[] = [
  {
    id: '1',
    fullName: 'Zara',
    relationType: 'partner',
    dateOfBirth: '1992-08-15',
    numerology: { lifePath: 7, soulUrge: 3, personalYear: 4, personalMonth: 8 },
    astrology: { sunSign: 'Leo', moonSign: 'Pisces', risingSign: 'Virgo' },
    traits: {
      pros: [
        { text: 'Always makes me laugh even on my worst days', intensity: 5, emotionTag: 'joyful' },
        { text: 'Great listener and gives thoughtful advice', intensity: 4, emotionTag: 'safe' },
      ],
      cons: [{ text: "Sometimes interrupts when I'm speaking", intensity: 2, emotionTag: 'frustrated' }],
    },
    recentInteractions: [
      { date: '2024-03-10', moodBefore: 'stressed', moodAfter: 'peaceful', description: 'Long conversation about work challenges' },
      { date: '2024-03-08', moodBefore: 'neutral', moodAfter: 'drained', description: 'Disagreement about weekend plans' },
    ],
    incidents: [{ date: '2024-03-05', description: 'Forgot our anniversary dinner reservation', emotionalImpact: 4 }],
    patterns: [
      { description: 'Becomes distant when stressed at work', frequency: 'monthly' },
      { description: 'Very affectionate after resolving conflicts', frequency: 'occasional' },
    ],
  },
  {
    id: '2',
    fullName: 'Rohan',
    relationType: 'other',
    relationTypeCustom: 'Brother',
    dateOfBirth: '1988-12-03',
    numerology: { lifePath: 1, soulUrge: 8, personalYear: 6, personalMonth: 3 },
    traits: {
      pros: [{ text: 'Always has my back in difficult situations', intensity: 5, emotionTag: 'safe' }],
      cons: [{ text: 'Can be overly critical of my choices', intensity: 3, emotionTag: 'hurt' }],
    },
    recentInteractions: [
      { date: '2024-03-09', moodBefore: 'anxious', moodAfter: 'grounded', description: 'Called for advice about career decision' },
    ],
  },
  {
    id: '3',
    fullName: 'Mom',
    relationType: 'family',
    traits: {
      pros: [{ text: 'Unconditional love and support', intensity: 5, emotionTag: 'loved' }],
      cons: [
        { text: 'Tends to worry excessively about my life', intensity: 4, emotionTag: 'anxious' },
        { text: 'Sometimes gives unsolicited advice', intensity: 2, emotionTag: 'frustrated' },
      ],
    },
  },
  {
    id: '4',
    fullName: 'Arjun',
    relationType: 'friend',
    traits: {
      pros: [{ text: 'Most positive and energetic person I know', intensity: 4, emotionTag: 'energized' }],
      cons: [],
    },
  },
];

function getMockWelcome(mode: LumenMode, analysisDepth: AnalysisDepthMode): Message {
  return {
    id: 'welcome',
    role: 'lumen',
    text: WELCOME_PROMPTS[mode][analysisDepth],
    timestamp: new Date(),
    mode,
    analysisDepth,
  };
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isLumen = msg.role === 'lumen';
  return (
    <div
      className={`flex gap-3 ${isLumen ? '' : 'flex-row-reverse'}`}
      style={{ animation: 'lumen-rise 0.25s ease-out' }}
    >
      {isLumen && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ marginTop: 2, background: 'var(--accent-ai-light)', border: '1px solid var(--accent-ai)' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--accent-ai)" />
          </svg>
        </div>
      )}

      <div style={{ maxWidth: 'min(68%, 560px)' }}>
        {/* No card — just a thin left/right border accent + text */}
        <div
          style={{
            paddingLeft: isLumen ? 14 : 0,
            paddingRight: isLumen ? 0 : 14,
            borderLeft: isLumen ? '2px solid var(--bg-tertiary)' : 'none',
            borderRight: isLumen ? 'none' : '2px solid var(--bg-tertiary)',
          }}
        >
          <p
            className="font-serif leading-relaxed font-light"
            style={{
              fontSize: 'clamp(13px, 1.3vw, 15px)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.01em',
              fontStyle: isLumen ? 'italic' : 'normal',
            }}
          >
            {msg.text}
          </p>
        </div>
        <div className={`flex items-center gap-3 mt-2 ${isLumen ? 'pl-4' : 'pr-4 flex-row-reverse'}`}>
          <p
            className="font-mono tracking-wide"
            style={{ fontSize: 'clamp(11px, 0.85vw, 13px)', color: 'var(--text-tertiary)' }}
          >
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {msg.analysisDepth && isLumen && (() => {
            const mode = ANALYSIS_DEPTH_MODES.find((m) => m.id === msg.analysisDepth);
            return (
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {mode?.icon}
                </span>
                <span
                  className="font-mono uppercase tracking-wider"
                  style={{ fontSize: 'clamp(10px, 0.85vw, 10px)', color: 'var(--text-tertiary)' }}
                >
                  {mode?.label}
                </span>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-center" style={{ animation: 'lumen-rise 0.2s ease-out' }}>
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--accent-ai-light)', border: '1px solid var(--accent-ai)' }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--accent-ai)" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5 pl-4" style={{ borderLeft: '2px solid var(--bg-tertiary)' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent-ai)', animation: `lumen-dot 1.2s ease-in-out ${i * 0.18}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LumenPage() {
  const [mode, setMode] = useState<LumenMode>('guided');
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepthMode>('full-spectrum');
  const [showHistory, setShowHistory] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [showMemberContext, setShowMemberContext] = useState(false);
  const [memberContexts, setMemberContexts] = useState<MemberContext[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages([getMockWelcome(mode, analysisDepth)]);
  }, [mode, analysisDepth]);

  const speech = useSpeechToText({
    onCapture: useCallback((data: { text: string }) => {
      setInputText((prev) => (prev ? prev + ' ' + data.text : data.text));
      setTimeout(() => textareaRef.current?.focus(), 50);
    }, []),
    context: 'lumen',
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleModeChange = (newMode: LumenMode) => {
    setMode(newMode);
    setInputText('');
    speech.reset();
  };

  const addMemberToContext = (memberId: string) => {
    const member = mockMembers.find((m) => m.id === memberId);
    if (!member || memberContexts.some((ctx) => ctx.member.id === memberId)) return;

    const dataLayers: string[] = [];
    if (member.numerology) dataLayers.push('Numerology');
    if (member.astrology) dataLayers.push('Astrology');
    if (member.traits) dataLayers.push('Logged Traits');
    if (member.incidents) dataLayers.push('Incidents & Logs');
    if (member.recentInteractions) dataLayers.push('Interaction History');

    setMemberContexts((prev) => [...prev, { member, dataLayers, addedAt: new Date() }]);
  };

  const removeMemberFromContext = (memberId: string) => {
    setMemberContexts((prev) => prev.filter((ctx) => ctx.member.id !== memberId));
  };

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'lumen',
        text: getLumenReply(mode, analysisDepth, text, memberContexts),
        timestamp: new Date(),
        mode,
        analysisDepth,
      };
      setMessages((prev) => [...prev, reply]);
    }, 1600 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentMode = MODES.find((m) => m.id === mode)!;
  const isListening = speech.state === 'listening';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />

      <LumenHistory
        open={showHistory}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewChat={() => { setMessages([getMockWelcome(mode, analysisDepth)]); setActiveConversationId(undefined); }}
        onClose={() => setShowHistory(false)}
      />

      <style>{`
        @keyframes lumen-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lumen-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%           { transform: scale(1);   opacity: 1; }
        }
        .depth-icon-wrapper:hover .depth-tooltip { opacity: 1 !important; }
      `}</style>

      <main className="flex flex-col" style={{ height: '100vh', paddingTop: 56 }}>

        {/* ── Single control strip — one row only ──────────────── */}
        <div
          className="flex-shrink-0 flex"
          style={{
            padding: '0 clamp(16px, 3vw, 40px)',
            borderBottom: '1px solid var(--bg-tertiary)',
            background: 'var(--bg-primary)',
            height: 46,
            alignItems: 'center',
            gap: 'clamp(12px, 2vw, 28px)',
          }}
        >
          {/* History toggle button */}
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            title="Conversation history"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 6,
              color: showHistory ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              transition: 'color 0.2s',
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 16, background: 'var(--bg-tertiary)', flexShrink: 0 }} />

          {/* Modes — stretch full height, underline sits at bottom */}
          <div
            className="flex flex-shrink-0 overflow-x-auto"
            style={{ scrollbarWidth: 'none', gap: 'clamp(14px, 2vw, 28px)', height: '100%', alignItems: 'center' }}
          >
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModeChange(m.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: mode === m.id ? `2px solid ${m.color}` : '2px solid transparent',
                  height: '100%',
                  padding: '0',
                  cursor: 'pointer',
                  color: mode === m.id ? m.color : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 'clamp(11px, 0.9vw, 13px)',
                  fontWeight: mode === m.id ? 700 : 400,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s, border-color 0.2s, font-weight 0.1s',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Tagline — fills middle, fades in/out with mode */}
          <span
            key={mode}
            className="font-serif italic hidden md:block"
            style={{
              flex: 1,
              fontSize: 'clamp(11px, 1vw, 13px)',
              color: currentMode.color,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              animation: 'lumen-rise 0.3s ease-out',
              opacity: 0.8,
            }}
          >
            {currentMode.tagline}
          </span>

          {/* Right: depth icons + active label + divider + model */}
          <div className="flex items-center flex-shrink-0 gap-3">
            {ANALYSIS_DEPTH_MODES.map((d) => {
              const isActive = analysisDepth === d.id;
              return (
                /* Wrapper handles hover — tooltip is sibling of button, not child,
                   so parent opacity never bleeds into the tooltip */
                <div
                  key={d.id}
                  className="depth-icon-wrapper"
                  style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                  <button
                    type="button"
                    onClick={() => setAnalysisDepth(d.id)}
                    style={{
                      background: 'none',
                      border: isActive ? `1.5px solid ${d.color}` : '1.5px solid transparent',
                      borderRadius: 7,
                      cursor: 'pointer',
                      padding: '4px 5px',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      /* Use color (not opacity) so tooltip is unaffected */
                      color: isActive ? d.color : 'var(--text-secondary)',
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                  >
                    {d.icon}
                  </button>

                  {/* Tooltip — sibling, never inherits button opacity */}
                  <span
                    className="depth-tooltip"
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 10px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--bg-tertiary)',
                      borderRadius: 8,
                      padding: '7px 11px',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      opacity: 0,
                      transition: 'opacity 0.15s',
                      zIndex: 200,
                      minWidth: 160,
                      textAlign: 'left',
                    }}
                  >
                    <span
                      className="font-mono uppercase tracking-wider block mb-1"
                      style={{ fontSize: 12, color: 'var(--text-secondary)' }}
                    >
                      {d.label}
                    </span>
                    <span
                      className="font-serif italic block"
                      style={{ fontSize: 11, color: 'var(--text-tertiary)' }}
                    >
                      {d.description}
                    </span>
                  </span>
                </div>
              );
            })}

            {/* Active depth label — fixed width to prevent layout shift */}
            {(() => {
              const activeDepth = ANALYSIS_DEPTH_MODES.find(d => d.id === analysisDepth)!;
              return (
                <span
                  key={analysisDepth}
                  className="font-mono uppercase tracking-wider hidden sm:block"
                  style={{
                    fontSize: 'clamp(11px, 0.9vw, 12px)',
                    color: activeDepth.color,
                    animation: 'lumen-rise 0.2s ease-out',
                    width: 88,
                    display: 'inline-block',
                  }}
                >
                  {activeDepth.label}
                </span>
              );
            })()}

            <div style={{ width: 1, height: 12, background: 'var(--bg-tertiary)', flexShrink: 0 }} />
            <span
              className="font-mono uppercase tracking-widest hidden sm:block"
              style={{ fontSize: 'clamp(11px, 0.9vw, 12px)', color: 'var(--text-tertiary)' }}
            >
              {currentMode.model}
            </span>
          </div>
        </div>

        {/* ── Conversation ──────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: 'clamp(20px, 4vh, 32px) clamp(16px, 3vw, 40px)', scrollBehavior: 'smooth' }}
        >
          <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: 720 }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Input area ────────────────────────────────────────── */}
        <div
          className="flex-shrink-0"
          style={{
            padding: 'clamp(12px, 2.5vh, 20px) clamp(16px, 3vw, 40px)',
            borderTop: '1px solid var(--bg-tertiary)',
            background: 'var(--bg-primary)',
          }}
        >
          <div className="mx-auto" style={{ maxWidth: 720 }}>

            {/* Member context chips */}
            {memberContexts.length > 0 && (
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <span
                  className="font-mono uppercase tracking-widest"
                  style={{ fontSize: 'clamp(11px, 0.9vw, 13px)', color: 'var(--text-tertiary)' }}
                >
                  Context:
                </span>
                {memberContexts.map((context) => (
                  <div key={context.member.id} className="flex items-center gap-2">
                    <span
                      className="font-serif capitalize"
                      style={{ fontSize: 'clamp(11px, 1.1vw, 13px)', color: 'var(--text-secondary)' }}
                    >
                      {context.member.fullName}
                    </span>
                    <button
                      onClick={() => removeMemberFromContext(context.member.id)}
                      style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}
                    >
                      <svg width="9" height="9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <span style={{ color: 'var(--bg-tertiary)', fontSize: 10 }}>/</span>
                  </div>
                ))}
              </div>
            )}

            {/* Input row */}
            <div className="flex items-center gap-3">

              {/* Add member button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowMemberContext(true)}
                  title="Add member to context"
                  className="flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    width: 36, height: 36,
                    background: 'transparent',
                    border: '1px solid var(--bg-tertiary)',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </div>

              {/* Unified input bar */}
              <div
                className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-3 transition-all duration-200"
                style={{
                  background: 'var(--bg-primary)',
                  border: `1.5px solid ${isListening ? currentMode.color : 'var(--bg-tertiary)'}`,
                }}
              >
                {/* Text / waveform area */}
                <div className="flex-1 relative" style={{ minHeight: 28 }}>
                  {isListening ? (
                    <div className="flex items-center gap-3 py-1">
                      <Waveform active />
                      {speech.interimText && (
                        <span className="font-serif text-sm italic" style={{ color: 'var(--text-tertiary)' }}>
                          {speech.interimText}
                        </span>
                      )}
                    </div>
                  ) : (
                    <textarea
                      ref={textareaRef}
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask anything — Shift+Enter for new line"
                      rows={1}
                      className="w-full bg-transparent border-none outline-none resize-none overflow-y-auto focus:outline-none focus:ring-0 focus:border-none focus:shadow-none"
                      style={{
                        fontFamily: 'var(--font-serif, serif)',
                        fontSize: 'clamp(13px, 1.2vw, 15px)',
                        color: 'var(--text-primary)',
                        lineHeight: 1.7,
                        letterSpacing: '0.01em',
                        minHeight: 28,
                        maxHeight: 160,
                      }}
                    />
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-shrink-0 pb-0.5">
                  {isListening ? (
                    <PauseButton onClick={speech.stop} animated size="md" />
                  ) : (
                    <MicrophoneButton onClick={speech.start} size="md" />
                  )}

                  {inputText.trim() && !isListening && (
                    <button
                      type="button"
                      onClick={sendMessage}
                      className="flex items-center justify-center rounded-full transition-all duration-200"
                      style={{
                        width: 32, height: 32,
                        background: currentMode.color,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--text-inverse)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <p
              className="font-mono uppercase tracking-widest text-center mt-2"
              style={{ fontSize: 'clamp(11px, 0.85vw, 13px)', color: 'var(--text-tertiary)' }}
            >
              {memberContexts.length > 0
                ? `Lumen has full context of ${memberContexts.length} member${memberContexts.length > 1 ? 's' : ''} + your traits and patterns`
                : 'Lumen has full context of your members, traits, and patterns'}
            </p>
          </div>
        </div>
      </main>

      <MemberContextSelector
        members={mockMembers}
        memberContexts={memberContexts}
        onAddMember={addMemberToContext}
        onRemoveMember={removeMemberFromContext}
        showSelector={showMemberContext}
        setShowSelector={setShowMemberContext}
      />
    </div>
  );
}

// ─── Mock reply generator ───────────────────────────────────────────────────────

function getLumenReply(mode: LumenMode, depth: AnalysisDepthMode, input: string, memberContexts: MemberContext[] = []): string {
  const mentionedMember = memberContexts.find((ctx) =>
    input.toLowerCase().includes(ctx.member.fullName.toLowerCase()) ||
    input.toLowerCase().includes(ctx.member.fullName.toLowerCase().split(' ')[0])
  );

  if (mentionedMember && memberContexts.length > 0) {
    return getMemberSpecificReply(mode, depth, input, mentionedMember);
  }

  const replies: Record<LumenMode, Record<AnalysisDepthMode, string[]>> = {
    vent: {
      cosmic: [
        "That sounds really heavy. I hear you, and I'm holding space for this with you.",
        "You don't have to figure this out right now. Sometimes the stars ask us to just feel what we're feeling.",
        "Thank you for sharing that with me. I'm here, sitting with it alongside you in this cosmic moment.",
      ],
      behavioral: [
        "That sounds really heavy. I hear you, and I see the pattern you're describing.",
        "You don't have to figure this out right now. Your feelings are valid, and I'm here with you.",
        "Thank you for sharing that with me. I'm here, holding space for what you're experiencing.",
      ],
      'full-spectrum': [
        "That sounds really heavy. I hear you — both the cosmic currents and your lived experience are speaking here.",
        "You don't have to figure this out right now. The universe and your patterns are both asking you to just be with this.",
        "Thank you for sharing that with me. I'm here, holding all of it — your story, your stars, your truth.",
      ],
    },
    guided: {
      cosmic: [
        "When you say that, what does your cosmic blueprint suggest about this feeling? What's your Life Path asking of you here?",
        "I'm curious — with your current Personal Year energy, how does this situation feel different than it might have last year?",
        "What do you think your soul chose to learn through this experience? What's the deeper cosmic invitation?",
      ],
      behavioral: [
        "When you say that, what emotion comes up most strongly? I notice this connects to a pattern you've logged before.",
        "What do you think this situation is asking of you, based on what you know about your triggers and needs?",
        "If you could speak to the part of you that always responds this way, what would you want to tell them?",
      ],
      'full-spectrum': [
        "When you say that, I see both your cosmic nature and your learned patterns at play. What feels most true right now?",
        "What do you think this situation is asking of you — both from your soul's perspective and your human experience?",
        "If the other person could hear one thing from you right now — drawing on everything you know about yourself — what would it be?",
      ],
    },
    analysis: {
      cosmic: [
        "Based on your numerology, this reflects a classic Life Path 6 challenge with boundaries. Your current Personal Year 4 is actually perfect timing to address this.",
        "What you're describing aligns with your Venus in Cancer placement — you crave emotional depth, but they're showing Mars in Aries energy (action over processing).",
        "The cosmic timing here is significant. You're both in challenging Personal Month cycles, which explains the friction. This will shift by next month.",
      ],
      behavioral: [
        "Based on the patterns I've observed, this dynamic reflects a recurring push-pull between your autonomy needs and connection needs.",
        "What you're describing aligns with a shadow trigger I've seen come up before — specifically around acknowledgment and feeling heard.",
        "The interaction history suggests this tension has been building since that boundary conversation three weeks ago.",
      ],
      'full-spectrum': [
        "I see this from multiple angles. Cosmically, you're a Life Path 6 (nurturer) and they're showing Life Path 1 energy — natural tension. Behaviorally, this manifests in your logged data: 4 out of 5 recent interactions left you drained.",
        "Your Venus in Cancer craves emotional depth, but your logged data shows they dismiss feelings at a moderate intensity. The cosmic blueprint explains WHY, the behavioral data shows HOW it plays out.",
        "You're in a Personal Year 4 (boundaries) while your logged patterns show you struggle with feeling unheard. The universe is asking you to practice what your human experience has been teaching you.",
      ],
    },
    advice: {
      cosmic: [
        "Before responding, check your Personal Day energy — if it's a 7 or 9 day, wait. Your numerology suggests you need space to process before engaging.",
        "An NVC approach here, timed with your cosmic cycles: Wait until your next Personal Day 3 or 6, then try: 'When this happens, I feel disconnected because I need emotional attunement.'",
        "The most powerful move right now honors your Life Path 6 need for harmony while respecting their Life Path 1 need for independence.",
      ],
      behavioral: [
        "Before responding, try naming your own feeling first — not the story, just the feeling. Your logged data shows this helps you stay centered.",
        "An NVC approach: 'When [this specific behavior], I feel [your actual emotion] because I need [your core need]. Would you be willing to [specific request]?'",
        "The most powerful move right now isn't saying more — it's creating space for them to be heard first. Your interaction logs show this works better than explaining.",
      ],
      'full-spectrum': [
        "Before responding, check both your Personal Day energy AND your emotional state from recent interactions. If either feels heavy, wait until tomorrow.",
        "An NVC approach timed with your cosmic wisdom: 'When you dismiss my feelings, I feel unseen because I need connection. Would you be willing to just acknowledge what I'm sharing?'",
        "Combine your cosmic timing with behavioral insights: Wait for a Personal Day 3 or 6, then create space for them to be heard first — your logs show this works — THEN share your need.",
      ],
    },
    timing: {
      cosmic: [
        "They're in a 7 Personal Year — introspective, inward-facing. Pushing for resolution now may meet resistance. Wait for their Personal Month 3 cycle next month.",
        "Mercury is retrograde through their natal communication house until the 15th. Misunderstandings are amplified — put important conversations on hold.",
        "Your Life Path 1 and their Expression 8 are in a power axis this quarter. Collaboration works better than confrontation. Best days: 6th, 15th, 24th.",
      ],
      behavioral: [
        "Based on your interaction patterns, Tuesday evenings work best for deeper conversations — they're typically in a better mood then.",
        "Your logs show they're most receptive after they've had alone time. Wait until they initiate contact rather than reaching out first.",
        "The pattern suggests waiting 3–5 days after conflict before addressing it. They need processing time, and you need space from your people-pleasing trigger.",
      ],
      'full-spectrum': [
        "Cosmically, they're in a 7 Personal Year (introspective) and behaviorally, your logs show they need 3–5 days to process after conflict. Wait until their Personal Day 6 next week AND after they've had their usual processing time.",
        "Mercury retrograde through their communication house until the 15th, plus your interaction data shows Tuesday evenings work best. The sweet spot: Tuesday the 16th, after 7pm.",
        "Your Life Path 1 wants to address this now, but both cosmic timing (their 7 year) and behavioral patterns (they withdraw when pushed) suggest patience. Wait for their Personal Day 3 or 6, after they've had space.",
      ],
    },
  };

  const modeReplies = replies[mode][depth];
  return modeReplies[Math.floor(Math.random() * modeReplies.length)];
}

function getMemberSpecificReply(mode: LumenMode, _depth: AnalysisDepthMode, _input: string, memberContext: MemberContext): string {
  const member = memberContext.member;
  const name = member.fullName;

  const contextReplies: Record<LumenMode, string[]> = {
    vent: [
      `I hear you about ${name}. That sounds really difficult, and I'm holding space for these feelings with you.`,
      `Your feelings about ${name} are completely valid. You don't need to figure this out right now — just feel what you're feeling.`,
    ],
    guided: [
      `When you think about ${name}, what comes up most strongly for you right now?`,
      `I'm curious — what do you think ${name} might be experiencing in this situation too?`,
      `What would it look like to approach this with ${name} from a place of curiosity rather than certainty?`,
    ],
    analysis: [
      `Looking at your history with ${name}, I see a pattern where ${member.recentInteractions?.[0]?.moodAfter === 'drained' ? 'interactions often leave you feeling drained' : 'your connection has ups and downs'}. This suggests ${member.traits?.cons?.[0]?.text?.toLowerCase() || 'some underlying dynamic at play'}.`,
      `Based on what you've logged about ${name}, they're a ${member.relationType === 'other' ? member.relationTypeCustom : member.relationType} who ${member.traits?.pros?.[0]?.text?.toLowerCase() || 'brings both gifts and challenges to your relationship'}.`,
    ],
    advice: [
      `With ${name}, I'd suggest starting with: "When [specific behavior], I feel [emotion] because I need [need]." Based on your logs, they respond better to ${member.recentInteractions?.[0]?.moodAfter === 'peaceful' ? 'direct but gentle communication' : 'space before deeper conversations'}.`,
      `Given what you know about ${name}, the most effective approach might be ${member.traits?.pros?.[0]?.text?.includes('listen') ? "sharing your feelings openly — they're a good listener" : 'giving them time to process before having this conversation'}.`,
    ],
    timing: [
      `Based on ${name}'s patterns, ${member.patterns?.[0]?.frequency === 'monthly' ? 'this might be part of their monthly cycle of stress. Wait for the pattern to shift' : 'timing matters here. They typically need space to process before engaging'}.`,
      `Your interaction history with ${name} shows ${member.recentInteractions?.[0]?.moodAfter === 'drained' ? 'recent conversations have been draining. Give it a few days before reaching out' : "they're more receptive when they initiate contact"}.`,
    ],
  };

  const replies = contextReplies[mode];
  return replies[Math.floor(Math.random() * replies.length)];
}
