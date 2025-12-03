'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Flag,
  Car,
  Utensils,
  Bed,
  MapPin,
  Plane,
  GripVertical,
  Plus,
  X,
  Sun,
  Sunset,
  Moon as MoonIcon,
  ChevronDown,
  Sparkles,
  Check,
  Clock,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
  Coffee,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced Activity interface
export interface Activity {
  id: string;
  title: string;
  type: 'golf' | 'transport' | 'dining' | 'accommodation' | 'arrival' | 'departure' | 'other';
  time?: string;
  duration?: string;
  location?: string;
  note?: string;
  // New fields
  image?: string;
  price?: number;
  status?: 'confirmed' | 'pending' | 'attention';
  travelTimeToNext?: number; // minutes
  details?: {
    subtitle?: string;
    description?: string;
    courseId?: string;
    signatureFeature?: string;
    inclusions?: string[];
  };
}

export interface Day {
  id: string;
  date: string;
  activities: Activity[];
}

interface InteractiveTimelineProps {
  days: Day[];
  onReorder: (days: Day[]) => void;
  onEditActivity?: (dayId: string, activity: Activity) => void;
  onRemoveActivity?: (dayId: string, activityId: string) => void;
  onAddActivity?: (dayId: string, type?: Activity['type']) => void;
  onSwapCourse?: (dayId: string, activityId: string) => void;
  className?: string;
  editable?: boolean;
  variant?: 'inline' | 'sticky';
  onExpandDay?: (dayId: string) => void;
}

// Placeholder images by activity type
const PLACEHOLDER_IMAGES: Record<Activity['type'], string> = {
  golf: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=200&q=80',
  transport: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&q=80',
  dining: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80',
  accommodation: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80',
  arrival: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=80',
  departure: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=80',
  other: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=200&q=80',
};

// Activity type styling configuration
const ACTIVITY_CONFIG = {
  golf: {
    icon: Flag,
    label: 'Golf',
    bgColor: 'bg-accent-coral/20',
    textColor: 'text-accent-coral',
    borderColor: 'border-accent-coral/30',
    glowColor: 'shadow-glow-coral',
  },
  transport: {
    icon: Car,
    label: 'Transfer',
    bgColor: 'bg-accent-cyan/20',
    textColor: 'text-accent-cyan',
    borderColor: 'border-accent-cyan/30',
    glowColor: 'shadow-glow-cyan',
  },
  dining: {
    icon: Utensils,
    label: 'Dining',
    bgColor: 'bg-accent-gold/20',
    textColor: 'text-accent-gold',
    borderColor: 'border-accent-gold/30',
    glowColor: 'shadow-glow-gold',
  },
  accommodation: {
    icon: Bed,
    label: 'Hotel',
    bgColor: 'bg-accent-purple/20',
    textColor: 'text-accent-purple',
    borderColor: 'border-accent-purple/30',
    glowColor: 'shadow-glow-purple',
  },
  arrival: {
    icon: Plane,
    label: 'Arrival',
    bgColor: 'bg-white/10',
    textColor: 'text-white',
    borderColor: 'border-white/20',
    glowColor: '',
  },
  departure: {
    icon: Plane,
    label: 'Departure',
    bgColor: 'bg-white/10',
    textColor: 'text-white',
    borderColor: 'border-white/20',
    glowColor: '',
  },
  other: {
    icon: MapPin,
    label: 'Activity',
    bgColor: 'bg-white/5',
    textColor: 'text-text-muted',
    borderColor: 'border-white/10',
    glowColor: '',
  },
};

// Quick add activity types
const QUICK_ADD_TYPES: { type: Activity['type']; label: string; icon: React.ElementType }[] = [
  { type: 'golf', label: 'Golf', icon: Flag },
  { type: 'transport', label: 'Transfer', icon: Car },
  { type: 'dining', label: 'Meal', icon: Utensils },
  { type: 'other', label: 'Other', icon: MapPin },
];

// Status indicator config
const STATUS_CONFIG = {
  confirmed: { color: 'bg-green-500', label: 'Confirmed' },
  pending: { color: 'bg-amber-500', label: 'Pending' },
  attention: { color: 'bg-red-500', label: 'Needs attention' },
};

// Time period icons
function getTimeIcon(time?: string) {
  if (!time) return Sun;
  const hour = parseInt(time.split(':')[0], 10);
  if (hour >= 6 && hour < 12) return Sun;
  if (hour >= 12 && hour < 18) return Sunset;
  return MoonIcon;
}

// Calculate day total price
function calculateDayTotal(activities: Activity[]): number {
  return activities.reduce((sum, act) => sum + (act.price || 0), 0);
}

// Check for gaps in schedule (3+ hours)
function findGaps(activities: Activity[]): number[] {
  const gaps: number[] = [];
  for (let i = 0; i < activities.length - 1; i++) {
    const travelTime = activities[i].travelTimeToNext || 0;
    // Simplified gap detection - if travel time suggests a big gap
    if (travelTime >= 180) {
      gaps.push(i);
    }
  }
  return gaps;
}

export function InteractiveTimeline({
  days,
  onReorder,
  onEditActivity,
  onRemoveActivity,
  onAddActivity,
  onSwapCourse,
  className,
  editable = true,
  variant = 'inline',
  onExpandDay,
}: InteractiveTimelineProps) {
  const [localDays, setLocalDays] = useState(days);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set(days.map((d) => d.id))
  );
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  // Sensor configuration for drag interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveActivityId(event.active.id as string);
  }, []);

  // Handle drag end - reorder activities between days
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveActivityId(null);

      if (!over || active.id === over.id) return;

      let sourceDayIndex = -1;
      let sourceActivityIndex = -1;
      let destDayIndex = -1;
      let destActivityIndex = -1;

      localDays.forEach((day, dayIdx) => {
        const actIdx = day.activities.findIndex((act) => act.id === active.id);
        if (actIdx !== -1) {
          sourceDayIndex = dayIdx;
          sourceActivityIndex = actIdx;
        }
        const destIdx = day.activities.findIndex((act) => act.id === over.id);
        if (destIdx !== -1) {
          destDayIndex = dayIdx;
          destActivityIndex = destIdx;
        }
      });

      if (sourceDayIndex === -1) return;

      const newDays = [...localDays];
      const [movedActivity] = newDays[sourceDayIndex].activities.splice(
        sourceActivityIndex,
        1
      );

      if (destDayIndex !== -1) {
        newDays[destDayIndex].activities.splice(destActivityIndex, 0, movedActivity);
      } else {
        const dayId = over.id as string;
        const dayIndex = newDays.findIndex((d) => d.id === dayId);
        if (dayIndex !== -1) {
          newDays[dayIndex].activities.push(movedActivity);
        }
      }

      setLocalDays(newDays);
      onReorder(newDays);
    },
    [localDays, onReorder]
  );

  // Toggle day expansion
  const toggleDay = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  // Toggle activity expansion
  const toggleActivity = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  // Get all activity IDs for sortable context
  const allActivityIds = localDays.flatMap((day) =>
    day.activities.map((activity) => activity.id)
  );

  // Calculate total trip cost
  const totalCost = localDays.reduce(
    (sum, day) => sum + calculateDayTotal(day.activities),
    0
  );

  // Total activities count
  const totalActivities = localDays.reduce((acc, d) => acc + d.activities.length, 0);

  // Sticky variant - compact sidebar version
  if (variant === 'sticky') {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {/* Sticky Header */}
        <div className="flex-shrink-0 p-3 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Your Trip</h3>
              <p className="text-xs text-text-muted">
                {localDays.length} days • {totalActivities} activities
              </p>
            </div>
            {totalCost > 0 && (
              <span className="text-sm font-bold text-accent-gold">
                ฿{totalCost.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Day List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-2 space-y-1">
            {localDays.map((day, dayIndex) => {
              const dayTotal = calculateDayTotal(day.activities);
              const golfCount = day.activities.filter(a => a.type === 'golf').length;

              return (
                <button
                  key={day.id}
                  onClick={() => onExpandDay?.(day.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg',
                    'bg-white/5 hover:bg-white/10 transition-colors',
                    'border border-transparent hover:border-white/10',
                    'text-left group'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Day number */}
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                        'bg-surface-glass border',
                        dayIndex === 0 ? 'border-accent-coral/50 text-accent-coral' :
                        dayIndex === localDays.length - 1 ? 'border-accent-purple/50 text-accent-purple' :
                        'border-accent-cyan/30 text-accent-cyan'
                      )}
                    >
                      {dayIndex + 1}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Day {dayIndex + 1}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span>{day.activities.length} activities</span>
                        {golfCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Flag size={10} className="text-accent-coral" />
                              {golfCount} rounds
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {dayTotal > 0 && (
                      <span className="text-xs font-medium text-accent-gold">
                        ฿{dayTotal.toLocaleString()}
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity -rotate-90"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Inline variant - full detailed version (default)
  return (
    <div className={cn('space-y-4', className)}>
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Your Trip</h2>
          <p className="text-sm text-text-muted">
            {localDays.length} days • {totalActivities} activities
          </p>
        </div>
        <div className="text-right">
          {totalCost > 0 && (
            <p className="text-lg font-bold text-accent-gold">
              ฿{totalCost.toLocaleString()}
            </p>
          )}
          {editable && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <GripVertical size={14} />
              <span>Drag to reorder</span>
            </div>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allActivityIds} strategy={verticalListSortingStrategy}>
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-accent-coral/50 via-accent-cyan/30 to-accent-purple/50" />

            {localDays.map((day, dayIndex) => (
              <TimelineDay
                key={day.id}
                day={day}
                dayIndex={dayIndex}
                totalDays={localDays.length}
                isExpanded={expandedDays.has(day.id)}
                expandedActivities={expandedActivities}
                onToggle={() => toggleDay(day.id)}
                onToggleActivity={toggleActivity}
                onEditActivity={onEditActivity}
                onRemoveActivity={onRemoveActivity}
                onAddActivity={onAddActivity}
                onSwapCourse={onSwapCourse}
                editable={editable}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeActivityId ? (
            <ActivityCardOverlay
              activity={
                localDays
                  .flatMap((d) => d.activities)
                  .find((a) => a.id === activeActivityId)!
              }
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Timeline Day Component
interface TimelineDayProps {
  day: Day;
  dayIndex: number;
  totalDays: number;
  isExpanded: boolean;
  expandedActivities: Set<string>;
  onToggle: () => void;
  onToggleActivity: (activityId: string) => void;
  onEditActivity?: (dayId: string, activity: Activity) => void;
  onRemoveActivity?: (dayId: string, activityId: string) => void;
  onAddActivity?: (dayId: string, type?: Activity['type']) => void;
  onSwapCourse?: (dayId: string, activityId: string) => void;
  editable: boolean;
}

function TimelineDay({
  day,
  dayIndex,
  totalDays,
  isExpanded,
  expandedActivities,
  onToggle,
  onToggleActivity,
  onEditActivity,
  onRemoveActivity,
  onAddActivity,
  onSwapCourse,
  editable,
}: TimelineDayProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const isFirst = dayIndex === 0;
  const isLast = dayIndex === totalDays - 1;

  // Calculate day total
  const dayTotal = calculateDayTotal(day.activities);

  // Find gaps for suggestions
  const gaps = findGaps(day.activities);

  // Get activity summary for collapsed view
  const activitySummary = day.activities
    .slice(0, 3)
    .map((a) => {
      const config = ACTIVITY_CONFIG[a.type];
      return { icon: config.icon, color: config.textColor };
    });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: dayIndex * 0.1 }}
      className="relative pl-12 pb-6"
    >
      {/* Day marker on timeline */}
      <div
        className={cn(
          'absolute left-0 w-10 h-10 rounded-full flex items-center justify-center z-10',
          'bg-surface-glass backdrop-blur-xl border',
          isFirst ? 'border-accent-coral text-accent-coral' :
          isLast ? 'border-accent-purple text-accent-purple' :
          'border-accent-cyan/50 text-accent-cyan'
        )}
      >
        <span className="text-sm font-bold">{dayIndex + 1}</span>
      </div>

      {/* Day Card */}
      <div
        className={cn(
          'bg-surface-glass backdrop-blur-xl border border-white/10 rounded-card overflow-hidden',
          'shadow-glass transition-all duration-300',
          isExpanded && 'ring-1 ring-white/10'
        )}
      >
        {/* Day Header - Clickable with Summary */}
        <button
          onClick={onToggle}
          className={cn(
            'w-full p-4 flex items-center justify-between',
            'hover:bg-white/5 transition-colors',
            'text-left'
          )}
        >
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Day {dayIndex + 1}
              </h3>
              <p className="text-sm text-text-muted">{formatDate(day.date)}</p>
            </div>

            {/* Collapsed activity icons */}
            {!isExpanded && activitySummary.length > 0 && (
              <div className="flex items-center gap-1 ml-4">
                {activitySummary.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={cn('p-1.5 rounded-lg bg-white/5', item.color)}
                    >
                      <Icon size={12} />
                    </div>
                  );
                })}
                {day.activities.length > 3 && (
                  <span className="text-xs text-text-muted ml-1">
                    +{day.activities.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Day summary: cost + count */}
          <div className="flex items-center gap-4">
            {dayTotal > 0 && (
              <span className="text-sm font-bold text-accent-gold">
                ฿{dayTotal.toLocaleString()}
              </span>
            )}
            <span className="text-xs text-text-muted">
              {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} className="text-text-muted" />
            </motion.div>
          </div>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-white/5">
                {/* Activities List */}
                <div className="space-y-1 mt-4">
                  {day.activities.length === 0 ? (
                    <div
                      className={cn(
                        'py-8 rounded-lg border-2 border-dashed border-white/10',
                        'flex flex-col items-center justify-center gap-2'
                      )}
                    >
                      <Sparkles size={24} className="text-text-muted" />
                      <p className="text-text-muted text-sm">No activities yet</p>
                      {editable && onAddActivity && (
                        <button
                          onClick={() => onAddActivity(day.id)}
                          className="text-xs text-accent-coral hover:text-accent-coral/80 transition-colors"
                        >
                          Add your first activity
                        </button>
                      )}
                    </div>
                  ) : (
                    day.activities.map((activity, actIdx) => (
                      <React.Fragment key={activity.id}>
                        <ActivityCard
                          activity={activity}
                          dayId={day.id}
                          isExpanded={expandedActivities.has(activity.id)}
                          onToggleExpand={() => onToggleActivity(activity.id)}
                          onEdit={editable ? onEditActivity : undefined}
                          onRemove={editable ? onRemoveActivity : undefined}
                          onSwapCourse={editable ? onSwapCourse : undefined}
                        />

                        {/* Travel time indicator OR Gap suggestion */}
                        {actIdx < day.activities.length - 1 && (
                          <TravelIndicator
                            travelTime={activity.travelTimeToNext}
                            hasGap={gaps.includes(actIdx)}
                            onAddActivity={
                              editable && onAddActivity
                                ? () => onAddActivity(day.id)
                                : undefined
                            }
                          />
                        )}
                      </React.Fragment>
                    ))
                  )}
                </div>

                {/* Quick Add Bar */}
                {editable && onAddActivity && day.activities.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    {showQuickAdd ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2"
                      >
                        {QUICK_ADD_TYPES.map((item) => {
                          const Icon = item.icon;
                          const config = ACTIVITY_CONFIG[item.type];
                          return (
                            <button
                              key={item.type}
                              onClick={() => {
                                onAddActivity(day.id, item.type);
                                setShowQuickAdd(false);
                              }}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-full',
                                'border transition-all',
                                config.bgColor,
                                config.borderColor,
                                config.textColor,
                                'hover:scale-105'
                              )}
                            >
                              <Icon size={14} />
                              <span className="text-xs font-medium">{item.label}</span>
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setShowQuickAdd(false)}
                          className="p-2 rounded-full bg-white/5 text-text-muted hover:bg-white/10 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setShowQuickAdd(true)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-full',
                          'bg-white/5 hover:bg-white/10',
                          'border border-white/10 hover:border-white/20',
                          'text-text-muted hover:text-text-primary',
                          'transition-all duration-200 text-sm'
                        )}
                      >
                        <Plus size={14} />
                        Add activity
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Travel Time Indicator Component
interface TravelIndicatorProps {
  travelTime?: number;
  hasGap?: boolean;
  onAddActivity?: () => void;
}

function TravelIndicator({ travelTime, hasGap, onAddActivity }: TravelIndicatorProps) {
  if (hasGap && onAddActivity) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-2"
      >
        <button
          onClick={onAddActivity}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full',
            'bg-accent-gold/10 border border-accent-gold/20',
            'text-accent-gold text-xs font-medium',
            'hover:bg-accent-gold/20 transition-colors'
          )}
        >
          <Coffee size={12} />
          <span>Free time - add activity?</span>
        </button>
      </motion.div>
    );
  }

  if (!travelTime) {
    return (
      <div className="flex items-center justify-center py-1">
        <div className="w-px h-4 bg-white/10" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-2 gap-2">
      <div className="flex items-center gap-1.5 text-text-muted">
        <Car size={12} />
        <span className="text-xs">{travelTime} min</span>
      </div>
    </div>
  );
}

// Enhanced Activity Card Component
interface ActivityCardProps {
  activity: Activity;
  dayId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit?: (dayId: string, activity: Activity) => void;
  onRemove?: (dayId: string, activityId: string) => void;
  onSwapCourse?: (dayId: string, activityId: string) => void;
}

function ActivityCard({
  activity,
  dayId,
  isExpanded,
  onToggleExpand,
  onEdit,
  onRemove,
  onSwapCourse,
}: ActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const config = ACTIVITY_CONFIG[activity.type];
  const Icon = config.icon;
  const TimeIcon = getTimeIcon(activity.time);
  const statusConfig = activity.status ? STATUS_CONFIG[activity.status] : null;
  const imageUrl = activity.image || PLACEHOLDER_IMAGES[activity.type];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={cn(
        'group relative rounded-cardSmall overflow-hidden',
        'bg-background-card border',
        config.borderColor,
        'hover:border-white/30 transition-all duration-200',
        isDragging && 'ring-2 ring-accent-coral shadow-lg z-50',
        isExpanded && 'shadow-glass'
      )}
    >
      {/* Main Card Content - Clickable */}
      <button
        onClick={onToggleExpand}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3 p-3">
          {/* Drag Handle */}
          {(onEdit || onRemove) && (
            <div
              {...attributes}
              {...listeners}
              className={cn(
                'flex-shrink-0 cursor-grab active:cursor-grabbing',
                'text-text-muted hover:text-text-primary',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'p-1 -ml-1 -mt-0.5'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={14} />
            </div>
          )}

          {/* Thumbnail Image */}
          <div className="relative flex-shrink-0 w-14 h-14 rounded-md overflow-hidden">
            <img
              src={imageUrl}
              alt={activity.title}
              className="w-full h-full object-cover"
            />
            {/* Status indicator overlay */}
            {statusConfig && (
              <div
                className={cn(
                  'absolute top-1 right-1 w-2 h-2 rounded-full',
                  statusConfig.color
                )}
                title={statusConfig.label}
              />
            )}
            {/* Type icon overlay */}
            <div
              className={cn(
                'absolute bottom-0 right-0 p-1 rounded-tl-md',
                config.bgColor
              )}
            >
              <Icon size={10} className={config.textColor} />
            </div>
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-text-primary text-sm leading-tight">
                {activity.title}
              </h4>
              {activity.price && (
                <span className="text-xs font-bold text-accent-gold flex-shrink-0">
                  ฿{activity.price.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted mt-1">
              {activity.time && (
                <div className="flex items-center gap-1">
                  <TimeIcon size={10} className="opacity-50" />
                  <span>{activity.time}</span>
                </div>
              )}
              {activity.duration && (
                <span className="px-1.5 py-0.5 rounded bg-white/5">
                  {activity.duration}
                </span>
              )}
              {activity.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={10} />
                  <span className="truncate max-w-[100px]">{activity.location}</span>
                </div>
              )}
            </div>

            {/* Signature feature for golf */}
            {activity.type === 'golf' && activity.details?.signatureFeature && (
              <p className="text-xs text-accent-coral mt-1">
                {activity.details.signatureFeature}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-2 border-t border-white/5 space-y-3">
              {/* Description */}
              {activity.details?.description && (
                <p className="text-xs text-text-secondary">
                  {activity.details.description}
                </p>
              )}

              {/* Inclusions */}
              {activity.details?.inclusions && activity.details.inclusions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    Includes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activity.details.inclusions.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-secondary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              {statusConfig && (
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', statusConfig.color)} />
                  <span className="text-xs text-text-muted">{statusConfig.label}</span>
                </div>
              )}

              {/* Action Buttons */}
              {(onEdit || onRemove || onSwapCourse) && (
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  {activity.type === 'golf' && onSwapCourse && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwapCourse(dayId, activity.id);
                      }}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                        'bg-accent-coral/10 border border-accent-coral/20',
                        'text-accent-coral text-xs font-medium',
                        'hover:bg-accent-coral/20 transition-colors'
                      )}
                    >
                      <RefreshCw size={12} />
                      Swap course
                    </button>
                  )}

                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(dayId, activity);
                      }}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                        'bg-white/5 border border-white/10',
                        'text-text-muted text-xs font-medium',
                        'hover:bg-white/10 hover:text-text-primary transition-colors'
                      )}
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                  )}

                  {onRemove && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(dayId, activity.id);
                      }}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                        'bg-red-500/10 border border-red-500/20',
                        'text-red-400 text-xs font-medium',
                        'hover:bg-red-500/20 transition-colors'
                      )}
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Drag Overlay Component
function ActivityCardOverlay({ activity }: { activity: Activity }) {
  const config = ACTIVITY_CONFIG[activity.type];
  const Icon = config.icon;
  const imageUrl = activity.image || PLACEHOLDER_IMAGES[activity.type];

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-cardSmall',
        'bg-background-card border',
        config.borderColor,
        'shadow-2xl ring-2 ring-accent-coral',
        'min-w-[280px] opacity-90 scale-105'
      )}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden">
        <img
          src={imageUrl}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-text-primary text-sm truncate">
          {activity.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {activity.time && <span>{activity.time}</span>}
          {activity.duration && <span>• {activity.duration}</span>}
        </div>
      </div>

      <div className={cn('p-2 rounded-lg', config.bgColor)}>
        <Icon size={16} className={config.textColor} />
      </div>
    </div>
  );
}

// Helper function to format date
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
