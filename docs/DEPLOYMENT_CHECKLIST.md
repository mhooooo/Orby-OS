# Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables
Configure these in Vercel dashboard (Settings → Environment Variables):

#### Required (Production & Preview)
- [ ] `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com/
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - From Supabase project settings
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase project settings
- [ ] `RESEND_API_KEY` - Get from https://resend.com/api-keys

#### Optional (Phase 6 - Image Optimization & Analytics)
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - For Cloudinary image optimization
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` - For Plausible analytics (option 1)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` - For PostHog analytics (option 2)

### 2. Domain Configuration
- [ ] Primary domain: `golfokay.co`
- [ ] Configure DNS records to point to Vercel
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set up www redirect (optional): `www.golfokay.co` → `golfokay.co`

### 3. Supabase Configuration
- [ ] Add Vercel production URL to Supabase Auth Allowed URLs:
  - `https://golfokay.co`
  - `https://golfokay.co/auth/callback`
- [ ] Add Vercel preview URLs pattern:
  - `https://*.vercel.app`
  - `https://*.vercel.app/auth/callback`
- [ ] Verify Google OAuth credentials include production domain

### 4. Resend Email Configuration
- [ ] Verify domain in Resend dashboard
- [ ] Add SPF/DKIM DNS records for domain
- [ ] Test email delivery from production domain

## Build Verification

### Local Tests
- [ ] `npm run build` - Production build succeeds
- [ ] `npm run lint` - ESLint passes with no errors
- [ ] Test production build locally: `npm run start`

### Vercel Build Settings
- [ ] Framework Preset: Next.js
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`
- [ ] Node Version: 20.x (auto-detected from package.json)

## Deployment Steps

### Initial Deployment
1. [ ] Connect GitHub repository to Vercel
2. [ ] Configure environment variables
3. [ ] Deploy from `main` branch
4. [ ] Verify deployment preview URL works
5. [ ] Test all features:
   - [ ] Chat functionality
   - [ ] AI tool execution (courses, fleet, etc.)
   - [ ] Google OAuth login
   - [ ] Save courses (auth required)
   - [ ] Save itineraries (auth required)
   - [ ] Submit booking inquiry
   - [ ] Email notifications received

### Custom Domain Setup
1. [ ] Add custom domain in Vercel dashboard
2. [ ] Configure DNS records (provided by Vercel)
3. [ ] Wait for DNS propagation (can take up to 24 hours)
4. [ ] Verify HTTPS certificate is active
5. [ ] Test production domain end-to-end

## Post-Deployment

### Monitoring
- [ ] Set up Vercel Analytics (included free)
- [ ] Configure error tracking (Vercel Logs)
- [ ] Set up uptime monitoring (optional: UptimeRobot, Pingdom)

### Performance
- [ ] Run Lighthouse audit
- [ ] Check Web Vitals in Vercel dashboard
- [ ] Verify image optimization is working
- [ ] Test from target region (Thailand/Southeast Asia)

### Security
- [ ] Verify security headers are set (check with securityheaders.com)
- [ ] Test OAuth flow on production domain
- [ ] Verify API routes require authentication where needed
- [ ] Review Supabase RLS policies

## Rollback Plan
If issues occur:
1. [ ] Revert to previous deployment in Vercel dashboard
2. [ ] Check error logs in Vercel Functions
3. [ ] Verify environment variables are set correctly
4. [ ] Test preview deployment before promoting to production

## Region Configuration
- Primary region: `sin1` (Singapore) - Configured in `vercel.json`
- Optimized for Thailand users with low latency to Southeast Asia

## Continuous Deployment
- [ ] Set up automatic deployments from `main` branch
- [ ] Configure preview deployments for pull requests
- [ ] Set up branch protection rules in GitHub (optional)

## Notes
- Preview deployments are created automatically for all branches
- Production deployment only happens on `main` branch
- Environment variables can be scoped to Production, Preview, or Development
- Vercel Edge Network provides global CDN for static assets
