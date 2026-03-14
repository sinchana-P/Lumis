---
inclusion: auto
---

# Lumis Architecture Principles

## Code Reusability Standards

### Component Design Philosophy
- **Single Responsibility**: Each component does ONE thing exceptionally well
- **Composition over Inheritance**: Build complex UIs from simple, reusable pieces
- **Props-driven Flexibility**: Same component, different data, different contexts

### Mandatory Reusable Patterns

#### 1. Data Tables & Lists
- Use `<DataTable>` component for ALL tabular data (Members, Traits, Incidents, Patterns, Interactions)
- Props: `columns`, `data`, `onRowClick`, `filters`, `sorting`, `pagination`
- Never duplicate table logic

#### 2. Form Inputs
- Use `<FormField>` wrapper for ALL inputs
- Variants: text, textarea, date, time, select, multiselect, rating, emotion-picker
- Built-in validation, error states, labels

#### 3. Profile Cards
- Use `<ProfileCard>` for User Profile AND Member Profiles
- Props: `type` (self | member), `data`, `editable`, `showNumerology`, `showAstrology`
- Same component, different context

#### 4. Trait Logging
- Use `<TraitLogger>` for Self Traits AND Member Pros/Cons
- Props: `category` (strength | shadow | trigger | need | pattern | pro | con), `onSave`
- Unified trait management system

#### 5. AI Report Display
- Use `<AIReport>` for Self Report AND Relationship Reports
- Props: `reportType`, `data`, `regeneratable`, `onRegenerate`

#### 6. Timeline/Log Components
- Use `<TimelineLog>` for Incidents, Interactions, Journal entries
- Props: `entries`, `type`, `onAdd`, `onEdit`, `emotionTracking`

### State Management Rules
- Redux slices: `auth`, `user`, `members`, `lumen`, `insights`, `ui`
- RTK Query for ALL API calls - no manual fetch
- Normalized state shape - no nested duplicates
- Selectors for derived data - compute once, use everywhere

### API Design Standards
- RESTful endpoints: `/api/v1/users`, `/api/v1/members`, `/api/v1/lumen/query`
- Consistent response format: `{ success, data, error, meta }`
- Pagination: `?page=1&limit=20`
- Filtering: `?filter[type]=friend&filter[archived]=false`

### Database Schema Principles
- Polymorphic associations where applicable
- `traits` table serves both user AND members (polymorphic `owner_type`, `owner_id`)
- `logs` table serves incidents, interactions, journals (discriminator: `log_type`)
- Soft deletes everywhere - never hard delete user data
- Row-level security (RLS) on ALL tables

### Styling Consistency
- Tailwind utility classes only
- shadcn/ui components as base
- Custom theme tokens: `--lumis-primary`, `--lumis-accent`, `--lumis-surface`
- Dark mode first, light mode optional
- Consistent spacing scale: 4px base unit

### AI Integration Pattern
- Single `LumenService` class handles ALL AI interactions
- Two-model architecture: Gemini 1.5 Flash (deep analysis) + Groq Llama 3.1 70B (speed)
- Model selection based on use case (reports use Gemini, vent mode uses Groq)
- Context builder: assembles user + member + logs into prompt
- Streaming responses for real-time feel
- Conversation history stored in `lumen_conversations` table
- Mode switching: vent | guided | analysis | advice | timing
- Cohere embeddings for semantic search over journal entries

### Testing Requirements
- Unit tests for utilities and pure functions
- Integration tests for API endpoints
- Component tests with React Testing Library
- E2E tests for critical flows (onboarding, member creation, Lumen query)

## Never Repeat These Patterns
- ❌ Separate components for user traits vs member traits
- ❌ Duplicate table rendering logic
- ❌ Multiple date pickers with different implementations
- ❌ Hardcoded API endpoints in components
- ❌ Inline styles or CSS modules
- ❌ Direct database queries in controllers (use services)
- ❌ Unvalidated user input
- ❌ Non-responsive layouts

## File Structure
```
src/
├── components/
│   ├── shared/          # Reusable across entire app
│   ├── features/        # Feature-specific compositions
│   └── layouts/         # Page layouts
├── lib/
│   ├── api/            # RTK Query API slices
│   ├── utils/          # Pure utility functions
│   └── constants/      # Shared constants
├── store/              # Redux store configuration
├── hooks/              # Custom React hooks
└── types/              # TypeScript definitions
```

## Performance Standards
- Code splitting per route
- Lazy load heavy components (charts, AI chat)
- Debounce search inputs (300ms)
- Virtualize long lists (>50 items)
- Memoize expensive computations
- Optimize images (WebP, lazy loading)

## Security Standards
- All user data encrypted at rest
- JWT tokens with refresh mechanism
- Rate limiting on AI endpoints
- Input sanitization on ALL user content
- CORS properly configured
- Environment variables for ALL secrets
- No sensitive data in client-side code

## Accessibility Standards
- Semantic HTML everywhere
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Color contrast ratios (WCAG AA minimum)
- Screen reader tested critical flows
