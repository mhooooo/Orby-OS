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
  Calendar,
  Users,
  MapPin
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
    <div className={cn(
      "relative overflow-hidden rounded-[2.5rem]",
      "bg-white/5 backdrop-blur-2xl border border-white/10",
      "shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
    )}>
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-white/5 bg-white/5">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Your Golf Trip</h2>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-400" />
                {draft.region && REGION_NAMES[draft.region]}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-400" />
                {draft.numberOfDays} days
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-purple-400" />
                {draft.groupSize} golfers
              </div>
            </div>
          </div>
          {draft.vibe && (
            <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider">
              {VIBE_INFO[draft.vibe].label}
            </span>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="p-4 sm:p-6 lg:p-8 bg-black/20">
        <Timeline draft={draft} />
      </div>

      {/* Price Breakdown */}
      <div className="p-4 sm:p-6 lg:p-8 bg-white/5 border-t border-white/5">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 sm:mb-6">Price Breakdown</h3>

        <div className="space-y-4">
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
          <div className="border-t border-white/10 my-6" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Estimated Total</span>
            <AnimatedTotal total={breakdown.total} />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 sm:p-6 border-t border-white/5 bg-black/20 space-y-3">
        {/* Save Trip Button */}
        <button
          onClick={handleSaveTrip}
          disabled={saveState === 'saving' || saveState === 'saved'}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300",
            saveState === 'saved'
              ? "bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/20"
              : "bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20"
          )}
        >
          {saveState === 'saving' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Save size={18} />
              </motion.div>
              Saving...
            </>
          )}
          {saveState === 'saved' && (
            <>
              <Check size={18} />
              Saved to Profile
            </>
          )}
          {saveState === 'idle' && (
            <>
              <Save size={18} />
              Save Trip for Later
            </>
          )}
        </button>

        {/* Book Now Button */}
        <button
          onClick={handleBookNow}
          className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all duration-300 shadow-lg shadow-white/10"
        >
          Request Booking
          <ChevronRight size={18} />
        </button>
        <p className="text-[10px] text-gray-500 text-center mt-3 uppercase tracking-wider">
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
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
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
          className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/70 transition-colors backdrop-blur-md"
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
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
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
    <div className="relative pl-1 sm:pl-2">
      {/* Vertical Line */}
      <div className="absolute left-[17px] sm:left-[19px] top-4 bottom-4 w-px bg-white/10" />

      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative flex gap-4 sm:gap-6 mb-6 sm:mb-8 last:mb-0"
        >
          {/* Icon */}
          <div
            className={cn(
              'relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/5 backdrop-blur-md shadow-lg',
              item.iconBg
            )}
          >
            <span className={item.iconColor}>{item.icon}</span>
          </div>

          {/* Content */}
          <div className="pt-0.5 sm:pt-1">
            <h4 className="font-bold text-white text-xs sm:text-sm mb-1">{item.title}</h4>
            <p className="text-[10px] sm:text-xs text-gray-400">{item.subtitle}</p>
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
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <div>
          <span className="text-xs sm:text-sm font-medium text-gray-300 block">{label}</span>
          {detail && <span className="text-[10px] sm:text-xs text-gray-500">{detail}</span>}
        </div>
      </div>
      <span
        className={cn(
          'font-bold text-sm sm:text-base',
          isDiscount ? 'text-emerald-400' : 'text-white'
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
      <motion.span className="text-2xl sm:text-3xl font-bold text-emerald-400 drop-shadow-lg">
        ฿{displayValue}
      </motion.span>
      <span className="text-[10px] sm:text-xs text-gray-500 ml-1 font-medium">THB</span>
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
