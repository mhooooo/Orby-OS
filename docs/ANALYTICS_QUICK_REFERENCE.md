# Analytics Quick Reference

**For developers: Copy-paste snippets for common analytics tasks**

---

## Import

```typescript
import { analytics } from '@/lib/analytics';
```

---

## Common Events

### Chat & Tools
```typescript
// Track chat turn (auto-tracked in useChat)
analytics.chatTurn(turnNumber, hasToolUse);

// Track tool usage (auto-tracked in useChat)
analytics.toolUsed('show_courses');
```

### Auth
```typescript
// Track auth modal trigger (auto-tracked in AuthGateModal)
analytics.authTrigger('save_course');

// Track successful conversion (auto-tracked in AuthGateModal)
analytics.authConversion('save_course', 'google');
```

### User Actions
```typescript
// Track course save (auto-tracked in useSavedCourses)
analytics.courseSaved(courseId);
analytics.courseUnsaved(courseId);

// Track itinerary steps (auto-tracked in ItineraryContext)
analytics.itineraryStepCompleted(1, 'region');
analytics.itineraryStepCompleted(2, 'vibe');
```

### Booking
```typescript
// Track inquiry submission (auto-tracked in InquiryForm)
analytics.inquirySubmitted({
  coursesCount: 3,
  days: 5,
  groupSize: 8
});
```

---

## Optional Events (Not Yet Tracked)

### Course Interactions
```typescript
// Add to CourseDetailCard.tsx
analytics.courseDetailViewed(courseId);

// Add to CourseCarousel.tsx
analytics.courseCarouselViewed(coursesCount);
```

### Service Interactions
```typescript
// Add to ServiceBento.tsx
analytics.serviceViewed('transport');
analytics.serviceViewed('accommodation');
```

### Fleet Interactions
```typescript
// Add to FleetCard.tsx
analytics.fleetViewed();
```

### Suggestion Pills
```typescript
// Add to suggestion pill onClick handler
analytics.suggestionClicked('Show me courses in Bangkok');
```

---

## Custom Events

```typescript
// Generic tracking
analytics.track('custom_event', {
  property1: 'value1',
  property2: 123,
  property3: true
});
```

---

## User Identification (PostHog Only)

```typescript
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { analytics } from '@/lib/analytics';

function MyComponent() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      analytics.identify(user.id, {
        email: user.email,
        name: user.user_metadata?.full_name
      });
    } else {
      analytics.reset();
    }
  }, [user]);
}
```

---

## Environment Setup

### Development
```env
# .env.local
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=localhost  # or none for dev
```

### Production
```env
# .env.production
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=golfokay.co
```

---

## Testing in Browser Console

```javascript
// Check if loaded
window.plausible  // Plausible
window.posthog    // PostHog

// Fire test event
window.plausible('test_event', { props: { test: true } })
window.posthog.capture('test_event', { test: true })
```

---

## Debugging

```typescript
// Add to component
useEffect(() => {
  console.log('[Analytics] Event fired:', eventName, properties);
}, []);
```

---

## Common Patterns

### Track Button Click
```typescript
<button onClick={() => {
  analytics.track('button_clicked', { button: 'cta' });
  handleAction();
}}>
  Click Me
</button>
```

### Track Component Mount
```typescript
useEffect(() => {
  analytics.track('component_viewed', { component: 'CourseDetail' });
}, []);
```

### Track With Delay (for UX)
```typescript
const handleSave = async () => {
  setOptimisticState();

  try {
    await saveCourse();
    analytics.courseSaved(courseId); // Only after success
  } catch (error) {
    rollbackState();
  }
};
```

---

## What NOT to Track

- ❌ PII (emails, names, addresses)
- ❌ Passwords or auth tokens
- ❌ Payment information
- ❌ IP addresses (Plausible handles this)
- ❌ Excessive detail (every mouse move)

---

## Performance Tips

- ✅ Track after async operations complete
- ✅ Debounce rapid events (e.g., scroll)
- ✅ Use meaningful property names
- ✅ Keep property values simple (strings, numbers, booleans)
- ❌ Don't track in loops (aggregate first)
- ❌ Don't track sensitive data

---

## Quick Checklist for New Features

- [ ] Does this action indicate user intent? → Track it
- [ ] Is this a conversion point? → Track it
- [ ] Will this help understand drop-off? → Track it
- [ ] Does this involve PII? → Don't track it
- [ ] Is this high-frequency (>100/min)? → Debounce or aggregate

---

## Support

**Full Documentation:** `docs/ANALYTICS.md`
**Implementation Summary:** `docs/ANALYTICS_IMPLEMENTATION_SUMMARY.md`
**Code:** `src/lib/analytics.ts`
