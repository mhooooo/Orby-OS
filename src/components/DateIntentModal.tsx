'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DateIntentData) => void;
  initialGolfers?: number;
}

export interface DateIntentData {
  datePreference: 'this_week' | 'next_week' | 'specific';
  specificDate?: string;
  timePreference: 'morning' | 'afternoon' | 'flexible';
  golfers: number;
}

const DATE_OPTIONS = [
  { value: 'this_week', label: 'This week' },
  { value: 'next_week', label: 'Next week' },
  { value: 'specific', label: 'Specific date' },
] as const;

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning', description: 'Before 12pm' },
  { value: 'afternoon', label: 'Afternoon', description: 'After 12pm' },
  { value: 'flexible', label: 'Flexible', description: 'Any time' },
] as const;

export function DateIntentModal({
  isOpen,
  onClose,
  onSubmit,
  initialGolfers = 4,
}: DateIntentModalProps) {
  const [datePreference, setDatePreference] = useState<DateIntentData['datePreference']>('this_week');
  const [specificDate, setSpecificDate] = useState('');
  const [timePreference, setTimePreference] = useState<DateIntentData['timePreference']>('flexible');
  const [golfers, setGolfers] = useState(initialGolfers);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    onSubmit({
      datePreference,
      specificDate: datePreference === 'specific' ? specificDate : undefined,
      timePreference,
      golfers,
    });

    setIsSubmitting(false);
  };

  const handleDismiss = () => {
    onClose();
  };

  // Get min date for date picker (today)
  const minDate = new Date().toISOString().split('T')[0];
  // Get max date (3 months from now)
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - subtle, doesn't fully block */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={handleDismiss}
          />

          {/* Modal - slides up from bottom on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50',
              'bottom-0 left-0 right-0 sm:bottom-auto sm:left-1/2 sm:top-1/2',
              'sm:-translate-x-1/2 sm:-translate-y-1/2',
              'w-full sm:w-auto sm:max-w-md'
            )}
          >
            <div
              className={cn(
                'bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass',
                'rounded-t-card sm:rounded-card',
                'p-5 sm:p-6'
              )}
            >
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Quick question
                </h3>
                <p className="text-sm text-text-muted">
                  When are you thinking of playing? We&apos;ll check availability as you browse.
                </p>
              </div>

              {/* Date preference */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-xs font-medium text-text-muted uppercase tracking-wider mb-2.5">
                  <Calendar size={12} />
                  When
                </label>
                <div className="flex gap-2">
                  {DATE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDatePreference(option.value)}
                      className={cn(
                        'flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all',
                        datePreference === option.value
                          ? 'bg-white text-background-base'
                          : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Specific date picker */}
                <AnimatePresence>
                  {datePreference === 'specific' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="date"
                        value={specificDate}
                        onChange={(e) => setSpecificDate(e.target.value)}
                        min={minDate}
                        max={maxDate}
                        className={cn(
                          'w-full mt-2.5 px-3 py-2.5 rounded-lg',
                          'bg-white/5 border border-white/10 text-text-primary',
                          'focus:outline-none focus:ring-1 focus:ring-white/20',
                          '[color-scheme:dark]'
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Time preference */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-xs font-medium text-text-muted uppercase tracking-wider mb-2.5">
                  <Clock size={12} />
                  Time
                </label>
                <div className="flex gap-2">
                  {TIME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimePreference(option.value)}
                      className={cn(
                        'flex-1 py-2 px-2 rounded-lg text-center transition-all',
                        timePreference === option.value
                          ? 'bg-white text-background-base'
                          : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
                      )}
                    >
                      <span className="text-sm font-medium block">{option.label}</span>
                      <span className={cn(
                        'text-[10px]',
                        timePreference === option.value ? 'text-background-base/70' : 'text-text-muted'
                      )}>
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Golfers */}
              <div className="mb-5">
                <label className="flex items-center gap-2 text-xs font-medium text-text-muted uppercase tracking-wider mb-2.5">
                  <Users size={12} />
                  Golfers
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGolfers(Math.max(1, golfers - 1))}
                    disabled={golfers <= 1}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-lg font-medium transition-all',
                      golfers <= 1
                        ? 'bg-white/5 text-text-muted cursor-not-allowed'
                        : 'bg-white/10 text-text-primary hover:bg-white/15'
                    )}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xl font-bold text-text-primary">
                    {golfers}
                  </span>
                  <button
                    onClick={() => setGolfers(Math.min(16, golfers + 1))}
                    disabled={golfers >= 16}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-lg font-medium transition-all',
                      golfers >= 16
                        ? 'bg-white/5 text-text-muted cursor-not-allowed'
                        : 'bg-white/10 text-text-primary hover:bg-white/15'
                    )}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (datePreference === 'specific' && !specificDate)}
                  className={cn(
                    'w-full py-3 rounded-button font-bold text-sm transition-all flex items-center justify-center gap-2',
                    isSubmitting || (datePreference === 'specific' && !specificDate)
                      ? 'bg-white/10 text-text-muted cursor-not-allowed'
                      : 'bg-white text-background-base hover:bg-gray-100'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-background-base/30 border-t-background-base rounded-full"
                      />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Check Availability
                    </>
                  )}
                </button>

                <button
                  onClick={handleDismiss}
                  className="w-full py-2.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
                >
                  I&apos;m just looking
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Toast confirmation component
export function DateIntentToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'px-4 py-3 rounded-full',
        'bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass',
        'flex items-center gap-2'
      )}
    >
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
        <Check size={12} className="text-text-primary" />
      </div>
      <span className="text-sm text-text-primary">
        Got it! Checking availability as you browse
      </span>
      <button
        onClick={onDismiss}
        className="ml-2 text-text-muted hover:text-text-primary transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
