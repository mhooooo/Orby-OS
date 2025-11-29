# Authentication Setup Guide

This document explains how to configure and use the Supabase authentication system for Golf Okay.

## Prerequisites

1. Supabase project created at https://supabase.com/dashboard
2. Environment variables set in `.env.local` (see `.env.local.example`)

## Google OAuth Configuration

### 1. Enable Google Auth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google**

### 2. Configure Google OAuth Credentials

You need to create OAuth credentials in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - For development: `https://your-project.supabase.co/auth/v1/callback`
   - For production: `https://your-production-domain.com/auth/v1/callback`

7. Copy the **Client ID** and **Client Secret**
8. Paste them into Supabase dashboard under Google provider settings

### 3. Configure Redirect URL

In Supabase dashboard under **Authentication** > **URL Configuration**:

- Add your site URL (e.g., `http://localhost:3000` for development)
- Add redirect URLs for auth callback

## Usage

### In Components

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <div>
        <p>Welcome, {user.email}</p>
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  }

  return <button onClick={signIn}>Sign in with Google</button>;
}
```

### Auth State

The `useAuth()` hook provides:

- `user`: Current user object or `null`
- `loading`: Boolean indicating if auth state is being loaded
- `signIn`: Function to trigger Google OAuth flow
- `signOut`: Function to sign out the current user

### User Object

When signed in, `user` contains:

```typescript
{
  id: string;           // User ID
  email: string;        // User email
  user_metadata: {      // Additional user data
    full_name: string;
    avatar_url: string;
    // ... other Google profile data
  };
  // ... other fields
}
```

## File Structure

```
src/
├── lib/
│   └── auth.ts                      # Auth client and helper functions
├── context/
│   └── AuthContext.tsx              # Auth state provider
├── hooks/
│   └── useAuth.ts                   # Hook to access auth state
├── components/
│   └── AuthButton.tsx               # Example auth button component
└── app/
    ├── layout.tsx                   # Root layout with AuthProvider
    └── auth/
        └── callback/
            └── route.ts             # OAuth callback handler
```

## Implementation Details

### Browser Client

The auth system uses `@supabase/ssr` with `createBrowserClient` for client-side auth operations. This ensures proper cookie handling and session management.

### Auth Flow

1. User clicks "Sign in with Google"
2. `signIn()` function triggers OAuth flow
3. User is redirected to Google for authentication
4. Google redirects back to `/auth/callback` with auth code
5. Callback route exchanges code for session
6. User is redirected to home page
7. `AuthContext` detects auth state change and updates `user`

### State Management

- `AuthContext` listens to Supabase auth state changes
- Updates are propagated to all components using `useAuth()`
- Context value is memoized to prevent unnecessary re-renders

## Testing Auth Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Add the `AuthButton` component to your page:
   ```tsx
   import { AuthButton } from '@/components/AuthButton';

   // In your component
   <AuthButton />
   ```

3. Click "Sign in with Google" and verify the OAuth flow works

## Troubleshooting

### "Missing Supabase environment variables" error

Ensure `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### OAuth redirect not working

1. Check that redirect URLs are configured in both:
   - Google Cloud Console (Authorized redirect URIs)
   - Supabase dashboard (URL Configuration)

2. Ensure callback route exists at `/auth/callback`

### "useAuth must be used within an AuthProvider" error

Make sure `AuthProvider` wraps your component tree in `layout.tsx`:
```tsx
<AuthProvider>
  {children}
</AuthProvider>
```

## Next Steps

With auth configured, you can now:

1. Create an auth gate modal that triggers after 3+ chat turns
2. Implement "save course" functionality for signed-in users
3. Save itinerary drafts to user account
4. Display different sidebar views for members vs guests
5. Add RLS (Row Level Security) policies in Supabase for user-specific data

See `CLAUDE.md` for Phase 4 implementation priorities.
