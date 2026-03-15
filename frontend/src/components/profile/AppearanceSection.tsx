'use client';

import { ThemeSelector } from '@/components/ui/ThemeSelector';

export function AppearanceSection() {
  return (
    <div className="bg-lumis-surface rounded-xl p-6 border border-lumis-text-tertiary/10">
      <h3 className="text-lg font-serif text-lumis-text-primary mb-4">
        Appearance
      </h3>
      <p className="text-lumis-text-secondary text-sm mb-6">
        Choose a visual theme that resonates with your aesthetic preferences.
      </p>
      
      <div>
        <label className="block text-sm font-medium text-lumis-text-primary mb-3">
          Visual Theme
        </label>
        <ThemeSelector />
      </div>
    </div>
  );
}