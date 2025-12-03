# Accessibility Patterns

## ARIA Attributes

### Buttons & Interactive Elements
```jsx
<button
  aria-label="Close modal"
  aria-pressed={isActive}
  aria-expanded={isOpen}
  aria-controls="dropdown-menu"
>
  <XIcon />
</button>
```

### Modal Dialogs
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-description">Are you sure you want to proceed?</p>
</div>
```

### Loading States
```jsx
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? <Spinner aria-label="Loading content" /> : content}
</div>
```

### Form Inputs
```jsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && <span id="email-error" role="alert">Invalid email</span>}
```

## Keyboard Navigation

### Focus Management
```jsx
import { useRef, useEffect } from 'react';

function Modal({ isOpen, onClose }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div role="dialog" aria-modal="true">
      <button
        ref={closeButtonRef}
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
```

### Focus Trap
```jsx
function FocusTrap({ children }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusable = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusable?.length) return;

    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}
```

### Escape to Close
```jsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

### Arrow Key Navigation (Lists)
```jsx
function NavigableList({ items, onSelect }) {
  const [focusIndex, setFocusIndex] = useState(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIndex(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[focusIndex]);
        break;
    }
  };

  return (
    <ul role="listbox" onKeyDown={handleKeyDown}>
      {items.map((item, i) => (
        <li
          key={item.id}
          role="option"
          aria-selected={i === focusIndex}
          tabIndex={i === focusIndex ? 0 : -1}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

## Screen Reader Considerations

### Visually Hidden Text
```jsx
// For screen readers only
<span className="sr-only">
  Opens in new window
</span>

// Tailwind CSS
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Live Regions
```jsx
// Announce dynamic content changes
<div aria-live="polite" aria-atomic="true">
  {message}
</div>

// For urgent announcements
<div role="alert">
  Error: {errorMessage}
</div>
```

### Skip Links
```jsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white focus:text-black"
>
  Skip to main content
</a>
```

## Color Contrast

### WCAG Requirements
- **AA Standard**: 4.5:1 for normal text, 3:1 for large text
- **AAA Standard**: 7:1 for normal text, 4.5:1 for large text

### Golf Okay Palette Contrast
```
Background #0a0a0a with:
- White (#FFFFFF): 21:1 ✓ AAA
- Gray-400 (#9CA3AF): 7.3:1 ✓ AAA
- Gray-500 (#6B7280): 4.9:1 ✓ AA
- Coral (#FF6B35): 4.7:1 ✓ AA
- Cyan (#00D4FF): 10.5:1 ✓ AAA
- Gold (#FBBF24): 10.1:1 ✓ AAA
```

### Don't Rely on Color Alone
```jsx
// BAD: Color only
<span className={isError ? 'text-red-500' : 'text-green-500'}>
  {message}
</span>

// GOOD: Color + icon/text
<span className={isError ? 'text-red-500' : 'text-green-500'}>
  {isError ? '✗ Error: ' : '✓ Success: '}{message}
</span>
```

## Reduced Motion

### Framer Motion
```jsx
import { useReducedMotion, MotionConfig } from 'framer-motion';

// Site-wide
<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>

// Per-component
function AnimatedCard() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={shouldReduceMotion
        ? { opacity: 1 } // Just fade
        : { opacity: 1, scale: 1, x: 0 } // Full animation
      }
    />
  );
}
```

### CSS Media Query
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Interactive Component Checklist

- [ ] Focusable via keyboard (Tab)
- [ ] Has visible focus indicator
- [ ] Activatable via Enter/Space
- [ ] Has accessible name (aria-label or visible text)
- [ ] Announces state changes (aria-expanded, etc.)
- [ ] Works with screen readers
- [ ] Meets color contrast requirements
- [ ] Respects reduced motion preference
