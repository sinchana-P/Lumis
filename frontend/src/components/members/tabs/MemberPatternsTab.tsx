'use client';

import { useState, useRef, useEffect } from 'react';
import {
  useGetPatternsQuery,
  useCreatePatternMutation,
  useUpdatePatternMutation,
  useDeletePatternMutation,
  type Pattern,
  type CreatePatternRequest,
  type PatternCategory,
  type PatternFrequency,
  type PatternImpact,
} from '@/store/api/patternsApi';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { DottedDivider } from '@/components/ui/DottedDivider';

interface Member { id: string; fullName: string; [key: string]: any }
interface MemberPatternsTabProps {
  member: Member;
  externalAddOpen?: boolean;
  onExternalAddClose?: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: PatternCategory; label: string; color: string }[] = [
  { value: 'communication',  label: 'Communication',  color: 'var(--accent-primary)' },
  { value: 'conflict',       label: 'Conflict',       color: '#C47A7A' },
  { value: 'affection',      label: 'Affection',      color: '#7FA87A' },
  { value: 'decision-making',label: 'Decisions',      color: 'var(--accent-ai)' },
  { value: 'stress-response',label: 'Stress',         color: '#C4A87A' },
  { value: 'social',         label: 'Social',         color: 'var(--accent-secondary)' },
];

const FREQUENCIES: { value: PatternFrequency; label: string; sub: string }[] = [
  { value: 'rare',       label: 'Rare',       sub: 'seldom seen'    },
  { value: 'occasional', label: 'Occasional', sub: 'now and then'   },
  { value: 'frequent',   label: 'Frequent',   sub: 'happens often'  },
  { value: 'constant',   label: 'Constant',   sub: 'always present' },
];

const IMPACTS: { value: PatternImpact; label: string; color: string }[] = [
  { value: 'positive', label: 'Positive', color: '#7FA87A' },
  { value: 'neutral',  label: 'Neutral',  color: 'var(--text-tertiary)' },
  { value: 'negative', label: 'Negative', color: '#C47A7A' },
];

function categoryColor(cat?: string | null) {
  return CATEGORIES.find(c => c.value === cat)?.color ?? 'var(--text-tertiary)';
}

function impactColor(impact?: string | null) {
  return IMPACTS.find(i => i.value === impact)?.color ?? 'var(--text-tertiary)';
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

// ── Pattern modal (add + edit) ────────────────────────────────────────────────

interface ModalForm {
  title: string;
  description: string;
  category: PatternCategory;
  frequency: PatternFrequency;
  impact: PatternImpact;
  triggers: string;
  examples: string;
  tags: string;
}

const EMPTY_FORM: ModalForm = {
  title: '', description: '',
  category: 'communication', frequency: 'occasional', impact: 'neutral',
  triggers: '', examples: '', tags: '',
};

function PatternModal({ isOpen, editing, onClose, onSave, saving }: {
  isOpen: boolean;
  editing: Pattern | null;
  onClose: () => void;
  onSave: (payload: CreatePatternRequest) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState<ModalForm>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({
        title:       editing.title,
        description: editing.description,
        category:    (editing.category  ?? 'communication') as PatternCategory,
        frequency:   (editing.frequency ?? 'occasional')    as PatternFrequency,
        impact:      (editing.impact    ?? 'neutral')       as PatternImpact,
        triggers:    editing.triggers.join(', '),
        examples:    editing.examples.join('\n'),
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

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || saving) return;
    const triggerList = form.triggers.split(',').map(t => t.trim()).filter(Boolean);
    const exampleList = form.examples.split('\n').map(e => e.trim()).filter(Boolean);
    const tagList     = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    await onSave({
      title:       form.title.trim(),
      description: form.description.trim(),
      category:    form.category,
      frequency:   form.frequency,
      impact:      form.impact,
      triggers:    triggerList,
      examples:    exampleList,
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
          {editing ? 'Edit Pattern' : 'Identify a Pattern'}
        </p>

        <div style={{ height: 1, background: 'var(--bg-tertiary)', marginBottom: 20 }} />

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>Pattern Name</p>
          <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="What recurring dynamic have you noticed?" className="w-full font-serif"
            style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '9px 12px', outline: 'none' }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8 }}>Category</p>
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

        {/* Frequency + Impact row */}
        <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
          <div>
            <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>Frequency</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 3, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              {FREQUENCIES.map(f => (
                <button key={f.value} type="button" onClick={() => setForm(fm => ({ ...fm, frequency: f.value }))}
                  className="font-mono uppercase tracking-widest"
                  style={{
                    fontSize: 9, padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: form.frequency === f.value ? 'var(--bg-primary)' : 'transparent',
                    color: form.frequency === f.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: form.frequency === f.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 180ms',
                  }}>{f.label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>Impact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 3, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              {IMPACTS.map(i => (
                <button key={i.value} type="button" onClick={() => setForm(fm => ({ ...fm, impact: i.value }))}
                  className="font-mono uppercase tracking-widest"
                  style={{
                    fontSize: 9, padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: form.impact === i.value ? 'var(--bg-primary)' : 'transparent',
                    color: form.impact === i.value ? i.color : 'var(--text-tertiary)',
                    boxShadow: form.impact === i.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 180ms',
                  }}>{i.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>Description</p>
          <div style={{ position: 'relative' }}>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the pattern. What happens? When does it occur? How does it manifest?"
              rows={4} className="w-full font-serif"
              style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '10px 40px 10px 12px', resize: 'none', outline: 'none', lineHeight: 1.55 }}
            />
            <MicButton onTranscript={t => setForm(f => ({ ...f, description: f.description ? f.description + ' ' + t : t }))} />
          </div>
        </div>

        {/* Triggers */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>
            Common Triggers <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>— comma separated</span>
          </p>
          <input type="text" value={form.triggers} onChange={e => setForm(f => ({ ...f, triggers: e.target.value }))}
            placeholder="disagreement, raised voices, criticism" className="w-full font-mono"
            style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 10px', outline: 'none' }}
          />
        </div>

        {/* Examples */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>
            Examples <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>— one per line</span>
          </p>
          <div style={{ position: 'relative' }}>
            <textarea value={form.examples} onChange={e => setForm(f => ({ ...f, examples: e.target.value }))}
              placeholder={"Last week when I brought up the dishes, they walked away\nDuring the budget talk, they stopped responding"}
              rows={3} className="w-full font-serif"
              style={{ fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '10px 40px 10px 12px', resize: 'none', outline: 'none', lineHeight: 1.55 }}
            />
            <MicButton onTranscript={t => setForm(f => ({ ...f, examples: f.examples ? f.examples + '\n' + t : t }))} />
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>
            Tags <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>— e.g. theme:trust, pattern:withdrawal</span>
          </p>
          <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="theme:conflict, pattern:avoidance" className="w-full font-mono"
            style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 10px', outline: 'none' }}
          />
        </div>

        {/* Actions */}
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
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Log Pattern'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Tab ─────────────────────────────────────────────────────────────────

export function MemberPatternsTab({ member, externalAddOpen, onExternalAddClose }: MemberPatternsTabProps) {
  const [modalOpen, setModalOpen]    = useState(false);
  const [editing, setEditing]        = useState<Pattern | null>(null);
  const [deletingPattern, setDeleting] = useState<Pattern | null>(null);

  // Sync external trigger from header button
  useEffect(() => {
    if (externalAddOpen) {
      setEditing(null);
      setModalOpen(true);
      onExternalAddClose?.();
    }
  }, [externalAddOpen, onExternalAddClose]);

  const { data, isLoading, isError } = useGetPatternsQuery({ memberId: member.id });
  const [createPattern, { isLoading: creating }] = useCreatePatternMutation();
  const [updatePattern, { isLoading: updating }] = useUpdatePatternMutation();
  const [deletePattern, { isLoading: deleting }] = useDeletePatternMutation();

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Pattern) => { setEditing(p); setModalOpen(true); };

  const handleSave = async (payload: CreatePatternRequest) => {
    if (editing) {
      await updatePattern({ memberId: member.id, id: editing.id, data: payload });
    } else {
      await createPattern({ memberId: member.id, ...payload });
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPattern) return;
    await deletePattern({ memberId: member.id, id: deletingPattern.id });
    setDeleting(null);
  };

  const patterns = data?.data ?? [];

  // Summary counts per category
  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.value] = patterns.filter(p => p.category === c.value).length;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) return (
    <div className="flex items-center justify-center" style={{ paddingTop: 40 }}>
      <p className="font-mono uppercase tracking-widest" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Loading patterns…</p>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center" style={{ paddingTop: 40 }}>
      <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Could not load patterns. Please try again.</p>
    </div>
  );

  return (
    <div className="w-full">
      <PatternModal isOpen={modalOpen} editing={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} saving={creating || updating} />

      {deletingPattern && (
        <ConfirmDeleteModal
          title="Remove Pattern"
          itemLabel={deletingPattern.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleting(null)}
          deleting={deleting}
        />
      )}

      {patterns.length === 0 ? (
        /* ── Empty state ── */
        <div style={{ paddingTop: 40, textAlign: 'center' }}>
          <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>No patterns identified yet</p>
          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>
            Start noticing recurring dynamics in your relationship with {member.fullName}.
          </p>
          <button onClick={openAdd} className="font-mono uppercase tracking-widest"
            style={{ fontSize: 10, padding: '9px 20px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Identify First Pattern
          </button>
        </div>
      ) : (
        <>
          {/* ── Header row ── */}
          <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
            <span className="font-mono uppercase tracking-widest" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              {patterns.length} pattern{patterns.length !== 1 ? 's' : ''}
            </span>
            <button onClick={openAdd} className="font-mono uppercase tracking-widest"
              style={{ fontSize: 10, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              + Add
            </button>
          </div>

          {/* ── List ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {patterns.map((pattern, index) => {
              const color  = categoryColor(pattern.category);
              const iColor = impactColor(pattern.impact);
              return (
                <div key={pattern.id}>
                  <div className="flex items-start gap-5">
                    {/* Dot */}
                    <div style={{ flexShrink: 0, width: 10, height: 10, borderRadius: '50%', background: color, marginTop: 5 }} />

                    {/* Content */}
                    <div className="flex-1 min-w-0" style={{ paddingBottom: 28 }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 400, marginBottom: 4, lineHeight: 1.4 }}>
                            {pattern.title}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 10 }}>
                            {pattern.category && (
                              <span className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color }}>
                                {CATEGORIES.find(c => c.value === pattern.category)?.label ?? pattern.category}
                              </span>
                            )}
                            {pattern.frequency && (
                              <span className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                                {pattern.frequency}
                              </span>
                            )}
                            {pattern.impact && (
                              <span className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: iColor }}>
                                {pattern.impact}
                              </span>
                            )}
                          </div>

                          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: pattern.triggers.length ? 12 : 0 }}>
                            {pattern.description}
                          </p>

                          {pattern.triggers.length > 0 && (
                            <div style={{ paddingLeft: 12, borderLeft: `2px solid ${color}`, marginBottom: 10 }}>
                              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color, marginBottom: 4 }}>Triggers</p>
                              <p className="font-serif" style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.55 }}>{pattern.triggers.join(', ')}</p>
                            </div>
                          )}

                          {pattern.examples.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--accent-gold)', marginBottom: 6 }}>Examples</p>
                              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                {pattern.examples
                                  .flatMap(ex => ex.split('\n').map(s => s.trim()).filter(Boolean))
                                  .map((ex, idx) => (
                                    <li key={idx} className="font-serif" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 4 }}>
                                      • {ex}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}

                          {pattern.tags.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 6 }}>
                              {pattern.tags.map(tag => (
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
                          <button onClick={() => openEdit(pattern)} title="Edit"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px 4px' }}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleting(pattern)} title="Remove"
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

                  {/* Dotted divider between items */}
                  {index < patterns.length - 1 && (
                    <DottedDivider style={{ marginLeft: 15, marginTop: -20, marginBottom: 8 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Summary strip ── */}
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--bg-tertiary)' }}>
            <div className="grid grid-cols-6 gap-4">
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
