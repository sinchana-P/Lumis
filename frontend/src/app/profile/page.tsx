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

function PencilIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
    </svg>
  );
}

/* Flat label + value row */
function FieldRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="font-mono uppercase tracking-widest"
        style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>
        {label}
      </p>
      <p className="font-serif"
        style={{ fontSize: 14, color: value ? 'var(--text-primary)' : 'var(--text-tertiary)', fontStyle: value ? 'normal' : 'italic' }}>
        {value || 'not set'}
      </p>
    </div>
  );
}

/* Flat edit input */
function EditRow({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <p className="font-mono uppercase tracking-widest"
        style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>
        {label}
      </p>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none font-serif"
        style={{ fontSize: 14, color: 'var(--text-primary)', border: 'none', padding: 0 }}
      />
    </div>
  );
}

const D = () => <div style={{ height: 1, background: 'var(--bg-tertiary)', margin: '20px 0' }} />;

export default function ProfilePage() {
  const router   = useRouter();
  const dispatch = useAppDispatch();
  const user     = useAppSelector(s => s.auth.user);

  const [editing, setEditing]   = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');

  const [form, setForm] = useState({
    first_name:     user?.first_name     ?? '',
    last_name:      user?.last_name      ?? '',
    date_of_birth:  user?.date_of_birth  ?? '',
    time_of_birth:  user?.time_of_birth  ?? '',
    place_of_birth: user?.place_of_birth ?? '',
  });

  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url ?? null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [showPlaces, setShowPlaces]         = useState(false);
  const [placeResults, setPlaceResults]     = useState<PlaceResult[]>([]);
  const [placeLoading, setPlaceLoading]     = useState(false);
  const [activePlaceIdx, setActivePlaceIdx] = useState(-1);
  const placeRef     = useRef<HTMLDivElement>(null);
  const placeTimeout = useRef<NodeJS.Timeout>();

  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm]         = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError]       = useState('');
  const [pwSaving, setPwSaving]     = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name:     user.first_name     ?? '',
        last_name:      user.last_name      ?? '',
        date_of_birth:  user.date_of_birth  ?? '',
        time_of_birth:  user.time_of_birth  ?? '',
        place_of_birth: user.place_of_birth ?? '',
      });
      setAvatarPreview(user.avatar_url ?? null);
    }
  }, [user]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (placeRef.current && !placeRef.current.contains(e.target as Node)) setShowPlaces(false);
    };
    document.addEventListener('mousedown', h);
    return () => { document.removeEventListener('mousedown', h); clearTimeout(placeTimeout.current); };
  }, []);

  const searchPlaces = useCallback(async (q: string) => {
    if (q.length < 2) { setShowPlaces(false); setPlaceResults([]); return; }
    setPlaceLoading(true);
    try { const res = await getPlaces(q); setPlaceResults(res); setShowPlaces(true); setActivePlaceIdx(-1); }
    catch { setShowPlaces(false); }
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
    if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const cancelEdit = () => {
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(user?.avatar_url ?? null);
    setForm({
      first_name: user?.first_name ?? '', last_name: user?.last_name ?? '',
      date_of_birth: user?.date_of_birth ?? '', time_of_birth: user?.time_of_birth ?? '',
      place_of_birth: user?.place_of_birth ?? '',
    });
  };

  const handleSave = async () => {
    setIsSaving(true); setSaveMsg('');
    try {
      const res = await updateProfile({ ...form }, avatarFile);
      dispatch(updateUser(res.data.user));
      setAvatarFile(null); setSaveMsg('saved ✦'); setEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch { setSaveMsg('could not save — try again'); }
    finally { setIsSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault(); setPwError('');
    if (pwForm.next !== pwForm.confirm) { setPwError('passwords do not match'); return; }
    if (pwForm.next.length < 6) { setPwError('at least 6 characters'); return; }
    setPwSaving(true);
    try { await changePassword(pwForm.current, pwForm.next); setPwForm({ current: '', next: '', confirm: '' }); setShowPwForm(false); }
    catch (err: any) { setPwError(err.message || 'failed to update password'); }
    finally { setPwSaving(false); }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut(); clearTokens(); dispatch(clearUser()); router.push('/login');
  };

  if (!user) return null;

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || null;
  const initials    = (displayName ?? user.email ?? '?').charAt(0).toUpperCase();
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />

      <main className="w-full px-8 lg:px-16 pt-20 pb-20">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* ── Identity header ── */}
          <div className="flex items-center justify-between"
            style={{ paddingTop: 28, paddingBottom: 22, borderBottom: '1px solid var(--bg-tertiary)' }}>

            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', overflow: 'hidden',
                  background: 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span className="font-serif" style={{ fontSize: 20, color: '#fff' }}>{initials}</span>
                  }
                </div>
                {editing && (
                  <>
                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    <button type="button" onClick={() => avatarInputRef.current?.click()}
                      style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      <PencilIcon size={8} />
                    </button>
                  </>
                )}
              </div>

              <div>
                <p className="font-serif" style={{ fontSize: 20, color: displayName ? 'var(--text-primary)' : 'var(--text-tertiary)', fontStyle: displayName ? 'normal' : 'italic', lineHeight: 1.2 }}>
                  {displayName ?? 'No name set'}
                </p>
                <p className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {user.email}
                  {memberSince && <span style={{ marginLeft: 12, opacity: 0.55 }}>· since {memberSince}</span>}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {saveMsg && <span className="font-serif italic" style={{ fontSize: 12, color: 'var(--accent-primary)' }}>{saveMsg}</span>}
              {editing ? (
                <>
                  <button onClick={cancelEdit} className="font-mono uppercase tracking-widest"
                    style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="font-mono uppercase tracking-widest"
                    style={{ fontSize: 10, padding: '6px 18px', borderRadius: 999, background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: isSaving ? 'default' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 font-mono uppercase tracking-widest transition-colors"
                  style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
                  <PencilIcon size={10} /> Edit
                </button>
              )}
            </div>
          </div>

          {/* ── Two-column body ── */}
          <div className="grid gap-16 pt-8" style={{ gridTemplateColumns: '1fr 1fr' }}>

            {/* LEFT: Identity */}
            <div>
              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 20 }}>Identity</p>

              {editing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                  {[
                    { label: 'First Name', key: 'first_name', placeholder: 'First name' },
                    { label: 'Last Name',  key: 'last_name',  placeholder: 'Last name'  },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key} style={{ paddingBottom: 16, borderBottom: '1px solid var(--bg-tertiary)', marginBottom: 16 }}>
                      <EditRow label={label} value={form[key as keyof typeof form]}
                        onChange={v => setForm(p => ({ ...p, [key]: v }))} placeholder={placeholder} />
                    </div>
                  ))}

                  <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--bg-tertiary)', marginBottom: 16 }}>
                    <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>Birth Date</p>
                    <DatePicker label="" value={form.date_of_birth} onChange={v => setForm(p => ({ ...p, date_of_birth: v }))} />
                  </div>
                  <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--bg-tertiary)', marginBottom: 16 }}>
                    <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>Birth Time</p>
                    <TimePicker label="" value={form.time_of_birth} onChange={v => setForm(p => ({ ...p, time_of_birth: v }))} />
                  </div>

                  <div style={{ gridColumn: '1 / -1', paddingBottom: 4 }}>
                    <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>Place of Birth</p>
                    <div className="relative" ref={placeRef}>
                      <input type="text" value={form.place_of_birth}
                        onChange={e => handlePlaceInput(e.target.value)}
                        onFocus={() => { if (form.place_of_birth.length >= 2) setShowPlaces(true); }}
                        onKeyDown={e => {
                          if (!showPlaces || !placeResults.length) return;
                          if (e.key === 'ArrowDown') { e.preventDefault(); setActivePlaceIdx(i => Math.min(i + 1, placeResults.length - 1)); }
                          else if (e.key === 'ArrowUp') { e.preventDefault(); setActivePlaceIdx(i => Math.max(i - 1, -1)); }
                          else if (e.key === 'Enter' && activePlaceIdx >= 0) { e.preventDefault(); selectPlace(placeResults[activePlaceIdx]); }
                          else if (e.key === 'Escape') setShowPlaces(false);
                        }}
                        placeholder="City, Country" autoComplete="off"
                        className="w-full bg-transparent outline-none font-serif pr-5"
                        style={{ fontSize: 14, color: 'var(--text-primary)', border: 'none', padding: 0 }}
                      />
                      <div className="absolute right-0 top-0.5" style={{ color: 'var(--text-tertiary)', pointerEvents: 'none' }}>
                        {placeLoading
                          ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z" /></svg>}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                  {[
                    { label: 'First Name',    value: user.first_name    },
                    { label: 'Last Name',     value: user.last_name     },
                    { label: 'Birth Date',    value: user.date_of_birth },
                    { label: 'Birth Time',    value: user.time_of_birth },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ paddingBottom: 16, borderBottom: '1px solid var(--bg-tertiary)', marginBottom: 16 }}>
                      <FieldRow label={label} value={value} />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <FieldRow label="Place of Birth" value={user.place_of_birth} />
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Theme + Security + Sign out */}
            <div>

              {/* Theme */}
              <div style={{ marginBottom: 28 }}>
                <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 16 }}>Theme</p>
                <ThemeSelector />
              </div>

              <div style={{ height: 1, background: 'var(--bg-tertiary)', marginBottom: 24 }} />

              {/* Security */}
              <div style={{ marginBottom: 28 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: showPwForm ? 16 : 8 }}>
                  <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Security</p>
                  {!showPwForm && (
                    <button onClick={() => setShowPwForm(true)}
                      className="font-mono uppercase tracking-widest transition-colors"
                      style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
                      Change Password
                    </button>
                  )}
                </div>

                {showPwForm ? (
                  <form onSubmit={handlePasswordChange}>
                    {pwError && <p className="font-serif italic" style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{pwError}</p>}
                    {[
                      { key: 'current', label: 'Current Password' },
                      { key: 'next',    label: 'New Password' },
                      { key: 'confirm', label: 'Confirm' },
                    ].map(({ key, label }, idx) => (
                      <div key={key} style={{ paddingBottom: 12, borderBottom: '1px solid var(--bg-tertiary)', marginBottom: 12 }}>
                        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>{label}</p>
                        <input type="password" value={pwForm[key as keyof typeof pwForm]}
                          onChange={e => { setPwForm(p => ({ ...p, [key]: e.target.value })); setPwError(''); }}
                          className="w-full bg-transparent outline-none font-serif"
                          style={{ fontSize: 14, color: 'var(--text-primary)', border: 'none', padding: 0 }} />
                      </div>
                    ))}
                    <div className="flex items-center gap-4 pt-1">
                      <button type="button"
                        onClick={() => { setShowPwForm(false); setPwForm({ current: '', next: '', confirm: '' }); setPwError(''); }}
                        className="font-mono uppercase tracking-widest"
                        style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button type="submit" disabled={pwSaving} className="font-mono uppercase tracking-widest"
                        style={{ fontSize: 10, padding: '6px 18px', borderRadius: 999, background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: pwSaving ? 'default' : 'pointer', opacity: pwSaving ? 0.7 : 1 }}>
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

              <div style={{ height: 1, background: 'var(--bg-tertiary)', marginBottom: 20 }} />

              {/* Sign out */}
              <div className="flex items-center justify-between">
                <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                  Your theme travels with you.
                </p>
                <button onClick={handleSignOut} disabled={signingOut}
                  className="font-mono uppercase tracking-widest transition-colors"
                  style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: signingOut ? 'default' : 'pointer', opacity: signingOut ? 0.5 : 1 }}
                  onMouseEnter={e => { if (!signingOut) (e.currentTarget.style.color = '#ef4444'); }}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
                  {signingOut ? 'Leaving...' : 'Sign Out'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
