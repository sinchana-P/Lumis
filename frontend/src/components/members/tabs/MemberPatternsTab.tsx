'use client';

import { useState } from 'react';

interface Member {
  id: string;
  fullName: string;
  [key: string]: any;
}

interface MemberPatternsTabProps {
  member: Member;
}

interface Pattern {
  id: string;
  title: string;
  description: string;
  category: 'communication' | 'conflict' | 'affection' | 'decision-making' | 'stress-response' | 'social';
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  triggers: string[];
  examples: string[];
  impact: 'positive' | 'neutral' | 'negative';
  identifiedAt: string;
}

// Mock data
const mockPatterns: Pattern[] = [
  {
    id: '1',
    title: 'Shuts down during conflict',
    description: 'When we disagree, they tend to go quiet and withdraw instead of talking through the issue.',
    category: 'conflict',
    frequency: 'frequent',
    triggers: ['disagreement', 'raised voices', 'criticism'],
    examples: [
      'Last week when I brought up the dishes, they just walked away',
      'During the budget discussion, they stopped responding to my questions'
    ],
    impact: 'negative',
    identifiedAt: '2024-03-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Remembers small details',
    description: 'They consistently notice and remember little things I mention in passing.',
    category: 'affection',
    frequency: 'frequent',
    triggers: ['casual conversation', 'mentions of preferences'],
    examples: [
      'Brought me my favorite coffee without me asking',
      'Remembered I had an important meeting and checked about it'
    ],
    impact: 'positive',
    identifiedAt: '2024-02-15T14:30:00Z'
  },
  {
    id: '3',
    title: 'Needs time to process decisions',
    description: 'Takes longer to make choices, especially important ones, and gets stressed when rushed.',
    category: 'decision-making',
    frequency: 'occasional',
    triggers: ['time pressure', 'multiple options', 'important decisions'],
    examples: [
      'Took three days to decide on vacation plans',
      'Gets overwhelmed when choosing restaurants on the spot'
    ],
    impact: 'neutral',
    identifiedAt: '2024-01-20T16:45:00Z'
  }
];

export function MemberPatternsTab({ member }: MemberPatternsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPattern, setNewPattern] = useState({
    title: '',
    description: '',
    category: 'communication' as Pattern['category'],
    frequency: 'occasional' as Pattern['frequency'],
    triggers: [] as string[],
    examples: [] as string[],
    impact: 'neutral' as Pattern['impact']
  });

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'constant': return 'bg-error-bg text-error border-error-border';
      case 'frequent': return 'bg-warning-bg text-warning border-warning-border';
      case 'occasional': return 'bg-info-bg text-info border-info-border';
      case 'rare': return 'bg-success-bg text-success border-success-border';
      default: return 'bg-surface text-tertiary border-primary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      );
      case 'conflict': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
      case 'affection': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      );
      case 'decision-making': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      );
      case 'stress-response': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
      case 'social': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      );
      default: return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'communication': return 'bg-accent-primary-light text-accent-primary border-accent-primary';
      case 'conflict': return 'bg-error-bg text-error border-error-border';
      case 'affection': return 'bg-success-bg text-success border-success-border';
      case 'decision-making': return 'bg-accent-ai-light text-accent-ai border-accent-ai';
      case 'stress-response': return 'bg-warning-bg text-warning border-warning-border';
      case 'social': return 'bg-accent-secondary-light text-accent-secondary border-accent-secondary';
      default: return 'bg-surface text-tertiary border-primary';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'bg-success-bg text-success border-success-border';
      case 'negative': return 'bg-error-bg text-error border-error-border';
      case 'neutral': return 'bg-info-bg text-info border-info-border';
      default: return 'bg-surface text-tertiary border-primary';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding new pattern:', newPattern);
    setNewPattern({
      title: '',
      description: '',
      category: 'communication',
      frequency: 'occasional',
      triggers: [],
      examples: [],
      impact: 'neutral'
    });
    setShowAddForm(false);
  };

  return (
    <div className="w-full">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-lg text-primary mb-1">
            Patterns with {member.fullName}
          </h2>
          <p className="font-serif text-xs text-secondary">
            Recurring behaviors, communication styles, and relationship dynamics
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 border border-tertiary rounded-full font-mono text-xs uppercase tracking-widest text-primary hover:bg-surface transition-all duration-300"
        >
          + Add Pattern
        </button>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-accent-gold mx-auto mb-4"></div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-elevated rounded-2xl shadow-theme-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border border-tertiary">
            <div className="text-center mb-8">
              <h3 className="font-serif text-xl text-primary mb-2">
                Identify a New Pattern
              </h3>
              <div className="w-16 h-px bg-accent-gold mx-auto"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-tertiary block mb-3">
                  Pattern Title
                </label>
                <input
                  type="text"
                  value={newPattern.title}
                  onChange={(e) => setNewPattern({ ...newPattern, title: e.target.value })}
                  placeholder="Brief description of the pattern..."
                  className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif text-base focus:border-accent-primary focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest text-tertiary block mb-3">
                    Category
                  </label>
                  <select
                    value={newPattern.category}
                    onChange={(e) => setNewPattern({ ...newPattern, category: e.target.value as Pattern['category'] })}
                    className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif focus:border-accent-primary focus:outline-none transition-colors"
                  >
                    <option value="communication">Communication</option>
                    <option value="conflict">Conflict</option>
                    <option value="affection">Affection</option>
                    <option value="decision-making">Decision Making</option>
                    <option value="stress-response">Stress Response</option>
                    <option value="social">Social</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest text-tertiary block mb-3">
                    Frequency
                  </label>
                  <select
                    value={newPattern.frequency}
                    onChange={(e) => setNewPattern({ ...newPattern, frequency: e.target.value as Pattern['frequency'] })}
                    className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif focus:border-accent-primary focus:outline-none transition-colors"
                  >
                    <option value="rare">Rare</option>
                    <option value="occasional">Occasional</option>
                    <option value="frequent">Frequent</option>
                    <option value="constant">Constant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-tertiary block mb-3">
                  Pattern Description
                </label>
                <textarea
                  value={newPattern.description}
                  onChange={(e) => setNewPattern({ ...newPattern, description: e.target.value })}
                  placeholder="Describe the pattern in detail. What happens? When does it occur? How does it manifest?"
                  className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif resize-none leading-relaxed focus:border-accent-primary focus:outline-none transition-colors"
                  rows={5}
                  required
                />
              </div>

              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-tertiary block mb-3">
                  Impact Assessment
                </label>
                <select
                  value={newPattern.impact}
                  onChange={(e) => setNewPattern({ ...newPattern, impact: e.target.value as Pattern['impact'] })}
                  className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif focus:border-accent-primary focus:outline-none transition-colors"
                >
                  <option value="positive">Positive — Strengthens relationship</option>
                  <option value="neutral">Neutral — Neither helpful nor harmful</option>
                  <option value="negative">Negative — Creates challenges</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-accent-primary text-inverse rounded-lg font-serif font-medium hover:bg-accent-primary transition-colors"
                >
                  Identify Pattern
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

      {/* Timeline - Compact Layout */}
      <div className="w-full">
        {mockPatterns.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 min-h-[3rem] mx-auto mb-3 flex items-center justify-center bg-surface rounded-full p-3">
              <svg className="w-6 h-6 text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-serif text-base text-primary mb-2">
              No patterns identified yet
            </h3>
            <p className="font-serif text-xs text-secondary mb-4 max-w-md mx-auto">
              Start identifying recurring behaviors and dynamics in your relationship with {member.fullName}.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 border border-tertiary rounded-full font-mono text-xs uppercase tracking-widest text-primary hover:bg-surface transition-all duration-300"
            >
              Identify First Pattern
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {mockPatterns.map((pattern, index) => (
              <div key={pattern.id}>
                <div className="flex items-start gap-4">
                  {/* Compact Timeline Marker */}
                  <div className="flex-shrink-0 w-10 min-h-[2.5rem] bg-accent-primary-light border-accent-primary rounded-full flex items-center justify-center border p-2">
                    <div className="text-accent-primary">{getCategoryIcon(pattern.category)}</div>
                  </div>
                  
                  {/* Content - Full Width */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row - Compact */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif text-base text-primary font-medium">
                        {pattern.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${getCategoryColor(pattern.category)}`}>
                          {pattern.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${getFrequencyColor(pattern.frequency)}`}>
                          {pattern.frequency}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${getImpactColor(pattern.impact)}`}>
                          {pattern.impact}
                        </span>
                      </div>
                    </div>
                    
                    {/* Description - Compact */}
                    <div className="bg-surface rounded-lg p-3 mb-2">
                      <p className="font-serif text-sm text-primary leading-relaxed">
                        {pattern.description}
                      </p>
                    </div>
                    
                    {/* Triggers */}
                    {pattern.triggers.length > 0 && (
                      <div className="bg-surface rounded-lg p-3 mb-2 border-l-2 border-accent-secondary">
                        <div className="font-mono text-[8px] uppercase tracking-widest text-accent-secondary mb-1">
                          Common Triggers
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {pattern.triggers.map((trigger, idx) => (
                            <span key={idx} className="px-2 py-1 bg-accent-secondary-light text-accent-secondary rounded-full text-xs font-serif border border-accent-secondary">
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Examples */}
                    {pattern.examples.length > 0 && (
                      <div className="bg-surface rounded-lg p-3 mb-2 border-l-2 border-accent-gold">
                        <div className="font-mono text-[8px] uppercase tracking-widest text-accent-gold mb-1">
                          Examples
                        </div>
                        <ul className="space-y-1">
                          {pattern.examples.map((example, idx) => (
                            <li key={idx} className="font-serif text-sm text-primary leading-relaxed">
                              • {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Divider between patterns */}
                {index < mockPatterns.length - 1 && (
                  <div className="w-full h-px bg-tertiary mt-4"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider before summary */}
      {mockPatterns.length > 0 && (
        <div className="w-full h-px bg-accent-gold mt-6 mb-4"></div>
      )}

      {/* Compact Summary Insights */}
      {mockPatterns.length > 0 && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-base text-primary">Pattern Analysis</h3>
            <div className="flex-1 h-px bg-accent-gold ml-4"></div>
          </div>
          
          <div className="grid grid-cols-6 gap-4">
            {['communication', 'conflict', 'affection', 'decision-making', 'stress-response', 'social'].map((category) => {
              const count = mockPatterns.filter(p => p.category === category).length;
              return (
                <div key={category} className="text-center">
                  <div className="w-8 min-h-[2rem] mx-auto bg-surface rounded-full flex items-center justify-center mb-1 p-1">
                    <div className="text-accent-primary">{getCategoryIcon(category)}</div>
                  </div>
                  <div className="font-serif text-lg font-medium text-primary">{count}</div>
                  <div className="font-mono text-xs uppercase tracking-wider text-secondary">
                    {category.replace('-', ' ')}{count !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}