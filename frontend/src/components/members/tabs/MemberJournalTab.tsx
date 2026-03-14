'use client';

import { useState } from 'react';

interface Member {
  id: string;
  fullName: string;
  [key: string]: any;
}

interface MemberJournalTabProps {
  member: Member;
}

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood: string[];
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Mock data
const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    title: 'The Lighthouse Story',
    content: 'Something felt different today. She mentioned the childhood story again, the one about the lighthouse.',
    mood: ['thoughtful', 'protective', 'understanding'],
    tags: ['vulnerability', 'patterns', 'childhood'],
    isPrivate: false,
    createdAt: '2024-03-12T21:30:00Z'
  },
  {
    id: '2',
    title: 'Patterns of Withdrawal',
    content: 'Lumen suggested I look at the pattern of her withdrawing after deep conversations.',
    mood: ['insightful', 'patient', 'accepting'],
    tags: ['patterns', 'communication', 'growth'],
    isPrivate: true,
    createdAt: '2024-03-10T23:15:00Z'
  },
  {
    id: '3',
    title: 'Morning Coffee Ritual',
    content: 'She makes coffee like it\'s a meditation.',
    mood: ['grateful', 'loved', 'peaceful'],
    tags: ['rituals', 'care', 'daily life'],
    isPrivate: false,
    createdAt: '2024-03-08T20:45:00Z'
  }
];

export function MemberJournalTab({ member }: MemberJournalTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(mockJournalEntries[0]?.id || null);
  const [isPageTurning, setIsPageTurning] = useState(false);
  const [pageDirection, setPageDirection] = useState<'forward' | 'backward'>('forward');
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: [] as string[],
    tags: [] as string[],
    isPrivate: false
  });

  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      thoughtful: 'bg-lumis-accent-ai-light text-lumis-accent-ai border-lumis-accent-ai',
      protective: 'bg-lumis-accent-secondary-light text-lumis-accent-secondary border-lumis-accent-secondary',
      understanding: 'bg-lumis-accent-primary-light text-lumis-accent-primary border-lumis-accent-primary',
      insightful: 'bg-lumis-accent-ai-light text-lumis-accent-ai border-lumis-accent-ai',
      patient: 'bg-lumis-accent-gold-light text-lumis-accent-gold border-lumis-accent-gold',
      accepting: 'bg-lumis-success-bg text-lumis-success border-lumis-success-border',
      grateful: 'bg-lumis-success-bg text-lumis-success border-lumis-success-border',
      loved: 'bg-lumis-accent-secondary-light text-lumis-accent-secondary border-lumis-accent-secondary',
      peaceful: 'bg-lumis-accent-primary-light text-lumis-accent-primary border-lumis-accent-primary'
    };
    return moodColors[mood] || 'bg-lumis-surface text-lumis-text-tertiary border-lumis-text-primary';
  };

  const handleEntrySelection = (entryId: string) => {
    if (entryId === selectedEntry) return;

    const currentEntry = mockJournalEntries.find(entry => entry.id === selectedEntry);
    const newEntryData = mockJournalEntries.find(entry => entry.id === entryId);
    
    if (!currentEntry || !newEntryData) return;
    
    const currentDate = new Date(currentEntry.createdAt);
    const newDate = new Date(newEntryData.createdAt);
    
    const direction = newDate < currentDate ? 'backward' : 'forward';
    
    setIsPageTurning(true);
    setPageDirection(direction);
    
    setTimeout(() => {
      setSelectedEntry(entryId);
    }, 500);
    
    setTimeout(() => {
      setIsPageTurning(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding new journal entry:', newEntry);
    setNewEntry({
      title: '',
      content: '',
      mood: [],
      tags: [],
      isPrivate: false
    });
    setShowAddForm(false);
  };

  const selectedEntryData = mockJournalEntries.find(entry => entry.id === selectedEntry);

  return (
    <div className="w-full min-h-[600px]">
      <div className="relative max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-lumis-text-primary rounded-2xl transform rotate-1 opacity-20"></div>
        
        <div className="relative bg-lumis-surface-elevated rounded-2xl shadow-theme-xl border border-lumis-text-tertiary overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-lumis-accent-gold border-r border-lumis-accent-gold-light">
            <div className="h-full flex flex-col justify-center items-center">
              <div className="transform -rotate-90 text-xs font-mono uppercase tracking-widest text-lumis-accent-gold whitespace-nowrap">
                {member.fullName}
              </div>
            </div>
          </div>

          <div className="ml-8 grid grid-cols-12 min-h-[600px]">
            <div className="col-span-5 p-8 border-r border-lumis-text-tertiary bg-lumis-bg-primary">
              <div className="mb-8">
                <div className="text-center mb-4">
                  <h2 className="font-serif text-xl text-lumis-text-primary mb-2">
                    Journal Entries
                  </h2>
                  <div className="w-16 h-px bg-lumis-accent-gold mx-auto"></div>
                </div>
                <p className="font-serif text-sm text-lumis-text-secondary text-center italic">
                  "The unexamined life is not worth living" — Socrates
                </p>
              </div>

              <div className="space-y-3">
                {mockJournalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => handleEntrySelection(entry.id)}
                    className={`cursor-pointer p-3 rounded-lg border transition-all duration-300 ${
                      selectedEntry === entry.id
                        ? 'bg-lumis-accent-primary-light border-lumis-accent-primary shadow-sm'
                        : 'bg-lumis-surface border-lumis-text-tertiary hover:bg-lumis-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs text-lumis-text-tertiary mb-1">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        {entry.title ? (
                          <h4 className="font-serif text-sm font-medium text-lumis-text-primary truncate">
                            {entry.title}
                          </h4>
                        ) : (
                          <h4 className="font-serif text-sm text-lumis-text-secondary italic truncate">
                            Untitled Entry
                          </h4>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {entry.mood.length > 0 && (
                          <div className="flex gap-1">
                            {entry.mood.slice(0, 1).map((mood, idx) => (
                              <div key={idx} className={`w-2 h-2 rounded-full ${getMoodColor(mood).split(' ')[0]}`}></div>
                            ))}
                            {entry.mood.length > 1 && (
                              <span className="text-xs text-lumis-text-tertiary">+{entry.mood.length - 1}</span>
                            )}
                          </div>
                        )}
                        {entry.isPrivate && (
                          <svg className="w-3 h-3 text-lumis-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full p-4 border-2 border-dashed border-lumis-text-tertiary rounded-lg text-center hover:border-lumis-accent-primary hover:bg-lumis-accent-primary-light transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-lumis-text-tertiary group-hover:text-lumis-accent-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-mono text-xs uppercase tracking-widest text-lumis-text-tertiary group-hover:text-lumis-accent-primary">
                      New Entry
                    </span>
                  </div>
                </button>
              </div>
            </div>
            <div className="col-span-7 relative perspective-1000">
              <div className="absolute inset-0 bg-lumis-bg-secondary rounded-l-lg transform translate-x-3 translate-y-3 opacity-20 shadow-lg"></div>
              <div className="absolute inset-0 bg-lumis-bg-secondary rounded-l-lg transform translate-x-2 translate-y-2 opacity-30 shadow-lg"></div>
              <div className="absolute inset-0 bg-lumis-surface rounded-l-lg transform translate-x-1 translate-y-1 opacity-50 shadow-md"></div>
              
              <div className="relative preserve-3d">
                <div className={`relative bg-lumis-bg-primary p-8 min-h-[600px] shadow-lg rounded-l-lg transition-all duration-1000 ease-in-out transform-style-preserve-3d ${
                  isPageTurning 
                    ? pageDirection === 'forward' 
                      ? 'animate-page-turn-forward' 
                      : 'animate-page-turn-backward'
                    : ''
                }`}>
                  <div className="page-front backface-hidden">
                    <div className="absolute inset-0 opacity-5 bg-gradient-to-bl from-lumis-accent-ai via-transparent to-lumis-accent-gold pointer-events-none rounded-l-lg"></div>
                    
                    <div className={`absolute bottom-4 right-4 w-16 h-16 pointer-events-none ${
                      isPageTurning ? 'animate-paper-wrinkle' : ''
                    }`}>
                      <div className="w-full h-full bg-lumis-surface opacity-20 rounded-full transform rotate-45"></div>
                      <div className="absolute inset-2 bg-lumis-accent-gold opacity-15 rounded-full transform -rotate-12"></div>
                      <div className="absolute inset-4 bg-lumis-text-tertiary opacity-10 rounded-full transform rotate-30"></div>
                    </div>
                    
                    <div className="relative z-10">
                      {selectedEntryData ? (
                        <div className="h-full flex flex-col">
                          <div className="mb-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="font-mono text-xs text-lumis-text-tertiary mb-2">
                                  {new Date(selectedEntryData.createdAt).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                {selectedEntryData.title && (
                                  <h3 className="font-serif text-xl font-medium text-lumis-text-primary mb-2">
                                    {selectedEntryData.title}
                                  </h3>
                                )}
                              </div>
                              {selectedEntryData.isPrivate && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-lumis-surface rounded-full border border-lumis-text-tertiary shadow-sm">
                                  <svg className="w-3 h-3 text-lumis-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-mono text-xs text-lumis-text-tertiary">Private</span>
                                </div>
                              )}
                            </div>
                            <div className="w-full h-px bg-lumis-accent-gold shadow-sm"></div>
                          </div>

                          <div className="flex-1 mb-6">
                            <div className="font-serif text-base text-lumis-text-primary leading-relaxed whitespace-pre-wrap">
                              {selectedEntryData.content}
                            </div>
                          </div>

                          <div className="space-y-4">
                            {selectedEntryData.mood.length > 0 && (
                              <div>
                                <div className="font-mono text-xs uppercase tracking-widest text-lumis-text-tertiary mb-2">
                                  Emotional State
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {selectedEntryData.mood.map((mood, index) => (
                                    <span key={index} className={`px-3 py-1 rounded-full text-sm font-serif border shadow-sm ${getMoodColor(mood)}`}>
                                      {mood}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {selectedEntryData.tags.length > 0 && (
                              <div>
                                <div className="font-mono text-xs uppercase tracking-widest text-lumis-text-tertiary mb-2">
                                  Themes
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {selectedEntryData.tags.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 bg-lumis-accent-gold-light text-lumis-accent-gold rounded-full text-sm font-serif border border-lumis-accent-gold shadow-sm">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 bg-lumis-surface rounded-full flex items-center justify-center shadow-inner">
                              <svg className="w-10 h-10 text-lumis-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <h3 className="font-serif text-lg text-lumis-text-primary mb-2">
                              Select an entry to read
                            </h3>
                            <p className="font-serif text-sm text-lumis-text-secondary">
                              Choose from your journal entries on the left
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="page-back absolute inset-0 backface-hidden rotate-y-180 p-8" style={{backgroundColor: 'var(--lumis-bg-primary)'}}>
                    <div className="absolute inset-0 rounded-l-lg" style={{backgroundColor: 'var(--lumis-bg-primary)'}}></div>
                    <div className="absolute inset-0 rounded-l-lg" style={{backgroundColor: 'var(--lumis-bg-primary)'}}></div>
                    
                    <div className="absolute inset-0 opacity-3 bg-gradient-to-bl from-lumis-accent-ai via-transparent to-lumis-accent-gold pointer-events-none rounded-l-lg"></div>
                    
                    <div className="relative z-20 h-full flex flex-col justify-center opacity-5">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="w-full h-px bg-lumis-text-tertiary mb-8"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lumis-text-tertiary via-lumis-accent-gold to-lumis-text-tertiary opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}