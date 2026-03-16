export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Crimson_Pro, Playfair_Display, Nunito } from 'next/font/google';
import { ReduxProvider } from '@/store/Provider';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TourProvider } from '@/contexts/TourContext';
import { TourEngine } from '@/components/tour';
import { BottomNav } from '@/components/layout/BottomNav';
import './globals.css';

// Primary body font — soft, warm, humanist. Used for all UI text, body, labels, navigation.
const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

// Rounded sans — sidebar navigation labels (rounded terminals, weighted)
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-rounded',
  display: 'swap',
});

// Display serif — large headings, page titles, quotes, journal entries, AI insights
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
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
      <body className={`${crimsonPro.variable} ${playfairDisplay.variable} ${nunito.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ReduxProvider>
            <TourProvider>
              <AuthInitializer>
                {children}
                <BottomNav />
                <TourEngine />
              </AuthInitializer>
            </TourProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
