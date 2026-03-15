'use client';

import { useState } from 'react';

interface Member {
  id: string;
  fullName: string;
  [key: string]: any;
}

interface MemberAIReportTabProps {
  member: Member;
}

interface AIInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'strength' | 'growth';
  title: string;
  description: string;
  confidence: number; // 0-100
  evidence: string[];
  actionable?: string;
  createdAt: string;
}

// Mock AI insights
const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'pattern',
    title: 'Communication Shutdown Pattern',
    description: 'Lumen has identified a recurring pattern where conflicts escalate when direct communication is attempted during high-stress periods.',
    confidence: 87,
    evidence: [
      'Last 3 conflicts occurred during work deadline periods',
      'Response time to messages increases by 300% during stress',
      'Positive interactions correlate with low-stress timing'
    ],
    actionable: 'Consider scheduling important conversations during calm periods, or use written communication first to allow processing time.',
    createdAt: '2024-03-12T10:00:00Z'
  },
  {
    id: '2',
    type: 'strength',
    title: 'Emotional Support Recognition',
    description: 'This person consistently provides emotional support in ways that align with your specific needs and communication style.',
    confidence: 94,
    evidence: [
      '89% of support interactions rated as "helpful" or "very helpful"',
      'They adapt their support style based on your mood indicators',
      'Support timing correlates with your stress patterns'
    ],
    actionable: 'Express appreciation for their intuitive support style to reinforce this positive dynamic.',
    createdAt: '2024-03-11T15:30:00Z'
  },
  {
    id: '3',
    type: 'recommendation',
    title: 'Energy Alignment Opportunity',
    description: 'Your energy levels are most compatible during evening hours (6-9 PM), suggesting optimal timing for deeper conversations.',
    confidence: 76,
    evidence: [
      'Interaction quality scores 40% higher in evening timeframe',
      'Both parties report higher satisfaction in evening interactions',
      'Conflict resolution success rate highest between 7-8 PM'
    ],
    actionable: 'Schedule important discussions or quality time during your mutual high-energy window.',
    createdAt: '2024-03-10T09:15:00Z'
  },
  {
    id: '4',
    type: 'growth',
    title: 'Boundary Communication Development',
    description: 'There\'s an opportunity to develop clearer boundary communication to prevent minor frustrations from accumulating.',
    confidence: 82,
    evidence: [
      'Small frustrations mentioned in 60% of journal entries',
      'Direct boundary conversations result in positive outcomes',
      'Unaddressed minor issues correlate with larger conflicts'
    ],
    actionable: 'Practice expressing minor preferences before they become frustrations. Use "I" statements to communicate needs.',
    createdAt: '2024-03-09T14:20:00Z'
  }
];

export function MemberAIReportTab({ member }: MemberAIReportTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
      case 'recommendation': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
      case 'strength': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
      case 'growth': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
      default: return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'bg-accent-ai/5 text-accent-ai border-accent-ai/20';
      case 'recommendation': return 'bg-accent-primary/5 text-accent-primary border-accent-primary/20';
      case 'strength': return 'bg-accent-gold/5 text-accent-gold border-accent-gold/20';
      case 'growth': return 'bg-accent-secondary/5 text-accent-secondary border-accent-secondary/20';
      default: return 'bg-secondary text-tertiary border-primary';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-accent-primary';
    if (confidence >= 70) return 'text-accent-ai';
    if (confidence >= 50) return 'text-accent-gold';
    return 'text-accent-secondary';
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Elegant Header */}
      <div className="max-w-3xl">
        <h2 className="text-3xl font-display font-medium text-primary mb-6">
          Lumen Relationship Report
        </h2>
        <p className="font-serif text-lg leading-relaxed text-secondary">
          The connection with {member.fullName} is characterized by a rare intellectual synchronicity. There is a "Quiet, Safe" frequency that allows for deep vulnerability without the need for constant validation. Your bond has transitioned from a situational friendship into a foundational pillar of your social ecosystem.
        </p>
      </div>

      {/* Analysis Status */}
      <div className="bg-accent-ai/5 border border-accent-ai/10 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-ai/10 rounded-full flex items-center justify-center border border-accent-ai/20">
              <svg className="w-6 h-6 text-accent-ai" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-medium">
                Deep Analysis Complete
              </h3>
              <p className="font-serif text-sm text-secondary mt-1">
                Based on {mockInsights.length} behavioral patterns and interaction data points
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs uppercase tracking-widest text-accent-ai font-medium">Last Updated</div>
            <div className="font-mono text-xs text-tertiary">2 hours ago</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-elevated border-2 border-primary/30 p-8 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-tertiary">Compatibility Score</span>
            <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-5xl font-display font-light text-primary mb-3">88%</p>
          <p className="font-serif text-sm text-secondary leading-relaxed">
            High resonance in emotional intelligence and shared long-term values.
          </p>
        </div>

        <div className="bg-surface-elevated border-2 border-primary/30 p-8 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-tertiary">Relationship Dynamic</span>
            <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-display font-light text-primary mb-3 pt-2">Mutually Nourishing</p>
          <p className="font-serif text-sm text-secondary leading-relaxed">
            A balanced exchange of energy where both parties feel seen and replenished.
          </p>
        </div>
      </div>

      {/* Tension Points */}
      <div className="bg-accent-secondary/5 border border-accent-secondary/10 p-10 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="font-mono text-xs uppercase tracking-widest text-accent-secondary font-medium">
            Tension Points
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="font-serif text-lg text-primary font-medium mb-2">Conflict Avoidance</p>
            <p className="font-serif text-sm text-secondary leading-relaxed">
              Both parties tend to prioritize harmony over immediate truth-telling, leading to minor build-ups of unsaid feelings.
            </p>
          </div>
          <div>
            <p className="font-serif text-lg text-primary font-medium mb-2">Time Scarcity</p>
            <p className="font-serif text-sm text-secondary leading-relaxed">
              Professional commitments occasionally interrupt the depth of shared "Lumen" moments.
            </p>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-medium">
            Detailed Insights
          </h3>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="px-6 py-3 bg-accent-ai text-inverse rounded-xl font-mono text-xs uppercase tracking-widest font-medium hover:bg-accent-ai-hover transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isGenerating ? 'Analyzing...' : 'Regenerate Report'}
          </button>
        </div>

        {mockInsights.map((insight) => (
          <div key={insight.id} className="bg-surface border-2 border-primary/30 p-8 rounded-2xl hover:shadow-md transition-all shadow-md">
            <div className="flex items-start gap-6">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border ${getInsightColor(insight.type)}`}>
                {getInsightIcon(insight.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-serif font-medium text-primary mb-2">
                      {insight.title}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full font-mono text-xs font-medium uppercase tracking-wider border ${getInsightColor(insight.type)}`}>
                        {insight.type}
                      </span>
                      <span className={`font-mono text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>

                <p className="font-serif text-lg leading-relaxed text-secondary mb-6">
                  {insight.description}
                </p>

                <div className="mb-6">
                  <div className="font-mono text-xs uppercase tracking-widest text-tertiary mb-3">
                    Supporting Evidence
                  </div>
                  <ul className="space-y-2">
                    {insight.evidence.map((evidence, index) => (
                      <li key={index} className="font-serif text-sm text-secondary flex items-start gap-3">
                        <span className="text-accent-ai mt-2 flex-shrink-0">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </span>
                        <span className="leading-relaxed">{evidence}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {insight.actionable && (
                  <div className="bg-accent-primary/5 border border-accent-primary/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <div className="font-mono text-xs uppercase tracking-widest text-accent-primary font-medium">
                        Actionable Insight
                      </div>
                    </div>
                    <p className="font-serif text-sm text-primary leading-relaxed">
                      {insight.actionable}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-primary">
                  <button
                    onClick={() => setSelectedInsight(insight)}
                    className="font-mono text-xs text-accent-ai hover:text-accent-ai-hover uppercase tracking-widest"
                  >
                    View detailed analysis →
                  </button>
                  <span className="font-mono text-xs text-tertiary uppercase tracking-widest">
                    Generated {new Date(insight.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Relationship Trajectory */}
      <div className="bg-surface-elevated border-2 border-primary/30 p-10 rounded-2xl shadow-md">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-medium">
            Relationship Trajectory
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-serif text-secondary">Overall trend</span>
              <span className="font-mono text-sm font-medium text-accent-primary flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Improving
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-serif text-secondary">Communication quality</span>
              <span className="font-mono text-sm font-medium text-accent-ai flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Steady growth
              </span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-serif text-secondary">Conflict resolution</span>
              <span className="font-mono text-sm font-medium text-accent-primary flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Much improved
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-serif text-secondary">Emotional support</span>
              <span className="font-mono text-sm font-medium text-accent-gold flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Consistently strong
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-accent-secondary/5 border border-accent-secondary/10 p-10 rounded-2xl">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-6 h-6 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-mono text-xs uppercase tracking-widest text-accent-secondary font-medium">
            Recommended Next Steps
          </h3>
        </div>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-accent-secondary/10 rounded-full flex items-center justify-center text-accent-secondary font-mono text-sm font-medium border border-accent-secondary/20">
              1
            </div>
            <div>
              <div className="font-serif text-lg font-medium text-primary mb-1">Schedule a check-in conversation</div>
              <div className="font-serif text-sm text-secondary leading-relaxed">Use the evening energy window (7-8 PM) to discuss relationship goals and shared intentions.</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-accent-secondary/10 rounded-full flex items-center justify-center text-accent-secondary font-mono text-sm font-medium border border-accent-secondary/20">
              2
            </div>
            <div>
              <div className="font-serif text-lg font-medium text-primary mb-1">Practice boundary communication</div>
              <div className="font-serif text-sm text-secondary leading-relaxed">Address small preferences before they become frustrations using gentle "I" statements.</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-accent-secondary/10 rounded-full flex items-center justify-center text-accent-secondary font-mono text-sm font-medium border border-accent-secondary/20">
              3
            </div>
            <div>
              <div className="font-serif text-lg font-medium text-primary mb-1">Acknowledge their support style</div>
              <div className="font-serif text-sm text-secondary leading-relaxed">Express appreciation for their intuitive emotional support to reinforce this positive dynamic.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}