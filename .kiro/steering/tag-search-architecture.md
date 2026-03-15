# Tag Search Architecture

## Overview

Lumis uses a **unified tag taxonomy** across all content entities so the user can search any keyword (e.g. `mood:happy`) and get results filtered across traits, incidents, patterns, interactions, and journal entries in their respective tabs.

---

## Tag Format

All tags are stored as `TEXT[]` arrays in PostgreSQL and follow a strict **`prefix:value`** format:

```
<prefix>:<value>
```

| Prefix     | Meaning                              | Examples                                              |
|------------|--------------------------------------|-------------------------------------------------------|
| `mood:`    | Emotional tone / feeling             | `mood:joyful`, `mood:anxious`, `mood:drained`        |
| `emotion:` | Specific emotion label               | `emotion:frustrated`, `emotion:loved`, `emotion:safe` |
| `theme:`   | Relationship / situational theme     | `theme:trust`, `theme:humor`, `theme:support`        |
| `context:` | Real-world context                   | `context:work`, `context:family`, `context:social`   |
| `pattern:` | Behavioral pattern marker            | `pattern:avoidance`, `pattern:oversharing`           |
| `trigger:` | Specific trigger category            | `trigger:criticism`, `trigger:abandonment`           |

**Rules:**
- Always lowercase, no spaces: `mood:joyful` ✓, `mood:Joyful` ✗, `mood:very joyful` ✗
- Prefix must be one of the standard prefixes above
- The `emotionTag` field on traits is automatically saved as `mood:<emotionTag>` in the tags array
- Frontend must deduplicate before display (strip `mood:` tags from the raw tag list when `emotionTag` already shows the emotion)

---

## Database Schema

Every entity that participates in tag search must have:

```sql
tags        TEXT[]    NOT NULL DEFAULT '{}',
deleted_at  TIMESTAMPTZ,

-- GIN index for fast containment queries
CREATE INDEX idx_<table>_tags ON public.<table> USING GIN (tags);
```

**Tables requiring tag columns** (add via migration if not present):
- `traits` ✅ (migration: `add-traits-tags-column.sql`)
- `logs` (incidents, interactions, journal entries) — add tags column
- `patterns` — add tags column

---

## API — Tag Filtering Convention

**Per-entity filtering** (AND logic — must contain ALL supplied tags):
```
GET /api/v1/traits?tags[]=mood:happy&tags[]=theme:trust
GET /api/v1/logs?tags[]=context:work
```

**Cross-entity tag search** (returns traits matching tags, grouped by entity type):
```
GET /api/v1/traits/search?tags[]=mood:happy
```

Future: a top-level `/api/v1/search?tags[]=mood:happy` endpoint will fan out to all entity tables and return results grouped by type.

---

## PostgreSQL Query Pattern

Uses the `@>` (contains) operator for array containment:

```sql
-- Returns rows where tags array contains ALL of the supplied tags
SELECT * FROM traits
WHERE user_id = $1
  AND deleted_at IS NULL
  AND tags @> ARRAY['mood:happy', 'theme:trust'];
```

In Supabase JS client (RTK Query or NestJS service):
```ts
supabase
  .from('traits')
  .select('*')
  .contains('tags', ['mood:happy', 'theme:trust'])
```

---

## Frontend — RTK Query

Tag search hooks are in `frontend/src/store/api/traitsApi.ts`:

```ts
// Filter traits for a member that match specific tags
const { data } = useGetTraitsQuery({ memberId, tags: ['mood:joyful', 'theme:humor'] });

// Cross-entity tag search (traits only for now, expand later)
const { data } = useSearchByTagsQuery({ tags: ['mood:happy'] });
```

---

## UI — Tag Display Rules

1. Show tag pills on every row/card that has tags
2. Strip `mood:` prefix tags from the raw pill list when `emotionTag` already displays the emotion
3. Tag pills: `font-mono uppercase tracking-widest`, `fontSize: 9`, rounded-full, muted border + tertiary text
4. Selected/active tags in search: filled with `var(--accent-primary)`
5. Tag input: comma-separated, plain text input field with helper hint showing the prefix format

---

## Future — Cross-Entity Search Flow

When the global search feature is built:

1. User types or selects a tag (e.g. `mood:happy`)
2. Frontend calls `/api/v1/search?tags[]=mood:happy`
3. Backend fans out to `traits`, `logs` (incidents/interactions/journal), `patterns` tables — all with `tags @> '{mood:happy}'`
4. Results returned as `{ traits: [...], incidents: [...], interactions: [...], journal: [...], patterns: [...] }`
5. Frontend routes each result group to the correct tab in the member view or shows in a unified timeline
