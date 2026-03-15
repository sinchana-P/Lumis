'use client';

import { useState } from 'react';
import { DottedDivider } from '@/components/ui/DottedDivider';

interface Member {
  id: string;
  fullName: string;
  [key: string]: any;
}

interface MemberInteractionsTabProps {
  member: Member;
}

interface Interaction {
  id: string;
  date: string;
  type: 'call' | 'text' | 'in-person' | 'video' | 'email' | 'social';
  duration?: string;
  quality: 'excellent' | 'good' | 'neutral' | 'poor' | 'difficult';
  mood: {
    before: string[];
    after: string[];
  };
  summary: string;
  topics: string[];
  energy: number; // 1-10 scale
  createdAt: string;
}

// Mock data
const mockInteractions: Interaction[] = [
  {
    id: '1',
    date: '2024-03-12',
    type: 'in-person',
    duration: '2 hours',
    quality: 'excellent',
    mood: {
      before: ['tired', 'stressed'],
      after: ['energized', 'happy', 'connected']
    },
    summary: 'Had coffee and caught up on life. They listened to my work stress and shared some helpful perspective.',
    topics: ['work', 'family', 'weekend plans'],
    energy: 8,
    createdAt: '2024-03-12T16:30:00Z'
  },
  {
    id: '2',
    date: '2024-03-10',
    type: 'text',
    quality: 'good',
    mood: {
      before: ['neutral'],
      after: ['amused', 'connected']
    },
    summary: 'Funny text exchange about a meme they sent. Made me laugh during a boring meeting.',
    topics: ['humor', 'daily life'],
    energy: 6,
    createdAt: '2024-03-10T14:15:00Z'
  },
  {
    id: '3',
    date: '2024-03-08',
    type: 'call',
    duration: '45 minutes',
    quality: 'neutral',
    mood: {
      before: ['anxious'],
      after: ['frustrated', 'misunderstood']
    },
    summary: 'Tried to discuss the weekend plans but we kept talking past each other. Felt like we weren\'t on the same page.',
    topics: ['planning', 'miscommunication'],
    energy: 4,
    createdAt: '2024-03-08T19:00:00Z'
  }
];

export function MemberInteractionsTab({ member }: MemberInteractionsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'in-person' as Interaction['type'],
    duration: '',
    quality: 'good' as Interaction['quality'],
    moodBefore: [] as string[],
    moodAfter: [] as string[],
    summary: '',
    topics: [] as string[],
    energy: 5
  });

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-success-bg text-success border-success-border';
      case 'good': return 'bg-info-bg text-info border-info-border';
      case 'neutral': return 'bg-surface text-tertiary border-primary';
      case 'poor': return 'bg-warning-bg text-warning border-warning-border';
      case 'difficult': return 'bg-error-bg text-error border-error-border';
      default: return 'bg-surface text-tertiary border-primary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      );
      case 'text': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      );
      case 'in-person': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      );
      case 'video': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
      case 'email': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      );
      case 'social': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
        </svg>
      );
      default: return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 8) return 'text-success';
    if (energy >= 6) return 'text-accent-primary';
    if (energy >= 4) return 'text-warning';
    return 'text-error';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding new interaction:', newInteraction);
    setNewInteraction({
      date: new Date().toISOString().split('T')[0],
      type: 'in-person',
      duration: '',
      quality: 'good',
      moodBefore: [],
      moodAfter: [],
      summary: '',
      topics: [],
      energy: 5
    });
    setShowAddForm(false);
  };

  return (
    <div className="w-full">
      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-elevated rounded-2xl shadow-theme-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border border-tertiary">
            <div className="text-center mb-8">
              <h3 className="font-serif text-xl text-primary mb-2">
                Log New Interaction
              </h3>
              <div className="w-16 h-px bg-accent-gold mx-auto"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-tertiary block mb-3">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newInteraction.date}
                    onChange={(e) => setNewInteraction({ ...newInteraction, date: e.target.value })}
                    className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif focus:border-accent-primary focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-tertiary block mb-3">
                    Type
                  </label>
                  <select
                    value={newInteraction.type}
                    onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as Interaction['type'] })}
                    className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif focus:border-accent-primary focus:outline-none transition-colors"
                  >
                    <option value="in-person">In Person</option>
                    <option value="call">Phone Call</option>
                    <option value="text">Text Message</option>
                    <option value="video">Video Call</option>
                    <option value="email">Email</option>
                    <option value="social">Social Media</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-tertiary block mb-3">
                  Summary
                </label>
                <textarea
                  value={newInteraction.summary}
                  onChange={(e) => setNewInteraction({ ...newInteraction, summary: e.target.value })}
                  placeholder="What happened during this interaction? How did it go? What was discussed?"
                  className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif resize-none leading-relaxed focus:border-accent-primary focus:outline-none transition-colors"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-tertiary block mb-3">
                    Quality
                  </label>
                  <select
                    value={newInteraction.quality}
                    onChange={(e) => setNewInteraction({ ...newInteraction, quality: e.target.value as Interaction['quality'] })}
                    className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif focus:border-accent-primary focus:outline-none transition-colors"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="neutral">Neutral</option>
                    <option value="poor">Poor</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-tertiary block mb-3">
                    Energy Level (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newInteraction.energy}
                    onChange={(e) => setNewInteraction({ ...newInteraction, energy: parseInt(e.target.value) })}
                    className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif focus:border-accent-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-accent-primary text-inverse rounded-lg font-serif font-medium hover:bg-accent-primary transition-colors"
                >
                  Log Interaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-6 py-4 bg-surface text-primary rounded-lg font-serif font-medium hover:bg-surface-hover transition-colors border border-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline - Clean Minimal Layout */}
      <div className="w-full">
        {mockInteractions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--surface)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-serif text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
              No interactions logged yet
            </h3>
            <p className="font-serif text-sm mb-8 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Start tracking your communications with {member.fullName} and how they affect your mood and energy.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 rounded-lg font-mono text-xs uppercase tracking-widest transition-all duration-300"
              style={{ 
                border: '1px solid var(--border-tertiary)',
                color: 'var(--text-primary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Log First Interaction
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {mockInteractions.map((interaction, index) => (
              <div key={interaction.id}>
                <div className="flex items-start gap-6">
                  {/* Simple Timeline Marker */}
                  <div className="flex-shrink-0 w-3 h-3 rounded-full mt-2" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-serif text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1).replace('-', ' ')} 
                          {interaction.duration && ` • ${interaction.duration}`}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-mono uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                            {new Date(interaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="font-mono uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                            {interaction.quality}
                          </span>
                          <span className="font-mono" style={{ color: 'var(--text-tertiary)' }}>
                            {interaction.energy}/10
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="mb-4">
                      <p className="font-serif leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {interaction.summary}
                      </p>
                    </div>
                    
                    {/* Mood Before/After */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {interaction.mood.before.length > 0 && (
                        <div className="pl-4">
                          <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--accent-secondary)' }}>
                            Mood Before
                          </div>
                          <p className="font-serif text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {interaction.mood.before.join(', ')}
                          </p>
                        </div>
                      )}
                      
                      {interaction.mood.after.length > 0 && (
                        <div className="pl-4">
                          <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--accent-ai)' }}>
                            Mood After
                          </div>
                          <p className="font-serif text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {interaction.mood.after.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Topics */}
                    {interaction.topics.length > 0 && (
                      <div className="text-sm">
                        <span className="font-mono uppercase tracking-widest mr-3" style={{ color: 'var(--text-tertiary)' }}>
                          Topics:
                        </span>
                        <span className="font-serif" style={{ color: 'var(--text-secondary)' }}>
                          {interaction.topics.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Subtle Divider */}
                {index < mockInteractions.length - 1 && (
                  <DottedDivider style={{ marginTop: 32 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Section */}
      {mockInteractions.length > 0 && (
        <>
          <div className="w-full h-px mt-12 mb-8" style={{ 
            backgroundImage: 'repeating-linear-gradient(to right, var(--accent-gold) 0px, var(--accent-gold) 6px, transparent 6px, transparent 12px)',
            opacity: '0.6'
          }}></div>
          
          <div className="w-full">
            <h3 className="font-serif text-lg mb-6" style={{ color: 'var(--text-primary)' }}>
              Interaction Summary
            </h3>
            
            <div className="grid grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-2xl font-serif font-light mb-1" style={{ color: 'var(--text-primary)' }}>
                  {(mockInteractions.reduce((sum, i) => sum + i.energy, 0) / mockInteractions.length).toFixed(1)}
                </div>
                <div className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Avg Energy
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-serif font-light mb-1" style={{ color: 'var(--text-primary)' }}>
                  {mockInteractions.filter(i => ['excellent', 'good'].includes(i.quality)).length}
                </div>
                <div className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Positive
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-serif font-light mb-1" style={{ color: 'var(--text-primary)' }}>
                  {mockInteractions.filter(i => i.type === 'in-person').length}
                </div>
                <div className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  In Person
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-serif font-light mb-1" style={{ color: 'var(--text-primary)' }}>
                  {mockInteractions.length}
                </div>
                <div className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Total
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}