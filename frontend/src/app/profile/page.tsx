'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUser, updateUser } from '@/store/slices/authSlice';
import { clearTokens } from '@/lib/tokenStorage';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { getPlaces, formatPlaceName, type PlaceResult } from '@/lib/places';
import { updateProfile, changePassword } from '@/lib/api/profile';
import { MemberNumerologyTab } from '@/components/members/tabs/MemberNumerologyTab';
import { MemberAstrologyTab } from '@/components/members/tabs/MemberAstrologyTab';
import { MemberJournalTab } from '@/components/members/tabs/MemberJournalTab';
import { MemberIncidentsTab } from '@/components/members/tabs/MemberIncidentsTab';
import { MemberPatternsTab } from '@/components/members/tabs/MemberPatternsTab';
import { UserTraitsTab } from '@/components/profile/UserTraitsTab';
import { UserSelfReportTab } from '@/components/profile/UserSelfReportTab';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { useGetTraitsQuery } from '@/store/api/traitsApi';
import { useGetMyNumerologyQuery, useCalculateNumerologyMutation } from '@/store/api/numerologyApi';
import { useGetMyAstrologyQuery, useCalculateAstrologyMutation } from '@/store/api/astrologyApi';
import { useLumenSelfReportQuery } from '@/store/api/lumenApi';
import { getAccessToken } from '@/lib/tokenStorage';
import { useGetJournalEntriesQuery } from '@/store/api/journalApi';
import { useGetIncidentsQuery } from '@/store/api/incidentsApi';
import { useGetPatternsQuery } from '@/store/api/patternsApi';

export const dynamic = 'force-dynamic';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'traits' | 'patterns' | 'incidents' | 'journal' | 'numerology' | 'astrology' | 'report' | 'settings';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',   label: 'Overview'   },
  { id: 'traits',     label: 'Traits'     },
  { id: 'patterns',   label: 'Patterns'   },
  { id: 'incidents',  label: 'Incidents'  },
  { id: 'journal',    label: 'Journal'    },
  { id: 'numerology', label: 'Numerology' },
  { id: 'astrology',  label: 'Astrology'  },
  { id: 'report',     label: 'Report'     },
  { id: 'settings',   label: 'Settings'   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function PencilIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
    </svg>
  );
}

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="font-mono uppercase tracking-widest"
        style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>
        {label}
      </p>
      <p className="font-serif"
        style={{ fontSize: 15, color: value ? 'var(--text-primary)' : 'var(--text-tertiary)', fontStyle: value ? 'normal' : 'italic' }}>
        {value || 'not set'}
      </p>
    </div>
  );
}

function EditRow({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <p className="font-mono uppercase tracking-widest"
        style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>
        {label}
      </p>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none font-serif"
        style={{ fontSize: 15, color: 'var(--text-primary)', border: 'none', padding: 0 }}
      />
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function TraitPill({ label, color }: { label: string; color: string }) {
  return (
    <span className="font-serif text-xs px-2.5 py-0.5 rounded-full capitalize"
      style={{ background: `${color}12`, border: `1px solid ${color}33`, color }}>
      {label}
    </span>
  );
}

function OverviewTab({ user, onEditClick }: { user: any; onEditClick: () => void }) {
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || null;
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const { data: strengthsData }  = useGetTraitsQuery({ category: 'strength' });
  const { data: shadowsData }    = useGetTraitsQuery({ category: 'shadow' });
  const { data: triggersData }   = useGetTraitsQuery({ category: 'trigger' });
  const { data: needsData }      = useGetTraitsQuery({ category: 'need' });
  const { data: numerologyData } = useGetMyNumerologyQuery();
  const { data: journalData }    = useGetJournalEntriesQuery({ memberId: 'self' });
  const { data: incidentsData }  = useGetIncidentsQuery({ memberId: 'self' });
  const { data: patternsData }   = useGetPatternsQuery({ memberId: 'self' });

  const strengths  = strengthsData?.data ?? [];
  const shadows    = shadowsData?.data ?? [];
  const triggers   = triggersData?.data ?? [];
  const needs      = needsData?.data ?? [];
  const totalTraits = strengths.length + shadows.length + triggers.length + needs.length;

  const journalEntries = journalData?.data ?? [];
  const incidents      = incidentsData?.data ?? [];
  const patterns       = patternsData?.data ?? [];

  const lastJournal = journalEntries[0];
  const lastJournalDate = lastJournal?.createdAt
    ? new Date(lastJournal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
    : null;

  const lifePath    = numerologyData?.coreNumbers?.lifePath;
  const personalYear = numerologyData?.timingNumbers?.personalYear;

  const activityStats = [
    { value: totalTraits,        label: 'total traits'   },
    { value: incidents.length,   label: 'incidents'      },
    { value: patterns.length,    label: 'patterns'       },
    { value: journalEntries.length, label: 'journal entries' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      {/* ── Identity ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-3">
        {displayName && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>Name</p>
            <p className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
          </div>
        )}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>Email</p>
          <p className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>{user.email}</p>
        </div>
        {user.date_of_birth && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>Date of Birth</p>
            <p className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>
              {new Date(user.date_of_birth + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              {user.time_of_birth && (
                <span className="font-mono text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>{user.time_of_birth}</span>
              )}
            </p>
          </div>
        )}
        {user.place_of_birth && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>Origin</p>
            <p className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>{user.place_of_birth}</p>
          </div>
        )}
        {memberSince && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>Member Since</p>
            <p className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>{memberSince}</p>
          </div>
        )}
      </div>

      <button onClick={onEditClick}
        className="flex items-center gap-2 font-mono uppercase tracking-widest self-start"
        style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: '1px solid var(--bg-tertiary)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
        <PencilIcon size={9} /> Edit in Settings
      </button>

      <DottedDivider />

      {/* ── Activity ───────────────────────────────────────── */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-tertiary)' }}>Activity</p>
        <div className="flex items-end gap-8">
          {activityStats.map(({ value, label }, i, arr) => (
            <div key={label} className="flex items-end gap-8">
              <div>
                <span className="font-serif" style={{ fontSize: 32, lineHeight: 1, color: 'var(--text-primary)' }}>{value}</span>
                <p className="font-mono text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
              </div>
              {i < arr.length - 1 && (
                <span className="font-serif text-lg pb-1.5" style={{ color: 'var(--bg-tertiary)' }}>&middot;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Last Journal Signal ────────────────────────────── */}
      {lastJournal && (
        <>
          <DottedDivider />
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>Last Journal Signal</p>
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs uppercase tracking-widest flex-shrink-0 mt-0.5 px-2 py-0.5 rounded"
                style={{ background: 'var(--surface)', color: 'var(--text-tertiary)', border: '1px solid var(--bg-tertiary)' }}>
                {lastJournalDate}
              </span>
              <p className="font-serif text-base leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>
                {lastJournal.content?.slice(0, 160)}{lastJournal.content?.length > 160 ? '…' : ''}
              </p>
            </div>
          </div>
        </>
      )}

      <DottedDivider />

      {/* ── Self-Awareness ─────────────────────────────────── */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest mb-5" style={{ color: 'var(--text-tertiary)' }}>Self-Awareness Map</p>
        {totalTraits === 0 ? (
          <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            Start logging your traits to build self-awareness over time.
          </p>
        ) : (
          <div className="flex flex-col">
            {[
              { label: 'Strengths', items: strengths, color: '#7FA87A' },
              { label: 'Shadows',   items: shadows,   color: '#C47A7A' },
              { label: 'Triggers',  items: triggers,  color: '#C4A87A' },
              { label: 'Needs',     items: needs,     color: '#9B8EC4' },
            ].map(({ label, items, color }, i, arr) => (
              <div key={label}>
                <div className="flex items-start gap-5 py-4">
                  {/* Accent bar + count + label */}
                  <div className="flex items-stretch gap-3 flex-shrink-0" style={{ width: 100 }}>
                    <div style={{ width: 3, minHeight: 42, borderRadius: 2, backgroundColor: color, opacity: 0.6, alignSelf: 'stretch' }} />
                    <div className="flex flex-col justify-center">
                      <span className="font-serif" style={{ fontSize: 30, lineHeight: 1, color: 'var(--text-primary)' }}>{items.length}</span>
                      <p className="font-mono uppercase" style={{ fontSize: 9, color, marginTop: 5, letterSpacing: '0.1em' }}>{label}</p>
                    </div>
                  </div>
                  {/* Pills */}
                  <div className="flex-1 flex flex-wrap gap-1.5 pt-1.5">
                    {items.length > 0 ? (
                      items.map((t: any) => (
                        <span key={t.id} className="font-serif text-xs px-2.5 py-1 rounded-full"
                          style={{ background: `${color}12`, border: `1px solid ${color}28`, color: 'var(--text-secondary)' }}>
                          {t.description}
                        </span>
                      ))
                    ) : (
                      <p className="font-serif italic text-xs pt-1" style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}>none logged</p>
                    )}
                  </div>
                </div>
                {i < arr.length - 1 && <DottedDivider />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Numerology Snapshot ────────────────────────────── */}
      {(lifePath || personalYear) && (
        <>
          <DottedDivider />
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-tertiary)' }}>Numerology Snapshot</p>
            <div className="flex gap-4">
              {lifePath && (
                <div style={{ padding: '12px 18px', borderRadius: 12, border: '1px solid var(--accent-primary)33', background: 'var(--accent-primary)0d', minWidth: 100 }}>
                  <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--accent-primary)', marginBottom: 4 }}>Life Path</p>
                  <p className="font-serif" style={{ fontSize: 28, color: 'var(--text-primary)', lineHeight: 1 }}>{lifePath}</p>
                </div>
              )}
              {personalYear && (
                <div style={{ padding: '12px 18px', borderRadius: 12, border: '1px solid var(--accent-ai)33', background: 'var(--accent-ai)0d', minWidth: 100 }}>
                  <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--accent-ai)', marginBottom: 4 }}>Personal Year</p>
                  <p className="font-serif" style={{ fontSize: 28, color: 'var(--text-primary)', lineHeight: 1 }}>{personalYear}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}

// ── Settings tab ──────────────────────────────────────────────────────────────

function SettingsTab({ user }: { user: any }) {
  const router   = useRouter();
  const dispatch = useAppDispatch();
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

  const initials = ((user.first_name ?? user.email ?? '?')).charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Avatar + name header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--bg-tertiary)' }}>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span className="font-serif" style={{ fontSize: 18, color: '#fff' }}>{initials}</span>}
            </div>
            {editing && (
              <>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <button type="button" onClick={() => avatarInputRef.current?.click()}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <PencilIcon size={7} />
                </button>
              </>
            )}
          </div>
          <div>
            <p className="font-serif" style={{ fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}
            </p>
            <p className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="font-serif italic" style={{ fontSize: 12, color: 'var(--accent-primary)' }}>{saveMsg}</span>}
          {editing ? (
            <>
              <button onClick={cancelEdit} className="font-mono uppercase tracking-widest"
                style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="font-mono uppercase tracking-widest"
                style={{ fontSize: 10, padding: '6px 16px', borderRadius: 999, background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: isSaving ? 'default' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 font-mono uppercase tracking-widest"
              style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
              <PencilIcon size={9} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Identity fields */}
      <div style={{ marginBottom: 28 }}>
        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 16 }}>Identity</p>
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
              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>Birth Date</p>
              <DatePicker label="" value={form.date_of_birth} onChange={v => setForm(p => ({ ...p, date_of_birth: v }))} />
            </div>
            <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--bg-tertiary)', marginBottom: 16 }}>
              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>Birth Time</p>
              <TimePicker label="" value={form.time_of_birth} onChange={v => setForm(p => ({ ...p, time_of_birth: v }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>Place of Birth</p>
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
                  style={{ fontSize: 15, color: 'var(--text-primary)', border: 'none', padding: 0 }}
                />
                {showPlaces && placeResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    {placeResults.map((place, i) => (
                      <button key={i} type="button" onClick={() => selectPlace(place)}
                        className="w-full text-left"
                        style={{ padding: '8px 14px', background: activePlaceIdx === i ? 'var(--bg-tertiary)' : 'transparent', border: 'none', borderBottom: i < placeResults.length - 1 ? '1px solid var(--bg-tertiary)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="font-serif" style={{ fontSize: 14, color: 'var(--text-primary)' }}>{place.name}</span>
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

      <div style={{ height: 1, background: 'var(--bg-tertiary)', marginBottom: 24 }} />

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
              className="font-mono uppercase tracking-widest"
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
              { key: 'current', label: 'Current Password', placeholder: 'the one you remember' },
              { key: 'next',    label: 'New Password',     placeholder: 'something only you know' },
              { key: 'confirm', label: 'Confirm',          placeholder: 'say it again' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ paddingBottom: 12, borderBottom: '1px solid var(--bg-tertiary)', marginBottom: 12 }}>
                <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>{label}</p>
                <input type="password" value={pwForm[key as keyof typeof pwForm]}
                  onChange={e => { setPwForm(p => ({ ...p, [key]: e.target.value })); setPwError(''); }}
                  placeholder={placeholder}
                  className="w-full bg-transparent outline-none font-serif"
                  style={{ fontSize: 15, color: 'var(--text-primary)', border: 'none', padding: 0 }} />
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
                style={{ fontSize: 10, padding: '6px 16px', borderRadius: 999, background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: pwSaving ? 'default' : 'pointer', opacity: pwSaving ? 0.7 : 1 }}>
                {pwSaving ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        ) : (
          <p className="font-serif italic" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Your password keeps your light private.</p>
        )}
      </div>

      <div style={{ height: 1, background: 'var(--bg-tertiary)', marginBottom: 20 }} />

      {/* Sign out */}
      <div className="flex items-center justify-between">
        <p className="font-serif italic" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Your theme travels with you.</p>
        <button onClick={handleSignOut} disabled={signingOut}
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: signingOut ? 'default' : 'pointer', opacity: signingOut ? 0.5 : 1 }}
          onMouseEnter={e => { if (!signingOut) (e.currentTarget.style.color = '#ef4444'); }}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
          {signingOut ? 'Leaving...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const user = useAppSelector(s => s.auth.user);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [traitsAddOpen, setTraitsAddOpen]       = useState(false);
  const [patternsAddOpen, setPatternsAddOpen]   = useState(false);
  const [incidentsAddOpen, setIncidentsAddOpen] = useState(false);
  const [journalAddOpen, setJournalAddOpen]     = useState(false);
  const [numerologyError, setNumerologyError]   = useState<string | null>(null);
  const [astrologyError, setAstrologyError]     = useState<string | null>(null);
  const [selfReportTriggered, setSelfReportTriggered] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const idx = TABS.findIndex(t => t.id === activeTab);
        const next = e.key === 'ArrowDown'
          ? (idx < TABS.length - 1 ? idx + 1 : 0)
          : (idx > 0 ? idx - 1 : TABS.length - 1);
        setActiveTab(TABS[next].id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab]);

  const { data: myNumerologyData } = useGetMyNumerologyQuery(undefined, { skip: !user });
  const [calculateNumerology, { isLoading: isGeneratingNumerology }] = useCalculateNumerologyMutation();
  const { data: myAstrologyData } = useGetMyAstrologyQuery(undefined, { skip: !user });
  const [calculateAstrology, { isLoading: isGeneratingAstrology }] = useCalculateAstrologyMutation();
  const { data: selfReportResponse, isLoading: isGeneratingSelfReport, refetch: refetchSelfReport } = useLumenSelfReportQuery(undefined, { skip: !selfReportTriggered });

  if (!user) return null;

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || null;
  const initials    = (displayName ?? user.email ?? '?').charAt(0).toUpperCase();

  // Shape user as a "member" object for shared tab components that need it
  const userAsMember = {
    id:           user.id,
    fullName:     displayName ?? user.email ?? '',
    dateOfBirth:  user.date_of_birth ?? undefined,
    timeOfBirth:  user.time_of_birth ?? undefined,
    placeOfBirth: user.place_of_birth ?? undefined,
    relationType: 'self',
    createdAt:    user.created_at,
  };

  // 'self' sentinel for journal/incidents — backend resolves to member_id IS NULL
  const selfMember = { ...userAsMember, id: 'self' };

  const canGenerateNumerology = Boolean(user.date_of_birth && (user.first_name || user.last_name || user.email));
  const hasNumerologyData = Boolean(myNumerologyData);
  const canGenerateAstrology = Boolean(user.date_of_birth && user.time_of_birth && user.place_of_birth);
  const hasAstrologyData = Boolean(myAstrologyData);

  const handleGenerateNumerology = async () => {
    if (!user.date_of_birth) return;
    setNumerologyError(null);
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '';
    try {
      await calculateNumerology({ dob: user.date_of_birth, fullName }).unwrap();
    } catch (err: any) {
      setNumerologyError(err?.data?.error?.message || 'Failed to generate. Please try again.');
    }
  };

  const handleGenerateAstrology = async () => {
    if (!user.date_of_birth || !user.time_of_birth || !user.place_of_birth) return;
    setAstrologyError(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const token = getAccessToken();
      let lat = 0, lon = 0, utcOffset = 0;
      try {
        const geoRes = await fetch(`${API_BASE}/astrology/geocode?place=${encodeURIComponent(user.place_of_birth)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (geoRes.ok) {
          const geoJson = await geoRes.json();
          lat = geoJson.data?.lat ?? 0;
          lon = geoJson.data?.lon ?? 0;
          utcOffset = geoJson.data?.utcOffset ?? 0;
        }
      } catch {}
      const firstName = user.first_name || user.email?.split('@')[0] || 'You';
      await calculateAstrology({
        dob: user.date_of_birth,
        birthTime: user.time_of_birth,
        lat, lon, utcOffset,
        memberName: firstName,
      }).unwrap();
    } catch (err: any) {
      setAstrologyError(err?.data?.error?.message || 'Failed to generate reading. Please try again.');
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab user={user} onEditClick={() => setActiveTab('settings')} />;
      case 'traits':
        return (
          <UserTraitsTab
            key="user-traits"
            externalAddOpen={traitsAddOpen}
            onExternalAddClose={() => setTraitsAddOpen(false)}
          />
        );
      case 'patterns':
        return (
          <MemberPatternsTab
            member={selfMember}
            externalAddOpen={patternsAddOpen}
            onExternalAddClose={() => setPatternsAddOpen(false)}
          />
        );
      case 'incidents':
        return (
          <MemberIncidentsTab
            member={selfMember}
            externalAddOpen={incidentsAddOpen}
            onExternalAddClose={() => setIncidentsAddOpen(false)}
          />
        );
      case 'journal':
        return (
          <MemberJournalTab
            member={selfMember}
            externalAddOpen={journalAddOpen}
            onExternalAddClose={() => setJournalAddOpen(false)}
          />
        );
      case 'numerology':
        return <MemberNumerologyTab member={userAsMember} isUser isExternalLoading={isGeneratingNumerology} />;
      case 'astrology':
        return <MemberAstrologyTab member={userAsMember} isUser isExternalLoading={isGeneratingAstrology} externalError={astrologyError} />;
      case 'report':
        return (
          <UserSelfReportTab
            reportText={selfReportResponse?.data?.text ?? null}
            isLoading={isGeneratingSelfReport}
          />
        );
      case 'settings':
        return <SettingsTab user={user} />;
      default:
        return null;
    }
  };

  const getAddAction = (): (() => void) | null => {
    switch (activeTab) {
      case 'traits':    return () => setTraitsAddOpen(true);
      case 'patterns':  return () => setPatternsAddOpen(true);
      case 'incidents': return () => setIncidentsAddOpen(true);
      case 'journal':   return () => setJournalAddOpen(true);
      default:          return null;
    }
  };

  const addAction = getAddAction();
  const ADD_LABELS: Partial<Record<TabId, string>> = {
    traits: 'Add Trait', patterns: 'Add Pattern', incidents: 'Add Incident', journal: 'New Entry',
  };
  const addLabel = ADD_LABELS[activeTab] ?? '';

  const getGenerateButton = () => {
    if (addAction) {
      return (
        <button onClick={addAction}
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: 10, padding: '7px 18px', borderRadius: 8, border: '1px solid var(--accent-primary)', background: 'transparent', color: 'var(--accent-primary)', cursor: 'pointer' }}>
          + {addLabel}
        </button>
      );
    }
    if (activeTab === 'numerology' && canGenerateNumerology) {
      return (
        <button onClick={handleGenerateNumerology} disabled={isGeneratingNumerology}
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: 10, padding: '7px 18px', borderRadius: 8, background: 'var(--accent-primary)', color: 'var(--text-inverse)', border: 'none', cursor: isGeneratingNumerology ? 'default' : 'pointer', opacity: isGeneratingNumerology ? 0.7 : 1 }}>
          {isGeneratingNumerology ? 'Generating…' : hasNumerologyData ? 'Regenerate Numerology' : 'Generate Numerology'}
        </button>
      );
    }
    if (activeTab === 'astrology' && canGenerateAstrology) {
      return (
        <button onClick={handleGenerateAstrology} disabled={isGeneratingAstrology}
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: 10, padding: '7px 18px', borderRadius: 8, background: 'var(--accent-primary)', color: 'var(--text-inverse)', border: 'none', cursor: isGeneratingAstrology ? 'default' : 'pointer', opacity: isGeneratingAstrology ? 0.7 : 1 }}>
          {isGeneratingAstrology ? 'Generating…' : hasAstrologyData ? 'Regenerate Astrology' : 'Generate Astrology'}
        </button>
      );
    }
    if (activeTab === 'report') {
      const hasReport = Boolean(selfReportResponse?.data?.text);
      return (
        <button
          onClick={() => { if (selfReportTriggered) refetchSelfReport(); else setSelfReportTriggered(true); }}
          disabled={isGeneratingSelfReport}
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: 10, padding: '7px 18px', borderRadius: 8, background: 'var(--accent-ai)', color: '#fff', border: 'none', cursor: isGeneratingSelfReport ? 'default' : 'pointer', opacity: isGeneratingSelfReport ? 0.7 : 1 }}>
          {isGeneratingSelfReport ? 'Generating…' : hasReport ? 'Regenerate Report' : 'Generate Report'}
        </button>
      );
    }
    return null;
  };


  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="w-48 flex flex-col h-full flex-shrink-0">
        {/* Back Navigation */}
        <div className="pl-12 pr-4 py-5 flex-shrink-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 transition-colors"
            style={{ color: 'var(--text-tertiary)', fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
        </div>

        {/* Avatar + name */}
        <div className="pl-12 pr-4 pt-4 pb-6" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
          <div className="text-center">
            <div style={{ width: 52, height: 52, margin: '0 auto 10px', borderRadius: '50%', overflow: 'hidden', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span className="font-serif" style={{ fontSize: 20, color: '#fff' }}>{initials}</span>}
            </div>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 3 }}>
              {displayName ?? 'You'}
            </p>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Self
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="pl-14 pr-4 flex-1 flex items-center" style={{ paddingTop: 16 }}>
          <div style={{ width: '100%' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="w-full text-left flex items-center gap-2.5 transition-all"
                style={{ color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-tertiary)', padding: '4px 0' }}
                onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, transition: 'all 150ms', backgroundColor: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent', border: activeTab === tab.id ? 'none' : '1px solid var(--bg-tertiary)' }} />
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: activeTab === tab.id ? 600 : 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom quote */}
        <div className="pl-8 pr-6 pb-6">
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontStyle: 'italic', fontWeight: 500, color: 'var(--text-tertiary)', lineHeight: 1.55 }}>
            "Know thyself first, then the world."
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-full ml-8 overflow-hidden">
        {/* Page header bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
          <div>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {TABS.find(t => t.id === activeTab)?.label}
            </p>
          </div>
          {getGenerateButton()}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {renderTab()}
        </div>
      </main>
    </div>
  );
}
