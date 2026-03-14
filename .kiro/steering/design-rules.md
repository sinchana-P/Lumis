# Lumis Design System Rules

## Critical Design Rules

### 1. Never Use Hardcoded Colors
- **ALWAYS** use Lumis design tokens (e.g., `bg-lumis-primary`, `text-lumis-accent`)
- **NEVER** use hardcoded hex codes, RGB values, or generic colors like `bg-white`, `bg-gray-50`
- **NEVER** use inline styles with hardcoded colors like `style={{ backgroundColor: '#F2EFE9' }}`

### 2. Never Use Basic White Cards
- **NEVER** use `bg-white` or pure white backgrounds
- **ALWAYS** use warm cream surfaces: `bg-lumis-surface`, `bg-lumis-bg-secondary`
- Cards should feel warm and inviting, not stark or clinical

### 3. Always Match Lumis Vibe, Style & Pattern
- **NO BASIC SCREENS** - Every interface must feel sophisticated and thoughtful
- Use warm, muted colors that create a calm, introspective atmosphere
- Implement designs that match the "dimly lit study at midnight" aesthetic
- Every component should feel like it's gently holding the user's thoughts

### 4. Keep Files Short & Split Into Smaller Chunks
- **ALWAYS** break down components into focused, single-responsibility files
- Move complex logic into separate utility files
- Create reusable sub-components rather than monolithic components
- Each file should have a clear, single purpose

### 5. Use Proper Lumis Color Tokens

#### Background Colors
```css
--lumis-bg-primary: #F8F6F3     /* Main warm cream background */
--lumis-bg-secondary: #F2EFE9   /* Slightly deeper cream */
--lumis-surface: #E8E3D8        /* Card backgrounds */
```

#### Text Colors
```css
--lumis-text-primary: #3D3935   /* Main text */
--lumis-text-secondary: #6B6560 /* Secondary text */
--lumis-text-tertiary: #9B9590  /* Subtle text */
```

#### Accent Colors
```css
--lumis-accent-primary: #9CAF9E    /* Sage green */
--lumis-accent-secondary: #C9A58F  /* Terracotta */
--lumis-accent-ai: #B5A8C1        /* Lavender */
--lumis-accent-gold: #D4B896      /* Muted gold */
```

### 6. Correct Tailwind Classes to Use
- `bg-lumis-bg-primary` - Main page background
- `bg-lumis-bg-secondary` - Section backgrounds  
- `bg-lumis-surface` - Card backgrounds
- `text-lumis-text-primary` - Main text
- `text-lumis-text-secondary` - Secondary text
- `border-lumis-text-tertiary/20` - Subtle borders

### 7. What NOT to Use
- ❌ `bg-white` 
- ❌ `bg-gray-50`, `bg-gray-100`
- ❌ `text-gray-800`, `text-gray-600`
- ❌ `border-gray-200`
- ❌ Any hardcoded hex codes
- ❌ Any RGB values in styles
- ❌ Generic color names

### 8. Design Philosophy Reminders
- **Breathing Space** - Anxiety lives in clutter, never crowd the interface
- **Low Stimulation** - High contrast triggers urgency, use muted warm colors
- **Weight & Gravity** - Interface should feel substantial, not lightweight
- **Feeling of Being Held** - Rounded containers, soft shadows, warm backgrounds
- **Depth Without Complexity** - Rich meaning, not complex UI layers

## Implementation Checklist

Before submitting any UI component:
- [ ] No hardcoded colors anywhere
- [ ] All backgrounds use Lumis tokens
- [ ] Text uses proper Lumis text colors
- [ ] No pure white cards or surfaces
- [ ] Matches warm, sophisticated aesthetic
- [ ] Component is focused and single-responsibility
- [ ] Follows Lumis spacing and typography patterns