'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { useGetMembersQuery } from '@/store/api/membersApi';
import { Header } from '@/components/layout/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

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

// Generate positions based on relationship health scores
const generateHealthBasedPositions = (members: any[]): { [key: string]: { d: number; a: number } } => {
  if (members.length === 0) return {};
  
  // Simple seeded random function for consistent positioning
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Calculate health scores for all members
  const membersWithHealth = members.map(member => ({
    ...member,
    health: getRelationshipHealth(member)
  }));
  
  // Sort by health score (highest first)
  const sortedMembers = [...membersWithHealth].sort((a, b) => b.health - a.health);
  
  const positions: { [key: string]: { d: number; a: number } } = {};
  
  sortedMembers.forEach((member, i) => {
    const health = member.health;
    
    // Use member ID as seed for consistent randomness
    const seed = member.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    
    // Determine distance based on health score
    let distance;
    if (health >= 80) {
      distance = 15; // Very close - excellent relationships
    } else if (health >= 70) {
      distance = 20; // Close - good relationships
    } else if (health >= 60) {
      distance = 25; // Medium - okay relationships
    } else if (health >= 50) {
      distance = 30; // Further - challenging relationships
    } else {
      distance = 35; // Furthest - difficult relationships
    }
    
    // Add some randomness to avoid perfect circles (but consistent)
    const randomOffset = (seededRandom(seed) - 0.5) * 4;
    distance += randomOffset;
    
    // Calculate angle with some spacing
    const baseAngle = (i * 360) / sortedMembers.length;
    const angleVariation = (seededRandom(seed + 1) - 0.5) * 30; // ±15 degrees variation
    const angle = baseAngle + angleVariation;
    
    positions[member.id] = { d: Math.max(12, Math.min(38, distance)), a: angle };
  });
  
  return positions;
};

// Helper function to get relationship health (same as in orbit page)
const getRelationshipHealth = (member: any) => {
  const healthMap: Record<string, number> = {
    'partner': Math.floor(Math.random() * 20) + 80,
    'family': Math.floor(Math.random() * 30) + 60,
    'friend': Math.floor(Math.random() * 40) + 50,
    'colleague': Math.floor(Math.random() * 30) + 40,
    'acquaintance': Math.floor(Math.random() * 20) + 30,
  };
  return healthMap[member.relationType] || 65;
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono uppercase tracking-widest"
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

  const totalMembers = members.length;
  const friendCount  = members.filter(m => m.relationType === 'friend').length;
  const familyCount  = members.filter(m => m.relationType === 'family').length;
  const daysTracked  = Math.max(1, Math.floor((Date.now() - new Date(user.created_at || Date.now()).getTime()) / 86400000));

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header />

      <main className="w-full px-8 lg:px-16 pt-20 pb-16">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Greeting + Stats ── */}
          <div className="flex items-end justify-between"
            style={{ paddingTop: 32, paddingBottom: 22, borderBottom: '1px solid var(--bg-tertiary)' }}>

            {/* Left — greeting */}
            <div>
              <p className="font-mono uppercase tracking-widest"
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
                      <p className="font-mono uppercase tracking-widest"
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
              <section>
                <Label>Emotional Weather</Label>
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
                    Mostly peaceful this week, with moments of warmth around{' '}
                    <em>family connections</em>.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                    <span className="font-mono uppercase tracking-widest"
                      style={{ fontSize: 11, color: 'var(--accent-primary)' }}>
                      Current vibe: Serene
                    </span>
                  </div>
                </div>
              </section>

              <Divider />

              {/* Insights */}
              <section>
                <Label>Recent Insights</Label>
                <div style={{ border: '1px solid var(--bg-tertiary)', borderRadius: 12, overflow: 'hidden' }}>
                  {[
                    { tag: 'Pattern Alert',       color: '#D4728A', text: <>You've logged feeling unheard <strong>4 times</strong> with Mom this week.</>,                action: 'Explore Blueprint' },
                    { tag: 'Growth Opportunity',  color: 'var(--accent-primary)', text: 'Energy peaks correlate with evening creative sessions.',                             action: 'Schedule Time'    },
                    { tag: 'Lumen Nudge',          color: '#7B78D4', text: "You haven't journaled in 5 days. A few honest lines can shift everything.",                       action: 'Open Journal'     },
                  ].map(({ tag, color, text, action }, i, arr) => (
                    <div key={tag} style={{
                      padding: '16px 20px',
                      borderBottom: i < arr.length - 1 ? '1px solid var(--bg-tertiary)' : 'none',
                      background: 'var(--bg-primary)',
                    }}>
                      <div className="flex items-start gap-3">
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginTop: 6, flexShrink: 0 }} />
                        <div className="flex-1">
                          <p className="font-mono uppercase tracking-widest"
                            style={{ fontSize: 11, color, marginBottom: 5 }}>
                            {tag}
                          </p>
                          <p className="font-serif"
                            style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                            {text}
                          </p>
                          <button
                            className="font-mono uppercase tracking-widest transition-colors"
                            style={{ fontSize: 11, color: 'var(--text-tertiary)', background: 'none', border: 'none', padding: 0, marginTop: 8, cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
                            {action} →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <Divider />

              {/* Quick Actions */}
              <section>
                <Label>Quick Actions</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Log Interaction',   path: '/orbit'      },
                    { label: 'New Journal Entry', path: '/lumen'      },
                    { label: 'Add Luminary',      path: '/orbit/add'  },
                    { label: 'Ask Lumen',         path: '/lumen'      },
                  ].map(({ label, path }) => (
                    <button key={label} onClick={() => router.push(path)}
                      className="font-mono uppercase tracking-widest transition-all"
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
                        const positions = generateHealthBasedPositions(members);
                        
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
                        className="font-mono uppercase tracking-widest"
                        style={{ fontSize: 11, padding: '5px 12px', borderRadius: 12, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        Add Luminary
                      </button>
                    </div>
                  )}
                </div>

                {members.length > 0 && (
                  <button onClick={() => router.push('/orbit')}
                    className="font-mono uppercase tracking-widest w-full transition-colors"
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
                  {user.date_of_birth ? (
                    [
                      { label: 'Sun',       value: 'Scorpio',         symbol: '☀',  color: '#D4A84B' },
                      { label: 'Moon',      value: 'Taurus',          symbol: '☽',  color: '#7B78D4' },
                      { label: 'Rising',    value: 'Leo',             symbol: '↑',  color: '#D4728A' },
                      { label: 'Life Path', value: '7 · The Seeker',  symbol: '∞',  color: '#4AABCF' },
                    ].map(({ label, value, symbol, color }, i, arr) => (
                      <div key={label} className="flex items-center justify-between"
                        style={{ padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--bg-tertiary)' : 'none', background: 'var(--bg-primary)' }}>
                        <div>
                          <p className="font-mono uppercase tracking-widest"
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
                        Add your birth details to unlock your cosmic blueprint.
                      </p>
                      <button onClick={() => router.push('/profile')}
                        className="font-mono uppercase tracking-widest"
                        style={{ fontSize: 11, padding: '6px 14px', borderRadius: 12, border: '1px solid var(--bg-tertiary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
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
