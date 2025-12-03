# React TypeScript Component Patterns

## Component Declaration

### Standard Functional Component with Props
```typescript
// Define props with interface or type
interface MyComponentProps {
  name: string;
  age?: number;  // Optional prop
  children?: React.ReactNode;
}

// Easiest way - return type is inferred
const MyComponent = ({ name, age, children }: MyComponentProps) => {
  return (
    <div>
      Hello, {name}! You are {age ?? 'unknown'} years old.
      {children}
    </div>
  );
};

// With explicit return type
const MyComponent = ({ name }: MyComponentProps): React.JSX.Element => (
  <div>{name}</div>
);
```

### Extending HTML Element Props
```typescript
import React from 'react';

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'ghost';
  isLoading?: boolean;
}

const Button = ({ variant = 'primary', isLoading, children, ...props }: ButtonProps) => {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
```

### Polymorphic Components (as prop)
```typescript
function PassThrough<T extends React.ElementType = 'div'>({
  as,
  ...props
}: { as?: T } & React.ComponentPropsWithoutRef<T>) {
  const Component = as || 'div';
  return <Component {...props} />;
}

// Usage
<PassThrough as="button" onClick={handleClick}>Click me</PassThrough>
```

## Props Patterns

### Function as Child (Render Props)
```typescript
interface Props {
  children: (data: { isOpen: boolean }) => React.ReactNode;
}

const Toggle = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return <div>{children({ isOpen })}</div>;
};
```

### Infer Component Props
```typescript
type $ElementProps<T> = T extends React.ComponentType<infer Props>
  ? Props extends object ? Props : never
  : never;

// Usage
type CardProps = $ElementProps<typeof Card>;
```

## Hooks Best Practices

### useMemo for Derived State
```typescript
// GOOD: Derive state from props/other state
const filteredItems = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);

// BAD: Don't sync state with useEffect
const [filteredItems, setFilteredItems] = useState([]);
useEffect(() => {
  setFilteredItems(items.filter(item => item.active));
}, [items]); // Causes extra render
```

### useCallback for Event Handlers
```typescript
const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []); // Stable reference

// In intervals/subscriptions, avoid stale closures
const nextStep = useCallback(() => {
  setStep(prev => (prev + 1) % items.length);
}, [items.length]);
```

### Custom Hooks
```typescript
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle] as const;
}
```

## Performance Patterns

### React.memo for Pure Components
```typescript
const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data
}: { data: Item[] }) {
  return <>{/* render data */}</>;
});
```

### Lazy Loading
```typescript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Usage with Suspense
<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

## Forward Refs
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
    </div>
  )
);
```

## Common Gotchas

1. **ESLint react-hooks/set-state-in-effect**: Use `useMemo` for derived state instead of `useEffect` + `setState`

2. **TypeScript Record to specific type**: Double cast required
   ```typescript
   const typedInput = input as unknown as SpecificType;
   ```

3. **React 19 setState in useEffect**: Triggers cascading renders - derive initial state from props/context instead

4. **Nested buttons cause hydration errors**: Use `<div>` with `cursor-pointer` for clickable containers with button children
