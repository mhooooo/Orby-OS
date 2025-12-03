'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupCardProps {
  groupSize?: number;
  nonGolferCount?: number;
  onGroupSizeChange?: (size: number) => void;
  onNonGolferCountChange?: (count: number) => void;
  className?: string;
}

export function GroupCard({
  groupSize: initialGroupSize = 4,
  nonGolferCount: initialNonGolferCount = 0,
  onGroupSizeChange,
  onNonGolferCountChange,
  className,
}: GroupCardProps) {
  const [localGroupSize, setLocalGroupSize] = useState(initialGroupSize);
  const [hasNonGolfers, setHasNonGolfers] = useState(initialNonGolferCount > 0);
  const [localNonGolferCount, setLocalNonGolferCount] = useState(
    initialNonGolferCount || 1
  );

  const handleGroupChange = (delta: number) => {
    const newSize = Math.max(1, Math.min(16, localGroupSize + delta));
    setLocalGroupSize(newSize);
    onGroupSizeChange?.(newSize);
  };

  const handleNonGolferChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(16, localNonGolferCount + delta));
    setLocalNonGolferCount(newCount);
    onNonGolferCountChange?.(newCount);
  };

  const toggleNonGolfers = () => {
    const newHasNonGolfers = !hasNonGolfers;
    setHasNonGolfers(newHasNonGolfers);
    if (!newHasNonGolfers) {
      onNonGolferCountChange?.(0);
    } else {
      onNonGolferCountChange?.(localNonGolferCount);
    }
  };

  return (
    <motion.div
      className={cn(
        'relative w-full rounded-card overflow-hidden',
        'bg-surface-glass backdrop-blur-xl border border-white/10',
        'shadow-glass',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-button bg-accent-purple/10 text-accent-purple/70">
            <Users size={20} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Group Size</h2>
        </div>
        <p className="text-text-muted text-sm pl-11">
          How many are traveling?
        </p>
      </div>

      {/* Golfers */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-bold text-text-primary">Golfers</h4>
            <p className="text-sm text-text-muted">Playing members</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 py-4">
          <button
            onClick={() => handleGroupChange(-1)}
            disabled={localGroupSize <= 1}
            className={cn(
              'w-14 h-14 rounded-cardSmall flex items-center justify-center transition-all duration-200',
              localGroupSize <= 1
                ? 'bg-surface-glass text-text-muted cursor-not-allowed'
                : 'bg-white/10 text-text-primary hover:bg-white/20 hover:scale-105'
            )}
          >
            <Minus size={24} />
          </button>

          <div className="text-center min-w-[100px]">
            <span className="text-5xl font-bold text-text-primary tracking-tight">
              {localGroupSize}
            </span>
            <p className="text-sm text-text-muted mt-2 font-medium uppercase tracking-wide">
              {localGroupSize === 1 ? 'golfer' : 'golfers'}
            </p>
          </div>

          <button
            onClick={() => handleGroupChange(1)}
            disabled={localGroupSize >= 16}
            className={cn(
              'w-14 h-14 rounded-cardSmall flex items-center justify-center transition-all duration-200',
              localGroupSize >= 16
                ? 'bg-surface-glass text-text-muted cursor-not-allowed'
                : 'bg-white/10 text-text-primary hover:bg-white/20 hover:scale-105'
            )}
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Quick select */}
        <div className="flex justify-center gap-3 mt-4">
          {[2, 4, 8, 12].map((size) => (
            <button
              key={size}
              onClick={() => {
                setLocalGroupSize(size);
                onGroupSizeChange?.(size);
              }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                localGroupSize === size
                  ? 'bg-accent-purple/60 text-text-primary'
                  : 'bg-surface-glass text-text-muted hover:bg-white/10 hover:text-text-primary'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Non-Golfers */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-bold text-text-primary">Non-Golfers</h4>
            <p className="text-sm text-text-muted">Family or friends</p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={toggleNonGolfers}
            className={cn(
              'relative w-14 h-8 rounded-pill transition-all duration-300',
              hasNonGolfers ? 'bg-white/30' : 'bg-white/10'
            )}
          >
            <motion.div
              layout
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
              animate={{ left: hasNonGolfers ? '28px' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {hasNonGolfers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center gap-8 py-4">
              <button
                onClick={() => handleNonGolferChange(-1)}
                disabled={localNonGolferCount <= 1}
                className={cn(
                  'w-12 h-12 rounded-cardSmall flex items-center justify-center transition-all duration-200',
                  localNonGolferCount <= 1
                    ? 'bg-surface-glass text-text-muted cursor-not-allowed'
                    : 'bg-white/10 text-text-primary hover:bg-white/20 hover:scale-105'
                )}
              >
                <Minus size={20} />
              </button>

              <div className="text-center min-w-[80px]">
                <span className="text-4xl font-bold text-text-primary tracking-tight">
                  {localNonGolferCount}
                </span>
                <p className="text-xs text-text-muted mt-1 font-medium uppercase tracking-wide">
                  {localNonGolferCount === 1 ? 'non-golfer' : 'non-golfers'}
                </p>
              </div>

              <button
                onClick={() => handleNonGolferChange(1)}
                disabled={localNonGolferCount >= 16}
                className={cn(
                  'w-12 h-12 rounded-cardSmall flex items-center justify-center transition-all duration-200',
                  localNonGolferCount >= 16
                    ? 'bg-surface-glass text-text-muted cursor-not-allowed'
                    : 'bg-white/10 text-text-primary hover:bg-white/20 hover:scale-105'
                )}
              >
                <Plus size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Summary */}
      <div className="px-6 pb-6">
        <div className="p-4 rounded-cardSmall bg-accent-purple/10 border border-accent-purple/15">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Total travelers:</span>
            <span className="text-accent-purple/80 font-bold">
              {localGroupSize + (hasNonGolfers ? localNonGolferCount : 0)} people
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
