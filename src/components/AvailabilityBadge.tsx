'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AvailabilityStatus = 'checking' | 'available' | 'limited' | 'unavailable' | 'unknown';

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  date?: string; // Display date like "Dec 15"
  className?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<AvailabilityStatus, {
  label: string;
  dotColor: string;
  textColor: string;
  bgColor: string;
}> = {
  checking: {
    label: 'Checking...',
    dotColor: 'bg-text-muted',
    textColor: 'text-text-muted',
    bgColor: 'bg-white/5',
  },
  available: {
    label: 'Available',
    dotColor: 'bg-emerald-400',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
  },
  limited: {
    label: 'Few slots left',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
  },
  unavailable: {
    label: 'Not available',
    dotColor: 'bg-text-muted',
    textColor: 'text-text-muted',
    bgColor: 'bg-white/5',
  },
  unknown: {
    label: '',
    dotColor: '',
    textColor: '',
    bgColor: '',
  },
};

export function AvailabilityBadge({
  status,
  date,
  className,
  size = 'sm',
}: AvailabilityBadgeProps) {
  // Don't render anything for unknown status
  if (status === 'unknown') {
    return null;
  }

  const config = STATUS_CONFIG[status];
  const isChecking = status === 'checking';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/5',
        config.bgColor,
        size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1',
        className
      )}
    >
      {/* Status dot */}
      <div className="relative">
        <div
          className={cn(
            'rounded-full',
            config.dotColor,
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          )}
        />
        {/* Pulse animation for checking/available states */}
        {(isChecking || status === 'available') && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full',
              config.dotColor,
              'opacity-50'
            )}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: isChecking ? 1 : 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Spinner for checking state */}
      {isChecking && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={cn(
            'border border-text-muted/30 border-t-text-muted rounded-full',
            size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'
          )}
        />
      )}

      {/* Label */}
      <span
        className={cn(
          'font-medium',
          config.textColor,
          size === 'sm' ? 'text-[10px]' : 'text-xs'
        )}
      >
        {config.label}
        {date && status !== 'checking' && (
          <span className="text-text-muted ml-1">{date}</span>
        )}
      </span>
    </motion.div>
  );
}

// Compact version for tight spaces (e.g., list views)
export function AvailabilityDot({
  status,
  className,
}: {
  status: AvailabilityStatus;
  className?: string;
}) {
  if (status === 'unknown') return null;

  const config = STATUS_CONFIG[status];
  const isChecking = status === 'checking';

  return (
    <div className={cn('relative', className)}>
      {isChecking ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-3 h-3 border border-text-muted/30 border-t-text-muted rounded-full"
        />
      ) : (
        <>
          <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
          {status === 'available' && (
            <motion.div
              className={cn('absolute inset-0 rounded-full', config.dotColor, 'opacity-50')}
              animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </>
      )}
    </div>
  );
}

// Badge with tooltip for more context
export function AvailabilityBadgeWithInfo({
  status,
  date,
  slots,
  className,
}: {
  status: AvailabilityStatus;
  date?: string;
  slots?: number;
  className?: string;
}) {
  if (status === 'unknown') return null;

  const config = STATUS_CONFIG[status];

  const getDetailText = () => {
    switch (status) {
      case 'available':
        return slots ? `${slots} tee times available` : 'Tee times available';
      case 'limited':
        return slots ? `Only ${slots} slots remaining` : 'Limited availability';
      case 'unavailable':
        return 'Fully booked for this date';
      case 'checking':
        return 'Checking availability...';
      default:
        return '';
    }
  };

  return (
    <div className={cn('group relative', className)}>
      <AvailabilityBadge status={status} date={date} />

      {/* Tooltip on hover */}
      <div className={cn(
        'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
        'px-2.5 py-1.5 rounded-lg',
        'bg-background-card border border-white/10 shadow-lg',
        'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
        'whitespace-nowrap text-xs text-text-secondary'
      )}>
        {getDetailText()}
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="border-4 border-transparent border-t-background-card" />
        </div>
      </div>
    </div>
  );
}
