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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding new trait:', newProCon);
    setNewProCon({ type: 'pro', text: '', intensity: 3, emotionTag: '' });
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-8">

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-elevated rounded-2xl shadow-2xl max-w-lg w-full p-8 border-2 border-primary/30">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                Add Relationship Trait
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-tertiary mb-3">Nature</p>
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
                <p className="font-mono text-xs uppercase tracking-widest text-tertiary mb-3">Description</p>
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
                <p className="font-mono text-xs uppercase tracking-widest text-tertiary mb-3">Intensity</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Strengths Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                What Draws You Closer
              </h3>
              <span className="font-mono text-xs text-tertiary">({pros.length})</span>
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
          <div>
            {pros.length === 0 ? (
              <p className="font-serif text-sm italic py-4" style={{ color: 'var(--text-tertiary)' }}>
                No strengths captured yet.{' '}
                <button onClick={() => setShowAddForm(true)} className="underline" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Add one →
                </button>
              </p>
            ) : (
              pros.map((pro, i) => (
                <div
                  key={pro.id}
                  className="flex items-start gap-3 py-3"
                  style={{
                    marginTop: i > 0 ? 6 : 0,
                    paddingLeft: 10,
                    borderLeft: '2px solid #7FA87A',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{pro.text}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {pro.emotionTag && (
                        <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                          {pro.emotionTag}
                        </span>
                      )}
                      <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(pro.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs flex-shrink-0 mt-0.5" style={{ color: '#7FA87A' }}>
                    {pro.intensity}/5
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Challenges Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                Growth Edges
              </h3>
              <span className="font-mono text-xs text-tertiary">({cons.length})</span>
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

          <div>
            {cons.length === 0 ? (
              <p className="font-serif text-sm italic py-4" style={{ color: 'var(--text-tertiary)' }}>
                No challenges identified yet.{' '}
                <button onClick={() => setShowAddForm(true)} className="underline" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-secondary)', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Add one →
                </button>
              </p>
            ) : (
              cons.map((con, i) => (
                <div
                  key={con.id}
                  className="flex items-start gap-3 py-3"
                  style={{
                    marginTop: i > 0 ? 6 : 0,
                    paddingLeft: 10,
                    borderLeft: '2px solid #C47A7A',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{con.text}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {con.emotionTag && (
                        <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                          {con.emotionTag}
                        </span>
                      )}
                      <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(con.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs flex-shrink-0 mt-0.5" style={{ color: '#C47A7A' }}>
                    {con.intensity}/5
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Relationship Balance Insight */}
      <div className="px-5 py-4 rounded-xl" style={{ border: '1px solid var(--bg-tertiary)' }}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent-gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Dynamic Balance</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="font-serif text-2xl font-light mb-0.5" style={{ color: 'var(--accent-primary)' }}>{pros.length}</div>
            <div className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Strengths</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-2xl font-light mb-0.5" style={{ color: 'var(--accent-secondary)' }}>{cons.length}</div>
            <div className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Growth Edges</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-2xl font-light mb-0.5" style={{ color: 'var(--accent-ai)' }}>
              {pros.length > 0 ? Math.round((pros.length / (pros.length + cons.length)) * 100) : 0}%
            </div>
            <div className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Appreciation Ratio</div>
          </div>
        </div>

        <div className="pt-3" style={{ borderTop: '1px solid var(--bg-tertiary)' }}>
          <p className="font-serif text-xs leading-relaxed italic text-center" style={{ color: 'var(--text-tertiary)' }}>
            "Every relationship contains both light and shadow. The goal is not perfection, but conscious appreciation of the full spectrum."
          </p>
        </div>
      </div>
    </div>
  );
}