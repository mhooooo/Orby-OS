# React Context Patterns

Best practices for global state management using React Context.

---

## Provider Pattern

### Basic Structure

```tsx
// 1. Create contexts (separate for state and dispatch)
import { createContext, useContext, useReducer } from 'react';

const StateContext = createContext<State | null>(null);
const DispatchContext = createContext<Dispatch | null>(null);

// 2. Create provider component
export function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext value={state}>
      <DispatchContext value={dispatch}>
        {children}
      </DispatchContext>
    </StateContext>
  );
}

// 3. Create custom hooks for consumption
export function useState() {
  const context = useContext(StateContext);
  if (context === null) {
    throw new Error('useState must be used within Provider');
  }
  return context;
}

export function useDispatch() {
  const context = useContext(DispatchContext);
  if (context === null) {
    throw new Error('useDispatch must be used within Provider');
  }
  return context;
}
```

### Why Separate Contexts?

Separating state and dispatch into different contexts prevents unnecessary re-renders:
- Components that only dispatch actions won't re-render when state changes
- Components that only read state won't hold stale dispatch references

---

## Avoiding Unnecessary Re-renders

### Problem: Context Value Object Recreation

```tsx
// BAD: New object on every render
function Provider({ children }) {
  const [state, setState] = useState(initialState);

  // This object is recreated every render!
  return (
    <MyContext value={{ state, setState }}>
      {children}
    </MyContext>
  );
}
```

### Solution 1: useMemo for Complex Values

```tsx
function Provider({ children }) {
  const [state, setState] = useState(initialState);

  const value = useMemo(() => ({ state, setState }), [state]);

  return (
    <MyContext value={value}>
      {children}
    </MyContext>
  );
}
```

### Solution 2: Separate Contexts (Preferred)

```tsx
function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext value={state}>
      <DispatchContext value={dispatch}>
        {children}
      </DispatchContext>
    </StateContext>
  );
}
```

### Solution 3: Selector Pattern with useSyncExternalStore

For fine-grained subscriptions, consider using `useSyncExternalStore` with a selector:

```tsx
function useSelector<T>(selector: (state: State) => T): T {
  const store = useContext(StoreContext);
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState())
  );
}
```

---

## Context with TypeScript

### Defining Types

```tsx
// Types
interface ProactiveUIState {
  shownThisSession: string[];
  lastShownAt: number | null;
  dismissedTypes: Record<string, number>;
  knownData: {
    dates?: { start: Date; duration: number };
    groupSize?: number;
    regions?: string[];
  };
}

type ProactiveUIAction =
  | { type: 'SHOW'; payload: string }
  | { type: 'DISMISS'; payload: string }
  | { type: 'SET_KNOWN_DATA'; payload: Partial<ProactiveUIState['knownData']> }
  | { type: 'RESET' };

// Context with explicit types
const ProactiveUIStateContext = createContext<ProactiveUIState | null>(null);
const ProactiveUIDispatchContext = createContext<React.Dispatch<ProactiveUIAction> | null>(null);
```

### Reducer with TypeScript

```tsx
function proactiveUIReducer(
  state: ProactiveUIState,
  action: ProactiveUIAction
): ProactiveUIState {
  switch (action.type) {
    case 'SHOW':
      return {
        ...state,
        shownThisSession: [...state.shownThisSession, action.payload],
        lastShownAt: Date.now(),
      };
    case 'DISMISS':
      return {
        ...state,
        dismissedTypes: {
          ...state.dismissedTypes,
          [action.payload]: Date.now(),
        },
      };
    case 'SET_KNOWN_DATA':
      return {
        ...state,
        knownData: { ...state.knownData, ...action.payload },
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
```

---

## Combining Multiple Contexts

### Nested Providers Pattern

```tsx
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SessionProvider>
        <ChatProvider>
          <ProactiveUIProvider>
            {children}
          </ProactiveUIProvider>
        </ChatProvider>
      </SessionProvider>
    </AuthProvider>
  );
}
```

### Provider Order Matters
- Outer providers are available to inner providers
- Inner providers can consume outer context
- Example: ProactiveUIProvider can access SessionContext

### Composing Providers Utility

```tsx
function composeProviders(...providers: React.ComponentType<{ children: React.ReactNode }>[]) {
  return function ComposedProviders({ children }: { children: React.ReactNode }) {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
  };
}

const AppProviders = composeProviders(
  AuthProvider,
  SessionProvider,
  ChatProvider,
  ProactiveUIProvider
);
```

---

## Performance Optimization Patterns

### 1. Memoize Expensive Derived State

```tsx
function useProactiveUIState() {
  const state = useContext(ProactiveUIStateContext);

  // Memoize derived values
  const canShowPopup = useMemo(() => {
    if (state.shownThisSession.length > 0) return false;
    if (state.lastShownAt && Date.now() - state.lastShownAt < 120000) return false;
    return true;
  }, [state.shownThisSession, state.lastShownAt]);

  return { ...state, canShowPopup };
}
```

### 2. Split Large Contexts

Instead of one giant context, split by update frequency:
- `ProactiveUIConfigContext` - rarely changes (settings)
- `ProactiveUIStateContext` - changes on user actions
- `ProactiveUIDispatchContext` - never changes

### 3. Use React.memo for Consumer Components

```tsx
const DateIntentModal = React.memo(function DateIntentModal() {
  const dispatch = useProactiveUIDispatch();
  // Only re-renders when its own state changes
});
```

---

## Testing Contexts

```tsx
// Test wrapper utility
function renderWithProviders(
  ui: React.ReactElement,
  { initialState = defaultState, ...options } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ProactiveUIProvider initialState={initialState}>
        {children}
      </ProactiveUIProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
```
