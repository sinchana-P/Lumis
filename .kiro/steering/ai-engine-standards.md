# AI Engine Standards

## Architecture

### Module Hierarchy (dependency order)
```
AiModule (global)
  └─ NumerologyModule
  └─ AstrologyModule
  └─ LumenModule
       ├─ NumerologyModule (imported)
       ├─ VectorMemoryService
       └─ ContextBuilderService
```

### File Responsibility — One File, One Job
| File | Responsibility |
|---|---|
| `*-engine.service.ts` | Pure math / deterministic computation. No AI calls. |
| `*-interpreter.service.ts` | AI text generation using precomputed data. Gemini only. |
| `*.service.ts` | Orchestration, DB persistence, business logic. |
| `*.controller.ts` | HTTP endpoints, request/response shaping. |
| `context-builder.service.ts` | Builds Lumen system prompt context from member data. |
| `vector-memory.service.ts` | Cohere embeddings + pgvector CRUD and search. |
| `lumen.service.ts` | 7-layer orchestrator for all Lumen conversations and reports. |
| `lumen-types.ts` | All shared TypeScript types for the AI engine. |

## Model Strategy

| Model | Use When | Configured Key |
|---|---|---|
| Gemini 1.5 Flash | ANALYSIS, ADVICE, TIMING modes, reports, interpreter sections | `ai.gemini.apiKey` |
| Groq Llama 3.1 70B | VENT, GUIDED modes (low latency required) | `ai.groq.apiKey` |
| Cohere embed-english-v3.0 | All vector embeddings (1024 dims) | `ai.cohere.apiKey` |

**Never use `process.env` directly.** Always use `this.configService.get('ai.*.apiKey')`.

## Lumen Modes
- **VENT** — hold space only, no analysis, Groq
- **GUIDED** — one question at a time, Groq
- **ANALYSIS** — full multi-layer synthesis, Gemini
- **ADVICE** — NVC-framed actionable guidance, Gemini
- **TIMING** — numerology + dasha timing guidance, Gemini

## Analysis Depth
- **FULL_SPECTRUM** — numerology + astrology + behavioral data (default)
- **COSMIC** — numerology + astrology only
- **BEHAVIORAL** — logged traits/incidents/interactions only

## Numerology
- **Pythagorean system** always
- **Master numbers preserved**: 11, 22, 33 — never reduce further
- **Core**: Life Path, Expression, Soul Urge, Personality, Birthday, Maturity
- **Timing**: Personal Year, Personal Month, Personal Day, Life Cycle, Pinnacles, Challenges
- AI generates ONLY `theirNumberInYourLife` and compatibility texts — all other descriptions are from the pre-written library in `numerology-interpreter.service.ts`

## Astrology
- **Vedic / Jyotish** — sidereal zodiac with Lahiri ayanamsa
- **Whole Sign house system**
- **swisseph** library for all planetary calculations
- Nakshatras (27) drive emotional signal derivation
- **Vimshottari Dasha** (120-year cycle) for timing analysis

## Vector Memory
- **Table**: `vector_memory` with `VECTOR(1024)` column
- **Stored**: incidents, interactions, journal entries, traits
- **Searched**: via `search_member_memory()` RPC (pgvector cosine similarity)
- **Cross-member**: `search_all_traits_for_user()` for pattern comparison
- Embedding stored on write; searched semantically on Lumen context build

## Signal Processing (AstroNumerologySignals)
Derived signals injected into every Lumen prompt:
- `emotionalStyle` — fast/slow processor from moon sign
- `conflictMode` — withdraws/confronts from moon + mars house
- `currentCycleTheme` — personal year + dasha combined
- `availabilitySignal` — open/contracted/transitional from current dasha
- `coreWound` / `coreGift` — from life path number

## DB Conventions
- All AI profile tables use `UNIQUE (member_id)` — upsert on conflict
- RLS on all tables — `user_id` always scoped
- Soft deletes via `deleted_at` on behavioral tables (traits, incidents, etc.)
- Triggers auto-update `updated_at` timestamps

## API Endpoints
```
POST /api/v1/numerology/calculate       → Calculate + persist numerology
GET  /api/v1/numerology/me              → User's numerology profile
GET  /api/v1/numerology/member/:id      → Member's numerology profile

POST /api/v1/astrology/calculate        → Calculate + persist Vedic astrology
GET  /api/v1/astrology/me               → User's astrology profile
GET  /api/v1/astrology/member/:id       → Member's astrology profile
GET  /api/v1/astrology/geocode?place=   → Geocode place → lat/lon/utcOffset

POST /api/v1/lumen/ask                  → Chat (non-streaming)
POST /api/v1/lumen/ask/stream           → Chat (SSE streaming)
GET  /api/v1/lumen/self-report          → Personal intelligence report
POST /api/v1/lumen/relationship-report/:memberId → Relationship report
GET  /api/v1/lumen/weekly-digest        → Weekly digest
```
