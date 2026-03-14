import type { Metadata } from 'next';
import { Inter, Crimson_Pro } from 'next/font/google';
import { ReduxProvider } from '@/store/Provider';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
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
      <body className={`${inter.variable} ${crimsonPro.variable} font-serif antialiased`}>
        <ThemeProvider>
          <ReduxProvider>
            <AuthInitializer>
              {children}
            </AuthInitializer>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
