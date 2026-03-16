'use client';

import { useState, useRef, useEffect } from 'react';
import {
  useGetTraitsQuery,
  useCreateTraitMutation,
  useUpdateTraitMutation,
  useDeleteTraitMutation,
  type Trait,
  type CreateTraitRequest,
} from '@/store/api/traitsApi';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { TabFooter } from '@/components/ui/TabFooter';

interface Member {
  id: string;
  fullName: string;
  [key: string]: any;
}

interface MemberProsConsTabProps {
  member: Member;
}

const INTENSITY_LABELS: Record<number, string> = { 1: 'Mild', 2: 'Moderate', 3: 'Strong' };
const EMOTION_TAGS = ['joyful', 'safe', 'loved', 'energized', 'peaceful', 'anxious', 'frustrated', 'drained', 'confused', 'hurt'];

/* ── Mic button ─────────────────────────────────────────────────────────────── */
function MicButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SpeechRecognition();
    rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US';
    rec.onresult = (e: any) => { onTranscript(e.results[0][0].transcript); setListening(false); };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
    recognitionRef.current = rec;
    rec.start(); setListening(true);
  };

  return (
    <button type="button" onClick={toggle} title={listening ? 'Stop recording' : 'Speak'}
      style={{
        position: 'absolute', bottom: 10, right: 10,
        width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
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

/* ── Trait modal (add + edit) ────────────────────────────────────────────────── */
interface ModalForm {
  type: 'pro' | 'con';
  text: string;
  intensity: 1 | 2 | 3;
  emotionTag: string;
  tags: string;
}

function TraitModal({ isOpen, editingTrait, defaultType, onClose, onSave, saving }: {
  isOpen: boolean;
  editingTrait: Trait | null;
  defaultType: 'pro' | 'con';
  onClose: () => void;
  onSave: (payload: CreateTraitRequest) => Promise<void>;
  saving: boolean;
}) {
  const isEditing = !!editingTrait;

  const [form, setForm] = useState<ModalForm>({
    type: defaultType, text: '', intensity: 2, emotionTag: '', tags: '',
  });

  // Seed form when opening
  useEffect(() => {
    if (!isOpen) return;
    if (editingTrait) {
      const rawTags = editingTrait.tags.filter(t => !t.startsWith('mood:')).join(', ');
      setForm({
        type: editingTrait.category as 'pro' | 'con',
        text: editingTrait.description,
        intensity: (editingTrait.intensity ?? 2) as 1 | 2 | 3,
        emotionTag: editingTrait.emotionTag ?? '',
        tags: rawTags,
      });
    } else {
      setForm({ type: defaultType, text: '', intensity: 2, emotionTag: '', tags: '' });
    }
  }, [isOpen, editingTrait, defaultType]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!form.text.trim() || saving) return;
    const tagList = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (form.emotionTag) tagList.unshift(`mood:${form.emotionTag}`);
    await onSave({
      category: form.type,
      description: form.text.trim(),
      intensity: form.intensity,
      emotionTag: form.emotionTag || undefined,
      tags: tagList,
    });
  };

  const isStrength = form.type === 'pro';
  const canSave = !!form.text.trim() && !saving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="relative w-full" style={{ maxWidth: 420, background: 'var(--bg-primary)', border: '1px solid var(--bg-tertiary)', borderRadius: 16, boxShadow: '0 20px 48px rgba(0,0,0,0.12)', padding: '24px 24px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>
            {isEditing ? 'Edit Relationship Trait' : 'Add Relationship Trait'}
          </p>
          {/* Nature toggle — locked when editing to avoid accidental category swap */}
          <div style={{ marginTop: 12, padding: 3, background: 'var(--bg-secondary)', borderRadius: 8, display: 'inline-flex', gap: 4 }}>
            {(['pro', 'con'] as const).map(t => (
              <button key={t} type="button"
                onClick={() => !isEditing && setForm(f => ({ ...f, type: t }))}
                className="font-mono uppercase tracking-widest"
                style={{
                  fontSize: 10, padding: '5px 14px', borderRadius: 6, border: 'none',
                  cursor: isEditing ? 'default' : 'pointer',
                  background: form.type === t ? 'var(--bg-primary)' : 'transparent',
                  color: form.type === t ? (t === 'pro' ? '#7FA87A' : '#C47A7A') : 'var(--text-tertiary)',
                  boxShadow: form.type === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 180ms',
                }}>
                {t === 'pro' ? 'Strength' : 'Challenge'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--bg-tertiary)', marginBottom: 18 }} />

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>Description</p>
          <div style={{ position: 'relative' }}>
            <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
              placeholder={isStrength ? 'What do you appreciate about them…' : 'What creates friction or tension…'}
              rows={3} className="w-full font-serif"
              style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '10px 40px 10px 12px', resize: 'none', outline: 'none', lineHeight: 1.55 }}
            />
            <MicButton onTranscript={t => setForm(f => ({ ...f, text: f.text ? f.text + ' ' + t : t }))} />
          </div>
        </div>

        {/* Emotion tag */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8 }}>Emotion</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EMOTION_TAGS.map(tag => (
              <button key={tag} type="button" onClick={() => setForm(f => ({ ...f, emotionTag: f.emotionTag === tag ? '' : tag }))}
                className="font-mono uppercase tracking-widest"
                style={{
                  fontSize: 9, padding: '4px 10px', borderRadius: 999, border: '1px solid',
                  borderColor: form.emotionTag === tag ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  background: form.emotionTag === tag ? 'var(--accent-primary)' : 'transparent',
                  color: form.emotionTag === tag ? '#fff' : 'var(--text-tertiary)',
                  cursor: 'pointer', transition: 'all 150ms',
                }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>
            Tags <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>— comma separated, e.g. theme:trust, context:work</span>
          </p>
          <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="theme:humor, context:social" className="w-full font-mono"
            style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 10px', outline: 'none' }}
          />
        </div>

        {/* Intensity */}
        <div style={{ marginBottom: 20 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Intensity</p>
            <p className="font-mono" style={{ fontSize: 11, color: 'var(--text-primary)' }}>{INTENSITY_LABELS[form.intensity]}</p>
          </div>
          <input type="range" min="1" max="3" value={form.intensity}
            onChange={e => setForm(f => ({ ...f, intensity: parseInt(e.target.value) as 1 | 2 | 3 }))}
            className="w-full" style={{ accentColor: isStrength ? '#7FA87A' : '#C47A7A' }}
          />
          <div className="flex justify-between font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
            <span>Mild</span><span>Moderate</span><span>Strong</span>
          </div>
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
              background: canSave ? (isStrength ? '#7FA87A' : '#C47A7A') : 'var(--bg-tertiary)',
              color: canSave ? '#fff' : 'var(--text-tertiary)',
              transition: 'background 200ms',
            }}>
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Save Trait'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Tab ────────────────────────────────────────────────────────────────── */
export function MemberProsConsTab({ member }: MemberProsConsTabProps) {
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalDefault, setModalDefault] = useState<'pro' | 'con'>('pro');
  const [editingTrait, setEditingTrait] = useState<Trait | null>(null);
  const [deletingTrait, setDeletingTrait] = useState<Trait | null>(null);

  const { data, isLoading, isError } = useGetTraitsQuery({ memberId: member.id });
  const [createTrait, { isLoading: creating }] = useCreateTraitMutation();
  const [updateTrait, { isLoading: updating }] = useUpdateTraitMutation();
  const [deleteTrait, { isLoading: deleting }] = useDeleteTraitMutation();

  const openAdd  = (type: 'pro' | 'con') => { setEditingTrait(null); setModalDefault(type); setModalOpen(true); };
  const openEdit = (trait: Trait) => { setEditingTrait(trait); setModalOpen(true); };

  const handleSave = async (payload: CreateTraitRequest) => {
    if (editingTrait) {
      await updateTrait({ id: editingTrait.id, data: payload });
    } else {
      await createTrait({ ...payload, memberId: member.id });
    }
    setModalOpen(false);
    setEditingTrait(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTrait) return;
    await deleteTrait(deletingTrait.id);
    setDeletingTrait(null);
  };

  const traits = data?.data ?? [];
  const pros = traits.filter(t => t.category === 'pro');
  const cons = traits.filter(t => t.category === 'con');
  const ratio = pros.length > 0 ? Math.round((pros.length / (pros.length + cons.length)) * 100) : 0;

  const TraitRow = ({ item, accentColor }: { item: Trait; accentColor: string }) => (
    <div className="group flex items-start gap-3"
      style={{ paddingLeft: 12, paddingTop: 10, paddingBottom: 10, borderLeft: `2px solid ${accentColor}` }}>
      <div className="flex-1 min-w-0">
        <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6 }}>{item.description}</p>
        <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 7 }}>
          {item.emotionTag && (
            <span className="font-serif" style={{ fontSize: 13, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{item.emotionTag}</span>
          )}
          {item.tags.filter(t => !t.startsWith('mood:')).map(tag => (
            <span key={tag} className="font-serif"
              style={{ fontSize: 12, padding: '1px 8px', borderRadius: 999, border: '1px solid var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
              {tag}
            </span>
          ))}
          {item.intensity && (
            <span className="font-serif" style={{ fontSize: 13, color: accentColor }}>{INTENSITY_LABELS[item.intensity]}</span>
          )}
          <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
      {/* Row actions — edit + delete */}
      <div className="flex items-center gap-1 flex-shrink-0" style={{ opacity: 0.4, transition: 'opacity 150ms' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}>
        <button onClick={() => openEdit(item)} title="Edit"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px 4px' }}>
          <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button onClick={() => setDeletingTrait(item)} title="Remove"
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
  );

  if (isLoading) return (
    <div className="flex items-center justify-center" style={{ paddingTop: 40 }}>
      <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-tertiary)' }}>Loading traits…</p>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center" style={{ paddingTop: 40 }}>
      <p className="font-serif italic" style={{ fontSize: 15, color: 'var(--text-tertiary)' }}>Could not load traits. Please try again.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <TraitModal
        isOpen={modalOpen}
        editingTrait={editingTrait}
        defaultType={modalDefault}
        onClose={() => { setModalOpen(false); setEditingTrait(null); }}
        onSave={handleSave}
        saving={creating || updating}
      />

      {deletingTrait && (
        <ConfirmDeleteModal
          title="Remove Trait"
          itemLabel={deletingTrait.description}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingTrait(null)}
          deleting={deleting}
        />
      )}

      {/* Traits grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

        {/* Strengths */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: '#7FA87A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>What Draws You Closer</span>
              <span className="font-serif" style={{ fontSize: 15, fontWeight: 400, color: 'var(--text-tertiary)' }}>({pros.length})</span>
            </div>
            <button onClick={() => openAdd('pro')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', lineHeight: 1 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#7FA87A')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          {pros.length === 0
            ? <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-tertiary)' }}>
                No strengths captured yet.{' '}
                <button onClick={() => openAdd('pro')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>Add one →</button>
              </p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{pros.map(p => <TraitRow key={p.id} item={p} accentColor="#7FA87A" />)}</div>
          }
        </div>

        {/* Challenges */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: '#C47A7A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>Growth Edges</span>
              <span className="font-serif" style={{ fontSize: 15, fontWeight: 400, color: 'var(--text-tertiary)' }}>({cons.length})</span>
            </div>
            <button onClick={() => openAdd('con')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', lineHeight: 1 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C47A7A')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          {cons.length === 0
            ? <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-tertiary)' }}>
                No challenges identified yet.{' '}
                <button onClick={() => openAdd('con')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>Add one →</button>
              </p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{cons.map(c => <TraitRow key={c.id} item={c} accentColor="#C47A7A" />)}</div>
          }
        </div>
      </div>

      <TabFooter
        stats={[
          { val: pros.length, label: 'Strengths',          color: '#7FA87A' },
          { val: cons.length, label: 'Growth Edges',       color: '#C47A7A' },
          { val: `${ratio}%`, label: 'Appreciation Ratio', color: 'var(--accent-ai)' },
        ]}
        tagline="Every relationship contains both light and shadow. The goal is not perfection, but conscious appreciation of the full spectrum."
      />
    </div>
  );
}
