'use client';

import { useRouter } from 'next/navigation';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { Header } from '@/components/layout/Header';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* Main Content */}
      <main className="w-full px-6 lg:px-12 pt-20 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-serif text-primary mb-2 font-light tracking-tight">
              Profile & Settings
            </h1>
            <p className="text-secondary leading-relaxed">
              Customize your Lumis experience and manage your account preferences.
            </p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-8">
            {/* Appearance Section */}
            <div className="bg-surface-elevated rounded-lg border border-primary p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-primary mb-2">Appearance</h2>
                <p className="text-secondary">
                  Choose a visual theme that resonates with your aesthetic preferences and psychological comfort.
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Visual Theme
                  </label>
                  <ThemeSelector />
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div className="bg-surface-elevated rounded-lg border border-primary p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-primary mb-2">Account</h2>
                <p className="text-secondary">
                  Manage your account information and privacy settings.
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-primary border-2 border-primary rounded-lg text-primary focus:border-accent-primary focus:outline-none transition-colors"
                    placeholder="your@email.com"
                    disabled
                  />
                  <p className="text-xs text-tertiary mt-1">
                    Email management coming soon
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-surface-elevated rounded-lg border border-primary p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-primary mb-2">Privacy & Data</h2>
                <p className="text-secondary">
                  Your relationship data is private and stored securely on your device.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-primary">Local Data Storage</div>
                    <div className="text-xs text-secondary">All your data stays on your device</div>
                  </div>
                  <div className="w-3 h-3 bg-accent-primary rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-primary">End-to-End Encryption</div>
                    <div className="text-xs text-secondary">Your insights are encrypted and private</div>
                  </div>
                  <div className="w-3 h-3 bg-accent-primary rounded-full"></div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-surface-elevated rounded-lg border border-primary p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-primary mb-2">About Lumis</h2>
                <p className="text-secondary">
                  A private, AI-powered personal intelligence tool for understanding relationships.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Version</span>
                  <span className="text-sm text-primary font-medium">1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Build</span>
                  <span className="text-sm text-primary font-medium">2024.03.14</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}