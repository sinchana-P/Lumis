'use client';

import { useTheme, type ThemeName } from '@/contexts/ThemeContext';

interface ThemePreviewProps {
  themeId: ThemeName;
  isSelected: boolean;
  onClick: () => void;
}

export function ThemePreview({ themeId, isSelected, onClick }: ThemePreviewProps) {
  const { availableThemes } = useTheme();
  const theme = availableThemes.find(t => t.id === themeId);
  
  if (!theme) return null;

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
        isSelected 
          ? 'border-accent-primary shadow-md' 
          : 'border-primary hover:border-accent-primary'
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Color Preview */}
        <div className="flex space-x-1">
          <div 
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: theme.preview.bg }}
          />
          <div 
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: theme.preview.surface }}
          />
          <div 
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: theme.preview.accent }}
          />
        </div>
        
        {/* Theme Info */}
        <div className="text-left">
          <div className="text-sm font-medium text-primary">
            {theme.name}
          </div>
          <div className="text-xs text-secondary">
            {theme.category}
          </div>
        </div>
      </div>
    </button>
  );
}