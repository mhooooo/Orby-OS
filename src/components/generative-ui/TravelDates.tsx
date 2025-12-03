'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TravelDatesProps {
  onSubmit?: (dates: { start: Date; end: Date; nights: number }) => void;
  onAction?: (prompt: string) => void;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  className?: string;
}

const PRESETS = [
  { label: 'Weekend', nights: 2 },
  { label: 'Long weekend', nights: 3 },
  { label: '1 week', nights: 7 },
];

const MAX_NIGHTS = 14;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Get next Saturday from today
function getNextSaturday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7; // At least 1 day ahead
  const nextSat = new Date(today);
  nextSat.setDate(today.getDate() + daysUntilSaturday);
  nextSat.setHours(0, 0, 0, 0);
  return nextSat;
}

// Check if two dates are the same day
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Check if date is in range (inclusive)
function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const d = date.getTime();
  return d >= start.getTime() && d <= end.getTime();
}

// Check if date is before today
function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

// Format date for display
function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Calculate nights between two dates
function getNights(start: Date, end: Date): number {
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Get days in month grid (includes padding from prev/next months)
function getMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const grid: (Date | null)[] = [];

  // Padding for days before month starts
  for (let i = 0; i < startPadding; i++) {
    grid.push(null);
  }

  // Days of the month
  for (let day = 1; day <= totalDays; day++) {
    grid.push(new Date(year, month, day));
  }

  return grid;
}

export function TravelDates({
  onSubmit,
  onAction,
  autoAdvance = false,
  autoAdvanceDelay = 1000,
  className,
}: TravelDatesProps) {
  // Default to next Saturday + 3 nights
  const defaultStart = useMemo(() => getNextSaturday(), []);
  const defaultEnd = useMemo(() => {
    const end = new Date(defaultStart);
    end.setDate(defaultStart.getDate() + 2); // 3 nights = 2 days after start
    return end;
  }, [defaultStart]);

  const [startDate, setStartDate] = useState<Date | null>(defaultStart);
  const [endDate, setEndDate] = useState<Date | null>(defaultEnd);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = defaultStart;
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [isSelecting, setIsSelecting] = useState(false); // True after first tap, before second

  // Calculate nights
  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return getNights(startDate, endDate);
  }, [startDate, endDate]);

  // Is selection complete and valid?
  const isComplete = startDate !== null && endDate !== null && nights > 0 && nights <= MAX_NIGHTS;

  // Auto-advance timer
  useEffect(() => {
    if (!autoAdvance || !isComplete || !onSubmit) return;

    const timer = setTimeout(() => {
      onSubmit({ start: startDate!, end: endDate!, nights });
    }, autoAdvanceDelay);

    return () => clearTimeout(timer);
  }, [autoAdvance, autoAdvanceDelay, isComplete, onSubmit, startDate, endDate, nights]);

  // Handle day click
  const handleDayClick = useCallback((date: Date) => {
    if (isPast(date)) return;

    if (!isSelecting) {
      // First tap or tap on start to clear
      if (startDate && isSameDay(date, startDate)) {
        // Clear selection
        setStartDate(null);
        setEndDate(null);
      } else {
        // Set start date
        setStartDate(date);
        setEndDate(null);
        setIsSelecting(true);
      }
    } else {
      // Second tap - set end date
      if (date.getTime() < startDate!.getTime()) {
        // If before start, make this the new start
        setStartDate(date);
        setEndDate(null);
      } else {
        // Check max nights
        const potentialNights = getNights(startDate!, date);
        if (potentialNights > MAX_NIGHTS) {
          // Clamp to max
          const maxEnd = new Date(startDate!);
          maxEnd.setDate(startDate!.getDate() + MAX_NIGHTS);
          setEndDate(maxEnd);
        } else {
          setEndDate(date);
        }
        setIsSelecting(false);
      }
    }
  }, [isSelecting, startDate]);

  // Handle preset click
  const handlePreset = useCallback((presetNights: number) => {
    const start = startDate || new Date();
    if (isPast(start)) {
      // Use tomorrow if start is in past
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      setStartDate(tomorrow);
      const end = new Date(tomorrow);
      end.setDate(tomorrow.getDate() + presetNights);
      setEndDate(end);
    } else {
      const end = new Date(start);
      end.setDate(start.getDate() + presetNights);
      setEndDate(end);
    }
    setIsSelecting(false);
  }, [startDate]);

  // Navigate months
  const goToPrevMonth = useCallback(() => {
    setViewMonth(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  }, []);

  // Can go to previous month?
  const canGoPrev = useMemo(() => {
    const today = new Date();
    return viewMonth.year > today.getFullYear() ||
      (viewMonth.year === today.getFullYear() && viewMonth.month > today.getMonth());
  }, [viewMonth]);

  // Get calendar grid
  const calendarDays = useMemo(() => {
    return getMonthGrid(viewMonth.year, viewMonth.month);
  }, [viewMonth]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (isComplete && onSubmit) {
      onSubmit({ start: startDate!, end: endDate!, nights });
    }
  }, [isComplete, onSubmit, startDate, endDate, nights]);

  return (
    <motion.div
      className={cn(
        'w-full max-w-sm rounded-2xl overflow-hidden',
        'bg-zinc-900 border border-zinc-700',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Summary Line */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <AnimatePresence mode="wait">
          {startDate && endDate ? (
            <motion.p
              key="range"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-white font-medium"
            >
              {formatShortDate(startDate)} - {formatShortDate(endDate)}
              <span className="text-zinc-400 ml-2">
                {nights} {nights === 1 ? 'night' : 'nights'}
              </span>
            </motion.p>
          ) : startDate ? (
            <motion.p
              key="start-only"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-zinc-400"
            >
              {formatShortDate(startDate)} - Select end date
            </motion.p>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-zinc-400"
            >
              Select your travel dates
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Preset Chips */}
      <div className="px-4 py-3 flex gap-2 border-b border-zinc-800">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset.nights)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              nights === preset.nights && startDate && endDate
                ? 'bg-white text-zinc-900'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              canGoPrev
                ? 'hover:bg-zinc-800 text-zinc-300'
                : 'text-zinc-700 cursor-not-allowed'
            )}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-white">
            {MONTHS[viewMonth.month]} {viewMonth.year}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-medium text-zinc-500 uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const past = isPast(date);
            const isStart = startDate && isSameDay(date, startDate);
            const isEnd = endDate && isSameDay(date, endDate);
            const inRange = isInRange(date, startDate, endDate);
            const isToday = isSameDay(date, new Date());

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDayClick(date)}
                disabled={past}
                className={cn(
                  'aspect-square rounded-lg text-sm font-medium transition-all relative',
                  // Base states
                  past && 'text-zinc-700 cursor-not-allowed',
                  !past && !inRange && !isStart && !isEnd && 'text-zinc-300 hover:bg-zinc-800',
                  // Range highlight
                  inRange && !isStart && !isEnd && 'bg-zinc-800 text-white',
                  // Start/End
                  isStart && 'bg-white text-zinc-900',
                  isEnd && !isStart && 'bg-white text-zinc-900',
                  // Today indicator
                  isToday && !isStart && !isEnd && !inRange && 'ring-1 ring-zinc-600'
                )}
              >
                {date.getDate()}
                {/* Range connector */}
                {inRange && !isStart && (
                  <div className="absolute inset-y-0 -left-0.5 w-1 bg-zinc-800" />
                )}
                {inRange && !isEnd && (
                  <div className="absolute inset-y-0 -right-0.5 w-1 bg-zinc-800" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className={cn(
            'w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2',
            isComplete
              ? 'bg-white text-zinc-900 hover:bg-zinc-100'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          )}
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
