# Animation and Micro-Interactions

Patterns for entrance/exit animations, attention-grabbing, and accessible motion.

---

## Entrance/Exit Animations for Modals

### AnimatePresence Pattern

```tsx
import { AnimatePresence, motion } from 'framer-motion';

function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Bottom Sheet Animation

```tsx
const sheetVariants = {
  hidden: {
    y: '100%',
    opacity: 0.5,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    }
  },
  exit: {
    y: '100%',
    opacity: 0.5,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    }
  },
};

<motion.div
  variants={sheetVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
  className="fixed bottom-0 inset-x-0 rounded-t-3xl bg-surface-glass"
>
```

### Floating Pill Animation

```tsx
const pillVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
      delay: 0.1, // Slight delay feels more natural
    }
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.95,
    transition: { duration: 0.15 }
  },
};
```

---

## Framer Motion AnimatePresence Patterns

### Key-Based Transitions (for Swapping Content)

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep} // Changes trigger exit/enter
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  >
    {steps[currentStep]}
  </motion.div>
</AnimatePresence>
```

### Nested AnimatePresence (Propagate Exits)

```tsx
<AnimatePresence>
  {show && (
    <motion.section exit={{ opacity: 0 }}>
      <AnimatePresence propagate>
        {/* Child exit animations fire when parent exits */}
        <motion.div exit={{ x: -100 }} />
      </AnimatePresence>
    </motion.section>
  )}
</AnimatePresence>
```

### Staggered Children

```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

<motion.ul variants={containerVariants} initial="hidden" animate="visible" exit="exit">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

---

## Subtle Attention-Grabbing Without Annoyance

### Gentle Pulse (For New Items)

```tsx
const pulseVariants = {
  initial: { boxShadow: '0 0 0 0 rgba(255, 107, 53, 0)' },
  pulse: {
    boxShadow: [
      '0 0 0 0 rgba(255, 107, 53, 0)',
      '0 0 0 8px rgba(255, 107, 53, 0.3)',
      '0 0 0 0 rgba(255, 107, 53, 0)',
    ],
    transition: {
      duration: 2,
      repeat: 2, // Only pulse 3 times total
      ease: 'easeInOut',
    }
  }
};

<motion.div
  variants={pulseVariants}
  initial="initial"
  animate="pulse"
>
```

### Subtle Bounce (For CTAs)

```tsx
const bounceVariants = {
  rest: { y: 0 },
  hover: {
    y: -2,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    }
  },
  tap: { y: 0, scale: 0.98 },
};

<motion.button
  variants={bounceVariants}
  initial="rest"
  whileHover="hover"
  whileTap="tap"
>
```

### Soft Glow (For Important Items)

```tsx
const glowAnimation = {
  boxShadow: [
    '0 0 20px rgba(0, 212, 255, 0)',
    '0 0 20px rgba(0, 212, 255, 0.3)',
    '0 0 20px rgba(0, 212, 255, 0)',
  ],
};

<motion.div
  animate={glowAnimation}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
>
```

### Avoid These Patterns

- Continuous spinning/rotating (distracting)
- Rapid flashing (accessibility concern)
- Constant pulsing that never stops
- Animations that block interaction
- Overly bouncy physics (feels cheap)

---

## Spring Physics for Friendly Feel

### Spring Parameter Guide

```tsx
// Snappy, responsive (buttons, toggles)
{ type: 'spring', stiffness: 400, damping: 30 }

// Gentle, friendly (modals, sheets)
{ type: 'spring', stiffness: 300, damping: 25 }

// Soft, luxurious (large transitions)
{ type: 'spring', stiffness: 200, damping: 20 }

// Bouncy, playful (avoid for professional UI)
{ type: 'spring', stiffness: 500, damping: 10 }
```

### Using bounce and duration

```tsx
// More intuitive spring configuration
{ type: 'spring', bounce: 0.25, duration: 0.5 }

// bounce: 0 = no bounce (critically damped)
// bounce: 0.25 = slight bounce (professional)
// bounce: 0.5 = noticeable bounce (playful)
// bounce: 1 = maximum bounce (cartoon-like)
```

### Spring for CSS Transitions

```tsx
import { spring } from 'motion';

// Generate CSS spring easing
const springTransition = spring({ bounce: 0.2, duration: 0.5 });
// Returns: "0.5s linear(0, 0.0039, ...)"

<div style={{ transition: `transform ${springTransition}` }}>
```

---

## Reduced Motion Accessibility

### Detecting User Preference

```tsx
function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
```

### Respecting the Preference

```tsx
function AnimatedModal({ isOpen, children }) {
  const prefersReduced = usePrefersReducedMotion();

  const variants = prefersReduced ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  } : {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
  };

  const transition = prefersReduced
    ? { duration: 0.01 } // Near instant
    : { type: 'spring', damping: 25, stiffness: 300 };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transition}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### CSS Fallback

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### What to Keep vs Remove

**Keep (essential for understanding):**
- Opacity fades (very subtle motion)
- Loading spinners (functional)
- Progress indicators

**Remove (decorative):**
- Bouncy entrances
- Parallax effects
- Background animations
- Continuous loops
- Complex transform sequences

---

## Golf Okay Specific Patterns

### Thinking Halo Animation

```tsx
// Conic gradient rotation for AI thinking state
const haloVariants = {
  thinking: {
    rotate: 360,
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    }
  },
  idle: {
    rotate: 0,
    transition: { duration: 0 }
  }
};
```

### Snap-to-Static Pattern

```tsx
// Breathing animation that snaps to fixed on state change
const dotsVariants = {
  breathing: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  },
  locked: {
    scale: 1,
    transition: { duration: 0.3 }
  }
};
```

### Glass Surface Hover

```tsx
const glassHoverVariants = {
  rest: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hover: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  }
};
```
