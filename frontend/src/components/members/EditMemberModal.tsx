'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useUpdateMemberMutation } from '@/store/api/membersApi';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { getPlaces, formatPlaceName, type PlaceResult } from '@/lib/places';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  fullName: string;
  nickname?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  relationType: string;
  relationTypeCustom?: string;
  photoUrl?: string;
  notes?: string;
}

interface Props {
  member: Member;
  open: boolean;
  onClose: () => void;
  onSuccess?: (updated: Member) => void;
}

const RELATION_TYPES = [
  { value: 'family',    label: 'Family' },
  { value: 'friend',    label: 'Friend' },
  { value: 'partner',   label: 'Partner' },
  { value: 'mentor',    label: 'Mentor' },
  { value: 'colleague', label: 'Colleague' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function EditMemberModal({ member, open, onClose, onSuccess }: Props) {
  const [updateMember, { isLoading: isSaving }] = useUpdateMemberMutation();

  // Form state — initialised from member prop
  const [formData, setFormData] = useState({
    fullName: member.fullName,
    nickname: member.nickname ?? '',
    relationType: member.relationType,
    relationTypeCustom: member.relationTypeCustom ?? '',
    dateOfBirth: member.dateOfBirth ?? '',
    timeOfBirth: member.timeOfBirth ?? '',
    placeOfBirth: member.placeOfBirth ?? '',
    notes: member.notes ?? '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(member.photoUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Place autocomplete
  const [showPlaceSuggestions, setShowPlaceSuggestions] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceResult[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const placeInputRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Re-initialise form when member changes or modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        fullName: member.fullName,
        nickname: member.nickname ?? '',
        relationType: member.relationType,
        relationTypeCustom: member.relationTypeCustom ?? '',
        dateOfBirth: member.dateOfBirth ?? '',
        timeOfBirth: member.timeOfBirth ?? '',
        placeOfBirth: member.placeOfBirth ?? '',
        notes: member.notes ?? '',
      });
      setPhotoPreview(member.photoUrl ?? null);
      setPhotoFile(null);
      setError(null);
      setSuccess(false);
    }
  }, [open, member]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close place dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (placeInputRef.current && !placeInputRef.current.contains(e.target as Node)) {
        setShowPlaceSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 2) { setShowPlaceSuggestions(false); setPlaceSuggestions([]); return; }
    setIsSearchingPlace(true);
    try {
      const results = await getPlaces(query);
      setPlaceSuggestions(results);
      setShowPlaceSuggestions(true);
      setActiveSuggestionIndex(-1);
    } catch {
      setShowPlaceSuggestions(false);
    } finally {
      setIsSearchingPlace(false);
    }
  }, []);

  const handlePlaceInput = (value: string) => {
    setFormData(prev => ({ ...prev, placeOfBirth: value }));
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchPlaces(value), 300);
  };

  const selectPlace = (place: PlaceResult) => {
    setFormData(prev => ({ ...prev, placeOfBirth: formatPlaceName(place) }));
    setShowPlaceSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select a valid image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be smaller than 5MB'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setError(null);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'relationType' && value !== 'other') {
      setFormData(prev => ({ ...prev, relationType: value, relationTypeCustom: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (!formData.fullName.trim()) throw new Error('Please enter their name');
      if (!formData.relationType) throw new Error('Please choose their connection to you');
      if (formData.relationType === 'other' && !formData.relationTypeCustom.trim()) {
        throw new Error('Please specify the custom connection type');
      }

      // Detect if user removed the existing photo without uploading a new one
      const photoRemoved = !photoFile && !photoPreview && !!member.photoUrl;

      const updated = await updateMember({
        id: member.id,
        photo: photoFile ?? undefined,
        data: {
          fullName: formData.fullName.trim(),
          nickname: formData.nickname.trim() || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          timeOfBirth: formData.timeOfBirth || undefined,
          placeOfBirth: formData.placeOfBirth.trim() || undefined,
          relationType: formData.relationType,
          relationTypeCustom: formData.relationType === 'other' ? formData.relationTypeCustom.trim() : undefined,
          notes: formData.notes.trim() || undefined,
          ...(photoRemoved ? { photoUrl: '' } : {}),
        },
      }).unwrap();

      setSuccess(true);
      onSuccess?.(updated?.data ?? updated);
      setTimeout(onClose, 900);
    } catch (err: any) {
      setError(err.data?.error?.message || err.message || 'Could not save changes. Please try again.');
    }
  };

  if (!open) return null;

  const initials = member.fullName.charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: 520,
          maxHeight: '90vh',
          background: 'var(--bg-primary)',
          border: '1px solid var(--bg-tertiary)',
          borderRadius: 20,
          animation: 'modal-rise 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <style>{`
          @keyframes modal-rise {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between flex-shrink-0 px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid var(--bg-tertiary)' }}
        >
          <div>
            <div
              className="font-rounded uppercase tracking-widest mb-0.5"
              style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
            >
              Edit Luminary
            </div>
            <h2
              className="font-serif font-light"
              style={{ fontSize: 20, color: 'var(--text-primary)', lineHeight: 1.2 }}
            >
              {member.fullName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable form body ── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{ scrollbarWidth: 'none' }}
        >

          {/* Photo + Name row */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              {photoPreview ? (
                <>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-14 h-14 rounded-full object-cover"
                    style={{ border: '2px solid var(--accent-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--error, #ef4444)', border: 'none', cursor: 'pointer' }}
                  >
                    <svg width="8" height="8" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-serif text-xl"
                  style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse, #fff)' }}
                >
                  {initials}
                </div>
              )}
            </div>

            {/* Name field */}
            <div className="flex-1 space-y-1">
              <label
                className="block font-rounded uppercase tracking-widest"
                style={{ fontSize: 10, color: 'var(--text-secondary)' }}
              >
                FULL NAME
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                placeholder="Enter their name..."
                className="w-full bg-transparent outline-none focus:outline-none focus:ring-0 font-serif"
                style={{
                  fontSize: 15,
                  color: 'var(--text-primary)',
                  border: 'none',
                  borderBottom: '1px solid var(--bg-tertiary)',
                  paddingBottom: 6,
                }}
              />
            </div>

            {/* Change photo button */}
            <div className="flex-shrink-0">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-rounded uppercase tracking-widest transition-colors"
                style={{
                  fontSize: 10,
                  color: 'var(--text-tertiary)',
                  background: 'none',
                  border: '1px solid var(--bg-tertiary)',
                  borderRadius: 8,
                  padding: '5px 10px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {photoPreview ? 'Change' : 'Upload'}
              </button>
            </div>
          </div>

          {/* Nickname */}
          <div className="space-y-1">
            <label
              className="block font-rounded uppercase tracking-widest"
              style={{ fontSize: 10, color: 'var(--text-secondary)' }}
            >
              NICKNAME <span style={{ color: 'var(--text-tertiary)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setField('nickname', e.target.value)}
              placeholder="What do you call them?"
              className="w-full bg-transparent outline-none focus:outline-none focus:ring-0 font-serif"
              style={{
                fontSize: 14,
                color: 'var(--text-primary)',
                border: 'none',
                borderBottom: '1px solid var(--bg-tertiary)',
                paddingBottom: 6,
              }}
            />
          </div>

          {/* Connection */}
          <div className="space-y-2">
            <label
              className="block font-rounded uppercase tracking-widest"
              style={{ fontSize: 10, color: 'var(--text-secondary)' }}
            >
              CONNECTION
            </label>
            <div className="flex flex-wrap gap-2">
              {RELATION_TYPES.map((type) => {
                const active = formData.relationType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setField('relationType', type.value)}
                    className="font-rounded uppercase tracking-widest transition-all"
                    style={{
                      fontSize: 10,
                      padding: '5px 12px',
                      borderRadius: 20,
                      border: active ? 'none' : '1px solid var(--bg-tertiary)',
                      background: active ? 'var(--accent-primary)' : 'transparent',
                      color: active ? 'var(--text-inverse, #fff)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {type.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setField('relationType', 'other')}
                className="font-rounded uppercase tracking-widest transition-all"
                style={{
                  fontSize: 10,
                  padding: '5px 12px',
                  borderRadius: 20,
                  border: formData.relationType === 'other' ? 'none' : '1px solid var(--bg-tertiary)',
                  background: formData.relationType === 'other' ? 'var(--accent-primary)' : 'transparent',
                  color: formData.relationType === 'other' ? 'var(--text-inverse, #fff)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                + Other
              </button>
            </div>
            {formData.relationType === 'other' && (
              <input
                type="text"
                value={formData.relationTypeCustom}
                onChange={(e) => setFormData(prev => ({ ...prev, relationTypeCustom: e.target.value }))}
                placeholder="Describe their connection..."
                className="w-full bg-transparent outline-none focus:outline-none focus:ring-0 font-serif"
                style={{
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  border: 'none',
                  borderBottom: '1px solid var(--bg-tertiary)',
                  paddingBottom: 6,
                }}
              />
            )}
          </div>

          {/* Birth Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="BIRTH DATE"
              value={formData.dateOfBirth}
              onChange={(v) => setFormData(prev => ({ ...prev, dateOfBirth: v }))}
            />
            <TimePicker
              label="BIRTH TIME"
              value={formData.timeOfBirth}
              onChange={(v) => setFormData(prev => ({ ...prev, timeOfBirth: v }))}
            />
          </div>

          {/* Place of Birth */}
          <div className="space-y-1">
            <label
              className="block font-rounded uppercase tracking-widest"
              style={{ fontSize: 10, color: 'var(--text-secondary)' }}
            >
              PLACE OF ARRIVAL
            </label>
            <div className="relative" ref={placeInputRef}>
              <input
                type="text"
                value={formData.placeOfBirth}
                onChange={(e) => handlePlaceInput(e.target.value)}
                onFocus={() => { if (formData.placeOfBirth.length >= 2) setShowPlaceSuggestions(true); }}
                onKeyDown={(e) => {
                  if (!showPlaceSuggestions || placeSuggestions.length === 0) return;
                  if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestionIndex(i => Math.min(i + 1, placeSuggestions.length - 1)); }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestionIndex(i => Math.max(i - 1, -1)); }
                  else if (e.key === 'Enter' && activeSuggestionIndex >= 0) { e.preventDefault(); selectPlace(placeSuggestions[activeSuggestionIndex]); }
                  else if (e.key === 'Escape') setShowPlaceSuggestions(false);
                }}
                placeholder="City, Country"
                autoComplete="off"
                className="w-full bg-transparent outline-none focus:outline-none focus:ring-0 font-serif pr-6"
                style={{
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  border: 'none',
                  borderBottom: '1px solid var(--bg-tertiary)',
                  paddingBottom: 6,
                }}
              />
              <div className="absolute right-0 top-0" style={{ color: 'var(--text-tertiary)', pointerEvents: 'none' }}>
                {isSearchingPlace ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z" />
                  </svg>
                )}
              </div>

              {showPlaceSuggestions && placeSuggestions.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 overflow-hidden z-50"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--bg-tertiary)',
                    borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  }}
                >
                  {placeSuggestions.map((place, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectPlace(place)}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                      className="w-full text-left transition-colors"
                      style={{
                        padding: '9px 14px',
                        background: activeSuggestionIndex === index ? 'var(--bg-tertiary)' : 'transparent',
                        border: 'none',
                        borderBottom: index < placeSuggestions.length - 1 ? '1px solid var(--bg-tertiary)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-primary)' }}>
                        <path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <span className="font-serif" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{place.name}</span>
                        {(place.state || place.country) && (
                          <span className="font-mono ml-2" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            {[place.state, place.country].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                      {place.countryCode && (
                        <span className="font-mono flex-shrink-0" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          {place.countryCode}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label
              className="block font-rounded uppercase tracking-widest"
              style={{ fontSize: 10, color: 'var(--text-secondary)' }}
            >
              NOTES <span style={{ color: 'var(--text-tertiary)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Anything worth remembering about them..."
              rows={2}
              className="w-full bg-transparent outline-none focus:outline-none focus:ring-0 font-serif resize-none"
              style={{
                fontSize: 13,
                color: 'var(--text-primary)',
                border: 'none',
                borderBottom: '1px solid var(--bg-tertiary)',
                paddingBottom: 6,
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Error / Success */}
          {error && (
            <div
              className="text-center py-3 px-4 rounded-xl font-serif italic"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13 }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="text-center py-3 px-4 rounded-xl font-serif italic"
              style={{ background: 'var(--accent-primary)1a', color: 'var(--accent-primary)', fontSize: 13 }}
            >
              Changes saved ✦
            </div>
          )}

        </form>

        {/* ── Footer actions ── */}
        <div
          className="flex items-center justify-between flex-shrink-0 px-6 py-4"
          style={{ borderTop: '1px solid var(--bg-tertiary)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="font-rounded uppercase tracking-widest transition-colors"
            style={{ fontSize: 11, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-member-form"
            disabled={isSaving || success}
            onClick={handleSubmit}
            className="flex items-center gap-2 font-rounded uppercase tracking-widest transition-all"
            style={{
              fontSize: 11,
              padding: '8px 20px',
              borderRadius: 20,
              background: success ? 'var(--accent-ai, #7c6ac8)' : 'var(--accent-primary)',
              color: 'var(--text-inverse, #fff)',
              border: 'none',
              cursor: isSaving || success ? 'default' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Saving...
              </>
            ) : success ? (
              <>
                <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Saved
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
