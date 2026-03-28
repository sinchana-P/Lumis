'use client';

import { useState, useEffect } from 'react';
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
import { TwoColumnModal } from '@/components/ui/TwoColumnModal';
import { SpeechTextarea } from '@/components/ui/SpeechTextarea';
import { TabFooter } from '@/components/ui/TabFooter';

interface Member { id: string; fullName: string; [key: string]: any }
interface MemberIncidentsTabProps {
  member: Member;
  /** Set to true by the parent page's header button to open the add modal */
  externalAddOpen?: boolean;
  onExternalAddClose?: () => void;
  onCountChange?: (count: number) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: IncidentCategory; label: string; color: string; bg: string }[] = [
  { value: 'milestone',    label: 'Milestone',    color: 'var(--accent-ai)',        bg: 'var(--accent-ai-light)' },
  { value: 'celebration',  label: 'Celebration',  color: 'var(--accent-primary)',   bg: 'var(--accent-primary-light)' },
  { value: 'breakthrough', label: 'Breakthrough', color: 'var(--accent-gold)',      bg: 'var(--accent-gold-light)' },
  { value: 'challenge',    label: 'Challenge',    color: 'var(--accent-secondary)', bg: 'var(--accent-secondary-light)' },
  { value: 'conflict',     label: 'Conflict',     color: 'var(--accent-secondary)', bg: 'var(--accent-secondary-light)' },
];

const SEVERITIES: { value: IncidentSeverity; label: string; sub: string }[] = [
  { value: 'low',    label: 'Light',    sub: 'minor ripple'      },
  { value: 'medium', label: 'Moderate', sub: 'noticeable shift'  },
  { value: 'high',   label: 'Deep',     sub: 'significant impact'},
];

const EMOTION_TAGS = ['joyful', 'safe', 'loved', 'energized', 'peaceful', 'anxious', 'frustrated', 'drained', 'confused', 'hurt'];

function categoryMeta(cat?: string | null) {
  return CATEGORIES.find(c => c.value === cat) ?? { color: 'var(--text-tertiary)', bg: 'var(--surface)' };
}

function categoryColor(cat?: string | null) {
  return categoryMeta(cat).color;
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

  const canSave  = !!form.title.trim() && !!form.description.trim() && !saving;
  const catColor = categoryColor(form.category);

  const leftPanel = (
    <>
      {/* Date */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>When</p>
        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          className="w-full font-mono"
          style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 10px', outline: 'none' }}
        />
      </div>

      {/* Severity */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>Weight</p>
        <div style={{ display: 'flex', gap: 3, padding: 3, background: 'var(--bg-secondary)', borderRadius: 8 }}>
          {SEVERITIES.map(s => (
            <button key={s.value} type="button" onClick={() => setForm(f => ({ ...f, severity: s.value }))}
              className="font-mono uppercase tracking-widest"
              style={{
                flex: 1, fontSize: 9, padding: '5px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: form.severity === s.value ? 'var(--bg-primary)' : 'transparent',
                color:      form.severity === s.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow:  form.severity === s.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 160ms',
              }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 6 }}>Nature</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {CATEGORIES.map(c => (
            <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, category: c.value }))}
              className="font-mono uppercase tracking-widest"
              style={{
                fontSize: 8, padding: '3px 10px', borderRadius: 999, border: '1px solid', cursor: 'pointer',
                borderColor: form.category === c.value ? c.color : 'var(--bg-tertiary)',
                background:  form.category === c.value ? c.color : 'transparent',
                color:       form.category === c.value ? '#fff'  : 'var(--text-tertiary)',
                transition: 'all 140ms',
              }}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Emotions */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 6 }}>Emotions</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {EMOTION_TAGS.map(tag => (
            <button key={tag} type="button" onClick={() => toggleEmotion(tag)}
              className="font-mono uppercase tracking-widest"
              style={{
                fontSize: 8, padding: '3px 9px', borderRadius: 999, border: '1px solid', cursor: 'pointer',
                borderColor: form.emotions.includes(tag) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                background:  form.emotions.includes(tag) ? 'var(--accent-primary)' : 'transparent',
                color:       form.emotions.includes(tag) ? '#fff' : 'var(--text-tertiary)',
                transition: 'all 140ms',
              }}>{tag}</button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>
          Tags <span style={{ opacity: 0.45, textTransform: 'none', letterSpacing: 0 }}>e.g. theme:trust</span>
        </p>
        <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          placeholder="theme:conflict, context:social" className="w-full font-mono"
          style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 10px', outline: 'none' }}
        />
      </div>
    </>
  );

  const rightPanel = (
    <>
      {/* Title */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>What Happened</p>
        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="A brief, honest title…" className="w-full font-serif"
          style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '9px 12px', outline: 'none' }}
        />
      </div>

      {/* Description */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>The Full Story</p>
        <SpeechTextarea
          value={form.description}
          onChange={v => setForm(f => ({ ...f, description: v }))}
          placeholder="What happened? How did it make you feel? Be honest with yourself…"
          minHeight={160}
          accentColor={catColor}
        />
      </div>

      {/* Resolution */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>
          Resolution <span style={{ opacity: 0.45, textTransform: 'none', letterSpacing: 0 }}>— optional</span>
        </p>
        <SpeechTextarea
          value={form.outcome}
          onChange={v => setForm(f => ({ ...f, outcome: v }))}
          placeholder="How was it resolved? What did you learn?"
          rows={3}
          accentColor={catColor}
        />
      </div>
    </>
  );

  return (
    <TwoColumnModal
      isOpen={isOpen} onClose={onClose} onSave={handleSave}
      header={editing ? 'Edit Incident' : 'Chronicle a Moment'}
      saveLabel={saving ? 'Saving…' : editing ? 'Save Changes' : 'Chronicle It'}
      saveColor={catColor} canSave={canSave} saving={saving}
      left={leftPanel} right={rightPanel}
    />
  );
}

// ── Main Tab ─────────────────────────────────────────────────────────────────

export function MemberIncidentsTab({ member, externalAddOpen, onExternalAddClose, onCountChange }: MemberIncidentsTabProps) {
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

  useEffect(() => {
    if (data) onCountChange?.(incidents.length);
  }, [data, incidents.length]);

  // Summary counts
  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.value] = incidents.filter(i => i.category === c.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Modal always rendered so header button always works */}
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

      <div className="flex-1 overflow-y-auto min-h-0 px-8 pt-8">
        {isLoading && (
          <div className="flex items-center justify-center">
            <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-tertiary)' }}>Loading incidents…</p>
          </div>
        )}
        {isError && !isLoading && (
          <div style={{ textAlign: 'center' }}>
            <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-tertiary)', marginBottom: 20 }}>Could not load incidents. Please try again.</p>
            <button onClick={openAdd} className="font-mono uppercase tracking-widest"
              style={{ fontSize: 10, padding: '9px 20px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Log Anyway
            </button>
          </div>
        )}

        {!isLoading && !isError && (incidents.length === 0 ? (
          /* ── Empty state ── */
          <div style={{ textAlign: 'center' }}>
            <p className="font-serif" style={{ fontSize: 17, color: 'var(--text-primary)', marginBottom: 6, fontWeight: 400, letterSpacing: '-0.01em' }}>Your story begins here</p>
            <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-tertiary)', marginBottom: 24 }}>
              Start chronicling the moments that shaped your connection with {member.fullName}.
            </p>
            <button onClick={openAdd} style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', padding: '9px 20px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Chronicle a Moment
            </button>
          </div>
        ) : (
          /* ── Timeline ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {incidents.map((incident, index) => {
              const { color, bg } = categoryMeta(incident.category);
              return (
                <div key={incident.id}>
                  <div className="flex items-start gap-4">
                    {/* Dot — aligned to title baseline */}
                    <div style={{ flexShrink: 0, width: 10, height: 10, borderRadius: '50%', background: color, marginTop: 11 }} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title row — icons inline with title */}
                      <div className="flex items-center justify-between gap-4" style={{ marginBottom: 5 }}>
                        <p className="font-serif" style={{ fontSize: 20, color: 'var(--text-primary)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
                          {incident.title}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0" style={{ opacity: 0.4, transition: 'opacity 150ms' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}>
                          <button onClick={() => openEdit(incident)} title="Edit"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px 4px' }}>
                            <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleting(incident)} title="Remove"
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

                      {/* Metadata row */}
                      <div className="flex items-center gap-4" style={{ marginBottom: 10 }}>
                        <span className="font-mono flex items-center gap-1.5" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="2" width="10" height="9" rx="1.5" />
                            <path d="M1 5h10M4 1v2M8 1v2" />
                          </svg>
                          {new Date(incident.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {incident.category && (
                          <span
                            className="font-sans capitalize"
                            style={{ fontSize: 13, color: 'var(--text-primary)', background: bg, padding: '2px 10px', borderRadius: 99, letterSpacing: '0.01em' }}
                          >
                            {incident.category}
                          </span>
                        )}
                        {incident.severity && (
                          <span className="font-sans capitalize" style={{ fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-tertiary)', padding: '2px 10px', borderRadius: 99, letterSpacing: '0.01em' }}>
                            {incident.severity}
                          </span>
                        )}
                      </div>

                      <p className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.65, marginBottom: incident.outcome ? 14 : 0 }}>
                        {incident.description}
                      </p>

                      {incident.outcome && (
                        <div style={{ paddingLeft: 12, borderLeft: `2px solid ${color}`, marginBottom: 12 }}>
                          <p className="font-serif" style={{ fontSize: 13, color, marginBottom: 4, fontStyle: 'italic' }}>Resolution</p>
                          <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6 }}>{incident.outcome}</p>
                        </div>
                      )}

                      {incident.emotions.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: incident.tags?.length ? 6 : 0 }}>
                          <span className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Felt:</span>
                          <span className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>{incident.emotions.join(', ')}</span>
                        </div>
                      )}

                      {incident.tags?.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 4 }}>
                          {incident.tags.map(tag => (
                            <span key={tag} className="font-serif"
                              style={{ fontSize: 13, padding: '2px 9px', borderRadius: 999, border: '1px solid var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dashed divider between items */}
                  {index < incidents.length - 1 && (
                    <DottedDivider style={{ marginLeft: 15, marginTop: 20, marginBottom: 20 }} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {!isLoading && !isError && incidents.length > 0 && (
        <TabFooter
          stats={CATEGORIES.map(c => ({ val: counts[c.value], label: c.label, color: c.color }))}
          tagline="Every moment — difficult or beautiful — is a thread in the story of this relationship."
        />
      )}
    </div>
  );
}
