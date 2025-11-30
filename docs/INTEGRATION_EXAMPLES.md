# Error Boundary & Toast Integration Examples

This document demonstrates how to use the ErrorBoundary and Toast system in the Golf Okay application.

---

## ErrorBoundary Integration

The ErrorBoundary is already integrated in `src/components/chat/Message.tsx` and wraps all generative UI components automatically.

### Manual Usage (Optional)

```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Basic usage
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary
  fallback={
    <div className="p-4 text-center">
      <p>Oops! Something went wrong with this component.</p>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>

// With error handler and retry
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to analytics or error tracking service
    console.error('Component error:', error, errorInfo);
  }}
  onRetry={() => {
    // Reload component or reset state
    window.location.reload();
  }}
>
  <YourComponent />
</ErrorBoundary>
```

---

## Toast System Integration

### 1. Basic Usage

```tsx
'use client';

import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast({
      type: 'success',
      message: 'Operation completed successfully!',
    });
  };

  const handleError = () => {
    showToast({
      type: 'error',
      message: 'Something went wrong. Please try again.',
    });
  };

  const handleWarning = () => {
    showToast({
      type: 'warning',
      message: 'Please sign in to continue.',
    });
  };

  const handleInfo = () => {
    showToast({
      type: 'info',
      message: 'Checking availability...',
      duration: 3000, // Custom duration in ms
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### 2. Integration with useSavedCourses Hook

**Before:**
```tsx
// src/hooks/useSavedCourses.ts
const saveCourse = async (courseId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/saved-courses', {
      method: 'POST',
      // ...
    });
    if (!response.ok) {
      throw new Error('Failed to save course');
    }
    return true;
  } catch (err) {
    console.error('Error saving course:', err);
    return false;
  }
};
```

**After:**
```tsx
// src/hooks/useSavedCourses.ts
import { useToast } from './useToast';

export function useSavedCourses() {
  const { showToast } = useToast();

  const saveCourse = async (courseId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/saved-courses', {
        method: 'POST',
        // ...
      });
      if (!response.ok) {
        throw new Error('Failed to save course');
      }

      // Show success toast
      showToast({
        type: 'success',
        message: 'Course saved successfully!',
      });

      return true;
    } catch (err) {
      console.error('Error saving course:', err);

      // Show error toast
      showToast({
        type: 'error',
        message: 'Failed to save course. Please try again.',
      });

      return false;
    }
  };

  const unsaveCourse = async (courseId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/saved-courses', {
        method: 'DELETE',
        // ...
      });
      if (!response.ok) {
        throw new Error('Failed to unsave course');
      }

      showToast({
        type: 'info',
        message: 'Course removed from saved.',
      });

      return true;
    } catch (err) {
      console.error('Error unsaving course:', err);

      showToast({
        type: 'error',
        message: 'Failed to remove course. Please try again.',
      });

      return false;
    }
  };

  // ... rest of hook
}
```

### 3. Integration with InquiryForm

**Example:**
```tsx
// src/components/generative-ui/InquiryForm.tsx
import { useToast } from '@/hooks/useToast';

export default function InquiryForm({ onSuccess, onClose }: InquiryFormProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      // Show success toast
      showToast({
        type: 'success',
        message: 'Inquiry submitted! We&apos;ll be in touch soon.',
      });

      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error('Error submitting inquiry:', err);

      // Show error toast
      showToast({
        type: 'error',
        message: 'Failed to submit inquiry. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of component
}
```

### 4. Integration with API Routes

**Example:**
```tsx
// In any component making API calls
const { showToast } = useToast();

const fetchData = async () => {
  try {
    const response = await fetch('/api/courses');

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    const data = await response.json();
    return data;
  } catch (err) {
    // Show error toast for network/API errors
    showToast({
      type: 'error',
      message: 'Unable to load courses. Please check your connection.',
    });
    throw err;
  }
};
```

### 5. Toast Types Reference

```tsx
// Success - Green (#22C55E)
showToast({
  type: 'success',
  message: 'Course saved successfully!',
});

// Error - Red (#FF3B3B)
showToast({
  type: 'error',
  message: 'Failed to save course. Please try again.',
});

// Warning - Yellow (#FBBF24)
showToast({
  type: 'warning',
  message: 'You have unsaved changes.',
});

// Info - Cyan (#00D4FF)
showToast({
  type: 'info',
  message: 'Checking availability...',
  duration: 3000, // Optional: custom duration (default 5000ms)
});
```

---

## Common Integration Points

### High Priority (Implement First)

1. **useSavedCourses Hook** - Save/unsave course actions
2. **useItineraryDrafts Hook** - Save/delete itinerary actions
3. **InquiryForm** - Submission success/error
4. **CourseCarousel** - Save course from carousel
5. **CourseDetailCard** - Save course from detail view

### Medium Priority

6. **Auth actions** - Sign in/out success/error
7. **API error handling** - Network failures, timeout
8. **Form validation** - Invalid inputs

### Low Priority

9. **Info toasts** - Loading states, background processes
10. **Warning toasts** - Unsaved changes, confirmations

---

## Best Practices

1. **Use appropriate toast types:**
   - `success` - Actions completed successfully
   - `error` - Failed operations, network errors
   - `warning` - Attention needed, potential issues
   - `info` - Background processes, status updates

2. **Keep messages concise:**
   - Good: "Course saved!"
   - Bad: "Your course has been successfully saved to your saved courses list."

3. **Use action-oriented language:**
   - Good: "Failed to save. Please try again."
   - Bad: "An error occurred."

4. **Don't spam toasts:**
   - Avoid showing toasts for every minor action
   - Combine related updates when possible

5. **Custom durations:**
   - Short (3s) for info/success
   - Standard (5s) for most messages
   - Longer (7s) for important errors

---

## Testing Toasts

```tsx
// Create a test component to verify toast system
function ToastTest() {
  const { showToast } = useToast();

  return (
    <div className="p-8 space-y-4">
      <h2>Toast System Test</h2>
      <button
        onClick={() => showToast({ type: 'success', message: 'Success toast!' })}
        className="px-4 py-2 bg-green-500 rounded"
      >
        Test Success
      </button>
      <button
        onClick={() => showToast({ type: 'error', message: 'Error toast!' })}
        className="px-4 py-2 bg-red-500 rounded"
      >
        Test Error
      </button>
      <button
        onClick={() => showToast({ type: 'warning', message: 'Warning toast!' })}
        className="px-4 py-2 bg-yellow-500 rounded"
      >
        Test Warning
      </button>
      <button
        onClick={() => showToast({ type: 'info', message: 'Info toast!' })}
        className="px-4 py-2 bg-blue-500 rounded"
      >
        Test Info
      </button>
    </div>
  );
}
```
