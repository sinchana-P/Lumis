'use client';

import { usePathname } from 'next/navigation';

const PATH_MESSAGES: Record<string, string> = {
  '/dashboard':  'Setting up your space...',
  '/orbit':      'Loading your luminaries...',
  '/lumen':      'Waking Lumen...',
  '/profile':    'Loading your profile...',
  '/login':      'Stepping into the light...',
  '/signup':     'Preparing your orbit...',
  '/numerology': 'Reading the numbers...',
  '/astrology':  'Aligning the stars...',
};

function getMessageForPath(pathname: string): string {
  // Exact match first
  if (PATH_MESSAGES[pathname]) return PATH_MESSAGES[pathname];
  // Prefix match (e.g. /orbit/[id])
  const match = Object.keys(PATH_MESSAGES).find(p => pathname.startsWith(p));
  return match ? PATH_MESSAGES[match] : 'Just a moment...';
}

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const pathname = usePathname();
  const text = message ?? getMessageForPath(pathname);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-accent-primary animate-pulse"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <p className="text-secondary font-serif text-sm">{text}</p>
      </div>
    </div>
  );
}
