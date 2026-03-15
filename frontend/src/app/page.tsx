'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

// ─── TYPES ────────────────────────────────────────────────────────────────
interface AudioTrack {
  id: string;
  tag: string;
  category: string;
  title: string;
  subtitle: string;
  dur: string;
  freq: number;
  preview: string;
}

interface VoicePersona {
  id: string;
  name: string;
  note: string;
  waveType: OscillatorType;
  baseGain: number;
}

interface Pillar {
  num: string;
  tag: string;
  name: string;
  latin: string;
  icon: string;
  desc: string;
}

interface Archetype {
  num: string;
  name: string;
  trait: string;
  desc: string;
  accent: string;
}

interface Step {
  n: string;
  label: string;
  body: string;
}

interface Difference {
  label: string;
  body: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────
const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: "what-is-lumis",
    tag: "What is Lumis",
    category: "Foundation",
    title: "The Architecture of Knowing",
    subtitle: "A private map of the people you love",
    dur: "4:12",
    freq: 174,
    preview: "Lumis is not a social platform. It is not a personality quiz. It is something more intimate and more useful than either — a private cartography of the human connections that shape your life."
  },
  {
    id: "overthinker",
    tag: "For the Overthinker",
    category: "For Whom",
    title: "When Your Mind Won't Rest",
    subtitle: "Understanding is the cure for rumination",
    dur: "5:40",
    freq: 285,
    preview: "If you find yourself replaying conversations at 2am, reconstructing what was said and what was meant — Lumis was built for you. Not to quiet the mind, but to give it the answers it has been looking for all along."
  },
  {
    id: "empath",
    tag: "For the Empath",
    category: "For Whom",
    title: "The Weight You Carry",
    subtitle: "Distinguishing your energy from theirs",
    dur: "6:02",
    freq: 396,
    preview: "You feel everything. You absorb the emotional weather of every room you enter. You carry grief that belongs to someone else, and you don't always know how to set it down."
  }
];

const VOICE_PERSONAS: VoicePersona[] = [
  { id: "soft", name: "Soft Voice", note: "Warm, unhurried, feminine presence", waveType: "sine", baseGain: 0.07 },
  { id: "deep", name: "Deep Voice", note: "Grounded, resonant, masculine clarity", waveType: "triangle", baseGain: 0.09 },
  { id: "sage", name: "The Sage", note: "Androgynous, precise, contemplative", waveType: "sine", baseGain: 0.06 }
];

const PILLARS: Pillar[] = [
  { num: "01", tag: "I · Psychology", name: "Observed Traits", latin: "Psychologia", icon: "◈", desc: "Log patterns, soft signals, and behavioural nuances over time to build a living, comprehensive landscape of the people in your world." },
  { num: "02", tag: "II · Numerology", name: "Numerological Blueprints", latin: "Mathesis", icon: "◎", desc: "Discover the vibrational frequency of names and dates — the hidden architecture of purpose, compatibility, and timing." },
  { num: "03", tag: "III · Celestial", name: "Vedic Astrology", latin: "Jyotisha", icon: "✦", desc: "Ancient cosmic wisdom applied to modern timing. Know when to lean in and when the universe is asking you to wait." },
  { num: "04", tag: "IV · Artificial", name: "Lumen AI", latin: "Intelligentia", icon: "⊕", desc: "Our proprietary engine synthesises all inputs into one clear, gentle, and private voice of reason. Not a dashboard. A companion." }
];

const ARCHETYPES: Archetype[] = [
  { num: "7", name: "The Overthinker", trait: "Analytical · Seeking · Precise", desc: "For those whose minds never rest, trying to solve the puzzle of human behaviour. We provide the missing pieces and quiet the noise.", accent: "#5C4A8B" },
  { num: "2", name: "The Empath", trait: "Receptive · Feeling · Porous", desc: "For those who feel everything deeply. We help you distinguish between your own energy and the currents of those around you.", accent: "#8B3A4A" },
  { num: "5", name: "The Pattern Repeater", trait: "Recursive · Searching · Ready", desc: "For those who find themselves in the same dynamics again and again. We shine a light on the cycles, offering the map to break free.", accent: "#4D6B44" }
];

const STEPS: Step[] = [
  { n: "I", label: "Build Your Circle", body: "Add the people who shape your inner world. Their names, birth dates, and a relationship context are all Lumis needs to begin." },
  { n: "II", label: "Observe and Log", body: "Capture interactions, patterns, and emotional notes in real time. Voice-to-text logging means your insights never wait." },
  { n: "III", label: "Receive Intelligence", body: "Lumis synthesises your observations with numerological and astrological data to produce living, evolving portraits." },
  { n: "IV", label: "Hear Lumen's Voice", body: "Your AI companion speaks plainly, privately, and without judgement. It tells you what the numbers know and what your logs reveal." }
];

const DIFFERENCES: Difference[] = [
  { label: "Private by Architecture", body: "No public profiles. No social graph. Everything you observe belongs only to you — encrypted, unindexed, and unreachable." },
  { label: "Multi-Intelligence", body: "Psychology, numerology, astrology, and AI don't compete here — they converge. One holistic portrait instead of four partial ones." },
  { label: "Living Intelligence", body: "Timing numbers update automatically. Lumis knows what life phase someone occupies right now — not just who they were born as." },
  { label: "The Lumen Voice", body: "All insights pass through Lumen — one clear, gentle voice. Not a dashboard full of data. A companion who actually synthesises." }
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────
const LumisLandingPage = () => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('soft');
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleGetStarted = () => {
    router.push('/signup');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const playAudio = (trackId: string) => {
    if (currentAudio === trackId && isPlaying) {
      setIsPlaying(false);
      setCurrentAudio(null);
    } else {
      setCurrentAudio(trackId);
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-lumis-bg-primary">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-lumis-bg-primary/95 backdrop-blur-sm border-b border-lumis-text-tertiary/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-lumis-accent-primary rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-lumis-bg-primary">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <span className="font-serif text-xl font-semibold text-lumis-text-primary">Lumis</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleSignIn}
              className="text-lumis-text-secondary hover:text-lumis-text-primary transition-colors font-sans text-sm"
            >
              Sign In
            </button>
            <button 
              onClick={handleGetStarted}
              className="bg-lumis-accent-primary hover:bg-lumis-accent-primary/90 text-lumis-bg-primary px-6 py-2 rounded-full font-sans text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-lumis-surface px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-lumis-accent-ai rounded-full animate-pulse"></div>
              <span className="font-sans text-sm text-lumis-text-secondary">Private Intelligence for Your Inner Circle</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-lumis-text-primary mb-6 leading-tight">
              The quiet light that helps you<br />
              <span className="text-lumis-accent-primary">finally see a person clearly</span>
            </h1>
            <p className="font-serif text-xl text-lumis-text-secondary max-w-2xl mx-auto leading-relaxed">
              Lumis is not a social platform. It is not a personality quiz. It is something more intimate and more useful than either — a private cartography of the human connections that shape your life.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <button 
              onClick={handleGetStarted}
              className="bg-lumis-accent-primary hover:bg-lumis-accent-primary/90 text-lumis-bg-primary px-8 py-4 rounded-full font-sans font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Begin Your Map
            </button>
            <button className="flex items-center space-x-2 text-lumis-text-secondary hover:text-lumis-text-primary transition-colors font-sans">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-lumis-accent-secondary">
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
              </svg>
              <span>Listen to Introduction</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center space-x-8 text-lumis-text-tertiary font-sans text-sm">
            <div className="flex items-center space-x-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-lumis-accent-primary">
                <path d="M12 1L15.09 8.26L22 9L15.09 9.74L12 17L8.91 9.74L2 9L8.91 8.26L12 1Z" fill="currentColor"/>
              </svg>
              <span>Completely Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-lumis-accent-secondary">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              <span>No Social Layer</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-lumis-accent-ai">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
              </svg>
              <span>AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Audio Tracks Section */}
      <section className="py-20 px-6 bg-lumis-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-lumis-text-primary mb-4">
              Listen to Understand
            </h2>
            <p className="font-serif text-lg text-lumis-text-secondary max-w-2xl mx-auto">
              These audio guides explain what Lumis is, who it serves, and how it works differently from anything else you have tried.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {AUDIO_TRACKS.map((track) => (
              <div 
                key={track.id}
                className="bg-lumis-surface rounded-2xl p-6 border border-lumis-text-tertiary/10 hover:border-lumis-accent-primary/20 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-lumis-accent-primary/10 px-3 py-1 rounded-full">
                    <span className="font-sans text-xs font-medium text-lumis-accent-primary">{track.tag}</span>
                  </div>
                  <button 
                    onClick={() => playAudio(track.id)}
                    className="w-10 h-10 bg-lumis-accent-primary rounded-full flex items-center justify-center hover:bg-lumis-accent-primary/90 transition-colors"
                  >
                    {currentAudio === track.id && isPlaying ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-lumis-bg-primary">
                        <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-lumis-bg-primary ml-0.5">
                        <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                      </svg>
                    )}
                  </button>
                </div>
                
                <h3 className="font-serif text-xl font-semibold text-lumis-text-primary mb-2">
                  {track.title}
                </h3>
                <p className="font-serif text-lumis-text-secondary mb-4 text-sm leading-relaxed">
                  {track.subtitle}
                </p>
                <p className="font-serif text-lumis-text-tertiary text-sm leading-relaxed mb-4">
                  {track.preview}
                </p>
                
                <div className="flex items-center justify-between text-xs font-sans text-lumis-text-tertiary">
                  <span>{track.dur}</span>
                  <span>{track.freq} Hz</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Pillars Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-lumis-text-primary mb-4">
              Four Pillars of Understanding
            </h2>
            <p className="font-serif text-lg text-lumis-text-secondary max-w-2xl mx-auto">
              Lumis combines observed behavior, numerological blueprints, celestial wisdom, and artificial intelligence into one coherent system of human understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {PILLARS.map((pillar) => (
              <div 
                key={pillar.num}
                className="group bg-lumis-surface rounded-2xl p-8 border border-lumis-text-tertiary/10 hover:border-lumis-accent-primary/20 transition-all duration-300 hover:shadow-lg cursor-pointer"
                onMouseEnter={() => setHoveredPillar(pillar.num)}
                onMouseLeave={() => setHoveredPillar(null)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-lumis-accent-primary/10 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl text-lumis-accent-primary">{pillar.icon}</span>
                    </div>
                    <div className="text-center">
                      <span className="font-mono text-xs text-lumis-text-tertiary">{pillar.num}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="font-sans text-xs font-medium text-lumis-accent-secondary bg-lumis-accent-secondary/10 px-2 py-1 rounded">
                        {pillar.tag}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-lumis-text-primary mb-2">
                      {pillar.name}
                    </h3>
                    <p className="font-sans text-xs text-lumis-text-tertiary mb-3 italic">
                      {pillar.latin}
                    </p>
                    <p className="font-serif text-lumis-text-secondary leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archetypes Section */}
      <section className="py-20 px-6 bg-lumis-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-lumis-text-primary mb-4">
              Who This Serves
            </h2>
            <p className="font-serif text-lg text-lumis-text-secondary max-w-2xl mx-auto">
              Lumis was built for specific types of people who think deeply about relationships and want to understand the patterns that shape their connections.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {ARCHETYPES.map((archetype) => (
              <div 
                key={archetype.num}
                className="bg-lumis-surface rounded-2xl p-6 border border-lumis-text-tertiary/10 hover:border-lumis-accent-primary/20 transition-all duration-300 hover:shadow-lg"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-lumis-accent-primary/20 flex items-center justify-center">
                    <span className="font-serif text-2xl font-bold text-lumis-accent-primary">{archetype.num}</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-lumis-text-primary mb-2">
                    {archetype.name}
                  </h3>
                  <p className="font-sans text-sm text-lumis-text-secondary mb-4">
                    {archetype.trait}
                  </p>
                </div>
                <p className="font-serif text-lumis-text-secondary leading-relaxed text-center">
                  {archetype.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-lumis-text-primary mb-4">
              How It Works
            </h2>
            <p className="font-serif text-lg text-lumis-text-secondary max-w-2xl mx-auto">
              Four simple steps to build your private map of human understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, index) => (
              <div key={step.n} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-lumis-accent-primary/10 rounded-full flex items-center justify-center border-2 border-lumis-accent-primary/20">
                    <span className="font-serif text-xl font-bold text-lumis-accent-primary">{step.n}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-lumis-text-tertiary/20"></div>
                  )}
                </div>
                <h3 className="font-serif text-lg font-semibold text-lumis-text-primary mb-3">
                  {step.label}
                </h3>
                <p className="font-serif text-lumis-text-secondary leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes It Different */}
      <section className="py-20 px-6 bg-lumis-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-lumis-text-primary mb-4">
              What Makes Lumis Different
            </h2>
            <p className="font-serif text-lg text-lumis-text-secondary max-w-2xl mx-auto">
              Unlike social platforms or personality tests, Lumis is built for depth, privacy, and genuine understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {DIFFERENCES.map((diff, index) => (
              <div 
                key={index}
                className="bg-lumis-surface rounded-2xl p-6 border border-lumis-text-tertiary/10"
              >
                <h3 className="font-serif text-lg font-semibold text-lumis-text-primary mb-3">
                  {diff.label}
                </h3>
                <p className="font-serif text-lumis-text-secondary leading-relaxed">
                  {diff.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold text-lumis-text-primary mb-6">
            Ready to see clearly?
          </h2>
          <p className="font-serif text-xl text-lumis-text-secondary mb-8 max-w-2xl mx-auto">
            Join the quiet revolution of people who choose understanding over assumption, depth over surface, and privacy over performance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={handleGetStarted}
              className="bg-lumis-accent-primary hover:bg-lumis-accent-primary/90 text-lumis-bg-primary px-8 py-4 rounded-full font-sans font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Begin Your Journey
            </button>
            <button 
              onClick={handleSignIn}
              className="text-lumis-text-secondary hover:text-lumis-text-primary transition-colors font-sans text-lg"
            >
              Already have an account?
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-lumis-text-tertiary/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-lumis-accent-primary rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-lumis-bg-primary">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="font-serif text-lg font-semibold text-lumis-text-primary">Lumis</span>
            </div>
            
            <div className="flex items-center space-x-8 text-lumis-text-tertiary font-sans text-sm">
              <button className="hover:text-lumis-text-primary transition-colors">Privacy</button>
              <button className="hover:text-lumis-text-primary transition-colors">Terms</button>
              <button className="hover:text-lumis-text-primary transition-colors">Support</button>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-lumis-text-tertiary/10 text-center">
            <p className="font-serif text-lumis-text-tertiary text-sm">
              The quiet light that helps you finally see a person clearly.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LumisLandingPage;