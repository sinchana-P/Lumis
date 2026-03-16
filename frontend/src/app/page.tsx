'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Mono:ital,wght@0,300;0,400;1,300&family=Lora:ital,wght@0,400;0,500;1,400;1,500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

@keyframes fadeUp {
  from { opacity:0; transform:translateY(28px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes fadeIn {
  from { opacity:0; } to { opacity:1; }
}
@keyframes floatA {
  0%,100% { transform:translateY(0) rotate(0deg); }
  40%     { transform:translateY(-14px) rotate(1.5deg); }
  70%     { transform:translateY(7px) rotate(-1deg); }
}
@keyframes floatB {
  0%,100% { transform:translateY(0) scale(1); }
  50%     { transform:translateY(-10px) scale(1.04); }
}
@keyframes pulseRing {
  0%   { transform:scale(1); opacity:0.5; }
  100% { transform:scale(1.9); opacity:0; }
}
@keyframes waveBar {
  0%,100% { transform:scaleY(0.25); }
  50%     { transform:scaleY(1); }
}
@keyframes dotPulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%     { opacity:0.35; transform:scale(0.7); }
}
@keyframes slideIn {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
}

.lumis-nav-link:hover { color: #8B5E3C !important; }
.lumis-cta-primary:hover { background:#6E4A2E !important; }
.lumis-cta-secondary:hover { background:rgba(139,94,60,0.07) !important; }
.lumis-tag:hover { border-color:rgba(139,94,60,0.5) !important; color:#8B5E3C !important; }
.lumis-pillar:hover { background:#EAE0D4 !important; }
.lumis-archetype:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(44,24,16,0.08) !important; }
.lumis-voice:hover { border-color:rgba(139,94,60,0.5) !important; }
.lumis-play:hover { box-shadow:0 0 0 8px rgba(139,94,60,0.1) !important; }
.lumis-step:hover .step-num { color:#8B5E3C !important; }
.lumis-diff:hover { background:#EAE0D4 !important; }
`;

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:         '#F9F5EF',
  surface:    '#F3EBE1',
  surface2:   '#ECE2D6',
  border:     '#DDD0BC',
  borderSoft: '#E8DDD0',
  accent:     '#8B5E3C',
  accentSoft: '#B08060',
  accentGlow: 'rgba(139,94,60,0.10)',
  gold:       '#C4A055',
  goldGlow:   'rgba(196,160,85,0.12)',
  text:       '#1E140C',
  textDim:    '#7A5840',
  textMuted:  '#AB9480',
  textFaint:  '#C8B8A8',
  sage:       '#4D6B44',
  cosmic:     '#5C4A8B',
  ink:        '#140C06',
};

// ─── FONTS ────────────────────────────────────────────────────────────────────
const CG  = "'Cormorant Garamond', 'Crimson Pro', Georgia, serif";
const DMM = "'DM Mono', 'JetBrains Mono', monospace";
const LOR = "'Lora', 'Crimson Pro', Georgia, serif";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const AUDIO_TRACKS = [
  { id:'what-is-lumis',    tag:'What is Lumis',               category:'Foundation',   title:'The Architecture of Knowing',          subtitle:'A private map of the people you love',           dur:'4:12', freq:174, preview:'Lumis is not a social platform. It is not a personality quiz. It is something more intimate and more useful than either — a private cartography of the human connections that shape your life. Every person in your world carries a set of frequencies. Lumis reads them.' },
  { id:'overthinker',      tag:'For the Overthinker',         category:'For Whom',     title:'When Your Mind Won\'t Rest',            subtitle:'Understanding is the cure for rumination',       dur:'5:40', freq:285, preview:'If you find yourself replaying conversations at 2am, reconstructing what was said and what was meant — Lumis was built for you. Not to quiet the mind, but to give it the answers it has been looking for all along. You don\'t think too much. You simply haven\'t had enough to think with.' },
  { id:'empath',           tag:'For the Empath',              category:'For Whom',     title:'The Weight You Carry',                  subtitle:'Distinguishing your energy from theirs',         dur:'6:02', freq:396, preview:'You feel everything. You absorb the emotional weather of every room you enter. You carry grief that belongs to someone else, and you don\'t always know how to set it down. Lumis helps you see whose weight is whose — so that love doesn\'t cost you yourself.' },
  { id:'pattern-repeater', tag:'For the Pattern Repeater',    category:'For Whom',     title:'The Cycle You Keep Finding',            subtitle:'Seeing the pattern is the first step to leaving', dur:'5:18', freq:417, preview:'Different relationship. Same feeling. You have been here before — in the specific emotional texture of this dynamic, with different faces playing familiar roles. Lumis traces the pattern until it becomes undeniable. Not to judge you. To set you free.' },
  { id:'numerology',       tag:'Numerological Blueprints',    category:'Intelligence', title:'The Numbers Beneath the Noise',         subtitle:'What ancient systems reveal that psychology can\'t', dur:'7:30', freq:528, preview:'Every person carries a vibrational architecture — a set of core numbers derived from name and birth date that describes not just personality, but the soul\'s direction. These numbers don\'t predict. They illuminate. And what they reveal about the people you love will change how you see every interaction.' },
  { id:'understanding',    tag:'Understanding Someone You Love', category:'Foundation', title:'What They Can\'t Tell You',             subtitle:'The numerological portrait as a love language',  dur:'5:55', freq:639, preview:'The people you love contain depths they cannot articulate. Not because they are hiding from you — but because they have not yet found language for what lives inside them. Lumis translates. And in that translation, you will find not just understanding — but a kind of compassion you didn\'t know was available to you.' },
  { id:'soul-blueprint',   tag:'Your Soul\'s Blueprint',      category:'Intelligence', title:'The Person You Were Born to Become',    subtitle:'Life Path, Expression, Soul Urge — decoded',    dur:'8:14', freq:741, preview:'Your Life Path number is not a prediction. It is a direction. It describes the fundamental orientation your soul chose before arriving in this body, this family, this life. Understanding your blueprint is not self-obsession. It is the most practical thing you will ever do for the people who love you.' },
  { id:'alchemy',          tag:'Relational Alchemy',          category:'Intelligence', title:'Why Some Feel Like Coming Home',        subtitle:'And others like learning a foreign language',    dur:'6:45', freq:852, preview:'Compatibility is not about matching personalities. It is about two numerical architectures finding resonance — or productive friction. Both can be beautiful. Both can be transformative. Lumis shows you which is which, so you can stop interpreting friction as failure.' },
];

const VOICE_PERSONAS = [
  { id:'soft', name:'Soft Voice',  note:'Warm, unhurried, feminine presence',    waveType:'sine'     as OscillatorType, baseGain:0.07 },
  { id:'deep', name:'Deep Voice',  note:'Grounded, resonant, masculine clarity', waveType:'triangle' as OscillatorType, baseGain:0.09 },
  { id:'sage', name:'The Sage',    note:'Androgynous, precise, contemplative',   waveType:'sine'     as OscillatorType, baseGain:0.06 },
];

const PILLARS = [
  { num:'01', tag:'I · Psychology',  name:'Observed Traits',          latin:'Psychologia',   icon:'◈', desc:'Log patterns, soft signals, and behavioural nuances over time to build a living, comprehensive landscape of the people in your world.' },
  { num:'02', tag:'II · Numerology', name:'Numerological Blueprints', latin:'Mathesis',      icon:'◎', desc:'Discover the vibrational frequency of names and dates — the hidden architecture of purpose, compatibility, and timing.' },
  { num:'03', tag:'III · Celestial', name:'Vedic Astrology',          latin:'Jyotisha',      icon:'✦', desc:'Ancient cosmic wisdom applied to modern timing. Know when to lean in and when the universe is asking you to wait.' },
  { num:'04', tag:'IV · Artificial', name:'Lumen AI',                 latin:'Intelligentia', icon:'⊕', desc:'Our proprietary engine synthesises all inputs into one clear, gentle, and private voice of reason. Not a dashboard. A companion.' },
];

const ARCHETYPES = [
  { num:'7', name:'The Overthinker',     trait:'Analytical · Seeking · Precise',  desc:'For those whose minds never rest, trying to solve the puzzle of human behaviour. We provide the missing pieces and quiet the noise.',        accent:'#5C4A8B' },
  { num:'2', name:'The Empath',          trait:'Receptive · Feeling · Porous',    desc:'For those who feel everything deeply. We help you distinguish between your own energy and the currents of those around you.',                  accent:'#8B3A4A' },
  { num:'5', name:'The Pattern Repeater',trait:'Recursive · Searching · Ready',   desc:'For those who find themselves in the same dynamics again and again. We shine a light on the cycles, offering the map to break free.',          accent:'#4D6B44' },
];

const STEPS = [
  { n:'I',   label:'Build Your Circle',    body:'Add the people who shape your inner world. Their names, birth dates, and a relationship context are all Lumis needs to begin.' },
  { n:'II',  label:'Observe and Log',      body:'Capture interactions, patterns, and emotional notes in real time. Voice-to-text logging means your insights never wait.' },
  { n:'III', label:'Receive Intelligence', body:'Lumis synthesises your observations with numerological and astrological data to produce living, evolving portraits.' },
  { n:'IV',  label:"Hear Lumen's Voice",   body:'Your AI companion speaks plainly, privately, and without judgement. It tells you what the numbers know and what your logs reveal.' },
];

const DIFFS = [
  { label:'Private by Architecture', body:'No public profiles. No social graph. Everything you observe belongs only to you — encrypted, unindexed, and unreachable.' },
  { label:'Multi-Intelligence',      body:"Psychology, numerology, astrology, and AI don't compete here — they converge. One holistic portrait instead of four partial ones." },
  { label:'Living Intelligence',     body:'Timing numbers update automatically. Lumis knows what life phase someone occupies right now — not just who they were born as.' },
  { label:'The Lumen Voice',         body:'All insights pass through Lumen — one clear, gentle voice. Not a dashboard full of data. A companion who actually synthesises.' },
];

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.85s ease ${delay}s, transform 0.85s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function SectionMark({ num, label }: { num: string; label: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
      <span style={{ fontFamily:CG, fontSize:11, color:C.accentSoft, letterSpacing:'3px' }}>{num}</span>
      <span style={{ width:28, height:1, background:C.border, display:'inline-block' }}/>
      <span style={{ fontFamily:DMM, fontSize:11, letterSpacing:'2.5px', color:C.textMuted, textTransform:'uppercase' as const }}>{label}</span>
    </div>
  );
}

function HrDeco() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16 }}>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, transparent, ${C.border})` }}/>
      <span style={{ fontFamily:CG, fontSize:14, color:C.border }}>✦</span>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${C.border}, transparent)` }}/>
    </div>
  );
}

function Waveform({ playing, color = C.accent, bars = 16 }: { playing: boolean; color?: string; bars?: number }) {
  const heights = [0.35,0.6,1,0.55,0.85,0.45,0.95,1,0.65,0.4,0.8,0.55,1,0.45,0.7,0.5];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:2.5, height:28 }}>
      {heights.slice(0, bars).map((h, i) => (
        <div key={i} style={{
          width:2.5,
          height: playing ? `${h * 26}px` : '3px',
          background: color,
          borderRadius:2,
          transition:'height 0.18s ease',
          animation: playing ? `waveBar ${0.45 + i * 0.06}s ease-in-out infinite alternate` : 'none',
          animationDelay: `${i * 0.04}s`,
          transformOrigin:'bottom',
        }}/>
      ))}
    </div>
  );
}

function Grain() {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999, pointerEvents:'none',
      opacity:0.022,
      backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E")`,
    }}/>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LumisLanding() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [navScrolled, setNavScrolled] = useState(false);
  const [activeVoice,  setActiveVoice]  = useState('soft');
  const [activeTrack,  setActiveTrack]  = useState<typeof AUDIO_TRACKS[0] | null>(null);
  const [playing,      setPlaying]      = useState(false);
  const [progress,     setProgress]     = useState(0);

  const audioCtxRef   = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ master: GainNode; oscs: OscillatorNode[] } | null>(null);
  const progressRef   = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h, { passive:true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioNodesRef.current && audioCtxRef.current) {
      const { master } = audioNodesRef.current;
      try {
        master.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.9);
        setTimeout(() => {
          try { audioNodesRef.current?.oscs?.forEach(o => o.stop()); } catch(e) {}
          audioNodesRef.current = null;
        }, 950);
      } catch(e) {}
    }
    setPlaying(false);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  useEffect(() => {
    if (playing) {
      progressRef.current = setInterval(() => {
        setProgress(p => { if (p >= 100) { stopAudio(); return 0; } return p + 0.15; });
      }, 100);
    } else {
      if (progressRef.current) clearInterval(progressRef.current);
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [playing, stopAudio]);

  const startAudio = useCallback((track: typeof AUDIO_TRACKS[0]) => {
    const persona = VOICE_PERSONAS.find(v => v.id === activeVoice);
    if (!persona) return;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const master = ctx.createGain();
      master.connect(ctx.destination);
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(persona.baseGain, ctx.currentTime + 1.6);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 700;
      filter.connect(master);

      const oscs: OscillatorNode[] = [];

      const o1 = ctx.createOscillator();
      o1.type = persona.waveType;
      o1.frequency.value = track.freq;
      const g1 = ctx.createGain(); g1.gain.value = 0.7;
      o1.connect(g1); g1.connect(filter); o1.start(); oscs.push(o1);

      const o2 = ctx.createOscillator();
      o2.type = 'sine';
      o2.frequency.value = track.freq * 0.5;
      const g2 = ctx.createGain(); g2.gain.value = 0.2;
      o2.connect(g2); g2.connect(filter); o2.start(); oscs.push(o2);

      const o3 = ctx.createOscillator();
      o3.type = 'sine';
      o3.frequency.value = track.freq * 1.5;
      const g3 = ctx.createGain(); g3.gain.value = 0.08;
      o3.connect(g3); g3.connect(filter); o3.start(); oscs.push(o3);

      audioNodesRef.current = { master, oscs };
    } catch(e) { console.warn('Audio error:', e); }
  }, [activeVoice]);

  const handleTrackSelect = (track: typeof AUDIO_TRACKS[0]) => {
    if (audioNodesRef.current) stopAudio();
    setActiveTrack(track);
    setProgress(0);
    setPlaying(false);
  };

  const handlePlayPause = () => {
    if (playing) { stopAudio(); }
    else { if (activeTrack) { startAudio(activeTrack); setPlaying(true); } }
  };

  // Stop when voice changes
  useEffect(() => { if (playing) stopAudio(); }, [activeVoice]); // eslint-disable-line

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ background:C.bg, color:C.text, fontFamily:DMM, overflowX:'hidden' }}>
        <Grain />

        {/* ══════════════════════════════ NAV ══════════════════════════════ */}
        <nav style={{
          position:'fixed', top:0, left:0, right:0, zIndex:200,
          height:58, padding:'0 52px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background: navScrolled ? `${C.bg}f2` : 'transparent',
          backdropFilter: navScrolled ? 'blur(24px)' : 'none',
          borderBottom:`1px solid ${navScrolled ? C.borderSoft : 'transparent'}`,
          transition:'all 0.45s ease',
        }}>
          <button onClick={() => router.push('/')} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:CG, fontStyle:'italic', fontWeight:300, fontSize:20, letterSpacing:'2px', color:C.text }}>
            Lumis
          </button>
          <div style={{ display:'flex', gap:30, alignItems:'center' }}>
            {[
              { label:'The Mission',  id:'the-mission' },
              { label:'Intelligence', id:'intelligence' },
              { label:'Sanctuary',    id:'sanctuary'   },
              { label:'For Whom',     id:'for-whom'    },
            ].map(({ label, id }) => (
              <button key={id} className="lumis-nav-link"
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })}
                style={{ fontFamily:DMM, fontSize:12, letterSpacing:'1.5px', color:C.textMuted, background:'none', border:'none', cursor:'pointer', textTransform:'uppercase', transition:'color 0.2s' }}>
                {label}
              </button>
            ))}
            <button onClick={() => router.push('/signup')} className="lumis-cta-secondary" style={{ fontFamily:DMM, fontSize:13, letterSpacing:'1.5px', color:C.accent, background:'transparent', border:`1px solid ${C.accent}55`, borderRadius:1, padding:'9px 22px', cursor:'pointer', textTransform:'uppercase', transition:'all 0.2s' }}>
              Start Journey
            </button>
          </div>
        </nav>

        {/* ══════════════════════════════ HERO ══════════════════════════════ */}
        <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', padding:'130px 52px 100px', overflow:'hidden' }}>

          {/* Ambient orbs */}
          <div style={{ position:'absolute', top:'12%', left:'6%', width:360, height:360, borderRadius:'50%', background:`radial-gradient(circle, ${C.accentGlow} 0%, transparent 68%)`, animation:'floatA 9s ease-in-out infinite', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:'18%', right:'8%', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(92,74,139,0.07) 0%, transparent 68%)', animation:'floatB 13s ease-in-out infinite', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', top:'60%', left:'20%', width:160, height:160, borderRadius:'50%', background:`radial-gradient(circle, ${C.goldGlow} 0%, transparent 68%)`, animation:'floatA 7s ease-in-out infinite reverse', pointerEvents:'none' }}/>

          {/* Framing lines */}
          <div style={{ position:'absolute', top:80, left:52, right:52, height:1, background:`linear-gradient(90deg, transparent, ${C.borderSoft}, transparent)` }}/>
          <div style={{ position:'absolute', bottom:80, left:52, right:52, height:1, background:`linear-gradient(90deg, transparent, ${C.borderSoft}, transparent)` }}/>
          <div style={{ position:'absolute', top:80, bottom:80, left:52, width:1, background:`linear-gradient(${C.borderSoft}, transparent, ${C.borderSoft})` }}/>
          <div style={{ position:'absolute', top:80, bottom:80, right:52, width:1, background:`linear-gradient(${C.borderSoft}, transparent, ${C.borderSoft})` }}/>

          {/* Crosshair */}
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none', opacity:0.06 }}>
            <div style={{ width:1, height:72, background:C.accent, margin:'0 auto' }}/>
            <div style={{ width:72, height:1, background:C.accent, marginTop:-36 }}/>
          </div>

          {/* Content */}
          <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:920 }}>
            <div style={{ fontFamily:DMM, fontSize:11, letterSpacing:'3px', color:C.textMuted, textTransform:'uppercase', marginBottom:30, display:'flex', alignItems:'center', justifyContent:'center', gap:16, animation:'fadeUp 1s ease 0.1s both' }}>
              <span style={{ width:20, height:1, background:C.accentSoft, display:'inline-block', opacity:0.6 }}/>
              Private Relationship Intelligence
              <span style={{ width:20, height:1, background:C.accentSoft, display:'inline-block', opacity:0.6 }}/>
            </div>

            <h1 style={{ fontFamily:CG, fontWeight:300, fontSize:'clamp(44px,7.5vw,92px)', lineHeight:1.08, color:C.text, marginBottom:28, animation:'fadeUp 1s ease 0.3s both' }}>
              The <em style={{ fontStyle:'italic', color:C.accentSoft }}>quiet light</em> that helps<br/>
              you finally see the people<br/>
              in your life, and yourself, clearly.
            </h1>

            <p style={{ fontFamily:LOR, fontStyle:'italic', fontSize:15.5, color:C.textDim, lineHeight:1.82, maxWidth:520, margin:'0 auto 50px', animation:'fadeUp 1s ease 0.5s both' }}>
              A private mirror for your social world. Intention-driven relationship intelligence designed for the discerning soul.
            </p>

            <div style={{ display:'flex', gap:14, justifyContent:'center', alignItems:'center', flexWrap:'wrap', animation:'fadeUp 1s ease 0.7s both' }}>
              <button onClick={() => router.push('/signup')} className="lumis-cta-primary" style={{ whiteSpace:'nowrap', padding:'13px 32px', background:C.accent, color:'#F9F5EF', fontFamily:DMM, fontSize:13, letterSpacing:'2px', textTransform:'uppercase', borderRadius:1, border:'none', cursor:'pointer', transition:'background 0.25s' }}>
                Enter the Clarity
              </button>
              <button
                onClick={() => document.getElementById('sanctuary')?.scrollIntoView({ behavior:'smooth' })}
                className="lumis-cta-secondary"
                style={{ whiteSpace:'nowrap', padding:'13px 32px', background:'transparent', color:C.accent, border:`1px solid ${C.accent}50`, fontFamily:DMM, fontSize:13, letterSpacing:'2px', textTransform:'uppercase', borderRadius:1, cursor:'pointer', transition:'all 0.25s' }}>
                Hear the Voice
              </button>
            </div>
          </div>

          {/* Scroll nudge */}
          <div style={{ position:'absolute', bottom:34, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:7, animation:'fadeIn 1s ease 1.4s both' }}>
            <span style={{ fontFamily:DMM, fontSize:10, letterSpacing:'2px', color:C.textFaint, textTransform:'uppercase' }}>Scroll</span>
            <div style={{ width:1, height:36, background:`linear-gradient(${C.border}, transparent)` }}/>
          </div>
        </section>

        {/* ══════════════════════════ THE MIRROR ══════════════════════════════ */}
        <section id="the-mission" style={{ padding:'110px 52px', maxWidth:1140, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:88, alignItems:'center' }}>

            <Reveal>
              <SectionMark num="01" label="The Mirror" />
              <h2 style={{ fontFamily:CG, fontWeight:300, fontSize:'clamp(30px,4vw,54px)', lineHeight:1.15, color:C.text, marginBottom:26 }}>
                Not an app.<br/>
                <em style={{ fontStyle:'italic', color:C.accentSoft }}>A private cartography</em><br/>
                of the people you love.
              </h2>
              <p style={{ fontFamily:LOR, fontSize:13.5, color:C.textDim, lineHeight:1.92, marginBottom:18 }}>
                We spend our lives navigating currents of human emotion without a map. Lumis acts as your private cartographer — translating the unspoken cues and cosmic alignments into actionable wisdom.
              </p>
              <p style={{ fontFamily:LOR, fontSize:13.5, color:C.textDim, lineHeight:1.92 }}>
                This isn't just data. It is an archaeology of connection. We believe that by understanding the patterns of others, we unlock the deepest truths about our own journey.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div style={{ background:C.surface, border:`1px solid ${C.borderSoft}`, borderRadius:2, padding:'44px 38px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:`linear-gradient(180deg, ${C.accentSoft}, ${C.gold}, transparent)` }}/>
                <div style={{ fontFamily:CG, fontSize:96, fontWeight:300, color:`${C.border}60`, position:'absolute', top:4, right:18, lineHeight:1, pointerEvents:'none', userSelect:'none' }}>"</div>
                <p style={{ fontFamily:CG, fontStyle:'italic', fontSize:23, color:C.text, lineHeight:1.65, marginBottom:26, position:'relative' }}>
                  Relationship intelligence is the art of seeing beyond the noise of daily interaction.
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:24, height:1, background:C.accentSoft, opacity:0.5 }}/>
                  <span style={{ fontFamily:DMM, fontSize:11, letterSpacing:'1.5px', color:C.textMuted, textTransform:'uppercase' }}>Founding Principle · Lumis</span>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, background:C.border, marginTop:14 }}>
                {[['4','Intelligence Layers'],['9','Core Numbers Mapped'],['∞','Patterns Observed']].map(([n,l]) => (
                  <div key={l} style={{ background:C.bg, padding:'18px 16px', textAlign:'center' }}>
                    <div style={{ fontFamily:CG, fontSize:32, fontWeight:300, color:C.accentSoft, lineHeight:1 }}>{n}</div>
                    <div style={{ fontFamily:DMM, fontSize:11, letterSpacing:'1px', color:C.textMuted, textTransform:'uppercase', marginTop:5 }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════ AUDIO SANCTUARY ══════════════════════════ */}
        <section id="sanctuary" style={{ padding:'110px 0', background:C.surface, borderTop:`1px solid ${C.borderSoft}`, borderBottom:`1px solid ${C.borderSoft}` }}>
          <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 52px' }}>

            <Reveal style={{ textAlign:'center', marginBottom:52 }}>
              <SectionMark num="02" label="The Auditory Sanctuary" />
              <h2 style={{ fontFamily:CG, fontWeight:300, fontSize:'clamp(30px,4vw,54px)', color:C.text, marginBottom:10 }}>
                <em style={{ fontStyle:'italic' }}>Hear</em> what Lumis knows.
              </h2>
              <p style={{ fontFamily:LOR, fontStyle:'italic', fontSize:13.5, color:C.textMuted, maxWidth:420, margin:'0 auto' }}>
                Choose a voice. Select a topic. Let the intelligence speak to you directly.
              </p>
            </Reveal>

            {/* Voice selector */}
            <Reveal delay={0.1}>
              <div style={{ fontFamily:DMM, fontSize:11, letterSpacing:'2px', color:C.textMuted, textTransform:'uppercase', marginBottom:14, textAlign:'center' }}>Select Voice Persona</div>
              <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:38 }}>
                {VOICE_PERSONAS.map(v => (
                  <button key={v.id} className="lumis-voice" onClick={() => setActiveVoice(v.id)} style={{
                    padding:'16px 28px', background: activeVoice===v.id ? C.accent : C.bg,
                    border:`1px solid ${activeVoice===v.id ? C.accent : C.border}`,
                    borderRadius:1, cursor:'pointer', transition:'all 0.3s', minWidth:190, textAlign:'left',
                  }}>
                    <div style={{ fontFamily:DMM, fontSize:12, letterSpacing:'1.5px', color: activeVoice===v.id ? '#F9F5EF' : C.textDim, textTransform:'uppercase', marginBottom:5 }}>{v.name}</div>
                    <div style={{ fontFamily:LOR, fontStyle:'italic', fontSize:13, color: activeVoice===v.id ? 'rgba(249,245,239,0.65)' : C.textFaint }}>{v.note}</div>
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Topic tags */}
            <Reveal delay={0.2}>
              <div style={{ fontFamily:DMM, fontSize:11, letterSpacing:'2px', color:C.textMuted, textTransform:'uppercase', marginBottom:14, textAlign:'center' }}>Select a Topic</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginBottom:40 }}>
                {AUDIO_TRACKS.map(track => (
                  <button key={track.id} className="lumis-tag" onClick={() => handleTrackSelect(track)} style={{
                    padding:'9px 20px', borderRadius:20,
                    background: activeTrack?.id===track.id ? C.accentGlow : 'transparent',
                    border:`1px solid ${activeTrack?.id===track.id ? `${C.accent}60` : C.border}`,
                    color: activeTrack?.id===track.id ? C.accent : C.textMuted,
                    fontFamily:DMM, fontSize:12, letterSpacing:'1px',
                    textTransform:'uppercase', cursor:'pointer', transition:'all 0.22s',
                  }}>
                    {track.tag}
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Player */}
            {activeTrack ? (
              <Reveal delay={0.05}>
                <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:2, maxWidth:700, margin:'0 auto', overflow:'hidden', boxShadow:`0 10px 50px rgba(44,24,16,0.09)`, animation:'slideIn 0.4s ease-out' }}>
                  <div style={{ padding:'28px 30px 22px', borderBottom:`1px solid ${C.borderSoft}` }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:22 }}>

                      {/* Play/pause */}
                      <button className="lumis-play" onClick={handlePlayPause} style={{ width:60, height:60, borderRadius:'50%', background: playing ? C.accent : 'transparent', border:`1.5px solid ${playing ? C.accent : C.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.3s', position:'relative' }}>
                        {playing && (
                          <>
                            <div style={{ position:'absolute', inset:-8, borderRadius:'50%', border:`1.5px solid ${C.accent}`, opacity:0, animation:'pulseRing 2s ease-out infinite' }}/>
                            <div style={{ position:'absolute', inset:-16, borderRadius:'50%', border:`1px solid ${C.accent}`, opacity:0, animation:'pulseRing 2s ease-out infinite 0.7s' }}/>
                          </>
                        )}
                        <svg width={20} height={20} viewBox="0 0 24 24" fill={playing ? '#F9F5EF' : C.textMuted}>
                          {playing
                            ? <><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></>
                            : <path d="M8 5.14v13.72a1 1 0 001.54.84l10-6.72a1 1 0 000-1.68l-10-6.72A1 1 0 008 5.14z"/>
                          }
                        </svg>
                      </button>

                      {/* Track info */}
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:DMM, fontSize:11, letterSpacing:'1.5px', color:C.accentSoft, textTransform:'uppercase', marginBottom:5 }}>{activeTrack.category}</div>
                        <div style={{ fontFamily:CG, fontSize:22, fontWeight:400, color:C.text, marginBottom:3 }}>{activeTrack.title}</div>
                        <div style={{ fontFamily:LOR, fontStyle:'italic', fontSize:13, color:C.textMuted, marginBottom:12 }}>{activeTrack.subtitle}</div>
                        <Waveform playing={playing} color={C.accent} />
                      </div>

                      {/* Meta */}
                      <div style={{ textAlign:'right', flexShrink:0, paddingTop:2 }}>
                        <div style={{ fontFamily:DMM, fontSize:11, color:C.textDim }}>{activeTrack.dur}</div>
                        <div style={{ fontFamily:DMM, fontSize:11, letterSpacing:'0.5px', color:C.textFaint, marginTop:3, textTransform:'uppercase' }}>{activeTrack.freq}hz solfeggio</div>
                        <div style={{ marginTop:10, display:'flex', gap:6, justifyContent:'flex-end' }}>
                          {playing ? (
                            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                              <div style={{ width:5, height:5, borderRadius:'50%', background:C.accent, animation:'dotPulse 1.1s ease-in-out infinite' }}/>
                              <span style={{ fontFamily:DMM, fontSize:11, color:C.accent, letterSpacing:'1px', textTransform:'uppercase' }}>Live</span>
                            </div>
                          ) : (
                            <span style={{ fontFamily:DMM, fontSize:11, color:C.textFaint, letterSpacing:'1px', textTransform:'uppercase' }}>Paused</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height:2, background:C.surface2, cursor:'pointer' }} onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setProgress(((e.clientX - rect.left) / rect.width) * 100);
                  }}>
                    <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg, ${C.accentSoft}, ${C.gold})`, borderRadius:1, transition:'width 0.1s linear' }}/>
                  </div>

                  {/* Transcript */}
                  <div style={{ padding:'22px 30px 26px' }}>
                    <div style={{ fontFamily:DMM, fontSize:11, letterSpacing:'2px', color:C.accentSoft, textTransform:'uppercase', marginBottom:12 }}>Transcript Preview</div>
                    <p style={{ fontFamily:LOR, fontStyle:'italic', fontSize:13.5, color:C.textDim, lineHeight:1.88 }}>{activeTrack.preview}</p>
                    <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:10 }}>
                      {[activeTrack.category, VOICE_PERSONAS.find(v=>v.id===activeVoice)?.name, `${activeTrack.freq}Hz`].map(tag => (
                        <span key={tag} style={{ padding:'4px 12px', borderRadius:20, background:C.surface, border:`1px solid ${C.borderSoft}`, fontFamily:DMM, fontSize:11, color:C.textFaint, letterSpacing:'1px', textTransform:'uppercase' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ) : (
              <div style={{ textAlign:'center', padding:'36px', fontFamily:LOR, fontStyle:'italic', fontSize:13.5, color:C.textFaint }}>
                Select a topic above to open the player.
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════ ARCHITECTURE ══════════════════════════ */}
        <section id="intelligence" style={{ padding:'110px 52px', maxWidth:1140, margin:'0 auto' }}>
          <Reveal>
            <SectionMark num="03" label="The Architecture" />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:52 }}>
              <h2 style={{ fontFamily:CG, fontWeight:300, fontSize:'clamp(28px,3.5vw,48px)', color:C.text, lineHeight:1.18, maxWidth:400 }}>
                Four pillars.<br/><em style={{ fontStyle:'italic', color:C.accentSoft }}>One voice of reason.</em>
              </h2>
              <p style={{ fontFamily:LOR, fontStyle:'italic', fontSize:12.5, color:C.textMuted, maxWidth:280, lineHeight:1.75, textAlign:'right' }}>
                Each intelligence layer contributes a distinct lens. Together they synthesise into something no single system can offer alone.
              </p>
            </div>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:C.border }}>
            {PILLARS.map((p, i) => (
              <Reveal key={p.num} delay={i * 0.1}>
                <div className="lumis-pillar" style={{ background:C.bg, padding:'36px 26px 32px', minHeight:280, position:'relative', overflow:'hidden', transition:'background 0.3s' }}>
                  <div style={{ position:'absolute', bottom:12, right:16, fontFamily:CG, fontSize:64, fontWeight:300, color:`${C.border}80`, lineHeight:1, pointerEvents:'none', userSelect:'none' }}>{p.num}</div>
                  <div style={{ fontFamily:DMM, fontSize:11, letterSpacing:'1.5px', color:C.textMuted, textTransform:'uppercase', marginBottom:18 }}>{p.tag}</div>
                  <div style={{ fontSize:18, marginBottom:10, color:C.accentSoft }}>{p.icon}</div>
                  <div style={{ fontFamily:CG, fontSize:22, fontWeight:400, color:C.text, marginBottom:4 }}>{p.name}</div>
                  <div style={{ fontFamily:LOR, fontStyle:'italic', fontSize:13, color:C.textFaint, marginBottom:14 }}>{p.latin}</div>
                  <p style={{ fontFamily:LOR, fontSize:14, color:C.textDim, lineHeight:1.78 }}>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════════════════ FOR WHOM ══════════════════════════════ */}
        <section id="for-whom" style={{ padding:'110px 52px', background:C.surface, borderTop:`1px solid ${C.borderSoft}`, borderBottom:`1px solid ${C.borderSoft}` }}>
          <div style={{ maxWidth:1140, margin:'0 auto' }}>
            <Reveal style={{ textAlign:'center', marginBottom:58 }}>
              <SectionMark num="04" label="The Souls" />
              <h2 style={{ fontFamily:CG, fontWeight:300, fontSize:'clamp(28px,4vw,52px)', color:C.text, marginBottom:10, lineHeight:1.18 }}>
                Built for those who feel deeply<br/><em style={{ fontStyle:'italic', color:C.accentSoft }}>and think constantly.</em>
              </h2>
            </Reveal>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:22 }}>
              {ARCHETYPES.map((a, i) => (
                <Reveal key={a.name} delay={i * 0.14}>
                  <div className="lumis-archetype" style={{ background:C.bg, border:`1px solid ${C.borderSoft}`, borderRadius:2, padding:'42px 32px 38px', position:'relative', overflow:'hidden', transition:'transform 0.3s ease, box-shadow 0.3s ease', cursor:'default', boxShadow:'0 2px 12px rgba(44,24,16,0.04)' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${a.accent}, transparent)` }}/>
                    <div style={{ fontFamily:CG, fontSize:80, fontWeight:300, lineHeight:1, marginBottom:6, color:`${C.borderSoft}` }}>
                      <span style={{ position:'relative', zIndex:1, color:`${a.accent}28` }}>{a.num}</span>
                    </div>
                    <div style={{ fontFamily:DMM, fontSize:11, letterSpacing:'1.5px', color:C.textMuted, textTransform:'uppercase', marginBottom:12 }}>{a.trait}</div>
                    <h3 style={{ fontFamily:CG, fontSize:28, fontWeight:400, color:C.text, marginBottom:14, lineHeight:1.2 }}>{a.name}</h3>
                    <p style={{ fontFamily:LOR, fontSize:13, color:C.textDim, lineHeight:1.82 }}>{a.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════ THE CARTOGRAPHY ══════════════════════ */}
        <section style={{ padding:'110px 52px', maxWidth:1140, margin:'0 auto' }}>
          <Reveal>
            <SectionMark num="05" label="The Cartography" />
            <h2 style={{ fontFamily:CG, fontWeight:300, fontSize:'clamp(28px,3.5vw,48px)', color:C.text, lineHeight:1.18, marginBottom:58, maxWidth:480 }}>
              How the intelligence<br/><em style={{ fontStyle:'italic', color:C.accentSoft }}>comes alive.</em>
            </h2>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, position:'relative' }}>
            <div style={{ position:'absolute', top:28, left:'12.5%', right:'12.5%', height:1, background:C.border, zIndex:0 }}/>
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.12}>
                <div className="lumis-step" style={{ padding:'0 24px 0 0', position:'relative', zIndex:1 }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, flexShrink:0, transition:'border-color 0.3s' }}>
                    <span className="step-num" style={{ fontFamily:CG, fontStyle:'italic', fontSize:18, fontWeight:300, color:C.textMuted, transition:'color 0.3s' }}>{s.n}</span>
                  </div>
                  <div style={{ fontFamily:DMM, fontSize:12, letterSpacing:'1px', color:C.accentSoft, textTransform:'uppercase', marginBottom:10 }}>{s.label}</div>
                  <p style={{ fontFamily:LOR, fontSize:14, color:C.textDim, lineHeight:1.82 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════════════════ WHY LUMIS ══════════════════════════════ */}
        <section style={{ padding:'110px 52px', background:C.surface, borderTop:`1px solid ${C.borderSoft}`, borderBottom:`1px solid ${C.borderSoft}` }}>
          <div style={{ maxWidth:1140, margin:'0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:80, alignItems:'start' }}>
              <Reveal>
                <SectionMark num="06" label="The Difference" />
                <h2 style={{ fontFamily:CG, fontWeight:300, fontSize:'clamp(28px,3.5vw,52px)', color:C.text, lineHeight:1.18 }}>
                  Why<br/><em style={{ fontStyle:'italic', color:C.accentSoft }}>Lumis?</em>
                </h2>
              </Reveal>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                {DIFFS.map((d, i) => (
                  <Reveal key={d.label} delay={i * 0.1}>
                    <div className="lumis-diff" style={{ padding:'24px 22px', borderTop:`1px solid ${C.border}`, borderRadius:1, transition:'background 0.25s' }}>
                      <div style={{ fontFamily:DMM, fontSize:12, letterSpacing:'1.5px', color:C.accentSoft, textTransform:'uppercase', marginBottom:10 }}>{d.label}</div>
                      <p style={{ fontFamily:LOR, fontSize:14, color:C.textDim, lineHeight:1.82 }}>{d.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════ TESTIMONIALS ══════════════════════════ */}
        <section style={{ padding:'100px 52px', maxWidth:1140, margin:'0 auto' }}>
          <Reveal style={{ textAlign:'center', marginBottom:52 }}>
            <SectionMark num="07" label="The Witnesses" />
            <h2 style={{ fontFamily:CG, fontWeight:300, fontSize:'clamp(26px,3.5vw,46px)', color:C.text, lineHeight:1.2 }}>
              What clarity<br/><em style={{ fontStyle:'italic', color:C.accentSoft }}>feels like.</em>
            </h2>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
            {[
              { quote:'For the first time, I stopped asking why he behaves the way he does and started understanding it. That shift changed everything.', name:'M.R.', role:'Lumis Member · Early Access' },
              { quote:'The Soul Urge reading for my mother made me cry. Not because it was painful — because it was true in a way she had never been able to say herself.', name:'S.K.', role:'Lumis Member · Early Access' },
              { quote:'I used to spiral after every difficult conversation. Now I have a framework. I have a language. The noise is quieter.', name:'A.T.', role:'Lumis Member · Early Access' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div style={{ background:C.surface, border:`1px solid ${C.borderSoft}`, borderRadius:2, padding:'36px 30px', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, left:0, width:'100%', height:2, background:`linear-gradient(90deg, ${C.accentSoft}60, transparent)` }}/>
                  <p style={{ fontFamily:CG, fontStyle:'italic', fontSize:17, color:C.text, lineHeight:1.7, marginBottom:22 }}>"{t.quote}"</p>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:20, height:1, background:C.accentSoft, opacity:0.5 }}/>
                    <div>
                      <div style={{ fontFamily:DMM, fontSize:12, letterSpacing:'1px', color:C.textDim, textTransform:'uppercase' }}>{t.name}</div>
                      <div style={{ fontFamily:DMM, fontSize:11, letterSpacing:'0.5px', color:C.textFaint, textTransform:'uppercase', marginTop:2 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════════════════ THRESHOLD / CTA ══════════════════════ */}
        <section id="threshold" style={{ padding:'120px 52px', background:C.surface, borderTop:`1px solid ${C.borderSoft}` }}>
          <div style={{ maxWidth:580, margin:'0 auto', textAlign:'center' }}>
            <Reveal>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:22 }}>
                <div style={{ flex:1, maxWidth:60, height:1, background:C.border }}/>
                <span style={{ fontFamily:CG, fontStyle:'italic', fontSize:14, color:C.textFaint, letterSpacing:'2px' }}>The Threshold</span>
                <div style={{ flex:1, maxWidth:60, height:1, background:C.border }}/>
              </div>

              <h2 style={{ fontFamily:CG, fontWeight:300, fontSize:'clamp(34px,5vw,62px)', color:C.text, lineHeight:1.12, marginBottom:18, letterSpacing:'-0.01em' }}>
                The clarity you have been<br/><em style={{ fontStyle:'italic', color:C.accentSoft }}>reaching for is here.</em>
              </h2>
              <p style={{ fontFamily:LOR, fontStyle:'italic', fontSize:14, color:C.textDim, lineHeight:1.85, marginBottom:44 }}>
                Private. Intentional. Yours alone.<br/>
                No social layer. No performance. Just understanding.
              </p>

              <div style={{ display:'flex', gap:12, justifyContent:'center', alignItems:'center', marginBottom:28 }}>
                <button onClick={() => router.push('/signup')} className="lumis-cta-primary" style={{ padding:'15px 38px', background:C.accent, color:'#F9F5EF', fontFamily:DMM, fontSize:13, letterSpacing:'2px', textTransform:'uppercase', borderRadius:1, border:'none', cursor:'pointer', transition:'background 0.25s', boxShadow:`0 4px 28px ${C.accentGlow}` }}>
                  Begin Your Map
                </button>
                <button onClick={() => router.push('/login')} style={{ padding:'15px 24px', background:'transparent', color:C.textMuted, fontFamily:DMM, fontSize:13, letterSpacing:'2px', textTransform:'uppercase', border:'none', cursor:'pointer', transition:'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.textDim)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}>
                  I already have an account →
                </button>
              </div>

              <HrDeco />

              <p style={{ fontFamily:DMM, fontSize:11, letterSpacing:'1.5px', color:C.textFaint, textTransform:'uppercase', marginTop:22 }}>
                Entirely Private · No Public Profiles · No Social Graph
              </p>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════ FOOTER ══════════════════════════════ */}
        <footer style={{ padding:'44px 52px', borderTop:`1px solid ${C.borderSoft}`, background:C.bg }}>
          <div style={{ maxWidth:1140, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
            <span style={{ fontFamily:CG, fontStyle:'italic', fontWeight:300, fontSize:18, color:C.textMuted, letterSpacing:'2px' }}>Lumis</span>
            <HrDeco />
            <div style={{ display:'flex', gap:28 }}>
              {[
                { label:'Privacy', href:'/privacy' },
                { label:'Terms',   href:'/terms'   },
                { label:'Support', href:'mailto:hello@lumis.app' },
              ].map(({ label, href }) => (
                <button key={label} onClick={() => href.startsWith('mailto') ? window.location.href = href : router.push(href)}
                  style={{ fontFamily:DMM, fontSize:11, letterSpacing:'1px', color:C.textFaint, background:'none', border:'none', cursor:'pointer', textTransform:'uppercase', transition:'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.textMuted)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.textFaint)}>
                  {label}
                </button>
              ))}
            </div>
            <span style={{ fontFamily:DMM, fontSize:11, letterSpacing:'1px', color:C.textFaint, textTransform:'uppercase' }}>
              Private Relationship Intelligence · {new Date().getFullYear()}
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
