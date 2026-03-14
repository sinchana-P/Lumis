'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGetMemberQuery } from '@/store/api/membersApi';
import { Header } from '@/components/layout/Header';

// Tab Components
import { 
  MemberOverviewTab,
  MemberProsConsTab,
  MemberIncidentsTab,
  MemberPatternsTab,
  MemberInteractionsTab,
  MemberJournalTab,
  MemberNumerologyTab,
  MemberAstrologyTab,
  MemberAIReportTab
} from '@/components/members/tabs';

type TabId = 'overview' | 'traits' | 'incidents' | 'patterns' | 'interactions' | 'journal' | 'numerology' | 'astrology' | 'report';

interface Tab {
  id: TabId;
  label: string;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Essential details and timeline'
  },
  {
    id: 'traits',
    label: 'Traits',
    description: 'Strengths, shadows, and patterns'
  },
  {
    id: 'incidents',
    label: 'Incidents',
    description: 'Significant moments and events'
  },
  {
    id: 'patterns',
    label: 'Patterns',
    description: 'Recurring dynamics and behaviors'
  },
  {
    id: 'interactions',
    label: 'Interactions',
    description: 'Communication and shared experiences'
  },
  {
    id: 'journal',
    label: 'Journal',
    description: 'Private reflections and insights'
  },
  {
    id: 'numerology',
    label: 'Numerology',
    description: 'Life path and soul blueprint'
  },
  {
    id: 'astrology',
    label: 'Astrology',
    description: 'Celestial influences and timing'
  },
  {
    id: 'report',
    label: 'Report',
    description: 'Lumen\'s deep analysis'
  }
];

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  
  const { data: memberResponse, isLoading, error } = useGetMemberQuery(memberId);
  const member = memberResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-secondary font-mono text-sm uppercase tracking-widest">Loading constellation...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center">
            <svg className="w-12 h-12 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-serif font-medium text-primary mb-4">
            Member Not Found
          </h3>
          <p className="text-secondary mb-8 leading-relaxed">
            The constellation member you're seeking has drifted beyond our current view.
          </p>
          <button 
            onClick={() => router.push('/members')}
            className="px-8 py-3 bg-accent-primary text-inverse rounded-xl font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent-primary-hover transition-all shadow-lg"
          >
            Return to Constellation
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <MemberOverviewTab member={member} />;
      case 'traits':
        return <MemberProsConsTab member={member} />;
      case 'incidents':
        return <MemberIncidentsTab member={member} />;
      case 'patterns':
        return <MemberPatternsTab member={member} />;
      case 'interactions':
        return <MemberInteractionsTab member={member} />;
      case 'journal':
        return <MemberJournalTab member={member} />;
      case 'numerology':
        return <MemberNumerologyTab member={member} />;
      case 'astrology':
        return <MemberAstrologyTab member={member} />;
      case 'report':
        return <MemberAIReportTab member={member} />;
      default:
        return <MemberOverviewTab member={member} />;
    }
  };

  // Calculate relationship health (mock calculation)
  const relationshipHealth = 92; // This would come from actual data analysis
  const healthArcOffset = 283 - (283 * relationshipHealth / 100);

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      <main className="flex-1 px-12 pt-20 pb-8 grid grid-cols-12 gap-8">
        {/* Back navigation */}
        <div className="col-span-12 -mb-4">
          <button
            onClick={() => router.push('/members')}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-tertiary hover:text-primary transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Constellation
          </button>
        </div>
        
        {/* Left Column: Profile Focus */}
        <div className={`col-span-12 ${activeTab === 'overview' ? 'lg:col-span-9' : ''} flex flex-col gap-6`}>
          {/* Elegant Header Section */}
          <section className="flex items-end gap-6">
            <div className="relative w-32 h-32">
              {/* Relationship Health Arc */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle 
                  className="text-tertiary" 
                  cx="50" 
                  cy="50" 
                  fill="transparent" 
                  r="45" 
                  stroke="currentColor" 
                  strokeWidth="2"
                />
                <circle 
                  className="text-accent-primary" 
                  cx="50" 
                  cy="50" 
                  fill="transparent" 
                  r="45" 
                  stroke="currentColor" 
                  strokeLinecap="round" 
                  strokeWidth="2"
                  strokeDasharray="283"
                  strokeDashoffset={healthArcOffset}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%'
                  }}
                />
              </svg>
              <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-surface-elevated shadow-lg">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-accent-primary flex items-center justify-center text-inverse text-2xl font-serif">
                    {member.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-surface-elevated px-3 py-1 rounded-full border border-primary shadow-lg">
                <p className="font-mono text-[10px] text-accent-primary font-bold uppercase tracking-tighter">
                  {relationshipHealth}% Health
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 pb-2">
              <h1 className="font-serif italic text-5xl text-primary font-semibold">
                {member.fullName}
              </h1>
              <div className="flex items-center gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-tertiary">Relationship:</p>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-secondary font-medium">
                  {member.relationTypeCustom || member.relationType}
                </p>
              </div>
              {member.placeOfBirth && (
                <div className="flex items-center gap-3 mt-1">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-tertiary">Origin:</p>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
                    {member.placeOfBirth}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Sophisticated Tab Navigation */}
          <nav className="flex border-b border-primary gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-mono text-[11px] uppercase tracking-widest pb-4 whitespace-nowrap transition-all outline-none ${
                  activeTab === tab.id
                    ? 'text-accent-secondary border-b-2 border-accent-secondary'
                    : 'text-tertiary hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex flex-col gap-10">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Column: Elegant Sidebar - Only show on overview tab */}
        {activeTab === 'overview' && (
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 pt-0">
          {/* Quick Actions */}
          <section className="flex flex-col gap-4">
            <button className="w-full bg-accent-primary text-inverse py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-accent-primary-hover transition-all shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-mono text-xs uppercase tracking-widest font-bold">Edit Profile</span>
            </button>
            
            <button className="w-full bg-secondary text-primary py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-tertiary transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-mono text-xs uppercase tracking-widest font-bold">Quick Log</span>
            </button>
          </section>

          {/* Connection Insights */}
          <section className="flex flex-col gap-8 bg-secondary p-8 rounded-2xl border border-primary">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent-ai" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
                Connection Insights
              </h3>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-[10px] uppercase text-tertiary mb-1">Energy Match</p>
                  <p className="text-3xl font-display font-light text-primary">High</p>
                </div>
                <div className="w-10 h-10 border border-primary rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
              
              <p className="font-serif text-sm text-secondary leading-relaxed italic">
                "A rare intellectual synchronicity that allows for deep vulnerability without constant validation."
              </p>
              
              <div className="pt-4 border-t border-primary">
                <p className="font-mono text-[10px] uppercase text-tertiary mb-1">Last Interaction</p>
                <p className="text-lg font-display font-light text-primary">3 days ago</p>
                <p className="font-serif text-sm text-secondary mt-2">Coffee conversation about life transitions</p>
              </div>
            </div>
          </section>

          {/* Deep Dive Analysis Button */}
          <button 
            onClick={() => setActiveTab('report')}
            className="w-full bg-primary text-inverse py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="font-mono text-xs uppercase tracking-widest font-bold">Deep Dive Analysis</span>
          </button>
        </aside>
        )}
      </main>

      {/* Elegant Footer */}
      <footer className="px-12 py-8 flex items-center justify-between text-[10px] text-tertiary uppercase font-mono tracking-widest border-t border-primary">
        <p>© 2024 Lumis System v2.4.0</p>
        <p>Connection Secured: {member.id.slice(0, 8).toUpperCase()}</p>
      </footer>
    </div>
  );
}