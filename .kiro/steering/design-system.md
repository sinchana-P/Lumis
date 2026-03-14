---
inclusion: fileMatch
fileMatchPattern: "**/*.{css,scss,tsx,jsx}"
---

# Lumis Design System

## Design Philosophy

Lumis is not a productivity app. It is not a wellness app. It is the place you go when something feels off and you cannot name it yet. The design must hold that feeling — quiet, safe, intelligent, and deep.

The visual language should feel like:
- A dimly lit study at midnight
- A leather journal left open on a desk
- The feeling just before you understand something about yourself
- Calm. Not cold. Intelligent. Not clinical.

## Psychological UX Principles

### 01 — BREATHING SPACE
Anxiety lives in clutter. The interface never crowds you.
Every screen has one primary action. Nothing fights for attention.

### 02 — LOW STIMULATION
High-contrast neons trigger urgency. Lumis never rushes you.
Colours are muted, warm, desaturated — like candlelight not LED.

### 03 — WEIGHT & GRAVITY
Lightweight apps feel disposable. Lumis feels like it matters.
Typography is heavier. Spacing is generous. Nothing bounces.

### 04 — THE FEELING OF BEING HELD
Rounded containers. Soft shadows. Warm backgrounds.
The UI should feel like it is gently holding your thoughts.

### 05 — DEPTH WITHOUT COMPLEXITY
Layers of meaning — not layers of UI.
One surface. But what sits on it feels rich and considered.

---

## Color Palette

### Primary Colors (Warm Neutrals - The Foundation)

```css
/* Soft Warm Cream - Main Background */
--lumis-bg-primary: #F8F6F3;        /* Warm paper, gentle on eyes */
--lumis-bg-secondary: #F2EFE9;      /* Slightly deeper cream */
--lumis-bg-tertiary: #EBE7DF;       /* Subtle depth layer */

/* Soft Taupe - Surfaces & Cards */
--lumis-surface: #E8E3D8;           /* Warm card background */
--lumis-surface-hover: #DFD9CC;     /* Interactive state */
--lumis-surface-elevated: #FFFFFF;  /* Pure white for emphasis */
```

### Accent Colors (Muted Earth Tones)

```css
/* Dusty Sage - Primary Actions & Focus */
--lumis-accent-primary: #9CAF9E;    /* Soft sage green - calming, growth */
--lumis-accent-primary-hover: #8A9D8C;
--lumis-accent-primary-light: #C5D4C6;

/* Warm Terracotta - Secondary Actions */
--lumis-accent-secondary: #C9A58F;  /* Earthy warmth, connection */
--lumis-accent-secondary-hover: #B8947D;
--lumis-accent-secondary-light: #E5D4C5;

/* Soft Lavender - Insights & AI */
--lumis-accent-ai: #B5A8C1;         /* Gentle purple - wisdom, depth */
--lumis-accent-ai-hover: #A396AF;
--lumis-accent-ai-light: #D9D2E0;

/* Muted Gold - Highlights & Special */
--lumis-accent-gold: #D4B896;       /* Warm gold - value, significance */
--lumis-accent-gold-hover: #C2A684;
--lumis-accent-gold-light: #EBE0D0;
```

### Text Colors (Warm Grays)

```css
/* Primary Text - Warm Charcoal */
--lumis-text-primary: #3D3935;      /* Deep warm brown-gray */
--lumis-text-secondary: #6B6560;    /* Medium warm gray */
--lumis-text-tertiary: #9B9590;     /* Light warm gray */
--lumis-text-disabled: #C4BFB8;     /* Very light gray */

/* Inverted Text (on dark surfaces) */
--lumis-text-inverse: #F8F6F3;
```

### Semantic Colors (Muted & Gentle)

```css
/* Success - Soft Moss */
--lumis-success: #8FA888;
--lumis-success-bg: #E8F0E7;
--lumis-success-border: #C5D9C3;

/* Warning - Soft Amber */
--lumis-warning: #D4A574;
--lumis-warning-bg: #F9F0E6;
--lumis-warning-border: #EDD9C3;

/* Error - Muted Rose */
--lumis-error: #C89090;
--lumis-error-bg: #F5E8E8;
--lumis-error-border: #E5CFCF;

/* Info - Soft Sky */
--lumis-info: #94A8B8;
--lumis-info-bg: #E7EDF2;
--lumis-info-border: #C8D7E3;
```

### Emotion Colors (For Mood Tracking)

```css
/* Positive Emotions */
--emotion-joyful: #E8C4A0;          /* Warm peach */
--emotion-safe: #A8C4A8;            /* Soft green */
--emotion-energized: #F0D4A0;       /* Gentle yellow */
--emotion-peaceful: #B0C8D8;        /* Calm blue */
--emotion-loved: #D8B0C0;           /* Soft pink */

/* Negative Emotions */
--emotion-anxious: #C8B8A8;         /* Muted tan */
--emotion-drained: #A8A8B8;         /* Soft gray-blue */
--emotion-confused: #B8B0C0;        /* Muted lavender */
--emotion-hurt: #C8A8A8;            /* Dusty rose */
```

### Shadows & Depth

```css
/* Soft, warm shadows - never harsh black */
--shadow-sm: 0 1px 3px rgba(61, 57, 53, 0.08);
--shadow-md: 0 4px 12px rgba(61, 57, 53, 0.10);
--shadow-lg: 0 8px 24px rgba(61, 57, 53, 0.12);
--shadow-xl: 0 16px 48px rgba(61, 57, 53, 0.14);

/* Inner shadow for depth */
--shadow-inner: inset 0 2px 4px rgba(61, 57, 53, 0.06);

/* Glow for focus states */
--glow-focus: 0 0 0 3px rgba(156, 175, 158, 0.20);
```

---

## Typography

### Font Families

```css
/* Serif - For body text, journal entries, AI responses */
--font-serif: 'Crimson Pro', 'Georgia', serif;

/* Sans-serif - For UI elements, labels, buttons */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Mono - For dates, numbers, data */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

### Font Sizes (Generous Scale)

```css
--text-xs: 0.75rem;      /* 12px - timestamps, metadata */
--text-sm: 0.875rem;     /* 14px - secondary text */
--text-base: 1rem;       /* 16px - body text */
--text-lg: 1.125rem;     /* 18px - emphasized text */
--text-xl: 1.25rem;      /* 20px - section headers */
--text-2xl: 1.5rem;      /* 24px - page titles */
--text-3xl: 1.875rem;    /* 30px - hero text */
--text-4xl: 2.25rem;     /* 36px - large displays */
```

### Font Weights

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights (Generous for readability)

```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

---

## Spacing Scale (Generous Breathing Room)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

---

## Border Radius (Soft, Organic)

```css
--radius-sm: 6px;     /* Small elements */
--radius-md: 12px;    /* Cards, buttons */
--radius-lg: 16px;    /* Large containers */
--radius-xl: 24px;    /* Hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

---

## Component Patterns

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--lumis-accent-primary);
  color: var(--lumis-text-inverse);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-weight: var(--font-medium);
  box-shadow: var(--shadow-sm);
  transition: all 200ms ease;
}

.btn-primary:hover {
  background: var(--lumis-accent-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: var(--lumis-surface);
  color: var(--lumis-text-primary);
  border: 1px solid var(--lumis-accent-secondary-light);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--lumis-text-secondary);
}
```

### Cards

```css
.card {
  background: var(--lumis-surface-elevated);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--lumis-bg-tertiary);
}

.card-hover:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  transition: all 250ms ease;
}
```

### Input Fields

```css
.input {
  background: var(--lumis-bg-primary);
  border: 2px solid var(--lumis-bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-serif);
  font-size: var(--text-base);
  color: var(--lumis-text-primary);
  transition: all 200ms ease;
}

.input:focus {
  border-color: var(--lumis-accent-primary);
  box-shadow: var(--glow-focus);
  outline: none;
}
```

### Emotion Pills

```css
.emotion-pill {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  font-weight: var(--font-medium);
  background: var(--emotion-color-bg);
  color: var(--lumis-text-primary);
  border: 1px solid var(--emotion-color-border);
}
```

---

## Animation Principles

### Timing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### Duration

```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
```

### Rules
- Never bounce or spring animations
- Fade in/out, not pop
- Gentle slides, not snaps
- Everything eases, nothing is linear

---

## Layout Principles

### Max Widths (Comfortable Reading)

```css
--max-width-sm: 640px;   /* Forms, narrow content */
--max-width-md: 768px;   /* Journal entries, reading */
--max-width-lg: 1024px;  /* Dashboard, lists */
--max-width-xl: 1280px;  /* Full app width */
```

### Grid Gaps

```css
--gap-sm: var(--space-4);
--gap-md: var(--space-6);
--gap-lg: var(--space-8);
```

---

## Accessibility

### Focus States
- Always visible focus rings
- Use `--glow-focus` for all interactive elements
- Never remove outline without replacement

### Color Contrast
- All text meets WCAG AA minimum (4.5:1)
- Important text meets AAA (7:1)
- Test with color blindness simulators

### Touch Targets
- Minimum 44x44px for all interactive elements
- Generous padding on mobile

---

## Dark Mode (Optional - Light is Primary)

If implementing dark mode, invert the warmth:

```css
[data-theme="dark"] {
  --lumis-bg-primary: #2A2622;
  --lumis-bg-secondary: #332F2A;
  --lumis-surface: #3D3935;
  --lumis-text-primary: #E8E3D8;
  /* Keep accent colors similar but slightly desaturated */
}
```

---

## Usage Examples

### Page Background
```css
body {
  background: var(--lumis-bg-primary);
  color: var(--lumis-text-primary);
  font-family: var(--font-serif);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}
```

### Section Header
```css
.section-header {
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--lumis-text-primary);
  margin-bottom: var(--space-6);
}
```

### AI Response Container
```css
.lumen-response {
  background: var(--lumis-accent-ai-light);
  border-left: 4px solid var(--lumis-accent-ai);
  padding: var(--space-6);
  border-radius: var(--radius-md);
  font-family: var(--font-serif);
  line-height: var(--leading-relaxed);
}
```

---

## Design Tokens Export

For Tailwind config:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        lumis: {
          bg: {
            primary: '#F8F6F3',
            secondary: '#F2EFE9',
            tertiary: '#EBE7DF',
          },
          surface: {
            DEFAULT: '#E8E3D8',
            hover: '#DFD9CC',
            elevated: '#FFFFFF',
          },
          accent: {
            primary: '#9CAF9E',
            secondary: '#C9A58F',
            ai: '#B5A8C1',
            gold: '#D4B896',
          },
          text: {
            primary: '#3D3935',
            secondary: '#6B6560',
            tertiary: '#9B9590',
          },
        },
      },
      fontFamily: {
        serif: ['Crimson Pro', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```
