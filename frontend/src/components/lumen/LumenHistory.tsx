'use client';

import { useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

type LumenMode = 'vent' | 'guided' | 'analysis' | 'advice' | 'timing';

export interface ConversationSummary {
  id: string;
  mode: LumenMode;
  analysisDepth: 'cosmic' | 'behavioral' | 'full-spectrum';
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  snippet: string; // first user message preview
  memberNames?: string[];
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

// ─── Mock history data ────────────────────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const MOCK_CONVERSATIONS: ConversationSummary[] = [
  {
    id: 'c1',
    mode: 'guided',
    analysisDepth: 'full-spectrum',
    startedAt: daysAgo(0),
    lastMessageAt: daysAgo(0),
    messageCount: 14,
    snippet: "I've been feeling disconnected from Zara lately and I can't figure out why...",
    memberNames: ['Zara'],
  },
  {
    id: 'c2',
    mode: 'vent',
    analysisDepth: 'behavioral',
    startedAt: daysAgo(0),
    lastMessageAt: daysAgo(0),
    messageCount: 6,
    snippet: "Work was just a lot today. My manager dismissed everything I brought up in the meeting.",
  },
  {
    id: 'c3',
    mode: 'analysis',
    analysisDepth: 'full-spectrum',
    startedAt: daysAgo(1),
    lastMessageAt: daysAgo(1),
    messageCount: 22,
    snippet: "Can you break down what's happening between me and Rohan? Something shifted last month.",
    memberNames: ['Rohan'],
  },
  {
    id: 'c4',
    mode: 'advice',
    analysisDepth: 'full-spectrum',
    startedAt: daysAgo(1),
    lastMessageAt: daysAgo(1),
    messageCount: 18,
    snippet: "I want to have a hard conversation with Mom about boundaries but I don't know how to start.",
    memberNames: ['Mom'],
  },
  {
    id: 'c5',
    mode: 'timing',
    analysisDepth: 'cosmic',
    startedAt: daysAgo(3),
    lastMessageAt: daysAgo(3),
    messageCount: 10,
    snippet: "Is now a good time to reach out to Arjun after the silence? Feels like something is shifting.",
    memberNames: ['Arjun'],
  },
  {
    id: 'c6',
    mode: 'guided',
    analysisDepth: 'behavioral',
    startedAt: daysAgo(5),
    lastMessageAt: daysAgo(5),
    messageCount: 30,
    snippet: "I keep attracting the same kind of emotionally unavailable people. Why do I do this?",
  },
  {
    id: 'c7',
    mode: 'analysis',
    analysisDepth: 'cosmic',
    startedAt: daysAgo(8),
    lastMessageAt: daysAgo(8),
    messageCount: 16,
    snippet: "Explain my relationship with conflict — I either freeze or explode, nothing in between.",
  },
  {
    id: 'c8',
    mode: 'vent',
    analysisDepth: 'full-spectrum',
    startedAt: daysAgo(12),
    lastMessageAt: daysAgo(12),
    messageCount: 8,
    snippet: "Just needed somewhere to put this. I found out Zara talked about me to mutual friends.",
    memberNames: ['Zara'],
  },
  {
    id: 'c9',
    mode: 'advice',
    analysisDepth: 'behavioral',
    startedAt: daysAgo(20),
    lastMessageAt: daysAgo(20),
    messageCount: 24,
    snippet: "I want to stop people-pleasing at work. What practical steps can I actually take?",
  },
];

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
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

export function LumenHistory({ open, activeConversationId, onSelectConversation, onNewChat, onClose }: Props) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? MOCK_CONVERSATIONS.filter((c) =>
        c.snippet.toLowerCase().includes(search.toLowerCase()) ||
        c.mode.includes(search.toLowerCase()) ||
        c.memberNames?.some((n) => n.toLowerCase().includes(search.toLowerCase()))
      )
    : MOCK_CONVERSATIONS;

  // Group by date
  const grouped: Record<string, ConversationSummary[]> = {};
  for (const conv of filtered) {
    const grp = getGroup(conv.lastMessageAt);
    if (!grouped[grp]) grouped[grp] = [];
    grouped[grp].push(conv);
  }

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
          paddingTop: 56, // below header
        }}
      >
        {/* Single top bar: search + new chat + close */}
        <div
          className="flex items-center gap-2 flex-shrink-0"
          style={{ padding: '8px 10px', borderBottom: '1px solid var(--bg-tertiary)' }}
        >
          {/* Search — fills remaining space */}
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
              style={{
                fontSize: 12,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-serif)',
                border: 'none',
                boxShadow: 'none',
              }}
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

          {/* New chat icon button */}
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
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center" style={{ opacity: 0.5 }}>
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)', marginBottom: 10 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                No conversations found
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
                  <span
                    className="font-mono uppercase tracking-widest"
                    style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
                  >
                    {group}
                  </span>
                </div>

                {/* Items */}
                {grouped[group].map((conv) => {
                  const meta = MODE_META[conv.mode];
                  const isActive = conv.id === activeConversationId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => { onSelectConversation(conv.id); onClose(); }}
                      className="w-full text-left transition-colors duration-150"
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? `2px solid ${meta.color}` : '2px solid transparent',
                        cursor: 'pointer',
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
                        {/* Mode dot */}
                        <span
                          className="flex-shrink-0 rounded-full"
                          style={{ width: 6, height: 6, background: meta.color }}
                        />
                        <span
                          className="font-mono uppercase tracking-widest flex-shrink-0"
                          style={{ fontSize: 10, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        <span style={{ fontSize: 10, flexShrink: 0 }}>
                          {DEPTH_ICONS[conv.analysisDepth]}
                        </span>
                        <span className="flex-1" />
                        <span
                          className="font-mono flex-shrink-0"
                          style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
                        >
                          {conv.lastMessageAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
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

                      {/* Members + message count */}
                      {(conv.memberNames?.length || conv.messageCount) && (
                        <div className="flex items-center gap-2 mt-1.5">
                          {conv.memberNames?.length ? (
                            <div className="flex items-center gap-1">
                              <svg width="9" height="9" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span
                                className="font-serif"
                                style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
                              >
                                {conv.memberNames.join(', ')}
                              </span>
                            </div>
                          ) : null}
                          <span className="flex-1" />
                          <span
                            className="font-mono"
                            style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
                          >
                            {conv.messageCount} msgs
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
