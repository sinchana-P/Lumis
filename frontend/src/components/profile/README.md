# Profile Components

Redesigned profile page components following Lumis design system principles.

## Components

### ProfileHeader
- Displays user avatar, name, and email
- Compact card design with proper Lumis colors

### ProfileForm  
- Edit personal information (name, avatar, birth details)
- Two-column responsive layout
- Proper form validation and loading states

### PasswordSection
- Secure password change functionality
- Collapsible form to save space
- Current password verification

### AppearanceSection
- Theme selection using existing ThemeSelector
- Minimal, focused design

### SignOutSection
- Clean sign-out functionality
- Proper loading states

## API Integration

- `updateProfile()` - Updates user profile information
- `changePassword()` - Secure password change with verification

## Design Improvements

- ✅ Removed bloated Privacy & Data section
- ✅ Compact, card-based layout using full available space
- ✅ Proper Lumis color tokens throughout
- ✅ No hardcoded colors or basic white backgrounds
- ✅ Warm, sophisticated aesthetic matching Lumis vibe
- ✅ Split into focused, single-responsibility components
- ✅ Two-column responsive layout for better space utilization