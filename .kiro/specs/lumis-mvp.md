---
name: Lumis MVP
description: Personal Intelligence Platform - Build a private, AI-powered tool that helps users understand relationships through observed behavior, numerology, astrology, and psychology frameworks
version: 1.0.0
status: in-progress
---

# Lumis MVP - Personal Intelligence Platform

## Overview
Build a private, AI-powered personal intelligence tool that helps users understand relationships through observed behavior, numerology, astrology, and psychology frameworks.

## Tech Stack
- Frontend: Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Redux Toolkit + RTK Query
- Backend: NestJS, PostgreSQL (Supabase), pgvector
- AI Primary: Gemini 1.5 Flash (1M token context, deep analysis)
- AI Speed: Groq + Llama 3.1 70B (500+ tokens/sec, instant responses)
- Embeddings: Cohere (free tier, semantic search)
- Auth: Supabase Auth
- Storage: Supabase Storage
- Deployment: Vercel (frontend), Railway (backend)

## Requirements

### R1: Authentication & Onboarding
User can sign up with email or Google, complete profile with DOB/time/place of birth, and have numerology/astrology auto-calculated.

**Acceptance Criteria:**
- Email and Google OAuth sign-in working
- Profile form collects: full name, DOB, time of birth, place of birth (with geocoding)
- Numerology blueprint auto-calculated on profile save
- Astrology natal chart auto-calculated on profile save
- User redirected to dashboard after onboarding

### R2: User Profile (Self Layer)
User can view and edit their complete profile including basic info, numerology, astrology, and self traits.

**Acceptance Criteria:**
- Profile page displays: photo, name, DOB data, numerology core numbers, timing numbers, astrology natal chart
- User can log self traits: Strengths, Shadows, Triggers, Needs, Patterns
- Each trait has text description
- Traits can be edited and deleted
- Profile updates trigger numerology/astrology recalculation

### R3: AI Self Report
User can generate and view an AI-powered self-analysis report based on their numerology, astrology, and logged traits.

**Acceptance Criteria:**
- "Generate Report" button triggers Lumen analysis
- Report includes: attachment style inference, emotional trigger map, relationship patterns
- Report is regeneratable as user adds more traits
- Loading state during generation
- Report persisted to database

### R4: Members Management
User can add, view, edit, archive, and delete members (people in their life).

**Acceptance Criteria:**
- Members list page with search, filter (by type, archived status), and sort
- Add member form: name, photo, relation type (dropdown with predefined options + "Other"), tags, DOB/time/place
- If "Other" is selected, show text input for custom relation type (e.g., Boss, CEO, HR, Stranger, Roommate, Landlord, etc.)
- Custom relation type is required when "Other" is selected (max 100 characters)
- Member profile page with tabs: Overview, Pros & Cons, Incidents, Patterns, Interactions, Journal, AI Report
- Archive/unarchive functionality (soft delete)
- Member numerology and astrology auto-calculated
- Display custom relation type prominently on member profile if "Other" was used

### R5: Member Traits (Pros & Cons)
User can log positive and negative traits for each member with intensity ratings and emotion tags.

**Acceptance Criteria:**
- Pros section: add/edit/delete positive traits
- Cons section: add/edit/delete negative traits
- Each trait has: description, intensity (mild/moderate/strong), emotion tag
- Emotion picker with predefined emotions
- Traits displayed in organized list

### R6: Incidents Log
User can log specific dated events with emotional impact for each member.

**Acceptance Criteria:**
- Timeline view of incidents
- Add incident: date, description, emotional impact
- Edit and delete incidents
- Chronological sorting (newest first)
- Search incidents by keyword

### R7: Patterns Log
User can log recurring behavioral patterns observed in each member.

**Acceptance Criteria:**
- List view of patterns
- Add pattern: description, frequency notes
- Edit and delete patterns
- AI cross-references patterns with incidents (future enhancement marker)

### R8: Interactions Log
User can log meetups/conversations with mood tracking before and after.

**Acceptance Criteria:**
- Timeline view of interactions
- Add interaction: date, context, mood before, mood after
- Emotion picker for mood states
- Streak tracker: days since last interaction
- Mood correlation insights (visual indicator)

### R9: Journal Per Member
User can write free-text journal entries for each member.

**Acceptance Criteria:**
- Journal entries list (date-stamped)
- Add entry: date, free-text content
- Edit and delete entries
- Search journal entries
- Distraction-free writing mode
- Entries accessible to Lumen for context

### R10: AI Relationship Report
User can generate AI-powered relationship analysis for each member.

**Acceptance Criteria:**
- "Generate Report" button on member profile
- Report includes: compatibility score, relationship dynamic type, tension points, growth points, forecast, timing guidance
- Uses both user and member numerology/astrology/traits
- Regeneratable as data grows
- Loading state during generation

### R11: Lumen AI Agent
User can query Lumen with natural language questions about themselves, members, or relationships.

**Acceptance Criteria:**
- Chat interface with conversation history
- Mode selector: Vent, Guided, Analysis, Advice, Timing
- Analysis Depth selector: Cosmic, Behavioral, Full Spectrum (default)
- Cosmic mode: uses only numerology/astrology data
- Behavioral mode: uses only logged traits/incidents/patterns/interactions
- Full Spectrum mode: uses all available data
- Analysis depth setting persists across sessions
- Clear indicator showing which data sources are active
- Vent mode: listen-only, no unsolicited analysis
- Guided mode: Lumen asks clarifying questions
- Analysis mode: full context-aware breakdown (respects depth setting)
- Advice mode: actionable guidance (respects depth setting)
- Timing mode: numerology/astrology-based timing advice
- Voice input support
- Streaming responses
- Conversation persistence

### R12: Insights Dashboard
User can view aggregated insights across all relationships.

**Acceptance Criteria:**
- Relationship health scores per member
- Energy map: who energizes vs drains
- Emotional weather chart (past 30 days)
- Pattern alerts (proactive notifications)
- Trigger map across all members
- Most logged person indicator
- Net emotional balance score

### R13: Numerology & Astrology Calendar
User can view best days for connection or difficult conversations per member.

**Acceptance Criteria:**
- Monthly calendar view
- Personal Year/Month displayed
- Per-member timing guidance
- Current transits affecting relationships
- Color-coded day ratings (good/neutral/challenging)

### R14: Sharing (Optional)
User can generate private share links for profiles or reports.

**Acceptance Criteria:**
- Generate share link for: self profile, member profile, AI report
- Visibility controls: what sections are visible
- Link expiration options
- View-only access (no editing)
- Revoke link functionality

### R15: Daily Mood Check-In
User receives daily prompt to log current mood.

**Acceptance Criteria:**
- Daily notification/prompt
- Quick emotion picker (10 seconds)
- Mood logged with timestamp
- Feeds into Lumen's ongoing context
- Mood history viewable

### R16: Weekly Digest
User receives weekly AI-generated summary of emotional patterns and relationship insights.

**Acceptance Criteria:**
- Generated every Sunday evening
- Includes: emotional weather summary, relationship highlights, pattern alerts, suggested focus areas
- Delivered via in-app notification
- Viewable in digest history

### R17: Birthday Reminders
User receives reminders for member birthdays with numerological significance.

**Acceptance Criteria:**
- Notification 1 day before birthday
- Shows: member name, age turning, numerological significance of age
- Link to member profile
- Snooze/dismiss options

## Design Tasks

### D1: Design System Setup
Create Tailwind config with Lumis theme tokens, set up shadcn/ui components.

### D2: Component Library
Build all reusable components: DataTable, ProfileCard, TraitLogger, TimelineLog, AIReport, FormField, EmotionPicker, NumerologyCard, AstrologyChart, LumenChat, Modal, Button.

### D3: Page Layouts
Design and implement: Auth pages, Dashboard, User Profile, Members List, Member Profile, Lumen Chat, Insights Dashboard.

### D4: Responsive Design
Ensure all pages work on mobile, tablet, desktop.

### D5: Dark Mode
Implement dark mode throughout (default mode).

## Implementation Tasks

### I1: Project Setup
Initialize Next.js and NestJS projects, configure TypeScript, ESLint, Prettier.

### I2: Database Schema
Design and implement PostgreSQL schema with Supabase, set up RLS policies.

### I3: Authentication
Implement Supabase Auth with email and Google OAuth.

### I4: User Service
Build user CRUD, numerology calculation service, astrology calculation service.

### I5: Members Service
Build members CRUD, traits management, incidents/patterns/interactions/journal CRUD.

### I6: Lumen Service
Integrate Claude API, implement conversation management, mode switching, context building.

### I7: Insights Service
Build aggregation queries for dashboard, pattern detection algorithms.

### I8: Frontend State Management
Set up Redux store, create RTK Query API slices for all endpoints.

### I9: Frontend Routing
Implement Next.js App Router structure, protected routes.

### I10: Testing
Write unit tests for services, integration tests for APIs, component tests, E2E tests for critical flows.

### I11: Deployment
Deploy frontend to Vercel, backend to Railway, configure environment variables.

## Success Metrics
- User can complete onboarding in under 3 minutes
- User can add a member and log first trait in under 2 minutes
- Lumen response time under 5 seconds
- AI report generation under 10 seconds
- Zero data loss (soft deletes only)
- 100% private (no data leaks)

## Out of Scope (Phase 2)
- Dream log
- PDF export
- Tarot layer
- Mobile apps (web-first)
