# Vercel Deployment Setup Guide

## Overview
This guide covers the complete setup for deploying Golf Okay to Vercel production.

## Build Status
- **Production Build**: ✅ PASSING
- **ESLint**: ✅ PASSING (10 warnings, 0 errors)
- **TypeScript**: ✅ PASSING
- **Static Generation**: ✅ PASSING

## Files Created/Modified

### 1. vercel.json
**Status**: ✅ Created

Production configuration for Vercel deployment:
- Framework: Next.js
- Region: Singapore (sin1) - Optimized for Thailand users
- Security headers enabled (CSP, XSS, frame protection)
- Build command: `npm run build`

**Location**: `/vercel.json`

### 2. .env.example
**Status**: ✅ Updated

Complete documentation of all environment variables:
- Required: Anthropic API, Supabase, Resend
- Optional: Cloudinary, Analytics (Plausible/PostHog)
- Development modes documented

**Location**: `/.env.example`

### 3. next.config.ts
**Status**: ✅ Updated

Production-ready configuration:
- Image remote patterns for external domains (Unsplash, Cloudinary, UI Avatars)
- Security headers (redundant with vercel.json for safety)
- DNS prefetch enabled

**Location**: `/next.config.ts`

### 4. DEPLOYMENT_CHECKLIST.md
**Status**: ✅ Created

Complete step-by-step deployment checklist covering:
- Environment variables setup
- Domain configuration
- Supabase OAuth setup
- Email configuration
- Build verification
- Post-deployment monitoring

**Location**: `/DEPLOYMENT_CHECKLIST.md`

## Build Test Results

### Production Build
```
✓ Compiled successfully in 2.4s
✓ Running TypeScript ... PASSED
✓ Collecting page data ... SUCCESS
✓ Generating static pages (11/11) ... SUCCESS
✓ Finalizing page optimization ... SUCCESS
```

**Build Time**: ~3 seconds
**Static Pages**: 3 (/, /_not-found, /card-demo)
**Dynamic Routes**: 8 API routes + 1 auth callback

### ESLint Results
```
✓ No errors
⚠ 10 warnings (unused imports/variables)
```

**Warnings are acceptable** - they don't affect functionality:
- Unused variables in component files
- Imported but unused icons
- These can be cleaned up in a separate PR

## Environment Variables Required

### Required for Production
Set these in Vercel Dashboard → Settings → Environment Variables:

1. **ANTHROPIC_API_KEY**
   - Get from: https://console.anthropic.com/
   - Scope: Production, Preview

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Get from: Supabase project settings
   - Scope: Production, Preview

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Get from: Supabase project settings
   - Scope: Production, Preview

4. **RESEND_API_KEY**
   - Get from: https://resend.com/api-keys
   - Scope: Production, Preview

### Optional (Phase 6 - Analytics)
5. **NEXT_PUBLIC_ANALYTICS_PROVIDER**
   - Values: `plausible` | `posthog` | `none`
   - Default: `plausible`

6. **NEXT_PUBLIC_PLAUSIBLE_DOMAIN**
   - Example: `golfokay.co`
   - Required if using Plausible analytics

## Code Fixes Applied

### 1. Lazy Client Initialization
**Issue**: Supabase and Resend clients were initialized at module load, causing build failures.

**Fix**: Implemented lazy initialization with Proxy pattern:
- Clients initialize only on first use
- No errors during build-time static generation
- Maintains singleton pattern for efficiency

**Files Modified**:
- `/src/lib/supabase.ts`
- `/src/lib/email.ts`

### 2. React 19 JSX.Element Compatibility
**Issue**: TypeScript doesn't recognize `JSX.Element` in React 19.

**Fix**: Changed to `React.ReactElement`

**File Modified**: `/src/components/ui/Toast.tsx`

### 3. useSearchParams Suspense Boundary
**Issue**: Next.js 16 requires useSearchParams to be wrapped in Suspense.

**Fix**: Added Suspense boundary around PageViewTracker

**File Modified**: `/src/components/providers/AnalyticsProvider.tsx`

### 4. Lucide React Icon Import
**Issue**: `MapOff` icon doesn't exist in lucide-react package.

**Fix**: Changed to `MapPin` icon

**File Modified**: `/src/components/ui/EmptyState.tsx`

## Deployment Steps

### 1. Connect to Vercel
1. Go to https://vercel.com/new
2. Import Git repository: `overhauled-golfokay-polish`
3. Framework Preset: Next.js (auto-detected)
4. Root Directory: `./`

### 2. Configure Environment Variables
Copy all required variables from `.env.local` to Vercel:
- Go to Settings → Environment Variables
- Add all required variables listed above
- Set scope: Production, Preview

### 3. Configure Build Settings
Vercel auto-detects these from `vercel.json`, but verify:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: 20.x

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit preview URL to verify

### 5. Configure Custom Domain
1. Add domain: `golfokay.co`
2. Configure DNS records (provided by Vercel)
3. Wait for DNS propagation
4. Verify HTTPS certificate

### 6. Configure Supabase OAuth
Add production URLs to Supabase Auth:
1. Go to Supabase → Authentication → URL Configuration
2. Add Site URL: `https://golfokay.co`
3. Add Redirect URLs:
   - `https://golfokay.co/auth/callback`
   - `https://*.vercel.app/auth/callback` (for previews)
4. Save changes

### 7. Configure Resend Email
1. Verify domain in Resend dashboard
2. Add DNS records (SPF, DKIM)
3. Test email delivery

## Post-Deployment Verification

### Health Checks
- [ ] Homepage loads correctly
- [ ] Chat interface works
- [ ] AI responses stream correctly
- [ ] Course carousel displays
- [ ] Google OAuth login works
- [ ] Save courses (requires auth)
- [ ] Submit inquiry form
- [ ] Email notifications received

### Performance Checks
- [ ] Run Lighthouse audit (target: 90+ performance score)
- [ ] Check Web Vitals in Vercel dashboard
- [ ] Test from Thailand/Southeast Asia location
- [ ] Verify image optimization

### Security Checks
- [ ] Check headers: https://securityheaders.com
- [ ] Verify HTTPS redirect works
- [ ] Test OAuth flow on production domain
- [ ] Verify API routes require auth where needed

## Monitoring & Analytics

### Vercel Analytics
- Built-in Web Vitals tracking
- Real-time performance monitoring
- Automatic deployment logs

### Error Tracking
- Vercel Logs: Real-time error monitoring
- Set up alerts for 5xx errors

### User Analytics (Optional - Phase 6)
- **Plausible** (recommended): Privacy-focused, GDPR-compliant
- **PostHog**: More features, user tracking, session replay

## Troubleshooting

### Build Fails
1. Check environment variables are set
2. Review build logs in Vercel dashboard
3. Test build locally: `npm run build`

### OAuth Not Working
1. Verify redirect URLs in Supabase
2. Check Site URL matches production domain
3. Clear browser cookies and try again

### Emails Not Sending
1. Verify RESEND_API_KEY is set
2. Check domain verification in Resend
3. Review DNS records (SPF, DKIM)

### Performance Issues
1. Check Vercel region (should be sin1)
2. Verify image optimization is working
3. Review Web Vitals in Vercel dashboard

## Next Steps (Phase 6)

### Image Optimization
- [ ] Set up Cloudinary account
- [ ] Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- [ ] Migrate images to Cloudinary
- [ ] Update image URLs in database

### Analytics
- [ ] Choose analytics provider (Plausible or PostHog)
- [ ] Set up account and get API key
- [ ] Add environment variables
- [ ] Verify tracking in dashboard

### Mobile Optimization
- [ ] Test on real devices (iOS/Android)
- [ ] Fix any mobile-specific issues
- [ ] Optimize for touch interactions

## Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase Auth Guide**: https://supabase.com/docs/guides/auth
- **Resend Setup**: https://resend.com/docs/introduction

## Support

For deployment issues:
1. Check Vercel build logs
2. Review DEPLOYMENT_CHECKLIST.md
3. Test locally with production build
4. Check environment variables

---

**Last Updated**: 2025-11-30
**Build Status**: ✅ PASSING
**Deployment Ready**: ✅ YES
