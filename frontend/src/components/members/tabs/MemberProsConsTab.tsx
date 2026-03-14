'use client';

import { useState } from 'react';

interface Member {
  id: string;
  fullName: string;
  [key: string]: any;
}

interface MemberProsConsTabProps {
  member: Member;
}

interface ProCon {
  id: string;
  type: 'pro' | 'con';
  text: string;
  intensity: number; // 1-5 scale
  emotionTag?: string;
  createdAt: string;
}

// Mock data - in real app this would come from API
const mockProsAndCons: ProCon[] = [
  {
    id: '1',
    type: 'pro',
    text: 'Always makes me laugh even on my worst days',
    intensity: 5,
    emotionTag: 'joyful',
    createdAt: '2024-03-10T10:00:00Z'
  },
  {
    id: '2',
    type: 'pro',
    text: 'Great listener and gives thoughtful advice',
    intensity: 4,
    emotionTag: 'safe',
    createdAt: '2024-03-09T15:30:00Z'
  },
  {
    id: '3',
    type: 'con',
    text: 'Sometimes interrupts when I\'m speaking',
    intensity: 2,
    emotionTag: 'frustrated',
    createdAt: '2024-03-08T12:15:00Z'
  },
  {
    id: '4',
    type: 'pro',
    text: 'Remembers small details about things I care about',
    intensity: 4,
    emotionTag: 'loved',
    createdAt: '2024-03-07T09:45:00Z'
  }
];

export function MemberProsConsTab({ member: _member }: MemberProsConsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProCon, setNewProCon] = useState({
    type: 'pro' as 'pro' | 'con',
    text: '',
    intensity: 3,
    emotionTag: ''
  });

  const pros = mockProsAndCons.filter(item => item.type === 'pro');
  const cons = mockProsAndCons.filter(item => item.type === 'con');

  const getIntensityColor = (intensity: number, type: 'pro' | 'con') => {
    if (type === 'pro') {
      if (intensity >= 4) return 'bg-[#9CAF9E]/30 text-[#4a6b4d] border-[#9CAF9E]/50';
      if (intensity >= 3) return 'bg-[#9CAF9E]/20 text-[#4a6b4d] border-[#9CAF9E]/40';
      return 'bg-[#9CAF9E]/15 text-[#5a7a5d] border-[#9CAF9E]/30';
    } else {
      if (intensity >= 4) return 'bg-[#C9A58F]/30 text-[#8a5a40] border-[#C9A58F]/50';
      if (intensity >= 3) return 'bg-[#C9A58F]/20 text-[#8a5a40] border-[#C9A58F]/40';
      return 'bg-[#C9A58F]/15 text-[#9a6a50] border-[#C9A58F]/30';
    }
  };

  const getEmotionColor = (emotion: string) => {
    const emotionColors: Record<string, string> = {
      joyful:     'bg-emotion-joyful/60 text-[#7a5a30] border-emotion-joyful',
      safe:       'bg-emotion-safe/60 text-[#3a5a3d] border-emotion-safe',
      loved:      'bg-emotion-loved/60 text-[#7a3a50] border-emotion-loved',
      frustrated: 'bg-emotion-hurt/60 text-[#7a3a3a] border-emotion-hurt',
      drained:    'bg-emotion-drained/60 text-[#4a4a5a] border-emotion-drained',
      anxious:    'bg-emotion-anxious/60 text-[#6a5a4a] border-emotion-anxious',
      grounded:   'bg-emotion-peaceful/60 text-[#3a5a6a] border-emotion-peaceful',
      confident:  'bg-emotion-energized/60 text-[#7a6a2a] border-emotion-energized',
      stressed:   'bg-emotion-hurt/60 text-[#7a3a3a] border-emotion-hurt',
    };
    return emotionColors[emotion] || 'bg-emotion-confused/60 text-[#5a5060] border-emotion-confused';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding new trait:', newProCon);
    setNewProCon({ type: 'pro', text: '', intensity: 3, emotionTag: '' });
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Elegant Header */}
      <div className="max-w-3xl">
        <h2 className="text-3xl font-display font-medium text-primary mb-6">
          Relationship Dynamics
        </h2>
        <p className="font-serif text-lg leading-relaxed text-secondary">
          The qualities that draw you closer and the patterns that create friction. Understanding both sides creates space for deeper appreciation and conscious growth.
        </p>
      </div>
      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-elevated rounded-2xl shadow-2xl max-w-lg w-full p-8 border-2 border-primary/30">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
                Add Relationship Trait
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-tertiary mb-3">Nature</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="pro"
                      checked={newProCon.type === 'pro'}
                      onChange={(e) => setNewProCon({ ...newProCon, type: e.target.value as 'pro' | 'con' })}
                      className="w-4 h-4 text-accent-primary"
                    />
                    <span className="font-serif text-accent-primary">Strength</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="con"
                      checked={newProCon.type === 'con'}
                      onChange={(e) => setNewProCon({ ...newProCon, type: e.target.value as 'pro' | 'con' })}
                      className="w-4 h-4 text-accent-secondary"
                    />
                    <span className="font-serif text-accent-secondary">Challenge</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-tertiary mb-3">Description</p>
                <textarea
                  value={newProCon.text}
                  onChange={(e) => setNewProCon({ ...newProCon, text: e.target.value })}
                  placeholder="Describe what you appreciate or find challenging..."
                  className="w-full p-4 border border-primary rounded-xl bg-primary text-primary font-serif resize-none focus:border-accent-primary focus:outline-none transition-colors"
                  rows={3}
                  required
                />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-tertiary mb-3">Intensity</p>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newProCon.intensity}
                  onChange={(e) => setNewProCon({ ...newProCon, intensity: parseInt(e.target.value) })}
                  className="w-full accent-accent-primary"
                />
                <div className="flex justify-between text-xs text-tertiary mt-2">
                  <span className="font-mono">Subtle</span>
                  <span className="font-mono font-bold">{newProCon.intensity}</span>
                  <span className="font-mono">Profound</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-accent-primary text-inverse rounded-xl font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent-primary-hover transition-colors"
                >
                  Save Trait
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-6 py-3 bg-secondary text-primary rounded-xl font-mono text-xs uppercase tracking-widest hover:bg-tertiary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Traits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Strengths Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
                What Draws You Closer
              </h3>
              <span className="font-mono text-[10px] text-tertiary">({pros.length})</span>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="p-2 text-tertiary hover:text-accent-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            {pros.length === 0 ? (
              <div className="bg-accent-primary/5 border border-accent-primary/10 rounded-2xl p-8 text-center">
                <svg className="w-8 h-8 mx-auto mb-4 text-accent-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="font-serif text-secondary mb-3">No strengths captured yet.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="font-mono text-xs text-accent-primary hover:text-accent-primary-hover uppercase tracking-widest"
                >
                  Add the first one →
                </button>
              </div>
            ) : (
              pros.map((pro) => (
                <div key={pro.id} className="bg-success-bg p-6 rounded-2xl hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-serif text-[#3D3935] leading-relaxed flex-1 text-lg">{pro.text}</p>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border ${getIntensityColor(pro.intensity, 'pro')}`}>
                        {pro.intensity}/5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pro.emotionTag && (
                        <span className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider border ${getEmotionColor(pro.emotionTag)}`}>
                          {pro.emotionTag}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-[#9B9590] uppercase tracking-widest">
                      {new Date(pro.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Challenges Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
                Growth Edges
              </h3>
              <span className="font-mono text-[10px] text-tertiary">({cons.length})</span>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="p-2 text-tertiary hover:text-accent-secondary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {cons.length === 0 ? (
              <div className="bg-accent-secondary/5 border border-accent-secondary/10 rounded-2xl p-8 text-center">
                <svg className="w-8 h-8 mx-auto mb-4 text-accent-secondary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="font-serif text-secondary mb-3">No challenges identified yet.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="font-mono text-xs text-accent-secondary hover:text-accent-secondary-hover uppercase tracking-widest"
                >
                  Add the first one →
                </button>
              </div>
            ) : (
              cons.map((con) => (
                <div key={con.id} className="bg-error-bg p-6 rounded-2xl hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-serif text-[#3D3935] leading-relaxed flex-1 text-lg">{con.text}</p>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border ${getIntensityColor(con.intensity, 'con')}`}>
                        {con.intensity}/5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {con.emotionTag && (
                        <span className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider border ${getEmotionColor(con.emotionTag)}`}>
                          {con.emotionTag}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-[#9B9590] uppercase tracking-widest">
                      {new Date(con.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Relationship Balance Insight */}
      <div className="bg-primary/5 border border-primary/10 px-6 py-5 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-bold">Dynamic Balance</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-display font-light text-accent-primary mb-1">{pros.length}</div>
            <div className="font-mono text-[10px] text-tertiary uppercase tracking-widest">Strengths</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-display font-light text-accent-secondary mb-1">{cons.length}</div>
            <div className="font-mono text-[10px] text-tertiary uppercase tracking-widest">Growth Edges</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-display font-light text-accent-ai mb-1">
              {pros.length > 0 ? Math.round((pros.length / (pros.length + cons.length)) * 100) : 0}%
            </div>
            <div className="font-mono text-[10px] text-tertiary uppercase tracking-widest">Appreciation Ratio</div>
          </div>
        </div>

        <div className="pt-4 border-t border-primary/20">
          <p className="font-serif text-sm leading-relaxed text-secondary italic text-center">
            "Every relationship contains both light and shadow. The goal is not perfection, but conscious appreciation of the full spectrum of human connection."
          </p>
        </div>
      </div>
    </div>
  );
}