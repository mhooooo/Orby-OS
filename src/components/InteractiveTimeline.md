# InteractiveTimeline Component

A drag-and-drop itinerary calendar component for Golf Okay's trip planning interface. Replaces the static text list in `ItinerarySummary` with an interactive timeline where activities can be reordered between days.

## Features

- **Drag & Drop**: Reorder activities within and between days using @dnd-kit
- **Visual Timeline**: Vertical day-by-day layout with glass surface cards
- **Activity Types**: Golf, transport, dining, accommodation, and custom activities
- **Type-based Styling**: Each activity type has unique icon and accent colors
- **Edit & Delete**: Inline actions for modifying activities
- **Add Activities**: Per-day "Add" button for new activities
- **Responsive**: Mobile-first design with touch support
- **Accessible**: Keyboard navigation and screen reader support

## Installation

Dependencies are already installed:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Usage

### Basic Example

```tsx
import { InteractiveTimeline, Day, Activity } from '@/components/InteractiveTimeline';

function MyComponent() {
  const [days, setDays] = useState<Day[]>([
    {
      id: 'day-1',
      date: '2024-12-15',
      activities: [
        {
          id: 'act-1',
          title: 'Alpine Golf Club',
          type: 'golf',
          time: '2:00 PM',
          duration: '4-5 hours',
          location: 'Pathum Thani',
        },
      ],
    },
  ]);

  return (
    <InteractiveTimeline
      days={days}
      onReorder={(updatedDays) => setDays(updatedDays)}
      onEditActivity={(dayId, activity) => console.log('Edit', activity)}
      onRemoveActivity={(dayId, activityId) => console.log('Remove', activityId)}
      onAddActivity={(dayId) => console.log('Add to', dayId)}
    />
  );
}
```

## Props API

### `InteractiveTimelineProps`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `days` | `Day[]` | ✅ | Array of day objects with activities |
| `onReorder` | `(days: Day[]) => void` | ✅ | Called when days/activities are reordered |
| `onEditActivity` | `(dayId: string, activity: Activity) => void` | ❌ | Called when edit button is clicked |
| `onRemoveActivity` | `(dayId: string, activityId: string) => void` | ❌ | Called when remove button is clicked |
| `onAddActivity` | `(dayId: string) => void` | ❌ | Called when add button is clicked |
| `className` | `string` | ❌ | Additional CSS classes for container |

### Type Definitions

```typescript
interface Activity {
  id: string;                  // Unique identifier
  title: string;              // Activity name
  type: 'golf' | 'transport' | 'dining' | 'accommodation' | 'other';
  time?: string;              // Start time (e.g., "2:00 PM")
  duration?: string;          // Duration text (e.g., "4-5 hours")
  location?: string;          // Venue or destination
}

interface Day {
  id: string;                 // Unique identifier
  date: string;              // ISO date string or formatted date
  activities: Activity[];    // Activities for this day
}
```

## Activity Types

Each activity type has distinct visual styling:

| Type | Icon | Color | Usage |
|------|------|-------|-------|
| `golf` | Flag | Coral (`#FF6B35`) | Golf rounds, tee times |
| `transport` | Car | Cyan (`#00D4FF`) | Airport transfers, hotel shuttles |
| `dining` | Utensils | Gold (`#FBBF24`) | Meals, restaurant reservations |
| `accommodation` | Bed | Purple (`#A855F7`) | Hotel check-in/out |
| `other` | MapPin | Muted | Custom activities, sightseeing |

## Integration with ItinerarySummary

Replace the existing static `Timeline` component (lines 313-393 in `ItinerarySummary.tsx`):

### Step 1: Convert Data Format

```tsx
import { InteractiveTimeline, Day, Activity } from '@/components/InteractiveTimeline';

// In ItinerarySummary component:
const timelineDays = useMemo((): Day[] => {
  const days: Day[] = [];

  // Arrival
  if (draft.transfers.enabled && draft.transfers.includesAirportPickup) {
    days.push({
      id: 'arrival',
      date: draft.startDate || 'Day 0',
      activities: [{
        id: 'arrival-transport',
        title: 'Airport Pickup',
        type: 'transport',
        time: '10:00 AM',
        location: 'Suvarnabhumi Airport',
      }],
    });
  }

  // Golf days
  for (let i = 1; i <= draft.numberOfDays; i++) {
    const date = draft.startDate
      ? new Date(new Date(draft.startDate).getTime() + (i - 1) * 24 * 60 * 60 * 1000)
      : null;

    days.push({
      id: `day-${i}`,
      date: date ? date.toISOString() : `Day ${i}`,
      activities: [{
        id: `golf-${i}`,
        title: courses[i - 1]?.name || 'Golf Round',
        type: 'golf',
        time: '9:00 AM',
        duration: '4-5 hours',
        location: courses[i - 1]?.location || draft.region[0],
      }],
    });
  }

  // Departure
  if (draft.transfers.enabled) {
    const lastDay = days[days.length - 1];
    lastDay.activities.push({
      id: 'departure-transport',
      title: 'Airport Transfer',
      type: 'transport',
      time: '4:00 PM',
      duration: '1 hour',
      location: 'To Airport',
    });
  }

  return days;
}, [draft, courses]);
```

### Step 2: Implement Handlers

```tsx
const handleReorderDays = useCallback((updatedDays: Day[]) => {
  // Update state
  setTimelineDays(updatedDays);

  // Persist to context/database
  // dispatch({ type: 'UPDATE_DAYS', payload: updatedDays });
}, []);

const handleEditActivity = useCallback((dayId: string, activity: Activity) => {
  // Open edit modal
  setEditingActivity({ dayId, activity });
  setShowEditModal(true);
}, []);

const handleRemoveActivity = useCallback((dayId: string, activityId: string) => {
  setTimelineDays(prev =>
    prev.map(day =>
      day.id === dayId
        ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
        : day
    )
  );
}, []);

const handleAddActivity = useCallback((dayId: string) => {
  // Open add activity modal
  setAddToDayId(dayId);
  setShowAddModal(true);
}, []);
```

### Step 3: Replace Timeline Component

```tsx
{/* Replace existing Timeline component */}
<div className="p-4 sm:p-6 lg:p-8 bg-background-base/40">
  <InteractiveTimeline
    days={timelineDays}
    onReorder={handleReorderDays}
    onEditActivity={handleEditActivity}
    onRemoveActivity={handleRemoveActivity}
    onAddActivity={handleAddActivity}
  />
</div>
```

## Design System Compliance

The component follows Golf Okay's design system:

### Surfaces
- **Day cards**: `bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass`
- **Activity cards**: `bg-background-card border border-accent-*/20`

### Colors
- Uses semantic accent colors (coral, cyan, gold, purple)
- Respects text hierarchy (primary, secondary, muted)
- Hover states with proper transitions

### Typography
- Font sizes: `text-sm` (body), `text-xs` (metadata)
- Font weights: `font-bold` (titles), `font-medium` (labels)

### Spacing
- Card padding: `p-4 sm:p-6` (responsive)
- Element gaps: `gap-3` (standard), `gap-4` (sections)

### Radius
- Day cards: `rounded-card` (32px)
- Activity cards: `rounded-lg` (16px)
- Buttons: `rounded-button` (12px)

## Accessibility

- **Keyboard Navigation**: Full keyboard support for dragging (Arrow keys to move)
- **Screen Reader**: Descriptive `aria-label` attributes on interactive elements
- **Focus Management**: Visible focus states on all interactive elements
- **Touch Support**: Optimized for mobile with touch sensors

## Performance

- **Layout Animations**: Uses Framer Motion's `layout` prop for smooth transitions
- **Drag Overlay**: Separate overlay component for smoother dragging
- **Memoization**: Use `useMemo` for derived state, `useCallback` for handlers
- **Optimistic Updates**: UI updates immediately, can rollback on API errors

## Browser Support

Works on all modern browsers with full drag-and-drop support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Mobile browsers:
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

## Known Limitations

1. **No Multi-day Drag**: Currently can't drag entire days, only activities
2. **No Undo/Redo**: Implement separately if needed
3. **No Bulk Operations**: Can't select multiple activities at once
4. **Fixed Activity Types**: Limited to 5 predefined types (can be extended)

## Future Enhancements

- [ ] Add day-level drag handles for reordering entire days
- [ ] Implement undo/redo functionality
- [ ] Add multi-select for bulk operations
- [ ] Support custom activity types with user-defined colors
- [ ] Add time conflict detection (overlapping activities)
- [ ] Implement auto-scheduling based on constraints
- [ ] Add drag preview with activity details
- [ ] Support recurring activities (e.g., daily breakfast)

## Testing

See `InteractiveTimeline.example.tsx` for a complete working example.

To test:
1. Start dev server: `npm run dev`
2. Navigate to example page
3. Try dragging activities between days
4. Test edit/remove/add buttons
5. Test keyboard navigation (Tab + Arrow keys)
6. Test on mobile device or simulator

## Troubleshooting

### Activities not dragging
- Ensure each activity has a unique `id`
- Check that `onReorder` handler is provided
- Verify @dnd-kit packages are installed

### Layout jumping during drag
- Add `layout` prop to Framer Motion components
- Ensure parent has `position: relative`

### Touch not working on mobile
- Check TouchSensor is included in sensors array
- Verify `activationConstraint` allows for scrolling

### Type errors
- Ensure Activity and Day types are imported correctly
- Check TypeScript version compatibility (5.0+)

## Support

For issues or questions:
- Check CLAUDE.md for project conventions
- Review Golf Okay design system reference
- See Framer Motion docs for animation issues
- See @dnd-kit docs for drag-drop issues
