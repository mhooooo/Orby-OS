/**
 * InteractiveTimeline Preview Component
 * Enhanced with imagery, pricing, status, and travel times
 */

'use client';

import { useState } from 'react';
import { InteractiveTimeline, Day, Activity } from '@/components/InteractiveTimeline';

// Enhanced mock data with all new fields
const INITIAL_DAYS: Day[] = [
  {
    id: 'day-1',
    date: '2024-12-15',
    activities: [
      {
        id: 'act-1',
        title: 'Airport Arrival & Pickup',
        type: 'arrival',
        time: '10:00 AM',
        duration: '45 min',
        location: 'Suvarnabhumi Airport',
        status: 'confirmed',
        price: 1500,
        travelTimeToNext: 45,
        details: {
          description: 'Private airport pickup with meet & greet service.',
          inclusions: ['Meet & greet', 'Private vehicle', 'Bottled water'],
        },
      },
      {
        id: 'act-2',
        title: 'The Peninsula Bangkok',
        type: 'accommodation',
        time: '11:30 AM',
        location: 'Charoenkrung Road',
        status: 'confirmed',
        price: 8500,
        travelTimeToNext: 35,
        details: {
          description: 'Luxury 5-star hotel with stunning river views.',
          inclusions: ['Breakfast', 'River shuttle', 'Spa access'],
        },
      },
      {
        id: 'act-3',
        title: 'Alpine Golf Club',
        type: 'golf',
        time: '2:00 PM',
        duration: '4-5 hours',
        location: 'Pathum Thani',
        status: 'confirmed',
        price: 4200,
        travelTimeToNext: 25,
        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=200&q=80',
        details: {
          signatureFeature: '🏆 Championship Course',
          description: 'One of Thailand\'s premier courses, featuring 27 holes.',
          courseId: 'alpine-golf',
          inclusions: ['Green fee', 'Caddie', 'Golf cart', 'Locker'],
        },
      },
      {
        id: 'act-4',
        title: 'Welcome Dinner',
        type: 'dining',
        time: '7:30 PM',
        duration: '2 hours',
        location: 'Vertigo Restaurant',
        status: 'pending',
        price: 3500,
        details: {
          description: 'Rooftop Thai-fusion dining with city views.',
          inclusions: ['Set menu', 'Welcome drink'],
        },
      },
    ],
  },
  {
    id: 'day-2',
    date: '2024-12-16',
    activities: [
      {
        id: 'act-5',
        title: 'Nikanti Golf Club',
        type: 'golf',
        time: '7:30 AM',
        duration: '4-5 hours',
        location: 'Nakhon Pathom',
        status: 'confirmed',
        price: 5800,
        travelTimeToNext: 180, // 3 hour gap - will trigger suggestion
        image: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=200&q=80',
        details: {
          signatureFeature: '⭐ Thailand\'s #1 Rated',
          description: 'Award-winning course with 18 unique holes and no parallel fairways.',
          courseId: 'nikanti-golf',
          inclusions: ['Green fee', 'Caddie', 'Golf cart', 'Lunch'],
        },
      },
      {
        id: 'act-6',
        title: 'Thai Cuisine Dinner',
        type: 'dining',
        time: '7:00 PM',
        duration: '2 hours',
        location: 'Siam Paragon',
        status: 'pending',
        price: 2800,
        details: {
          description: 'Authentic Thai fine dining experience.',
        },
      },
    ],
  },
  {
    id: 'day-3',
    date: '2024-12-17',
    activities: [
      {
        id: 'act-7',
        title: 'Thai Country Club',
        type: 'golf',
        time: '8:00 AM',
        duration: '4-5 hours',
        location: 'Bangkok',
        status: 'attention',
        price: 6500,
        travelTimeToNext: 45,
        image: 'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=200&q=80',
        details: {
          signatureFeature: '🌙 Night Golf Available',
          description: 'Historic course with exceptional night golf facilities.',
          courseId: 'thai-country-club',
          inclusions: ['Green fee', 'Caddie', 'Golf cart'],
        },
      },
      {
        id: 'act-8',
        title: 'Hotel Checkout',
        type: 'accommodation',
        time: '2:00 PM',
        location: 'The Peninsula Bangkok',
        status: 'confirmed',
        travelTimeToNext: 60,
      },
      {
        id: 'act-9',
        title: 'Airport Transfer',
        type: 'departure',
        time: '4:00 PM',
        duration: '1 hour',
        location: 'To Suvarnabhumi Airport',
        status: 'confirmed',
        price: 1500,
        details: {
          description: 'Private transfer to airport for departure.',
          inclusions: ['Private vehicle', 'Luggage assistance'],
        },
      },
    ],
  },
];

export function InteractiveTimelinePreview() {
  const [days, setDays] = useState<Day[]>(INITIAL_DAYS);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const logAction = (message: string) => {
    setActionLog((prev) => [message, ...prev].slice(0, 10));
  };

  const handleReorder = (updatedDays: Day[]) => {
    setDays(updatedDays);
    logAction('Activities reordered');
  };

  const handleEditActivity = (dayId: string, activity: Activity) => {
    logAction(`Edit: ${activity.title} (Day ID: ${dayId})`);
  };

  const handleRemoveActivity = (dayId: string, activityId: string) => {
    const activity = days
      .find((d) => d.id === dayId)
      ?.activities.find((a) => a.id === activityId);

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

    logAction(`Removed: ${activity?.title || activityId}`);
  };

  const handleAddActivity = (dayId: string, type?: Activity['type']) => {
    const activityType = type || 'other';
    const typeLabels: Record<Activity['type'], string> = {
      golf: 'New Golf Round',
      transport: 'New Transfer',
      dining: 'New Meal',
      accommodation: 'New Hotel',
      arrival: 'Arrival',
      departure: 'Departure',
      other: 'New Activity',
    };

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: typeLabels[activityType],
      type: activityType,
      time: '12:00 PM',
      duration: '1 hour',
      status: 'pending',
      price: activityType === 'golf' ? 4000 : activityType === 'dining' ? 2000 : 1000,
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

    logAction(`Added ${activityType} activity to Day ${dayId}`);
  };

  const handleSwapCourse = (dayId: string, activityId: string) => {
    const activity = days
      .find((d) => d.id === dayId)
      ?.activities.find((a) => a.id === activityId);

    logAction(`Swap course requested: ${activity?.title}`);
    // In real app, this would open a course picker modal
  };

  const handleReset = () => {
    setDays(INITIAL_DAYS);
    setActionLog([]);
    logAction('Timeline reset to initial state');
  };

  // Calculate total trip cost
  const totalCost = days.reduce(
    (sum, day) =>
      sum + day.activities.reduce((daySum, act) => daySum + (act.price || 0), 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">InteractiveTimeline v2</h2>
          <p className="text-text-muted text-sm max-w-2xl">
            Enhanced with imagery, pricing, status indicators, travel times, and expandable details.
            Click cards to expand, drag to reorder, use &quot;Swap course&quot; for golf activities.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-text-muted">Trip Total</p>
            <p className="text-xl font-bold text-accent-gold">฿{totalCost.toLocaleString()}</p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-button text-text-primary text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InteractiveTimeline
            days={days}
            onReorder={handleReorder}
            onEditActivity={handleEditActivity}
            onRemoveActivity={handleRemoveActivity}
            onAddActivity={handleAddActivity}
            onSwapCourse={handleSwapCourse}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Action Log */}
            <div className="bg-surface-glass backdrop-blur-xl border border-white/10 rounded-card p-4 shadow-glass">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
                Action Log
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {actionLog.length === 0 ? (
                  <p className="text-xs text-text-muted">No actions yet...</p>
                ) : (
                  actionLog.map((action, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-text-secondary p-2 bg-background-card rounded-lg border border-white/5"
                    >
                      {action}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="bg-surface-glass backdrop-blur-xl border border-white/10 rounded-card p-4 shadow-glass">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
                New Features
              </h3>
              <ul className="text-xs text-text-secondary space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accent-coral">•</span>
                  <span>Thumbnail images on activity cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>Status indicators (confirmed/pending/attention)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold">•</span>
                  <span>Pricing per activity + day totals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-purple">•</span>
                  <span>Travel time indicators between activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Expandable cards with details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>Gap suggestions (3+ hour free time)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-muted">•</span>
                  <span>&quot;Swap course&quot; action for golf</span>
                </li>
              </ul>
            </div>

            {/* Instructions */}
            <div className="bg-accent-cyanMuted border border-accent-cyan/20 rounded-lg p-4">
              <h4 className="text-xs font-bold text-accent-cyan mb-2 uppercase tracking-wider">
                Try This:
              </h4>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>• Click any card to expand details</li>
                <li>• Look for gap suggestion on Day 2</li>
                <li>• Note the ⚠️ attention status on Day 3</li>
                <li>• Drag activities between days</li>
                <li>• Click &quot;Swap course&quot; on golf cards</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
