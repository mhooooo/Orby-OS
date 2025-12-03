# Golf Okay Design System Reference

## File Locations

| Resource | Path |
|----------|------|
| Design Tokens (JS) | `src/styles/design-tokens.ts` |
| Tailwind Extensions | `src/app/globals.css` |
| Components | `src/components/` |
| Generative UI | `src/components/generative-ui/` |
| UI Primitives | `src/components/ui/` |
| Audit Preview | `src/app/audit/page.tsx` |

---

## Color System

### Background Hierarchy (darkest to lightest)
| Token | Value | Usage |
|-------|-------|-------|
| `bg-background-base` | `#0a0a0a` | Page background |
| `bg-background-elevated` | `#131314` | Overlays, modals |
| `bg-background-card` | `#1E1F20` | Cards, sidebars |
| `bg-background-hover` | `#282A2C` | Interactive hover |
| `bg-background-input` | `#282A2C` | Input fields |

### Accent Colors
| Token | Value | Usage |
|-------|-------|-------|
| `accent-coral` | `#FF6B35` | Primary CTAs, highlights |
| `accent-cyan` | `#00D4FF` | Info, links |
| `accent-purple` | `#A855F7` | Premium features |
| `accent-red` | `#FF3B3B` | Errors, danger |
| `accent-gold` | `#FBBF24` | Prices, success |

Each accent has muted (20% opacity) and strong (30% opacity) variants:
- `bg-accent-coralMuted`, `bg-accent-coralStrong`
- `bg-accent-cyanMuted`, `bg-accent-cyanStrong`
- etc.

### Text Hierarchy
| Token | Value | Usage |
|-------|-------|-------|
| `text-text-primary` | `#FFFFFF` | Headlines, important |
| `text-text-secondary` | `#9CA3AF` | Body text |
| `text-text-muted` | `#6B7280` | Hints, placeholders |
| `text-text-disabled` | `#4B5563` | Disabled states |

---

## Surface Treatments

### Glass Surface (with backdrop blur)
```jsx
<div className="bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass rounded-card">
  Glass card content
</div>
```

Full utility string:
```
bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
```

### Solid Surface (no blur)
```jsx
<div className="bg-background-card border border-white/5 rounded-card">
  Solid card content
</div>
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | `8px` | Tags, small elements |
| `rounded-md` | `12px` | Buttons (also `rounded-button`) |
| `rounded-lg` | `16px` | Small cards |
| `rounded-xl` | `20px` | Inputs (also `rounded-input`) |
| `rounded-2xl` | `24px` | Medium cards |
| `rounded-3xl` / `rounded-card` | `32px` | Main cards, modals |
| `rounded-pill` | `9999px` | Pills, avatars |

---

## Shadows

| Token | Usage |
|-------|-------|
| `shadow-sm` | Subtle elevation |
| `shadow-md` | Card elevation |
| `shadow-lg` | Modal/popup elevation |
| `shadow-glass` | Glassmorphism |
| `shadow-glow-coral` | Coral accent glow |
| `shadow-glow-cyan` | Cyan accent glow |
| `shadow-glow-purple` | Purple accent glow |
| `shadow-glow-gold` | Gold accent glow |

---

## Component Patterns

### Primary CTA Button
```jsx
<button className="bg-accent-coral hover:bg-accent-coral/90 text-white font-bold rounded-button px-6 py-3 transition-colors shadow-glow-coral">
  Book Now
</button>
```

### Ghost Button
```jsx
<button className="bg-white/5 hover:bg-white/10 text-white font-medium rounded-button px-6 py-3 border border-white/10 hover:border-white/20 transition-colors">
  Learn More
</button>
```

### Input Field
```jsx
<input className="bg-background-input border border-white/5 rounded-input px-4 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-white/20 focus:bg-background-card transition-colors" />
```

### Card Container
```jsx
// Glass variant
<div className="bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass rounded-card p-6">

// Solid variant
<div className="bg-background-card border border-white/5 rounded-card p-6">
```

### Pill / Tag
```jsx
<span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-pill bg-white/10 border border-white/10 text-white">
  Featured
</span>
```

### Price Display
```jsx
<span className="text-accent-gold font-bold">
  ฿{price.toLocaleString()}
</span>
```

---

## Icon Backgrounds

Use muted accent colors for icon backgrounds:
```jsx
<div className="bg-accent-coralMuted p-2 rounded-lg">
  <GolfIcon className="w-5 h-5 text-accent-coral" />
</div>
```

---

## Interactive States

### Hover Effects
- Background: `hover:bg-white/10` or `hover:bg-accent-coral/90`
- Border: `hover:border-white/20`
- Always include `transition-colors` or `transition-all`

### Focus States
- `focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20`

### Selected/Active States
- Border ring: `ring-2 ring-accent-coral`
- Background: `bg-accent-coralMuted`

### Disabled States
- `opacity-50 cursor-not-allowed`
- Text: `text-text-disabled`

---

## Wizard Progress Indicators

```jsx
// Completed step
<div className="bg-accent-coral text-white" />

// Active step
<div className="bg-accent-cyan text-white" />

// Pending step
<div className="bg-white/10 text-text-muted" />
```

---

## Toggle Switches

```jsx
// Active state
<div className="bg-accent-coral shadow-glow-coral" />

// Inactive state
<div className="bg-white/10" />
```

---

## Animation Classes

```css
/* In globals.css */
.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}

.perspective-1000 {
  perspective: 1000px;
}

.backface-hidden {
  backface-visibility: hidden;
}
```

---

## Props Interface Patterns

### Card Components
```typescript
interface CourseCardProps {
  course: Course;
  onSelect?: (course: Course) => void;
  isSelected?: boolean;
  className?: string;
}
```

### List Components
```typescript
interface CourseCarouselProps {
  courses: Course[];
  onCourseSelect?: (course: Course) => void;
  initialIndex?: number;
}
```

### Form Components
```typescript
interface RegionStepProps {
  regions: Region[];
  selectedRegions: string[];
  onSelect: (regionIds: string[]) => void;
  multiSelect?: boolean;
}
```

### Modal Components
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

---

## Import Paths

```typescript
// Design tokens
import { colors, radius, shadows, tw } from '@/styles/design-tokens';

// Components
import { CourseCard } from '@/components/generative-ui/CourseCard';
import { Skeleton } from '@/components/ui/Skeleton';

// Context
import { useItinerary } from '@/context/ItineraryContext';
import { useAuth } from '@/context/AuthContext';

// Hooks
import { useChat } from '@/hooks/useChat';
import { useSavedCourses } from '@/hooks/useSavedCourses';

// Utils
import { cn } from '@/lib/utils';
```

---

## File Structure Convention

```
src/components/
├── generative-ui/           # AI-rendered components
│   ├── CourseCard.tsx
│   ├── CourseCarousel.tsx
│   ├── FleetCard.tsx
│   ├── AboutCard.tsx
│   ├── ItineraryBuilder/    # Multi-file wizard
│   │   ├── index.tsx
│   │   ├── RegionStep.tsx
│   │   ├── DateGroupStep.tsx
│   │   ├── VibeStep.tsx
│   │   └── LogisticsStep.tsx
│   └── ...
├── ui/                      # Reusable primitives
│   ├── Skeleton.tsx
│   ├── Spinner.tsx
│   ├── Toast.tsx
│   └── ...
├── chat/                    # Chat-specific components
└── ...                      # Other feature components
```

---

## Adding to Audit Page

After creating a new component, add it to `/app/audit/page.tsx`:

```tsx
import { NewComponent } from '@/components/generative-ui/NewComponent';

// In the render:
<section className="mb-12">
  <h2 className="text-2xl font-bold text-white mb-4">New Component</h2>
  <NewComponent
    // Pass mock props
  />
</section>
```
