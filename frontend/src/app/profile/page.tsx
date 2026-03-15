'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUser, updateUser } from '@/store/slices/authSlice';
import { clearTokens } from '@/lib/tokenStorage';
import { Header } from '@/components/layout/Header';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { getPlaces, formatPlaceName, type PlaceResult } from '@/lib/places';
import { updateProfile, changePassword } from '@/lib/api/profile';

export const dynamic = 'force-dynamic';

// ─── Pencil icon ─────────────────────────────────────────────────────────────
function PencilIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
    </svg>
  );
}

// ─── Row: label + value (read mode) ─────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
      <span className="font-mono uppercase tracking-widest flex-shrink-0 w-28"
        style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
        {label}
      </span>
      <span className="font-serif flex-1"
        style={{ fontSize: 14, color: value ? 'var(--text-primary)' : 'var(--text-tertiary)', fontStyle: value ? 'normal' : 'italic' }}>
        {value || '—'}
      </span>
    </div>
  );
}

// ─── Inline text input (edit mode) ────────────────────────────────────────────
function EditRow({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="flex items-center gap-4 py-2" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
      <span className="font-mono uppercase tracking-widest flex-shrink-0 w-28"
        style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 font-serif"
        style={{ fontSize: 14, color: 'var(--text-primary)', border: 'none' }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // ── Edit mode ──
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // ── Form state ──
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    date_of_birth: user?.date_of_birth ?? '',
    time_of_birth: user?.time_of_birth ?? '',
    place_of_birth: user?.place_of_birth ?? '',
  });

  // ── Avatar ──
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url ?? null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Place autocomplete ──
  const [showPlaces, setShowPlaces] = useState(false);
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [activePlaceIdx, setActivePlaceIdx] = useState(-1);
  const placeRef = useRef<HTMLDivElement>(null);
  const placeTimeout = useRef<NodeJS.Timeout>();

  // ── Password change ──
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  // ── Sign out ──
  const [signingOut, setSigningOut] = useState(false);

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        date_of_birth: user.date_of_birth ?? '',
        time_of_birth: user.time_of_birth ?? '',
        place_of_birth: user.place_of_birth ?? '',
      });
      setAvatarPreview(user.avatar_url ?? null);
    }
  }, [user]);

  // Close place dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (placeRef.current && !placeRef.current.contains(e.target as Node)) setShowPlaces(false);
    };
    document.addEventListener('mousedown', handler);
    return () => { document.removeEventListener('mousedown', handler); clearTimeout(placeTimeout.current); };
  }, []);

  const searchPlaces = useCallback(async (q: string) => {
    if (q.length < 2) { setShowPlaces(false); setPlaceResults([]); return; }
    setPlaceLoading(true);
    try {
      const res = await getPlaces(q);
      setPlaceResults(res);
      setShowPlaces(true);
      setActivePlaceIdx(-1);
    } catch { setShowPlaces(false); }
    finally { setPlaceLoading(false); }
  }, []);

  const handlePlaceInput = (v: string) => {
    setForm(p => ({ ...p, place_of_birth: v }));
    clearTimeout(placeTimeout.current);
    placeTimeout.current = setTimeout(() => searchPlaces(v), 300);
  };

  const selectPlace = (place: PlaceResult) => {
    setForm(p => ({ ...p, place_of_birth: formatPlaceName(place) }));
    setShowPlaces(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const cancelEdit = () => {
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(user?.avatar_url ?? null);
    setForm({
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      date_of_birth: user?.date_of_birth ?? '',
      time_of_birth: user?.time_of_birth ?? '',
      place_of_birth: user?.place_of_birth ?? '',
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMsg('');
    try {
      const response = await updateProfile({ ...form });
      dispatch(updateUser(response.data.user));
      setSaveMsg('saved ✦');
      setEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch { setSaveMsg('could not save — try again'); }
    finally { setIsSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next !== pwForm.confirm) { setPwError('passwords do not match'); return; }
    if (pwForm.next.length < 6) { setPwError('at least 6 characters required'); return; }
    setPwSaving(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      setPwForm({ current: '', next: '', confirm: '' });
      setShowPwForm(false);
    } catch (err: any) { setPwError(err.message || 'failed to update password'); }
    finally { setPwSaving(false); }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    clearTokens();
    dispatch(clearUser());
    router.push('/login');
  };

  if (!user) return null;

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />

      <main className="w-full px-6 pt-16 pb-12" style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* ── Avatar + identity ── */}
        <div className="flex items-center gap-4 py-6" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center font-serif text-xl"
              style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse, #fff)' }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : initials}
            </div>
            {editing && (
              <>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', cursor: 'pointer' }}
                >
                  <PencilIcon size={9} />
                </button>
              </>
            )}
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="font-serif truncate" style={{ fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {displayName}
            </p>
            <p className="font-mono truncate mt-0.5" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              {user.email}
            </p>
          </div>

          {/* Edit / Save / Cancel */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {saveMsg && (
              <span className="font-serif italic" style={{ fontSize: 12, color: 'var(--accent-primary)' }}>
                {saveMsg}
              </span>
            )}
            {editing ? (
              <>
                <button
                  onClick={cancelEdit}
                  className="font-mono uppercase tracking-widest transition-colors"
                  style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="font-mono uppercase tracking-widest transition-all"
                  style={{
                    fontSize: 10,
                    padding: '6px 14px',
                    borderRadius: 16,
                    background: 'var(--accent-primary)',
                    color: 'var(--text-inverse, #fff)',
                    border: 'none',
                    cursor: isSaving ? 'default' : 'pointer',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 transition-colors"
                style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
              >
                <PencilIcon size={13} />
                <span className="font-mono uppercase tracking-widest" style={{ fontSize: 10 }}>Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Personal information ── */}
        <div className="py-5" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
          <p className="font-mono uppercase tracking-widest mb-3" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            Identity
          </p>

          {editing ? (
            <div className="space-y-0">
              <EditRow label="First Name" value={form.first_name} onChange={(v) => setForm(p => ({ ...p, first_name: v }))} placeholder="your first name" />
              <EditRow label="Last Name" value={form.last_name} onChange={(v) => setForm(p => ({ ...p, last_name: v }))} placeholder="your last name" />

              {/* Date + Time in one row */}
              <div className="grid grid-cols-2 gap-4 py-2" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                <DatePicker
                  label="Birth Date"
                  value={form.date_of_birth}
                  onChange={(v) => setForm(p => ({ ...p, date_of_birth: v }))}
                />
                <TimePicker
                  label="Birth Time"
                  value={form.time_of_birth}
                  onChange={(v) => setForm(p => ({ ...p, time_of_birth: v }))}
                />
              </div>

              {/* Place of birth with autocomplete */}
              <div className="flex items-center gap-4 py-2" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                <span className="font-mono uppercase tracking-widest flex-shrink-0 w-28"
                  style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Place</span>
                <div className="flex-1 relative" ref={placeRef}>
                  <input
                    type="text"
                    value={form.place_of_birth}
                    onChange={(e) => handlePlaceInput(e.target.value)}
                    onFocus={() => { if (form.place_of_birth.length >= 2) setShowPlaces(true); }}
                    onKeyDown={(e) => {
                      if (!showPlaces || !placeResults.length) return;
                      if (e.key === 'ArrowDown') { e.preventDefault(); setActivePlaceIdx(i => Math.min(i + 1, placeResults.length - 1)); }
                      else if (e.key === 'ArrowUp') { e.preventDefault(); setActivePlaceIdx(i => Math.max(i - 1, -1)); }
                      else if (e.key === 'Enter' && activePlaceIdx >= 0) { e.preventDefault(); selectPlace(placeResults[activePlaceIdx]); }
                      else if (e.key === 'Escape') setShowPlaces(false);
                    }}
                    placeholder="City, Country"
                    autoComplete="off"
                    className="w-full bg-transparent outline-none focus:outline-none focus:ring-0 font-serif pr-5"
                    style={{ fontSize: 14, color: 'var(--text-primary)', border: 'none' }}
                  />
                  <div className="absolute right-0 top-0.5" style={{ color: 'var(--text-tertiary)', pointerEvents: 'none' }}>
                    {placeLoading
                      ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z" /></svg>
                    }
                  </div>
                  {showPlaces && placeResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                      {placeResults.map((place, i) => (
                        <button key={i} type="button" onClick={() => selectPlace(place)}
                          className="w-full text-left transition-colors"
                          style={{ padding: '8px 14px', background: activePlaceIdx === i ? 'var(--bg-tertiary)' : 'transparent', border: 'none', borderBottom: i < placeResults.length - 1 ? '1px solid var(--bg-tertiary)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-primary)' }}><path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z" /></svg>
                          <span className="font-serif" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{place.name}</span>
                          {(place.state || place.country) && (
                            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{[place.state, place.country].filter(Boolean).join(', ')}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <InfoRow label="Name" value={displayName !== user.email ? displayName : undefined} />
              <InfoRow label="Birth Date" value={user.date_of_birth} />
              <InfoRow label="Birth Time" value={user.time_of_birth} />
              <InfoRow label="Place" value={user.place_of_birth} />
            </div>
          )}
        </div>

        {/* ── Appearance ── */}
        <div className="py-5" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
          <p className="font-mono uppercase tracking-widest mb-3" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            Theme
          </p>
          <ThemeSelector />
        </div>

        {/* ── Security ── */}
        <div className="py-5" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
          <div className="flex items-center justify-between mb-1">
            <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              Security
            </p>
            {!showPwForm && (
              <button
                onClick={() => setShowPwForm(true)}
                className="font-mono uppercase tracking-widest transition-colors"
                style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
              >
                Change Password
              </button>
            )}
          </div>

          {showPwForm ? (
            <form onSubmit={handlePasswordChange} className="mt-3 space-y-0">
              {pwError && (
                <p className="font-serif italic mb-3" style={{ fontSize: 12, color: '#ef4444' }}>{pwError}</p>
              )}
              {[
                { key: 'current', label: 'Current', placeholder: 'current password' },
                { key: 'next',    label: 'New',     placeholder: 'new password' },
                { key: 'confirm', label: 'Confirm', placeholder: 'confirm new password' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="flex items-center gap-4 py-2" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                  <span className="font-mono uppercase tracking-widest flex-shrink-0 w-20"
                    style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{label}</span>
                  <input
                    type="password"
                    value={pwForm[key as keyof typeof pwForm]}
                    onChange={(e) => { setPwForm(p => ({ ...p, [key]: e.target.value })); setPwError(''); }}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 font-serif"
                    style={{ fontSize: 14, color: 'var(--text-primary)', border: 'none' }}
                  />
                </div>
              ))}
              <div className="flex items-center gap-4 pt-3">
                <button type="button" onClick={() => { setShowPwForm(false); setPwForm({ current: '', next: '', confirm: '' }); setPwError(''); }}
                  className="font-mono uppercase tracking-widest"
                  style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={pwSaving}
                  className="font-mono uppercase tracking-widest"
                  style={{ fontSize: 10, padding: '6px 14px', borderRadius: 16, background: 'var(--accent-primary)', color: 'var(--text-inverse, #fff)', border: 'none', cursor: pwSaving ? 'default' : 'pointer', opacity: pwSaving ? 0.7 : 1 }}>
                  {pwSaving ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          ) : (
            <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              Your password keeps your light private.
            </p>
          )}
        </div>

        {/* ── Sign out ── */}
        <div className="pt-5 flex items-center justify-between">
          <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            Your theme travels with you.
          </p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="font-mono uppercase tracking-widest transition-colors"
            style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: signingOut ? 'default' : 'pointer', opacity: signingOut ? 0.5 : 1 }}
            onMouseEnter={(e) => { if (!signingOut) (e.currentTarget.style.color = '#ef4444'); }}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            {signingOut ? 'Leaving...' : 'Sign Out'}
          </button>
        </div>

      </main>
    </div>
  );
}
