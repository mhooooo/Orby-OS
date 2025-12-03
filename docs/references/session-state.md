# Session State Management

Patterns for managing UI state across page navigation and sessions.

---

## Storage Options Comparison

| Feature | Memory | sessionStorage | localStorage |
|---------|--------|----------------|--------------|
| Persists on refresh | No | Yes | Yes |
| Persists on close | No | No | Yes |
| Shared across tabs | No | No | Yes |
| Size limit | RAM | ~5MB | ~5MB |
| Sync/async | Sync | Sync | Sync |
| Best for | Ephemeral UI | Session state | Preferences |

### When to Use Each

**Memory (React state/context)**
- Active user input
- Transient UI state
- High-frequency updates
- Sensitive data (passwords, tokens)

**sessionStorage**
- Form progress
- Wizard step state
- Dismissal cooldowns
- "Shown this session" flags
- Cart contents (before checkout)

**localStorage**
- User preferences (theme, language)
- "Don't show again" preferences
- Recently viewed items
- Cached non-sensitive data

---

## Session State in React

### Custom Hook for Session State

```tsx
function useSessionState<T>(key: string, initialValue: T) {
  // Initialize from sessionStorage or default
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Sync to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error);
    }
  }, [key, state]);

  return [state, setState] as const;
}
```

### Usage

```tsx
function ProactiveUIProvider({ children }) {
  const [state, setState] = useSessionState<ProactiveUIState>(
    'proactive-ui-state',
    initialProactiveUIState
  );

  // ... rest of provider
}
```

---

## Persisting UI State Across Navigation

### Problem: State Lost on Navigation

```tsx
// BAD: State resets when navigating away and back
function CourseList() {
  const [filter, setFilter] = useState('all'); // Lost on navigate!
  // ...
}
```

### Solution 1: URL State (Best for Shareable State)

```tsx
import { useSearchParams } from 'next/navigation';

function CourseList() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') ?? 'all';

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set('filter', value);
    router.push(`?${params.toString()}`);
  }
  // ...
}
```

### Solution 2: Context (Best for App-Wide State)

```tsx
// State lives in context, survives navigation
function App() {
  return (
    <FilterProvider>
      <Routes>
        <Route path="/courses" element={<CourseList />} />
        <Route path="/course/:id" element={<CourseDetail />} />
      </Routes>
    </FilterProvider>
  );
}
```

### Solution 3: Session Storage (Best for Temporary Persistence)

```tsx
function CourseList() {
  const [filter, setFilter] = useSessionState('course-filter', 'all');
  // Persists through navigation AND refresh
}
```

---

## Rate Limiting UI Events

### Debounce Pattern

Delay action until user stops triggering:

```tsx
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage: Only search after user stops typing
const debouncedSearch = useDebouncedValue(searchTerm, 300);
useEffect(() => {
  search(debouncedSearch);
}, [debouncedSearch]);
```

### Throttle Pattern

Limit frequency of action:

```tsx
function useThrottle<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T {
  const lastRun = useRef(0);
  const timeout = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = delay - (now - lastRun.current);

    if (remaining <= 0) {
      lastRun.current = now;
      fn(...args);
    } else if (!timeout.current) {
      timeout.current = setTimeout(() => {
        lastRun.current = Date.now();
        timeout.current = undefined;
        fn(...args);
      }, remaining);
    }
  }, [fn, delay]) as T;
}

// Usage: Track scroll position at most every 100ms
const handleScroll = useThrottle(() => {
  setScrollY(window.scrollY);
}, 100);
```

---

## Cooldown Pattern Implementation

### For Proactive UI

```tsx
interface CooldownManager {
  canShow: (type: string) => boolean;
  markShown: (type: string) => void;
  markDismissed: (type: string) => void;
}

function useCooldownManager(config: {
  globalCooldown: number;  // Min time between ANY proactive UI
  dismissCooldown: number; // Min time after dismiss
}): CooldownManager {
  const [state, setState] = useSessionState<{
    lastShownAt: number | null;
    dismissedTypes: Record<string, number>;
  }>('proactive-cooldowns', {
    lastShownAt: null,
    dismissedTypes: {},
  });

  const canShow = useCallback((type: string): boolean => {
    const now = Date.now();

    // Check global cooldown
    if (state.lastShownAt && now - state.lastShownAt < config.globalCooldown) {
      return false;
    }

    // Check type-specific dismiss cooldown
    const dismissedAt = state.dismissedTypes[type];
    if (dismissedAt && now - dismissedAt < config.dismissCooldown) {
      return false;
    }

    return true;
  }, [state, config]);

  const markShown = useCallback((type: string) => {
    setState(prev => ({
      ...prev,
      lastShownAt: Date.now(),
    }));
  }, [setState]);

  const markDismissed = useCallback((type: string) => {
    setState(prev => ({
      ...prev,
      dismissedTypes: {
        ...prev.dismissedTypes,
        [type]: Date.now(),
      },
    }));
  }, [setState]);

  return { canShow, markShown, markDismissed };
}
```

### Usage in Orchestrator

```tsx
function ProactiveUIOrchestrator() {
  const cooldowns = useCooldownManager({
    globalCooldown: 2 * 60 * 1000,  // 2 minutes
    dismissCooldown: 10 * 60 * 1000, // 10 minutes
  });

  const requestShow = useCallback((type: string, priority: number) => {
    if (!cooldowns.canShow(type)) return false;

    // Additional checks...
    cooldowns.markShown(type);
    return true;
  }, [cooldowns]);

  const handleDismiss = useCallback((type: string) => {
    cooldowns.markDismissed(type);
  }, [cooldowns]);

  // ...
}
```

---

## SSR Considerations

### Hydration-Safe Session Storage

```tsx
function useSessionState<T>(key: string, initialValue: T) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, setState] = useState<T>(initialValue);

  // Only access sessionStorage after hydration
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch {
      // Ignore errors
    }
    setIsHydrated(true);
  }, [key]);

  // Sync changes to sessionStorage
  useEffect(() => {
    if (!isHydrated) return;

    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore errors
    }
  }, [key, state, isHydrated]);

  return [state, setState, isHydrated] as const;
}
```

### Avoid Flash of Wrong Content

```tsx
function ProactiveUI() {
  const [state, setState, isHydrated] = useSessionState(...);

  // Don't render proactive UI until we know session state
  if (!isHydrated) return null;

  return <ProactiveUIContent state={state} />;
}
```
