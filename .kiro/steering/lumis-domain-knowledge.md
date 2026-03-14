---
inclusion: auto
---

# Lumis Domain Knowledge

## Product Context
Lumis is a private, AI-powered personal intelligence tool for understanding relationships through observed behavior, numerology, astrology, and psychology frameworks.

## Core Entities

### User (Self Layer)
- Profile: name, photo, DOB, time, place of birth
- Numerology: Life Path, Expression, Soul Urge, Personality, Birthday, Maturity numbers
- Timing: Personal Year, Personal Month, Personal Day, Life Cycles
- Astrology: Sun, Moon, Rising, Venus, Mars, Mercury signs + transits
- Self Traits: Strengths, Shadows, Triggers, Needs, Patterns
- AI Self Report: attachment style, emotional trigger map

### Member
- Profile: name, photo, relation type (with "Other" custom field), tags, DOB data
- Pros & Cons: traits with intensity ratings and emotion tags
- Incidents: dated events with emotional impact
- Patterns: recurring behaviors
- Interactions: logged meetups with mood before/after
- Journal: free-text diary per member
- Numerology & Astrology: same as user
- AI Relationship Report: compatibility, dynamic type, tension/growth points, forecast

### Lumen (AI Agent)
- Modes: Vent, Guided, Analysis, Advice, Timing
- Analysis Depth: Cosmic (numerology/astrology only), Behavioral (logged data only), Full Spectrum (everything)
- Context: access based on selected analysis depth mode
- Psychology frameworks: attachment theory, cognitive distortions, emotional regulation, Big Five, Jungian shadow work, NVC
- Memory: conversation history, weekly digests

### Insights Dashboard
- Relationship health scores
- Energy map (energizing vs draining)
- Emotional weather tracking
- Pattern alerts
- Trigger map
- Numerology/astrology calendar

## Key Business Rules

### Privacy First
- Everything private by default
- No social features, no discovery, no public profiles
- Sharing is intentional, link-based only
- User controls exactly what's visible in shared links

### Data Integrity
- All numerology/astrology auto-calculated from DOB + name
- Never ask user to input calculated values
- Real-time updates when DOB or name changes
- Soft deletes only - preserve user history

### AI Behavior
- Never pathologizes - validates first
- Trauma-informed language
- Doesn't give unsolicited advice in Vent Mode
- Uses full context - never starts from zero
- Regeneratable reports as data grows

### Relationship Dynamics
- Bidirectional analysis: user ↔ member
- Both blueprints inform compatibility
- Timing guidance based on both Personal Year cycles
- Pattern detection across all members

## Terminology Standards
- "Member" not "contact" or "person"
- "Lumen" not "AI" or "chatbot" in UI
- "Blueprint" for numerology/astrology data
- "Self Layer" for user's own profile
- "Trait" for any logged characteristic
- "Incident" for specific dated events
- "Pattern" for recurring behaviors
- "Interaction" for logged meetups
- "Report" for AI-generated analysis

## Calculation References

### Numerology
- Life Path: sum of birth date reduced to single digit (except 11, 22, 33)
- Expression: sum of full name letter values
- Soul Urge: sum of vowels in name
- Personality: sum of consonants in name
- Personal Year: (birth month + birth day + current year) reduced
- Personal Month: (Personal Year + current month) reduced

### Astrology
- Requires: exact birth date, time, location (lat/long)
- Natal chart: planetary positions at birth moment
- Transits: current planetary positions relative to natal chart
- Use ephemeris data for calculations

## Emotion Taxonomy
Standard emotion tags used throughout:
- Positive: joyful, safe, energized, peaceful, loved, understood, inspired
- Negative: anxious, drained, confused, hurt, invisible, controlled, dismissed
- Neutral: curious, reflective, uncertain

## Relation Types
- Friend
- Family
- Colleague
- Partner
- Acquaintance
- Boss
- Mentor
- Therapist
- Coach
- Teacher
- Student
- Neighbor
- Ex-Partner
- Other (custom user-defined text field)

## Intensity Ratings
- Mild: noticeable but manageable
- Moderate: significant impact on emotional state
- Strong: deeply affecting, hard to ignore

## AI Query Categories
1. Mood-triggered: "I feel X after talking to Y"
2. Person deep-dive: "Why do I feel X around Y?"
3. Pattern analysis: "Why do I keep attracting X type?"
4. Conflict breakdown: "We argued about X - analyze it"
5. Comparison: "Compare how I feel around X vs Y"
6. Timing: "Should I reach out to X today?"

## Feature Flags (MVP vs Phase 2)
MVP: All core features including Lumen, full numerology/astrology, insights dashboard
Phase 2: Dream log, PDF export, Tarot layer

## Integration Points
- Claude API: all Lumen interactions
- Supabase Auth: authentication
- Supabase DB: PostgreSQL with pgvector
- Supabase Storage: photos, exports
- Ephemeris API: astrology calculations (or local library)
- Numerology: custom calculation service
