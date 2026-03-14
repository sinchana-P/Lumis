'use client';

interface Member {
  id: string;
  fullName: string;
  nickname?: string;
  relationType: string;
  relationTypeCustom?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

interface MemberOverviewTabProps {
  member: Member;
}

export function MemberOverviewTab({ member }: MemberOverviewTabProps) {
  return (
    <div className="flex flex-col gap-12">
      {/* Elegant Introduction */}
      <div className="max-w-3xl">
        <h2 className="text-3xl font-display font-medium text-primary mb-6">
          Connection Overview
        </h2>
        <p className="font-serif text-lg leading-relaxed text-secondary">
          {member.notes || `Your relationship with ${member.fullName} represents a unique constellation point in your social universe. Each interaction, shared moment, and evolving dynamic contributes to the deeper understanding of this connection.`}
        </p>
      </div>

      {/* Sophisticated Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Essence */}
        <div className="bg-surface p-8 rounded-2xl shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
              Personal Essence
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-tertiary mb-2">Full Name</p>
              <p className="text-xl font-serif text-primary">{member.fullName}</p>
            </div>

            {member.nickname && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-tertiary mb-2">Known As</p>
                <p className="text-lg font-serif text-secondary">{member.nickname}</p>
              </div>
            )}

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-tertiary mb-2">Relationship Dynamic</p>
              <p className="text-lg font-serif text-primary capitalize">
                {member.relationTypeCustom || member.relationType}
              </p>
            </div>

            {member.placeOfBirth && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-tertiary mb-2">Origin Point</p>
                <p className="text-lg font-serif text-secondary">{member.placeOfBirth}</p>
              </div>
            )}
          </div>
        </div>

        {/* Temporal Coordinates */}
        <div className="bg-surface p-8 rounded-2xl shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
              Temporal Coordinates
            </h3>
          </div>

          <div className="space-y-6">
            {member.dateOfBirth && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-tertiary mb-2">Birth Moment</p>
                <p className="text-lg font-serif text-primary">
                  {new Date(member.dateOfBirth).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {member.timeOfBirth && (
                  <p className="text-sm font-mono text-secondary mt-1">{member.timeOfBirth}</p>
                )}
              </div>
            )}

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-tertiary mb-2">Constellation Entry</p>
              <p className="text-lg font-serif text-primary">
                {new Date(member.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-tertiary mb-2">Last Evolution</p>
              <p className="text-lg font-serif text-secondary">
                {new Date(member.updatedAt || member.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-accent-primary/5 border border-accent-primary/20 p-8 rounded-2xl text-center">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-medium text-primary mb-2">
            Relationship Health
          </h3>
          <p className="font-serif text-sm text-secondary leading-relaxed mb-4">
            The overall vitality and harmony of your connection over time.
          </p>
          <div className="mt-4">
            <div className="text-3xl font-display font-light text-accent-primary">92%</div>
            <div className="font-mono text-[10px] text-tertiary uppercase tracking-widest">Flourishing</div>
          </div>
        </div>

        <div className="bg-accent-secondary/5 border border-accent-secondary/20 p-8 rounded-2xl text-center">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-medium text-primary mb-2">
            Communication Flow
          </h3>
          <p className="font-serif text-sm text-secondary leading-relaxed mb-4">
            The quality and frequency of your meaningful exchanges.
          </p>
          <div className="mt-4">
            <div className="text-3xl font-display font-light text-accent-secondary">8.4</div>
            <div className="font-mono text-[10px] text-tertiary uppercase tracking-widest">Resonant</div>
          </div>
        </div>

        <div className="bg-accent-ai/5 border border-accent-ai/20 p-8 rounded-2xl text-center">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-ai" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-medium text-primary mb-2">
            Growth Potential
          </h3>
          <p className="font-serif text-sm text-secondary leading-relaxed mb-4">
            Opportunities for deeper understanding and connection.
          </p>
          <div className="mt-4">
            <div className="text-3xl font-display font-light text-accent-ai">High</div>
            <div className="font-mono text-[10px] text-tertiary uppercase tracking-widest">Expanding</div>
          </div>
        </div>
      </div>

      {/* Relationship Essence */}
      <div className="bg-primary/5 border-2 border-primary/20 p-10 rounded-2xl shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
            Relationship Essence
          </h3>
        </div>

        <div className="max-w-3xl">
          <p className="font-serif text-lg leading-relaxed text-secondary italic">
            "The connection with {member.fullName} represents a unique frequency in your social constellation.
            This relationship serves as {member.relationType === 'friend' ? 'a mirror for growth and shared discovery' :
            member.relationType === 'family' ? 'a foundational anchor in your life\'s journey' :
            member.relationType === 'partner' ? 'a sacred space for vulnerability and co-creation' :
            'a meaningful thread in the tapestry of your human experience'}."
          </p>
        </div>
      </div>
    </div>
  );
}