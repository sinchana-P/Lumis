'use client';

import { useState } from 'react';

interface Member {
  id: string;
  fullName: string;
  [key: string]: any;
}

interface MemberIncidentsTabProps {
  member: Member;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
  category: 'conflict' | 'breakthrough' | 'milestone' | 'challenge' | 'celebration';
  emotions: string[];
  outcome?: string;
  createdAt: string;
}

// Mock data
const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Had our first real argument',
    description: 'Disagreed about weekend plans. I felt unheard when they made decisions without asking me first.',
    date: '2024-03-10',
    severity: 'medium',
    category: 'conflict',
    emotions: ['frustrated', 'hurt'],
    outcome: 'We talked it through and agreed to check with each other before making plans',
    createdAt: '2024-03-10T18:30:00Z'
  },
  {
    id: '2',
    title: 'They surprised me for my birthday',
    description: 'Organized a small gathering with my closest friends. They remembered I mentioned wanting a quiet celebration.',
    date: '2024-03-05',
    severity: 'low',
    category: 'celebration',
    emotions: ['joyful', 'loved', 'grateful'],
    outcome: 'Felt deeply appreciated and understood',
    createdAt: '2024-03-05T20:15:00Z'
  },
  {
    id: '3',
    title: 'Supported me during work crisis',
    description: 'When I was stressed about the project deadline, they brought me dinner and just listened without trying to fix everything.',
    date: '2024-02-28',
    severity: 'low',
    category: 'milestone',
    emotions: ['safe', 'supported'],
    outcome: 'Realized how much I can rely on them during tough times',
    createdAt: '2024-02-28T22:00:00Z'
  }
];

export function MemberIncidentsTab({ member }: MemberIncidentsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    severity: 'medium' as 'low' | 'medium' | 'high',
    category: 'milestone' as Incident['category'],
    emotions: [] as string[],
    outcome: ''
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-error-bg text-error border-error-border';
      case 'medium': return 'bg-warning-bg text-warning border-warning-border';
      case 'low': return 'bg-success-bg text-success border-success-border';
      default: return 'bg-surface text-tertiary border-primary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'conflict': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
      case 'breakthrough': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
      case 'milestone': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414L9 7.586 7.707 6.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
      );
      case 'challenge': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      );
      case 'celebration': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
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
      case 'conflict': return 'bg-error-bg text-error border-error-border';
      case 'breakthrough': return 'bg-info-bg text-info border-info-border';
      case 'milestone': return 'bg-accent-ai-light text-accent-ai border-accent-ai';
      case 'challenge': return 'bg-warning-bg text-warning border-warning-border';
      case 'celebration': return 'bg-success-bg text-success border-success-border';
      default: return 'bg-surface text-tertiary border-primary';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding new incident:', newIncident);
    setNewIncident({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      severity: 'medium',
      category: 'milestone',
      emotions: [],
      outcome: ''
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
                Chronicle a New Moment
              </h3>
              <div className="w-16 h-px bg-accent-gold mx-auto"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-tertiary block mb-3">
                  What Happened
                </label>
                <input
                  type="text"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  placeholder="A brief, honest description..."
                  className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif text-base focus:border-accent-primary focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-tertiary block mb-3">
                    When
                  </label>
                  <input
                    type="date"
                    value={newIncident.date}
                    onChange={(e) => setNewIncident({ ...newIncident, date: e.target.value })}
                    className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif focus:border-accent-primary focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-tertiary block mb-3">
                    Nature
                  </label>
                  <select
                    value={newIncident.category}
                    onChange={(e) => setNewIncident({ ...newIncident, category: e.target.value as Incident['category'] })}
                    className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif focus:border-accent-primary focus:outline-none transition-colors"
                  >
                    <option value="milestone">Milestone</option>
                    <option value="celebration">Celebration</option>
                    <option value="breakthrough">Breakthrough</option>
                    <option value="challenge">Challenge</option>
                    <option value="conflict">Conflict</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-tertiary block mb-3">
                  The Full Story
                </label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="What happened? How did it make you feel? What was the context? Be honest with yourself..."
                  className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif resize-none leading-relaxed focus:border-accent-primary focus:outline-none transition-colors"
                  rows={5}
                  required
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-tertiary block mb-3">
                  Emotional Weight
                </label>
                <select
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif focus:border-accent-primary focus:outline-none transition-colors"
                >
                  <option value="low">Light — Minor ripple</option>
                  <option value="medium">Moderate — Noticeable shift</option>
                  <option value="high">Deep — Significant impact</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-tertiary block mb-3">
                  Resolution & Reflection
                </label>
                <textarea
                  value={newIncident.outcome}
                  onChange={(e) => setNewIncident({ ...newIncident, outcome: e.target.value })}
                  placeholder="How was it resolved? What did you learn? How do you feel about it now? What would you do differently?"
                  className="w-full p-4 border-2 border-primary rounded-lg bg-primary text-primary font-serif resize-none leading-relaxed focus:border-accent-primary focus:outline-none transition-colors"
                  rows={4}
                />
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-accent-primary text-inverse rounded-lg font-serif font-medium hover:bg-accent-primary transition-colors"
                >
                  Chronicle This Moment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-6 py-4 bg-surface text-primary rounded-lg font-serif font-medium hover:bg-surface-hover transition-colors border border-primary"
                >
                  Not Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline - Clean Minimal Layout */}
      <div className="w-full">
        {mockIncidents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--surface)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
              Your story begins here
            </h3>
            <p className="font-serif text-sm mb-8 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Start chronicling the experiences that shape your connection with {member.fullName}.
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
              Begin Chronicle
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {mockIncidents.map((incident, index) => (
              <div key={incident.id}>
                <div className="flex items-start gap-6">
                  {/* Simple Timeline Marker */}
                  <div className="flex-shrink-0 w-3 h-3 rounded-full mt-2" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-serif text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          {incident.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-mono uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                            {new Date(incident.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="font-mono uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                            {incident.category}
                          </span>
                          <span className="font-mono uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                            {incident.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="mb-4">
                      <p className="font-serif leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {incident.description}
                      </p>
                    </div>
                    
                    {/* Outcome */}
                    {incident.outcome && (
                      <div className="mb-4 pl-4" style={{ borderLeft: '2px solid var(--accent-ai)' }}>
                        <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--accent-ai)' }}>
                          Resolution
                        </div>
                        <p className="font-serif text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {incident.outcome}
                        </p>
                      </div>
                    )}
                    
                    {/* Emotions - Simple Text */}
                    {incident.emotions.length > 0 && (
                      <div className="text-sm">
                        <span className="font-mono uppercase tracking-widest mr-3" style={{ color: 'var(--text-tertiary)' }}>
                          Emotions:
                        </span>
                        <span className="font-serif" style={{ color: 'var(--text-secondary)' }}>
                          {incident.emotions.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Subtle Divider */}
                {index < mockIncidents.length - 1 && (
                  <div className="w-full h-px mt-8" style={{ 
                    backgroundImage: 'repeating-linear-gradient(to right, var(--border-tertiary) 0px, var(--border-tertiary) 4px, transparent 4px, transparent 8px)',
                    opacity: '0.4'
                  }}></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Section */}
      {mockIncidents.length > 0 && (
        <>
          <div className="w-full h-px mt-12 mb-8" style={{ 
            backgroundImage: 'repeating-linear-gradient(to right, var(--accent-gold) 0px, var(--accent-gold) 6px, transparent 6px, transparent 12px)',
            opacity: '0.6'
          }}></div>
          
          <div className="w-full">
            <h3 className="font-serif text-lg mb-6" style={{ color: 'var(--text-primary)' }}>
              Chronicle Summary
            </h3>
            
            <div className="grid grid-cols-5 gap-8">
              {['conflict', 'breakthrough', 'milestone', 'challenge', 'celebration'].map((category) => {
                const count = mockIncidents.filter(i => i.category === category).length;
                return (
                  <div key={category} className="text-center">
                    <div className="text-2xl font-serif font-light mb-1" style={{ color: 'var(--text-primary)' }}>
                      {count}
                    </div>
                    <div className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      {category}{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}