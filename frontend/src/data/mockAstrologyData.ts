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