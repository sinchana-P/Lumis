export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Crimson_Pro } from 'next/font/google';
import { ReduxProvider } from '@/store/Provider';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { BottomNav } from '@/components/layout/BottomNav';
import './globals.css';

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
});


export const metadata: Metadata = {
  title: 'Lumis - See the people in your life, in full light',
  description: 'A private, AI-powered personal intelligence tool for understanding relationships',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${crimsonPro.variable} font-serif antialiased`}>
        <ThemeProvider>
          <ReduxProvider>
            <AuthInitializer>
              {children}
              <BottomNav />
            </AuthInitializer>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
