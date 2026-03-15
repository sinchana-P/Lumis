'use client';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  fullName: string;
  relationType: string;
  relationTypeCustom?: string;
}

interface MemberContext {
  member: Member;
  dataLayers: string[];
  addedAt: Date;
}

interface ActiveMemberContextsProps {
  memberContexts: MemberContext[];
  onRemoveMember: (memberId: string) => void;
  onAddMember: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ActiveMemberContexts({
  memberContexts,
  onRemoveMember,
  onAddMember
}: ActiveMemberContextsProps) {
  const getDisplayRelationType = (member: Member): string => {
    if (member.relationType === 'other' && member.relationTypeCustom) {
      return member.relationTypeCustom;
    }
    return member.relationType.charAt(0).toUpperCase() + member.relationType.slice(1);
  };

  if (memberContexts.length === 0) {
    return (
      <div className="mb-6">
        <button
          onClick={onAddMember}
          className="w-full p-4 bg-lumis-surface border-2 border-dashed border-lumis-text-tertiary/30 rounded-xl hover:border-lumis-accent-primary/50 hover:bg-lumis-accent-primary/5 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lumis-accent-primary/20 flex items-center justify-center group-hover:bg-lumis-accent-primary/30 transition-colors">
              <svg className="w-5 h-5 text-lumis-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-mono text-xs uppercase tracking-wider text-lumis-text-primary font-medium">
                Add Member to Context
              </h3>
              <p className="font-serif text-sm text-lumis-text-secondary italic">
                Give Lumen full A-Z profile data
              </p>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-xs uppercase tracking-wider text-lumis-text-tertiary">
          Lumen reads all logged data for selected members
        </h3>
        <button
          onClick={onAddMember}
          className="p-1.5 text-lumis-text-tertiary hover:text-lumis-accent-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {memberContexts.map((context) => (
          <div
            key={context.member.id}
            className="bg-lumis-surface rounded-xl p-4 border border-lumis-text-tertiary/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-lumis-accent-secondary/20 flex items-center justify-center flex-shrink-0">
                <span className="font-serif text-sm font-medium text-lumis-accent-secondary">
                  {context.member.fullName.charAt(0)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-sm font-medium text-lumis-text-primary">
                      {context.member.fullName}
                    </h4>
                    <span className="px-2 py-0.5 bg-lumis-accent-gold/20 text-lumis-accent-gold rounded-full font-mono text-xs uppercase tracking-wider">
                      {getDisplayRelationType(context.member)}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveMember(context.member.id)}
                    className="p-1 text-lumis-text-tertiary hover:text-lumis-text-primary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {context.dataLayers.map((layer) => (
                    <span
                      key={layer}
                      className="px-2 py-0.5 bg-lumis-accent-ai/10 text-lumis-accent-ai rounded-full font-mono text-xs"
                    >
                      {layer}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}