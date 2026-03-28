'use client';

import { useState, useEffect } from 'react';
import {
  useGetTraitsQuery,
  useCreateTraitMutation,
  useUpdateTraitMutation,
  useDeleteTraitMutation,
  type Trait,
  type CreateTraitRequest,
  type TraitCategory,
} from '@/store/api/traitsApi';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { TabFooter } from '@/components/ui/TabFooter';

// ── Constants ─────────────────────────────────────────────────────────────────

type UserTraitCategory = 'strength' | 'shadow' | 'trigger' | 'need';

const CATEGORIES: { value: UserTraitCategory; label: string; color: string; description: string }[] = [
  { value: 'strength', label: 'Strength',  color: '#7FA87A', description: 'What you do naturally well' },
  { value: 'shadow',   label: 'Shadow',    color: '#C47A7A', description: 'Parts of yourself you\'re still integrating' },
  { value: 'trigger',  label: 'Trigger',   color: '#C4A87A', description: 'What activates a strong reaction in you' },
  { value: 'need',     label: 'Need',      color: 'var(--accent-ai)', description: 'What you require to feel whole' },
];

const INTENSITY_LABELS: Record<number, string> = { 1: 'Mild', 2: 'Moderate', 3: 'Strong' };
const EMOTION_TAGS = ['joyful', 'safe', 'loved', 'energized', 'peaceful', 'anxious', 'frustrated', 'drained', 'confused', 'hurt'];

// ── Modal ────────────────────────────────────────────────────────────────────

interface ModalForm {
  category: UserTraitCategory;
  text: string;
  intensity: 1 | 2 | 3;
  emotionTag: string;
}

function TraitModal({ isOpen, editingTrait, defaultCategory, onClose, onSave, saving }: {
  isOpen: boolean;
  editingTrait: Trait | null;
  defaultCategory: UserTraitCategory;
  onClose: () => void;
  onSave: (payload: CreateTraitRequest) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState<ModalForm>({ category: defaultCategory, text: '', intensity: 2, emotionTag: '' });

  useEffect(() => {
    if (!isOpen) return;
    if (editingTrait) {
      setForm({
        category: editingTrait.category as UserTraitCategory,
        text: editingTrait.description,
        intensity: (editingTrait.intensity ?? 2) as 1 | 2 | 3,
        emotionTag: editingTrait.emotionTag ?? '',
      });
    } else {
      setForm({ category: defaultCategory, text: '', intensity: 2, emotionTag: '' });
    }
  }, [isOpen, editingTrait, defaultCategory]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cat = CATEGORIES.find(c => c.value === form.category)!;
  const canSave = !!form.text.trim() && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    await onSave({
      category: form.category as TraitCategory,
      description: form.text.trim(),
      intensity: form.intensity,
      emotionTag: form.emotionTag || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="relative w-full" style={{ maxWidth: 440, background: 'var(--bg-primary)', border: '1px solid var(--bg-tertiary)', borderRadius: 16, boxShadow: '0 20px 48px rgba(0,0,0,0.12)', padding: '24px 24px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8 }}>
            {editingTrait ? 'Edit' : 'Log'} Self Trait
          </p>
          {/* Category selector — locked when editing */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {CATEGORIES.map(c => (
              <button key={c.value} type="button"
                onClick={() => !editingTrait && setForm(f => ({ ...f, category: c.value }))}
                className="font-rounded uppercase tracking-widest"
                style={{
                  fontSize: 9, padding: '4px 12px', borderRadius: 6, border: '1px solid',
                  cursor: editingTrait ? 'default' : 'pointer',
                  borderColor: form.category === c.value ? c.color : 'var(--bg-tertiary)',
                  background: form.category === c.value ? c.color : 'transparent',
                  color: form.category === c.value ? '#fff' : 'var(--text-tertiary)',
                  transition: 'all 180ms',
                }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 6 }}>Description</p>
          <textarea
            value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            placeholder={`Describe this ${cat.label.toLowerCase()}...`}
            rows={3}
            className="w-full font-serif"
            style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: '10px 12px', outline: 'none', resize: 'none', lineHeight: 1.6 }}
          />
        </div>

        {/* Intensity */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 6 }}>Intensity</p>
          <div style={{ display: 'inline-flex', gap: 4, padding: 3, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            {([1, 2, 3] as const).map(level => (
              <button key={level} type="button" onClick={() => setForm(f => ({ ...f, intensity: level }))}
                className="font-rounded uppercase tracking-widest"
                style={{
                  fontSize: 9, padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: form.intensity === level ? 'var(--bg-primary)' : 'transparent',
                  color: form.intensity === level ? cat.color : 'var(--text-tertiary)',
                  boxShadow: form.intensity === level ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 180ms',
                }}>
                {INTENSITY_LABELS[level]}
              </button>
            ))}
          </div>
        </div>

        {/* Emotion tag */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 6 }}>Emotion <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>optional</span></p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {EMOTION_TAGS.map(tag => (
              <button key={tag} type="button"
                onClick={() => setForm(f => ({ ...f, emotionTag: f.emotionTag === tag ? '' : tag }))}
                className="font-serif"
                style={{
                  fontSize: 12, padding: '3px 10px', borderRadius: 999, border: '1px solid',
                  cursor: 'pointer',
                  borderColor: form.emotionTag === tag ? cat.color : 'var(--bg-tertiary)',
                  background: form.emotionTag === tag ? cat.color + '22' : 'transparent',
                  color: form.emotionTag === tag ? cat.color : 'var(--text-tertiary)',
                  transition: 'all 150ms',
                }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onClose}
            className="font-rounded uppercase tracking-widest"
            style={{ fontSize: 10, padding: '7px 16px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={!canSave}
            className="font-rounded uppercase tracking-widest"
            style={{
              fontSize: 10, padding: '7px 20px', borderRadius: 8, border: 'none', cursor: canSave ? 'pointer' : 'default',
              background: canSave ? cat.color : 'var(--bg-tertiary)',
              color: canSave ? '#fff' : 'var(--text-tertiary)',
              opacity: saving ? 0.7 : 1,
              transition: 'all 150ms',
            }}>
            {saving ? 'Saving…' : editingTrait ? 'Save Changes' : 'Log Trait'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Trait list item ───────────────────────────────────────────────────────────

function TraitItem({ trait, onEdit, onDelete }: { trait: Trait; onEdit: () => void; onDelete: () => void }) {
  const cat = CATEGORIES.find(c => c.value === trait.category) ?? CATEGORIES[0];
  const intensity = INTENSITY_LABELS[trait.intensity ?? 2];

  return (
    <div className="flex items-start gap-4">
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, marginTop: 10, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4" style={{ marginBottom: 4 }}>
          <p className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {trait.description}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0" style={{ opacity: 0.35, transition: 'opacity 150ms' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.35')}>
            <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px 4px' }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C47A7A', padding: '2px 4px' }}>
              <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
                <path d="M2 3.5h9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M4.5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M3 3.5l.6 6a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-serif" style={{ fontSize: 13, color: cat.color }}>{cat.label}</span>
          <span className="font-serif" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{intensity}</span>
          {trait.emotionTag && (
            <span className="font-serif" style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{trait.emotionTag}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface UserTraitsTabProps {
  activeCategory?: UserTraitCategory;
  externalAddOpen?: boolean;
  onExternalAddClose?: () => void;
  onCountChange?: (count: number) => void;
}

export function UserTraitsTab({ activeCategory, externalAddOpen, onExternalAddClose, onCountChange }: UserTraitsTabProps) {
  const [selectedCat, setSelectedCat] = useState<UserTraitCategory>(activeCategory ?? 'strength');
  const [modalOpen, setModalOpen]    = useState(false);
  const [editing, setEditing]        = useState<Trait | null>(null);
  const [deleting, setDeleting]      = useState<Trait | null>(null);

  // Sync selectedCat whenever activeCategory changes (handles key-prop remount + direct prop changes)
  useEffect(() => {
    if (activeCategory !== undefined) setSelectedCat(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (externalAddOpen) {
      setEditing(null);
      setModalOpen(true);
      onExternalAddClose?.();
    }
  }, [externalAddOpen, onExternalAddClose]);

  const { data, isLoading, isError } = useGetTraitsQuery({ category: selectedCat });
  const { data: strengthsData } = useGetTraitsQuery({ category: 'strength' });
  const { data: shadowsData }   = useGetTraitsQuery({ category: 'shadow' });
  const { data: triggersData }  = useGetTraitsQuery({ category: 'trigger' });
  const { data: needsData }     = useGetTraitsQuery({ category: 'need' });
  const [createTrait, { isLoading: creating }] = useCreateTraitMutation();
  const [updateTrait, { isLoading: updating }] = useUpdateTraitMutation();
  const [deleteTrait, { isLoading: isDeleting }] = useDeleteTraitMutation();

  const traits = data?.data ?? [];
  const footerStats = [
    { val: strengthsData?.data?.length ?? 0, label: 'Strengths', color: '#7FA87A' },
    { val: shadowsData?.data?.length   ?? 0, label: 'Shadows',   color: '#C47A7A' },
    { val: triggersData?.data?.length  ?? 0, label: 'Triggers',  color: '#C4A87A' },
    { val: needsData?.data?.length     ?? 0, label: 'Needs',     color: 'var(--accent-ai)' },
  ];

  useEffect(() => { if (data) onCountChange?.(traits.length); }, [data, traits.length]);

  const handleSave = async (payload: CreateTraitRequest) => {
    if (editing) {
      await updateTrait({ id: editing.id, data: payload });
    } else {
      await createTrait(payload);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    await deleteTrait(deleting.id);
    setDeleting(null);
  };

  const cat = CATEGORIES.find(c => c.value === selectedCat)!;

  return (
    <div className="h-full flex flex-col min-h-0">
      <TraitModal
        isOpen={modalOpen}
        editingTrait={editing}
        defaultCategory={selectedCat}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        saving={creating || updating}
      />

      {deleting && (
        <ConfirmDeleteModal
          title="Remove Trait"
          itemLabel={deleting.description.slice(0, 60)}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleting(null)}
          deleting={isDeleting}
        />
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0 px-8 pt-6 pb-8">
        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.value} type="button"
              onClick={() => setSelectedCat(c.value)}
              className="font-rounded uppercase tracking-widest"
              style={{
                fontSize: 9, padding: '5px 14px', borderRadius: 8, border: '1px solid', cursor: 'pointer', transition: 'all 150ms',
                borderColor: selectedCat === c.value ? c.color : 'var(--bg-tertiary)',
                background: selectedCat === c.value ? c.color + '18' : 'transparent',
                color: selectedCat === c.value ? c.color : 'var(--text-tertiary)',
              }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Category header */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-serif" style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{cat.description}</p>
        </div>

        {isLoading ? (
          <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 11, color: 'var(--text-tertiary)', paddingTop: 20 }}>Loading…</p>
        ) : isError ? (
          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)', paddingTop: 20 }}>Could not load traits. Please try again.</p>
        ) : traits.length === 0 ? (
          <div style={{ paddingTop: 32, textAlign: 'center' }}>
            <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>No {cat.label.toLowerCase()}s logged yet</p>
            <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>{cat.description}.</p>
            <button onClick={() => { setEditing(null); setModalOpen(true); }}
              className="font-rounded uppercase tracking-widest"
              style={{ fontSize: 10, padding: '9px 20px', borderRadius: 8, border: `1px solid ${cat.color}`, background: 'transparent', color: cat.color, cursor: 'pointer' }}>
              Log First {cat.label}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {traits.map((trait, i) => (
                <div key={trait.id}>
                  <TraitItem
                    trait={trait}
                    onEdit={() => { setEditing(trait); setModalOpen(true); }}
                    onDelete={() => setDeleting(trait)}
                  />
                  {i < traits.length - 1 && <DottedDivider style={{ marginLeft: 12, marginTop: 16, marginBottom: 16 }} />}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--bg-tertiary)' }}>
              <button onClick={() => { setEditing(null); setModalOpen(true); }}
                className="font-rounded uppercase tracking-widest"
                style={{ fontSize: 10, padding: '8px 18px', borderRadius: 8, border: `1px solid ${cat.color}`, background: 'transparent', color: cat.color, cursor: 'pointer' }}>
                + Add {cat.label}
              </button>
            </div>
          </>
        )}
      </div>

      <TabFooter
        stats={footerStats}
        tagline="Self-knowledge is the beginning of all wisdom."
      />
    </div>
  );
}
