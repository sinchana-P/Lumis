'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemePreview } from './ThemePreview';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSelectorModal({ isOpen, onClose }: ThemeSelectorModalProps) {
  const { theme, setTheme, availableThemes } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = ['all', 'classic', 'gendered', 'mood', 'aesthetic'];
  
  const filteredThemes = selectedCategory === 'all' 
    ? availableThemes 
    : availableThemes.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-md max-w-3xl w-full flex flex-col" style={{ maxHeight: 'min(90vh, 760px)' }}>
        {/* Header */}
        <div className="p-6 border-b border-primary flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif text-primary">Choose Your Theme</h2>
              <p className="text-secondary mt-1">Select a visual style that resonates with you</p>
            </div>
            <button
              onClick={onClose}
              className="text-tertiary hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Category Tabs */}
          <div className="flex space-x-1 mt-4 bg-secondary rounded-lg p-1">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Grid */}
        <div className="px-6 pb-6 pt-2 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredThemes.map(themeOption => (
              <ThemePreview
                key={themeOption.id}
                themeId={themeOption.id}
                isSelected={theme === themeOption.id}
                onClick={() => {
                  setTheme(themeOption.id);
                  onClose();
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-primary bg-secondary flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary">
              {filteredThemes.length} themes available
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}