'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Button } from '@/components/ui/Button';
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
      <p className="font-rounded uppercase tracking-widest"
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
      <p className="font-rounded uppercase tracking-widest"
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

const LABEL: React.CSSProperties = { fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 5 };

function OverviewTab({ user, onEditClick, onNavigate }: { user: any; onEditClick: () => void; onNavigate: (tab: TabId) => void }) {
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

  const traitGroups = [
    { label: 'Strengths', items: strengths, color: '#7FA87A' },
    { label: 'Shadows',   items: shadows,   color: '#C47A7A' },
    { label: 'Triggers',  items: triggers,  color: '#C4A87A' },
    { label: 'Needs',     items: needs,     color: '#9B8EC4' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Identity ── 3-column grid ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 32px', paddingBottom: 16 }}>
        {[
          { label: 'Name',          value: displayName ?? user.email,      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /> },
          { label: 'Email',         value: user.email,                      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
          { label: 'Date of Birth', value: user.date_of_birth ? new Date(user.date_of_birth + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + (user.time_of_birth ? `  ·  ${user.time_of_birth}` : '') : null, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
          { label: 'Origin',        value: user.place_of_birth ?? null,     icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /> },
          { label: 'Member Since',  value: memberSince,                     icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" /></> },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ paddingBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <svg width={10} height={10} fill="none" stroke="var(--text-tertiary)" viewBox="0 0 24 24" strokeWidth={1.8}>{icon}</svg>
              <p style={{ ...LABEL, marginBottom: 0 }}>{label}</p>
            </div>
            <p className="font-serif" style={{ fontSize: 15, color: value ? 'var(--text-primary)' : 'var(--text-tertiary)', fontStyle: value ? 'normal' : 'italic' }}>
              {value ?? 'not set'}
            </p>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 16 }}>
          <button onClick={onEditClick}
            className="flex items-center gap-1.5"
            style={{ ...LABEL, marginBottom: 0, cursor: 'pointer', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-tertiary)', borderRadius: 20, padding: '5px 10px', transition: 'color 0.15s, border-color 0.15s, background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-tertiary)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--bg-tertiary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
            <PencilIcon size={9} /> Edit in Settings
          </button>
        </div>
      </div>

      <DottedDivider />

      {/* ── 3-col: Activity | Self-Awareness | Signal + Numbers ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 48px', paddingTop: 24, paddingBottom: 24 }}>

        {/* Col 1 — Activity */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <svg width={10} height={10} fill="none" stroke="var(--text-tertiary)" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <p style={{ ...LABEL, marginBottom: 0 }}>Activity</p>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px' }}>
            {[
              { value: totalTraits,           label: 'Traits',    color: 'var(--accent-primary)' },
              { value: incidents.length,      label: 'Incidents', color: '#C47A7A' },
              { value: patterns.length,       label: 'Patterns',  color: '#C4A87A' },
              { value: journalEntries.length, label: 'Journal',   color: 'var(--accent-ai)' },
            ].map(({ value, label, color }) => (
              <div key={label}>
                <p className="font-serif" style={{ fontSize: 28, fontWeight: 300, color, lineHeight: 1, marginBottom: 4 }}>{value}</p>
                <p style={LABEL}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2 — Self-Awareness */}
        <div style={{ borderLeft: '1px dashed var(--bg-tertiary)', paddingLeft: 40, paddingRight: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <svg width={10} height={10} fill="none" stroke="var(--text-tertiary)" viewBox="0 0 24 24" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
            <p style={{ ...LABEL, marginBottom: 0 }}>Self-Awareness</p>
          </div>
          {totalTraits === 0 ? (
            <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 12 }}>
              Start logging traits.
            </p>
          ) : (
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px' }}>
              {traitGroups.map(({ label, items, color }) => (
                <div key={label}>
                  <p className="font-serif" style={{ fontSize: 28, fontWeight: 300, color, lineHeight: 1, marginBottom: 4 }}>{items.length}</p>
                  <p style={LABEL}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Col 3 — Journal + Numerology */}
        <div style={{ borderLeft: '1px dashed var(--bg-tertiary)', paddingLeft: 40, paddingRight: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <svg width={10} height={10} fill="none" stroke="var(--text-tertiary)" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0L19 8.414a2 2 0 010 2.828L12.414 17H9v-3.586z" /></svg>
              <p style={{ ...LABEL, marginBottom: 0 }}>Last Journal Signal</p>
            </div>
            {lastJournal ? (
              <>
                <p className="font-serif" style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8 }}>{lastJournalDate}</p>
                <p className="font-serif italic" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4 }}>
                  {lastJournal.content?.slice(0, 80)}{(lastJournal.content?.length ?? 0) > 80 ? '…' : ''}
                </p>
              </>
            ) : (
              <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8 }}>No entries yet.</p>
            )}
          </div>

          {(lifePath || personalYear) && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <svg width={10} height={10} fill="none" stroke="var(--text-tertiary)" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                <p style={{ ...LABEL, marginBottom: 0 }}>Numerology</p>
              </div>
              <div style={{ display: 'flex', gap: 28, marginTop: 12 }}>
                {lifePath && (
                  <div>
                    <p style={{ ...LABEL, color: 'var(--accent-primary)' }}>Life Path</p>
                    <p className="font-serif" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>{lifePath}</p>
                  </div>
                )}
                {personalYear && (
                  <div>
                    <p style={{ ...LABEL, color: 'var(--accent-ai)' }}>Personal Year</p>
                    <p className="font-serif" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>{personalYear}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      <DottedDivider />

      {/* ── Explore ────────────────────────────────────────── */}
      <div style={{ paddingTop: 24, paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
          <svg width={10} height={10} fill="none" stroke="var(--text-tertiary)" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          <p style={{ ...LABEL, marginBottom: 0 }}>Explore</p>
        </div>
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 32px' }}>
          {([
            { id: 'traits',     label: 'Traits',      desc: 'Strengths, shadows, triggers, needs',  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> },
            { id: 'patterns',   label: 'Patterns',    desc: 'Recurring behavioural dynamics',        icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></> },
            { id: 'incidents',  label: 'Incidents',   desc: 'Significant moments, logged',           icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
            { id: 'journal',    label: 'Journal',     desc: 'Your inner signal stream',              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0L19 8.414a2 2 0 010 2.828L12.414 17H9v-3.586z" /> },
            { id: 'numerology', label: 'Numerology',  desc: 'Your numbers decoded',                  icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></> },
            { id: 'astrology',  label: 'Astrology',   desc: 'Planetary influences on you',           icon: <><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></> },
          ] as { id: TabId; label: string; desc: string; icon: React.ReactNode }[]).map(({ id, label, desc, icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="text-left transition-all group"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0', borderTop: '1px solid var(--bg-tertiary)' }}
              onMouseEnter={e => (e.currentTarget.style.borderTopColor = 'var(--accent-primary)')}
              onMouseLeave={e => (e.currentTarget.style.borderTopColor = 'var(--bg-tertiary)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <svg width={13} height={13} fill="none" stroke="var(--text-tertiary)" viewBox="0 0 24 24" strokeWidth={1.8}>{icon}</svg>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                  {label}
                </p>
              </div>
              <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{desc}</p>
            </button>
          ))}
        </div>
      </div>

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
              <button onClick={cancelEdit} className="font-rounded uppercase tracking-widest"
                style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="font-rounded uppercase tracking-widest"
                style={{ fontSize: 10, padding: '6px 16px', borderRadius: 999, background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: isSaving ? 'default' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 font-rounded uppercase tracking-widest"
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
        <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 16 }}>Identity</p>
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
              <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>Birth Date</p>
              <DatePicker label="" value={form.date_of_birth} onChange={v => setForm(p => ({ ...p, date_of_birth: v }))} />
            </div>
            <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--bg-tertiary)', marginBottom: 16 }}>
              <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>Birth Time</p>
              <TimePicker label="" value={form.time_of_birth} onChange={v => setForm(p => ({ ...p, time_of_birth: v }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>Place of Birth</p>
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
        <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 16 }}>Theme</p>
        <ThemeSelector />
      </div>

      <div style={{ height: 1, background: 'var(--bg-tertiary)', marginBottom: 24 }} />

      {/* Security */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: showPwForm ? 16 : 8 }}>
          <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Security</p>
          {!showPwForm && (
            <button onClick={() => setShowPwForm(true)}
              className="font-rounded uppercase tracking-widest"
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
                <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>{label}</p>
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
                className="font-rounded uppercase tracking-widest"
                style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={pwSaving} className="font-rounded uppercase tracking-widest"
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
          className="font-rounded uppercase tracking-widest"
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
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const tab = searchParams.get('tab') as TabId | null;
    return (tab && TABS.some(t => t.id === tab)) ? tab : 'overview';
  });
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

  // Tab counts for header
  const { data: allTraitsData }    = useGetTraitsQuery({} as any, { skip: !user });
  const { data: allPatternsData }  = useGetPatternsQuery({ memberId: 'self' }, { skip: !user });
  const { data: allIncidentsData } = useGetIncidentsQuery({ memberId: 'self' }, { skip: !user });
  const { data: allJournalData }   = useGetJournalEntriesQuery({ memberId: 'self' }, { skip: !user });

  const TAB_COUNTS: Partial<Record<TabId, number>> = {
    traits:    allTraitsData?.data?.length,
    patterns:  allPatternsData?.data?.length,
    incidents: allIncidentsData?.data?.length,
    journal:   allJournalData?.data?.length,
  };

  const TAB_DESCS: Partial<Record<TabId, string>> = {
    overview:   'Your identity at a glance',
    traits:     'Strengths, shadows, triggers & needs',
    patterns:   'Recurring behavioural dynamics',
    incidents:  'Significant moments, logged',
    journal:    'Your inner signal stream',
    numerology: 'Your numbers decoded',
    astrology:  'Planetary influences on you',
    report:     'AI-generated self analysis',
    settings:   'Manage your account & preferences',
  };

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
        return <OverviewTab user={user} onEditClick={() => setActiveTab('settings')} onNavigate={setActiveTab} />;
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
            userName={user?.full_name?.split(' ')[0] || user?.first_name || user?.email || 'You'}
            userPhotoUrl={user?.avatar_url ?? undefined}
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

  const getActionButton = () => {
    if (addAction) return <Button onClick={addAction}>{addLabel}</Button>;
    if (activeTab === 'numerology' && canGenerateNumerology)
      return <Button onClick={handleGenerateNumerology} disabled={isGeneratingNumerology}>{isGeneratingNumerology ? 'Generating…' : hasNumerologyData ? 'Regenerate' : 'Generate Numerology'}</Button>;
    if (activeTab === 'astrology' && canGenerateAstrology)
      return <Button onClick={handleGenerateAstrology} disabled={isGeneratingAstrology}>{isGeneratingAstrology ? 'Generating…' : hasAstrologyData ? 'Regenerate' : 'Generate Astrology'}</Button>;
    if (activeTab === 'report') {
      const hasReport = Boolean(selfReportResponse?.data?.text);
      return <Button onClick={() => { if (selfReportTriggered) refetchSelfReport(); else setSelfReportTriggered(true); }} disabled={isGeneratingSelfReport}>{isGeneratingSelfReport ? 'Generating…' : hasReport ? 'Regenerate Report' : 'Generate Report'}</Button>;
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
        <nav className="pl-10 pr-4 flex-1 overflow-y-auto" style={{ paddingTop: 20 }}>
          {([
            { group: null,         ids: ['overview'] },
            { group: 'Logged',     ids: ['traits', 'patterns', 'incidents', 'journal'] },
            { group: 'Cosmic',     ids: ['numerology', 'astrology'] },
            { group: 'Insights',   ids: ['report'] },
            { group: null,         ids: ['settings'] },
          ] as { group: string | null; ids: TabId[] }[]).map(({ group, ids }, gi) => (
            <div key={gi} style={{ marginBottom: 16 }}>
              {ids.map(id => {
                const tab = TABS.find(t => t.id === id)!;
                return (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className="w-full text-left flex items-center gap-2.5 transition-all"
                    style={{ color: activeTab === id ? 'var(--accent-primary)' : 'var(--text-tertiary)', padding: '3px 4px' }}
                    onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, transition: 'all 150ms', backgroundColor: activeTab === id ? 'var(--accent-primary)' : 'transparent', border: activeTab === id ? 'none' : '1px solid var(--bg-tertiary)' }} />
                    <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: activeTab === id ? 600 : 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
              {gi < 4 && <div style={{ height: 1, background: 'var(--bg-tertiary)', margin: '10px 0 0', opacity: 0.6 }} />}
            </div>
          ))}
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
        <div className="flex-shrink-0 flex items-center justify-between px-8 border-b shadow-sm" style={{ background: 'var(--bg-primary)', borderColor: 'var(--bg-tertiary)', paddingTop: 14, paddingBottom: 14 }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 2 }}>
              {TABS.find(t => t.id === activeTab)?.label}
              {TAB_COUNTS[activeTab] !== undefined && (
                <span style={{ fontSize: 18, color: 'var(--text-tertiary)', fontWeight: 300, marginLeft: 8, verticalAlign: 'baseline' }}>
                  ({TAB_COUNTS[activeTab]})
                </span>
              )}
            </h2>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 400, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              {TAB_DESCS[activeTab]}
            </p>
          </div>
          {getActionButton()}
        </div>

        {/* Tab content */}
        <div className={`flex-1 min-h-0 ${(['overview', 'settings'] as TabId[]).includes(activeTab) ? 'overflow-y-auto px-8 py-8' : 'flex flex-col overflow-hidden'}`}>
          {renderTab()}
        </div>
      </main>
    </div>
  );
}
