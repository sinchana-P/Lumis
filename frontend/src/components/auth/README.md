# Auth UI Components

Reusable authentication UI components following the Lumis design system.

## Components

### AuthLayout

Provides consistent layout for all authentication pages.

**Features:**
- Warm cream background (#F8F6F3)
- Centered card with soft shadow
- Lumis branding (✦ LUMIS)
- Generous spacing
- Responsive design

**Usage:**
```tsx
import { AuthLayout } from '@/components/auth';

<AuthLayout>
  <h2>Sign In</h2>
  {/* Your auth form content */}
</AuthLayout>
```

**Requirements:** 10.2, 10.7

---

### AuthErrorDisplay

Displays authentication error messages with warm styling.

**Features:**
- Warm styling with soft sage accents
- Crimson Pro serif font
- Dismissible alert
- Auto-dismiss after 5 seconds
- Smooth fade animations

**Usage:**
```tsx
import { AuthErrorDisplay } from '@/components/auth';

<AuthErrorDisplay 
  error={errorMessage}
  onDismiss={() => setError(null)}
/>
```

**Requirements:** 8.1, 8.6

---

### AuthFormField

Form field wrapper with Lumis theme styling.

**Features:**
- Wraps input components with consistent styling
- Applies Lumis theme tokens
- Uses Crimson Pro serif font
- Focus glow effects with soft sage accent (#9CAF9E)
- Displays field-specific error messages below inputs
- Generous spacing
- Accessible with ARIA attributes

**Usage:**
```tsx
import { AuthFormField } from '@/components/auth';

<AuthFormField
  label="Email"
  name="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
  placeholder="your@email.com"
/>
```

**Requirements:** 8.3, 10.3, 10.4, 10.5, 10.6, 10.8

---

### GoogleSignInButton

Google OAuth sign-in button with Google branding and Lumis theme.

**Features:**
- Styled with Google branding colors and Lumis theme
- 12px border radius and soft shadows
- Smooth hover state transitions (250ms)
- Loading state with spinner
- Redirects to Google authorization URL
- Handles OAuth initiation with proper parameters

**Usage:**
```tsx
import { GoogleSignInButton } from '@/components/auth';

<GoogleSignInButton 
  onSuccess={() => console.log('Redirecting to Google...')}
  onError={(error) => setError(error)}
/>
```

**Environment Variables Required:**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**OAuth Flow:**
1. User clicks button
2. Button builds Google OAuth URL with client_id, redirect_uri, scope
3. Redirects to Google authorization page
4. Google redirects back to `/auth/callback` with authorization code
5. Callback page exchanges code for tokens via backend API
6. Tokens stored in localStorage, user redirected to dashboard

**Requirements:** 1.1, 10.4, 10.5, 10.9

---

## Complete Example

```tsx
'use client';

import { useState } from 'react';
import { AuthLayout, AuthErrorDisplay, AuthFormField } from '@/components/auth';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Your sign in logic here
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-serif text-lumis-text-primary text-center mb-6">
        Welcome Back
      </h2>

      <AuthErrorDisplay 
        error={error}
        onDismiss={() => setError(null)}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthFormField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          placeholder="your@email.com"
        />

        <AuthFormField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          placeholder="Enter your password"
        />

        <button
          type="submit"
          className="w-full btn btn-primary"
        >
          Sign In
        </button>
      </form>
    </AuthLayout>
  );
}
```

---

## Design System Compliance

All components follow the Lumis design system:

- **Colors:** Warm cream backgrounds, soft sage accents, warm charcoal text
- **Typography:** Crimson Pro serif for content, Inter sans for UI elements
- **Spacing:** Generous spacing using Lumis spacing scale
- **Shadows:** Soft, warm shadows (never harsh black)
- **Borders:** 12px border radius for cards and inputs
- **Animations:** Gentle transitions (250ms), no bouncing
- **Accessibility:** WCAG AA compliant, proper focus states, ARIA attributes

---

## Theme Tokens Used

```css
/* Backgrounds */
--lumis-bg-primary: #F8F6F3
--lumis-bg-secondary: #F2EFE9
--lumis-bg-tertiary: #EBE7DF

/* Surfaces */
--lumis-surface-elevated: #FFFFFF

/* Accents */
--lumis-accent-primary: #9CAF9E (soft sage)
--lumis-accent-primary-light: #C5D4C6

/* Text */
--lumis-text-primary: #3D3935
--lumis-text-secondary: #6B6560
--lumis-text-tertiary: #9B9590

/* Error States */
--lumis-error: #C89090
--lumis-error-bg: #F5E8E8
--lumis-error-border: #E5CFCF
```

---

## Testing

Unit tests are optional for this task (11.4) but can be added later if needed.

To test components manually:
1. Import components in your auth pages
2. Verify styling matches Lumis design system
3. Test error display and dismissal
4. Test form field validation and error messages
5. Verify focus states and accessibility
