'use client';

import { useState, useEffect } from 'react';
import {
  useGetJournalEntriesQuery,
  useCreateJournalEntryMutation,
  useUpdateJournalEntryMutation,
  useDeleteJournalEntryMutation,
  type JournalEntry,
  type CreateJournalEntryRequest,
} from '@/store/api/journalApi';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { TwoColumnModal } from '@/components/ui/TwoColumnModal';
import { SpeechTextarea } from '@/components/ui/SpeechTextarea';

interface Member { id: string; fullName: string; [key: string]: any }
interface MemberJournalTabProps {
  member: Member;
  externalAddOpen?: boolean;
  onExternalAddClose?: () => void;
  onCountChange?: (count: number) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EMOTION_OPTIONS = [
  'joyful', 'loved', 'safe', 'grateful', 'peaceful', 'energized', 'hopeful', 'connected',
  'neutral', 'pensive', 'anxious', 'confused', 'frustrated', 'hurt', 'drained', 'distant',
];

const EMOTION_COLOR: Record<string, string> = {
  joyful:     'var(--accent-gold)',
  loved:      'var(--accent-secondary)',
  safe:       '#7FA87A',
  grateful:   '#7FA87A',
  peaceful:   'var(--accent-primary)',
  energized:  '#7FA87A',
  hopeful:    'var(--accent-ai)',
  connected:  'var(--accent-secondary)',
  neutral:    'var(--text-tertiary)',
  pensive:    'var(--accent-ai)',
  anxious:    '#C4A87A',
  confused:   '#C4A87A',
  frustrated: '#C47A7A',
  hurt:       '#C47A7A',
  drained:    '#C47A7A',
  distant:    'var(--text-tertiary)',
};

function emotionColor(e: string) {
  return EMOTION_COLOR[e] ?? 'var(--text-tertiary)';
}

// ── Journal modal ─────────────────────────────────────────────────────────────

interface ModalForm {
  title: string;
  content: string;
  date: string;
  emotions: string[];
  tags: string;
  isPrivate: boolean;
}

const EMPTY_FORM: ModalForm = {
  title: '', content: '',
  date: new Date().toISOString().split('T')[0],
  emotions: [], tags: '', isPrivate: false,
};

function JournalModal({ isOpen, editing, onClose, onSave, saving }: {
  isOpen: boolean;
  editing: JournalEntry | null;
  onClose: () => void;
  onSave: (payload: CreateJournalEntryRequest) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState<ModalForm>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({
        title:     editing.title    ?? '',
        content:   editing.content,
        date:      editing.date,
        emotions:  editing.emotions ?? [],
        tags:      (editing.tags ?? []).join(', '),
        isPrivate: editing.isPrivate,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [isOpen, editing]);

  const handleSave = async () => {
    if (!form.content.trim() || saving) return;
    await onSave({
      content:   form.content.trim(),
      title:     form.title.trim()  || undefined,
      date:      form.date,
      emotions:  form.emotions,
      tags:      form.tags.split(',').map(t => t.trim()).filter(Boolean),
      isPrivate: form.isPrivate,
    });
  };

  const toggleEmotion = (e: string) => {
    setForm(f => ({
      ...f,
      emotions: f.emotions.includes(e)
        ? f.emotions.filter(x => x !== e)
        : [...f.emotions, e],
    }));
  };

  const canSave = !!form.content.trim() && !saving;

  const leftPanel = (
    <>
      {/* Date */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>Date</p>
        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          className="w-full font-mono"
          style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 10px', outline: 'none' }}
        />
      </div>

      {/* Emotions */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 6 }}>Emotions</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {EMOTION_OPTIONS.map(e => {
            const active = form.emotions.includes(e);
            const color  = emotionColor(e);
            return (
              <button key={e} type="button" onClick={() => toggleEmotion(e)}
                className="font-mono uppercase tracking-widest"
                style={{
                  fontSize: 8, padding: '3px 9px', borderRadius: 999, border: '1px solid', cursor: 'pointer',
                  borderColor: active ? color : 'var(--bg-tertiary)',
                  background:  active ? color : 'transparent',
                  color:       active ? '#fff' : 'var(--text-tertiary)',
                  transition: 'all 140ms',
                }}>{e}</button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>
          Tags <span style={{ opacity: 0.45, textTransform: 'none', letterSpacing: 0 }}>comma sep</span>
        </p>
        <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          placeholder="vulnerability, growth…" className="w-full font-mono"
          style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 10px', outline: 'none' }}
        />
      </div>

      {/* Private toggle */}
      <div>
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))}
          className="flex items-center gap-2"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div style={{
            width: 32, height: 18, borderRadius: 999, position: 'relative', transition: 'background 200ms',
            background: form.isPrivate ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', top: 3, left: form.isPrivate ? 17 : 3, width: 12, height: 12,
              borderRadius: '50%', background: '#fff', transition: 'left 200ms',
            }} />
          </div>
          <span className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: form.isPrivate ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
            Private
          </span>
        </button>
        {form.isPrivate && (
          <p className="font-serif" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, fontStyle: 'italic' }}>
            Only visible to you
          </p>
        )}
      </div>
    </>
  );

  const rightPanel = (
    <>
      {/* Title */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>
          Title <span style={{ opacity: 0.45, textTransform: 'none', letterSpacing: 0 }}>optional</span>
        </p>
        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Give your entry a title…" className="w-full font-serif"
          style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '9px 12px', outline: 'none' }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>What's on your mind</p>
        <SpeechTextarea
          value={form.content}
          onChange={v => setForm(f => ({ ...f, content: v }))}
          placeholder="Write freely. This is just for you."
          minHeight={220}
        />
      </div>
    </>
  );

  return (
    <TwoColumnModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      header={editing ? 'Edit Entry' : 'New Journal Entry'}
      saveLabel={editing ? 'Save Changes' : 'Save Entry'}
      canSave={canSave}
      saving={saving}
      left={leftPanel}
      right={rightPanel}
    />
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────

export function MemberJournalTab({ member, externalAddOpen, onExternalAddClose, onCountChange }: MemberJournalTabProps) {
  const [modalOpen, setModalOpen]          = useState(false);
  const [editing, setEditing]              = useState<JournalEntry | null>(null);
  const [selectedId, setSelectedId]        = useState<string | null>(null);
  const [deletingEntry, setDeleting]       = useState<JournalEntry | null>(null);
  const [isPageTurning, setIsPageTurning]  = useState(false);
  const [pageDirection, setPageDirection]  = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    if (externalAddOpen) {
      setEditing(null);
      setModalOpen(true);
      onExternalAddClose?.();
    }
  }, [externalAddOpen, onExternalAddClose]);

  const { data, isLoading, isError } = useGetJournalEntriesQuery({ memberId: member.id });
  const [createEntry, { isLoading: creating }] = useCreateJournalEntryMutation();
  const [updateEntry, { isLoading: updating }] = useUpdateJournalEntryMutation();
  const [deleteEntry, { isLoading: deleting }] = useDeleteJournalEntryMutation();

  const entries = data?.data ?? [];
  const selected = entries.find(e => e.id === selectedId) ?? entries[0] ?? null;

  useEffect(() => {
    if (entries.length && !selectedId) setSelectedId(entries[0].id);
  }, [entries.length]);

  useEffect(() => { if (data) onCountChange?.(entries.length); }, [data, entries.length]);

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (e: JournalEntry) => { setEditing(e); setModalOpen(true); };

  const handleSave = async (payload: CreateJournalEntryRequest) => {
    if (editing) {
      await updateEntry({ memberId: member.id, id: editing.id, data: payload });
    } else {
      const result = await createEntry({ memberId: member.id, ...payload });
      if ('data' in result) setSelectedId((result.data as JournalEntry).id);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEntry) return;
    await deleteEntry({ memberId: member.id, id: deletingEntry.id });
    if (selectedId === deletingEntry.id) setSelectedId(entries.find(e => e.id !== deletingEntry.id)?.id ?? null);
    setDeleting(null);
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    if (entry.id === selectedId || isPageTurning) return;
    const currentEntry = entries.find(e => e.id === selectedId);
    // Newer date = going forward in book (toward front); older = going backward
    const direction = currentEntry && new Date(entry.date) > new Date(currentEntry.date) ? 'forward' : 'backward';
    setIsPageTurning(true);
    setPageDirection(direction);
    setTimeout(() => setSelectedId(entry.id), 500);
    setTimeout(() => setIsPageTurning(false), 1100);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center" style={{ paddingTop: 40 }}>
      <p className="font-mono uppercase tracking-widest" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Loading journal…</p>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center" style={{ paddingTop: 40 }}>
      <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Could not load journal. Please try again.</p>
    </div>
  );

  return (
    <div className="w-full">
      {/* Custom scrollbar styles */}
      <style>{`
        .journal-page-scroll::-webkit-scrollbar { width: 4px; }
        .journal-page-scroll::-webkit-scrollbar-track { background: transparent; }
        .journal-page-scroll::-webkit-scrollbar-thumb { background: var(--bg-tertiary); border-radius: 999px; }
        .journal-list-scroll::-webkit-scrollbar { width: 3px; }
        .journal-list-scroll::-webkit-scrollbar-track { background: transparent; }
        .journal-list-scroll::-webkit-scrollbar-thumb { background: var(--bg-tertiary); border-radius: 999px; }
      `}</style>

      <JournalModal
        isOpen={modalOpen}
        editing={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        saving={creating || updating}
      />

      {deletingEntry && (
        <ConfirmDeleteModal
          title="Delete Entry"
          itemLabel={deletingEntry.title ?? new Date(deletingEntry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleting(null)}
          deleting={deleting}
        />
      )}

      {entries.length === 0 ? (
        /* ── Empty state ── */
        <div style={{ paddingTop: 40, textAlign: 'center' }}>
          <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>No journal entries yet</p>
          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>
            Start writing private reflections about your relationship with {member.fullName}.
          </p>
          <button onClick={openAdd} className="font-mono uppercase tracking-widest"
            style={{ fontSize: 10, padding: '9px 20px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Write First Entry
          </button>
        </div>
      ) : (
        /* ── Book container with depth layers ── */
        <div style={{ position: 'relative', maxWidth: 960 }}>

          {/* Shadow layer 3 — deepest */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 18,
            transform: 'rotate(2.2deg) translateY(6px)',
            background: 'var(--bg-tertiary)', opacity: 0.25,
          }} />
          {/* Shadow layer 2 */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 18,
            transform: 'rotate(1.1deg) translateY(3px)',
            background: 'var(--bg-tertiary)', opacity: 0.4,
          }} />
          {/* Shadow layer 1 — closest */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 16,
            transform: 'rotate(0.4deg) translateY(1px)',
            background: 'var(--bg-tertiary)', opacity: 0.55,
          }} />

          {/* Book body */}
          <div style={{
            position: 'relative', borderRadius: 14, overflow: 'hidden',
            height: 'min(72vh, 720px)',
            display: 'flex',
            border: '1px solid var(--bg-tertiary)',
            background: 'var(--bg-secondary)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)',
          }}>

            {/* Book spine */}
            <div style={{
              width: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(180deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)',
              boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.15)',
            }}>
              <span className="font-mono uppercase tracking-widest whitespace-nowrap" style={{
                transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.85)', fontSize: 8,
                letterSpacing: '0.2em', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {member.fullName}
              </span>
            </div>

            {/* Left panel — entry list */}
            <div style={{
              width: 196, flexShrink: 0, display: 'flex', flexDirection: 'column',
              borderRight: '1px solid var(--bg-tertiary)',
              background: 'var(--bg-primary)',
            }}>
              {/* List header */}
              <div style={{ height: 78, flexShrink: 0, borderBottom: '1px solid var(--bg-tertiary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
                <p className="font-serif text-center" style={{ fontSize: 17, color: 'var(--text-primary)', marginBottom: 3 }}>
                  Entries
                </p>
                <div style={{ width: 24, height: 1, background: 'var(--accent-secondary)', margin: '0 auto 4px' }} />
                <p className="font-serif italic text-center" style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.35, padding: '0 4px' }}>
                  "The unexamined life is not worth living"
                </p>
              </div>

              {/* Scrollable entries */}
              <div className="journal-list-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {entries.map(entry => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => handleSelectEntry(entry)}
                      className="text-left w-full"
                      style={{
                        padding: '7px 8px', borderRadius: 7, border: '1px solid',
                        borderColor: selectedId === entry.id ? 'var(--accent-primary)' : 'transparent',
                        background: selectedId === entry.id ? 'var(--accent-primary-light)' : 'transparent',
                        cursor: 'pointer', transition: 'all 180ms',
                      }}
                      onMouseEnter={e => { if (selectedId !== entry.id) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                      onMouseLeave={e => { if (selectedId !== entry.id) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-secondary)', flex: 1 }}>
                          {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {entry.isPrivate && (
                          /* Lock icon */
                          <svg width="8" height="9" viewBox="0 0 10 12" fill="none" style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>
                            <rect x="1" y="5" width="8" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M3 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            <circle cx="5" cy="8.2" r="0.9" fill="currentColor" />
                          </svg>
                        )}
                      </div>
                      <p className="font-serif truncate" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.35, fontWeight: selectedId === entry.id ? 500 : 400 }}>
                        {entry.title || <span style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>Untitled</span>}
                      </p>
                      {entry.emotions.length > 0 && (
                        <div style={{ display: 'flex', gap: 3, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                          {entry.emotions.slice(0, 4).map(e => (
                            <span key={e} style={{ width: 5, height: 5, borderRadius: '50%', background: emotionColor(e), display: 'inline-block', flexShrink: 0 }} />
                          ))}
                          {entry.emotions.length > 4 && (
                            <span className="font-mono" style={{ fontSize: 7, color: 'var(--text-tertiary)' }}>+{entry.emotions.length - 4}</span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pinned new entry button */}
              <div style={{ padding: '6px 8px 10px', flexShrink: 0 }}>
                <button onClick={openAdd} className="w-full font-mono uppercase tracking-widest"
                  style={{ padding: '6px 0', fontSize: 8, borderRadius: 7, border: '1px dashed var(--bg-tertiary)', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', transition: 'all 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  New Entry
                </button>
              </div>
            </div>

            {/* Right panel — page content (uses CSS classes from themes.css) */}
            <div className="perspective-1000" style={{ flex: 1, position: 'relative', height: '100%' }}>

              <div className="preserve-3d" style={{ height: '100%' }}>
                <div
                  className={`relative rounded-l-lg transform-style-preserve-3d ${
                    isPageTurning
                      ? pageDirection === 'forward'
                        ? 'animate-page-turn-forward'
                        : 'animate-page-turn-backward'
                      : ''
                  }`}
                  style={{ background: 'var(--bg-primary)', height: '100%' }}
                >
                  {/* Bookmark ribbon */}
                  <div className="absolute top-0 right-6 z-20">
                    <div style={{ width: 18, height: 56, background: 'var(--accent-gold)', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                      <div style={{
                        position: 'absolute', bottom: -11, left: 0, width: 0, height: 0,
                        borderLeft: '9px solid var(--accent-gold)',
                        borderRight: '9px solid var(--accent-gold)',
                        borderBottom: '11px solid transparent',
                      }} />
                    </div>
                  </div>

                  {/* Vertical rule line */}
                  <div className="absolute" style={{ left: 24, top: 0, bottom: 0, width: 1, background: 'var(--accent-secondary)', opacity: 0.12, pointerEvents: 'none' }} />

                  {/* Paper wrinkle corner */}
                  <div className={`absolute bottom-4 right-4 w-14 h-14 pointer-events-none ${isPageTurning ? 'animate-paper-wrinkle' : ''}`}>
                    <div className="w-full h-full rounded-full transform rotate-45 opacity-20" style={{ background: 'var(--bg-tertiary)' }} />
                    <div className="absolute inset-2 rounded-full opacity-15" style={{ background: 'var(--accent-gold)', transform: 'rotate(-12deg)' }} />
                  </div>

                  {/* PAGE FRONT */}
                  <div className="page-front backface-hidden absolute inset-0 rounded-l-lg overflow-hidden"
                    style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Subtle paper gradient */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 rounded-l-lg"
                      style={{ background: 'linear-gradient(135deg, var(--accent-ai) 0%, transparent 50%, var(--accent-gold) 100%)' }} />

                    {selected ? (
                      <>
                        {/* ── Fixed header ── */}
                        <div className="relative z-10" style={{ flexShrink: 0, height: 78, padding: '0 40px 0 32px', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid var(--bg-tertiary)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                            <div>
                              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 5 }}>
                                {new Date(selected.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                              {selected.title && (
                                <h3 className="font-serif" style={{ fontSize: 22, color: 'var(--text-primary)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                                  {selected.title}
                                </h3>
                              )}
                            </div>
                            {/* Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, opacity: 0.3, transition: 'opacity 150ms' }}
                              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                              onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}>
                              <button onClick={() => openEdit(selected)} title="Edit"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px 4px' }}>
                                <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button onClick={() => setDeleting(selected)} title="Delete"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C47A7A', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
                                <svg width="17" height="17" viewBox="0 0 13 13" fill="none">
                                  <path d="M2 3.5h9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                                  <path d="M4.5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                                  <path d="M3 3.5l.6 6a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5.5 6v2.5M7.5 6v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ── Scrollable content ── */}
                        <div className="journal-page-scroll relative z-10" style={{ flex: 1, overflowY: 'auto', padding: '18px 40px 24px 32px' }}>
                          <div style={{ marginBottom: 24 }}>
                            {selected.content.split('\n').map((line, i) =>
                              line.trim()
                                ? <p key={i} className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.75, marginBottom: 6 }}>{line}</p>
                                : <div key={i} style={{ height: 6 }} />
                            )}
                          </div>

                          {selected.emotions.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 8, color: 'var(--text-tertiary)', marginBottom: 5 }}>Emotional State</p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {selected.emotions.map(e => (
                                  <span key={e} className="font-serif" style={{ fontSize: 12, padding: '1px 8px', borderRadius: 999, border: `1px solid ${emotionColor(e)}`, color: emotionColor(e) }}>{e}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {selected.tags.length > 0 && (
                            <div>
                              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 8, color: 'var(--text-tertiary)', marginBottom: 5 }}>Themes</p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {selected.tags.map(tag => (
                                  <span key={tag} className="font-serif"
                                    style={{ fontSize: 12, padding: '1px 8px', borderRadius: 999, border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)' }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="relative z-10 h-full flex items-center justify-center">
                        <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Select an entry to read</p>
                      </div>
                    )}
                  </div>

                  {/* PAGE BACK — lined paper shown during turn */}
                  <div className="page-back backface-hidden absolute inset-0 rounded-l-lg rotate-y-180" style={{ background: 'var(--bg-primary)' }}>
                    <div className="absolute inset-0 pointer-events-none opacity-5 rounded-l-lg"
                      style={{ background: 'linear-gradient(135deg, var(--accent-ai) 0%, transparent 50%, var(--accent-gold) 100%)' }} />
                    <div className="relative z-10 h-full flex flex-col justify-center opacity-5" style={{ padding: '24px 40px' }}>
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} style={{ width: '100%', height: 1, background: 'var(--text-tertiary)', marginBottom: 28 }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
