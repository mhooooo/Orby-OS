'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import {
  Plane,
  Car,
  Flag,
  Wallet,
  ChevronRight,
  Percent,
  Save,
  Check,
  X,
} from 'lucide-react';
import { ItineraryDraft, REGION_NAMES, VIBE_INFO } from '@/types/itinerary';
import { calculatePriceBreakdown } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { Course } from '@/types/course';
import { useAuth } from '@/hooks/useAuth';
import { useItineraryDrafts } from '@/hooks/useItineraryDrafts';
import InquiryForm from './InquiryForm';

interface ItinerarySummaryProps {
  draft: ItineraryDraft;
  courses?: Course[];
  onProceedToBooking?: () => void;
  onShowAuthModal?: () => void;
}

export function ItinerarySummary({
  draft,
  courses = [],
  onProceedToBooking,
  onShowAuthModal,
}: ItinerarySummaryProps) {
  const { user } = useAuth();
  const { saveDraft } = useItineraryDrafts();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  // Use memoized calculation instead of effect + state
  const breakdown = useMemo(
    () => calculatePriceBreakdown(draft, courses),
    [draft, courses]
  );

  // Create itinerary snapshot for inquiry
  const itinerarySnapshot = useMemo(() => ({
    region: draft.region,
    numberOfDays: draft.numberOfDays,
    groupSize: draft.groupSize,
    startDate: draft.startDate,
    endDate: draft.endDate,
    vibe: draft.vibe,
    transfers: draft.transfers,
    includeCaddieTips: draft.includeCaddieTips,
    selectedCourses: courses.map(c => c.id),
    totalEstimate: breakdown.total,
    breakdown: {
      greenFees: breakdown.greenFees.subtotal,
      transfers: breakdown.transfers.subtotal,
      caddieTips: breakdown.caddieTips.subtotal,
      discount: breakdown.discount.amount,
    },
  }), [draft, courses, breakdown]);

  // Handle save trip
  const handleSaveTrip = async () => {
    // If not authenticated, show auth modal
    if (!user) {
      onShowAuthModal?.();
      return;
    }

    // Save to database
    setSaveState('saving');
    try {
      const draftId = await saveDraft(draft);
      if (draftId) {
        setSaveState('saved');
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveState('idle'), 2000);
      } else {
        setSaveState('idle');
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      setSaveState('idle');
    }
  };

  // Handle book now
  const handleBookNow = () => {
    setShowInquiryModal(true);
  };

  // Handle inquiry success
  const handleInquirySuccess = () => {
    // Close modal after a delay to show success message
    setTimeout(() => {
      setShowInquiryModal(false);
    }, 2000);
  };

  return (
    <div className="rounded-3xl bg-[#1E1F20] border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Your Golf Trip</h2>
            <p className="text-sm text-gray-400 mt-1">
              {draft.region && REGION_NAMES[draft.region]} • {draft.numberOfDays} days •{' '}
              {draft.groupSize} golfers
            </p>
          </div>
          {draft.vibe && (
            <span className="px-3 py-1 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-medium">
              {VIBE_INFO[draft.vibe].label}
            </span>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="p-6">
        <Timeline draft={draft} />
      </div>

      {/* Price Breakdown */}
      <div className="p-6 bg-[#282A2C] border-t border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Price Breakdown</h3>

        <div className="space-y-3">
          {/* Green Fees */}
          <BreakdownRow
            icon={<Flag size={16} />}
            label="Green Fees"
            detail={`${breakdown.greenFees.rounds} rounds × ${breakdown.greenFees.golfers} golfers`}
            amount={breakdown.greenFees.subtotal}
          />

          {/* Transfers */}
          {breakdown.transfers.enabled && (
            <BreakdownRow
              icon={<Car size={16} />}
              label={`${breakdown.transfers.vehicleType === 'vip-van' ? 'VIP Van' : 'Sedan'} Transfers`}
              detail={`${breakdown.transfers.days} days`}
              amount={breakdown.transfers.subtotal}
            />
          )}

          {/* Caddie Tips */}
          {breakdown.caddieTips.enabled && (
            <BreakdownRow
              icon={<Wallet size={16} />}
              label="Caddie Tips"
              detail={`${breakdown.caddieTips.rounds} rounds × ${breakdown.caddieTips.golfers} golfers`}
              amount={breakdown.caddieTips.subtotal}
            />
          )}

          {/* Discount */}
          {breakdown.discount.percentage > 0 && (
            <BreakdownRow
              icon={<Percent size={16} />}
              label={`Group Discount (${breakdown.discount.percentage}%)`}
              amount={-breakdown.discount.amount}
              isDiscount
            />
          )}

          {/* Divider */}
          <div className="border-t border-gray-700 my-4" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Estimated Total</span>
            <AnimatedTotal total={breakdown.total} />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 border-t border-gray-800 space-y-3">
        {/* Save Trip Button */}
        <button
          onClick={handleSaveTrip}
          disabled={saveState === 'saving' || saveState === 'saved'}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all",
            saveState === 'saved'
              ? "bg-green-500/20 text-green-400 cursor-default"
              : "bg-gradient-to-r from-[#00D4FF] to-[#0095FF] text-white hover:shadow-lg hover:shadow-[#00D4FF]/20"
          )}
        >
          {saveState === 'saving' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Save size={20} />
              </motion.div>
              Saving...
            </>
          )}
          {saveState === 'saved' && (
            <>
              <Check size={20} />
              Saved
            </>
          )}
          {saveState === 'idle' && (
            <>
              <Save size={20} />
              Save Trip
            </>
          )}
        </button>

        {/* Book Now Button */}
        <button
          onClick={handleBookNow}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#FF6B35]/25 transition-all duration-300"
        >
          Request Booking
          <ChevronRight size={20} />
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          No payment required • We&apos;ll confirm availability first
        </p>
      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {showInquiryModal && (
          <InquiryModal
            itinerarySnapshot={itinerarySnapshot}
            onClose={() => setShowInquiryModal(false)}
            onSuccess={handleInquirySuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Inquiry Modal Component
function InquiryModal({
  itinerarySnapshot,
  onClose,
  onSuccess,
}: {
  itinerarySnapshot: Record<string, unknown>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.25 }}
        className="w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-[#282A2C] border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#323437] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Inquiry Form */}
        <InquiryForm
          itinerarySnapshot={itinerarySnapshot}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </motion.div>
    </motion.div>
  );
}

// Timeline Component
function Timeline({ draft }: { draft: ItineraryDraft }) {
  const { numberOfDays, startDate, transfers, region } = draft;

  // Generate timeline items
  const items: TimelineItem[] = [];

  // Arrival
  if (transfers.enabled && transfers.includesAirportPickup) {
    items.push({
      type: 'arrival',
      icon: <Plane size={16} />,
      title: 'Airport Arrival',
      subtitle: startDate ? formatDate(startDate) : 'Day 1',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    });
  }

  // Golf days
  for (let i = 1; i <= numberOfDays; i++) {
    const date = startDate
      ? new Date(new Date(startDate).getTime() + (i - 1) * 24 * 60 * 60 * 1000)
      : null;

    items.push({
      type: 'golf',
      icon: <Flag size={16} />,
      title: `Day ${i}: Golf Round`,
      subtitle: date
        ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        : `${region ? REGION_NAMES[region] : ''} Course`,
      iconBg: 'bg-[#FF6B35]/20',
      iconColor: 'text-[#FF6B35]',
    });
  }

  // Departure
  if (transfers.enabled) {
    items.push({
      type: 'departure',
      icon: <Plane size={16} className="rotate-45" />,
      title: 'Departure',
      subtitle: 'Transfer to airport',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    });
  }

  return (
    <div className="relative">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-4"
        >
          {/* Timeline line and dot */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                item.iconBg
              )}
            >
              <span className={item.iconColor}>{item.icon}</span>
            </div>
            {index < items.length - 1 && (
              <div className="w-0.5 h-12 bg-gray-700 my-1" />
            )}
          </div>

          {/* Content */}
          <div className="pb-6">
            <h4 className="font-medium text-white">{item.title}</h4>
            <p className="text-sm text-gray-400">{item.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface TimelineItem {
  type: 'arrival' | 'golf' | 'departure';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
}

// Breakdown Row Component
function BreakdownRow({
  icon,
  label,
  detail,
  amount,
  isDiscount = false,
}: {
  icon: React.ReactNode;
  label: string;
  detail?: string;
  amount: number;
  isDiscount?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{icon}</span>
        <div>
          <span className="text-sm text-gray-300">{label}</span>
          {detail && <span className="text-xs text-gray-500 ml-2">({detail})</span>}
        </div>
      </div>
      <span
        className={cn(
          'font-medium',
          isDiscount ? 'text-green-400' : 'text-white'
        )}
      >
        {isDiscount ? '-' : ''}฿{Math.abs(amount).toLocaleString()}
      </span>
    </div>
  );
}

// Animated Total Component
function AnimatedTotal({ total }: { total: number }) {
  const [displayValue, setDisplayValue] = useState(total.toLocaleString());
  const springValue = useSpring(total, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  useEffect(() => {
    springValue.set(total);
  }, [total, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (value) => {
      setDisplayValue(Math.round(value).toLocaleString());
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <div className="text-right">
      <motion.span className="text-2xl font-bold text-[#FF6B35]">
        ฿{displayValue}
      </motion.span>
      <span className="text-xs text-gray-500 ml-1">THB</span>
    </div>
  );
}

// Helper function
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
