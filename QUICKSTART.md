# 🚀 Lumis Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Supabase account (free tier)
- API keys: Gemini, Groq, Cohere (all free tier)

---

## Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Go back to root
cd ..
```

---

## Step 2: Environment Setup

### Create Frontend .env

```bash
cd frontend
cat > .env << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
EOF
```

### Create Backend .env

```bash
cd ../backend
cat > .env << 'EOF'
# Database
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=your_postgres_connection_string_here

# AI Services (Free Tier)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
COHERE_API_KEY=your_cohere_api_key_here

# App Config
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars_here
EOF

cd ..
```

---

## Step 3: Get API Keys (All Free!)

### Supabase (Database & Auth)
1. Go to https://supabase.com
2. Create new project
3. Get URL and keys from Settings > API
4. Copy connection string from Settings > Database

### Gemini API (Primary AI)
1. Go to https://makersuite.google.com/app/apikey
2. Create API key (free tier: 15 req/min)

### Groq API (Speed Layer)
1. Go to https://console.groq.com
2. Create API key (free tier: 30 req/min)

### Cohere API (Embeddings)
1. Go to https://dashboard.cohere.com
2. Create API key (free tier: 100 req/min)

---

## Step 4: Database Setup

### Run Migrations

```bash
# Copy the SQL from .kiro/steering/database-schema.md
# Run it in Supabase SQL Editor

# Or use this command:
cd backend
npm run migration:run
```

---

## Step 5: Run the Project

### Option 1: Run Both Together (Recommended)

```bash
# From root directory
npm run dev
```

This starts:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Step 6: Access the App

Open your browser:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/v1
- **API Docs:** http://localhost:3001/api/docs

---

## 🎯 Development Workflow

### Daily Development

```bash
# Start both servers
npm run dev

# In another terminal, run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test
```

### Making Changes

1. **Frontend changes:** Edit files in `frontend/src/`
2. **Backend changes:** Edit files in `backend/src/`
3. **Hot reload:** Both servers auto-reload on changes

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Database Connection Error

1. Check Supabase URL and keys in .env
2. Verify database is running
3. Check connection string format
4. Ensure RLS policies are set up

### AI API Errors

1. Verify API keys are correct
2. Check you haven't hit rate limits
3. Ensure keys have proper permissions

---

## 📁 Project Structure

```
lumis/
├── frontend/          # Next.js app (port 3000)
│   ├── src/
│   │   ├── app/      # Pages
│   │   ├── components/
│   │   ├── lib/
│   │   └── store/
│   └── package.json
│
├── backend/           # NestJS API (port 3001)
│   ├── src/
│   │   ├── modules/
│   │   └── main.ts
│   └── package.json
│
├── .kiro/            # Documentation
├── stitch_flows/     # Design references
└── package.json      # Root workspace
```

---

## 🔧 Useful Commands

### Root Level
```bash
npm run dev              # Start both servers
npm run build            # Build both projects
npm run test             # Run all tests
npm run lint             # Lint all code
npm run type-check       # Check TypeScript
```

### Frontend Only
```bash
cd frontend
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Lint frontend
npm run type-check       # Check types
npm run test             # Run tests
```

### Backend Only
```bash
cd backend
npm run start:dev        # Start dev server
npm run build            # Production build
npm run start:prod       # Start production server
npm run lint             # Lint backend
npm run test             # Run tests
npm run test:e2e         # E2E tests
```

---

## 🎨 Next Steps

1. ✅ **You are here** - Project is running!
2. 📖 Read `IMPLEMENTATION_GUIDE.md` for full development plan
3. 🎨 Check `stitch_flows/` for UI design references
4. 📚 Review `.kiro/steering/` for architecture guidelines
5. 🚀 Start building features following the 12-week plan

---

## 💡 Tips

- Keep both terminals open to see logs
- Frontend changes reload instantly
- Backend changes restart the server
- Check browser console for frontend errors
- Check terminal for backend errors
- Use Redux DevTools for state debugging

---

## 🆘 Need Help?

1. Check `IMPLEMENTATION_GUIDE.md` for detailed instructions
2. Review `.kiro/steering/` documentation
3. Look at `stitch_flows/` for design examples
4. Check error logs in terminal

---

**Happy coding! 🌟**
