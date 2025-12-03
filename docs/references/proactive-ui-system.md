# Proactive UI System Design

Central orchestration system for non-intrusive, helpful nudges that improve UX without annoying users.

---

## 1. Purpose

The Proactive UI system delivers contextual suggestions and prompts to users at the right moment, helping them build better golf trips while respecting their attention and autonomy.

**Goals:**
- Help users discover features they might miss
- Reduce friction in the trip planning journey
- Collect information progressively (dates, group size, preferences)
- Never interrupt active engagement

**Non-Goals:**
- Maximize impressions or conversions at any cost
- Create urgency where none exists
- Pressure users into actions

---

## 2. Core Rules

### 2.1 Session Limits
- **Max 1 popup per session** - Popups are high-interruption; use sparingly
- **2 min minimum between any nudges** - Global cooldown prevents fatigue
- **Dismiss = 10 min cool off** - Respect explicit dismissal

### 2.2 Priority Order
When multiple components want to show, follow this hierarchy:

| Priority | Component | Reason |
|----------|-----------|--------|
| 1 (Highest) | DateIntentModal | Dates are critical for availability |
| 2 | GroupSizeNudge | Affects pricing and logistics |
| 3 | TripBuilderPrompt | Natural progression after browsing |
| 4 | SuggestionPills | Low-priority recommendations |
| 5 (Lowest) | WarningToasts | Informational, non-blocking |

### 2.3 Never Show When
- User is actively typing (input focused)
- User is mid-scroll (detect scroll velocity)
- User just interacted (<3 seconds ago)
- Same type was dismissed this session
- Data is already known (don't ask what we have)

### 2.4 Intelligence Rules
- Don't ask for group size if we already know it
- Don't ask for dates if dates are set
- Don't suggest trip builder if user already started one
- Context-aware: show region picker after viewing multiple courses in same region

---

## 3. Component Types

### 3.1 Popups (High Interruption)
**Examples:** DateIntentModal, GroupSizeNudge

**Characteristics:**
- Requires orchestrator approval
- Counts against session popup limit
- Full focus trap and backdrop
- Always has clear dismiss action

**Trigger Conditions:**
- User idle for 30+ seconds
- User completed a micro-action (saved course, viewed 3+ items)
- Never during active input

### 3.2 Floating Pills (Medium Interruption)
**Examples:** TripBuilderPrompt

**Characteristics:**
- Requires orchestrator approval
- Does NOT count against popup limit
- Positioned at edge of screen
- Can be ignored without explicit dismiss

**Trigger Conditions:**
- User has viewed 3+ courses
- User has spent 60+ seconds on site
- No active wizard in progress

### 3.3 Inline Badges (No Interruption)
**Examples:** AvailabilityBadge

**Characteristics:**
- NO orchestrator approval needed
- Render wherever data is available
- Purely informational
- Part of existing content, not overlay

**Trigger Conditions:**
- Data is available (availability, pricing)
- Context is appropriate (course cards, itinerary items)

### 3.4 Toasts (Minimal Interruption)
**Examples:** GroupDiscountToast

**Characteristics:**
- Auto-dismiss after 5 seconds
- Stack at screen edge
- No focus trap
- Can be ignored

**Trigger Conditions:**
- After completing an action (confirmation)
- Price changes or deal discovered
- Background task completion

---

## 4. Orchestrator API

```typescript
interface ProactiveUIOrchestrator {
  /**
   * Request permission to show a proactive UI component.
   * Returns true if approved, false if denied.
   */
  requestShow(
    componentType: ProactiveComponentType,
    priority: number,
    context?: Record<string, unknown>
  ): boolean;

  /**
   * Mark a component as dismissed by user.
   * Starts cooldown timer for that type.
   */
  dismiss(componentType: ProactiveComponentType): void;

  /**
   * Mark that we've collected specific data.
   * Prevents redundant asks.
   */
  markDataCollected(
    dataType: 'dates' | 'groupSize' | 'regions' | 'budget'
  ): void;

  /**
   * Check if a component can show without triggering.
   * Useful for conditional rendering decisions.
   */
  canShow(componentType: ProactiveComponentType): boolean;

  /**
   * Get current known data to avoid redundant asks.
   */
  getKnownData(): KnownUserData;
}

type ProactiveComponentType =
  | 'DateIntentModal'
  | 'GroupSizeNudge'
  | 'TripBuilderPrompt'
  | 'AvailabilityBadge'
  | 'GroupDiscountToast';
```

---

## 5. Session State Shape

```typescript
interface ProactiveUIState {
  // Track what's been shown this session
  shownThisSession: ProactiveComponentType[];

  // Timestamp of last shown proactive UI (for global cooldown)
  lastShownAt: number | null;

  // Dismissed types with their dismiss timestamp (for type-specific cooldown)
  dismissedTypes: Record<ProactiveComponentType, number>;

  // Data we've already collected (don't ask again)
  knownData: {
    dates?: {
      start: Date;
      duration: number; // days
    };
    groupSize?: number;
    regions?: string[]; // e.g., ['Bangkok', 'Hua Hin']
    budget?: 'value' | 'mid' | 'premium';
  };

  // Current popup showing (only one at a time)
  activePopup: ProactiveComponentType | null;
}

const initialState: ProactiveUIState = {
  shownThisSession: [],
  lastShownAt: null,
  dismissedTypes: {},
  knownData: {},
  activePopup: null,
};
```

---

## 6. Trigger Conditions

### DateIntentModal
```typescript
function shouldTriggerDateIntent(state: ProactiveUIState): boolean {
  // Already have dates
  if (state.knownData.dates) return false;

  // Already shown this session
  if (state.shownThisSession.includes('DateIntentModal')) return false;

  // Trigger after user views 2+ courses
  const coursesViewed = getCoursesViewedCount();
  return coursesViewed >= 2;
}
```

### GroupSizeNudge
```typescript
function shouldTriggerGroupSize(state: ProactiveUIState): boolean {
  // Already have group size
  if (state.knownData.groupSize !== undefined) return false;

  // Already shown this session
  if (state.shownThisSession.includes('GroupSizeNudge')) return false;

  // Trigger when user views pricing or starts trip builder
  return userViewedPricing() || userStartedTripBuilder();
}
```

### TripBuilderPrompt
```typescript
function shouldTriggerTripBuilder(state: ProactiveUIState): boolean {
  // User already in trip builder
  if (isTripBuilderActive()) return false;

  // Already shown this session
  if (state.shownThisSession.includes('TripBuilderPrompt')) return false;

  // Trigger after viewing 3+ courses
  const coursesViewed = getCoursesViewedCount();
  return coursesViewed >= 3;
}
```

### AvailabilityBadge
```typescript
function shouldShowAvailability(courseId: string): boolean {
  // Always show if we have availability data
  const availability = getAvailabilityData(courseId);
  return availability !== null;
}
```

---

## 7. Design Tokens (from Golf Okay System)

### Surfaces
```css
/* Glass surface for popups/sheets */
.surface-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Backdrop for modals */
.backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}
```

### Colors by Intent
```css
--accent-coral: #FF6B35;    /* Primary CTA, warnings */
--accent-cyan: #00D4FF;     /* Info, links, active states */
--accent-gold: #FBBF24;     /* Prices, premium features */
--accent-purple: #A855F7;   /* Premium, special offers */
--accent-red: #FF3B3B;      /* Errors, critical alerts */
```

### Typography
```css
/* Modal titles */
.modal-title {
  font-weight: 900;
  letter-spacing: -0.02em;
}

/* Labels and categories */
.label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}
```

### Animation
```css
/* Spring for modals */
--spring-modal: type: 'spring', damping: 25, stiffness: 300;

/* Spring for pills */
--spring-pill: type: 'spring', damping: 20, stiffness: 300;

/* Quick fade for toasts */
--fade-quick: duration: 0.15s;
```

---

## 8. File Structure

```
src/components/proactive/
├── ProactiveUIManager.tsx    # Context provider + orchestrator logic
├── DateIntentModal.tsx       # "When are you planning to play?"
├── GroupSizeNudge.tsx        # "Solo or with a group?"
├── TripBuilderPrompt.tsx     # "Want me to plan a trip?"
├── AvailabilityBadge.tsx     # Inline availability indicator
├── hooks/
│   ├── useProactiveUI.ts     # Hook to access orchestrator
│   └── useSessionState.ts    # Persist state to sessionStorage
└── index.ts                  # Public exports
```

---

## 9. Integration Points

### With ChatContainer
```tsx
function ChatContainer() {
  return (
    <ProactiveUIProvider>
      <ChatMessages />
      <ChatInput />
      {/* Proactive components render via portal */}
    </ProactiveUIProvider>
  );
}
```

### With ItineraryContext
```tsx
// When itinerary data changes, update known data
useEffect(() => {
  if (itinerary.dates) {
    proactiveUI.markDataCollected('dates');
  }
  if (itinerary.groupSize) {
    proactiveUI.markDataCollected('groupSize');
  }
}, [itinerary]);
```

### With Course Viewing
```tsx
// Track course views for trigger conditions
function CourseCard({ course }) {
  const { trackCourseView } = useProactiveUI();

  useEffect(() => {
    trackCourseView(course.id);
  }, [course.id]);
}
```

---

## 10. Testing Strategy

### Unit Tests
- Orchestrator approval/denial logic
- Cooldown timer calculations
- Priority queue ordering
- State transitions

### Integration Tests
- Component renders when approved
- Component hides when denied
- Dismiss updates state correctly
- Session state persists

### E2E Tests
- Full flow: idle → trigger → show → interact → dismiss
- Multiple component priority resolution
- Cross-page state persistence

---

## 11. Metrics to Track

- **Show rate**: How often each component is shown
- **Dismiss rate**: How often users explicitly dismiss
- **Conversion rate**: How often interaction leads to desired action
- **Time to dismiss**: Quick dismiss suggests poor timing
- **Subsequent engagement**: Did user continue or bounce after nudge?
