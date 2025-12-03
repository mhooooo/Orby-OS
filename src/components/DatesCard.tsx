'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Minus, Plus, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatesCardProps {
  dates: { start?: string; end?: string };
  groupSize: number;
  nonGolfers?: number;
  onDatesChange: (dates: { start?: string; end?: string }) => void;
  onGroupSizeChange: (size: number) => void;
  onNonGolfersChange?: (count: number) => void;
  className?: string;
}

const DURATION_OPTIONS = [
  { days: 1, label: '1 day' },
  { days: 2, label: '2 days' },
  { days: 3, label: '3 days' },
  { days: 4, label: '4 days' },
  { days: 5, label: '5 days' },
  { days: 6, label: '6 days' },
  { days: 7, label: '7+ days' },
];

export function DatesCard({
  dates,
  groupSize,
  nonGolfers = 0,
  onDatesChange,
  onGroupSizeChange,
  onNonGolfersChange,
  className,
}: DatesCardProps) {
  const [localStartDate, setLocalStartDate] = useState(dates.start || '');
  const [duration, setDuration] = useState<number>(() => {
    if (!dates.start || !dates.end) return 3;
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(7, Math.max(1, diffDays));
  });
  const [includeNonGolfers, setIncludeNonGolfers] = useState(nonGolfers > 0);

  // Calculate end date from start date and duration
  const endDate = useMemo(() => {
    if (!localStartDate) return '';
    const start = new Date(localStartDate);
    start.setDate(start.getDate() + duration - 1);
    return start.toISOString().split('T')[0];
  }, [localStartDate, duration]);

  // Get minimum date (tomorrow)
  const getMinDate = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  // Handle start date change
  const handleStartDateChange = useCallback((newStartDate: string) => {
    setLocalStartDate(newStartDate);
    if (newStartDate) {
      const start = new Date(newStartDate);
      start.setDate(start.getDate() + duration - 1);
      const newEndDate = start.toISOString().split('T')[0];
      onDatesChange({ start: newStartDate, end: newEndDate });
    }
  }, [duration, onDatesChange]);

  // Handle duration change
  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
    if (localStartDate) {
      const start = new Date(localStartDate);
      start.setDate(start.getDate() + newDuration - 1);
      const newEndDate = start.toISOString().split('T')[0];
      onDatesChange({ start: localStartDate, end: newEndDate });
    }
  }, [localStartDate, onDatesChange]);

  // Handle group size change
  const handleGroupChange = useCallback((delta: number) => {
    const newSize = Math.max(1, Math.min(16, groupSize + delta));
    onGroupSizeChange(newSize);
  }, [groupSize, onGroupSizeChange]);

  // Handle non-golfers change
  const handleNonGolfersChange = useCallback((delta: number) => {
    if (!onNonGolfersChange) return;
    const newCount = Math.max(0, Math.min(16, nonGolfers + delta));
    onNonGolfersChange(newCount);
  }, [nonGolfers, onNonGolfersChange]);

  // Toggle non-golfers
  const handleToggleNonGolfers = useCallback(() => {
    const newValue = !includeNonGolfers;
    setIncludeNonGolfers(newValue);
    if (!newValue && onNonGolfersChange) {
      onNonGolfersChange(0);
    } else if (newValue && nonGolfers === 0 && onNonGolfersChange) {
      onNonGolfersChange(1);
    }
  }, [includeNonGolfers, nonGolfers, onNonGolfersChange]);

  // Format date for display
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-text-primary mb-2">Travel Dates & Group</h3>
        <p className="text-text-muted">
          Set your trip dates and group size
        </p>
      </div>

      {/* Date Selection Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-card bg-surface-glass backdrop-blur-xl border border-white/10 p-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <Calendar size={20} className="text-text-secondary" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-text-primary">Travel Dates</h4>
            <p className="text-xs text-text-muted">When does your trip start?</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              min={getMinDate()}
              className={cn(
                'w-full p-3 rounded-lg bg-white/5 border border-white/10',
                'text-text-primary text-sm focus:outline-none focus:border-white/20',
                'appearance-none cursor-pointer transition-colors',
                '[color-scheme:dark]'
              )}
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
              Duration
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  onClick={() => handleDurationChange(option.days)}
                  className={cn(
                    'py-2 px-2 rounded-lg text-xs font-medium transition-all',
                    duration === option.days
                      ? 'bg-accent-coral/60 text-white'
                      : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/5'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Summary */}
          {localStartDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-lg bg-white/5 border border-white/5"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Your trip:</span>
                <span className="text-text-primary font-medium">
                  {formatDate(localStartDate)} → {formatDate(endDate)}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Group Size Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-card bg-surface-glass backdrop-blur-xl border border-white/10 p-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <Users size={20} className="text-text-secondary" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-text-primary">Golfers</h4>
            <p className="text-xs text-text-muted">How many players?</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 py-4">
          <button
            onClick={() => handleGroupChange(-1)}
            disabled={groupSize <= 1}
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center transition-all',
              groupSize <= 1
                ? 'bg-white/5 text-text-muted cursor-not-allowed'
                : 'bg-white/10 text-text-primary hover:bg-white/15'
            )}
          >
            <Minus size={20} />
          </button>

          <div className="text-center min-w-[80px]">
            <span className="text-4xl font-bold text-text-primary">{groupSize}</span>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-wide">
              {groupSize === 1 ? 'golfer' : 'golfers'}
            </p>
          </div>

          <button
            onClick={() => handleGroupChange(1)}
            disabled={groupSize >= 16}
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center transition-all',
              groupSize >= 16
                ? 'bg-white/5 text-text-muted cursor-not-allowed'
                : 'bg-white/10 text-text-primary hover:bg-white/15'
            )}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Quick select buttons */}
        <div className="mt-4 flex justify-center gap-2">
          {[2, 4, 8].map((size) => (
            <button
              key={size}
              onClick={() => onGroupSizeChange(size)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                groupSize === size
                  ? 'bg-accent-coral/60 text-white'
                  : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/5'
              )}
            >
              {size} {size === 4 ? 'Flight' : size === 8 ? 'Group' : ''}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Non-Golfers Section */}
      {onNonGolfersChange && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-card bg-surface-glass backdrop-blur-xl border border-white/10 p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <UserPlus size={20} className="text-text-secondary" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-text-primary">Non-Golfers</h4>
                <p className="text-xs text-text-muted">Include traveling companions?</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={handleToggleNonGolfers}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                includeNonGolfers ? 'bg-accent-coral/60' : 'bg-white/10'
              )}
            >
              <motion.div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
                animate={{
                  left: includeNonGolfers ? '22px' : '2px',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Non-Golfers Counter */}
          <AnimatePresence>
            {includeNonGolfers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-center gap-6 py-4 border-t border-white/5 mt-4 pt-5"
              >
                <button
                  onClick={() => handleNonGolfersChange(-1)}
                  disabled={nonGolfers <= 0}
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center transition-all',
                    nonGolfers <= 0
                      ? 'bg-white/5 text-text-muted cursor-not-allowed'
                      : 'bg-white/10 text-text-primary hover:bg-white/15'
                  )}
                >
                  <Minus size={20} />
                </button>

                <div className="text-center min-w-[80px]">
                  <span className="text-4xl font-bold text-text-primary">{nonGolfers}</span>
                  <p className="text-xs text-text-muted mt-1 uppercase tracking-wide">
                    {nonGolfers === 1 ? 'companion' : 'companions'}
                  </p>
                </div>

                <button
                  onClick={() => handleNonGolfersChange(1)}
                  disabled={nonGolfers >= 16}
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center transition-all',
                    nonGolfers >= 16
                      ? 'bg-white/5 text-text-muted cursor-not-allowed'
                      : 'bg-white/10 text-text-primary hover:bg-white/15'
                  )}
                >
                  <Plus size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
