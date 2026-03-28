'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useGetInteractionsQuery,
  useCreateInteractionMutation,
  useUpdateInteractionMutation,
  useDeleteInteractionMutation,
  type Interaction,
  type CreateInteractionRequest,
  type InteractionType,
  type InteractionQuality,
} from '@/store/api/interactionsApi';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { TwoColumnModal } from '@/components/ui/TwoColumnModal';
import { SpeechTextarea } from '@/components/ui/SpeechTextarea';
import { TabFooter } from '@/components/ui/TabFooter';

interface Member { id: string; fullName: string; [key: string]: any }
interface MemberInteractionsTabProps {
  member: Member;
  externalAddOpen?: boolean;
  onExternalAddClose?: () => void;
  onCountChange?: (count: number) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const TYPES: { value: InteractionType; label: string; color: string }[] = [
  { value: 'in-person', label: 'In Person', color: 'var(--accent-primary)' },
  { value: 'call',      label: 'Call',      color: 'var(--accent-ai)' },
  { value: 'text',      label: 'Text',      color: '#7FA87A' },
  { value: 'video',     label: 'Video',     color: '#C4A87A' },
  { value: 'email',     label: 'Email',     color: 'var(--accent-secondary)' },
  { value: 'social',    label: 'Social',    color: '#A87AC4' },
];

const QUALITIES: { value: InteractionQuality; label: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', color: '#7FA87A' },
  { value: 'good',      label: 'Good',      color: 'var(--accent-primary)' },
  { value: 'neutral',   label: 'Neutral',   color: 'var(--text-tertiary)' },
  { value: 'poor',      label: 'Poor',      color: '#C4A87A' },
  { value: 'difficult', label: 'Difficult', color: '#C47A7A' },
];


function typeColor(t?: string | null) {
  return TYPES.find(x => x.value === t)?.color ?? 'var(--accent-primary)';
}
function qualityColor(q?: string | null) {
  return QUALITIES.find(x => x.value === q)?.color ?? 'var(--text-tertiary)';
}
function energyColor(n?: number | null) {
  if (!n) return 'var(--text-tertiary)';
  if (n >= 8) return '#7FA87A';
  if (n >= 5) return 'var(--accent-primary)';
  if (n >= 3) return '#C4A87A';
  return '#C47A7A';
}

// ── Mood select ──────────────────────────────────────────────────────────────

const MOOD_OPTIONS = ['Calm','Happy','Energized','Excited','Connected','Hopeful','Neutral','Tired','Anxious','Frustrated','Drained','Sad','Distant','Overwhelmed'];

function MoodSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>{label}</p>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full font-mono"
        style={{
          fontSize: 11, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
          background: 'var(--bg-secondary)', border: `1px solid ${open ? 'var(--accent-primary)' : 'var(--bg-tertiary)'}`,
          color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'border-color 150ms',
        }}
      >
        <span>{value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Not recorded'}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="font-mono"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
            background: 'var(--bg-primary)', border: '1px solid var(--bg-tertiary)',
            borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          {/* Scrollable list — short height */}
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className="w-full font-mono uppercase tracking-widest"
              style={{
                fontSize: 9, padding: '8px 10px', textAlign: 'left', background: 'none', border: 'none',
                cursor: 'pointer', display: 'block', width: '100%',
                color: !value ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                borderBottom: '1px solid var(--bg-tertiary)',
              }}>
              Not recorded
            </button>
            {MOOD_OPTIONS.map(m => (
              <button key={m} type="button" onClick={() => { onChange(m.toLowerCase()); setOpen(false); }}
                className="w-full font-mono"
                style={{
                  fontSize: 11, padding: '7px 10px', textAlign: 'left', border: 'none',
                  cursor: 'pointer', display: 'block', width: '100%',
                  color: value === m.toLowerCase() ? 'var(--accent-primary)' : 'var(--text-primary)',
                  background: value === m.toLowerCase() ? 'var(--bg-secondary)' : 'transparent',
                } as React.CSSProperties}
                onMouseEnter={e => { if (value !== m.toLowerCase()) (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={e => { if (value !== m.toLowerCase()) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Interaction modal ─────────────────────────────────────────────────────────

interface ModalForm {
  title: string;
  description: string;
  date: string;
  type: InteractionType;
  duration: string;
  quality: InteractionQuality;
  moodBefore: string;
  moodAfter: string;
  energyLevel: number;
  topics: string;
  tags: string;
}

const EMPTY_FORM: ModalForm = {
  title: '', description: '',
  date: new Date().toISOString().split('T')[0],
  type: 'in-person', duration: '', quality: 'good',
  moodBefore: '', moodAfter: '', energyLevel: 6,
  topics: '', tags: '',
};

function InteractionModal({ isOpen, editing, onClose, onSave, saving }: {
  isOpen: boolean;
  editing: Interaction | null;
  onClose: () => void;
  onSave: (payload: CreateInteractionRequest) => Promise<void>;
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
        type:        (editing.type    ?? 'in-person') as InteractionType,
        duration:    editing.duration ?? '',
        quality:     (editing.quality ?? 'good') as InteractionQuality,
        moodBefore:  editing.moodBefore ?? '',
        moodAfter:   editing.moodAfter  ?? '',
        energyLevel: editing.energyLevel ?? 6,
        topics:      editing.topics.join(', '),
        tags:        editing.tags.join(', '),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [isOpen, editing]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || saving) return;
    await onSave({
      title:       form.title.trim(),
      description: form.description.trim(),
      date:        form.date,
      type:        form.type,
      duration:    form.duration.trim() || undefined,
      quality:     form.quality,
      moodBefore:  form.moodBefore.trim() || undefined,
      moodAfter:   form.moodAfter.trim()  || undefined,
      energyLevel: form.energyLevel,
      topics:      form.topics.split(',').map(t => t.trim()).filter(Boolean),
      tags:        form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  const canSave = !!form.title.trim() && !!form.description.trim() && !saving;
  const tColor  = typeColor(form.type);

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

      {/* Duration */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>
          Duration <span style={{ opacity: 0.45, textTransform: 'none', letterSpacing: 0 }}>opt</span>
        </p>
        <input type="text" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
          placeholder="45 min, 2 hrs…" className="w-full font-mono"
          style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 10px', outline: 'none' }}
        />
      </div>

      {/* Type */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 6 }}>Type</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, type: t.value }))}
              className="font-mono uppercase tracking-widest"
              style={{
                fontSize: 8, padding: '3px 10px', borderRadius: 999, border: '1px solid', cursor: 'pointer',
                borderColor: form.type === t.value ? t.color : 'var(--bg-tertiary)',
                background:  form.type === t.value ? t.color : 'transparent',
                color:       form.type === t.value ? '#fff'  : 'var(--text-tertiary)',
                transition: 'all 140ms',
              }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>Quality</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 3, background: 'var(--bg-secondary)', borderRadius: 8 }}>
          {QUALITIES.map(q => (
            <button key={q.value} type="button" onClick={() => setForm(f => ({ ...f, quality: q.value }))}
              className="font-mono uppercase tracking-widest"
              style={{
                fontSize: 9, padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left',
                background: form.quality === q.value ? 'var(--bg-primary)' : 'transparent',
                color:      form.quality === q.value ? q.color             : 'var(--text-tertiary)',
                boxShadow:  form.quality === q.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 160ms',
              }}>{q.label}</button>
          ))}
        </div>
      </div>

      {/* Energy */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 8 }}>
          Energy <span style={{ color: energyColor(form.energyLevel) }}>{form.energyLevel}/10</span>
        </p>
        <input type="range" min={1} max={10} value={form.energyLevel}
          onChange={e => setForm(f => ({ ...f, energyLevel: Number(e.target.value) }))}
          style={{ width: '100%', accentColor: energyColor(form.energyLevel) }}
        />
        <div className="flex justify-between font-mono" style={{ fontSize: 8, color: 'var(--text-tertiary)', marginTop: 3 }}>
          <span>Drained</span><span>Energized</span>
        </div>
      </div>

      {/* Mood Before / After */}
      <MoodSelect value={form.moodBefore} onChange={v => setForm(f => ({ ...f, moodBefore: v }))} label="Mood Before" />
      <MoodSelect value={form.moodAfter}  onChange={v => setForm(f => ({ ...f, moodAfter: v }))}  label="Mood After" />

      {/* Topics */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>
          Topics <span style={{ opacity: 0.45, textTransform: 'none', letterSpacing: 0 }}>comma sep</span>
        </p>
        <input type="text" value={form.topics} onChange={e => setForm(f => ({ ...f, topics: e.target.value }))}
          placeholder="work, family…" className="w-full font-mono"
          style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 10px', outline: 'none' }}
        />
      </div>

      {/* Tags */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>
          Tags <span style={{ opacity: 0.45, textTransform: 'none', letterSpacing: 0 }}>e.g. theme:trust</span>
        </p>
        <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          placeholder="theme:connection" className="w-full font-mono"
          style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 10px', outline: 'none' }}
        />
      </div>
    </>
  );

  const rightPanel = (
    <>
      {/* Title */}
      <div>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>Title</p>
        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Coffee catch-up, Quick check-in…" className="w-full font-serif"
          style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '9px 12px', outline: 'none' }}
        />
      </div>

      {/* Description */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>What Happened</p>
        <SpeechTextarea
          value={form.description}
          onChange={v => setForm(f => ({ ...f, description: v }))}
          placeholder="How did it go? What was discussed? How did it feel?"
          minHeight={260}
          accentColor={tColor}
        />
      </div>
    </>
  );

  return (
    <TwoColumnModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      header={editing ? 'Edit Interaction' : 'Log an Interaction'}
      saveLabel={editing ? 'Save Changes' : 'Log It'}
      saveColor={tColor}
      canSave={canSave}
      saving={saving}
      left={leftPanel}
      right={rightPanel}
    />
  );
}

// ── Main Tab ─────────────────────────────────────────────────────────────────

export function MemberInteractionsTab({ member, externalAddOpen, onExternalAddClose, onCountChange }: MemberInteractionsTabProps) {
  const [modalOpen, setModalOpen]        = useState(false);
  const [editing, setEditing]            = useState<Interaction | null>(null);
  const [deletingItem, setDeletingItem]  = useState<Interaction | null>(null);

  useEffect(() => {
    if (externalAddOpen) {
      setEditing(null);
      setModalOpen(true);
      onExternalAddClose?.();
    }
  }, [externalAddOpen, onExternalAddClose]);

  const { data, isLoading, isError } = useGetInteractionsQuery({ memberId: member.id });
  const [createInteraction, { isLoading: creating }] = useCreateInteractionMutation();
  const [updateInteraction, { isLoading: updating }] = useUpdateInteractionMutation();
  const [deleteInteraction, { isLoading: deleting }] = useDeleteInteractionMutation();

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (i: Interaction) => { setEditing(i); setModalOpen(true); };

  const handleSave = async (payload: CreateInteractionRequest) => {
    if (editing) {
      await updateInteraction({ memberId: member.id, id: editing.id, data: payload });
    } else {
      await createInteraction({ memberId: member.id, ...payload });
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    await deleteInteraction({ memberId: member.id, id: deletingItem.id });
    setDeletingItem(null);
  };

  const interactions = data?.data ?? [];

  useEffect(() => { if (data) onCountChange?.(interactions.length); }, [data, interactions.length]);

  // Summary stats
  const avgEnergy = interactions.length
    ? (interactions.reduce((s, i) => s + (i.energyLevel ?? 5), 0) / interactions.length).toFixed(1)
    : '—';
  const positiveCount = interactions.filter(i => i.quality === 'excellent' || i.quality === 'good').length;
  const inPersonCount = interactions.filter(i => i.type === 'in-person').length;

  if (isLoading) return (
    <div className="flex items-center justify-center px-8 pt-8">
      <p className="font-mono uppercase tracking-widest" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Loading interactions…</p>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center px-8 pt-8">
      <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Could not load interactions. Please try again.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <InteractionModal isOpen={modalOpen} editing={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} saving={creating || updating} />

      {deletingItem && (
        <ConfirmDeleteModal
          title="Remove Interaction"
          itemLabel={deletingItem.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingItem(null)}
          deleting={deleting}
        />
      )}

      <div className="flex-1 overflow-y-auto min-h-0 px-8 pt-8">
        {interactions.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>No interactions logged yet</p>
            <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>
              Start tracking your communications with {member.fullName} and how they affect your energy.
            </p>
            <button onClick={openAdd} className="font-mono uppercase tracking-widest"
              style={{ fontSize: 10, padding: '9px 20px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Log First Interaction
            </button>
          </div>
        ) : (
          /* ── List ── */
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {interactions.map((interaction, index) => {
              const tCol = typeColor(interaction.type);
              const qCol = qualityColor(interaction.quality);
              const eCol = energyColor(interaction.energyLevel);
              return (
                <div key={interaction.id}>
                  <div className="flex items-start gap-4">
                    {/* Dot */}
                    <div style={{ flexShrink: 0, width: 10, height: 10, borderRadius: '50%', background: tCol, marginTop: 11 }} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title row — icons inline */}
                      <div className="flex items-center justify-between gap-4" style={{ marginBottom: 5 }}>
                        <p className="font-serif" style={{ fontSize: 20, color: 'var(--text-primary)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
                          {interaction.title}
                          {interaction.duration && <span className="font-mono" style={{ fontSize: 13, color: 'var(--text-tertiary)', marginLeft: 10 }}>· {interaction.duration}</span>}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0" style={{ opacity: 0.4, transition: 'opacity 150ms' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}>
                          <button onClick={() => openEdit(interaction)} title="Edit"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px 4px' }}>
                            <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeletingItem(interaction)} title="Remove"
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
                      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 10 }}>
                        <span className="font-mono" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                          {new Date(interaction.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {interaction.type && (
                          <span className="font-serif" style={{ fontSize: 14, color: tCol, textTransform: 'capitalize' }}>
                            {TYPES.find(t => t.value === interaction.type)?.label ?? interaction.type}
                          </span>
                        )}
                        {interaction.quality && (
                          <span className="font-serif" style={{ fontSize: 14, color: qCol, textTransform: 'capitalize' }}>
                            {interaction.quality}
                          </span>
                        )}
                        {interaction.energyLevel != null && (
                          <span className="font-mono" style={{ fontSize: 13, color: eCol }}>
                            {interaction.energyLevel}/10
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.65, marginBottom: (interaction.moodBefore || interaction.moodAfter || interaction.topics.length) ? 14 : 0 }}>
                        {interaction.description}
                      </p>

                      {/* Mood before/after */}
                      {(interaction.moodBefore || interaction.moodAfter) && (
                        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 12 }}>
                          {interaction.moodBefore && (
                            <div style={{ paddingLeft: 10, borderLeft: '2px solid var(--accent-secondary)' }}>
                              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--accent-secondary)', marginBottom: 3 }}>Mood Before</p>
                              <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{interaction.moodBefore}</p>
                            </div>
                          )}
                          {interaction.moodAfter && (
                            <div style={{ paddingLeft: 10, borderLeft: '2px solid var(--accent-ai)' }}>
                              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--accent-ai)', marginBottom: 3 }}>Mood After</p>
                              <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{interaction.moodAfter}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Topics */}
                      {interaction.topics.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: interaction.tags.length ? 6 : 0 }}>
                          <span className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Topics:</span>
                          <span className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)' }}>{interaction.topics.join(', ')}</span>
                        </div>
                      )}

                      {/* Tags */}
                      {interaction.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 4 }}>
                          {interaction.tags.map(tag => (
                            <span key={tag} className="font-serif"
                              style={{ fontSize: 13, padding: '2px 9px', borderRadius: 999, border: '1px solid var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {index < interactions.length - 1 && (
                    <DottedDivider style={{ marginLeft: 15, marginTop: 20, marginBottom: 20 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {interactions.length > 0 && (
        <TabFooter
          stats={[
            { val: interactions.length, label: 'Total',      color: 'var(--text-primary)' },
            { val: positiveCount,        label: 'Positive',   color: '#7FA87A' },
            { val: inPersonCount,        label: 'In Person',  color: 'var(--accent-primary)' },
            { val: avgEnergy,            label: 'Avg Energy', color: energyColor(Number(avgEnergy)) },
          ]}
          tagline="How often you show up for someone quietly defines the depth of what you share."
        />
      )}
    </div>
  );
}
