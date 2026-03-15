'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { useGetMembersQuery } from '@/store/api/membersApi';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export const dynamic = 'force-dynamic';

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 12 }}>
      {children}
    </p>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: 'var(--bg-tertiary)', margin: '28px 0' }} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: membersResponse } = useGetMembersQuery();
  const members = membersResponse?.data || [];

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return <LoadingScreen />;

  const firstName = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'there';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Orbit mini-map positions
  const orbitPositions = [
    { distance: 28, angle: -60 },
    { distance: 28, angle: 60 },
    { distance: 28, angle: 180 },
    { distance: 42, angle: 0 },
    { distance: 42, angle: 120 },
    { distance: 42, angle: 240 },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />

      <main className="w-full px-8 lg:px-16 pt-20 pb-16">
        <div className="w-full" style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Greeting ── */}
          <div style={{ paddingTop: 32, paddingBottom: 24, borderBottom: '1px solid var(--bg-tertiary)' }}>
            <p className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>
              {dateStr}
            </p>
            <h1 className="font-serif font-light" style={{ fontSize: 32, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {greeting}, {firstName}
            </h1>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-16 mt-8">

            {/* LEFT: 2/3 */}
            <div className="lg:col-span-2">

              {/* Emotional Weather */}
              <section>
                <Label>Emotional Weather</Label>
                <div style={{ padding: '18px 20px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--bg-tertiary)' }}>
                  <p className="font-serif" style={{ fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12 }}>
                    "Mostly peaceful this week, with moments of warmth around <em>family connections</em>."
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                    <span className="font-mono uppercase tracking-widest" style={{ fontSize: 10, color: 'var(--accent-primary)' }}>
                      Current vibe: Serene
                    </span>
                  </div>
                </div>
              </section>

              <Divider />

              {/* Recent Insights */}
              <section>
                <Label>Recent Insights</Label>
                <div style={{ border: '1px solid var(--bg-tertiary)', borderRadius: 12, overflow: 'hidden' }}>

                  {/* Insight row 1 */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-tertiary)' }}>
                    <div className="flex items-start gap-4">
                      <div style={{ marginTop: 3 }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-secondary)', marginTop: 5 }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--accent-secondary)', marginBottom: 5 }}>
                          Pattern Alert
                        </p>
                        <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          You've logged feeling unheard <strong>4 times</strong> with Mom this week.
                        </p>
                        <button
                          className="font-mono uppercase tracking-widest transition-colors"
                          style={{ fontSize: 9, color: 'var(--text-tertiary)', background: 'none', border: 'none', padding: 0, marginTop: 8, cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                        >
                          Explore Blueprint →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Insight row 2 */}
                  <div style={{ padding: '16px 20px' }}>
                    <div className="flex items-start gap-4">
                      <div style={{ marginTop: 3 }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)', marginTop: 5 }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--accent-primary)', marginBottom: 5 }}>
                          Growth Opportunity
                        </p>
                        <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          Energy peaks correlate with evening creative sessions.
                        </p>
                        <button
                          className="font-mono uppercase tracking-widest transition-colors"
                          style={{ fontSize: 9, color: 'var(--text-tertiary)', background: 'none', border: 'none', padding: 0, marginTop: 8, cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                        >
                          Schedule Time →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <Divider />

              {/* Quick Actions */}
              <section>
                <Label>Quick Actions</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Log Interaction', path: '/orbit' },
                    { label: 'New Journal Entry', path: '/lumen' },
                    { label: 'Add Luminary', path: '/orbit/add' },
                    { label: 'Ask Lumen', path: '/lumen' },
                  ].map(({ label, path }) => (
                    <button
                      key={label}
                      onClick={() => router.push(path)}
                      className="font-mono uppercase tracking-widest transition-colors"
                      style={{
                        fontSize: 10, padding: '7px 14px', borderRadius: 20,
                        border: '1px solid var(--bg-tertiary)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT: 1/3 */}
            <div style={{ paddingTop: 4 }}>

              {/* Energy Map */}
              <section style={{ marginBottom: 28 }}>
                <Label>Your Orbit</Label>
                <div style={{
                  border: '1px solid var(--bg-tertiary)', borderRadius: 12,
                  background: 'var(--bg-secondary)', padding: 20,
                  aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden',
                }}>
                  {members.length > 0 ? (
                    <>
                      {/* SVG rings + lines */}
                      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                        {[42, 28, 14].map(r => (
                          <circle key={r} cx="50%" cy="50%" r={`${r}%`} fill="none"
                            stroke="var(--bg-tertiary)" strokeWidth="1" strokeDasharray="4,4" />
                        ))}
                        {members.slice(0, 6).map((_, i) => {
                          const p = orbitPositions[i];
                          if (!p) return null;
                          const rad = (p.angle * Math.PI) / 180;
                          const x = 50 + p.distance * Math.cos(rad);
                          const y = 50 + p.distance * Math.sin(rad);
                          return (
                            <line key={i} x1="50%" y1="50%" x2={`${x}%`} y2={`${y}%`}
                              stroke="var(--bg-tertiary)" strokeWidth="1" />
                          );
                        })}
                      </svg>

                      {/* Center ME */}
                      <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                        <div className="flex items-center justify-center rounded-full"
                          style={{ width: 36, height: 36, background: 'var(--accent-primary)' }}>
                          <span className="font-mono" style={{ fontSize: 9, color: '#fff', letterSpacing: '0.05em' }}>ME</span>
                        </div>
                      </div>

                      {/* Members */}
                      {members.slice(0, 6).map((member, i) => {
                        const p = orbitPositions[i];
                        if (!p) return null;
                        const rad = (p.angle * Math.PI) / 180;
                        const x = 50 + p.distance * Math.cos(rad);
                        const y = 50 + p.distance * Math.sin(rad);
                        return (
                          <div key={member.id} className="absolute"
                            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', cursor: 'pointer', textAlign: 'center' }}
                            onClick={() => router.push(`/orbit/${member.id}`)}>
                            <div className="flex items-center justify-center rounded-full overflow-hidden mx-auto"
                              style={{ width: 28, height: 28, background: 'var(--accent-primary)' }}>
                              {member.photoUrl
                                ? <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                                : <span className="font-serif font-medium" style={{ fontSize: 11, color: '#fff' }}>{member.fullName.charAt(0)}</span>
                              }
                            </div>
                            <p className="font-serif" style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 3, whiteSpace: 'nowrap' }}>
                              {member.fullName.split(' ')[0]}
                            </p>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)', opacity: 0.4 }}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <p className="font-serif italic" style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
                        Your orbit is empty
                      </p>
                      <button onClick={() => router.push('/orbit/add')}
                        className="font-mono uppercase tracking-widest"
                        style={{ fontSize: 9, padding: '5px 12px', borderRadius: 12, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        Add Luminary
                      </button>
                    </div>
                  )}
                </div>
                {members.length > 0 && (
                  <button onClick={() => router.push('/orbit')}
                    className="font-mono uppercase tracking-widest w-full transition-colors"
                    style={{ fontSize: 9, color: 'var(--text-tertiary)', background: 'none', border: 'none', padding: '8px 0 0', cursor: 'pointer', textAlign: 'right' }}
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
                  {user.date_of_birth ? (
                    [
                      { label: 'Sun', value: 'Scorpio', icon: '☀' },
                      { label: 'Moon', value: 'Taurus', icon: '☽' },
                      { label: 'Rising', value: 'Leo', icon: '✦' },
                      { label: 'Life Path', value: '7', icon: '#' },
                    ].map(({ label, value, icon }, i, arr) => (
                      <div key={label} className="flex items-center justify-between"
                        style={{ padding: '11px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--bg-tertiary)' : 'none', background: 'var(--bg-primary)' }}>
                        <div>
                          <p className="font-mono uppercase tracking-widest" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</p>
                          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value}</p>
                        </div>
                        <span style={{ fontSize: 16, color: 'var(--text-tertiary)', opacity: 0.5 }}>{icon}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                      <p className="font-serif italic" style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 12 }}>
                        Add your birth details to unlock your cosmic blueprint.
                      </p>
                      <button onClick={() => router.push('/profile')}
                        className="font-mono uppercase tracking-widest"
                        style={{ fontSize: 9, padding: '5px 14px', borderRadius: 12, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        Complete Profile
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
