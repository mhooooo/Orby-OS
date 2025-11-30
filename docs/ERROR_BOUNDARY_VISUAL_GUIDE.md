# Error Boundary & Toast System - Visual Guide

**Phase 6 - Polish & Launch**

---

## ErrorBoundary Component

### Default Fallback UI

```
┌─────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════╗  │
│  ║                                                   ║  │
│  ║  ┌─────────┐   ┌─────────────────────────────┐   ║  │
│  ║  │         │   │ Something went wrong        │   ║  │
│  ║  │    ⚠    │   │                             │   ║  │
│  ║  │         │   │ We encountered an error     │   ║  │
│  ║  └─────────┘   │ while rendering this        │   ║  │
│  ║  (Error Icon)  │ component. Please try again.│   ║  │
│  ║                │                             │   ║  │
│  ║                │  ┌──────────────┐           │   ║  │
│  ║                │  │  Try Again   │ (Orange)  │   ║  │
│  ║                │  └──────────────┘           │   ║  │
│  ║                └─────────────────────────────┘   ║  │
│  ║                                                   ║  │
│  ║  Dev Mode Only:                                  ║  │
│  ║  ┌────────────────────────────────────────────┐  ║  │
│  ║  │ Error: Cannot read property 'x' of null   │  ║  │
│  ║  │                                            │  ║  │
│  ║  │ ▸ Component Stack (click to expand)       │  ║  │
│  ║  └────────────────────────────────────────────┘  ║  │
│  ╚═══════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────┘

Colors:
- Background: #1E1F20 (dark card)
- Border: Red with opacity (#FF3B3B/20)
- Icon: Red (#FF3B3B)
- Icon Background: Red with opacity (#FF3B3B/10)
- Text: Gray-100 (heading), Gray-400 (body)
- Button: Orange (#FF6B35)
```

### Usage in Chat

```
User Message: "Show me courses in Bangkok"

AI Response: "Here are some great courses..."

┌─────────────────────────────────────────────────────────┐
│  ErrorBoundary                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ CourseCarousel (if error occurs, shows fallback)  │  │
│  │                                                   │  │
│  │  [Course 1]  [Course 2]  [Course 3]  [Course 4]  │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

If CourseCarousel throws an error:
┌─────────────────────────────────────────────────────────┐
│  ErrorBoundary                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ⚠  Something went wrong                          │  │
│  │                                                   │  │
│  │  [Try Again]                                      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Toast System

### Toast Types

#### Success Toast (Green)
```
┌────────────────────────────────────────────┐
│  ✓  Course saved successfully!         ×  │
│  ═══════════════════════════════════════  │
│  ████████████████░░░░░░░░ (progress bar)  │
└────────────────────────────────────────────┘

Icon: Checkmark in circle (green)
Border: Green with opacity
Background: Dark card (#1E1F20)
Progress bar: Green gradient
```

#### Error Toast (Red)
```
┌────────────────────────────────────────────┐
│  ✕  Failed to save course. Try again.  ×  │
│  ═══════════════════════════════════════  │
│  ████████████████░░░░░░░░ (progress bar)  │
└────────────────────────────────────────────┘

Icon: X in circle (red #FF3B3B)
Border: Red with opacity
Background: Dark card (#1E1F20)
Progress bar: Red gradient
```

#### Warning Toast (Yellow)
```
┌────────────────────────────────────────────┐
│  ⚠  Please sign in to continue.        ×  │
│  ═══════════════════════════════════════  │
│  ████████████████░░░░░░░░ (progress bar)  │
└────────────────────────────────────────────┘

Icon: Warning triangle (yellow #FBBF24)
Border: Yellow with opacity
Background: Dark card (#1E1F20)
Progress bar: Yellow gradient
```

#### Info Toast (Cyan)
```
┌────────────────────────────────────────────┐
│  ℹ  Checking availability...           ×  │
│  ═══════════════════════════════════════  │
│  ████████████████░░░░░░░░ (progress bar)  │
└────────────────────────────────────────────┘

Icon: Info circle (cyan #00D4FF)
Border: Cyan with opacity
Background: Dark card (#1E1F20)
Progress bar: Cyan gradient
```

### Toast Positioning

#### Desktop Layout
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Main App Content                                   │
│                                                      │
│                                                      │
│                                    ┌──────────────┐ │
│                                    │ Toast 1      │ │
│                                    └──────────────┘ │
│                                    ┌──────────────┐ │
│                                    │ Toast 2      │ │
│                                    └──────────────┘ │
└──────────────────────────────────────────────────────┘
                                     Bottom-right corner
                                     Gap: 24px from edges
```

#### Mobile Layout
```
┌────────────────────────┐
│                        │
│  Main App Content      │
│                        │
│                        │
│  ┌──────────────────┐  │
│  │ Toast 1          │  │
│  └──────────────────┘  │
│  ┌──────────────────┐  │
│  │ Toast 2          │  │
│  └──────────────────┘  │
└────────────────────────┘
 Bottom-center, full width
 Gap: 16px from edges
```

### Toast Stack (Multiple Toasts)
```
Desktop:                          Mobile:
┌──────────────┐                  ┌──────────────────┐
│ Toast 1      │                  │ Toast 1          │
└──────────────┘                  └──────────────────┘
┌──────────────┐                  ┌──────────────────┐
│ Toast 2      │                  │ Toast 2          │
└──────────────┘                  └──────────────────┘
┌──────────────┐                  ┌──────────────────┐
│ Toast 3      │                  │ Toast 3          │
└──────────────┘                  └──────────────────┘

Gap between: 12px                Gap between: 12px
Max width: 384px                 Max width: calc(100% - 32px)
```

### Toast Animation

#### Enter Animation
```
Frame 1: opacity: 0, translateX: 32px (off-screen right)
         ┌─────────────────┐
         │                 │
         └─────────────────┘    (invisible, right)

Frame 2: opacity: 0.5, translateX: 16px (sliding in)
         ┌─────────────────┐
         │                 │
         └─────────────────┘    (fading in, moving left)

Frame 3: opacity: 1, translateX: 0 (final position)
         ┌─────────────────┐
         │ Toast message   │
         └─────────────────┘    (fully visible)

Duration: 300ms
Easing: ease-out
```

#### Exit Animation
```
Frame 1: opacity: 1, translateX: 0 (visible)
         ┌─────────────────┐
         │ Toast message   │
         └─────────────────┘

Frame 2: opacity: 0.5, translateX: 16px (sliding out)
         ┌─────────────────┐
         │                 │
         └─────────────────┘    (fading out, moving right)

Frame 3: opacity: 0, translateX: 32px (off-screen)
         ┌─────────────────┐
         │                 │
         └─────────────────┘    (invisible)

Duration: 300ms
Easing: ease-out
```

#### Progress Bar Animation
```
Time: 0s                          Time: 2.5s                      Time: 5s
████████████████████████████      ██████████████░░░░░░░░░░░░      ░░░░░░░░░░░░░░░░░░░░░░░░
(100% width)                      (50% width)                     (0% width)

Animation: Linear from 100% to 0% over toast duration
Color: Matches toast type (green/red/yellow/cyan with opacity)
```

---

## Component Integration Flow

### Save Course Example

```
User Interaction Flow:
┌─────────────────────────────────────────────────────────┐
│ 1. User clicks "Save Course" button on CourseCard      │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. CourseCard calls handleSave() → useSavedCourses      │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. useSavedCourses calls showToast({ type: 'success'}) │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Toast appears in bottom-right (desktop)              │
│                                                         │
│                   ┌──────────────────────────┐          │
│                   │ ✓ Course saved!       × │          │
│                   │ ═══════════════════════ │          │
│                   │ ████████████░░░░░░░░░░░ │          │
│                   └──────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Toast auto-dismisses after 5 seconds                │
└─────────────────────────────────────────────────────────┘
```

### Component Error Example

```
Error Flow:
┌─────────────────────────────────────────────────────────┐
│ 1. CourseCarousel component throws error during render │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. ErrorBoundary catches error                          │
│    - Logs error to console (dev mode)                   │
│    - Calls onError callback if provided                 │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. ErrorBoundary renders fallback UI                    │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ⚠  Something went wrong                          │  │
│  │                                                   │  │
│  │  We encountered an error while rendering this    │  │
│  │  component. Please try again.                    │  │
│  │                                                   │  │
│  │  [Try Again]                                      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 4. User clicks "Try Again" → boundary resets            │
│    → Component attempts to re-render                    │
└─────────────────────────────────────────────────────────┘
```

---

## State Diagrams

### Toast Lifecycle

```
┌─────────────┐
│   CREATED   │ showToast() called
│  (in queue) │
└──────┬──────┘
       │
       │ Added to queue
       │
       ▼
┌─────────────┐
│  RENDERED   │ Toast component mounts
│  (visible)  │ Enter animation plays
└──────┬──────┘
       │
       │ Auto-dismiss timer starts
       │
       ▼
┌─────────────┐
│   ACTIVE    │ Progress bar animates
│  (counting) │ User can dismiss manually
└──────┬──────┘
       │
       │ Timer expires OR user clicks X
       │
       ▼
┌─────────────┐
│   EXITING   │ Exit animation plays
│  (fading)   │ opacity: 1 → 0
└──────┬──────┘
       │
       │ Animation complete
       │
       ▼
┌─────────────┐
│   REMOVED   │ Removed from queue
│  (unmount)  │
└─────────────┘
```

### ErrorBoundary Lifecycle

```
┌─────────────┐
│   NORMAL    │ No errors, children render
│   (idle)    │
└──────┬──────┘
       │
       │ Child component throws error
       │
       ▼
┌─────────────┐
│   ERROR     │ getDerivedStateFromError() called
│  (caught)   │ hasError = true
└──────┬──────┘
       │
       │ Component re-renders
       │
       ▼
┌─────────────┐
│  FALLBACK   │ Fallback UI displayed
│ (displayed) │ onError callback invoked
└──────┬──────┘
       │
       │ User clicks "Try Again" OR parent re-renders
       │
       ▼
┌─────────────┐
│   RESET     │ hasError = false
│  (recover)  │ error = null
└──────┬──────┘
       │
       │ Component re-renders
       │
       ▼
┌─────────────┐
│   NORMAL    │ Children attempt to render again
│   (retry)   │
└─────────────┘
```

---

## Accessibility Features

### ErrorBoundary

```html
<!-- Semantic structure -->
<div role="alert" aria-live="assertive">
  <div aria-label="Error icon">⚠</div>
  <h3>Something went wrong</h3>
  <p>We encountered an error while rendering this component.</p>
  <button aria-label="Retry loading component">Try Again</button>
</div>
```

### Toast

```html
<!-- ARIA live region -->
<div role="alert" aria-live="polite" aria-atomic="true">
  <div aria-label="Success">✓</div>
  <p>Course saved successfully!</p>
  <button aria-label="Dismiss notification">×</button>
</div>

<!-- Progress bar -->
<div role="progressbar"
     aria-valuenow="50"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Time remaining"></div>
```

---

## Color Reference

### Color Palette

```
Background Colors:
┌────────┐
│#131314 │ App Background (darkest)
└────────┘

┌────────┐
│#1E1F20 │ Card Background (cards, toasts, error boundary)
└────────┘

┌────────┐
│#282A2C │ Hover State
└────────┘

Accent Colors:
┌────────┐
│#FF6B35 │ Bright Orange (retry button, highlights)
└────────┘

┌────────┐
│#00D4FF │ Cyan (info toast, links)
└────────┘

┌────────┐
│#FF3B3B │ Red (error toast, error boundary)
└────────┘

┌────────┐
│#FBBF24 │ Yellow (warning toast)
└────────┘

┌────────┐
│#22C55E │ Green (success toast)
└────────┘

Text Colors:
┌────────┐
│#F9FAFB │ Gray-100 (headings)
└────────┘

┌────────┐
│#9CA3AF │ Gray-400 (body text)
└────────┘

┌────────┐
│#6B7280 │ Gray-500 (muted text)
└────────┘
```

---

## Responsive Breakpoints

```
Mobile (< 640px):
- Toast: full width (minus 32px padding)
- Toast position: bottom-center
- Error boundary: full width cards

Tablet (640px - 1024px):
- Toast: max-width 384px
- Toast position: bottom-right
- Error boundary: max-width 600px

Desktop (> 1024px):
- Toast: max-width 384px
- Toast position: bottom-right
- Error boundary: max-width 800px
```

---

## Implementation Checklist

### Visual Verification

- [ ] ErrorBoundary card has correct background (#1E1F20)
- [ ] ErrorBoundary card has rounded corners (16px)
- [ ] Error icon is red (#FF3B3B) with light background
- [ ] Retry button is orange (#FF6B35) with rounded corners
- [ ] Dev mode error details are collapsible
- [ ] Success toast has green icon and border
- [ ] Error toast has red icon and border
- [ ] Warning toast has yellow icon and border
- [ ] Info toast has cyan icon and border
- [ ] Toast progress bar matches toast type color
- [ ] Toast X button is visible and clickable
- [ ] Multiple toasts stack with 12px gap
- [ ] Desktop: toasts appear bottom-right
- [ ] Mobile: toasts appear bottom-center, full width
- [ ] Toast animations are smooth (no jank)

### Functional Verification

- [ ] ErrorBoundary catches component errors
- [ ] ErrorBoundary prevents app crash
- [ ] Retry button resets error state
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Toast progress bar animates correctly
- [ ] Manual dismiss (X) removes toast immediately
- [ ] Multiple toasts can be active simultaneously
- [ ] Toast enter/exit animations work
- [ ] Custom toast duration works
- [ ] All toast types display correctly

---

## Quick Reference Card

```
╔═══════════════════════════════════════════════════════════╗
║  ERROR BOUNDARY & TOAST - QUICK REFERENCE                ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  IMPORT                                                   ║
║  import { ErrorBoundary } from '@/components/ui/Error...' ║
║  import { useToast } from '@/hooks/useToast'              ║
║                                                           ║
║  USAGE                                                    ║
║  <ErrorBoundary>                                          ║
║    <YourComponent />                                      ║
║  </ErrorBoundary>                                         ║
║                                                           ║
║  const { showToast } = useToast();                        ║
║  showToast({ type: 'success', message: 'Saved!' });      ║
║                                                           ║
║  TOAST TYPES                                              ║
║  success → Green   ✓  "Course saved!"                     ║
║  error   → Red     ✕  "Failed to save"                    ║
║  warning → Yellow  ⚠  "Please sign in"                    ║
║  info    → Cyan    ℹ  "Loading..."                        ║
║                                                           ║
║  COLORS                                                   ║
║  Background: #1E1F20                                      ║
║  Success: #22C55E   Error: #FF3B3B                        ║
║  Warning: #FBBF24   Info: #00D4FF                         ║
║  Retry: #FF6B35                                           ║
║                                                           ║
║  POSITIONING                                              ║
║  Desktop: bottom-right   Mobile: bottom-center            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```
