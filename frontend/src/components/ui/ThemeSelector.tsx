'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeSelectorModal } from './ThemeSelectorModal';

export function ThemeSelector() {
  const { theme, availableThemes } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const currentTheme = availableThemes.find(t => t.id === theme);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-surface border border-primary rounded-lg text-primary hover:border-accent-primary transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: currentTheme?.preview.bg }}
              />
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: currentTheme?.preview.surface }}
              />
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: currentTheme?.preview.accent }}
              />
            </div>
            <div className="text-left">
              <div className="font-medium">{currentTheme?.name || 'Theme'}</div>
              <div className="text-sm text-secondary">{currentTheme?.vibe}</div>
            </div>
          </div>
          <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <ThemeSelectorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}