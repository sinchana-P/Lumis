'use client';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  fullName: string;
  relationType: string;
  relationTypeCustom?: string;
  numerology?: any;
  astrology?: any;
  traits?: any;
  recentInteractions?: any[];
  incidents?: any[];
  patterns?: any[];
}

interface MemberContext {
  member: Member;
  dataLayers: string[];
  addedAt: Date;
}

interface MemberContextSelectorProps {
  members: Member[];
  memberContexts: MemberContext[];
  onAddMember: (memberId: string) => void;
  onRemoveMember: (memberId: string) => void;
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function MemberContextSelector({
  members,
  memberContexts,
  onAddMember,
  onRemoveMember: _onRemoveMember,
  showSelector,
  setShowSelector,
}: MemberContextSelectorProps) {
  const getDisplayRelationType = (member: Member): string => {
    if (member.relationType === 'other' && member.relationTypeCustom) return member.relationTypeCustom;
    return member.relationType.charAt(0).toUpperCase() + member.relationType.slice(1);
  };

  const getDataLayers = (member: Member): string[] => {
    const layers: string[] = [];
    if (member.numerology) layers.push('Numerology');
    if (member.astrology) layers.push('Astrology');
    if (member.traits && (member.traits.pros?.length > 0 || member.traits.cons?.length > 0)) layers.push('Traits');
    if (member.incidents && member.incidents.length > 0) layers.push('Incidents');
    if (member.recentInteractions && member.recentInteractions.length > 0) layers.push('Interactions');
    return layers;
  };

  const availableMembers = members.filter((m) => !memberContexts.some((ctx) => ctx.member.id === m.id));

  if (!showSelector) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(26,24,22,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: 420,
          maxHeight: '85vh',
          background: 'var(--bg-primary)',
          border: '1px solid var(--bg-tertiary)',
          borderRadius: 14,
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--bg-tertiary)' }}
        >
          <div>
            <p className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 500 }}>
              Add to Context
            </p>
            <p className="font-serif italic" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
              Lumen reads all logged data for selected members
            </p>
          </div>
          <button
            onClick={() => setShowSelector(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Data layers legend */}
        <div className="flex-shrink-0 px-5 py-2.5" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-rounded uppercase tracking-widest mr-1" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>
              Data layers:
            </span>
            {['Numerology', 'Astrology', 'Traits', 'Incidents', 'Interactions'].map((layer, i) => (
              <span key={layer} className="flex items-center gap-1">
                {i > 0 && <span style={{ fontSize: 9, color: 'var(--text-disabled)', fontWeight: 700 }}>·</span>}
                <span className="font-rounded uppercase tracking-widest" style={{ fontSize: 7, color: 'var(--text-tertiary)' }}>{layer}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Members list — no cards, just rows with dividers */}
        <div className="flex-1 overflow-y-auto">
          {availableMembers.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="font-serif text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
                All members are already in context
              </p>
            </div>
          ) : (
            availableMembers.map((member, i) => {
              const dataLayers = getDataLayers(member);

              return (
                <div
                  key={member.id}
                  className="px-5 py-3 flex items-start gap-3"
                  style={{ borderTop: i > 0 ? '1px solid var(--bg-tertiary)' : 'none' }}
                >
                  {/* Initial */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--accent-primary)', border: '1px solid var(--bg-tertiary)' }}
                  >
                    <span className="font-serif" style={{ fontSize: 14, color: 'var(--text-inverse)' }}>
                      {member.fullName.charAt(0)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Line 1: Name (dominant) + relation type (muted label) */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {member.fullName}
                      </span>
                      <span className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                        {getDisplayRelationType(member)}
                      </span>
                    </div>

                    {/* Line 2: Data layer chips */}
                    {dataLayers.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {dataLayers.map((layer, i) => (
                          <span key={layer} className="flex items-center gap-1">
                            {i > 0 && (
                              <span style={{ fontSize: 9, color: 'var(--text-disabled)', fontWeight: 700 }}>·</span>
                            )}
                            <span
                              className="font-rounded uppercase tracking-widest"
                              style={{ fontSize: 7, color: 'var(--text-tertiary)' }}
                            >
                              {layer}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Line 3: Actions */}
                    <div className="flex gap-2 mt-2.5">
                      <button
                        onClick={() => { onAddMember(member.id); setShowSelector(false); }}
                        className="font-rounded uppercase tracking-widest rounded"
                        style={{ fontSize: 11, padding: '4px 12px', background: 'var(--accent-primary)', color: 'var(--text-inverse)', border: 'none', cursor: 'pointer' }}
                      >
                        + Add
                      </button>
                      <button
                        className="font-rounded uppercase tracking-widest rounded"
                        style={{ fontSize: 11, padding: '4px 12px', background: 'transparent', color: 'var(--text-tertiary)', border: '1px solid var(--bg-tertiary)', cursor: 'pointer' }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
