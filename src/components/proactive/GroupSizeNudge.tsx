'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProactiveUI } from './ProactiveUIManager';

interface GroupSizeNudgeProps {
  onSelect?: (size: number) => void;
}

const GROUP_OPTIONS = [
  { value: 1, label: 'Just me', emoji: '1' },
  { value: 3, label: '2-4', emoji: '2-4' },
  { value: 6, label: '5-8', emoji: '5-8' },
  { value: 12, label: '8+', emoji: '8+' },
] as const;

/**
 * GroupSizeNudge - Quick popup to capture group size.
 * Less intrusive than DateIntentModal, slides up from bottom.
 */
export function GroupSizeNudge({ onSelect }: GroupSizeNudgeProps) {
  const { state, dismiss, hide, markDataCollected } = useProactiveUI();

  const isOpen = state.activePopup === 'GroupSizeNudge';

  const handleDismiss = () => {
    dismiss('GroupSizeNudge');
  };

  const handleSelect = (size: number) => {
    markDataCollected('groupSize', size);
    hide();
    onSelect?.(size);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
            onClick={handleDismiss}
          />

          {/* Bottom sheet nudge */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed z-50 bottom-0 left-0 right-0',
              'sm:left-1/2 sm:right-auto sm:bottom-6 sm:-translate-x-1/2',
              'sm:w-auto sm:min-w-[340px]'
            )}
          >
            <div
              className={cn(
                'bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass',
                'rounded-t-3xl sm:rounded-3xl',
                'p-5 pb-8 sm:pb-5'
              )}
            >
              {/* Drag handle (mobile) */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-full text-text-muted
                           hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Content */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-cyanMuted flex items-center justify-center">
                  <Users size={18} className="text-accent-cyan" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Playing solo or with a group?
                  </h3>
                  <p className="text-xs text-text-muted">
                    Helps us show group discounts
                  </p>
                </div>
              </div>

              {/* Options grid */}
              <div className="grid grid-cols-4 gap-2">
                {GROUP_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'py-3 px-2 rounded-xl text-center transition-all',
                      'bg-white/5 border border-white/10',
                      'hover:bg-white/10 hover:border-white/20',
                      'focus:outline-none focus:ring-2 focus:ring-accent-cyan/50'
                    )}
                  >
                    <span className="text-lg font-bold text-text-primary block">
                      {option.emoji}
                    </span>
                    <span className="text-[10px] text-text-muted mt-0.5 block">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Skip option */}
              <button
                onClick={handleDismiss}
                className="w-full mt-3 py-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Standalone version without ProactiveUIManager integration.
 * For direct use/testing.
 */
export function GroupSizeNudgeStandalone({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (size: number) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
            onClick={onClose}
          />

          {/* Bottom sheet nudge */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed z-50 bottom-0 left-0 right-0',
              'sm:left-1/2 sm:right-auto sm:bottom-6 sm:-translate-x-1/2',
              'sm:w-auto sm:min-w-[340px]'
            )}
          >
            <div
              className={cn(
                'bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass',
                'rounded-t-3xl sm:rounded-3xl',
                'p-5 pb-8 sm:pb-5'
              )}
            >
              {/* Drag handle (mobile) */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full text-text-muted
                           hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Content */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-cyanMuted flex items-center justify-center">
                  <Users size={18} className="text-accent-cyan" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Playing solo or with a group?
                  </h3>
                  <p className="text-xs text-text-muted">
                    Helps us show group discounts
                  </p>
                </div>
              </div>

              {/* Options grid */}
              <div className="grid grid-cols-4 gap-2">
                {GROUP_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onSelect(option.value)}
                    className={cn(
                      'py-3 px-2 rounded-xl text-center transition-all',
                      'bg-white/5 border border-white/10',
                      'hover:bg-white/10 hover:border-white/20',
                      'focus:outline-none focus:ring-2 focus:ring-accent-cyan/50'
                    )}
                  >
                    <span className="text-lg font-bold text-text-primary block">
                      {option.emoji}
                    </span>
                    <span className="text-[10px] text-text-muted mt-0.5 block">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Skip option */}
              <button
                onClick={onClose}
                className="w-full mt-3 py-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
