// Mock Astrology Data for Vedic Chart

export interface PlanetPosition {
  planet: string;
  house: number;
  sign: string;
  degree: number;
  minutes: number;
  nakshatra: string;
  pada: number;
  symbol: string;
  color: string;
}

export interface VedicChart {
  houses: { [key: number]: PlanetPosition[] };
  ascendant: {
    sign: string;
    degree: number;
    house: 1;
  };
}

export interface AstrologyData {
  memberId: string;
  birthData: {
    date: string;
    time: string;
    place: string;
    timezone: string;
  };
  vedicChart: VedicChart;
  planetaryPositions: PlanetPosition[];
  currentTransits: Transit[];
  insights: string[];
}

export interface Transit {
  planet: string;
  aspect: string;
  description: string;
  color: string;
  symbol: string;
}

// Mock planetary positions
const mockPlanetaryPositions: PlanetPosition[] = [
  {
    planet: 'Surya (Sun)',
    house: 2,
    sign: 'Simha (Leo)',
    degree: 20,
    minutes: 30,
    nakshatra: 'Magha',
    pada: 4,
    symbol: '☉',
    color: '#D4B896'
  },
  {
    planet: 'Chandra (Moon)',
    house: 4,
    sign: 'Vrishaba (Taurus)',
    degree: 15,
    minutes: 42,
    nakshatra: 'Rohini',
    pada: 2,
    symbol: '☽',
    color: '#C9A58F'
  },
  {
    planet: 'Mangal (Mars)',
    house: 7,
    sign: 'Kumbh (Aquarius)',
    degree: 8,
    minutes: 15,
    nakshatra: 'Dhanishta',
    pada: 3,
    symbol: '♂',
    color: '#C89090'
  },
  {
    planet: 'Budh (Mercury)',
    house: 2,
    sign: 'Simha (Leo)',
    degree: 12,
    minutes: 28,
    nakshatra: 'Purva Phalguni',
    pada: 1,
    symbol: '☿',
    color: '#B5A8C1'
  },
  {
    planet: 'Guru (Jupiter)',
    house: 10,
    sign: 'Vrishchika (Scorpio)',
    degree: 18,
    minutes: 45,
    nakshatra: 'Jyeshta',
    pada: 2,
    symbol: '♃',
    color: '#8FA888'
  },
  {
    planet: 'Shukra (Venus)',
    house: 5,
    sign: 'Tula (Libra)',
    degree: 24,
    minutes: 18,
    nakshatra: 'Swati',
    pada: 4,
    symbol: '♀',
    color: '#C9A58F'
  },
  {
    planet: 'Shani (Saturn)',
    house: 11,
    sign: 'Makara (Capricorn)',
    degree: 6,
    minutes: 52,
    nakshatra: 'Uttara Ashadha',
    pada: 1,
    symbol: '♄',
    color: '#9B9590'
  },
  {
    planet: 'Rahu',
    house: 3,
    sign: 'Mithuna (Gemini)',
    degree: 22,
    minutes: 14,
    nakshatra: 'Punarvasu',
    pada: 3,
    symbol: '☊',
    color: '#D4A574'
  },
  {
    planet: 'Ketu',
    house: 9,
    sign: 'Dhanu (Sagittarius)',
    degree: 22,
    minutes: 14,
    nakshatra: 'Purva Ashadha',
    pada: 3,
    symbol: '☋',
    color: '#94A8B8'
  }
];

// Mock current transits
const mockCurrentTransits: Transit[] = [
  {
    planet: 'Saturn',
    aspect: 'Saturn Return',
    description: 'Structural shifts in career and foundations. A period of karmic consolidation.',
    color: '#9CAF9E',
    symbol: '♄'
  },
  {
    planet: 'Jupiter',
    aspect: 'Jupiter Trine Mars',
    description: 'Creative expansion and bold movement. Luck aligns with action.',
    color: '#8FA888',
    symbol: '♃'
  },
  {
    planet: 'Mercury',
    aspect: 'Mercury Shadow',
    description: 'Internal processing. Fine-tune your communication before the retrograde.',
    color: '#D4A574',
    symbol: '☿'
  }
];

// Create Vedic chart structure
const createVedicChart = (positions: PlanetPosition[]): VedicChart => {
  const houses: { [key: number]: PlanetPosition[] } = {};
  
  // Initialize all houses
  for (let i = 1; i <= 12; i++) {
    houses[i] = [];
  }
  
  // Place planets in houses
  positions.forEach(planet => {
    houses[planet.house].push(planet);
  });
  
  return {
    houses,
    ascendant: {
      sign: 'Simha (Leo)',
      degree: 25,
      house: 1
    }
  };
};

// Mock astrology data for different members
const mockAstrologyDatabase: { [memberId: string]: AstrologyData } = {
  'default': {
    memberId: 'default',
    birthData: {
      date: '12 Aug 1994',
      time: '23:42:00',
      place: 'London, UK',
      timezone: 'GMT+1'
    },
    vedicChart: createVedicChart(mockPlanetaryPositions),
    planetaryPositions: mockPlanetaryPositions,
    currentTransits: mockCurrentTransits,
    insights: [
      "Your chart reveals a profound tension between the grounding stability of your Taurus Moon and the intense, transformative nature of your Leo Sun.",
      "Currently, the transit of Saturn over your natal career sector suggests a period of significant professional restructuring.",
      "The simultaneous Mars in Aquarius in your partnership sector suggests that while you drive forward, be mindful of emotional sensitivities in relationships."
    ]
  }
};

// Helper functions
export const getAstrologyDataForMember = (memberId: string): AstrologyData => {
  return mockAstrologyDatabase[memberId] || mockAstrologyDatabase['default'];
};

// ─── Emotional Astrology Data (Member Astrology Tab) ─────────────────────────

export type AvailabilityLevel = 1 | 2 | 3;
export type TipIcon = 'circle' | 'half-moon' | 'diamond';

export interface EmotionalAstrologyData {
  memberId: string;
  moonSign: {
    name: string;
    element: string;
    tagline: string;
  };
  moonNakshatra: {
    name: string;
    deity: string;
  };
  essenceQuote: string;
  emotionalNature: {
    summary: string;
    whatMakesThemSafe: string;
    whatTriggersWithdrawal: string;
    emotionalGift: string;
  };
  whenThingsGoWrong: {
    description: string;
    howToRespond: string;
  };
  emotionalAvailability: {
    level: AvailabilityLevel;
    label: string;
    description: string;
    forYourInteractions: string;
  };
  relationshipDynamic: {
    whatLandsWell: string;
    whereFrictionLives: string;
    theAdjustment: string;
  };
  howToMeetThemWell: {
    tips: Array<{ icon: TipIcon; title: string; description: string }>;
    bestMoment: string;
    avoidWhen: string;
  };
}

const mockEmotionalDatabase: { [memberId: string]: EmotionalAstrologyData } = {
  default: {
    memberId: 'default',
    moonSign: {
      name: 'Gemini',
      element: 'Air',
      tagline: 'Thought before feeling',
    },
    moonNakshatra: {
      name: 'Ardra',
      deity: 'Rudra — the Storm',
    },
    essenceQuote: 'Feels in storms. Thinks to survive.',
    emotionalNature: {
      summary:
        'Their emotional world moves fast and intensely. They process by talking, questioning, circling — not by sitting still. When something is wrong they don\'t go quiet. They become more verbal, more restless, more analytical. This can read as fine when they are not fine at all.',
      whatMakesThemSafe:
        'They feel safe when there is room to think out loud without being judged for it. They need a conversational partner, not a fixer.',
      whatTriggersWithdrawal:
        'They withdraw — or overshare — when they feel unheard. If a conversation goes flat they interpret it as rejection before they interpret it as tiredness.',
      emotionalGift:
        'They recover faster than most. The same intensity that creates storms also creates clearings. Once they\'ve processed, they\'re genuinely done — not storing it.',
    },
    whenThingsGoWrong: {
      description:
        'They go precise and cold. Not loud — surgical. When Ardra Moon people feel cornered or unheard, their language becomes clipped, overly logical, and slightly distancing. It looks like they\'re being rational. They\'re actually frightened.',
      howToRespond:
        'The coldness is not contempt. It is self-protection. If they\'ve shifted into this mode with you, it means something mattered enough to hurt them — which is different from not caring.',
    },
    emotionalAvailability: {
      level: 2,
      label: 'Reaching Outward',
      description:
        'They are in a life chapter that is oriented outward — toward new experiences, new connections, and things they can\'t yet name. This gives them more capacity for meaningful conversations than usual, but less patience for things that feel routine or obligatory.',
      forYourInteractions:
        'Conversations with a sense of purpose or genuine curiosity land well right now. Anything that feels like maintenance or obligation will get less of them than you\'d expect.',
    },
    relationshipDynamic: {
      whatLandsWell:
        'Your instinct to hold space and listen without immediately responding — this is exactly what works with them. They feel that quality in people and relax into it.',
      whereFrictionLives:
        'Your tendency to absorb tension quietly rather than naming it can leave them in the dark about how an interaction has landed for you. They read silence as neutrality or disapproval. A small signal from you goes a long way.',
      theAdjustment:
        'With them specifically — say more than you think you need to. Not more words. More honesty about where you are.',
    },
    howToMeetThemWell: {
      tips: [
        {
          icon: 'circle',
          title: 'Give room to think aloud',
          description:
            'Don\'t interrupt to solve. Let them arrive at their own conclusion — they almost always do, and faster than you expect.',
        },
        {
          icon: 'half-moon',
          title: 'Name what you notice',
          description:
            'They respond well to being seen. \'You seem like you\'re carrying something\' lands better than waiting for them to bring it up.',
        },
        {
          icon: 'diamond',
          title: 'Match the rhythm, then slow it',
          description:
            'They move fast emotionally. Meet them at their pace first — then gently slow the register together. Don\'t start slow.',
        },
      ],
      bestMoment:
        'When there\'s a shared task or context. They open up in motion, not in stillness — side-by-side works better than face-to-face.',
      avoidWhen:
        'When they\'re already mid-spiral. Adding input while they\'re processing amplifies it, doesn\'t help. Wait for a natural pause.',
    },
  },
};

export const getEmotionalAstrologyDataForMember = (memberId: string): EmotionalAstrologyData => {
  return mockEmotionalDatabase[memberId] || mockEmotionalDatabase['default'];
};

export const getSignColor = (sign: string): string => {
  const signColors: { [key: string]: string } = {
    'Simha': '#D4B896', // Leo - Gold
    'Vrishaba': '#8FA888', // Taurus - Green
    'Kumbh': '#94A8B8', // Aquarius - Blue
    'Tula': '#C9A58F', // Libra - Pink
    'Vrishchika': '#9B9590', // Scorpio - Dark
    'Makara': '#9B9590', // Capricorn - Earth
    'Mithuna': '#D4A574', // Gemini - Yellow
    'Dhanu': '#94A8B8' // Sagittarius - Purple
  };
  
  const cleanSign = sign.split('(')[0].trim();
  return signColors[cleanSign] || '#9B9590';
};

export const getAspectColor = (aspect: string): string => {
  if (aspect.includes('Trine') || aspect.includes('Sextile')) return '#8FA888'; // Positive - Green
  if (aspect.includes('Square') || aspect.includes('Opposition')) return '#C89090'; // Challenging - Red
  if (aspect.includes('Conjunction')) return '#B5A8C1'; // Neutral - Purple
  return '#9B9590'; // Default - Gray
};

export const getPlanetSymbol = (planet: string): string => {
  const symbols: { [key: string]: string } = {
    'Surya': '☉',
    'Chandra': '☽',
    'Mangal': '♂',
    'Budh': '☿',
    'Guru': '♃',
    'Shukra': '♀',
    'Shani': '♄',
    'Rahu': '☊',
    'Ketu': '☋'
  };
  
  const planetName = planet.split('(')[0].trim();
  return symbols[planetName] || '●';
};

export const formatDegree = (degree: number, minutes: number): string => {
  return `${degree}° ${minutes}'`;
};

export const getHouseSignificance = (houseNumber: number): string => {
  const significances: { [key: number]: string } = {
    1: 'Self, Personality, Physical Body',
    2: 'Wealth, Family, Speech',
    3: 'Siblings, Courage, Communication',
    4: 'Home, Mother, Emotions',
    5: 'Children, Creativity, Intelligence',
    6: 'Health, Enemies, Service',
    7: 'Partnership, Marriage, Business',
    8: 'Transformation, Occult, Longevity',
    9: 'Dharma, Higher Learning, Fortune',
    10: 'Career, Status, Father',
    11: 'Gains, Friends, Aspirations',
    12: 'Loss, Spirituality, Foreign Lands'
  };
  
  return significances[houseNumber] || '';
};