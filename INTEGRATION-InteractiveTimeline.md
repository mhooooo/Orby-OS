# InteractiveTimeline Integration Guide

Quick start guide for integrating the InteractiveTimeline component into Golf Okay.

## Files Created

1. **`src/components/InteractiveTimeline.tsx`** (13KB)
   - Main component with drag-drop functionality
   - Exports: `InteractiveTimeline`, `Activity`, `Day` types

2. **`src/components/InteractiveTimeline.example.tsx`** (5.4KB)
   - Complete working example with handlers
   - Shows data structure and event handling

3. **`src/components/InteractiveTimeline.preview.tsx`** (9.2KB)
   - Visual test component for audit page
   - Includes action log and reset functionality

4. **`src/components/InteractiveTimeline.md`** (9.6KB)
   - Comprehensive documentation
   - Props API, integration guide, troubleshooting

## Quick Start

### 1. Test the Component (Recommended First Step)

Add to `/app/audit/page.tsx`:

```tsx
import { InteractiveTimelinePreview } from '@/components/InteractiveTimeline.preview';

// In the page component:
<section className="mb-12">
  <InteractiveTimelinePreview />
</section>
```

Then visit: `http://localhost:3000/audit`

### 2. Use in Your App

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
      onReorder={setDays}
    />
  );
}
```

## Integration into ItinerarySummary

Replace the static `Timeline` component (lines 313-393 in `ItinerarySummary.tsx`):

### Before
```tsx
<div className="p-4 sm:p-6 lg:p-8 bg-background-base/40">
  <Timeline draft={draft} />
</div>
```

### After
```tsx
import { InteractiveTimeline, Day, Activity } from '@/components/InteractiveTimeline';

// Convert draft to timeline format
const timelineDays = useMemo((): Day[] => {
  // Convert ItineraryDraft to Day[] format
  // See InteractiveTimeline.md for full example
  return convertDraftToDays(draft, courses);
}, [draft, courses]);

// In render:
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

## Activity Type Reference

| Type | Icon | Color | Example |
|------|------|-------|---------|
| `golf` | Flag | Coral | "Alpine Golf Club" |
| `transport` | Car | Cyan | "Airport Pickup" |
| `dining` | Utensils | Gold | "Thai Cuisine Dinner" |
| `accommodation` | Bed | Purple | "Hotel Check-in" |
| `other` | MapPin | Muted | "Thai Massage" |

## Props You Must Provide

1. **`days`** (required)
   - Array of Day objects
   - Each day has `id`, `date`, and `activities[]`

2. **`onReorder`** (required)
   - Called when activities are dragged between days
   - Signature: `(days: Day[]) => void`

## Optional Props

3. **`onEditActivity`** (optional but recommended)
   - Opens edit modal for activity
   - Signature: `(dayId: string, activity: Activity) => void`

4. **`onRemoveActivity`** (optional but recommended)
   - Removes activity from day
   - Signature: `(dayId: string, activityId: string) => void`

5. **`onAddActivity`** (optional but recommended)
   - Opens add activity modal
   - Signature: `(dayId: string) => void`

## Design System Notes

The component follows Golf Okay's design system:

- **Glass surfaces**: Uses `bg-surface-glass backdrop-blur-xl`
- **Accent colors**: Coral, Cyan, Gold, Purple for activity types
- **Rounded cards**: `rounded-card` (32px) for days, `rounded-lg` (16px) for activities
- **Text hierarchy**: `text-text-primary`, `text-text-secondary`, `text-text-muted`
- **Responsive**: Mobile-first with `sm:` and `lg:` breakpoints

## Testing Checklist

- [ ] Component renders without errors
- [ ] Activities can be dragged within same day
- [ ] Activities can be dragged between days
- [ ] Hover shows edit/remove buttons
- [ ] Click edit button triggers callback
- [ ] Click remove button removes activity
- [ ] Click + button triggers callback
- [ ] Keyboard navigation works (Tab + Arrow keys)
- [ ] Touch works on mobile devices
- [ ] Layout doesn't jump during drag
- [ ] Responsive on small screens

## Next Steps

1. **Test on audit page** - Add preview component to verify it works
2. **Implement handlers** - Add edit/add activity modals
3. **Integrate with context** - Connect to ItineraryContext
4. **Persist changes** - Save reordered activities to Supabase
5. **Add validation** - Prevent invalid activity moves (e.g., time conflicts)

## Dependencies

Already installed:
```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x",
  "framer-motion": "^12.x",
  "lucide-react": "^0.554.0"
}
```

## Support

For issues:
1. Check `InteractiveTimeline.md` for detailed docs
2. Review `InteractiveTimeline.example.tsx` for usage patterns
3. Test with `InteractiveTimeline.preview.tsx` on audit page
4. Check browser console for errors
5. Verify all dependencies are installed

## Performance Tips

1. **Memoize handlers** - Use `useCallback` for event handlers
2. **Memoize data** - Use `useMemo` for derived timeline data
3. **Limit re-renders** - Only update state when actually changed
4. **Optimize images** - Use Next.js Image component for activity icons

## Common Issues

**Activities won't drag**
- Check that each activity has a unique `id` prop
- Verify `onReorder` handler is provided

**Layout jumping**
- Ensure parent has `position: relative`
- Add Framer Motion `layout` prop to animated elements

**Touch not working**
- TouchSensor is already configured with proper constraints
- Test on actual device, not just browser emulator

**Type errors**
- Import types: `import { Day, Activity } from '@/components/InteractiveTimeline'`
- Ensure TypeScript version is 5.0+

## Example Data Structure

```typescript
const exampleDays: Day[] = [
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
      {
        id: 'act-2',
        title: 'Thai Dinner',
        type: 'dining',
        time: '7:00 PM',
        location: 'Riverside',
      },
    ],
  },
];
```

---

**Ready to integrate!** Start with the preview component on the audit page, then follow the integration steps for ItinerarySummary.
