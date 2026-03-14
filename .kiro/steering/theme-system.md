---
inclusion: fileMatch
fileMatchPattern: "**/*.{css,scss,tsx,jsx}"
---

# Lumis Multi-Theme System

## Theme Architecture

Users can select from 12 carefully crafted themes that match their aesthetic preference and psychological comfort.

### Theme Categories

1. **Classic Themes** - Timeless, universal appeal
2. **Gendered Aesthetics** - Masculine/Feminine energy
3. **Mood-Based** - Emotional resonance
4. **Aesthetic Styles** - Visual movements

---

## Available Themes

### 01 — WARM LIGHT (Default)
**Vibe:** Candlelit study, aged paper, intellectual warmth
**For:** Those who want calm, focus, and gentle brightness

```css
[data-theme="warm-light"] {
  --bg-primary: #F8F6F3;
  --bg-secondary: #F2EFE9;
  --surface: #E8E3D8;
  --text-primary: #3D3935;
  --accent-primary: #9CAF9E;
  --accent-secondary: #C9A58F;
  --accent-ai: #B5A8C1;
}
```

### 02 — DEEP DARK
**Vibe:** Midnight journal, quiet introspection, cozy darkness
**For:** Night owls, those who find comfort in darkness

```css
[data-theme="deep-dark"] {
  --bg-primary: #1A1816;
  --bg-secondary: #252220;
  --surface: #2F2C29;
  --text-primary: #E8E3D8;
  --accent-primary: #8A9D8C;
  --accent-secondary: #B8947D;
  --accent-ai: #A396AF;
}
```

### 03 — SOFT FEMININE
**Vibe:** Rose garden, silk journals, gentle grace
**For:** Those drawn to soft, romantic, nurturing energy

```css
[data-theme="soft-feminine"] {
  --bg-primary: #FAF5F2;
  --bg-secondary: #F5EDE8;
  --surface: #F0E4DD;
  --text-primary: #4A3F3C;
  --accent-primary: #D4A5A5;
  --accent-secondary: #C9A8B8;
  --accent-ai: #B8A8C8;
}
```

### 04 — REFINED MASCULINE
**Vibe:** Leather-bound books, whiskey lounge, quiet strength
**For:** Those drawn to grounded, structured, bold energy

```css
[data-theme="refined-masculine"] {
  --bg-primary: #E8E4DF;
  --bg-secondary: #DDD8D0;
  --surface: #D0C9BE;
  --text-primary: #2D2A26;
  --accent-primary: #6B7F6E;
  --accent-secondary: #8B6F5C;
  --accent-ai: #6E6B7F;
}
```

### 05 — FOREST CALM
**Vibe:** Moss-covered stones, morning dew, nature's embrace
**For:** Those seeking grounding, peace, natural connection

```css
[data-theme="forest-calm"] {
  --bg-primary: #F2F5F0;
  --bg-secondary: #E8EDE5;
  --surface: #DFE6DA;
  --text-primary: #2F3D2E;
  --accent-primary: #7A9B7E;
  --accent-secondary: #A8B89A;
  --accent-ai: #8FA8A0;
}
```

### 06 — OCEAN DEPTH
**Vibe:** Deep waters, coastal fog, emotional tides
**For:** Those drawn to introspection, fluidity, depth

```css
[data-theme="ocean-depth"] {
  --bg-primary: #F0F4F7;
  --bg-secondary: #E5EDF2;
  --surface: #D8E4EB;
  --text-primary: #2A3840;
  --accent-primary: #7A9BAF;
  --accent-secondary: #9AAFBF;
  --accent-ai: #8FA0B8;
}
```

### 07 — SUNSET WARMTH
**Vibe:** Golden hour, terracotta tiles, Mediterranean glow
**For:** Those seeking warmth, optimism, gentle energy

```css
[data-theme="sunset-warmth"] {
  --bg-primary: #FAF5EF;
  --bg-secondary: #F5EDE3;
  --surface: #EFE3D5;
  --text-primary: #3D342E;
  --accent-primary: #D4A574;
  --accent-secondary: #C9947D;
  --accent-ai: #B8A08F;
}
```

### 08 — LAVENDER DREAM
**Vibe:** Twilight sky, lavender fields, soft mysticism
**For:** Those drawn to spirituality, creativity, gentleness

```css
[data-theme="lavender-dream"] {
  --bg-primary: #F5F2F7;
  --bg-secondary: #EDE8F2;
  --surface: #E3DCEA;
  --text-primary: #3A3440;
  --accent-primary: #A89BB8;
  --accent-secondary: #B8A8C8;
  --accent-ai: #9B8FAF;
}
```

### 09 — MONOCHROME MINIMAL
**Vibe:** Clean slate, zen simplicity, pure focus
**For:** Those who want zero distraction, pure clarity

```css
[data-theme="monochrome-minimal"] {
  --bg-primary: #FAFAFA;
  --bg-secondary: #F0F0F0;
  --surface: #E8E8E8;
  --text-primary: #1A1A1A;
  --accent-primary: #6B6B6B;
  --accent-secondary: #8B8B8B;
  --accent-ai: #5A5A5A;
}
```

### 10 — VINTAGE SEPIA
**Vibe:** Old photographs, antique journals, nostalgic warmth
**For:** Those drawn to history, memory, timeless beauty

```css
[data-theme="vintage-sepia"] {
  --bg-primary: #F2EBE0;
  --bg-secondary: #E8DFD0;
  --surface: #DDD2BF;
  --text-primary: #3D3328;
  --accent-primary: #9B8B6F;
  --accent-secondary: #B8A58F;
  --accent-ai: #8B7F6B;
}
```

### 11 — SOFT PASTEL
**Vibe:** Watercolor paintings, gentle hues, dreamy softness
**For:** Those seeking lightness, playfulness, gentle joy

```css
[data-theme="soft-pastel"] {
  --bg-primary: #FAF8F5;
  --bg-secondary: #F5F0EB;
  --surface: #EFE8E0;
  --text-primary: #4A4540;
  --accent-primary: #C8D4C8;
  --accent-secondary: #D4C8D4;
  --accent-ai: #C8C8D4;
}
```

### 12 — MIDNIGHT BLUE
**Vibe:** Starlit sky, deep contemplation, cosmic calm
**For:** Night thinkers, dreamers, those seeking depth

```css
[data-theme="midnight-blue"] {
  --bg-primary: #1A1F2E;
  --bg-secondary: #242938;
  --surface: #2E3547;
  --text-primary: #D8E0F0;
  --accent-primary: #6B7F9B;
  --accent-secondary: #7F8FA8;
  --accent-ai: #8F9BB8;
}
```

---

## Theme Implementation

### React Context
```typescript
interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeMetadata[];
}

type ThemeName = 
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
```


### Theme Metadata
```typescript
interface ThemeMetadata {
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

const themes: ThemeMetadata[] = [
  {
    id: 'warm-light',
    name: 'Warm Light',
    description: 'Candlelit study, aged paper, intellectual warmth',
    vibe: 'Calm, focused, gently bright',
    category: 'classic',
    preview: { bg: '#F8F6F3', surface: '#E8E3D8', accent: '#9CAF9E' },
    tags: ['default', 'warm', 'light', 'calm'],
  },
  // ... more themes
];
```


### Theme Selector Component
```tsx
<ThemeSelector>
  <ThemeGrid>
    {themes.map(theme => (
      <ThemeCard
        key={theme.id}
        selected={currentTheme === theme.id}
        onClick={() => setTheme(theme.id)}
      >
        <ThemePreview colors={theme.preview} />
        <ThemeName>{theme.name}</ThemeName>
        <ThemeVibe>{theme.vibe}</ThemeVibe>
      </ThemeCard>
    ))}
  </ThemeGrid>
</ThemeSelector>
```

### Persistence
```typescript
// Save to localStorage and database
const saveTheme = async (theme: ThemeName) => {
  localStorage.setItem('lumis-theme', theme);
  await updateUserPreferences({ theme });
  document.documentElement.setAttribute('data-theme', theme);
};
```


---

## Theme Categories Breakdown

### Classic Themes (Universal)
- **Warm Light** - Default, works for everyone
- **Deep Dark** - Night mode alternative
- **Monochrome Minimal** - Pure focus

### Gendered Aesthetics
- **Soft Feminine** - Rose, silk, nurturing
- **Refined Masculine** - Leather, structure, bold

### Mood-Based
- **Forest Calm** - Grounding, peaceful
- **Ocean Depth** - Introspective, fluid
- **Sunset Warmth** - Optimistic, energizing
- **Lavender Dream** - Spiritual, creative

### Aesthetic Styles
- **Vintage Sepia** - Nostalgic, timeless
- **Soft Pastel** - Dreamy, playful
- **Midnight Blue** - Cosmic, contemplative

### Seasonal Themes
- **Spring Bloom** - Fresh greens, cherry blossoms
- **Summer Glow** - Golden warmth, vibrant energy
- **Autumn Harvest** - Deep oranges, cozy browns
- **Winter Frost** - Cool blues, crisp whites

### Cultural Themes
- **Japanese Zen** - Minimalist, natural harmony
- **Scandinavian Hygge** - Cozy warmth, comfort
- **Mediterranean Sun** - Terracotta, azure skies

### Personality-Based
- **Introvert's Haven** - Deep, quiet, protective
- **Extrovert's Energy** - Bright, warm, inviting
- **Analyst's Clarity** - Structured, clean, precise
- **Dreamer's Canvas** - Soft, flowing, imaginative

---

## Accessibility Considerations

All themes maintain:
- WCAG AA contrast ratios (4.5:1 minimum)
- Readable text on all backgrounds
- Clear focus states
- Consistent interaction patterns


---

## Additional Theme Implementations

### 13 — SPRING BLOOM
**Vibe:** Cherry blossoms, morning dew, fresh beginnings
**For:** Those seeking renewal, growth, gentle optimism

```css
[data-theme="spring-bloom"] {
  --bg-primary: #F7F9F5;
  --bg-secondary: #EEF4E8;
  --surface: #E5EFDD;
  --text-primary: #3A4235;
  --accent-primary: #A8C4A0;
  --accent-secondary: #D4B8C8;
  --accent-ai: #B8D4C8;
}
```

### 14 — SUMMER GLOW
**Vibe:** Golden hour, sun-kissed warmth, vibrant energy
**For:** Those seeking brightness, vitality, joyful warmth

```css
[data-theme="summer-glow"] {
  --bg-primary: #FBF8F0;
  --bg-secondary: #F7F0E0;
  --surface: #F2E8D0;
  --text-primary: #3D3528;
  --accent-primary: #E8C490;
  --accent-secondary: #D4A874;
  --accent-ai: #C8B490;
}
```

### 15 — AUTUMN HARVEST
**Vibe:** Falling leaves, cozy sweaters, warm spices
**For:** Those seeking comfort, richness, grounded warmth

```css
[data-theme="autumn-harvest"] {
  --bg-primary: #F5F0E8;
  --bg-secondary: #EDE5D8;
  --surface: #E3D8C8;
  --text-primary: #3D342A;
  --accent-primary: #C89B6F;
  --accent-secondary: #B8856F;
  --accent-ai: #A88F7F;
}
```

### 16 — WINTER FROST
**Vibe:** Snow-covered silence, crisp air, serene clarity
**For:** Those seeking clarity, calm, pristine peace

```css
[data-theme="winter-frost"] {
  --bg-primary: #F5F7FA;
  --bg-secondary: #EDF2F7;
  --surface: #E2E8F0;
  --text-primary: #2D3748;
  --accent-primary: #A0B8D0;
  --accent-secondary: #B8C8D8;
  --accent-ai: #9BB0C8;
}
```

### 17 — JAPANESE ZEN
**Vibe:** Bamboo gardens, stone pathways, mindful simplicity
**For:** Those seeking minimalism, balance, natural harmony

```css
[data-theme="japanese-zen"] {
  --bg-primary: #F8F7F4;
  --bg-secondary: #EBE9E3;
  --surface: #DDD9D0;
  --text-primary: #2A2822;
  --accent-primary: #8B9B8E;
  --accent-secondary: #A89B8B;
  --accent-ai: #8B8B9B;
}
```

### 18 — SCANDINAVIAN HYGGE
**Vibe:** Wool blankets, candlelight, cozy contentment
**For:** Those seeking comfort, warmth, intimate coziness

```css
[data-theme="scandinavian-hygge"] {
  --bg-primary: #F9F6F2;
  --bg-secondary: #F0EBE5;
  --surface: #E5DDD5;
  --text-primary: #3A3530;
  --accent-primary: #B8A89B;
  --accent-secondary: #C8B8A8;
  --accent-ai: #A8A8B8;
}
```

### 19 — MEDITERRANEAN SUN
**Vibe:** Terracotta roofs, azure seas, sun-drenched stone
**For:** Those seeking warmth, adventure, vibrant life

```css
[data-theme="mediterranean-sun"] {
  --bg-primary: #FAF7F2;
  --bg-secondary: #F2EDE3;
  --surface: #E8DFD0;
  --text-primary: #3D3528;
  --accent-primary: #C89B7F;
  --accent-secondary: #7FA8C8;
  --accent-ai: #A89BC8;
}
```

### 20 — INTROVERT'S HAVEN
**Vibe:** Quiet corners, soft lighting, protective cocoon
**For:** Introverts seeking deep focus, safety, solitude

```css
[data-theme="introvert-haven"] {
  --bg-primary: #E8E5E0;
  --bg-secondary: #DDD8D0;
  --surface: #D0C8BE;
  --text-primary: #2A2822;
  --accent-primary: #8B9B8E;
  --accent-secondary: #9B8B8E;
  --accent-ai: #8E8B9B;
}
```

### 21 — EXTROVERT'S ENERGY
**Vibe:** Open spaces, bright light, welcoming warmth
**For:** Extroverts seeking brightness, connection, vitality

```css
[data-theme="extrovert-energy"] {
  --bg-primary: #FBF9F5;
  --bg-secondary: #F5F0E8;
  --surface: #EFE5D8;
  --text-primary: #3D3528;
  --accent-primary: #D4B890;
  --accent-secondary: #C8A890;
  --accent-ai: #B8A8C8;
}
```

### 22 — ANALYST'S CLARITY
**Vibe:** Clean lines, structured space, precise focus
**For:** Analytical minds seeking order, clarity, precision

```css
[data-theme="analyst-clarity"] {
  --bg-primary: #F7F8FA;
  --bg-secondary: #EEF0F3;
  --surface: #E3E6EA;
  --text-primary: #2A2F35;
  --accent-primary: #7A8B9B;
  --accent-secondary: #8B9BAB;
  --accent-ai: #6B7B8B;
}
```

### 23 — DREAMER'S CANVAS
**Vibe:** Watercolor skies, flowing thoughts, soft imagination
**For:** Dreamers seeking fluidity, creativity, gentle wonder

```css
[data-theme="dreamer-canvas"] {
  --bg-primary: #FAF8F7;
  --bg-secondary: #F2EDF0;
  --surface: #E8E0E8;
  --text-primary: #3D3540;
  --accent-primary: #C8B8D4;
  --accent-secondary: #D4C8D4;
  --accent-ai: #B8C8D4;
}
```

---

## Complete Theme List (23 Themes)

### Core Collection (12)
1. Warm Light
2. Deep Dark
3. Soft Feminine
4. Refined Masculine
5. Forest Calm
6. Ocean Depth
7. Sunset Warmth
8. Lavender Dream
9. Monochrome Minimal
10. Vintage Sepia
11. Soft Pastel
12. Midnight Blue

### Seasonal Collection (4)
13. Spring Bloom
14. Summer Glow
15. Autumn Harvest
16. Winter Frost

### Cultural Collection (3)
17. Japanese Zen
18. Scandinavian Hygge
19. Mediterranean Sun

### Personality Collection (4)
20. Introvert's Haven
21. Extrovert's Energy
22. Analyst's Clarity
23. Dreamer's Canvas

---

## Theme Selector UI

### Organized by Category
```tsx
<ThemeSelector>
  <CategoryTabs>
    <Tab>All Themes</Tab>
    <Tab>Classic</Tab>
    <Tab>Seasonal</Tab>
    <Tab>Cultural</Tab>
    <Tab>Personality</Tab>
  </CategoryTabs>
  
  <ThemeGrid>
    {filteredThemes.map(theme => (
      <ThemeCard
        key={theme.id}
        selected={currentTheme === theme.id}
        onClick={() => setTheme(theme.id)}
      >
        <ThemePreview>
          <ColorSwatch color={theme.preview.bg} />
          <ColorSwatch color={theme.preview.surface} />
          <ColorSwatch color={theme.preview.accent} />
        </ThemePreview>
        <ThemeName>{theme.name}</ThemeName>
        <ThemeVibe>{theme.vibe}</ThemeVibe>
        <ThemeTags>
          {theme.tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </ThemeTags>
      </ThemeCard>
    ))}
  </ThemeGrid>
</ThemeSelector>
```

### Quick Theme Switcher
```tsx
<QuickThemeSwitcher>
  <CurrentTheme>
    <ThemeIcon />
    <span>{currentTheme.name}</span>
  </CurrentTheme>
  <ThemeDropdown>
    {recentThemes.map(theme => (
      <ThemeOption onClick={() => setTheme(theme.id)}>
        {theme.name}
      </ThemeOption>
    ))}
    <Divider />
    <ViewAllThemes>Browse all themes →</ViewAllThemes>
  </ThemeDropdown>
</QuickThemeSwitcher>
```

---

## Theme Recommendations

### Smart Suggestions
```typescript
const suggestTheme = (user: User): ThemeName[] => {
  const suggestions: ThemeName[] = [];
  
  // Based on time of day
  const hour = new Date().getHours();
  if (hour >= 20 || hour <= 6) {
    suggestions.push('deep-dark', 'midnight-blue', 'introvert-haven');
  } else {
    suggestions.push('warm-light', 'summer-glow', 'extrovert-energy');
  }
  
  // Based on season
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) suggestions.push('spring-bloom');
  if (month >= 5 && month <= 7) suggestions.push('summer-glow');
  if (month >= 8 && month <= 10) suggestions.push('autumn-harvest');
  if (month >= 11 || month <= 1) suggestions.push('winter-frost');
  
  // Based on user traits
  if (user.traits.includes('introvert')) {
    suggestions.push('introvert-haven', 'japanese-zen');
  }
  
  return suggestions;
};
```

### Onboarding Theme Selection
During user onboarding, show 3-5 recommended themes based on:
- Time of day
- Current season
- Brief personality questions (optional)
- Random popular themes

---

## Implementation Notes

### Performance
- Load only active theme CSS
- Lazy load theme previews
- Cache theme preferences
- Smooth transitions (250ms)

### Persistence
```typescript
// Save to both localStorage and database
const saveTheme = async (theme: ThemeName) => {
  localStorage.setItem('lumis-theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  await api.updateUserPreferences({ theme });
};

// Load on app init
const loadTheme = async () => {
  const saved = localStorage.getItem('lumis-theme') as ThemeName;
  const theme = saved || 'warm-light';
  document.documentElement.setAttribute('data-theme', theme);
};
```

### Transitions
```css
* {
  transition: background-color 250ms ease,
              color 250ms ease,
              border-color 250ms ease;
}
```
