'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatesCardProps {
  startDate?: Date;
  duration?: number;
  onDateChange?: (date: Date) => void;
  onDurationChange?: (days: number) => void;
  onAction?: (prompt: string) => void;
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
  startDate: initialStartDate,
  duration: initialDuration = 3,
  onDateChange,
  onDurationChange,
  onAction,
  className,
}: DatesCardProps) {
  const [localStartDate, setLocalStartDate] = useState<string>(() => {
    if (initialStartDate) {
      return initialStartDate.toISOString().split('T')[0];
    }
    return '';
  });
  const [duration, setDuration] = useState(initialDuration);

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
    if (newStartDate && onDateChange) {
      onDateChange(new Date(newStartDate));
    }
  }, [onDateChange]);

  // Handle duration change
  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
    onDurationChange?.(newDuration);
  }, [onDurationChange]);

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
    <motion.div
      className={cn(
        'relative w-full max-w-md rounded-card overflow-hidden',
        'bg-surface-glass backdrop-blur-xl border border-white/10',
        'shadow-glass',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-button bg-white/10 text-text-secondary">
            <Calendar size={20} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Travel Dates</h2>
        </div>
        <p className="text-text-muted text-sm pl-11">
          When does your trip start?
        </p>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
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
                    ? 'bg-white text-background-base'
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
            className="p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Your trip:</span>
              <span className="text-text-primary font-bold">
                {formatDate(localStartDate)} → {formatDate(endDate)}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Prompt */}
      {onAction && (
        <div className="px-5 pb-5">
          <button
            onClick={() => onAction('What are the best dates for a golf trip to Thailand?')}
            className="w-full flex items-center gap-3 p-4 rounded-button bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group cursor-pointer"
          >
            <MessageCircle size={16} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
            <span className="text-sm text-text-secondary">
              Not sure when to go?{' '}
              <span className="text-text-primary font-medium">Ask for recommendations</span>
            </span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
