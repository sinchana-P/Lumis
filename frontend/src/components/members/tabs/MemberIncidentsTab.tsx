'use client';

import { useState, useRef, useEffect } from 'react';
import {
  useGetIncidentsQuery,
  useCreateIncidentMutation,
  useUpdateIncidentMutation,
  useDeleteIncidentMutation,
  type Incident,
  type CreateIncidentRequest,
  type IncidentCategory,
  type IncidentSeverity,
} from '@/store/api/incidentsApi';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { DottedDivider } from '@/components/ui/DottedDivider';

interface Member { id: string; fullName: string; [key: string]: any }
interface MemberIncidentsTabProps {
  member: Member;
  /** Set to true by the parent page's header button to open the add modal */
  externalAddOpen?: boolean;
  onExternalAddClose?: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: IncidentCategory; label: string; color: string }[] = [
  { value: 'milestone',    label: 'Milestone',    color: 'var(--accent-ai)' },
  { value: 'celebration',  label: 'Celebration',  color: '#7FA87A' },
  { value: 'breakthrough', label: 'Breakthrough', color: 'var(--accent-gold)' },
  { value: 'challenge',    label: 'Challenge',    color: '#C4A87A' },
  { value: 'conflict',     label: 'Conflict',     color: '#C47A7A' },
];

const SEVERITIES: { value: IncidentSeverity; label: string; sub: string }[] = [
  { value: 'low',    label: 'Light',    sub: 'minor ripple'      },
  { value: 'medium', label: 'Moderate', sub: 'noticeable shift'  },
  { value: 'high',   label: 'Deep',     sub: 'significant impact'},
];

const EMOTION_TAGS = ['joyful', 'safe', 'loved', 'energized', 'peaceful', 'anxious', 'frustrated', 'drained', 'confused', 'hurt'];

function categoryColor(cat?: string | null) {
  return CATEGORIES.find(c => c.value === cat)?.color ?? 'var(--text-tertiary)';
}

// ── Mic button ───────────────────────────────────────────────────────────────

function MicButton({ onTranscript }: { onTranscript: (t: string) => void }) {
  const [listening, setListening] = useState(false);
  const ref = useRef<any>(null);

  const toggle = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (listening) { ref.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US';
    rec.onresult = (e: any) => { onTranscript(e.results[0][0].transcript); setListening(false); };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
    ref.current = rec; rec.start(); setListening(true);
  };

  return (
    <button type="button" onClick={toggle} title={listening ? 'Stop' : 'Speak'}
      style={{
        position: 'absolute', bottom: 10, right: 10, width: 28, height: 28,
        borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: listening ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
        color: listening ? '#fff' : 'var(--text-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 200ms, color 200ms',
      }}>
      {listening
        ? <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
        : <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
          </svg>}
    </button>
  );
}

// ── Incident modal (add + edit) ───────────────────────────────────────────────

interface ModalForm {
  title: string;
  description: string;
  date: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  outcome: string;
  emotions: string[];
  tags: string;
}

const EMPTY_FORM: ModalForm = {
  title: '', description: '', date: new Date().toISOString().split('T')[0],
  category: 'milestone', severity: 'medium', outcome: '', emotions: [], tags: '',
};

function IncidentModal({ isOpen, editing, onClose, onSave, saving }: {
  isOpen: boolean;
  editing: Incident | null;
  onClose: () => void;
  onSave: (payload: CreateIncidentRequest) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState<ModalForm>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({
        title:       editing.title,
        description: editing.description,
        date:        editing.date,
        category:    (editing.category ?? 'milestone') as IncidentCategory,
        severity:    (editing.severity ?? 'medium') as IncidentSeverity,
        outcome:     editing.outcome ?? '',
        emotions:    editing.emotions ?? [],
        tags:        editing.tags.join(', '),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [isOpen, editing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleEmotion = (tag: string) =>
    setForm(f => ({ ...f, emotions: f.emotions.includes(tag) ? f.emotions.filter(e => e !== tag) : [...f.emotions, tag] }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || saving) return;
    const tagList = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    await onSave({
      title:       form.title.trim(),
      description: form.description.trim(),
      date:        form.date,
      category:    form.category,
      severity:    form.severity,
      outcome:     form.outcome.trim() || undefined,
      emotions:    form.emotions,
      tags:        tagList,
    });
  };

  const canSave = !!form.title.trim() && !!form.description.trim() && !saving;
  const catColor = categoryColor(form.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="relative w-full scrollbar-thin overflow-y-auto" style={{ maxWidth: 460, maxHeight: '92vh', background: 'var(--bg-primary)', border: '1px solid var(--bg-tertiary)', borderRadius: 16, boxShadow: '0 20px 48px rgba(0,0,0,0.12)', padding: '24px 24px 20px' }}>

        {/* Header */}
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 20 }}>
          {editing ? 'Edit Incident' : 'Chronicle a Moment'}
        </p>

        <div style={{ height: 1, background: 'var(--bg-tertiary)', marginBottom: 20 }} />

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>What Happened</p>
          <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="A brief, honest title…" className="w-full font-serif"
            style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '9px 12px', outline: 'none' }}
          />
        </div>

        {/* Date + Severity row */}
        <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
          <div>
            <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>When</p>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full font-mono"
              style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '9px 12px', outline: 'none' }}
            />
          </div>
          <div>
            <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>Weight</p>
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              {SEVERITIES.map(s => (
                <button key={s.value} type="button" onClick={() => setForm(f => ({ ...f, severity: s.value }))}
                  className="font-mono uppercase tracking-widest"
                  style={{
                    flex: 1, fontSize: 9, padding: '5px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: form.severity === s.value ? 'var(--bg-primary)' : 'transparent',
                    color: form.severity === s.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: form.severity === s.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 180ms',
                  }}>{s.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8 }}>Nature</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(c => (
              <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, category: c.value }))}
                className="font-mono uppercase tracking-widest"
                style={{
                  fontSize: 9, padding: '4px 12px', borderRadius: 999, border: '1px solid', cursor: 'pointer',
                  borderColor: form.category === c.value ? c.color : 'var(--bg-tertiary)',
                  background: form.category === c.value ? c.color : 'transparent',
                  color: form.category === c.value ? '#fff' : 'var(--text-tertiary)',
                  transition: 'all 150ms',
                }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>The Full Story</p>
          <div style={{ position: 'relative' }}>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What happened? How did it make you feel? Be honest with yourself…"
              rows={4} className="w-full font-serif"
              style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '10px 40px 10px 12px', resize: 'none', outline: 'none', lineHeight: 1.55 }}
            />
            <MicButton onTranscript={t => setForm(f => ({ ...f, description: f.description ? f.description + ' ' + t : t }))} />
          </div>
        </div>

        {/* Emotions */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8 }}>Emotions</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EMOTION_TAGS.map(tag => (
              <button key={tag} type="button" onClick={() => toggleEmotion(tag)}
                className="font-mono uppercase tracking-widest"
                style={{
                  fontSize: 9, padding: '4px 10px', borderRadius: 999, border: '1px solid', cursor: 'pointer',
                  borderColor: form.emotions.includes(tag) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  background: form.emotions.includes(tag) ? 'var(--accent-primary)' : 'transparent',
                  color: form.emotions.includes(tag) ? '#fff' : 'var(--text-tertiary)',
                  transition: 'all 150ms',
                }}>{tag}</button>
            ))}
          </div>
        </div>

        {/* Outcome */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>
            Resolution <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>— optional</span>
          </p>
          <div style={{ position: 'relative' }}>
            <textarea value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}
              placeholder="How was it resolved? What did you learn?"
              rows={2} className="w-full font-serif"
              style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '10px 40px 10px 12px', resize: 'none', outline: 'none', lineHeight: 1.55 }}
            />
            <MicButton onTranscript={t => setForm(f => ({ ...f, outcome: f.outcome ? f.outcome + ' ' + t : t }))} />
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>
            Tags <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>— e.g. theme:trust, context:work</span>
          </p>
          <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="theme:conflict, context:social" className="w-full font-mono"
            style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 10px', outline: 'none' }}
          />
        </div>

        {/* Actions — Cancel LEFT, Save RIGHT */}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="font-mono uppercase tracking-widest"
            style={{ flex: 1, padding: '9px 0', fontSize: 10, borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={!canSave} className="font-mono uppercase tracking-widest"
            style={{
              flex: 1, padding: '9px 0', fontSize: 10, borderRadius: 8, border: 'none',
              cursor: canSave ? 'pointer' : 'default',
              background: canSave ? catColor : 'var(--bg-tertiary)',
              color: canSave ? '#fff' : 'var(--text-tertiary)',
              transition: 'background 200ms',
            }}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Chronicle It'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Tab ─────────────────────────────────────────────────────────────────

export function MemberIncidentsTab({ member, externalAddOpen, onExternalAddClose }: MemberIncidentsTabProps) {
  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState<Incident | null>(null);
  const [deletingIncident, setDeleting] = useState<Incident | null>(null);

  // Sync external trigger from header button
  useEffect(() => {
    if (externalAddOpen) {
      setEditing(null);
      setModalOpen(true);
      onExternalAddClose?.();
    }
  }, [externalAddOpen, onExternalAddClose]);

  const { data, isLoading, isError } = useGetIncidentsQuery({ memberId: member.id });
  const [createIncident, { isLoading: creating }] = useCreateIncidentMutation();
  const [updateIncident, { isLoading: updating }] = useUpdateIncidentMutation();
  const [deleteIncident, { isLoading: deleting }] = useDeleteIncidentMutation();

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (i: Incident) => { setEditing(i); setModalOpen(true); };

  const handleSave = async (payload: CreateIncidentRequest) => {
    if (editing) {
      await updateIncident({ memberId: member.id, id: editing.id, data: payload });
    } else {
      await createIncident({ memberId: member.id, ...payload });
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingIncident) return;
    await deleteIncident({ memberId: member.id, id: deletingIncident.id });
    setDeleting(null);
  };

  const incidents = data?.data ?? [];

  // Summary counts
  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.value] = incidents.filter(i => i.category === c.value).length;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) return (
    <div className="flex items-center justify-center" style={{ paddingTop: 40 }}>
      <p className="font-mono uppercase tracking-widest" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Loading incidents…</p>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center" style={{ paddingTop: 40 }}>
      <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Could not load incidents. Please try again.</p>
    </div>
  );

  return (
    <div className="w-full">
      <IncidentModal isOpen={modalOpen} editing={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} saving={creating || updating} />

      {deletingIncident && (
        <ConfirmDeleteModal
          title="Remove Incident"
          itemLabel={deletingIncident.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleting(null)}
          deleting={deleting}
        />
      )}

      {incidents.length === 0 ? (
        /* ── Empty state ── */
        <div style={{ paddingTop: 40, textAlign: 'center' }}>
          <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>Your story begins here</p>
          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>
            Start chronicling the moments that shaped your connection with {member.fullName}.
          </p>
          <button onClick={openAdd} className="font-mono uppercase tracking-widest"
            style={{ fontSize: 10, padding: '9px 20px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Chronicle a Moment
          </button>
        </div>
      ) : (
        <>
          {/* ── Header row ── */}
          <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
            <span className="font-mono uppercase tracking-widest" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              {incidents.length} moment{incidents.length !== 1 ? 's' : ''}
            </span>
            <button onClick={openAdd} className="font-mono uppercase tracking-widest"
              style={{ fontSize: 10, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              + Add
            </button>
          </div>

          {/* ── Timeline ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {incidents.map((incident, index) => {
              const color = categoryColor(incident.category);
              return (
                <div key={incident.id}>
                  <div className="flex items-start gap-5">
                    {/* Dot */}
                    <div style={{ flexShrink: 0, width: 10, height: 10, borderRadius: '50%', background: color, marginTop: 5 }} />

                    {/* Content */}
                    <div className="flex-1 min-w-0" style={{ paddingBottom: 28 }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 400, marginBottom: 4, lineHeight: 1.4 }}>
                            {incident.title}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 10 }}>
                            <span className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                              {new Date(incident.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            {incident.category && (
                              <span className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color }}>
                                {incident.category}
                              </span>
                            )}
                            {incident.severity && (
                              <span className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                                {incident.severity}
                              </span>
                            )}
                          </div>

                          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: incident.outcome ? 12 : 0 }}>
                            {incident.description}
                          </p>

                          {incident.outcome && (
                            <div style={{ paddingLeft: 12, borderLeft: `2px solid ${color}`, marginBottom: 10 }}>
                              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color, marginBottom: 4 }}>Resolution</p>
                              <p className="font-serif" style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.55 }}>{incident.outcome}</p>
                            </div>
                          )}

                          {incident.emotions.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: incident.tags?.length ? 6 : 0 }}>
                              <span className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Emotions:</span>
                              <span className="font-serif" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{incident.emotions.join(', ')}</span>
                            </div>
                          )}

                          {incident.tags?.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 4 }}>
                              {incident.tags.map(tag => (
                                <span key={tag} className="font-mono uppercase tracking-widest"
                                  style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, border: '1px solid var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Row actions */}
                        <div className="flex items-center gap-1 flex-shrink-0" style={{ opacity: 0.35, transition: 'opacity 150ms' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0.35')}>
                          <button onClick={() => openEdit(incident)} title="Edit"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px 4px' }}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleting(incident)} title="Remove"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C47A7A', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <path d="M2 3.5h9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                              <path d="M4.5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                              <path d="M3 3.5l.6 6a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M5.5 6v2.5M7.5 6v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dashed divider between items */}
                  {index < incidents.length - 1 && (
                    <DottedDivider style={{ marginLeft: 15, marginTop: -20, marginBottom: 8 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Summary strip ── */}
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--bg-tertiary)' }}>
            <div className="grid grid-cols-5 gap-4">
              {CATEGORIES.map(c => (
                <div key={c.value} className="text-center">
                  <div className="font-serif font-light" style={{ fontSize: 22, color: c.color, marginBottom: 2 }}>{counts[c.value]}</div>
                  <div className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
