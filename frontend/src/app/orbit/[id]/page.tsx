'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useGetMemberQuery, useGetMemberHealthScoresQuery } from '@/store/api/membersApi';
import { useGetMemberNumerologyQuery, useCalculateNumerologyMutation } from '@/store/api/numerologyApi';
import { useGetMemberAstrologyQuery, useCalculateAstrologyMutation } from '@/store/api/astrologyApi';
import { useLumenRelationshipReportMutation } from '@/store/api/lumenApi';
import { getAccessToken } from '@/lib/tokenStorage';
import { MemberPageHeader } from '@/components/members/MemberPageHeader';
import { EditMemberModal } from '@/components/members/EditMemberModal';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

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
  icon: string;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Essential details and connection metrics for this relationship',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
  },
  {
    id: 'traits',
    label: 'Traits',
    description: 'The qualities that draw you closer and the patterns that create friction',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    id: 'incidents',
    label: 'Incidents',
    description: 'Significant moments and events that shaped your relationship',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
  },
  {
    id: 'patterns',
    label: 'Patterns',
    description: 'Recurring dynamics and behavioral cycles in your interactions',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
  },
  {
    id: 'interactions',
    label: 'Interactions',
    description: 'Shared experiences and the emotional flow of your conversations',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    id: 'journal',
    label: 'Journal',
    description: 'Private reflections and thoughts about this relationship',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
  },
  {
    id: 'numerology',
    label: 'Numerology',
    description: 'Life path numbers and numerological compatibility insights',
    icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14'
  },
  {
    id: 'astrology',
    label: 'Astrology',
    description: 'Their emotional world through the moon — how they feel, what shifts them, and how to meet them there',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
  },
  {
    id: 'report',
    label: 'Report',
    description: 'AI-generated insights and relationship analysis based on your data',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  }
];

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [incidentsAddOpen, setIncidentsAddOpen] = useState(false);
  const [incidentsCount, setIncidentsCount]       = useState<number | undefined>(undefined);
  const [patternsCount, setPatternsCount]         = useState<number | undefined>(undefined);
  const [interactionsCount, setInteractionsCount] = useState<number | undefined>(undefined);
  const [journalCount, setJournalCount]           = useState<number | undefined>(undefined);
  const [patternsAddOpen, setPatternsAddOpen]         = useState(false);
  const [interactionsAddOpen, setInteractionsAddOpen] = useState(false);
  const [journalAddOpen, setJournalAddOpen]           = useState(false);
  
  const { data: memberResponse, isLoading, error } = useGetMemberQuery(memberId);
  const member = memberResponse?.data;

  // Health scores
  const { data: healthScores } = useGetMemberHealthScoresQuery();
  const memberHealthScore = healthScores?.find(h => h.memberId === memberId)?.score;

  // Numerology
  const { data: numerologyProfile } = useGetMemberNumerologyQuery(memberId, { skip: !member });
  const [calculateNumerology, { isLoading: isGeneratingNumerology }] = useCalculateNumerologyMutation();
  const [numerologyError, setNumerologyError] = useState<string | null>(null);

  const canGenerateNumerology = Boolean(member?.dateOfBirth && member?.fullName);
  const hasNumerologyData = Boolean(numerologyProfile);

  const handleGenerateNumerology = async () => {
    if (!member?.dateOfBirth || !member?.fullName) return;
    setNumerologyError(null);
    try {
      await calculateNumerology({
        dob: member.dateOfBirth,
        fullName: member.fullName,
        memberId: member.id,
        memberRelation: member.relationType,
        memberDob: member.dateOfBirth,
        memberFullName: member.fullName,
      }).unwrap();
    } catch (err: any) {
      setNumerologyError(err?.data?.error?.message || 'Failed to generate. Please try again.');
    }
  };

  // Astrology
  const { data: astrologyProfile } = useGetMemberAstrologyQuery(memberId, { skip: !member });
  const [calculateAstrology, { isLoading: isGeneratingAstrology }] = useCalculateAstrologyMutation();
  const [astrologyError, setAstrologyError] = useState<string | null>(null);

  const canGenerateAstrology = Boolean(member?.dateOfBirth && member?.timeOfBirth && member?.placeOfBirth);
  const hasAstrologyData = Boolean(astrologyProfile);

  // Report
  const [generateReport, { isLoading: isGeneratingReport }] = useLumenRelationshipReportMutation();
  const [reportText, setReportText] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!member) return;
    setReportError(null);
    try {
      const result = await generateReport({ memberId: member.id, depth: 'FULL_SPECTRUM' }).unwrap();
      setReportText(result.data?.text ?? null);
    } catch (err: any) {
      setReportError(err?.data?.error?.message || 'Failed to generate report. Please try again.');
    }
  };

  const handleGenerateAstrology = async () => {
    if (!member?.dateOfBirth || !member?.timeOfBirth || !member?.placeOfBirth) return;
    setAstrologyError(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const token = getAccessToken();
      let lat = 0, lon = 0, utcOffset = 0;
      try {
        const geoRes = await fetch(`${API_BASE}/astrology/geocode?place=${encodeURIComponent(member.placeOfBirth)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (geoRes.ok) {
          const geoJson = await geoRes.json();
          lat = geoJson.data?.lat ?? 0;
          lon = geoJson.data?.lon ?? 0;
          utcOffset = geoJson.data?.utcOffset ?? 0;
        }
      } catch {}
      await calculateAstrology({
        dob: member.dateOfBirth,
        birthTime: member.timeOfBirth,
        lat, lon, utcOffset,
        memberId: member.id,
        memberRelation: member.relationType,
        memberName: member.fullName.split(' ')[0],
      }).unwrap();
    } catch (err: any) {
      setAstrologyError(err?.data?.error?.message || 'Failed to generate reading. Please try again.');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        let newIndex;
        
        if (event.key === 'ArrowUp') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
          newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        setActiveTab(tabs[newIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-lumis-bg-primary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center">
            <svg className="w-12 h-12 text-lumis-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-serif font-medium text-lumis-text-primary mb-4">
            Member Not Found
          </h3>
          <p className="text-lumis-text-secondary mb-8 leading-relaxed">
            The luminary you're seeking has drifted beyond our current view.
          </p>
          <button 
            onClick={() => router.push('/orbit')}
            className="px-8 py-3 bg-lumis-accent-primary text-lumis-text-inverse rounded-xl font-mono text-xs uppercase tracking-widest font-medium hover:bg-lumis-accent-primary-hover transition-all shadow-lg"
          >
            Return to Luminaries
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
        return <MemberIncidentsTab member={member} externalAddOpen={incidentsAddOpen} onExternalAddClose={() => setIncidentsAddOpen(false)} onCountChange={setIncidentsCount} />;
      case 'patterns':
        return <MemberPatternsTab member={member} externalAddOpen={patternsAddOpen} onExternalAddClose={() => setPatternsAddOpen(false)} onCountChange={setPatternsCount} />;
      case 'interactions':
        return <MemberInteractionsTab member={member} externalAddOpen={interactionsAddOpen} onExternalAddClose={() => setInteractionsAddOpen(false)} onCountChange={setInteractionsCount} />;
      case 'journal':
        return <MemberJournalTab member={member} externalAddOpen={journalAddOpen} onExternalAddClose={() => setJournalAddOpen(false)} onCountChange={setJournalCount} />;
      case 'numerology':
        return <MemberNumerologyTab member={member} isExternalLoading={isGeneratingNumerology} />;
      case 'astrology':
        return <MemberAstrologyTab member={member} isExternalLoading={isGeneratingAstrology} externalError={astrologyError} />;
      case 'report':
        return <MemberAIReportTab member={member} reportText={reportText} isLoading={isGeneratingReport} error={reportError} healthScore={memberHealthScore} />;
      default:
        return <MemberOverviewTab member={member} />;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Ultra Narrow Sidebar */}
      <aside className="w-48 flex flex-col h-full">
        {/* Back Navigation */}
        <div className="pl-12 pr-4 py-5 flex-shrink-0">
          <button
            onClick={() => router.push('/orbit')}
            className="flex items-center gap-2 transition-colors"
            style={{ color: 'var(--text-tertiary)', fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Luminaries
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col justify-between">
          {/* Member Profile */}
          <div className="pl-12 pr-4 pt-4" data-tour="member-info">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full overflow-hidden" style={{ border: '1px solid var(--bg-tertiary)' }}>
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-inverse)', fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 600 }}>
                    {member.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Member name — Playfair, legible */}
              <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4 }}>
                {member.fullName}
              </h1>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {member.relationTypeCustom || member.relationType}
              </p>
            </div>
          </div>

          {/* Navigation — Inter, navigation labels */}
          <nav className="pl-14 pr-0 flex-1 flex items-center" data-tour="member-tabs">
            <div className="space-y-1 w-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full text-left transition-all flex items-center gap-2.5"
                  style={{ color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-tertiary)', padding: '4px 0' }}
                  onMouseEnter={(e) => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                  data-tour={`tab-${tab.id}`}
                >
                  <div
                    className="rounded-full transition-all flex-shrink-0"
                    style={{ width: 5, height: 5, backgroundColor: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent', border: activeTab === tab.id ? 'none' : '1px solid var(--bg-tertiary)' }}
                  />
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: activeTab === tab.id ? 600 : 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {/* Bottom Quote */}
          <div className="pl-8 pr-6 pb-6">
            <div className="text-center">
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontStyle: 'italic', fontWeight: 500, color: 'var(--text-tertiary)', lineHeight: 1.55 }}>
                &quot;The resonance of stillness is the loudest frequency.&quot;
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 6, opacity: 0.6 }}>
                Internal Resonance
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full ml-12">
        {/* Reusable Header Component */}
        <MemberPageHeader
          tabs={tabs}
          activeTab={activeTab}
          tabCount={
            activeTab === 'incidents'    ? incidentsCount :
            activeTab === 'patterns'     ? patternsCount :
            activeTab === 'interactions' ? interactionsCount :
            activeTab === 'journal'      ? journalCount :
            undefined
          }
          onSecondaryAction={() => setShowEditModal(true)}
          onActionClick={() => {
            if (activeTab === 'journal') setJournalAddOpen(true);
            else if (activeTab === 'patterns') setPatternsAddOpen(true);
            else if (activeTab === 'interactions') setInteractionsAddOpen(true);
            else if (activeTab === 'incidents') setIncidentsAddOpen(true);
            else if (activeTab === 'numerology') handleGenerateNumerology();
            else if (activeTab === 'astrology') handleGenerateAstrology();
            else if (activeTab === 'report') handleGenerateReport();
          }}
          actionLabel={
            activeTab === 'numerology'
              ? (hasNumerologyData ? 'Regenerate Numerology' : canGenerateNumerology ? 'Generate Numerology' : null)
              : activeTab === 'astrology'
              ? (hasAstrologyData ? 'Regenerate Astrology' : canGenerateAstrology ? 'Generate Astrology' : null)
              : activeTab === 'report'
              ? (reportText ? 'Regenerate Report' : 'Generate Report')
              : undefined
          }
          actionDisabled={
            (activeTab === 'numerology' && !canGenerateNumerology) ||
            (activeTab === 'astrology' && !canGenerateAstrology)
          }
          actionLoading={
            (activeTab === 'numerology' && isGeneratingNumerology) ||
            (activeTab === 'astrology' && isGeneratingAstrology) ||
            (activeTab === 'report' && isGeneratingReport)
          }
        />

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col" data-tour="tab-content">
          {renderTabContent()}
        </div>
      </main>

      {/* Edit Luminary Modal */}
      {showEditModal && (
        <EditMemberModal
          member={member}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}