# Analytics Setup Guide

## Overview

Golf Okay uses **Plausible Analytics** (recommended) or **PostHog** for privacy-focused event tracking and conversion analytics.

**Provider comparison:**
- **Plausible** (default): Privacy-first, GDPR-compliant, no user tracking, simple setup
- **PostHog**: Feature-rich, user identification, session replay, feature flags

---

## Quick Start

### 1. Environment Variables

Add to `.env.local`:

```env
# Analytics Provider (optional - defaults to 'plausible')
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible  # or 'posthog' or 'none'

# Plausible (recommended)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=golfokay.co

# PostHog (alternative)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 2. Sign Up for Plausible

1. Go to [plausible.io](https://plausible.io)
2. Create account and add your domain: `golfokay.co`
3. Copy the domain to `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
4. Deploy - no additional setup required!

**That's it!** Plausible auto-tracks page views and custom events.

---

## Events Being Tracked

### Chat Interactions
```typescript
// Tracked in: src/hooks/useChat.ts
analytics.chatTurn(turnNumber, hasToolUse);      // Every chat turn
analytics.toolUsed('show_courses');              // Every AI tool usage
```

### Auth Conversions
```typescript
// Tracked in: src/components/generative-ui/AuthGateModal.tsx
analytics.authTrigger('save_course');            // When auth modal opens
analytics.authConversion('save_course', 'google'); // Successful sign-up
```

### Booking Flow
```typescript
// Tracked in: src/components/generative-ui/InquiryForm.tsx
analytics.inquirySubmitted({
  coursesCount: 3,
  days: 5,
  groupSize: 8
});
```

### Course Interactions
```typescript
// Tracked in: src/hooks/useSavedCourses.ts
analytics.courseSaved('alpine-golf-club');       // Course saved
analytics.courseUnsaved('alpine-golf-club');     // Course removed
```

### Itinerary Builder Steps
```typescript
// Tracked in: src/context/ItineraryContext.tsx
analytics.itineraryStepCompleted(1, 'region');   // Step 1: Region selected
analytics.itineraryStepCompleted(2, 'vibe');     // Step 2: Vibe selected
analytics.itineraryStepCompleted(3, 'dates');    // Step 3: Dates selected
analytics.itineraryStepCompleted(4, 'group_size'); // Step 4: Group size
```

### Additional Events (optional - add as needed)
```typescript
analytics.courseDetailViewed('alpine-golf-club');
analytics.courseCarouselViewed(5);
analytics.fleetViewed();
analytics.serviceViewed('transport');
analytics.suggestionClicked('Show me courses in Bangkok');
```

---

## Analytics API

### Core Functions

```typescript
import { analytics } from '@/lib/analytics';

// Track custom event
analytics.track('event_name', { property: 'value' });

// Predefined events (recommended)
analytics.chatTurn(turnNumber, hasToolUse);
analytics.toolUsed(toolName);
analytics.authConversion(trigger, method);
analytics.inquirySubmitted({ coursesCount, days, groupSize });
analytics.courseSaved(courseId);
analytics.itineraryStepCompleted(step, stepName);
```

### User Identification (PostHog only)

```typescript
// Identify user after sign-in
analytics.identify('user-id', {
  email: 'user@example.com',
  name: 'John Doe'
});

// Reset on logout
analytics.reset();
```

---

## Integration Points

### 1. Chat Hook
**File:** `src/hooks/useChat.ts`
- Tracks chat turns after streaming completes
- Extracts and tracks tool usage from AI responses

### 2. Auth Modal
**File:** `src/components/generative-ui/AuthGateModal.tsx`
- Tracks when auth modal is triggered (intent)
- Tracks successful conversions with trigger reason

### 3. Saved Courses
**File:** `src/hooks/useSavedCourses.ts`
- Tracks course save/unsave actions
- Only fires on successful API response

### 4. Inquiry Form
**File:** `src/components/generative-ui/InquiryForm.tsx`
- Tracks inquiry submissions with metadata
- Includes itinerary snapshot data

### 5. Itinerary Context
**File:** `src/context/ItineraryContext.tsx`
- Tracks each wizard step completion
- Fires on every step's setter method

### 6. Root Layout
**File:** `src/app/layout.tsx`
- Loads analytics scripts (Plausible/PostHog)
- Auto-tracks page views on route changes

---

## Viewing Analytics

### Plausible Dashboard

1. Login to [plausible.io/golfokay.co](https://plausible.io/golfokay.co)
2. View:
   - **Page views** - Auto-tracked
   - **Custom events** - Click "Goal Conversions"
   - **Funnels** - Set up conversion funnels
   - **Retention** - See returning visitors

### Key Metrics to Monitor

**Engagement:**
- `chat_turn` - Total chat interactions
- `tool_used` - Most popular AI tools
- `suggestion_clicked` - Pill click rate

**Conversion Funnel:**
1. Page view
2. `chat_turn` (engagement)
3. `auth_trigger` (intent signal)
4. `auth_conversion` (sign-up)
5. `inquiry_submitted` (booking)

**User Actions:**
- `course_saved` - Saved course rate
- `itinerary_step_completed` - Drop-off points
- `inquiry_submitted` - Final conversion

---

## Privacy & Compliance

### Plausible (Default)
- ✅ GDPR compliant by default
- ✅ No cookies, no personal data
- ✅ Anonymous visitor tracking
- ✅ No consent banner required
- ✅ Hosted in EU

### PostHog
- ⚠️ Requires cookie consent banner
- ⚠️ Stores user identifiers
- ⚠️ More powerful but less private
- ✅ Self-hosted option available

---

## Testing

### Local Development

```bash
# 1. Set env vars
echo "NEXT_PUBLIC_PLAUSIBLE_DOMAIN=localhost" >> .env.local
echo "NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible" >> .env.local

# 2. Start dev server
npm run dev

# 3. Open browser console
# Check for analytics events in Network tab (plausible.io/api/event)
```

### Browser Console Testing

```javascript
// Check if Plausible loaded
window.plausible

// Test custom event
window.plausible('test_event', { props: { source: 'manual' } })

// Check if PostHog loaded
window.posthog

// Test PostHog event
window.posthog.capture('test_event', { source: 'manual' })
```

---

## Troubleshooting

### Events not showing up

1. **Check browser console** for errors
2. **Verify env vars** are set and start with `NEXT_PUBLIC_`
3. **Check Network tab** for analytics API calls
4. **Wait 5-10 minutes** - Plausible batches events

### Script not loading

```typescript
// Check in AnalyticsProvider.tsx
console.log('Analytics provider:', process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER);
console.log('Plausible domain:', process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN);
```

### Events tracked twice

- Disable React StrictMode in development (causes double renders)
- Check for duplicate analytics imports

---

## Future Enhancements

### Server-Side Tracking

Currently all tracking is client-side. To add server-side:

```typescript
// src/lib/analytics.ts - implement trackServerEvent()
import { Plausible } from 'plausible-tracker';

const serverPlausible = Plausible({
  domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN!,
  apiHost: 'https://plausible.io',
});

export function trackServerEvent(event: string, props?: Record<string, unknown>) {
  serverPlausible.trackEvent(event, { props });
}
```

### Custom Dashboards

- Set up Goals in Plausible for key events
- Create custom funnels for conversion tracking
- Export data to Google Sheets for reporting

### A/B Testing (PostHog)

```typescript
// Check feature flag
if (posthog.isFeatureEnabled('new-pricing-page')) {
  // Show new version
}
```

---

## Cost Estimates

### Plausible
- **Starter:** $9/mo (10k pageviews)
- **Business:** $19/mo (100k pageviews)
- **Enterprise:** Custom pricing

### PostHog
- **Free:** 1M events/mo
- **Pro:** Pay-as-you-go ($0.00045/event after free tier)
- **Enterprise:** Custom pricing

---

## Additional Resources

- [Plausible Docs](https://plausible.io/docs)
- [PostHog Docs](https://posthog.com/docs)
- [Analytics Best Practices](https://plausible.io/blog/best-practices)
