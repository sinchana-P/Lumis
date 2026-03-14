'use client';

import { NumerologyProfile } from '@/components/numerology';
import { Header } from '@/components/layout/Header';

// Mock data matching the elegant design
const mockNumerologyData = {
  name: 'Rohan',
  dateOfBirth: '1990-05-15',
  relationshipType: 'Brother',
  coreNumbers: [
    {
      id: '1',
      number: 1,
      title: 'The Pioneer',
      subtitle: 'Life Path',
      description: 'Your soul\'s core direction in this lifetime. Natural leadership abilities and a drive to create new paths.',
      traits: ['Independent', 'Driven', 'Original', 'Ambitious', 'Innovative'],
      type: 'lifePath' as const
    },
    {
      id: '2',
      number: 8,
      title: 'The Executive',
      subtitle: 'Expression',
      description: 'How your soul expresses itself in the world. Strong organizational skills and material success orientation.',
      traits: ['Commanding', 'Strategic', 'Decisive', 'Authoritative', 'Goal-oriented'],
      type: 'expression' as const
    },
    {
      id: '3',
      number: 3,
      title: 'The Creative',
      subtitle: 'Soul Urge',
      description: 'Your heart\'s deepest desires and motivations. Creative expression and communication are central to fulfillment.',
      traits: ['Artistic', 'Communicative', 'Optimistic', 'Social', 'Inspiring'],
      type: 'soulUrge' as const
    },
    {
      id: '4',
      number: 5,
      title: 'The Freedom Seeker',
      subtitle: 'Personality',
      description: 'How others perceive you. Adventurous spirit with a need for variety and personal freedom.',
      traits: ['Adventurous', 'Versatile', 'Curious', 'Dynamic', 'Progressive'],
      type: 'personality' as const
    }
  ],
  timingNumbers: [
    {
      id: '1',
      number: 7,
      title: 'Year of Spiritual Growth',
      period: 'Personal Year Cycle',
      description: 'A time for inner reflection, spiritual development, and gaining deeper wisdom about life\'s mysteries.',
      influence: 'Focus on meditation, study, and connecting with your inner wisdom. Avoid major material decisions.',
      year: 2024
    },
    {
      id: '2',
      number: 8,
      title: 'Year of Material Achievement',
      period: 'Personal Year Cycle',
      description: 'A powerful year for career advancement, financial growth, and achieving tangible results from past efforts.',
      influence: 'Take bold action on business ventures. Your leadership abilities are at their peak.',
      year: 2025
    },
    {
      id: '3',
      number: 9,
      title: 'Year of Completion',
      period: 'Personal Year Cycle',
      description: 'A time of endings and new beginnings. Release what no longer serves to make space for the next cycle.',
      influence: 'Practice forgiveness, complete unfinished projects, and prepare for a fresh start.',
      year: 2026
    },
    {
      id: '4',
      number: 1,
      title: 'Year of New Beginnings',
      period: 'Personal Year Cycle',
      description: 'The start of a new 9-year cycle. Plant seeds for future growth and embrace fresh opportunities.',
      influence: 'Be bold in starting new ventures. Your pioneering energy is strongest now.',
      year: 2027
    }
  ],
  compatibility: {
    overallScore: 77,
    lifePath: {
      score: 85,
      description: 'Your life paths complement each other beautifully. Both driven toward success but through different approaches, creating mutual respect and support.'
    },
    expression: {
      score: 72,
      description: 'Your ways of expressing in the world create interesting dynamics. The executive energy balances well with creative communication styles.'
    },
    soulUrge: {
      score: 74,
      description: 'Deep soul desires align in the pursuit of meaningful achievement. Both value authenticity and personal growth, though expressed differently.'
    }
  }
};

export default function NumerologyPage() {
  return (
    <div className="min-h-screen bg-primary">
      <Header />
      <main className="w-full px-6 lg:px-12 pt-20 pb-8">
        <NumerologyProfile data={mockNumerologyData} />
      </main>
    </div>
  );
}