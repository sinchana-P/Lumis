# 🔐 Quick Environment Setup

## 📝 Simple 3-Step Setup

### Step 1: Copy Templates

```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

### Step 2: Fill in Values

#### Frontend (`frontend/.env`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

#### Backend (`backend/.env`)
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# AI Services (All Free!)
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
COHERE_API_KEY=your_cohere_key_here

# App Config
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# JWT Secrets (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_generated_secret_here
JWT_REFRESH_SECRET=your_generated_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Step 3: Get API Keys

| Service | URL | What to Copy |
|---|---|---|
| **Supabase** | https://supabase.com → Settings → API | URL, anon key, service_role key |
| **Gemini** | https://makersuite.google.com/app/apikey | API Key |
| **Groq** | https://console.groq.com | API Key |
| **Cohere** | https://dashboard.cohere.com | API Key |

---

## ✅ Quick Checklist

### Frontend `.env` (3 required)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_API_URL`

### Backend `.env` (14 required)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `DATABASE_URL`
- [ ] `GEMINI_API_KEY`
- [ ] `GROQ_API_KEY`
- [ ] `COHERE_API_KEY`
- [ ] `NODE_ENV`
- [ ] `PORT`
- [ ] `FRONTEND_URL`
- [ ] `JWT_SECRET`
- [ ] `JWT_REFRESH_SECRET`
- [ ] `JWT_EXPIRES_IN`
- [ ] `JWT_REFRESH_EXPIRES_IN`

---

## 🚀 Done!

```bash
npm run dev
```

**For detailed instructions, see:** `ENV_SETUP_GUIDE.md`
