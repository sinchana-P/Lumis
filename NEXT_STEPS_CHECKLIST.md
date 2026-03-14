# Next Steps Checklist

## ✅ Completed
- [x] Project setup (frontend + backend)
- [x] All dependencies installed
- [x] Complete documentation and steering files
- [x] Authentication implementation (Google OAuth + local)
- [x] Login and signup pages
- [x] Backend auth endpoints
- [x] Token storage in localStorage

## 🎯 Immediate Actions (Before Coding)

### 1. Configure Supabase (15 minutes)
- [ ] Go to [Supabase Dashboard](https://app.supabase.com)
- [ ] Enable Google OAuth provider
- [ ] Add Google OAuth credentials (see `AUTH_SETUP_GUIDE.md`)
- [ ] Configure redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback` (for production)
- [ ] Copy Supabase URL and keys to `.env` files

### 2. Test Authentication (30 minutes)
- [ ] Start backend: `cd backend && npm run start:dev`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Test Google OAuth signup at `http://localhost:3000/signup`
- [ ] Test local email/password signup
- [ ] Test login with both methods
- [ ] Verify tokens in localStorage (DevTools → Application → Local Storage)
- [ ] Test `/api/v1/auth/me` endpoint returns user data

## 📝 Next Feature: Onboarding (Priority 1)

### Frontend Components to Create

- [ ] `frontend/src/app/onboarding/page.tsx` - Main onboarding flow
- [ ] `frontend/src/components/features/onboarding/StepIndicator.tsx`
- [ ] `frontend/src/components/features/onboarding/ProfileForm.tsx`
- [ ] `frontend/src/components/features/onboarding/BirthDataForm.tsx`
- [ ] `frontend/src/components/features/onboarding/ThemeSelector.tsx`
- [ ] `frontend/src/components/features/onboarding/AnalysisDepthSelector.tsx`

### Backend Endpoints to Create
- [ ] `PATCH /api/v1/users/me` - Update user profile
- [ ] `POST /api/v1/users/me/complete-onboarding` - Mark onboarding complete
- [ ] Create Users module in backend

### Onboarding Steps
1. Welcome screen with Lumis branding
2. Basic profile (full name, optional photo)
3. Birth data (date, time, place) for numerology/astrology
4. Theme selecti