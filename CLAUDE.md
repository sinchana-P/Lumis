# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Lumis** is a private, AI-powered personal intelligence platform for understanding relationships. It combines five data layers — observed behavioral traits, incidents, patterns, numerology, and astrology — fed into an AI agent called **Lumen** that is trained on psychology frameworks (attachment theory, cognitive distortions, NVC, Jungian shadow work).

Everything is completely private: no social feed, no public profiles, no discovery. Sharing is always intentional and link-based only.

---

## Commands

### Root (runs both frontend + backend concurrently)
```bash
npm run dev           # Start frontend (port 3000) + backend (port 3001)
npm run build         # Build both
npm run test          # Test both
npm run lint          # Lint both
npm run type-check    # TypeScript check both
```

### Frontend (cd frontend)
```bash
npm run dev           # Next.js dev server → http://localhost:3000
npm run build
npm run test          # Jest
npm run test -- --testPathPattern=Button   # Run single test file
npm run type-check
```

### Backend (cd backend)
```bash
npm run start:dev     # NestJS watch mode → http://localhost:3001
npm run build
npm run test          # Jest
npm run test -- --testPathPattern=auth    # Run single test file
npm run lint
```

### API Docs
```
http://localhost:3001/api/docs   # Swagger UI (dev only)
```

---

## Architecture

### Monorepo Structure
```
Lumis/
├── frontend/          # Next.js 14 App Router
├── backend/           # NestJS REST API
├── .kiro/
│   ├── steering/      # Authoritative architecture & standards docs
│   └── specs/         # Feature specifications
└── stitch_flows/      # UI design references (HTML mockups + screenshots)
```

### Frontend — Next.js 14 App Router
- **Port**: 3000
- **State**: Redux Toolkit + RTK Query for ALL API calls (no raw fetch)
- **Auth**: Supabase Auth via `@supabase/auth-helpers-nextjs`; middleware in `src/middleware.ts` handles redirects
- **Themes**: 23 themes via React Context (`ThemeContext`) + CSS custom properties + localStorage; 250ms transitions
- **Routing groups**: `(auth)/` for login/signup (separate layout); `dashboard/`, `members/`, `numerology/`, `profile/`
- **Path aliases**: `@/*` maps to `src/*`

Key Redux slices: `auth`, `user`, `members`, `lumen`, `insights`, `ui`

### Backend — NestJS
- **Port**: 3001
- **API prefix**: `/api/v1`
- **Database**: PostgreSQL via Supabase (`SupabaseService` in `common/services/`)
- **Auth**: JWT (15min access token, 7-day refresh via httpOnly cookie); `AuthGuard` in `common/guards/`
- **Modules**: `AuthModule`, `MembersModule` (more to be added per features)
- **Validation**: Global `ValidationPipe` with `whitelist: true, transform: true` — always use DTO classes with `class-validator`

### Database — PostgreSQL + Supabase
- **Row-Level Security on ALL tables** — never bypass RLS
- **Soft deletes everywhere** — `deleted_at` timestamp, never hard delete
- **UUID primary keys** everywhere
- **Polymorphic tables**: `traits`, `numerology_data`, `astrology_data` serve both users and members
- **Vector search**: `pgvector` extension for semantic search on journal entries (Cohere embeddings)
- Key tables: `users`, `members`, `traits`, `logs`, `patterns`, `numerology_data`, `astrology_data`, `ai_reports`, `lumen_conversations`, `lumen_messages`, `mood_check_ins`, `weekly_digests`, `share_links`

### AI Architecture — Two Model Strategy (Free Tier Only)
| Model | Role | Rate Limit | Use When |
|---|---|---|---|
| **Gemini 1.5 Flash** | Primary — deep analysis | 15 req/min, 8192 max output | Reports, Analysis mode, Advice mode, Timing mode |
| **Groq + Llama 3.1 70B** | Speed layer | 30 req/min, 2048 max output | Vent mode, Guided mode, real-time chat |
| **Cohere embed-english-v3.0** | Embeddings | 100 req/min | Journal semantic search, trait similarity |

- All AI goes through a single `LumenService`
- Fallback: try primary → fallback to alternative on rate limit
- Context: send full context to Gemini (1M token window); send selective/light context to Groq (128k limit)

### Lumen — AI Agent Modes
| Mode | Model | Behavior |
|---|---|---|
| **Vent** | Groq | Listen only, validate, no analysis unless asked |
| **Guided** | Groq | Ask questions to deepen reflection |
| **Analysis** | Gemini | Full context-aware breakdown |
| **Advice** | Gemini | Actionable NVC-based guidance |
| **Timing** | Gemini | Numerology/astrology-based timing suggestions |

### Analysis Depth Modes (user-controlled, affects all Lumen + AI reports)
- **Cosmic** 🌙 — Numerology + Astrology only
- **Behavioral** 📊 — Logged traits, incidents, patterns, interactions only
- **Full Spectrum** ✨ — Everything (default)

---

## API Conventions

All endpoints under `/api/v1/`. Standard response shape:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "ISO8601",
    "requestId": "uuid",
    "pagination": { "page": 1, "pageSize": 20, "totalPages": 5 }
  }
}
```

Errors use: `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`

Error codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMIT_EXCEEDED`, `AI_SERVICE_ERROR`, `CALCULATION_ERROR`

Rate limits: Standard 100/min · AI endpoints 10/min · Auth 5/min

Filtering: `?filter[type]=friend&filter[archived]=false` · Pagination: `?page=1&limit=20`

---

## Component Architecture

**Mandatory reusable components** — always use these, never re-implement:
- `<DataTable>` — all tabular data
- `<FormField>` — all form inputs (wraps Input/Textarea with label + error)
- `<ProfileCard>` — user/member profile display
- `<TraitLogger>` — logging strengths, shadows, pros, cons, triggers, needs
- `<AIReport>` — displaying all AI-generated content
- `<TimelineLog>` — incidents, interactions, journal entries
- `<EmotionPicker>` — one-tap emotion selection
- `<Modal>` — all modal dialogs

UI components live in `frontend/src/components/ui/`. Specialized in `frontend/src/components/specialized/`.

---

## Design System

**Psychological UX principles**: breathing space (one primary action per screen), low stimulation (muted warm colors), weight (heavy typography), "being held" (rounded containers, warm backgrounds).

**Typography**:
- Serif (Crimson Pro) → body text, journal entries, AI responses
- Sans (Inter) → UI labels, buttons, navigation
- Mono (JetBrains Mono) → dates, numbers, codes

**Spacing**: 4px base unit. **Border radius**: 6/12/16/24px (sm/md/lg/xl).

**Theme system**: 23 themes across Classic, Gendered, Mood-Based, Aesthetic, Seasonal, Cultural, Personality categories. CSS custom properties, React Context, localStorage + DB persistence.

---

## Testing Standards

Coverage minimums: Services 80% · API endpoints 100% (critical paths) · Components 70% · Utilities 90%

- Unit/integration: Jest + React Testing Library
- API integration: Supertest (hit real database, not mocks)
- E2E: Playwright (`*.e2e.ts`)
- Test files: colocated as `*.test.ts` / `*.spec.ts`

---

## Domain Concepts

**Members**: People in the user's life. Relation types: Friend, Family, Colleague, Partner, Acquaintance, Boss, Mentor, Therapist, Coach, Teacher, Student, Neighbor, Ex-Partner, Other (custom).

**Traits**: Polymorphic — applies to both users (Strengths/Shadows/Triggers/Needs/Patterns) and members (Pros/Cons). Each trait has intensity (Mild/Moderate/Strong) and an emotion tag.

**Logs**: Polymorphic — Incidents (dated events with emotional impact), Interactions (meetup/call with mood before/after), Journal (free-text, read by Lumen).

**Numerology numbers**: Life Path, Expression, Soul Urge, Personality, Birthday, Maturity (core) + Personal Year, Personal Month, Personal Day, Life Cycles (timing — live/calculated).

**Astrology**: Sun, Moon, Rising, Venus, Mars, Mercury signs + Current Transits. Calculated from DOB + time + place using `astronomia`/`swisseph`.

**AI Reports**: Two types — Self Report (user's own numerology + astrology + self-traits) and Relationship Report (user ↔ member, includes compatibility score, dynamic type, tension/growth points, forecast, timing guidance).

**Lumen conversation memory**: Persistent per user — Lumen always has full context of all prior conversations and all logged data. Never starts from zero.

---

## Security

- JWT tokens: 15min access, 7-day refresh (httpOnly cookie)
- RLS on all tables — `user_id` always scoped
- All inputs validated via backend DTOs (`class-validator`)
- Rate limiting active on all routes
- No PII in logs
- CORS configured to frontend URL only
- Request size limits: 10MB JSON, 5MB files

---

## Deployment Targets

- Frontend → Vercel
- Backend → Railway
- Database → Supabase (PostgreSQL + pgvector + Auth + Storage)

---

## Key Reference Files

- `.kiro/steering/` — Authoritative standards for architecture, API, DB schema, AI, design, themes, security, testing, components
- `Lumis-Features-v1.0.md` — Full product feature spec and domain knowledge
- `stitch_flows/stitch_onboarding/` — HTML/PNG UI mockups for every screen
- `database-setup.sql` / `supabase-schema.sql` — Full DB schema
- `.kiro/specs/lumis-core-features/` and `.kiro/specs/authentication-flows/` — Feature implementation specs with tasks
