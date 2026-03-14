# 🔐 Environment Variables Setup Guide

## 📋 Complete List of Environment Variables

---

## 🎨 FRONTEND (.env)

**Location:** `frontend/.env`

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Backend API (Required)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### How to Get Frontend Variables:

#### 1. Supabase URL & Anon Key
1. Go to https://supabase.com
2. Create new project (or use existing)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 2. Backend API URL
- **Development:** `http://localhost:3001/api/v1`
- **Production:** Your deployed backend URL (e.g., `https://lumis-api.railway.app/api/v1`)

---

## ⚙️ BACKEND (.env)

**Location:** `backend/.env`

```bash
# ============================================
# DATABASE (Required)
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# ============================================
# AI SERVICES (Required - All Free Tier!)
# ============================================

# Gemini API (Primary AI - Deep Analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# Groq API (Speed Layer - Instant Responses)
GROQ_API_KEY=your_groq_api_key_here

# Cohere API (Embeddings - Semantic Search)
COHERE_API_KEY=your_cohere_api_key_here

# ============================================
# APPLICATION CONFIG (Required)
# ============================================
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# ============================================
# AUTHENTICATION (Required)
# ============================================
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_characters_long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# RATE LIMITING (Optional)
# ============================================
RATE_LIMIT_STANDARD=100
RATE_LIMIT_AI=10
RATE_LIMIT_AUTH=5

# ============================================
# FILE UPLOAD (Optional)
# ============================================
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# ============================================
# LOGGING (Optional)
# ============================================
LOG_LEVEL=info

# ============================================
# EXTERNAL APIS (Optional)
# ============================================
# Astrology API (if using external service)
ASTROLOGY_API_KEY=your_astrology_api_key_here
ASTROLOGY_API_URL=https://api.astrology-service.com

# Geocoding API (for place of birth)
GEOCODING_API_KEY=your_geocoding_api_key_here
```

### How to Get Backend Variables:

#### 1. Supabase (Database & Auth)
1. Go to https://supabase.com
2. Go to **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon public** key → `SUPABASE_ANON_KEY`
4. Go to **Settings** → **Database**
5. Copy **Connection string** → `DATABASE_URL`
   - Replace `[YOUR-PASSWORD]` with your database password

#### 2. Gemini API (Free - Primary AI)
1. Go to https://makersuite.google.com/app/apikey
2. Click **Create API Key**
3. Copy key → `GEMINI_API_KEY`
4. **Free Tier:** 15 requests/minute, 1M tokens context

#### 3. Groq API (Free - Speed Layer)
1. Go to https://console.groq.com
2. Sign up / Log in
3. Go to **API Keys**
4. Click **Create API Key**
5. Copy key → `GROQ_API_KEY`
6. **Free Tier:** 30 requests/minute, 500+ tokens/sec

#### 4. Cohere API (Free - Embeddings)
1. Go to https://dashboard.cohere.com
2. Sign up / Log in
3. Go to **API Keys**
4. Copy **Production Key** → `COHERE_API_KEY`
5. **Free Tier:** 100 requests/minute

#### 5. JWT Secrets (Generate Your Own)
```bash
# Generate random 32+ character strings
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run this twice to get two different secrets:
- First output → `JWT_SECRET`
- Second output → `JWT_REFRESH_SECRET`

---

## 📝 Step-by-Step Setup

### Step 1: Create Frontend .env

```bash
cd frontend
touch .env
```

Copy this template and fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Step 2: Create Backend .env

```bash
cd ../backend
touch .env
```

Copy this template and fill in your values:

```bash
# Database
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
DATABASE_URL=

# AI Services
GEMINI_API_KEY=
GROQ_API_KEY=
COHERE_API_KEY=

# App Config
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# JWT (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## ✅ Verification Checklist

### Frontend (.env)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Starts with `https://`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Long string starting with `eyJ`
- [ ] `NEXT_PUBLIC_API_URL` - Points to backend (localhost:3001 for dev)

### Backend (.env)
- [ ] `SUPABASE_URL` - Same as frontend
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Long string starting with `eyJ`
- [ ] `SUPABASE_ANON_KEY` - Same as frontend
- [ ] `DATABASE_URL` - Starts with `postgresql://`
- [ ] `GEMINI_API_KEY` - From Google AI Studio
- [ ] `GROQ_API_KEY` - From Groq Console
- [ ] `COHERE_API_KEY` - From Cohere Dashboard
- [ ] `JWT_SECRET` - 32+ characters
- [ ] `JWT_REFRESH_SECRET` - 32+ characters (different from JWT_SECRET)

---

## 🧪 Test Your Setup

### Test Frontend Connection

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 - Should load without errors

### Test Backend Connection

```bash
cd backend
npm run start:dev
```

Visit http://localhost:3001/api/v1 - Should see health check response

### Test Database Connection

```bash
cd backend
npm run start:dev
```

Check terminal - Should NOT see database connection errors

---

## 🚨 Common Issues

### Issue: "Invalid API key"
**Solution:** Double-check you copied the entire key without spaces

### Issue: "Database connection failed"
**Solution:** 
1. Check `DATABASE_URL` format
2. Verify password is correct
3. Ensure Supabase project is active

### Issue: "CORS error"
**Solution:** 
1. Check `FRONTEND_URL` in backend .env
2. Verify it matches your frontend URL exactly

### Issue: "Module not found"
**Solution:**
```bash
rm -rf node_modules
npm install
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env` files in `.gitignore`
- Use different secrets for development and production
- Rotate API keys periodically
- Use service role key ONLY in backend
- Use anon key in frontend

### ❌ DON'T:
- Commit `.env` files to git
- Share API keys publicly
- Use production keys in development
- Expose service role key in frontend
- Use same JWT secrets in dev and prod

---

## 📦 Production Environment Variables

### Vercel (Frontend)

Go to your Vercel project → **Settings** → **Environment Variables**

Add:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
```

### Railway (Backend)

Go to your Railway project → **Variables**

Add all backend variables from the template above, but change:
```
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🎯 Quick Copy Templates

### Minimal Frontend .env (Development)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Minimal Backend .env (Development)
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
DATABASE_URL=postgresql://postgres:xxxxx@db.xxxxx.supabase.co:5432/postgres
GEMINI_API_KEY=xxxxx
GROQ_API_KEY=gsk_xxxxx
COHERE_API_KEY=xxxxx
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=xxxxx_32_chars_minimum
JWT_REFRESH_SECRET=xxxxx_32_chars_minimum_different
```

---

## 🆘 Need Help?

1. **Can't get API keys?** All services have free tiers - just sign up!
2. **Database not connecting?** Check Supabase project is active
3. **CORS errors?** Verify `FRONTEND_URL` matches exactly
4. **Still stuck?** Check error messages in terminal

---

## ✨ You're All Set!

Once you have all variables set up:

```bash
# From root directory
npm run dev
```

Both frontend and backend should start without errors! 🎉
