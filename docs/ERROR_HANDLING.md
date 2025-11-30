# Error Handling & Toast Notifications

**Status:** Implemented in Phase 6
**Last Updated:** 2025-11-30

---

## Overview

Golf Okay uses a two-tier error handling system:

1. **ErrorBoundary** - Catches React component errors and prevents full app crashes
2. **Toast System** - User-facing notifications for actions, errors, and status updates

---

## Architecture

### Component Hierarchy

```
ToastProvider (app/page.tsx)
├── ChatProvider
│   ├── Components...
│   └── Message
│       └── ErrorBoundary (wraps each generative UI component)
│           └── Generative UI Components
│               └── useToast() for user feedback
└── ToastContainer (rendered by ToastProvider)
```

---

## ErrorBoundary

### Purpose
- Catch rendering errors in React components
- Prevent errors from crashing the entire app
- Provide graceful fallback UI
- Log errors for debugging (dev mode) and tracking (future)

### Implementation

**File:** `/src/components/ui/ErrorBoundary.tsx`

Class component (required for React error boundaries) that catches errors in child components.

**Features:**
- Default fallback UI with error icon and retry button
- Custom fallback support via props
- Dev-mode error details (error message + component stack)
- Optional error callback for logging
- Optional retry callback for recovery

### Integration

**Automatic:** All generative UI components in chat messages are automatically wrapped.

**Location:** `src/components/chat/Message.tsx` - `renderToolComponent()` function

**Wrapped Components:**
- CourseCarousel
- CourseDetailCard
- FleetCard
- AboutCard
- All Pickers (Region, Vibe, Transport, GroupSize, Days)
- TourShowcase
- ServiceBento
- AuthGateModal
- InquiryForm

### API

```tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRetry?: () => void;
}
```

**Props:**
- `children` - Components to wrap
- `fallback` - Custom error UI (optional)
- `onError` - Error callback for logging (optional)
- `onRetry` - Retry callback, defaults to resetting boundary state (optional)

**Default Fallback UI:**
- Dark card (`#1E1F20`)
- Red error icon and border (`#FF3B3B`)
- "Something went wrong" heading
- Descriptive error message
- Orange retry button (`#FF6B35`)
- Dev-mode error details (collapsible)

---

## Toast System

### Purpose
- Provide immediate user feedback for actions
- Display errors, warnings, and info messages
- Non-blocking notifications with auto-dismiss
- Mobile-responsive positioning

### Implementation

**Files:**
- `/src/components/ui/Toast.tsx` - Toast component and container
- `/src/context/ToastContext.tsx` - Toast state management
- `/src/hooks/useToast.ts` - Hook for triggering toasts

### Toast Types

| Type | Color | Use Case | Examples |
|------|-------|----------|----------|
| **success** | Green | Actions completed | "Course saved!", "Inquiry submitted!" |
| **error** | Red (#FF3B3B) | Failed operations | "Failed to save course", "Network error" |
| **warning** | Yellow (#FBBF24) | Attention needed | "Please sign in", "Unsaved changes" |
| **info** | Cyan (#00D4FF) | Status updates | "Checking availability...", "Loading..." |

### Features

**Visual Design:**
- Dark background (`#1E1F20`)
- Colored icon and border per type
- Dismiss button (X)
- Animated progress bar (shows remaining time)
- Enter/exit animations

**Behavior:**
- Auto-dismiss after 5 seconds (default)
- Custom duration support (1-10 seconds recommended)
- Stack multiple toasts
- Manual dismiss via X button

**Positioning:**
- Desktop: Bottom-right corner
- Mobile: Bottom-center (full width)

### API

```tsx
const { showToast, dismissToast, dismissAll } = useToast();

// Show toast
showToast({
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  duration?: number, // milliseconds (default: 5000)
});

// Dismiss specific toast
dismissToast(toastId);

// Dismiss all toasts
dismissAll();
```

### Usage Examples

```tsx
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { showToast } = useToast();

  // Success
  const handleSave = async () => {
    try {
      await saveCourse(courseId);
      showToast({
        type: 'success',
        message: 'Course saved successfully!',
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Failed to save course. Please try again.',
      });
    }
  };

  // Warning
  const handleAuthRequired = () => {
    showToast({
      type: 'warning',
      message: 'Please sign in to continue.',
    });
  };

  // Info with custom duration
  const handleCheck = () => {
    showToast({
      type: 'info',
      message: 'Checking availability...',
      duration: 3000,
    });
  };

  return <button onClick={handleSave}>Save Course</button>;
}
```

---

## Integration Points

### Priority 1 - User Actions (Implement First)

1. **useSavedCourses** - `/src/hooks/useSavedCourses.ts`
   - Success: "Course saved!"
   - Error: "Failed to save course"
   - Info: "Course removed from saved"

2. **useItineraryDrafts** - `/src/hooks/useItineraryDrafts.ts`
   - Success: "Itinerary saved!"
   - Error: "Failed to save itinerary"
   - Info: "Itinerary deleted"

3. **InquiryForm** - `/src/components/generative-ui/InquiryForm.tsx`
   - Success: "Inquiry submitted! We'll be in touch soon."
   - Error: "Failed to submit inquiry. Please try again."

4. **CourseCarousel** - `/src/components/generative-ui/CourseCarousel.tsx`
   - Success: "Course saved!"
   - Warning: "Please sign in to save courses"

5. **CourseDetailCard** - `/src/components/generative-ui/CourseDetailCard.tsx`
   - Success: "Course saved!"
   - Warning: "Please sign in to save courses"

### Priority 2 - Auth & API

6. **useAuth** - `/src/hooks/useAuth.ts`
   - Success: "Signed in successfully!"
   - Info: "Signed out"
   - Error: "Sign in failed"

7. **API Error Handling** - All API calls
   - Error: "Network error. Please check your connection."
   - Error: "Request timeout. Please try again."

8. **Form Validation**
   - Warning: "Please fill in all required fields"
   - Error: "Invalid email address"

### Priority 3 - Info & Background

9. **Loading States**
   - Info: "Loading courses..."
   - Info: "Updating itinerary..."

10. **Confirmations**
    - Warning: "You have unsaved changes"
    - Info: "Changes saved automatically"

---

## Best Practices

### Toast Messages

**DO:**
- Keep messages concise (< 60 characters)
- Use action-oriented language
- Provide context and next steps
- Use appropriate toast type

**DON'T:**
- Show toasts for every minor action
- Use generic error messages
- Stack too many toasts (max 3-4 visible)
- Use toasts for critical errors (use modals instead)

### Error Boundaries

**DO:**
- Wrap generative UI components
- Provide retry functionality
- Log errors in production
- Show helpful error messages

**DON'T:**
- Wrap the entire app (too broad)
- Show technical error details to users
- Suppress errors without logging
- Use for expected error states (use conditional rendering)

---

## Styling

### Colors

```css
/* Background */
--toast-bg: #1E1F20
--error-boundary-bg: #1E1F20

/* Success */
--success: #22C55E (green-500)

/* Error */
--error: #FF3B3B

/* Warning */
--warning: #FBBF24

/* Info */
--info: #00D4FF

/* Retry Button */
--retry: #FF6B35
```

### Spacing & Sizing

```css
/* Toast */
padding: 1rem (16px)
border-radius: 1rem (16px)
max-width: 24rem (384px)
gap: 0.75rem (12px)

/* Error Boundary */
padding: 1.5rem (24px)
border-radius: 1rem (16px)
icon-size: 3rem (48px)
```

---

## Future Enhancements

### Phase 7+

1. **Error Tracking Integration**
   - Sentry or similar service
   - Log errors with context
   - User session replay
   - Error rate monitoring

2. **Toast Queue Management**
   - Priority levels
   - Duplicate detection
   - Max queue size
   - Grouped notifications

3. **Offline Support**
   - Queue actions when offline
   - Show offline indicator
   - Retry on reconnect
   - Sync status toasts

4. **Enhanced Error Boundaries**
   - Different fallbacks per component type
   - Error recovery strategies
   - Partial page recovery
   - Error metrics tracking

5. **Accessibility**
   - Screen reader announcements
   - Keyboard navigation
   - High contrast mode
   - Reduced motion support

---

## Testing

### Manual Testing

See `/INTEGRATION_EXAMPLES.md` for test component code.

**Test Scenarios:**
1. Trigger each toast type
2. Stack multiple toasts
3. Test auto-dismiss timing
4. Test manual dismiss
5. Test mobile responsive positioning
6. Force component error to test ErrorBoundary
7. Test retry functionality

### Automated Testing (Future)

```typescript
// Playwright test example
test('shows success toast on course save', async ({ page }) => {
  await page.click('[data-testid="save-course-btn"]');
  await expect(page.locator('[role="alert"]')).toContainText('Course saved!');
});

test('error boundary catches component error', async ({ page }) => {
  // Force error in component
  await page.evaluate(() => {
    throw new Error('Test error');
  });
  await expect(page.locator('.error-boundary')).toBeVisible();
  await expect(page.locator('text=Something went wrong')).toBeVisible();
});
```

---

## Troubleshooting

### Toasts Not Appearing

1. Verify ToastProvider is wrapping app in `src/app/page.tsx`
2. Check useToast is called inside component (not outside)
3. Verify toast message is not empty
4. Check browser console for errors

### Error Boundary Not Catching Errors

1. Ensure error occurs during render (not in event handler)
2. Check ErrorBoundary wraps the failing component
3. Verify error is not caught by inner try/catch
4. Check browser console for logged errors

### TypeScript Errors

1. Import from correct paths:
   - `import { ErrorBoundary } from '@/components/ui/ErrorBoundary'`
   - `import { useToast } from '@/hooks/useToast'`
2. Ensure ToastContext is provided
3. Check toast type is valid enum value

---

## Files Reference

```
src/
├── components/
│   ├── ui/
│   │   ├── ErrorBoundary.tsx  # Error boundary component
│   │   └── Toast.tsx          # Toast component & container
│   └── chat/
│       └── Message.tsx        # Integrates ErrorBoundary
├── context/
│   └── ToastContext.tsx       # Toast state management
├── hooks/
│   └── useToast.ts            # Toast hook
└── app/
    └── page.tsx               # Wraps app with ToastProvider

docs/
└── ERROR_HANDLING.md          # This file

INTEGRATION_EXAMPLES.md        # Code examples
```
