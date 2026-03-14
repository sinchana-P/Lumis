---
inclusion: auto
---

# Lumis Theme Token Standards

## CRITICAL RULE: NO HARDCODED COLORS EVER

**NEVER use hardcoded colors in any component. ALWAYS use theme tokens.**

## UX/UI Design Philosophy - MOST IMPORTANT

### Core Design Principles

**Lumis is not a basic platform. We are building something very beautiful, heartfelt, deep, calm with sophisticated user experiences.**

#### 1. SOPHISTICATED ELEGANCE
- Every component should be detailed and refined
- Never use basic or generic screens
- Each element should feel carefully crafted
- Typography should be elegant and purposeful

#### 2. NO EMOJIS - USE BEAUTIFUL ICONS
- **NEVER use emojis in the interface**
- Always explore and use beautiful SVG icons
- Icons should be sophisticated and minimal
- Use proper icon libraries or custom SVG designs

#### 3. HEARTFELT & DEEP EXPERIENCE
- The platform should feel calm and safe
- User experiences should have depth and meaning
- Every interaction should feel intentional
- Create space for reflection and contemplation

#### 4. REFERENCE DESIGN STANDARDS
- Always refer to sophisticated design patterns
- Study high-end applications and websites
- Maintain consistency with elegant design systems
- Never settle for "good enough" - aim for exceptional

#### 5. BEAUTIFUL VISUAL HIERARCHY
- Use proper spacing and typography scales
- Create clear information architecture
- Guide users through elegant visual flows
- Maintain sophisticated color relationships

## Required Theme Token Usage

### Background Colors
- `bg-primary` - Main page background
- `bg-secondary` - Secondary surfaces  
- `bg-tertiary` - Subtle depth layers
- `bg-surface` - Card/component backgrounds
- `bg-surface-hover` - Interactive surface states
- `bg-surface-elevated` - Elevated surfaces (modals, dropdowns)

### Text Colors  
- `text-primary` - Main text content
- `text-secondary` - Supporting text
- `text-tertiary` - Subtle text (labels, metadata)
- `text-disabled` - Disabled state text
- `text-inverse` - Text on dark backgrounds

### Accent Colors
- `bg-accent-primary` - Primary actions, focus states
- `bg-accent-secondary` - Secondary actions  
- `bg-accent-ai` - AI/Lumen related elements
- `bg-accent-gold` - Highlights, special states
- `text-accent-primary` - Accent text color
- `border-accent-primary` - Accent borders

### Semantic Colors
- `bg-error` - Error states
- `text-error` - Error text
- `bg-success` - Success states
- `text-success` - Success text

### Interactive States
- `hover:bg-accent-primary` - Primary hover
- `hover:text-primary` - Text hover
- `focus:border-accent-primary` - Focus borders
- `focus:ring-accent-primary` - Focus rings
## FORBIDDEN Practices

### ❌ NEVER DO THIS:
```tsx
// Hardcoded Tailwind colors
className="bg-blue-500 text-white border-gray-300"

// Hardcoded hex colors  
style={{ backgroundColor: '#9CAF9E' }}

// Old lumis- prefixed classes
className="bg-lumis-accent-primary text-lumis-text-primary"

// Hardcoded CSS colors
className="bg-green-500 text-red-600"
```

### ✅ ALWAYS DO THIS:
```tsx
// Use theme tokens
className="bg-accent-primary text-inverse border-primary"

// CSS custom properties in styles
style={{ backgroundColor: 'var(--accent-primary)' }}

// Theme-aware utility classes
className="bg-primary text-primary border-accent-primary"
```

## Component Development Rules

### 1. New Components
- MUST use theme tokens for ALL colors
- MUST NOT use hardcoded Tailwind color classes
- MUST support theme switching without code changes

### 2. Existing Components  
- MUST be refactored to use theme tokens
- MUST remove all hardcoded color references
- MUST test across multiple themes

### 3. SVG and Icons
- Use `currentColor` for icon fills/strokes
- Apply text color classes to parent elements
- Never hardcode icon colors

```tsx
// ✅ Correct SVG usage
<div className="text-accent-primary">
  <svg fill="currentColor">...</svg>
</div>

// ❌ Wrong SVG usage  
<svg fill="#9CAF9E">...</svg>
```
## Theme Token Reference

### Complete Token List
```css
/* Backgrounds */
--bg-primary: Main page background
--bg-secondary: Secondary surfaces
--bg-tertiary: Subtle layers
--surface: Component backgrounds  
--surface-hover: Interactive states
--surface-elevated: Modals, dropdowns

/* Text */
--text-primary: Main content
--text-secondary: Supporting text
--text-tertiary: Labels, metadata
--text-disabled: Disabled states
--text-inverse: On dark backgrounds

/* Accents */
--accent-primary: Primary actions
--accent-secondary: Secondary actions
--accent-ai: AI/Lumen elements
--accent-gold: Highlights, special
--accent-primary-hover: Hover states

/* Semantic */
--success: Success states
--warning: Warning states  
--error: Error states
--info: Info states
```

### Utility Class Mapping
```css
.bg-primary { background-color: var(--bg-primary); }
.text-primary { color: var(--text-primary); }
.border-primary { border-color: var(--bg-tertiary); }
.hover\:bg-accent-primary:hover { background-color: var(--accent-primary-hover); }
```

## Development Workflow

### Before Writing Code
1. Check available theme tokens in `globals.css`
2. Plan color usage with theme tokens only
3. Never reach for hardcoded colors

### During Development  
1. Use theme token utility classes
2. Test with multiple themes
3. Verify no hardcoded colors exist

### Code Review Checklist
- [ ] No hardcoded Tailwind colors (bg-blue-500, etc.)
- [ ] No hex/rgb colors in styles
- [ ] All colors use theme tokens
- [ ] Component works across all themes
- [ ] SVGs use currentColor appropriately
## Common Patterns

### Form Elements
```tsx
// Input fields
<input className="bg-primary border-primary text-primary focus:border-accent-primary" />

// Buttons  
<button className="bg-accent-primary text-inverse hover:bg-accent-primary">
  Submit
</button>

// Labels
<label className="text-secondary">Field Label</label>
```

### Cards and Containers
```tsx
// Card component
<div className="bg-surface-elevated border-primary shadow-theme-md">
  <h3 className="text-primary">Card Title</h3>
  <p className="text-secondary">Card content</p>
</div>

// Page container
<div className="min-h-screen bg-primary">
  <main className="text-primary">...</main>
</div>
```

### Navigation Elements
```tsx
// Active nav item
<button className="text-accent-secondary border-b-2 border-accent-secondary">
  Active Page
</button>

// Inactive nav item  
<button className="text-tertiary hover:text-primary">
  Other Page
</button>
```

### Interactive States
```tsx
// Hover and focus states
<button className="bg-surface hover:bg-surface-hover focus:border-accent-primary">
  Interactive Button
</button>

// Disabled states
<button className="bg-surface text-disabled cursor-not-allowed" disabled>
  Disabled Button  
</button>
```

## Theme Testing Requirements

### Manual Testing
- Test component in ALL 12 available themes
- Verify readability and contrast
- Check interactive states work properly
- Ensure no hardcoded colors show through

### Automated Checks
- Build must pass without color-related errors
- No hardcoded color classes in final bundle
- Theme switching works without page refresh

## Emergency Color Fixes

If you find hardcoded colors in production:

1. **Immediate Fix**: Replace with nearest theme token
2. **Test**: Verify across multiple themes  
3. **Document**: Add to this steering guide if new pattern
4. **Review**: Check for similar issues in codebase

Remember: **Theme consistency is critical for Lumis user experience.**