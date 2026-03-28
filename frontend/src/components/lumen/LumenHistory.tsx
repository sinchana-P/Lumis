'use client';

import { useState } from 'react';
import { useLumenListConversationsQuery, useLumenDeleteConversationMutation, type ConversationRecord } from '@/store/api/lumenApi';

// ─── Types ──────────────────────────────────────────────────────────────────

type LumenMode = 'vent' | 'guided' | 'analysis' | 'advice' | 'timing';

export interface ConversationSummary {
  id: string;
  mode: LumenMode;
  analysisDepth: 'cosmic' | 'behavioral' | 'full-spectrum';
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  snippet: string;
}

// ─── Mode meta ───────────────────────────────────────────────────────────────

const MODE_META: Record<LumenMode, { label: string; color: string }> = {
  vent:     { label: 'Vent',     color: '#B08898' },
  guided:   { label: 'Guided',   color: 'var(--accent-gold)' },
  analysis: { label: 'Analysis', color: 'var(--accent-ai)' },
  advice:   { label: 'Advice',   color: 'var(--accent-primary)' },
  timing:   { label: 'Timing',   color: '#9B8EC4' },
};

const DEPTH_ICONS: Record<string, string> = {
  cosmic: '🌙',
  behavioral: '📊',
  'full-spectrum': '✨',
};

// ─── Transform DB record → ConversationSummary ───────────────────────────────

function toSummary(record: ConversationRecord): ConversationSummary {
  const messages = record.messages ?? [];
  const firstUserMsg = messages.find((m) => m.role === 'user');
  const snippet = firstUserMsg?.content?.slice(0, 120) ?? '—';
  const rawDepth = (firstUserMsg as any)?.depth as string | undefined;
  const depthMap: Record<string, ConversationSummary['analysisDepth']> = {
    FULL_SPECTRUM: 'full-spectrum',
    COSMIC: 'cosmic',
    BEHAVIORAL: 'behavioral',
  };
  const analysisDepth = depthMap[rawDepth ?? ''] ?? 'full-spectrum';
  const modeRaw = (record.mode ?? 'guided').toLowerCase() as LumenMode;

  return {
    id: record.id,
    mode: modeRaw,
    analysisDepth,
    startedAt: new Date(record.created_at),
    lastMessageAt: new Date(record.updated_at),
    messageCount: messages.length,
    snippet,
  };
}

// ─── Grouping ────────────────────────────────────────────────────────────────

function getGroup(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff <= 7) return 'This Week';
  if (diff <= 30) return 'This Month';
  return 'Earlier';
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  activeConversationId?: string;
  onSelectConversation: (id: string, messages: ConversationRecord['messages']) => void;
  onNewChat: () => void;
  onClose: () => void;
}

export function LumenHistory({ open, activeConversationId, onSelectConversation, onNewChat, onClose }: Props) {
  const [search, setSearch] = useState('');
  const { data: response, isLoading } = useLumenListConversationsQuery(undefined, { skip: !open });
  const [deleteConversation] = useLumenDeleteConversationMutation();

  const records = response?.data ?? [];
  const summaries = records.map(toSummary);

  const filtered = search.trim()
    ? summaries.filter((c) =>
        c.snippet.toLowerCase().includes(search.toLowerCase()) ||
        c.mode.includes(search.toLowerCase())
      )
    : summaries;

  // Group by date
  const grouped: Record<string, ConversationSummary[]> = {};
  for (const conv of filtered) {
    const grp = getGroup(conv.lastMessageAt);
    if (!grouped[grp]) grouped[grp] = [];
    grouped[grp].push(conv);
  }

  const handleSelect = (id: string) => {
    const record = records.find((r) => r.id === id);
    onSelectConversation(id, record?.messages ?? []);
    onClose();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteConversation(id);
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          style={{ background: 'rgba(0,0,0,0.18)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full z-40 flex flex-col"
        style={{
          width: 300,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--bg-tertiary)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          paddingTop: 56,
        }}
      >
        {/* Single top bar: search + new chat + close */}
        <div
          className="flex items-center gap-2 flex-shrink-0"
          style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-tertiary)' }}
        >
          {/* Search */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 flex-1"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full focus:outline-none"
              style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-serif)', border: 'none', boxShadow: 'none' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}
              >
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* New chat */}
          <button
            onClick={() => { onNewChat(); onClose(); }}
            title="New chat"
            style={{
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--bg-primary)',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4, flexShrink: 0 }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12" style={{ opacity: 0.4 }}>
              <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center" style={{ opacity: 0.5 }}>
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)', marginBottom: 10 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                {search ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            GROUP_ORDER.filter((g) => grouped[g]?.length).map((group) => (
              <div key={group}>
                {/* Group header */}
                <div
                  className="px-4 pt-4 pb-1"
                  style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}
                >
                  <span className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                    {group}
                  </span>
                </div>

                {/* Items */}
                {grouped[group].map((conv) => {
                  const meta = MODE_META[conv.mode] ?? MODE_META.guided;
                  const isActive = conv.id === activeConversationId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelect(conv.id)}
                      className="w-full text-left transition-colors duration-150 group"
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? `2px solid ${meta.color}` : '2px solid transparent',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }}
                    >
                      {/* Mode + depth + time row */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex-shrink-0 rounded-full" style={{ width: 6, height: 6, background: meta.color }} />
                        <span className="font-rounded uppercase tracking-widest flex-shrink-0" style={{ fontSize: 10, color: meta.color }}>
                          {meta.label}
                        </span>
                        <span style={{ fontSize: 10, flexShrink: 0 }}>{DEPTH_ICONS[conv.analysisDepth]}</span>
                        <span className="flex-1" />
                        <span className="font-mono flex-shrink-0" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          {conv.lastMessageAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {/* Delete button — shows on hover */}
                        <button
                          onClick={(e) => handleDelete(e, conv.id)}
                          title="Delete"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px',
                            color: 'var(--text-tertiary)', opacity: 0, pointerEvents: 'none',
                            transition: 'opacity 0.15s',
                          }}
                          className="delete-btn"
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'; }}
                        >
                          <svg width="9" height="9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Snippet */}
                      <p
                        className="font-serif"
                        style={{
                          fontSize: 12,
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          lineHeight: 1.45,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {conv.snippet}
                      </p>

                      {/* Message count */}
                      <div className="flex items-center mt-1.5">
                        <span className="flex-1" />
                        <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          {conv.messageCount} msgs
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </aside>

      <style>{`
        button:hover .delete-btn,
        button:hover > .delete-btn {
          opacity: 1 !important;
          pointer-events: auto !important;
        }
        /* Show delete btn when parent button is hovered */
        button:hover .delete-btn { opacity: 1 !important; pointer-events: auto !important; }
      `}</style>
    </>
  );
}
