# Popup and Modal UX Patterns

Best practices for modals, popups, and notification patterns.

---

## Modal Accessibility

### Focus Management

```tsx
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus the modal
      modalRef.current?.focus();
    } else {
      // Restore focus on close
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
```

### Focus Trap

Keep focus within the modal while it's open:

```tsx
function useFocusTrap(containerRef: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, isActive]);
}
```

### Escape Key Handling

```tsx
useEffect(() => {
  if (!isOpen) return;

  function handleEscape(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

### ARIA Attributes

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal description text.</p>
</div>
```

---

## Non-Blocking Notification Patterns

### Toast Notifications

Best for:
- Brief confirmations ("Saved!")
- Non-critical updates
- Background process completion

Characteristics:
- Auto-dismiss (3-5 seconds)
- Don't require user action
- Stack at screen edge
- Don't block interaction

### Inline Alerts

Best for:
- Form validation feedback
- Contextual warnings
- Status changes for specific items

Characteristics:
- Appear near relevant content
- Persist until resolved
- Don't interrupt flow
- Color-coded by severity

### Banner Notifications

Best for:
- System-wide announcements
- Feature promotions
- Persistent warnings

Characteristics:
- Fixed position (top or bottom)
- Manually dismissible
- Minimal, single-line content
- Low visual priority

---

## Toast vs Modal vs Inline Decision Tree

```
Is immediate action required?
├─ YES → Is it critical/destructive?
│        ├─ YES → Modal with confirmation
│        └─ NO  → Slide-up sheet or floating action
│
└─ NO  → Is it contextual to specific content?
         ├─ YES → Inline badge/alert
         └─ NO  → Is it important enough to persist?
                  ├─ YES → Banner notification
                  └─ NO  → Toast notification
```

### Quick Reference

| Pattern | Urgency | Interruption | Duration | User Action |
|---------|---------|--------------|----------|-------------|
| Toast | Low | None | 3-5s auto | Optional |
| Inline | Medium | None | Persistent | None |
| Banner | Medium | Minimal | Dismissible | Dismiss |
| Sheet | High | Partial | User-controlled | Required |
| Modal | Critical | Full | User-controlled | Required |

---

## Mobile-Friendly Popup Patterns

### Bottom Sheet (Recommended for Mobile)

```tsx
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  drag="y"
  dragConstraints={{ top: 0 }}
  dragElastic={0.2}
  onDragEnd={(_, info) => {
    if (info.offset.y > 100) onClose();
  }}
  className="fixed bottom-0 inset-x-0 rounded-t-3xl"
>
  {/* Drag handle indicator */}
  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3" />
  {children}
</motion.div>
```

### Touch Target Sizes

- Minimum 44x44px for all interactive elements
- Spacing between touch targets: minimum 8px
- Primary actions at thumb-reachable areas (bottom of screen)

### Safe Area Considerations

```css
.bottom-sheet {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Viewport Awareness

```tsx
// Adjust modal height for keyboard
const [keyboardHeight, setKeyboardHeight] = useState(0);

useEffect(() => {
  const handleResize = () => {
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const windowHeight = window.innerHeight;
    setKeyboardHeight(windowHeight - viewportHeight);
  };

  window.visualViewport?.addEventListener('resize', handleResize);
  return () => window.visualViewport?.removeEventListener('resize', handleResize);
}, []);
```

---

## Dismissal Behavior Best Practices

### Multiple Dismiss Methods

Always provide multiple ways to dismiss:
1. **X button** - Explicit, always visible
2. **Escape key** - Keyboard users
3. **Click outside** - Quick dismissal (optional for critical modals)
4. **Swipe down** - Mobile gesture (for sheets)

### Dismiss Button Placement

- Desktop: Top-right corner (convention)
- Mobile: Top-right or within content area
- Always visible without scrolling

### Persist Dismissal State

```tsx
// Remember dismissal for session
function handleDismiss(type: string) {
  sessionStorage.setItem(`dismissed_${type}`, Date.now().toString());
  dispatch({ type: 'DISMISS', payload: type });
  onClose();
}

// Check before showing
function shouldShow(type: string): boolean {
  const dismissed = sessionStorage.getItem(`dismissed_${type}`);
  if (!dismissed) return true;

  const COOLDOWN = 10 * 60 * 1000; // 10 minutes
  return Date.now() - parseInt(dismissed) > COOLDOWN;
}
```

### Dismissal Feedback

- Animate out (don't just disappear)
- Brief haptic feedback on mobile (optional)
- Don't show "dismissed" confirmation (redundant)

---

## Animation Guidelines for Modals

### Entrance

```tsx
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 }
  }
};
```

### Backdrop

```tsx
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

<motion.div
  variants={backdropVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
  onClick={onClose}
/>
```

### Reduced Motion

```tsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const transition = prefersReducedMotion
  ? { duration: 0 }
  : { type: 'spring', damping: 25, stiffness: 300 };
```
