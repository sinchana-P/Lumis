# Lumis E2E Implementation Guide

## 🎯 Project Status

**Setup Complete:**
- ✅ Root package.json with workspaces
- ✅ Frontend package.json (Next.js 14)
- ✅ Backend package.json (NestJS)
- ✅ Tailwind config with Lumis design system
- ✅ TypeScript configurations
- ✅ All documentation and steering files

**Next Steps:** Follow this guide to complete the implementation.

---

## 📦 Installation

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

---

## 🏗️ Project Structure

```
lumis/
├── frontend/                    # Next.js 14 App Router
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/        # Auth group
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── (dashboard)/   # Protected routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── members/
│   │   │   │   ├── profile/
│   │   │   │   ├── lumen/
│   │   │   │   └── insights/
│   │   │   ├── onboarding/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── shared/        # Reusable components
│   │   │   ├── features/      # Feature-specific
│   │   │   └── layouts/       # Page layouts
│   │   ├── lib/
│   │   │   ├── api/           # RTK Query slices
│   │   │   ├── utils/         # Utilities
│   │   │   └── supabase.ts    # Supabase client
│   │   ├── store/             # Redux store
│   │   ├── hooks/             # Custom hooks
│   │   └── types/             # TypeScript types
│   ├── public/
│   └── package.json
│
├── backend/                     # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── members/
│   │   │   ├── traits/
│   │   │   ├── logs/
│   │   │   ├── lumen/
│   │   │   ├── numerology/
│   │   │   ├── astrology/
│   │   │   └── insights/
│   │   ├── common/            # Shared utilities
│   │   └── main.ts
│   └── package.json
│
├── .kiro/                       # Kiro configuration
│   ├── specs/                  # Project specs
│   ├── steering/               # Development guidelines
│   ├── hooks/                  # Automated checks
│   └── settings/               # MCP config
│
├── stitch_flows/               # Design references
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Phase 1: Backend Setup (Week 1-2)

### Step 1: NestJS Project Structure

```bash
cd backend
nest new . --skip-git
```

### Step 2: Database Setup

1. Create Supabase project
2. Run migrations from `.kiro/steering/database-schema.md`
3. Set up RLS policies
4. Configure environment variables

### Step 3: Core Modules

**Priority Order:**
1. Auth module (Supabase integration)
2. Users module (profile, numerology, astrology)
3. Members module (CRUD, relations)
4. Traits module (polymorphic)
5. Logs module (incidents, interactions, journal)
6. Numerology service
7. Astrology service
8. Lumen service (Gemini + Groq)
9. Insights service

### Step 4: API Endpoints

Follow `.kiro/steering/api-conventions.md` for all endpoints.

---

## 🎨 Phase 2: Frontend Setup (Week 3-4)

### Step 1: Next.js App Router Structure

```bash
cd frontend
mkdir -p src/app/(auth)/{login,signup}
mkdir -p src/app/(dashboard)/{dashboard,members,profile,lumen,insights}
mkdir -p src/app/onboarding
mkdir -p src/components/{shared,features,layouts}
mkdir -p src/lib/{api,utils}
mkdir -p src/store
mkdir -p src/hooks
mkdir -p src/types
```

### Step 2: Shared Components

**Build in this order (from `.kiro/steering/component-library.md`):**

1. Button
2. Input / FormField
3. Modal / Dialog
4. Card
5. DataTable
6. ProfileCard
7. TraitLogger
8. TimelineLog
9. EmotionPicker
10. NumerologyCard
11. AstrologyChart
12. AIReport
13. LumenChat
14. AnalysisDepthSelector
15. ThemeSelector

### Step 3: Redux Store Setup

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { userApi } from '@/lib/api/userApi';
import { membersApi } from '@/lib/api/membersApi';
import { lumenApi } from '@/lib/api/lumenApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [userApi.reducerPath]: userApi.reducer,
    [membersApi.reducerPath]: membersApi.reducer,
    [lumenApi.reducerPath]: lumenApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      membersApi.middleware,
      lumenApi.middleware
    ),
});
```

### Step 4: RTK Query API Slices

Create API slices for:
- User (profile, traits, reports)
- Members (CRUD, traits, logs, reports)
- Lumen (queries, conversations)
- Insights (dashboard data)

---

## 🎯 Phase 3: Core Features (Week 5-8)

### Week 5: Authentication & Onboarding

**Files to create:**
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/components/features/onboarding/StepIndicator.tsx`
- `src/components/features/onboarding/ProfileForm.tsx`
- `src/components/features/onboarding/BirthDataForm.tsx`

**Reference:** `stitch_flows/stitch_onboarding/onboarding/`

### Week 6: Dashboard & Profile

**Files to create:**
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/profile/page.tsx`
- `src/components/features/dashboard/EnergyMap.tsx`
- `src/components/features/dashboard/EmotionalWeather.tsx`
- `src/components/features/profile/NumerologySection.tsx`
- `src/components/features/profile/AstrologySection.tsx`
- `src/components/features/profile/TraitsSection.tsx`

**Reference:** `stitch_flows/stitch_onboarding/main_dashboard_1/`

### Week 7: Members Management

**Files to create:**
- `src/app/(dashboard)/members/page.tsx`
- `src/app/(dashboard)/members/[id]/page.tsx`
- `src/components/features/members/MembersList.tsx`
- `src/components/features/members/MemberCard.tsx`
- `src/components/features/members/AddMemberModal.tsx`
- `src/components/features/members/MemberProfile.tsx`
- `src/components/features/members/ProsConsSection.tsx`
- `src/components/features/members/IncidentsLog.tsx`
- `src/components/features/members/InteractionsLog.tsx`
- `src/components/features/members/JournalSection.tsx`

**Reference:** 
- `stitch_flows/stitch_onboarding/members_list_constellation_view_1/`
- `stitch_flows/stitch_onboarding/member_profile_deep_dive_zara/`
- `stitch_flows/stitch_onboarding/add_new_member_1/`

### Week 8: Lumen AI Agent

**Files to create:**
- `src/app/(dashboard)/lumen/page.tsx`
- `src/components/features/lumen/ChatInterface.tsx`
- `src/components/features/lumen/ModeSelector.tsx`
- `src/components/features/lumen/DepthSelector.tsx`
- `src/components/features/lumen/MessageBubble.tsx`
- `src/components/features/lumen/VoiceInput.tsx`

**Reference:** `stitch_flows/stitch_onboarding/lumen_advice_*`

---

## 🎨 Phase 4: Advanced Features (Week 9-10)

### Week 9: AI Reports

**Files to create:**
- `src/components/features/reports/SelfReport.tsx`
- `src/components/features/reports/RelationshipReport.tsx`
- `src/components/features/reports/CompatibilityScore.tsx`
- `src/components/features/reports/DynamicType.tsx`
- `src/components/features/reports/TensionPoints.tsx`
- `src/components/features/reports/GrowthPoints.tsx`

**Reference:** `stitch_flows/stitch_onboarding/ai_relationship_report_zara_1/`

### Week 10: Insights Dashboard

**Files to create:**
- `src/app/(dashboard)/insights/page.tsx`
- `src/components/features/insights/RelationshipHealthScores.tsx`
- `src/components/features/insights/PatternAlerts.tsx`
- `src/components/features/insights/TriggerMap.tsx`
- `src/components/features/insights/Calendar.tsx`

---

## 🎨 Phase 5: Theme System (Week 11)

### Implementation

**Files to create:**
- `src/lib/theme/ThemeProvider.tsx`
- `src/lib/theme/themes.ts` (all 23 themes)
- `src/components/features/settings/ThemeSelector.tsx`
- `src/hooks/useTheme.ts`

**Reference:** `.kiro/steering/theme-system.md`

### Theme Switching Logic

```typescript
// src/lib/theme/ThemeProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ThemeName = 'warm-light' | 'deep-dark' | /* ... all 23 themes */;

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('warm-light');

  useEffect(() => {
    const saved = localStorage.getItem('lumis-theme') as ThemeName;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lumis-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

---

## 🧪 Phase 6: Testing (Week 12)

### Unit Tests

```bash
# Frontend
cd frontend
npm run test

# Backend
cd backend
npm run test
```

### E2E Tests

Use Playwright for critical flows:
1. User signup and onboarding
2. Add member and log first trait
3. Generate AI report
4. Lumen conversation
5. Theme switching

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Backend (Railway)

```bash
cd backend
railway up
```

### Environment Variables

Set all variables from `.env.example` in:
- Vercel dashboard (frontend)
- Railway dashboard (backend)

---

## 📚 Key References

### Design System
- `.kiro/steering/design-system.md` - Complete design tokens
- `.kiro/steering/theme-system.md` - All 23 themes
- `.kiro/steering/visual-examples.md` - UI patterns
- `stitch_flows/` - Screen designs

### Architecture
- `.kiro/steering/architecture-principles.md` - Code standards
- `.kiro/steering/api-conventions.md` - API design
- `.kiro/steering/database-schema.md` - Database structure
- `.kiro/steering/ai-model-architecture.md` - AI implementation

### Features
- `.kiro/specs/lumis-mvp.md` - Complete requirements
- `Lumis-Features-v1.0.md` - Feature specifications

---

## 🎯 Development Workflow

### Daily Workflow

1. Pull latest changes
2. Run `npm run dev` (starts both frontend and backend)
3. Make changes following steering docs
4. Run `npm run lint` and `npm run type-check`
5. Test changes
6. Commit with descriptive message

### Code Quality Checks

Hooks will automatically run:
- Type checking on save
- Linting on save
- API convention validation
- Component reusability checks

### Before Committing

```bash
npm run lint
npm run type-check
npm run test
```

---

## 🆘 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Frontend (3000)
lsof -ti:3000 | xargs kill -9

# Backend (3001)
lsof -ti:3001 | xargs kill -9
```

**Database connection:**
- Check Supabase URL and keys
- Verify RLS policies are set up
- Check network connectivity

**AI API errors:**
- Verify API keys are set
- Check rate limits
- Review error logs

---

## 📖 Next Steps

1. **Install dependencies** (see Installation section)
2. **Set up Supabase** (create project, run migrations)
3. **Configure environment variables** (copy from .env.example)
4. **Start backend** (`cd backend && npm run start:dev`)
5. **Start frontend** (`cd frontend && npm run dev`)
6. **Begin Phase 1** (Backend Setup)

---

## 💡 Tips

- Follow the phase order - don't skip ahead
- Reference stitch_flows designs for UI implementation
- Use steering docs for all architectural decisions
- Reuse components - never duplicate code
- Test as you build - don't wait until the end
- Commit frequently with clear messages

---

**Ready to build Lumis!** 🌟

Start with Phase 1, Week 1, and work through systematically. All documentation is in place to guide you.
