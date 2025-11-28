# Authentication Setup Checklist

## ✅ Completed (Infrastructure)

- [x] Created `.env.local.example` with auth variables
- [x] Created `src/lib/auth.ts` with auth client utilities
- [x] Created `src/context/AuthContext.tsx` with state management
- [x] Created `src/hooks/useAuth.ts` for consuming auth context
- [x] Created `src/app/auth/callback/route.ts` for OAuth callback
- [x] Updated `src/app/layout.tsx` to include AuthProvider
- [x] Created `src/components/AuthButton.tsx` example component
- [x] Verified build succeeds with no errors
- [x] Created comprehensive documentation

## 🔄 Next Steps (Configuration)

### 1. Supabase Dashboard Setup
- [ ] Go to https://supabase.com/dashboard
- [ ] Navigate to Authentication > Providers
- [ ] Enable Google OAuth provider
- [ ] Configure Google OAuth credentials (see below)

### 2. Google Cloud Console Setup
- [ ] Go to https://console.cloud.google.com/
- [ ] Create or select project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 Client ID
- [ ] Add authorized redirect URI: `https://[your-project].supabase.co/auth/v1/callback`
- [ ] Copy Client ID and Client Secret to Supabase

### 3. Supabase URL Configuration
- [ ] Go to Authentication > URL Configuration
- [ ] Add Site URL: `http://localhost:3000` (dev)
- [ ] Add Site URL: `https://your-domain.com` (prod)
- [ ] Add Redirect URLs as needed

### 4. Test Authentication Flow
- [ ] Start dev server: `npm run dev`
- [ ] Add `<AuthButton />` to a page
- [ ] Click "Sign in with Google"
- [ ] Verify redirect to Google
- [ ] Verify redirect back to app
- [ ] Verify user state updates
- [ ] Test sign out

## 📋 Phase 4 Implementation Tasks

### Auth Gate Modal
- [ ] Create `src/components/AuthGateModal.tsx`
- [ ] Add turn counter to ChatContext
- [ ] Trigger modal after 3+ turns for guests
- [ ] Trigger modal on save intent
- [ ] Trigger modal on book intent
- [ ] Add "Maybe later" option (soft conversion)

### Save Course Feature
- [ ] Add `saved_courses` table to Supabase (see schema in AUTH_INTEGRATION_EXAMPLES.md)
- [ ] Enable Row Level Security (RLS)
- [ ] Add heart icon to CourseCard
- [ ] Add heart icon to CourseDetailCard
- [ ] Implement save/unsave functionality
- [ ] Show saved courses in sidebar

### Save Itinerary Feature
- [ ] Add `saved_itineraries` table to Supabase
- [ ] Enable Row Level Security (RLS)
- [ ] Add "Save Draft" button to ItineraryBuilder
- [ ] Implement save/update functionality
- [ ] Show saved itineraries in sidebar
- [ ] Allow loading saved itineraries

### Sidebar Integration
- [ ] Add auth section to Sidebar
- [ ] Show user email when signed in
- [ ] Show sign-in button when guest
- [ ] Add "My Saved Courses" section (members only)
- [ ] Add "My Itineraries" section (members only)
- [ ] Different UI for members vs guests

## 🔍 Testing Checklist

- [ ] Sign in flow works
- [ ] Sign out flow works
- [ ] Auth state persists across page refreshes
- [ ] Protected features show auth gate for guests
- [ ] User can save courses after signing in
- [ ] User can save itineraries after signing in
- [ ] Saved items display in sidebar
- [ ] User data is properly scoped (RLS working)

## 📚 Documentation Reference

- **Setup Guide:** `AUTH_SETUP.md`
- **Integration Examples:** `AUTH_INTEGRATION_EXAMPLES.md`
- **Implementation Summary:** `AUTH_IMPLEMENTATION_SUMMARY.md`
- **Project Docs:** `CLAUDE.md` (Phase 4 section)

## 🚨 Common Issues

### "Missing Supabase environment variables"
- Check `.env.local` has both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

### OAuth redirect fails
- Verify redirect URLs match in Google Console and Supabase
- Check callback route exists at `/auth/callback`

### "useAuth must be used within AuthProvider"
- Verify AuthProvider wraps app in `layout.tsx`
- Check component is inside the provider tree

### User state not persisting
- Check if cookies are enabled
- Verify Supabase client uses `createBrowserClient`
- Check browser console for errors

---

**Last Updated:** 2024-11-28
**Status:** Infrastructure complete, ready for Phase 4 implementation
