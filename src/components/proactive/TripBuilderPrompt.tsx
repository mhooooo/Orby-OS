'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProactiveUI } from './ProactiveUIManager';

interface TripBuilderPromptProps {
  onStartBuilder?: () => void;
  onDismiss?: () => void;
}

/**
 * TripBuilderPrompt - Floating pill that appears after viewing multiple courses.
 * Less intrusive than modals, positioned at bottom right.
 */
export function TripBuilderPrompt({ onStartBuilder, onDismiss: onDismissExternal }: TripBuilderPromptProps) {
  const { state, dismiss, hide } = useProactiveUI();

  const isOpen = state.activePopup === 'TripBuilderPrompt';
  const coursesViewedCount = state.coursesViewed.length;

  const handleDismiss = () => {
    dismiss('TripBuilderPrompt');
    onDismissExternal?.();
  };

  const handleStartBuilder = () => {
    hide();
    onStartBuilder?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={cn(
            'fixed z-50',
            'bottom-6 right-6 left-6 sm:left-auto',
            'sm:max-w-sm'
          )}
        >
          <div
            className={cn(
              'bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass',
              'rounded-2xl p-4',
              'flex items-start gap-3'
            )}
          >
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-accent-coral to-accent-purple flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary mb-0.5">
                Ready to plan your trip?
              </h3>
              <p className="text-xs text-text-muted mb-3">
                {coursesViewedCount > 0 ? (
                  <>
                    You&apos;ve viewed {coursesViewedCount} course{coursesViewedCount > 1 ? 's' : ''}.
                    Want me to build an itinerary?
                  </>
                ) : (
                  'I can help you build a complete golf itinerary.'
                )}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleStartBuilder}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                    'bg-white text-background-base',
                    'hover:bg-gray-100'
                  )}
                >
                  Yes, plan my trip
                </button>
                <button
                  onClick={handleDismiss}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-medium transition-all',
                    'text-text-muted hover:text-text-secondary hover:bg-white/5'
                  )}
                >
                  Just browsing
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-full text-text-muted
                         hover:text-text-primary hover:bg-white/10 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Standalone version for direct use/testing.
 */
export function TripBuilderPromptStandalone({
  isOpen,
  onClose,
  onStartBuilder,
  coursesViewed = 0,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStartBuilder: () => void;
  coursesViewed?: number;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={cn(
            'fixed z-50',
            'bottom-6 right-6 left-6 sm:left-auto',
            'sm:max-w-sm'
          )}
        >
          <div
            className={cn(
              'bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass',
              'rounded-2xl p-4',
              'flex items-start gap-3'
            )}
          >
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-accent-coral to-accent-purple flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary mb-0.5">
                Ready to plan your trip?
              </h3>
              <p className="text-xs text-text-muted mb-3">
                {coursesViewed > 0 ? (
                  <>
                    You&apos;ve viewed {coursesViewed} course{coursesViewed > 1 ? 's' : ''}.
                    Want me to build an itinerary?
                  </>
                ) : (
                  'I can help you build a complete golf itinerary.'
                )}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onStartBuilder}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                    'bg-white text-background-base',
                    'hover:bg-gray-100'
                  )}
                >
                  Yes, plan my trip
                </button>
                <button
                  onClick={onClose}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-medium transition-all',
                    'text-text-muted hover:text-text-secondary hover:bg-white/5'
                  )}
                >
                  Just browsing
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-full text-text-muted
                         hover:text-text-primary hover:bg-white/10 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Minimal floating pill version for sidebar/edge positioning.
 */
export function TripBuilderPill({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-full',
        'bg-gradient-to-r from-accent-coral to-accent-purple',
        'text-white text-sm font-bold shadow-lg shadow-accent-coral/20',
        'hover:shadow-accent-coral/30 transition-shadow',
        className
      )}
    >
      <MapPin size={14} />
      <span>Plan My Trip</span>
    </motion.button>
  );
}
