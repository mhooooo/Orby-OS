# Framer Motion Animation Patterns

## Basic Animation

```jsx
import { motion } from 'framer-motion';

// Simple animate prop
<motion.div
  animate={{ opacity: 1, x: 0 }}
  initial={{ opacity: 0, x: -100 }}
  transition={{ duration: 0.5 }}
/>
```

## Layout Animations

### Basic Layout Animation
```jsx
// Automatically animate layout changes
<motion.div layout />

// Optimize with layoutDependency
<motion.nav layout layoutDependency={isOpen} />
```

### Shared Layout (layoutId)
```jsx
// Element morphs between positions when layoutId matches
{items.map(item => (
  <motion.div layoutId={item.id} key={item.id}>
    {item.name}
  </motion.div>
))}

// Hero-to-header avatar transition example
<motion.div layoutId="avatar" className="w-20 h-20" />
// ... elsewhere in layout ...
<motion.div layoutId="avatar" className="w-10 h-10" />
```

### Separate Layout and Property Transitions
```jsx
<motion.div
  layout
  animate={{ opacity: 0.5 }}
  transition={{
    ease: "linear",
    layout: { duration: 0.3 }
  }}
/>
```

## AnimatePresence (Enter/Exit)

### Basic Usage
```jsx
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

### With Layout Animations
```jsx
<AnimatePresence mode="popLayout">
  {items.map(item => (
    <motion.li
      layout
      exit={{ opacity: 0 }}
      key={item.id}
    />
  ))}
</AnimatePresence>
```

### Fix Positioning with popLayout
```jsx
// Parent needs position other than static
<motion.ul layout style={{ position: "relative" }}>
  <AnimatePresence mode="popLayout">
    {items.map(item => (
      <motion.li layout key={item.id} />
    ))}
  </AnimatePresence>
</motion.ul>
```

### LayoutGroup for Coordination
```jsx
import { LayoutGroup } from 'framer-motion';

<LayoutGroup>
  <motion.ul layout>
    <AnimatePresence>
      {items.map(item => (
        <motion.li layout key={item.id} />
      ))}
    </AnimatePresence>
  </motion.ul>
</LayoutGroup>
```

### Nested AnimatePresence
```jsx
<AnimatePresence>
  {show ? (
    <motion.section exit={{ opacity: 0 }}>
      <AnimatePresence propagate>
        {/* This exit fires when parent exits */}
        <motion.div exit={{ x: -100 }} />
      </AnimatePresence>
    </motion.section>
  ) : null}
</AnimatePresence>
```

## Gesture Handling

### Hover & Tap
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>
```

### Drag
```jsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
  dragElastic={0.1}
/>
```

## Variants (Complex Sequences)

```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

## Spring Animations

```jsx
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 30
  }}
/>
```

## Accessibility

### Reduced Motion Support
```jsx
import { useReducedMotion, MotionConfig } from 'framer-motion';

// Site-wide configuration
<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>

// Per-component check
function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={shouldReduceMotion
        ? { opacity: 1 }
        : { opacity: 1, x: 100 }
      }
    />
  );
}
```

### Options
- `"user"` - Respect device setting (recommended)
- `"always"` - Force reduced motion
- `"never"` - Ignore reduced motion

## Performance

### Use `m` for Smaller Bundles
```jsx
import { m, LazyMotion, domAnimation } from 'framer-motion';

<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }} />
</LazyMotion>
```

### Strict Mode (Catch Accidental `motion` Imports)
```jsx
<LazyMotion features={domAnimation} strict>
  {/* Will throw if motion is used instead of m */}
</LazyMotion>
```

## 3D Flip Animation Pattern

```jsx
// Parent needs perspective
<div style={{ perspective: 1000 }}>
  <motion.div
    animate={{ rotateY: isFlipped ? 180 : 0 }}
    transition={{ duration: 0.6 }}
    style={{
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden'
    }}
  >
    {/* Front face */}
  </motion.div>
</div>
```

## CSS Requirements

```css
/* For 3D transforms */
.perspective-1000 {
  perspective: 1000px;
}

.backface-hidden {
  backface-visibility: hidden;
}
```

## Common Gotchas

1. **Stale closures in intervals**: Use `useCallback` for animation callbacks
2. **backface-visibility**: Must be set via CSS, not inline for 3D flips
3. **Parent positioning**: For `popLayout`, parent must not be `position: static`
4. **layoutId collisions**: Ensure layoutId is unique across the page
