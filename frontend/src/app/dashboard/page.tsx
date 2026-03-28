'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { useGetMembersQuery, useGetMemberHealthScoresQuery } from '@/store/api/membersApi';
import { useGetDashboardSummaryQuery } from '@/store/api/dashboardApi';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { TourButton } from '@/components/tour';

export const dynamic = 'force-dynamic';

// Vibrant, warm palette
const ORBIT_COLORS = [
  '#A8B8C8', // slate blue
  '#B4C4B8', // sage mist
  '#C4B8A8', // warm stone
  '#B8B0C8', // lavender mist
  '#A8C0C8', // dusty teal
  '#C8B8B0', // blush stone
];

// Generate positions based on real health scores — closer = healthier
const generateHealthBasedPositions = (
  members: any[],
  healthMap: Record<string, number>,
): { [key: string]: { d: number; a: number } } => {
  if (members.length === 0) return {};

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const membersWithHealth = members.map(m => ({
    ...m,
    health: healthMap[m.id] ?? getFallbackHealth(m),
  }));

  const sorted = [...membersWithHealth].sort((a, b) => b.health - a.health);
  const positions: { [key: string]: { d: number; a: number } } = {};

  sorted.forEach((member, i) => {
    const seed = member.id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    // Score 80-100 → orbit ring 1 (d≈13-16), 60-79 → ring 2 (d≈20-24), 40-59 → ring 3 (d≈27-31), <40 → outer (d≈33-37)
    const base = member.health >= 80 ? 14 : member.health >= 60 ? 22 : member.health >= 40 ? 29 : 35;
    const jitter = (seededRandom(seed) - 0.5) * 4;
    const distance = Math.max(12, Math.min(38, base + jitter));
    const baseAngle = (i * 360) / sorted.length;
    const angleVar = (seededRandom(seed + 1) - 0.5) * 30;
    positions[member.id] = { d: distance, a: baseAngle + angleVar };
  });

  return positions;
};

// Fallback health score when real data not yet loaded (seeded by member id for stability)
const getFallbackHealth = (member: any) => {
  const seed = member.id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
  return 45 + (seed % 30); // 45–75
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-rounded uppercase tracking-widest"
      style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 12 }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--bg-tertiary)', margin: '28px 0' }} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: membersResponse, refetch: refetchMembers } = useGetMembersQuery();
  const members = membersResponse?.data || [];
  const { data: healthScores } = useGetMemberHealthScoresQuery();
  const healthMap = Object.fromEntries((healthScores || []).map(h => [h.memberId, h.score]));
  const { data: dashSummary, isFetching: isRefreshing, refetch: refetchDashboard } = useGetDashboardSummaryQuery();

  const handleSync = () => {
    refetchDashboard();
    refetchMembers();
  };

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return <LoadingScreen />;

  const firstName = user.first_name || user.name?.split(' ')[0] || user.email?.split('@')[0] || 'there';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const totalMembers = members.length;
  const friendCount  = members.filter(m => m.relationType === 'friend').length;
  const familyCount  = members.filter(m => m.relationType === 'family').length;
  const daysTracked  = Math.max(1, Math.floor((Date.now() - new Date(user.created_at || Date.now()).getTime()) / 86400000));

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />

      <main className="w-full px-8 lg:px-16 pt-20 pb-16" data-tour="dashboard-main">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Greeting + Stats ── */}
          <div className="flex items-end justify-between" data-tour="dashboard-header"
            style={{ paddingTop: 32, paddingBottom: 22, borderBottom: '1px solid var(--bg-tertiary)' }}>

            {/* Left — greeting */}
            <div>
              <p className="font-rounded uppercase tracking-widest"
                style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                {dateStr}
              </p>
              <h1 className="font-serif font-light"
                style={{ fontSize: 34, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 7 }}>
                {greeting}, {firstName}
              </h1>
              <p className="font-serif italic"
                style={{ fontSize: 15, color: 'var(--text-tertiary)', letterSpacing: '0.01em' }}>
                Every person in your orbit is a window into yourself.
              </p>
            </div>

            {/* Right — stats */}
            {totalMembers > 0 && (
              <div className="flex items-center" style={{ gap: 0, flexShrink: 0 }}>
                {[
                  { label: 'In Your Orbit', value: totalMembers },
                  { label: 'Friends',        value: friendCount  },
                  { label: 'Family',         value: familyCount  },
                  { label: 'Days Tracked',   value: daysTracked  },
                ].map(({ label, value }, i) => (
                  <div key={label} className="flex items-center">
                    <div style={{ textAlign: 'right', padding: '0 20px' }}>
                      <p className="font-serif font-light"
                        style={{ fontSize: 26, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {value}
                      </p>
                      <p className="font-rounded uppercase tracking-widest"
                        style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                        {label}
                      </p>
                    </div>
                    {i < 3 && (
                      <div style={{ width: 1, height: 28, background: 'var(--bg-tertiary)' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-16 mt-8">

            {/* LEFT */}
            <div className="lg:col-span-2">

              {/* Emotional Weather */}
              <section data-tour="emotional-weather">
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <p className="font-rounded uppercase tracking-widest"
                    style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    Emotional Weather
                  </p>
                  <div className="flex items-center gap-3">
                    {dashSummary?.generatedAt && (
                      <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', opacity: 0.7 }}>
                        {new Date(dashSummary.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    <button
                      onClick={handleSync}
                      title="Refresh dashboard"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                        color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: 'transform 0.6s', transform: isRefreshing ? 'rotate(360deg)' : 'none' }}>
                        <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div style={{
                  padding: '20px 22px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 12,
                  border: '1px solid var(--bg-tertiary)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <span className="font-serif" style={{
                    position: 'absolute', top: -8, left: 12,
                    fontSize: 88, color: 'var(--bg-tertiary)',
                    lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
                  }}>"</span>
                  <p className="font-serif" style={{
                    fontSize: 18, color: 'var(--text-primary)',
                    lineHeight: 1.7, marginBottom: 14, position: 'relative',
                  }}>
                    {dashSummary?.emotionalWeather.summary ?? 'Loading your emotional weather…'}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                    <span className="font-rounded uppercase tracking-widest"
                      style={{ fontSize: 11, color: 'var(--accent-primary)' }}>
                      Current vibe: {dashSummary?.emotionalWeather.vibe ?? '—'}
                    </span>
                  </div>
                </div>
              </section>

              {/* 7-day activity pills */}
              {dashSummary?.activity7d && (
                <div className="flex items-center gap-2" style={{ marginTop: 14 }}>
                  {[
                    { label: 'Interactions', value: dashSummary.activity7d.interactions },
                    { label: 'Incidents', value: dashSummary.activity7d.incidents },
                    { label: 'Journal', value: dashSummary.activity7d.journalEntries },
                    { label: 'Patterns', value: dashSummary.activity7d.patternsActive },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      padding: '4px 12px', borderRadius: 20,
                      border: '1px solid var(--bg-tertiary)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span className="font-serif" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value}</span>
                      <span className="font-rounded uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{label}</span>
                    </div>
                  ))}
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 4 }}>last 7 days</span>
                </div>
              )}

              <Divider />

              {/* Insights / Recent Signals */}
              <section>
                <Label>Recent Signals</Label>
                {dashSummary?.recentSignals && dashSummary.recentSignals.length > 0 ? (
                  <div style={{ border: '1px solid var(--bg-tertiary)', borderRadius: 12, overflow: 'hidden' }}>
                    {dashSummary.recentSignals.map((signal, i, arr) => {
                      const colorMap: Record<string, string> = {
                        pattern: '#D4728A',
                        incident: '#D4A84B',
                        interaction: 'var(--accent-primary)',
                      };
                      const labelMap: Record<string, string> = {
                        pattern: 'Pattern',
                        incident: 'Incident',
                        interaction: 'Interaction',
                      };
                      const color = colorMap[signal.type] ?? 'var(--text-tertiary)';
                      const label = labelMap[signal.type] ?? signal.type;
                      return (
                        <div key={i} style={{
                          padding: '16px 20px',
                          borderBottom: i < arr.length - 1 ? '1px solid var(--bg-tertiary)' : 'none',
                          background: 'var(--bg-primary)',
                        }}>
                          <div className="flex items-start gap-3">
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginTop: 6, flexShrink: 0 }} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2" style={{ marginBottom: 5 }}>
                                <p className="font-rounded uppercase tracking-widest" style={{ fontSize: 11, color }}>
                                  {label}
                                </p>
                                {signal.memberName && (
                                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                                    · {signal.memberName}
                                  </span>
                                )}
                              </div>
                              <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                                {signal.title}
                              </p>
                              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>
                                {new Date(signal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : dashSummary ? (
                  <div style={{ padding: '24px 0', textAlign: 'center' }}>
                    <p className="font-serif italic" style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
                      No recent signals. Start logging interactions to see insights here.
                    </p>
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--bg-tertiary)', borderRadius: 12, overflow: 'hidden' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ padding: '16px 20px', borderBottom: i < 2 ? '1px solid var(--bg-tertiary)' : 'none', background: 'var(--bg-primary)' }}>
                        <div className="rounded" style={{ height: 9, width: 80, background: 'var(--bg-tertiary)', marginBottom: 8 }} />
                        <div className="rounded" style={{ height: 12, width: '75%', background: 'var(--bg-tertiary)' }} />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <Divider />

              {/* Quick Actions */}
              <section data-tour="quick-actions">
                <Label>Quick Actions</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'New Journal Entry', path: '/profile?tab=journal' },
                    { label: 'Add Luminary',      path: '/orbit/add'           },
                    { label: 'Ask Lumen',         path: '/lumen'               },
                  ].map(({ label, path }) => (
                    <button key={label} onClick={() => router.push(path)}
                      className="font-rounded uppercase tracking-widest transition-all"
                      style={{ fontSize: 11, padding: '7px 16px', borderRadius: 20, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-tertiary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--bg-tertiary)'; }}>
                      {label}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT */}
            <div>

              {/* Orbit mini-map */}
              <section style={{ marginBottom: 28 }}>
                <Label>Your Orbit</Label>

                <div style={{
                  border: '1px solid var(--bg-tertiary)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  aspectRatio: '1 / 1',
                  position: 'relative',
                  // Subtle warm radial glow in center
                  background: 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent-primary) 6%, var(--bg-secondary)) 0%, var(--bg-secondary) 70%)',
                }}>
                  {members.length > 0 ? (
                    <>
                      {(() => {
                        // Calculate positions once and reuse for both lines and nodes
                        const positions = generateHealthBasedPositions(members, healthMap);
                        
                        return (
                          <>
                            {/* SVG: rings + colored lines */}
                            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                              {[38, 26, 13].map(r => (
                                <circle key={r} cx="50%" cy="50%" r={`${r}%`}
                                  fill="none" stroke="var(--text-tertiary)"
                                  strokeWidth="1" strokeDasharray="3,6" opacity="0.35" />
                              ))}
                              {members.map((member, i) => {
                                const position = positions[member.id];
                                if (!position) return null;
                                const { d, a } = position;
                                const rad = (a * Math.PI) / 180;
                                const x = 50 + d * Math.cos(rad);
                                const y = 50 + d * Math.sin(rad);
                                return (
                                  <line key={member.id} x1="50%" y1="50%"
                                    x2={`${x}%`} y2={`${y}%`}
                                    stroke={ORBIT_COLORS[i % ORBIT_COLORS.length]}
                                    strokeWidth="1" opacity="0.3" />
                                );
                              })}
                            </svg>

                            {/* Center ME */}
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2 }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'var(--accent-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 0 3px var(--bg-secondary), 0 0 16px color-mix(in srgb, var(--accent-primary) 40%, transparent)',
                              }}>
                                <span className="font-mono" style={{ fontSize: 11, color: '#fff', letterSpacing: '0.05em' }}>ME</span>
                              </div>
                            </div>

                            {/* Member nodes — all members displayed with health-based positioning */}
                            {members.map((member, i) => {
                              const position = positions[member.id];
                              if (!position) return null;
                              const { d, a } = position;
                              const rad = (a * Math.PI) / 180;
                              const x = 50 + d * Math.cos(rad);
                              const y = 50 + d * Math.sin(rad);
                              const color = ORBIT_COLORS[i % ORBIT_COLORS.length];
                              return (
                                <div key={member.id} title={member.fullName}
                                  style={{
                                    position: 'absolute',
                                    left: `${x}%`, top: `${y}%`,
                                    transform: 'translate(-50%,-50%)',
                                    zIndex: 2, cursor: 'pointer',
                                  }}
                                  onClick={() => router.push(`/orbit/${member.id}`)}>
                                  <div style={{
                                    width: members.length > 10 ? 28 : 32, 
                                    height: members.length > 10 ? 28 : 32, 
                                    borderRadius: '50%',
                                    background: color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden',
                                    boxShadow: `0 0 0 2px var(--bg-secondary), 0 4px 14px ${color}70`,
                                  }}>
                                    {member.photoUrl
                                      ? <img src={member.photoUrl} alt={member.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      : <span className="font-serif font-medium" style={{ fontSize: members.length > 10 ? 12 : 14, color: '#fff' }}>{member.fullName.charAt(0)}</span>
                                    }
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center" style={{ height: '100%', gap: 12 }}>
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"
                        style={{ color: 'var(--text-tertiary)', opacity: 0.3 }}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <p className="font-serif italic" style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
                        Your orbit is empty
                      </p>
                      <button onClick={() => router.push('/orbit/add')}
                        className="font-rounded uppercase tracking-widest"
                        style={{ fontSize: 11, padding: '5px 12px', borderRadius: 12, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        Add Luminary
                      </button>
                    </div>
                  )}
                </div>

                {members.length > 0 && (
                  <button onClick={() => router.push('/orbit')}
                    className="font-rounded uppercase tracking-widest w-full transition-colors"
                    style={{ fontSize: 11, color: 'var(--text-tertiary)', background: 'none', border: 'none', padding: '8px 0 0', cursor: 'pointer', textAlign: 'right' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
                    View all {members.length} luminaries →
                  </button>
                )}
              </section>

              {/* Blueprint */}
              <section>
                <Label>Your Blueprint</Label>
                <div style={{ border: '1px solid var(--bg-tertiary)', borderRadius: 12, overflow: 'hidden' }}>
                  {isRefreshing && !dashSummary?.blueprint ? (
                    /* Loading skeleton */
                    [0,1,2,3].map(i => (
                      <div key={i} className="flex items-center justify-between"
                        style={{ padding: '12px 16px', borderBottom: i < 3 ? '1px solid var(--bg-tertiary)' : 'none', background: 'var(--bg-primary)' }}>
                        <div>
                          <div className="rounded" style={{ height: 8, width: 40, background: 'var(--bg-tertiary)', marginBottom: 8 }} />
                          <div className="rounded" style={{ height: 12, width: 80, background: 'var(--bg-tertiary)' }} />
                        </div>
                        <div className="rounded-full" style={{ width: 22, height: 22, background: 'var(--bg-tertiary)' }} />
                      </div>
                    ))
                  ) : dashSummary?.blueprint ? (
                    [
                      { label: 'Sun',       value: dashSummary.blueprint.sun,     symbol: '☀',  color: '#D4A84B' },
                      { label: 'Moon',      value: dashSummary.blueprint.moon,    symbol: '☽',  color: '#7B78D4' },
                      { label: 'Rising',    value: dashSummary.blueprint.rising,  symbol: '↑',  color: '#D4728A' },
                      {
                        label: 'Life Path',
                        value: dashSummary.blueprint.lifePath
                          ? `${dashSummary.blueprint.lifePath.number} · ${dashSummary.blueprint.lifePath.archetype}`
                          : null,
                        symbol: '∞',
                        color: '#4AABCF',
                      },
                    ].filter(row => row.value).map(({ label, value, symbol, color }, i, arr) => (
                      <div key={label} className="flex items-center justify-between"
                        style={{ padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--bg-tertiary)' : 'none', background: 'var(--bg-primary)' }}>
                        <div>
                          <p className="font-rounded uppercase tracking-widest"
                            style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3 }}>
                            {label}
                          </p>
                          <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)' }}>{value}</p>
                        </div>
                        <span style={{ fontSize: 18, color, opacity: 0.8 }}>{symbol}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '22px 18px', textAlign: 'center' }}>
                      <p className="font-serif italic" style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 14, lineHeight: 1.6 }}>
                        Generate your numerology & astrology to unlock your blueprint.
                      </p>
                      <button onClick={() => router.push('/profile?tab=numerology')}
                        className="font-rounded uppercase tracking-widest"
                        style={{ fontSize: 11, padding: '6px 14px', borderRadius: 12, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        Generate Now
                      </button>
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>

        {/* Tour Button - Fixed bottom left */}
        <div className="fixed bottom-6 left-6 z-30">
          <TourButton variant="compact" />
        </div>
      </main>
    </div>
  );
}
