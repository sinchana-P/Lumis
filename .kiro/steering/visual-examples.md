---
inclusion: manual
---

# Lumis Visual Examples

## Color Palette Visualization

### Background Layers (Warm Neutrals)
```
┌─────────────────────────────────────────┐
│  #F8F6F3  Soft Warm Cream (Primary BG) │  ← Main canvas
│  ┌───────────────────────────────────┐  │
│  │  #F2EFE9  Slightly Deeper Cream  │  │  ← Subtle depth
│  │  ┌─────────────────────────────┐  │  │
│  │  │  #EBE7DF  Tertiary Layer   │  │  │  ← More depth
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Accent Colors (Muted Earth Tones)
```
🌿 Dusty Sage (#9CAF9E)      - Primary actions, growth, calm
🏺 Warm Terracotta (#C9A58F) - Secondary actions, warmth, connection
🔮 Soft Lavender (#B5A8C1)   - AI/Lumen, wisdom, depth
✨ Muted Gold (#D4B896)       - Highlights, significance, value
```

### Emotion Color Spectrum
```
Positive Energy:
🌅 Joyful    #E8C4A0  ████████  Warm peach
🌱 Safe      #A8C4A8  ████████  Soft green
⚡ Energized #F0D4A0  ████████  Gentle yellow
🌊 Peaceful  #B0C8D8  ████████  Calm blue
💝 Loved     #D8B0C0  ████████  Soft pink

Challenging Energy:
😰 Anxious   #C8B8A8  ████████  Muted tan
😔 Drained   #A8A8B8  ████████  Soft gray-blue
🤔 Confused  #B8B0C0  ████████  Muted lavender
💔 Hurt      #C8A8A8  ████████  Dusty rose
```

---

## Typography Hierarchy

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Hero / Page Title (36px, Sans, Semibold)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

────────────────────────────────────────
  Section Header (20px, Sans, Semibold)
────────────────────────────────────────

  Body Text (16px, Serif, Normal)
  This is where journal entries, AI responses,
  and longer form content lives. Generous line
  height (1.625) makes reading comfortable.

  Secondary Text (14px, Sans, Normal)
  Labels, metadata, timestamps

  Tiny Text (12px, Mono, Normal)
  Dates, numbers, technical info
```

---

## Component Visual Examples

### Button States

```
┌──────────────────────┐
│   Primary Button     │  ← #9CAF9E (Dusty Sage)
└──────────────────────┘
        ↓ hover
┌──────────────────────┐
│   Primary Button     │  ← Slightly darker + lifted
└──────────────────────┘

┌──────────────────────┐
│  Secondary Button    │  ← #E8E3D8 surface with border
└──────────────────────┘

  Ghost Button           ← Transparent, text only
```

### Card Elevation

```
┌─────────────────────────────────────┐
│                                     │
│  Card Content                       │  ← White surface
│  Soft shadow, rounded corners       │     Warm shadow
│                                     │
└─────────────────────────────────────┘
```

### Input Field States

```
┌─────────────────────────────────────┐
│  Placeholder text...                │  ← Default
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  User typing here|                  │  ← Focus (sage glow)
└─────────────────────────────────────┘
```

### Emotion Pills

```
 ┌──────────┐  ┌──────────┐  ┌──────────┐
 │ 😊 Joyful │  │ 🌱 Safe  │  │ 💝 Loved │
 └──────────┘  └──────────┘  └──────────┘
```

---

## Layout Examples

### Dashboard Layout
```
┌────────────────────────────────────────────────────────┐
│  ✦ LUMIS                                    [Profile]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │  Welcome back, [Name]                           │ │
│  │  Your emotional weather this week               │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌─────────────────┐  ┌─────────────────┐            │
│  │                 │  │                 │            │
│  │  Energy Map     │  │  Recent         │            │
│  │                 │  │  Insights       │            │
│  │                 │  │                 │            │
│  └─────────────────┘  └─────────────────┘            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Member Profile Layout
```
┌────────────────────────────────────────────────────────┐
│  ← Back to Members                                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────┐                                               │
│  │ 📷 │  Jane Doe                                     │
│  └────┘  Friend · Health Score: 78                    │
│                                                        │
│  ┌─────┬─────────┬──────────┬─────────┬─────────┐    │
│  │ Pro │ Cons    │ Incident │ Pattern │ Journal │    │
│  │ Con │         │          │         │         │    │
│  └─────┴─────────┴──────────┴─────────┴─────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │  Pros & Cons Content                            │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Lumen Chat Interface
```
┌────────────────────────────────────────────────────────┐
│  🔮 Lumen                                              │
│  Mode: Analysis  [Vent] [Guided] [Advice] [Timing]    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  You:                                                  │
│  Why do I feel drained after talking to my mom?       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 🔮 Lumen:                                        │ │
│  │                                                  │ │
│  │ I notice you've logged 4 interactions with      │ │
│  │ your mom in the past month. In 3 of them,       │ │
│  │ your mood shifted from "peaceful" to "drained"  │ │
│  │ or "anxious" afterward...                       │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  Type your message...                          │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Spacing & Rhythm

### Vertical Rhythm
```
Section Title
↓ 24px

Card
↓ 16px

Card
↓ 16px

Card
↓ 32px

Next Section Title
```

### Card Internal Spacing
```
┌─────────────────────────────────────┐
│  ← 24px padding all sides           │
│                                     │
│  Content with generous breathing    │
│  room. Never cramped.               │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## Interaction States

### Hover Effects
- Subtle lift (2px translateY)
- Shadow deepens slightly
- Color darkens 5-10%
- Transition: 250ms ease

### Focus States
- Soft glow in accent color
- Never harsh outline
- 3px blur radius
- 20% opacity

### Active/Pressed
- Slight scale down (0.98)
- Shadow reduces
- Quick transition (150ms)

---

## Iconography Style

- Rounded, not sharp
- 2px stroke weight
- Warm, organic feel
- Never neon or bright
- Examples: Feather Icons, Phosphor Icons (duotone)

---

## Photography/Imagery Guidelines

If using images:
- Warm color grading
- Soft focus, never harsh
- Natural lighting
- Muted tones
- Avoid high contrast
- Think: film photography, not digital

---

## Voice & Microcopy

### Button Labels
✅ "Save your thoughts"
❌ "Submit"

✅ "Add a person"
❌ "Create new member"

✅ "Talk to Lumen"
❌ "Open AI chat"

### Empty States
✅ "No one here yet. Add someone who matters to you."
❌ "No members found."

✅ "Your journal is waiting for your first thought."
❌ "No entries."

### Error Messages
✅ "We couldn't save that. Want to try again?"
❌ "Error: Save failed."

---

## Mobile Considerations

- Larger touch targets (48px minimum)
- More generous spacing
- Simplified navigation
- One column layouts
- Bottom navigation bar
- Thumb-friendly zones

---

## Performance & Feel

- Smooth 60fps animations
- Instant feedback on interactions
- Optimistic UI updates
- Skeleton loaders (not spinners)
- Progressive image loading
- No janky scrolling
