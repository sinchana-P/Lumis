# ✦ LUMIS

> *The quiet light that helps you finally see a person clearly*

A private, AI-powered personal intelligence platform for understanding relationships through observed behavior, numerology, astrology, and psychology frameworks.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..

# 2. Start both servers
npm run dev
```

**Open:** http://localhost:3000

That's it! 🎉

---

## 📚 Documentation

| Document | Purpose |
|---|---|
| **START.md** | 3-step quick start guide |
| **QUICKSTART.md** | Complete setup with API keys |
| **IMPLEMENTATION_GUIDE.md** | 12-week development plan |
| **.kiro/specs/** | Feature specifications |
| **.kiro/steering/** | Architecture guidelines |
| **stitch_flows/** | UI design references |

---

## 🏗️ Project Structure

```
lumis/
├── frontend/          # Next.js 14 (port 3000)
├── backend/           # NestJS (port 3001)
├── .kiro/            # Documentation & guidelines
├── stitch_flows/     # Design references
└── package.json      # Root workspace
```

---

## 🎨 Tech Stack

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- Redux Toolkit + RTK Query
- TypeScript

### Backend
- NestJS
- PostgreSQL (Supabase)
- pgvector for semantic search
- TypeScript

### AI (All Free Tier!)
- **Gemini 1.5 Flash** - Deep analysis (1M token context)
- **Groq + Llama 3.1 70B** - Instant responses (500+ tokens/sec)
- **Cohere** - Embeddings for semantic search

---

## 🎯 Key Features

### MVP (Ready to Build)
- ✅ User profile with numerology & astrology
- ✅ Members management with full profiles
- ✅ Trait logging (pros/cons, incidents, patterns)
- ✅ AI relationship reports
- ✅ Lumen AI agent (5 modes, 3 analysis depths)
- ✅ Insights dashboard
- ✅ 23 theme system
- ✅ Journal with semantic search

### Phase 2
- Dream log (Jungian layer)
- PDF export
- Tarot layer

---

## 🎨 Design System

### Color Palette
- **Warm Light** (default) - Candlelit study aesthetic
- **23 total themes** - From Cosmic to Cultural to Personality-based
- **Psychological UX** - Breathing space, low stimulation, emotional warmth

### Typography
- **Serif** (Crimson Pro) - Body text, journal, AI responses
- **Sans** (Inter) - UI elements, labels, buttons
- **Mono** (JetBrains Mono) - Dates, numbers

---

## 🔧 Development

### Commands

```bash
# Development
npm run dev              # Start both servers
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Build
npm run build            # Build both
npm run build:frontend   # Frontend only
npm run build:backend    # Backend only

# Quality
npm run lint             # Lint all code
npm run type-check       # TypeScript check
npm run test             # Run all tests
```

### Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

---

## 📖 Getting Started

### For Quick Testing
1. Read **START.md** (3 steps)
2. Run `npm run dev`
3. Open http://localhost:3000

### For Full Development
1. Read **QUICKSTART.md** (environment setup)
2. Get API keys (all free tier)
3. Set up Supabase database
4. Follow **IMPLEMENTATION_GUIDE.md** (12-week plan)

---

## 🎯 Development Phases

### Phase 1: Backend Setup (Week 1-2)
- NestJS modules
- Database migrations
- API endpoints
- AI services integration

### Phase 2: Frontend Setup (Week 3-4)
- Next.js App Router
- Shared components
- Redux store
- RTK Query slices

### Phase 3: Core Features (Week 5-8)
- Authentication & onboarding
- Dashboard & profile
- Members management
- Lumen AI agent

### Phase 4: Advanced Features (Week 9-10)
- AI reports
- Insights dashboard

### Phase 5: Theme System (Week 11)
- 23 themes implementation
- Theme switcher

### Phase 6: Testing & Deployment (Week 12)
- Unit tests
- E2E tests
- Vercel + Railway deployment

---

## 🔒 Privacy First

- Everything private by default
- No social features
- No discovery
- Sharing is intentional and link-based only
- Row-level security on all data

---

## 🆘 Troubleshooting

### Port conflicts
```bash
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:3001 | xargs kill -9  # Backend
```

### Module errors
```bash
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
cd frontend && npm install
cd ../backend && npm install
```

### More help
- Check **QUICKSTART.md** for detailed troubleshooting
- Review error logs in terminal
- Check browser console for frontend errors

---

## 📚 Key References

### Architecture
- `.kiro/steering/architecture-principles.md` - Code standards
- `.kiro/steering/api-conventions.md` - API design
- `.kiro/steering/database-schema.md` - Database structure
- `.kiro/steering/ai-model-architecture.md` - AI implementation

### Design
- `.kiro/steering/design-system.md` - Complete design tokens
- `.kiro/steering/theme-system.md` - All 23 themes
- `.kiro/steering/component-library.md` - Reusable components
- `stitch_flows/` - Screen designs

### Features
- `.kiro/specs/lumis-mvp.md` - Complete requirements
- `Lumis-Features-v1.0.md` - Feature specifications

---

## 🎨 Design Philosophy

**Lumis is not a productivity app. It is not a wellness app.**

It is the place you go when something feels off and you cannot name it yet. The design must hold that feeling — quiet, safe, intelligent, and deep.

### UX Principles
1. **Breathing Space** - Anxiety lives in clutter
2. **Low Stimulation** - Colors like candlelight, not LED
3. **Weight & Gravity** - Typography that matters
4. **Feeling of Being Held** - Rounded, soft, warm
5. **Depth Without Complexity** - Layers of meaning, not UI

---

## 🤝 Contributing

This is a private project. All development follows the guidelines in `.kiro/steering/`.

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Component reusability mandatory
- No code duplication
- Test coverage requirements met

---

## 📝 License

Private & Confidential

---

## 🌟 What Makes Lumis Unique

1. **Five Layers Combined** - Observed traits + incidents + numerology + astrology + AI psychology
2. **Both Sides** - Analyzes you AND the other person
3. **Starts With You** - Log your own shadows first
4. **Completely Private** - No social layer, ever
5. **Gets Smarter** - Deeper insights as you log more data

---

**Built with care for understanding the people in your life** ✦

---

## 🚀 Ready to Build?

1. **Quick test:** Read `START.md` → Run `npm run dev`
2. **Full setup:** Read `QUICKSTART.md` → Get API keys → Set up database
3. **Development:** Follow `IMPLEMENTATION_GUIDE.md` → Build systematically

**Let's build something meaningful!** 🌟
