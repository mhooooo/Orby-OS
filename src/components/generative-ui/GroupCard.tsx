'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Minus, Plus, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupCardProps {
  golfers?: number;
  nonGolfers?: number;
  onGolfersChange?: (count: number) => void;
  onNonGolfersChange?: (count: number) => void;
  onAction?: (prompt: string) => void;
  className?: string;
}

export function GroupCard({
  golfers: initialGolfers = 4,
  nonGolfers: initialNonGolfers = 0,
  onGolfersChange,
  onNonGolfersChange,
  onAction,
  className,
}: GroupCardProps) {
  const [localGolfers, setLocalGolfers] = useState(initialGolfers);
  const [hasNonGolfers, setHasNonGolfers] = useState(initialNonGolfers > 0);
  const [localNonGolfers, setLocalNonGolfers] = useState(
    initialNonGolfers || 1
  );

  const handleGolfersChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(16, localGolfers + delta));
    setLocalGolfers(newCount);
    onGolfersChange?.(newCount);
  };

  const handleNonGolfersChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(16, localNonGolfers + delta));
    setLocalNonGolfers(newCount);
    onNonGolfersChange?.(newCount);
  };

  const toggleNonGolfers = () => {
    const newHasNonGolfers = !hasNonGolfers;
    setHasNonGolfers(newHasNonGolfers);
    if (!newHasNonGolfers) {
      onNonGolfersChange?.(0);
    } else {
      onNonGolfersChange?.(localNonGolfers);
    }
  };

  const totalTravelers = localGolfers + (hasNonGolfers ? localNonGolfers : 0);

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
            <Users size={20} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Group Size</h2>
        </div>
        <p className="text-text-muted text-sm pl-11">
          How many are traveling?
        </p>
      </div>

      {/* Golfers Section */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-semibold text-text-primary">Golfers</h4>
            <p className="text-xs text-text-muted">Playing members</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 py-4">
          <button
            onClick={() => handleGolfersChange(-1)}
            disabled={localGolfers <= 1}
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center transition-all',
              localGolfers <= 1
                ? 'bg-white/5 text-text-muted cursor-not-allowed'
                : 'bg-white/10 text-text-primary hover:bg-white/15'
            )}
          >
            <Minus size={20} />
          </button>

          <div className="text-center min-w-[80px]">
            <span className="text-4xl font-bold text-text-primary">{localGolfers}</span>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-wide">
              {localGolfers === 1 ? 'golfer' : 'golfers'}
            </p>
          </div>

          <button
            onClick={() => handleGolfersChange(1)}
            disabled={localGolfers >= 16}
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center transition-all',
              localGolfers >= 16
                ? 'bg-white/5 text-text-muted cursor-not-allowed'
                : 'bg-white/10 text-text-primary hover:bg-white/15'
            )}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Quick select pills */}
        <div className="flex justify-center gap-2 mt-4">
          {[2, 4, 8, 12].map((size) => (
            <button
              key={size}
              onClick={() => {
                setLocalGolfers(size);
                onGolfersChange?.(size);
              }}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                localGolfers === size
                  ? 'bg-white text-background-base'
                  : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/5'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Non-Golfers Section */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-semibold text-text-primary">Non-Golfers</h4>
            <p className="text-xs text-text-muted">Family or friends</p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={toggleNonGolfers}
            className={cn(
              'relative w-12 h-7 rounded-full transition-colors',
              hasNonGolfers ? 'bg-white/30' : 'bg-white/10'
            )}
          >
            <motion.div
              className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
              animate={{
                left: hasNonGolfers ? '22px' : '2px',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        <AnimatePresence>
          {hasNonGolfers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center gap-6 py-4 border-t border-white/5 mt-4 pt-5">
                <button
                  onClick={() => handleNonGolfersChange(-1)}
                  disabled={localNonGolfers <= 1}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                    localNonGolfers <= 1
                      ? 'bg-white/5 text-text-muted cursor-not-allowed'
                      : 'bg-white/10 text-text-primary hover:bg-white/15'
                  )}
                >
                  <Minus size={18} />
                </button>

                <div className="text-center min-w-[60px]">
                  <span className="text-3xl font-bold text-text-primary">{localNonGolfers}</span>
                  <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
                    {localNonGolfers === 1 ? 'companion' : 'companions'}
                  </p>
                </div>

                <button
                  onClick={() => handleNonGolfersChange(1)}
                  disabled={localNonGolfers >= 16}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                    localNonGolfers >= 16
                      ? 'bg-white/5 text-text-muted cursor-not-allowed'
                      : 'bg-white/10 text-text-primary hover:bg-white/15'
                  )}
                >
                  <Plus size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Total Summary */}
      <div className="px-5 pb-5">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Total travelers:</span>
            <span className="text-text-primary font-bold">
              {totalTravelers} {totalTravelers === 1 ? 'person' : 'people'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Prompt */}
      {onAction && (
        <div className="px-5 pb-5">
          <button
            onClick={() => onAction('What group size works best for golf trips?')}
            className="w-full flex items-center gap-3 p-4 rounded-button bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group cursor-pointer"
          >
            <MessageCircle size={16} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
            <span className="text-sm text-text-secondary">
              Planning a group trip?{' '}
              <span className="text-text-primary font-medium">Get pricing info</span>
            </span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
