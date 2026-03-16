'use client';

import { ReactNode, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useAppSelector } from '@/store/hooks';
import { useSeedDemoLuminaryMutation } from '@/store/api/seedApi';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const journalMode = useAppSelector((state) => state.ui.journalMode);
  const user = useAppSelector((state) => state.auth.user);
  const [seedDemoLuminary] = useSeedDemoLuminaryMutation();

  // Ensure System Node demo luminary exists for every authenticated user
  useEffect(() => {
    if (user?.id) {
      seedDemoLuminary().catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (journalMode) {
    // Journal mode: minimal UI, just content
    return (
      <div className="min-h-screen bg-primary grainy-overlay">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-primary grainy-overlay">
      {/* Sidebar - hidden on mobile, shown on desktop */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile navigation - shown only on mobile */}
      <MobileNav />
    </div>
  );
}
