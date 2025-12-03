/**
 * InteractiveTimeline - Usage Example
 *
 * This file demonstrates how to use the InteractiveTimeline component
 * in your application.
 */

'use client';

import { useState } from 'react';
import { InteractiveTimeline, Day, Activity } from '@/components/InteractiveTimeline';

export function TimelineExample() {
  // Sample data
  const [days, setDays] = useState<Day[]>([
    {
      id: 'day-1',
      date: '2024-12-15',
      activities: [
        {
          id: 'act-1',
          title: 'Airport Pickup',
          type: 'transport',
          time: '10:00 AM',
          duration: '45 min',
          location: 'Suvarnabhumi Airport',
        },
        {
          id: 'act-2',
          title: 'Hotel Check-in',
          type: 'accommodation',
          time: '11:30 AM',
          location: 'The Peninsula Bangkok',
        },
        {
          id: 'act-3',
          title: 'Alpine Golf Club',
          type: 'golf',
          time: '2:00 PM',
          duration: '4-5 hours',
          location: 'Pathum Thani',
        },
      ],
    },
    {
      id: 'day-2',
      date: '2024-12-16',
      activities: [
        {
          id: 'act-4',
          title: 'Nikanti Golf Club',
          type: 'golf',
          time: '8:00 AM',
          duration: '4-5 hours',
          location: 'Pathum Thani',
        },
        {
          id: 'act-5',
          title: 'Thai Cuisine Dinner',
          type: 'dining',
          time: '7:00 PM',
          location: 'Siam Paragon',
        },
      ],
    },
    {
      id: 'day-3',
      date: '2024-12-17',
      activities: [
        {
          id: 'act-6',
          title: 'Thai Country Club',
          type: 'golf',
          time: '9:00 AM',
          duration: '4-5 hours',
          location: 'Bangkok',
        },
        {
          id: 'act-7',
          title: 'Airport Transfer',
          type: 'transport',
          time: '4:00 PM',
          duration: '1 hour',
          location: 'To Suvarnabhumi Airport',
        },
      ],
    },
  ]);

  // Handler functions
  const handleReorder = (updatedDays: Day[]) => {
    console.log('Days reordered:', updatedDays);
    setDays(updatedDays);
  };

  const handleEditActivity = (dayId: string, activity: Activity) => {
    console.log('Edit activity:', dayId, activity);
    // Implement edit modal or form
    // For now, just log
  };

  const handleRemoveActivity = (dayId: string, activityId: string) => {
    console.log('Remove activity:', dayId, activityId);
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: day.activities.filter((act) => act.id !== activityId),
            }
          : day
      )
    );
  };

  const handleAddActivity = (dayId: string) => {
    console.log('Add activity to day:', dayId);
    // Implement add activity modal or form
    // Example: Add a placeholder activity
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: 'New Activity',
      type: 'other',
      time: '12:00 PM',
    };

    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              activities: [...day.activities, newActivity],
            }
          : day
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Your Golf Trip Timeline
        </h1>
        <p className="text-text-muted">
          Drag activities to reorder them between days
        </p>
      </div>

      <InteractiveTimeline
        days={days}
        onReorder={handleReorder}
        onEditActivity={handleEditActivity}
        onRemoveActivity={handleRemoveActivity}
        onAddActivity={handleAddActivity}
      />
    </div>
  );
}

/**
 * INTEGRATION NOTES:
 *
 * 1. Replace ItinerarySummary's Timeline component:
 *    - Currently shows static timeline (lines 313-393 in ItinerarySummary.tsx)
 *    - Replace with InteractiveTimeline for drag-drop functionality
 *
 * 2. Data structure mapping:
 *    - Convert ItineraryDraft.days to Day[] format
 *    - Map Activity types appropriately
 *
 * 3. State management:
 *    - Store reordered activities in ItineraryContext
 *    - Persist changes to Supabase when user saves draft
 *
 * 4. Activity types mapping:
 *    - 'golf' -> Golf rounds (Flag icon, coral accent)
 *    - 'transport' -> Airport/hotel transfers (Car icon, cyan accent)
 *    - 'dining' -> Meals (Utensils icon, gold accent)
 *    - 'accommodation' -> Hotel check-in/out (Bed icon, purple accent)
 *    - 'other' -> Custom activities (MapPin icon, muted)
 *
 * 5. Event handlers:
 *    - onReorder: Update state + persist to database
 *    - onEditActivity: Open modal to edit activity details
 *    - onRemoveActivity: Delete activity from day
 *    - onAddActivity: Open modal to add new activity
 *
 * Example integration in ItinerarySummary:
 *
 * ```tsx
 * import { InteractiveTimeline } from '@/components/InteractiveTimeline';
 *
 * // Convert draft to timeline format
 * const timelineDays = useMemo(() =>
 *   generateTimelineDays(draft, courses),
 *   [draft, courses]
 * );
 *
 * // Replace Timeline component with:
 * <InteractiveTimeline
 *   days={timelineDays}
 *   onReorder={handleReorderDays}
 *   onEditActivity={handleEditActivity}
 *   onRemoveActivity={handleRemoveActivity}
 *   onAddActivity={handleAddActivity}
 * />
 * ```
 */
