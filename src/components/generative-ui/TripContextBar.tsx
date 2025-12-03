'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Flag, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TripContextBarProps {
  dates?: { start: Date; end: Date };
  duration?: number;
  golfers?: number;
  nonGolfers?: number;
  regions?: string[];
  coursesCount?: number;
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

// Format date range helper
function formatDateRange(dates: { start: Date; end: Date }): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = dates.start.toLocaleDateString('en-US', options);
  const end = dates.end.toLocaleDateString('en-US', options);

  // Same month
  if (dates.start.getMonth() === dates.end.getMonth()) {
    return `${start.split(' ')[0]} ${dates.start.getDate()}-${dates.end.getDate()}`;
  }

  return `${start} - ${end}`;
}

// Region display name mapping
const REGION_NAMES: Record<string, string> = {
  bangkok: 'Bangkok',
  pattaya: 'Pattaya',
  hua_hin: 'Hua Hin',
  phuket: 'Phuket',
  chiang_mai: 'Chiang Mai',
  khao_yai: 'Khao Yai',
};

export function TripContextBar({
  dates,
  duration,
  golfers,
  nonGolfers,
  regions,
  coursesCount,
  className,
  variant = 'horizontal',
}: TripContextBarProps) {
  const totalTravelers = (golfers || 0) + (nonGolfers || 0);
  const hasContent = dates || duration || golfers || regions?.length || coursesCount;

  if (!hasContent) return null;

  const items = [
    // Dates
    dates && {
      icon: Calendar,
      label: formatDateRange(dates),
      color: 'text-accent-cyan',
    },
    // Duration (if no dates but duration provided)
    !dates && duration && {
      icon: Clock,
      label: `${duration} days`,
      color: 'text-accent-cyan',
    },
    // Golfers
    golfers && {
      icon: Users,
      label: nonGolfers
        ? `${golfers} golfers, ${nonGolfers} guests`
        : `${golfers} golfer${golfers > 1 ? 's' : ''}`,
      color: 'text-text-muted',
    },
    // Regions
    regions && regions.length > 0 && {
      icon: MapPin,
      label: regions.map(r => REGION_NAMES[r] || r).join(', '),
      color: 'text-text-muted',
    },
    // Courses
    coursesCount && {
      icon: Flag,
      label: `${coursesCount} course${coursesCount > 1 ? 's' : ''}`,
      color: 'text-accent-coral',
    },
  ].filter(Boolean) as { icon: React.ElementType; label: string; color: string }[];

  // Vertical variant - stacked items
  if (variant === 'vertical') {
    return (
      <motion.div
        className={cn(
          'p-3 rounded-xl bg-surface-glass border border-white/10 space-y-2',
          className
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-2">
          Trip Details
        </p>
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2 text-sm"
            >
              <Icon size={14} className={item.color} />
              <span className="text-text-secondary">{item.label}</span>
            </div>
          );
        })}
      </motion.div>
    );
  }

  // Horizontal variant - inline bar (default)
  return (
    <motion.div
      className={cn(
        'flex flex-wrap items-center gap-3 p-3 rounded-xl bg-surface-glass border border-white/10',
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <div className="w-px h-4 bg-white/10" />
            )}
            <div className="flex items-center gap-1.5 text-sm">
              <Icon size={14} className={item.color} />
              <span className="text-text-secondary">{item.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </motion.div>
  );
}

export default TripContextBar;
