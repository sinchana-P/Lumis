'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { useGetMembersQuery } from '@/store/api/membersApi';
import { Header } from '@/components/layout/Header';

/**
 * Dashboard Page - Lumis Style
 * 
 * Beautiful dashboard matching the reference design
 */
export default function DashboardPage() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: membersResponse } = useGetMembersQuery();

  const members = membersResponse?.data || [];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-accent-primary animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <p className="text-secondary">Loading your luminaries...</p>
        </div>
      </div>
    );
  }

  const userName = user.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* Main Content */}
      <main className="w-full px-8 lg:px-16 py-6 pt-20">
        <div className="w-full">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-4xl font-serif text-primary mb-4 font-light tracking-tight">
              Welcome back, {userName}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Emotional Weather */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs uppercase tracking-wider text-tertiary">
                    EMOTIONAL WEATHER
                  </h2>
                </div>

                <div className="bg-surface rounded-2xl p-6 shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-2xl font-serif text-primary leading-relaxed mb-4">
                        "Mostly peaceful this week, with moments of warmth around <em>family connections</em>."
                      </p>

                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent-secondary rounded-full"></div>
                        <span className="text-xs uppercase tracking-wider text-accent-secondary font-medium">
                          CURRENT VIBE: SERENE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Insights */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs uppercase tracking-wider text-tertiary">
                    RECENT INSIGHTS
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Pattern Alert */}
                  <div className="bg-surface rounded-2xl p-6 shadow-md">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-accent-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-accent-secondary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs uppercase tracking-wider text-accent-secondary font-medium mb-2">
                          PATTERN ALERT
                        </div>
                        <p className="text-primary font-medium mb-3 text-lg">
                          You've logged feeling unheard <strong>4 times</strong> with Mom this week.
                        </p>
                        <button className="text-xs uppercase tracking-wider text-accent-secondary font-medium hover:text-accent-secondary transition-colors">
                          EXPLORE BLUEPRINT
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Growth Opportunity */}
                  <div className="bg-surface rounded-2xl p-6 shadow-md">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-accent-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs uppercase tracking-wider text-accent-primary font-medium mb-2">
                          GROWTH OPPORTUNITY
                        </div>
                        <p className="text-primary font-medium mb-3 text-lg">
                          Energy peaks correlate with evening creative sessions.
                        </p>
                        <button className="text-xs uppercase tracking-wider text-accent-primary font-medium hover:text-accent-primary transition-colors">
                          SCHEDULE TIME
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-12">
              {/* Energy Map */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs uppercase tracking-wider text-tertiary">
                    ENERGY MAP
                  </h2>
                </div>

                <div className="relative bg-surface rounded-2xl p-12 shadow-md h-96">
                  {members.length > 0 ? (
                    <div className="relative w-full h-full">
                      {/* Concentric circles */}
                      <svg className="absolute inset-0 w-full h-full">
                        {/* Outer circle */}
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          fill="none"
                          stroke="var(--text-tertiary)"
                          strokeWidth="2"
                          strokeDasharray="6,6"
                          opacity="0.4"
                        />
                        {/* Middle circle */}
                        <circle
                          cx="50%"
                          cy="50%"
                          r="30%"
                          fill="none"
                          stroke="var(--text-tertiary)"
                          strokeWidth="2"
                          strokeDasharray="6,6"
                          opacity="0.4"
                        />
                        {/* Inner circle */}
                        <circle
                          cx="50%"
                          cy="50%"
                          r="15%"
                          fill="none"
                          stroke="var(--text-tertiary)"
                          strokeWidth="2"
                          strokeDasharray="6,6"
                          opacity="0.4"
                        />
                      </svg>

                      {/* Center - User */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 bg-accent-secondary rounded-full flex items-center justify-center shadow-lg border-2 border-surface">
                          <span className="text-inverse font-medium text-lg">ME</span>
                        </div>
                      </div>

                      {/* Members positioned in circles */}
                      {members.slice(0, 6).map((member, index) => {
                        // Position members in different circles and angles
                        const positions = [
                          // Inner circle positions
                          {
                            distance: 25,
                            angle: 0, // Top
                            color: 'bg-accent-primary'
                          },
                          {
                            distance: 35,
                            angle: 225, // Bottom left
                            color: 'bg-accent-secondary'
                          },
                          {
                            distance: 35,
                            angle: 315, // Bottom right  
                            color: 'bg-accent-ai'
                          },
                          // Outer circle positions
                          {
                            distance: 45,
                            angle: 45, // Top right
                            color: 'bg-accent-gold'
                          },
                          {
                            distance: 45,
                            angle: 135, // Top left
                            color: 'bg-accent-secondary'
                          },
                          {
                            distance: 45,
                            angle: 270, // Bottom
                            color: 'bg-accent-ai'
                          },
                        ];

                        const position = positions[index];
                        if (!position) return null;

                        // Convert polar to cartesian coordinates
                        const angleRad = (position.angle * Math.PI) / 180;
                        const x = 50 + position.distance * Math.cos(angleRad);
                        const y = 50 + position.distance * Math.sin(angleRad);

                        return (
                          <div
                            key={member.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              cursor: "pointer"
                            }}
                            onClick={() => router.push(`/orbit/${member.id}`)}
                          >
                            <div className="text-center">
                              <div className={`w-12 h-12 ${position.color} rounded-full flex items-center justify-center shadow-md border-2 border-surface mb-2`}>
                                {member.photoUrl ? (
                                  <img
                                    src={member.photoUrl}
                                    alt={member.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-inverse text-sm font-medium">
                                    {member.fullName.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-secondary font-medium">
                                {member.fullName.split(' ')[0]}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Connection lines from center to members */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {members.slice(0, 6).map((_, index) => {
                          const positions = [
                            { distance: 25, angle: 0 },
                            { distance: 35, angle: 225 },
                            { distance: 35, angle: 315 },
                            { distance: 45, angle: 45 },
                            { distance: 45, angle: 135 },
                            { distance: 45, angle: 270 },
                          ];

                          const position = positions[index];
                          if (!position) return null;

                          const angleRad = (position.angle * Math.PI) / 180;
                          const x = 50 + position.distance * Math.cos(angleRad);
                          const y = 50 + position.distance * Math.sin(angleRad);

                          return (
                            <line
                              key={index}
                              x1="50%"
                              y1="50%"
                              x2={`${x}%`}
                              y2={`${y}%`}
                              stroke="var(--text-tertiary)"
                              strokeWidth="1.5"
                              strokeDasharray="3,3"
                              opacity="0.3"
                            />
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-8 h-8 text-accent-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                        <p className="text-secondary text-sm mb-4">
                          Add members to see your luminaries
                        </p>
                        <button
                          onClick={() => router.push('/orbit/add')}
                          className="px-6 py-2 bg-accent-primary text-white rounded-full text-xs uppercase tracking-wider font-medium hover:bg-accent-primary-hover transition-colors"
                        >
                          ADD FIRST MEMBER
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Your Blueprint */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs uppercase tracking-wider text-tertiary">
                    YOUR BLUEPRINT
                  </h2>
                </div>

                <div className="bg-surface rounded-2xl p-6 shadow-md space-y-6">
                  {/* Sun Sign */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-tertiary mb-1">
                        SUN
                      </div>
                      <div className="font-serif text-primary">
                        Scorpio
                      </div>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                  </div>

                  {/* Moon Sign */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-tertiary mb-1">
                        MOON
                      </div>
                      <div className="font-serif text-primary">
                        Taurus
                      </div>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent-secondary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                      </svg>
                    </div>
                  </div>

                  {/* Rising Sign */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-tertiary mb-1">
                        RISING
                      </div>
                      <div className="font-serif text-primary">
                        Leo
                      </div>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent-gold" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs text-tertiary">
            DESIGNED FOR CLARITY & CONNECTION
          </p>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-tertiary rounded-full"></div>
            <div className="w-2 h-2 bg-tertiary rounded-full"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}