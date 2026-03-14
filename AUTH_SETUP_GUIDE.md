# 🔐 Authentication Setup Guide

## ✅ What's Implemented

### Priority 1: Google OAuth
- ✅ Google Sign In button
- ✅ Google Sign Up button
- ✅ OAuth callback handling
- ✅ Automatic session storage in localStorage

### Priority 2: Local Auth
- ✅ Email/Password Sign Up
- ✅ Email/Password Sign In
- ✅ Password validation (min 8 chars)
- ✅ Confirm password matching

### Token Storage
- ✅ Access token stored in localStorage
- ✅ Refresh token stored in localStorage
- ✅ User data stored in localStorage
- ✅ Automatic token refresh
- ✅ Session persistence

### Backend
- ✅ Auth module with Supabase integration
- ✅ Token verification
- ✅ Auth guard for protected routes
- ✅ User decorator for easy access
- ✅ Current user endpoint

---

## 🚀 Setup Steps

### Step 1: Enable Google OAuth in Supabase

1. Go to your Supabase project
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click **Enable**
4. You'll need:
   - Google Client ID
   - Google Client Secret

### Step 2: Get Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted
6. Application type: **Web application**
7. Add authorized redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback (for development)
   ```
8. Copy **Client ID** and **Client Secret**

### Step 3: Configure Supabase

1. Back in Supabase → **Authentication** → **Providers** → **Google**
2. Paste:
   - **Client ID** (from Google Console)
   - **Client Secret** (from Google Console)
3. Click **Save**

### Step 4: Update Redirect URLs

In Supabase → **Authentication** → **URL Configuration**:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/auth/callback
http://localhost:3000/**
```

---

## 📁 Files Created

### Frontend
```
frontend/src/
├── lib/
│   ├── supabase.ts          # Supabase client + auth helpers
│   └── auth.ts              # Auth service (Google + Local)
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx     # Login page (Google + Email)
│   │   └── signup/
│   │       └── page.tsx     # Signup page (Google + Email)
│   └── auth/
│       └── callback/
│           └── page.tsx     # OAuth callback handler
```

### Backend
```
backend/src/
├── modules/
│   └── auth/
│       ├── auth.module.ts       # Auth module
│       ├── auth.service.ts      # Auth business logic
│       ├── auth.controller.ts   # Auth endpoints
│       └── supabase.service.ts  # Supabase integration
└── common/
    ├── guards/
    │   └── auth.guard.ts        # Protect routes
    └── decorators/
        └── user.decorator.ts    # Get current user
```

---

## 🔑 How Tokens are Stored

### localStorage Keys:

```javascript
// Session data (access_token, refresh_token, expires_at)
localStorage.getItem('lumis_session')

// User data (id, email, metadata)
localStorage.getItem('lumis_user')
```

### Access Token Usage:

```typescript
// Frontend - Automatic with Supabase client
const { data } = await supabase.from('users').select('*');

// Backend - Extract from Authorization header
Authorization: Bearer <access_token>
```

---

## 🎯 Authentication Flow

### Google OAuth Flow:

```
1. User clicks "Continue with Google"
   ↓
2. Redirects to Google login
   ↓
3. User authorizes
   ↓
4. Google redirects to /auth/callback
   ↓
5. Callback page extracts session
   ↓
6. Stores tokens in localStorage
   ↓
7. Redirects to /onboarding or /dashboard
```

### Local Auth Flow:

```
1. User enters email/password
   ↓
2. Supabase validates credentials
   ↓
3. Returns session (access_token, refresh_token)
   ↓
4. Stores tokens in localStorage
   ↓
5. Redirects to /onboarding or /dashboard
```

---

## 🛡️ Protected Routes

### Frontend (Client-side)

```typescript
// Check if user is authenticated
import { authHelpers } from '@/lib/supabase';

if (!authHelpers.isAuthenticated()) {
  router.push('/login');
}
```

### Backend (Server-side)

```typescript
// Protect endpoint with AuthGuard
@Get('profile')
@UseGuards(AuthGuard)
async getProfile(@User() user: any) {
  return user;
}
```

---

## 🔄 Token Refresh

### Automatic Refresh:

Supabase automatically refreshes tokens before they expire.

### Manual Refresh:

```typescript
import { authService } from '@/lib/auth';

const { data, error } = await authService.refreshSession();
```

---

## 🧪 Testing Authentication

### Test Google OAuth:

1. Start frontend: `cd frontend && npm run dev`
2. Go to http://localhost:3000/login
3. Click "Continue with Google"
4. Sign in with Google account
5. Should redirect to /onboarding

### Test Local Auth:

1. Go to http://localhost:3000/signup
2. Enter email, password, name
3. Click "Create Account"
4. Should redirect to /onboarding

### Test Protected Route:

```bash
# Get access token from localStorage
token=$(node -e "console.log(JSON.parse(localStorage.getItem('lumis_session')).access_token)")

# Call protected endpoint
curl -H "Authorization: Bearer $token" http://localhost:3001/api/v1/auth/me
```

---

## 📊 API Endpoints

### GET /api/v1/auth/me
Get current user data

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "has_profile": false
  }
}
```

### GET /api/v1/auth/status
Check authentication status

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe"
    },
    "has_completed_onboarding": false
  }
}
```

---

## 🔍 Debugging

### Check localStorage:

```javascript
// In browser console
console.log(localStorage.getItem('lumis_session'));
console.log(localStorage.getItem('lumis_user'));
```

### Check if token is valid:

```javascript
import { authService } from '@/lib/auth';

const { user, error } = await authService.getCurrentUser();
console.log(user, error);
```

### Backend logs:

```bash
cd backend
npm run start:dev

# Watch for auth errors in terminal
```

---

## ⚠️ Common Issues

### Issue: "Invalid redirect URL"
**Solution:** Add redirect URL in Supabase → Authentication → URL Configuration

### Issue: "Google OAuth not working"
**Solution:** 
1. Check Google Client ID/Secret in Supabase
2. Verify redirect URIs in Google Console
3. Make sure Google provider is enabled in Supabase

### Issue: "Token expired"
**Solution:** Supabase auto-refreshes. If manual refresh needed:
```typescript
await authService.refreshSession();
```

### Issue: "CORS error"
**Solution:** Check `FRONTEND_URL` in backend `.env` matches your frontend URL

---

## ✅ Checklist

### Supabase Setup:
- [ ] Google OAuth enabled
- [ ] Google Client ID/Secret configured
- [ ] Redirect URLs added
- [ ] Site URL configured

### Frontend:
- [ ] Can access /login page
- [ ] Can access /signup page
- [ ] Google button works
- [ ] Local signup works
- [ ] Local signin works
- [ ] Tokens stored in localStorage

### Backend:
- [ ] Auth module running
- [ ] /api/v1/auth/me endpoint works
- [ ] /api/v1/auth/status endpoint works
- [ ] AuthGuard protects routes

---

## 🚀 Next Steps

1. ✅ **Authentication working** - You're here!
2. 📝 Create onboarding flow
3. 🏠 Create dashboard
4. 👤 Create user profile page

---

**Authentication is ready!** 🎉

Users can now sign up/sign in with Google or email/password, and all tokens are stored in localStorage.
