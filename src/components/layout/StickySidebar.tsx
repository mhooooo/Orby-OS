'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronUp, ChevronDown, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TripContextBar } from '@/components/generative-ui/TripContextBar';
import { InteractiveTimeline, Day } from '@/components/InteractiveTimeline';
import { QuoteCard } from '@/components/QuoteCard';

interface TripContext {
  dates?: { start: Date; end: Date };
  duration?: number;
  golfers?: number;
  nonGolfers?: number;
  regions?: string[];
  coursesCount?: number;
}

interface QuoteData {
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  total: number;
  discount?: { label: string; amount: number };
  notes?: string;
}

interface StickySidebarProps {
  tripContext?: TripContext;
  timelineDays?: Day[];
  quote?: QuoteData;
  isVisible?: boolean;
  onClose?: () => void;
  onBookClick?: () => void;
  onExpandDay?: (dayId: string) => void;
  onExpandQuote?: () => void;
  className?: string;
}

// Desktop Sidebar Component
function DesktopSidebar({
  tripContext,
  timelineDays,
  quote,
  onClose,
  onBookClick,
  onExpandDay,
  onExpandQuote,
  className,
}: Omit<StickySidebarProps, 'isVisible'>) {
  return (
    <motion.aside
      className={cn(
        'w-80 h-full flex flex-col',
        'bg-background-base/80 backdrop-blur-xl',
        'border-l border-white/10',
        className
      )}
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/5">
        <h3 className="text-sm font-bold text-text-primary">Trip Builder</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Trip Context Bar - always on top */}
      {tripContext && (
        <div className="flex-shrink-0 p-4 border-b border-white/5">
          <TripContextBar {...tripContext} variant="vertical" />
        </div>
      )}

      {/* Timeline - takes remaining space */}
      {timelineDays && timelineDays.length > 0 && (
        <div className="flex-1 overflow-hidden">
          <InteractiveTimeline
            days={timelineDays}
            onReorder={() => {}}
            variant="sticky"
            editable={false}
            onExpandDay={onExpandDay}
          />
        </div>
      )}

      {/* Quote - pinned to bottom */}
      {quote && (
        <div className="flex-shrink-0 p-4 border-t border-white/5">
          <QuoteCard
            {...quote}
            variant="sticky"
            onBook={onBookClick}
            onExpand={onExpandQuote}
          />
        </div>
      )}
    </motion.aside>
  );
}

// Mobile Bottom Sheet Component
function MobileBottomSheet({
  tripContext,
  timelineDays,
  quote,
  onClose,
  onBookClick,
  onExpandDay,
  onExpandQuote,
  className,
}: Omit<StickySidebarProps, 'isVisible'>) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background-base/95 backdrop-blur-xl',
        'border-t border-white/10 rounded-t-2xl',
        'safe-area-inset-bottom',
        className
      )}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* Handle */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      {/* Collapsed View - Just Quote/Total */}
      <div className="px-4 pb-3">
        {quote && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-left flex-1"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">
                  Total
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-text-primary">
                    ฿{quote.total.toLocaleString()}
                  </span>
                  {quote.discount && quote.discount.amount > 0 && (
                    <span className="text-xs text-accent-cyan">
                      -฿{quote.discount.amount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="p-1"
              >
                <ChevronUp size={16} className="text-text-muted" />
              </motion.div>
            </button>

            {onBookClick && (
              <button
                onClick={onBookClick}
                className="px-4 py-2 rounded-full bg-accent-coral text-white text-sm font-bold shadow-glow-coral hover:bg-accent-coral/90 transition-colors"
              >
                Book Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-[60vh] overflow-y-auto px-4 pb-6">
              {/* Trip Context */}
              {tripContext && (
                <div className="mb-4">
                  <TripContextBar {...tripContext} variant="vertical" />
                </div>
              )}

              {/* Timeline */}
              {timelineDays && timelineDays.length > 0 && (
                <div className="mb-4 rounded-xl bg-surface-glass border border-white/10 overflow-hidden">
                  <InteractiveTimeline
                    days={timelineDays}
                    onReorder={() => {}}
                    variant="sticky"
                    editable={false}
                    onExpandDay={onExpandDay}
                  />
                </div>
              )}

              {/* Full Quote */}
              {quote && (
                <QuoteCard
                  {...quote}
                  variant="full"
                  onBook={onBookClick}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main Exported Component
export function StickySidebar({
  tripContext,
  timelineDays,
  quote,
  isVisible = true,
  onClose,
  onBookClick,
  onExpandDay,
  onExpandQuote,
  className,
}: StickySidebarProps) {
  if (!isVisible) return null;

  const hasContent = tripContext || (timelineDays && timelineDays.length > 0) || quote;
  if (!hasContent) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <AnimatePresence>
          {isVisible && (
            <DesktopSidebar
              tripContext={tripContext}
              timelineDays={timelineDays}
              quote={quote}
              onClose={onClose}
              onBookClick={onBookClick}
              onExpandDay={onExpandDay}
              onExpandQuote={onExpandQuote}
              className={className}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="lg:hidden">
        <AnimatePresence>
          {isVisible && (
            <MobileBottomSheet
              tripContext={tripContext}
              timelineDays={timelineDays}
              quote={quote}
              onClose={onClose}
              onBookClick={onBookClick}
              onExpandDay={onExpandDay}
              onExpandQuote={onExpandQuote}
              className={className}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default StickySidebar;
