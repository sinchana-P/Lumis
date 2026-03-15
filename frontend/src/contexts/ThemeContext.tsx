'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeName = 
  | 'warm-light'
  | 'deep-dark'
  | 'soft-feminine'
  | 'refined-masculine'
  | 'forest-calm'
  | 'ocean-depth'
  | 'sunset-warmth'
  | 'lavender-dream'
  | 'monochrome-minimal'
  | 'vintage-sepia'
  | 'soft-pastel'
  | 'midnight-blue';

export interface ThemeMetadata {
  id: ThemeName;
  name: string;
  description: string;
  vibe: string;
  category: 'classic' | 'gendered' | 'mood' | 'aesthetic';
  preview: {
    bg: string;
    surface: string;
    accent: string;
  };
  tags: string[];
}

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeMetadata[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes: ThemeMetadata[] = [
  {
    id: 'warm-light',
    name: 'Warm Light',
    description: 'Candlelit study, aged paper, intellectual warmth',
    vibe: 'Calm, focused, gently bright',
    category: 'classic',
    preview: { bg: '#F8F6F3', surface: '#E8E3D8', accent: '#9CAF9E' },
    tags: ['warm', 'light', 'calm'],
  },
  {
    id: 'deep-dark',
    name: 'Deep Dark',
    description: 'Midnight journal, quiet introspection, cozy darkness',
    vibe: 'Night owls, comfort in darkness',
    category: 'classic',
    preview: { bg: '#1A1816', surface: '#3D3935', accent: '#8A9D8C' },
    tags: ['default', 'dark', 'night', 'cozy', 'introspective'],
  },
  {
    id: 'soft-feminine',
    name: 'Soft Feminine',
    description: 'Rose garden, silk journals, gentle grace',
    vibe: 'Soft, romantic, nurturing energy',
    category: 'gendered',
    preview: { bg: '#FAF5F2', surface: '#F0E4DD', accent: '#D4A5A5' },
    tags: ['feminine', 'soft', 'romantic', 'nurturing'],
  },
  {
    id: 'refined-masculine',
    name: 'Refined Masculine',
    description: 'Leather-bound books, whiskey lounge, quiet strength',
    vibe: 'Grounded, structured, bold energy',
    category: 'gendered',
    preview: { bg: '#E8E4DF', surface: '#D0C9BE', accent: '#6B7F6E' },
    tags: ['masculine', 'structured', 'bold', 'grounded'],
  },
  {
    id: 'forest-calm',
    name: 'Forest Calm',
    description: 'Moss-covered stones, morning dew, nature\'s embrace',
    vibe: 'Grounding, peaceful, natural connection',
    category: 'mood',
    preview: { bg: '#F2F5F0', surface: '#DFE6DA', accent: '#7A9B7E' },
    tags: ['nature', 'calm', 'grounding', 'peaceful'],
  },
  {
    id: 'ocean-depth',
    name: 'Ocean Depth',
    description: 'Deep waters, coastal fog, emotional tides',
    vibe: 'Introspective, fluid, depth',
    category: 'mood',
    preview: { bg: '#F0F4F7', surface: '#D8E4EB', accent: '#7A9BAF' },
    tags: ['ocean', 'depth', 'introspective', 'fluid'],
  },
  {
    id: 'sunset-warmth',
    name: 'Sunset Warmth',
    description: 'Golden hour, terracotta tiles, Mediterranean glow',
    vibe: 'Warmth, optimism, gentle energy',
    category: 'mood',
    preview: { bg: '#FAF5EF', surface: '#EFE3D5', accent: '#D4A574' },
    tags: ['warm', 'optimistic', 'golden', 'energizing'],
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    description: 'Twilight sky, lavender fields, soft mysticism',
    vibe: 'Spiritual, creative, gentle',
    category: 'mood',
    preview: { bg: '#F5F2F7', surface: '#E3DCEA', accent: '#A89BB8' },
    tags: ['spiritual', 'creative', 'mystical', 'gentle'],
  },
  {
    id: 'monochrome-minimal',
    name: 'Monochrome Minimal',
    description: 'Clean slate, zen simplicity, pure focus',
    vibe: 'Zero distraction, pure clarity',
    category: 'aesthetic',
    preview: { bg: '#FAFAFA', surface: '#E8E8E8', accent: '#6B6B6B' },
    tags: ['minimal', 'clean', 'focus', 'zen'],
  },
  {
    id: 'vintage-sepia',
    name: 'Vintage Sepia',
    description: 'Old photographs, antique journals, nostalgic warmth',
    vibe: 'History, memory, timeless beauty',
    category: 'aesthetic',
    preview: { bg: '#F2EBE0', surface: '#DDD2BF', accent: '#9B8B6F' },
    tags: ['vintage', 'nostalgic', 'timeless', 'sepia'],
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    description: 'Watercolor paintings, gentle hues, dreamy softness',
    vibe: 'Lightness, playfulness, gentle joy',
    category: 'aesthetic',
    preview: { bg: '#FAF8F5', surface: '#EFE8E0', accent: '#C8D4C8' },
    tags: ['pastel', 'dreamy', 'playful', 'soft'],
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Starlit sky, deep contemplation, cosmic calm',
    vibe: 'Night thinkers, dreamers, depth',
    category: 'aesthetic',
    preview: { bg: '#1A1F2E', surface: '#2E3547', accent: '#6B7F9B' },
    tags: ['midnight', 'cosmic', 'contemplative', 'deep'],
  },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('deep-dark');

  // Load theme from localStorage on mount; default to deep-dark for new users
  useEffect(() => {
    const savedTheme = localStorage.getItem('lumis-theme') as ThemeName;
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // No saved preference — apply deep-dark as the default
      document.documentElement.setAttribute('data-theme', 'deep-dark');
    }
  }, []);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('lumis-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}