export interface TourStep {
  id: string;
  // pathname — use ':systemNode' as placeholder, replaced at runtime
  page: string;
  // data-tour attribute value, or null for center-screen modal
  target: string | null;
  // Tab to click before showing this step (data-tour value of the tab button)
  clickTab?: string;
  title: string;
  body: string;
  // Where to place the modal relative to the spotlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  // Extra padding around the spotlight cutout
  spotlightPadding?: number;
}

export const TOUR_STEPS: TourStep[] = [
  // ── WELCOME ──────────────────────────────────────────────────────────────────
  {
    id: 'welcome',
    page: '/dashboard',
    target: null,
    title: 'Welcome to Lumis',
    body: 'Your private intelligence layer for understanding the people in your life. This tour walks you through every feature — end to end.',
    position: 'center',
  },

  // ── DASHBOARD ────────────────────────────────────────────────────────────────
  {
    id: 'dashboard-header',
    page: '/dashboard',
    target: 'dashboard-header',
    title: 'Dashboard',
    body: 'Your home base. Mood check-ins, recent patterns, and Lumen\'s latest observations all surface here each day.',
    position: 'bottom',
  },
  {
    id: 'dashboard-mood',
    page: '/dashboard',
    target: 'emotional-weather',
    title: 'Emotional Weather',
    body: 'Log how you\'re feeling before interactions. This colors Lumen\'s understanding of every log you make that day.',
    position: 'bottom',
    spotlightPadding: 8,
  },
  {
    id: 'dashboard-nav',
    page: '/dashboard',
    target: 'bottom-nav',
    title: 'Navigation',
    body: 'Four sections — Dashboard, Orbit, Lumen, Profile. Everything is exactly one tap away.',
    position: 'top',
  },

  // ── ORBIT ────────────────────────────────────────────────────────────────────
  {
    id: 'orbit-intro',
    page: '/orbit',
    target: null,
    title: 'Your Orbit',
    body: 'Every person you\'re tracking lives here as a node. Drag to rearrange, zoom in and out, switch to list view.',
    position: 'center',
  },
  {
    id: 'orbit-nodes',
    page: '/orbit',
    target: 'orbit-canvas',
    title: 'Luminaries',
    body: 'Each node is a luminary — a person whose patterns you\'re observing. Tap any node to open their full profile.',
    position: 'bottom',
    spotlightPadding: 12,
  },
  {
    id: 'orbit-add',
    page: '/orbit',
    target: 'orbit-add-btn',
    title: 'Add a Luminary',
    body: 'Add anyone — partner, friend, colleague, family. Only you can see their profile. No social features, no sharing.',
    position: 'left',
    spotlightPadding: 6,
  },

  // ── SYSTEM NODE (auto-opened Mia / Luma) ─────────────────────────────────────
  {
    id: 'system-node-intro',
    page: '/orbit/:systemNode',
    target: 'member-info',
    title: 'System Node — Mia',
    body: 'This is your default companion node — pre-built with sample data so you can explore every feature right now.',
    position: 'right',
    spotlightPadding: 8,
  },
  {
    id: 'member-tabs',
    page: '/orbit/:systemNode',
    target: 'member-tabs',
    title: 'Nine Lenses',
    body: 'Nine tabs — each a different lens on this relationship. From raw traits to cosmic timing.',
    position: 'right',
    spotlightPadding: 4,
  },

  // Overview
  {
    id: 'tab-overview',
    page: '/orbit/:systemNode',
    target: 'tab-content',
    clickTab: 'tab-overview',
    title: 'Overview',
    body: 'The at-a-glance snapshot — relation type, quick stats, relationship health, and recent activity.',
    position: 'top',
  },

  // Traits
  {
    id: 'tab-traits',
    page: '/orbit/:systemNode',
    target: 'tab-content',
    clickTab: 'tab-traits',
    title: 'Traits',
    body: 'Log what you observe — strengths, shadows, triggers, and core needs. Each trait builds Lumen\'s psychological model.',
    position: 'top',
  },

  // Incidents
  {
    id: 'tab-incidents',
    page: '/orbit/:systemNode',
    target: 'tab-content',
    clickTab: 'tab-incidents',
    title: 'Incidents',
    body: 'Record specific events with date, description, and emotional impact. Patterns emerge from incidents over time.',
    position: 'top',
  },

  // Patterns
  {
    id: 'tab-patterns',
    page: '/orbit/:systemNode',
    target: 'tab-content',
    clickTab: 'tab-patterns',
    title: 'Patterns',
    body: 'Recurring behavioral cycles you\'ve noticed. Lumis uses these to warn you before predictable dynamics repeat.',
    position: 'top',
  },

  // Interactions
  {
    id: 'tab-interactions',
    page: '/orbit/:systemNode',
    target: 'tab-content',
    clickTab: 'tab-interactions',
    title: 'Interactions',
    body: 'Log meetups and calls — mood before and after. Tracks whether this relationship leaves you energized or drained.',
    position: 'top',
  },

  // Journal
  {
    id: 'tab-journal',
    page: '/orbit/:systemNode',
    target: 'tab-content',
    clickTab: 'tab-journal',
    title: 'Journal',
    body: 'Free-write anything about this person. Every entry is read by Lumen to build deeper relational context.',
    position: 'top',
  },

  // Numerology
  {
    id: 'tab-numerology',
    page: '/orbit/:systemNode',
    target: 'tab-content',
    clickTab: 'tab-numerology',
    title: 'Numerology',
    body: 'Their core numbers, timing cycles, and how your blueprints interact. Hover the (i) on any number for the calculation.',
    position: 'top',
  },

  // Astrology
  {
    id: 'tab-astrology',
    page: '/orbit/:systemNode',
    target: 'tab-content',
    clickTab: 'tab-astrology',
    title: 'Astrology',
    body: 'Vedic birth chart, planetary positions, and current transits. Understand their emotional world through the sky.',
    position: 'top',
  },

  // Report
  {
    id: 'tab-report',
    page: '/orbit/:systemNode',
    target: 'tab-content',
    clickTab: 'tab-report',
    title: 'AI Report',
    body: 'A full AI-generated psychological profile — compatibility score, dynamic type, tension points, growth edges, forecast.',
    position: 'top',
  },

  // ── BACK TO ORBIT ─────────────────────────────────────────────────────────────
  {
    id: 'back-to-orbit',
    page: '/orbit',
    target: null,
    title: 'Back in Orbit',
    body: 'Every luminary is one tap away. The more you log, the sharper Lumen\'s understanding becomes.',
    position: 'center',
  },

  // ── LUMEN ────────────────────────────────────────────────────────────────────
  {
    id: 'lumen-intro',
    page: '/lumen',
    target: null,
    title: 'Meet Lumen',
    body: 'Your private AI — trained on psychology, attachment theory, NVC, and Jungian frameworks. Not a chatbot. A thinking partner.',
    position: 'center',
  },
  {
    id: 'lumen-modes',
    page: '/lumen',
    target: 'lumen-modes',
    title: 'Five Modes',
    body: 'Choose how Lumen shows up. Each mode changes its entire approach — from silent listening to full-context analysis.',
    position: 'bottom',
    spotlightPadding: 6,
  },
  {
    id: 'lumen-mode-vent',
    page: '/lumen',
    target: 'lumen-modes',
    title: 'Vent',
    body: 'Lumen listens without analysis. No unsolicited insights — just space to be heard. Uses Groq for real-time response.',
    position: 'bottom',
  },
  {
    id: 'lumen-mode-guided',
    page: '/lumen',
    target: 'lumen-modes',
    title: 'Guided',
    body: 'Lumen asks questions designed to deepen your own reflection. Great when you need to think something through.',
    position: 'bottom',
  },
  {
    id: 'lumen-mode-analysis',
    page: '/lumen',
    target: 'lumen-modes',
    title: 'Analysis',
    body: 'Full context-aware breakdown — traits, incidents, numerology, astrology. Uses Gemini for deep reasoning.',
    position: 'bottom',
  },
  {
    id: 'lumen-mode-advice',
    page: '/lumen',
    target: 'lumen-modes',
    title: 'Advice',
    body: 'Actionable guidance framed in NVC — Nonviolent Communication. Practical steps, not just observations.',
    position: 'bottom',
  },
  {
    id: 'lumen-mode-timing',
    page: '/lumen',
    target: 'lumen-modes',
    title: 'Timing',
    body: 'Numerology and astrology aligned suggestions. The right words at the right moment.',
    position: 'bottom',
  },
  {
    id: 'lumen-depth',
    page: '/lumen',
    target: 'lumen-depth',
    title: 'Analysis Depth',
    body: 'Three lenses — Behavioral (logs only), Cosmic (numerology + astrology), Full Spectrum (everything). Controls what context Lumen draws from.',
    position: 'bottom',
    spotlightPadding: 6,
  },
  {
    id: 'lumen-context',
    page: '/lumen',
    target: 'lumen-context-btn',
    title: 'Context',
    body: 'Add a luminary to context before you talk. Lumen gets their full profile — traits, patterns, numbers, interactions.',
    position: 'top',
    spotlightPadding: 6,
  },
  {
    id: 'lumen-input',
    page: '/lumen',
    target: 'lumen-input',
    title: 'Ask Anything',
    body: 'Type or speak. Lumen remembers every conversation and every log — it never starts from zero.',
    position: 'top',
    spotlightPadding: 8,
  },

  // ── PROFILE ───────────────────────────────────────────────────────────────────
  {
    id: 'profile-intro',
    page: '/profile',
    target: null,
    title: 'Your Profile',
    body: 'Manage your account, update your details, and make Lumis feel like yours.',
    position: 'center',
  },
  {
    id: 'profile-theme',
    page: '/profile',
    target: 'profile-theme',
    title: '23 Themes',
    body: 'Choose the aesthetic that matches how you want to feel in this space. Theme changes apply instantly everywhere.',
    position: 'bottom',
    spotlightPadding: 8,
  },

  // ── FINISH ────────────────────────────────────────────────────────────────────
  {
    id: 'finish',
    page: '/profile',
    target: null,
    title: 'You\'re set.',
    body: 'Everything you log, every insight Lumen generates — completely private. No social feed. No public profiles. Just you.',
    position: 'center',
  },
];

export const TOTAL_STEPS = TOUR_STEPS.length;
