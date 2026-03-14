# ✦ LUMIS
### *the quiet light that helps you finally see a person clearly*

**Product Features Document — Version 1.0**
MVP + Phase 2 Scope · 2025 · Private & Confidential

---

> *Lumis is a private, AI-powered personal intelligence tool that helps you understand the people in your life — and more importantly, understand how they make you feel and why.*

---

## Table of Contents

1. [Product Overview](#01--product-overview)
2. [Your Profile — The Self Layer](#02--your-profile-the-self-layer)
3. [Members](#03--members)
4. [Lumen — AI Agent](#04--lumen-ai-agent)
5. [Insights Dashboard](#05--insights-dashboard)
6. [Sharing](#06--sharing-optional-feature)
7. [Subtle Sticky Features](#07--subtle-features-that-make-it-sticky)
8. [Full Feature Status Map](#08--full-feature-status-map)
9. [What Makes Lumis Unique](#09--what-makes-lumis-unique)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, routing, API routes built-in — web first |
| UI | Tailwind CSS + shadcn/ui | Clean, customisable component system |
| State | Redux Toolkit + RTK Query | Predictable state, async thunks, devtools |
| Backend | NestJS | Structured services, dependency injection, scalable |
| Database | PostgreSQL via Supabase | Auth, realtime, row-level security — free tier |
| Vector DB | pgvector (Supabase) | Semantic search over journal entries |
| AI Core | Gemini 1.5 Flash (Primary) + Groq Llama 3.1 70B (Speed) | Deep analysis + instant responses |
| Embeddings | Cohere (free tier) | Semantic search over journal entries |
| Auth | Supabase Auth | Google/email sign-in, zero config |
| Storage | Supabase Storage | Profile photos, exports |
| Charts | Recharts | React-native, easy to customise |
| Deployment | Vercel + Railway | Frontend on Vercel, NestJS on Railway |

---

## 01 — Product Overview

Lumis combines three powerful layers — observed behavioural data (traits, incidents, patterns), numerological blueprint (Life Path, Soul Urge, Personal Year), and astrological natal data (birth chart, transits) — and feeds all of it into an AI agent called **Lumen**, trained on psychology frameworks including attachment theory, cognitive distortions, and emotional regulation.

The result is a system that does not give you generic advice. It gives you answers that are specific to your wiring, your logged data, and the actual dynamics between you and each person in your life.

---

## 02 — Your Profile (The Self Layer)

> Before you understand anyone else, Lumis makes you look inward first. Your profile is the foundation that makes every relationship insight personal and specific to you — not generic.

### 2.1 — Basic Info
- Full name, profile photo
- Date of Birth, Time of Birth, Place of Birth
- Relation to platform (private — only you see this)

---

### 2.2 — Numerological Blueprint (Auto-Generated)

All numbers are calculated automatically from your DOB and name. Updated in real-time.

**Core Numbers**
- **Life Path Number** — your core purpose, personality, and life direction
- **Expression Number** — how you naturally show up in the world
- **Soul Urge Number** — what you secretly want and need from people
- **Personality Number** — how others perceive you from the outside
- **Birthday Number** — your natural gift and dominant talent
- **Maturity Number** — who you are becoming as you grow older

**Timing Numbers (Live)**
- **Personal Year** — the overarching energy and theme of your current year
- **Personal Month** — this month's emotional climate and focus area
- **Personal Day** — daily energy tone (optional, for deeper users)
- **Life Cycles** — which of the three major life phases you are currently in

---

### 2.3 — Astrological Natal Chart (Auto-Generated · MVP)

Calculated from DOB + time + place. The same data already collected for numerology — no extra input needed.

- **Sun Sign** — core identity and ego expression
- **Moon Sign** — emotional nature, instincts, and inner world
- **Rising Sign (Ascendant)** — how others experience you
- **Venus Sign** — how you love and what you value in relationships
- **Mars Sign** — how you pursue, assert, and handle conflict
- **Mercury Sign** — how you think, communicate, and process
- **Dominant Element** — Fire / Earth / Air / Water balance
- **Current Transits** — what planetary energies are active right now

---

### 2.4 — Self Traits (You Log These)

> The most honest data in the whole system. You log your own light and shadow — and Lumen uses both to interpret every relationship you have.

| Category | Label | Examples |
|---|---|---|
| ✦ | Strengths | Empathetic, loyal, good listener, dependable, emotionally intelligent |
| 🌑 | Shadows | People pleaser, avoids conflict, overthinks, shuts down when hurt, over-gives |
| ⚡ | Triggers | Being ignored, feeling controlled, broken promises, passive aggression, coldness |
| 🫁 | Needs | Consistency, verbal reassurance, space to process, honesty over comfort, to feel heard |
| 🔁 | Patterns | Attract unavailable people, always the fixer, lose myself in relationships, say yes when I mean no |

---

### 2.5 — AI Self Report (Lumen Generated)

- Auto-generated by Lumen — cross-references your numerology + astrology + self-logged traits
- Infers your **Attachment Style** based on patterns logged across all members
- Generates your **Emotional Trigger Map** — which behaviours affect you most and why
- **Regeneratable** — as you add more traits, the report deepens and updates
- Answers questions like: why you keep attracting the same type of person, what your core relationship wound is, and where your blind spots lie

---

## 03 — Members

> Everyone significant in your life. Friends, family, colleagues, partners — each with their own full profile, data layers, and AI-generated relationship analysis specific to you and them.

### 3.1 — Member Profile
- Full name, photo, relation type (Friend / Family / Colleague / Partner / Acquaintance / Boss / Mentor / Therapist / Coach / Teacher / Student / Neighbor / Ex-Partner / Other)
- **Other field** — if "Other" is selected, user can enter custom relation type (e.g., CEO, HR, Stranger, Roommate, etc.)
- Custom tags — e.g. close friend, work boundary, emotionally unavailable, safe person
- Date of Birth, Time of Birth, Place of Birth (for numerology + astrology)
- Relationship start date
- Archive toggle — hide without deleting

---

### 3.2 — Pros & Cons (Trait Logging)
- **Pros** — qualities you genuinely love and appreciate about this person
- **Cons** — behaviours and traits that drain, bother, or confuse you
- Each trait gets an **intensity rating** — Mild / Moderate / Strong
- **Emotion tag** per trait — how it makes you feel (anxious, safe, drained, joyful, confused...)

---

### 3.3 — Incidents Log
- Log specific real events with date, description, and emotional impact
- Examples: they cancelled plans last minute / they checked in when I was sick / they took credit for my work
- AI tracks frequency and flags recurring patterns automatically

---

### 3.4 — Patterns
- Manually log recurring behaviours you have noticed over time
- Examples: always makes it about themselves / goes quiet when angry / shows up only when they need something
- AI cross-references patterns with incidents to confirm or challenge your perception

---

### 3.5 — Interaction Log
- Log a conversation or meetup — date, context, mood before and mood after
- **One-tap emotion picker** — how did this interaction leave you feeling?
- AI spots correlations — every time you meet X in person you feel drained for 2 days after
- **Streak tracker** — how long since you last connected with this person

---

### 3.6 — Journal Per Member
- Free-text diary — write anything about this person, any interaction, any feeling
- Lumen reads journal entries as additional context for deeper analysis
- Date-stamped and searchable
- **Journal mode** — distraction-free full-screen writing view

---

### 3.7 — Numerological Data (Auto-Generated)
- All core numbers calculated from their DOB and name — same as your own profile
- Their current Personal Year and Personal Month — their live emotional climate
- Life Path + Soul Urge + Expression displayed in a clean readable breakdown

---

### 3.8 — Astrological Data (Auto-Generated · MVP)
- Full natal chart from their DOB, time, and place
- Sun, Moon, Rising, Venus, Mars, Mercury signs
- Current transits — what they are going through right now energetically

---

### 3.9 — AI Relationship Report (You ↔ Them)
- Generated by Lumen — uses YOUR full profile (numerology, astrology, self traits) and THEIR full profile
- **Compatibility Score** — numerology + astrology + observed trait harmony
- **Relationship Dynamic Type** — e.g. Push-Pull, Codependent, One-Sided Effort, Mutually Nourishing
- **Tension Points** — where you two fundamentally clash and why
- **Growth Points** — what this person brings out in you, even if uncomfortable
- **AI Relationship Forecast** — based on both Personal Year cycles, what is the likely energy between you this year
- **Timing Guidance** — is this a good time to have a difficult conversation with them?
- **Regeneratable** — report deepens as you log more data

---

## 04 — Lumen (AI Agent)

> Lumen is the intelligence core of Lumis. It is not a chatbot. It is a psychology-trained AI agent that has read everything you have ever logged, and speaks to you with the full context of your inner world and every person in it.

### 4.1 — Query Modes

**Mood-Triggered Analysis**
- I feel heavy after talking to mom — what is happening?
- I am feeling anxious and I spoke to my friend earlier — is there a connection?
- I do not know why I am sad right now — help me figure it out

**Person Deep-Dive**
- Why do I always feel invisible around Zara?
- Why do I feel drained after every call with my brother?
- Why do I get anxious before meeting this person even though I love them?

**Pattern & Conflict Analysis**
- We had an argument about X — break it down for me
- Is this person good for me overall?
- Why do I keep attracting people like this?
- Am I the problem in this dynamic or are they?

**Comparison & Insight**
- Compare how I feel around X vs Y
- Who in my life energises me the most right now?
- Which relationship needs the most attention?
- What is my most repeated relational pattern across everyone I have logged?

---

### 4.2 — Lumen Modes

| Mode | What It Does |
|---|---|
| **Vent Mode** | Lumen listens, does not analyse unless you ask. Safe space to express without getting advice |
| **Guided Mode** | Lumen asks you questions to help you go deeper into what you are feeling |
| **Analysis Mode** | Full context-aware breakdown using all available data (respects analysis depth setting) |
| **Advice Mode** | What to do, how to navigate, how to communicate with this specific person (respects analysis depth setting) |
| **Timing Mode** | Should I reach out today? Is now a good time given their numerology + transits? |

---

### 4.2.1 — Analysis Depth Settings

Users can control what data sources Lumen uses for analysis. This setting affects all Lumen conversations and AI reports.

| Depth Mode | Icon | What Lumen Uses | Best For |
|---|---|---|---|
| **Cosmic Mode** | 🌙 | Numerology + Astrology only | Users who want purely spiritual/cosmic insights |
| **Behavioral Mode** | 📊 | Logged traits, incidents, patterns, interactions only | Users who prefer evidence-based psychological analysis |
| **Full Spectrum Mode** | ✨ | Everything (numerology + astrology + logged data) | Most users - deepest, most comprehensive analysis (default) |

**Examples:**

*Cosmic Mode Response:*
"Based on your Life Path 6 and your mom's Life Path 1, there's natural tension between your nurturing nature and her independent leadership style. Your Venus in Cancer craves emotional depth, but her Mars in Aries prefers action."

*Behavioral Mode Response:*
"Looking at your logged interactions, 4 out of 5 recent conversations left you feeling drained. You've noted she 'makes everything about herself' (strong intensity) and 'dismisses my feelings' - both triggering your core need to 'feel heard.'"

*Full Spectrum Mode Response:*
"I see this from multiple angles. Cosmically, you're a Life Path 6 (nurturer) and she's a Life Path 1 (independent leader). Behaviorally, this manifests in your logged data: 4 out of 5 recent interactions left you drained. The cosmic blueprint explains WHY this dynamic exists. The behavioral data shows HOW it plays out."

---

### 4.3 — Lumen Memory & Context
- Maintains **conversation history** — remembers what you said about X last week
- Full access to all your logged data — never starts from zero
- **Weekly Digest** — Lumen sends a soft summary of your emotional week and relationship patterns
- **Voice Input** — speak how you feel instead of typing (MVP)

---

### 4.4 — Psychology Frameworks Lumen Is Trained On

- **Attachment Theory** — secure, anxious, avoidant, fearful-avoidant dynamics
- **Cognitive Distortion Patterns** — catastrophising, mind-reading, personalisation
- **Emotional Regulation Frameworks** — co-regulation, window of tolerance
- **Big Five Personality Traits** — inferred from logged behaviours
- **Jungian Shadow Work** — connecting logged patterns to deeper unconscious dynamics
- **Trauma-Informed Language** — never pathologises, always validates first
- **Non-Violent Communication (NVC)** — frames advice in needs-based language

---

## 05 — Insights Dashboard

> A living map of your emotional world. Not charts for the sake of charts — every visual has a question it is answering.

### 5.1 — Relationship Overview
- **Relationship Health Score** per member — auto-updated by Lumen based on all logged data
- **Energy Map** — who energises you vs who drains you, visualised clearly
- **Most Logged Person** — who lives in your head rent free
- **Net Emotional Balance** — are your relationships collectively draining or nourishing you right now?

### 5.2 — Pattern & Emotion Tracking
- **Emotional Weather** — how you have been feeling across all interactions this month
- **Emotion Frequency Chart** — how often you feel each emotion after interactions
- **Pattern Alerts** — you have logged 'cancelled plans' for X four times now. Lumen flags it.
- **Trigger Map** — which specific behaviours across which people affect you the most
- **Attachment Style Tracker** — is your style shifting over time as you grow?

### 5.3 — Numerology & Astrology Calendar
- Best days this month per person for connection, difficult conversations, or distance
- Your Personal Month theme — what energy you are working with right now
- Relationship forecast for the month — based on both your Personal Year cycles
- Current transits affecting your relationships — what the cosmos is activating

---

## 06 — Sharing (Optional Feature)

> Everything in Lumis is private by default. Sharing is always intentional — never automatic.

- **Share Link** — generate a private link to your profile or a member's relationship report
- Use case — share with a therapist, a trusted friend, or the person themselves
- You control exactly what is visible — only the AI report, only the strengths, or the full profile
- No social feed, no public profiles, no discovery — **sharing is always intentional and link-based only**

---

## 07 — Subtle Features That Make It Sticky

- **Birthday Reminders** — with the numerological significance of the age they are turning
- **Check-In Nudge** — you have not logged anything about X in 30 days
- **Daily Mood Check-In** — a 10-second how are you that feeds Lumen ongoing emotional context
- **Dark Mode + Journal Mode** — distraction-free writing with a minimal dark aesthetic
- **Pattern Alerts** — proactive notifications when Lumen spots a repeated dynamic
- **Everything is private** — no social layer, no feed, no followers, ever

---

## 08 — Full Feature Status Map

| Feature | Phase | Notes |
|---|---|---|
| User Profile + DOB / Time / Place | ✅ MVP | Foundation of all numerology and astrology calculations |
| Numerological Blueprint (self) | ✅ MVP | All core + timing numbers auto-calculated |
| Astrological Natal Chart (self) | ✅ MVP | Sun, Moon, Rising, Venus, Mars, Mercury + transits |
| Self Traits — Strengths / Shadows / Triggers / Needs / Patterns | ✅ MVP | User logs their own light and shadow traits |
| AI Self Report (Lumen) | ✅ MVP | Cross-references numerology + astrology + self traits |
| Attachment Style Inference | ✅ MVP | Lumen infers from all logged member data |
| Members — full profile + DOB | ✅ MVP | Friend, family, colleague, partner, acquaintance, boss, mentor, therapist, coach, teacher, student, neighbor, ex-partner, or custom "Other" |
| Member Pros & Cons + Intensity | ✅ MVP | Core trait logging with emotion tags |
| Incidents Log | ✅ MVP | Dated real events with emotional impact |
| Patterns Log | ✅ MVP | Recurring behavioural observations |
| Interaction Log + Mood Before / After | ✅ MVP | Tracks emotional patterns per interaction |
| Journal Per Member | ✅ MVP | Free-text diary, read by Lumen as context |
| Member Numerological Data | ✅ MVP | Auto-calculated from their DOB and name |
| Member Astrological Data | ✅ MVP | Full natal chart + current transits |
| AI Relationship Report (you ↔ them) | ✅ MVP | Compatibility, dynamic type, forecast, timing |
| Lumen — Mood / Pattern / Advice Queries | ✅ MVP | Core AI agent — psychology-trained with 3 analysis depth modes |
| Vent Mode | ✅ MVP | Listen-only mode, no unsolicited analysis |
| Guided Mode | ✅ MVP | Lumen asks questions to deepen your reflection |
| Voice Input | ✅ MVP | Speak instead of type |
| Insights Dashboard | ✅ MVP | Energy map, emotional weather, health scores |
| Pattern Alerts (proactive) | ✅ MVP | Lumen flags recurring dynamics automatically |
| Numerology + Astrology Calendar | ✅ MVP | Best days per person for connection or space |
| Optional Sharing — link-based | ✅ MVP | Share with therapist or the person themselves |
| Birthday Reminders | ✅ MVP | With numerological age significance |
| Daily Mood Check-In | ✅ MVP | Feeds ongoing emotional context to Lumen |
| Weekly Digest (Lumen) | ✅ MVP | Soft summary of your emotional week |
| Lumen Conversation Memory | ✅ MVP | Remembers what you said about X last week |
| Analysis Depth Modes (Cosmic/Behavioral/Full Spectrum) | ✅ MVP | User controls what data sources Lumen uses |
| Dream Log (Jungian layer) | 🔵 Phase 2 | Link dreams to specific people |
| Export Relationship Report as PDF | 🔵 Phase 2 | Beautiful shareable report for therapist |
| Tarot Layer (optional spiritual tier) | 🔵 Phase 2 | Card of the day for your relationships |

---

## 09 — What Makes Lumis Unique

**No other app combines all five layers**
Observed traits + incidents + numerology + astrology + AI psychology in a single coherent system. Each layer is powerful alone. Together they are unlike anything that exists.

**Both sides of every relationship**
Lumen has your full blueprint AND the other person's. This means insights are specific to the actual dynamic between you — not generic relationship advice.

**It starts with you**
Before you analyse anyone else, you log your own shadows, triggers, and needs. This makes every insight honest and self-aware rather than just blame-focused.

**Completely private**
No social layer, no sharing unless you choose it, no feed, no discovery. This is your private inner world — not a platform.

**Gets smarter over time**
Every trait, incident, journal entry, and interaction you log makes Lumen's analysis deeper and more accurate. The more honest you are, the more useful it becomes.

---

<br>

---

*✦ LUMIS — See the people in your life, in full light*
*Features Document v1.0 — Locked & Ready to Build*
