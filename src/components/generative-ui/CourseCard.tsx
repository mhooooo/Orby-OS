'use client';

import React, { useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MapPin,
  Clock,
  ChevronRight,
  ChevronDown,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  Sun,
  GitCompareArrows,
  MessageCircle,
  Users,
  Plus
} from 'lucide-react';
import {
  Course,
  FacilityType,
  SignatureFeature,
  CourseAvailability,
  TripDay,
  CourseInsight
} from '@/types/course';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/context/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { useSavedCourses } from '@/hooks/useSavedCourses';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

// Facility icon mapping
const FACILITY_ICONS: Record<FacilityType, string> = {
  range: '🏌️',
  restaurant: '🍽️',
  locker: '🚿',
  proShop: '🛒',
  nightGolf: '🌙',
  spa: '💆',
};

const FACILITY_LABELS: Record<FacilityType, string> = {
  range: 'Range',
  restaurant: 'Restaurant',
  locker: 'Locker',
  proShop: 'Pro Shop',
  nightGolf: 'Night Golf',
  spa: 'Spa',
};

// Derive signature feature from tags if not explicitly set
function deriveSignatureFeature(course: Course): SignatureFeature | undefined {
  if (course.signatureFeature) return course.signatureFeature;
  if (course.tags.includes('night_golf')) return { icon: '🌙', label: 'Night Golf' };
  if (course.tags.includes('oceanview') || course.tags.includes('scenic')) return { icon: '🌊', label: 'Ocean Views' };
  if (course.tags.includes('championship')) return { icon: '🏆', label: 'Top Ranked' };
  if (course.tags.includes('signature')) return { icon: '⭐', label: 'Signature' };
  if (course.tags.includes('beginner_friendly')) return { icon: '🎯', label: 'All Levels' };
  return undefined;
}

// Derive facility types from legacy facilities array
function deriveFacilityTypes(course: Course): FacilityType[] {
  if (course.facilityTypes) return course.facilityTypes;
  const types: FacilityType[] = [];
  const facilities = course.facilities || [];
  for (const f of facilities) {
    const lower = f.toLowerCase();
    if (lower.includes('range') || lower.includes('driving')) types.push('range');
    if (lower.includes('restaurant') || lower.includes('dining')) types.push('restaurant');
    if (lower.includes('locker')) types.push('locker');
    if (lower.includes('shop') || lower.includes('pro shop')) types.push('proShop');
    if (lower.includes('night')) types.push('nightGolf');
    if (lower.includes('spa')) types.push('spa');
  }
  if (course.tags.includes('night_golf') && !types.includes('nightGolf')) {
    types.push('nightGolf');
  }
  return [...new Set(types)];
}

// Derive tier from tags if not explicitly set
function deriveTier(course: Course): 'championship' | 'premium' | 'value' {
  if (course.tier) return course.tier;
  if (course.tags.includes('championship') || course.tags.includes('signature')) return 'championship';
  if (course.tags.includes('premium')) return 'premium';
  return 'value';
}

// Derive travel time from region if not set
function deriveTravelTime(course: Course): string {
  if (course.travelTimeFromBangkok) return course.travelTimeFromBangkok;
  const times: Record<string, string> = {
    bangkok: '30-60 min',
    pattaya: '1.5 hrs',
    hua_hin: '2.5 hrs',
    phuket: '1 hr flight',
    chiang_mai: '1 hr flight',
  };
  return times[course.region] || 'Ask for details';
}

// Calculate all-in price (green fee + caddie + cart)
function calculateAllInPrice(course: Course, isWeekend: boolean = false): number {
  const greenFee = isWeekend ? course.greenFee.weekend.guest : course.greenFee.weekday.guest;
  const caddie = course.caddieFee ?? 450;
  const cart = course.cartFee ?? 700;
  return greenFee + caddie + cart;
}

const tierLabels = {
  championship: 'Championship',
  premium: 'Premium',
  value: 'Value',
};

interface CourseCardProps {
  course: Course;
  onAuthRequired?: () => void;
  compact?: boolean;

  // Expansion
  expandable?: boolean;
  defaultExpanded?: boolean;

  // Context for personalization
  userDates?: { start: Date; end: Date };
  userGroupSize?: number;
  userHotel?: { name: string; location: string };
  tripDays?: TripDay[];

  // Availability data
  availability?: CourseAvailability;

  // Related
  similarCourses?: Course[];

  // Actions
  onAction?: (prompt: string) => void;
  onAddToDay?: (dayId: string) => void;
  onSave?: () => void;
  onCompare?: () => void;
}

function CourseCardInner({
  course,
  onAuthRequired,
  compact = false,
  expandable = true,
  defaultExpanded = false,
  userDates,
  userGroupSize,
  userHotel,
  tripDays,
  availability,
  similarCourses,
  onAction,
  onAddToDay,
  onCompare,
}: CourseCardProps) {
  const { sendMessage } = useChatContext();
  const { user } = useAuth();
  const { saveCourse, unsaveCourse, isSaved } = useSavedCourses();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const containerRef = useRef<HTMLDivElement>(null);

  const courseIsSaved = isSaved(course.id);
  const tier = deriveTier(course);
  const travelTime = deriveTravelTime(course);
  const allInPrice = calculateAllInPrice(course, false);
  const weekendPrice = calculateAllInPrice(course, true);
  const signatureFeature = deriveSignatureFeature(course);
  const facilityTypes = deriveFacilityTypes(course);
  const isTripBuilding = tripDays && tripDays.length > 0;

  // Generate insights based on context
  const insights: CourseInsight[] = [];
  if (userGroupSize && userGroupSize >= 8) {
    insights.push({ icon: '👥', text: `Accommodates groups of ${userGroupSize} easily` });
  }
  if (userHotel) {
    insights.push({ icon: '🏨', text: `${travelTime} from ${userHotel.name}` });
  }
  if (course.tags.includes('night_golf')) {
    insights.push({ icon: '🌙', text: 'Has the night golf option you wanted' });
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onAuthRequired?.();
      return;
    }
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (courseIsSaved) {
        await unsaveCourse(course.id);
      } else {
        await saveCourse(course.id);
      }
    } catch (err) {
      console.error('Error saving course:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleChatInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `I'd like to book a round at ${course.name}. What's the availability?`;
    if (onAction) {
      onAction(message);
    } else {
      sendMessage(message);
    }
  };

  const handleAskAgent = () => {
    const message = `Tell me more about ${course.name}`;
    if (onAction) {
      onAction(message);
    } else {
      sendMessage(message);
    }
  };

  const cardWidth = compact ? 'w-[280px] sm:w-[260px]' : 'w-[300px] sm:w-[320px]';

  return (
    <motion.div
      ref={containerRef}
      layout
      className={cn(
        'relative overflow-hidden',
        cardWidth,
        'rounded-card',
        'bg-surface-glass backdrop-blur-xl border border-white/10'
      )}
      initial={false}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Hero Section - Always visible */}
      <div className="relative h-[200px] overflow-hidden">
        <CloudinaryImage
          src={course.heroImage}
          alt={course.name}
          width={320}
          height={200}
          blur
          className="w-full h-full"
          objectFit="cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          {/* Badge Row */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-full bg-black/40 backdrop-blur-md text-text-secondary border border-white/10">
              {tierLabels[tier]}
            </span>
            {signatureFeature && (
              <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
                <span>{signatureFeature.icon}</span>
                <span>{signatureFeature.label}</span>
              </span>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white transition-colors hover:bg-black/60"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Heart
                size={16}
                className={cn(
                  'transition-colors',
                  courseIsSaved ? 'fill-accent-coral text-accent-coral' : 'text-white'
                )}
              />
            )}
          </button>
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <h3 className="text-lg font-bold text-white leading-tight">{course.name}</h3>

          <div className="flex items-center gap-3 text-white/60 text-xs">
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{course.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{travelTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed Summary */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-end justify-between">
          {/* Price */}
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider block">
              All-in price
            </span>
            <span className="text-xl font-bold text-accent-gold">
              ฿{allInPrice.toLocaleString()}
            </span>
            <span className="text-xs text-text-muted ml-1">/ round</span>
          </div>

          {/* Expand Button */}
          {expandable && (
            <button
              onClick={toggleExpand}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>{isExpanded ? 'Less' : 'More'}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={12} />
              </motion.div>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-5">
              {/* Photo Gallery */}
              {course.photos && course.photos.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                    Gallery
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {course.photos.map((photo, i) => (
                      <div key={i} className="flex-shrink-0 w-32 space-y-1">
                        <div className="h-20 rounded-lg overflow-hidden">
                          <CloudinaryImage
                            src={photo.url}
                            alt={photo.label}
                            width={128}
                            height={80}
                            className="w-full h-full"
                            objectFit="cover"
                          />
                        </div>
                        <span className="text-[10px] text-text-muted block text-center truncate">
                          {photo.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Section */}
              {availability && (
                <div>
                  <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Availability
                  </h4>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      {availability.status === 'available' && (
                        <>
                          <CheckCircle size={16} className="text-green-400" />
                          <span className="text-sm text-green-400">
                            Available {availability.date && `on ${availability.date}`}
                          </span>
                        </>
                      )}
                      {availability.status === 'limited' && (
                        <>
                          <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                          </span>
                          <span className="text-sm text-amber-400">
                            Limited slots {availability.date && `on ${availability.date}`}
                          </span>
                        </>
                      )}
                      {availability.status === 'unavailable' && (
                        <>
                          <XCircle size={16} className="text-red-400" />
                          <span className="text-sm text-text-muted">
                            Not available {availability.nextAvailable && `- try ${availability.nextAvailable}?`}
                          </span>
                        </>
                      )}
                      {availability.status === 'checking' && (
                        <>
                          <Loader2 size={16} className="animate-spin text-text-muted" />
                          <span className="text-sm text-text-muted">Checking availability...</span>
                        </>
                      )}
                      {availability.status === 'unknown' && (
                        <span className="text-sm text-text-muted">Select dates to check</span>
                      )}
                    </div>

                    {/* Tee Time Slots */}
                    {availability.slots && availability.slots.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {availability.slots.map((slot, i) => (
                          <button
                            key={i}
                            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-text-secondary hover:bg-white/10 transition-colors"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Personalized Insights */}
              {insights.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Good to Know
                  </h4>
                  <div className="space-y-2">
                    {insights.map((insight, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                        <span className="text-base">{insight.icon}</span>
                        <span>{insight.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div>
                <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                  Price Breakdown
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Green Fee</span>
                    <span className="text-text-secondary">฿{course.greenFee.weekday.guest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Caddie</span>
                    <span className="text-text-secondary">฿{(course.caddieFee ?? 450).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Cart</span>
                    <span className="text-text-secondary">฿{(course.cartFee ?? 700).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1.5 border-t border-white/5">
                    <span className="text-text-primary font-medium">Weekday Total</span>
                    <span className="text-accent-gold font-semibold">฿{allInPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 text-text-muted">
                      <Sun size={10} />
                      <span>Weekend Total</span>
                    </div>
                    <span className="text-accent-gold">฿{weekendPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              {facilityTypes.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Facilities
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {facilityTypes.map((facility) => (
                      <div
                        key={facility}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-text-muted"
                        title={FACILITY_LABELS[facility]}
                      >
                        <span className="text-sm">{FACILITY_ICONS[facility]}</span>
                        <span className="text-[10px]">{FACILITY_LABELS[facility]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Info */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
                <Calendar size={14} className="text-accent-cyan" />
                <span className="text-xs text-text-secondary">
                  {course.advanceBooking ?? 'Book 1 day ahead'}
                </span>
              </div>

              {/* Similar Courses */}
              {similarCourses && similarCourses.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Similar Courses
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {similarCourses.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="flex-shrink-0 w-28 p-2 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="h-16 rounded overflow-hidden mb-1">
                          <CloudinaryImage
                            src={c.heroImage}
                            alt={c.name}
                            width={112}
                            height={64}
                            className="w-full h-full"
                            objectFit="cover"
                          />
                        </div>
                        <p className="text-[10px] text-text-secondary truncate">{c.name}</p>
                        <p className="text-[10px] text-accent-gold">฿{calculateAllInPrice(c).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Context-Aware Actions */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                {isTripBuilding ? (
                  // Building a trip - show add to day buttons
                  <div>
                    <p className="text-xs text-text-muted mb-2">Add to your trip:</p>
                    <div className="flex flex-wrap gap-2">
                      {tripDays.map((day) => (
                        <button
                          key={day.id}
                          onClick={() => onAddToDay?.(day.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-text-secondary hover:bg-white/10 transition-colors"
                        >
                          <Plus size={12} />
                          <span>Day {day.number}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Just browsing - show save/compare/ask
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isProcessing}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors',
                        courseIsSaved
                          ? 'bg-accent-coral/10 border-accent-coral/30 text-accent-coral'
                          : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
                      )}
                    >
                      <Heart size={12} className={courseIsSaved ? 'fill-current' : ''} />
                      <span>{courseIsSaved ? 'Saved' : 'Save'}</span>
                    </button>
                    {onCompare && (
                      <button
                        onClick={onCompare}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-text-secondary hover:bg-white/10 transition-colors"
                      >
                        <GitCompareArrows size={12} />
                        <span>Compare</span>
                      </button>
                    )}
                    <button
                      onClick={handleAskAgent}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent-coral border border-accent-coral text-xs text-white font-medium hover:bg-accent-coral/90 transition-colors"
                    >
                      <MessageCircle size={12} />
                      <span>Ask</span>
                    </button>
                  </div>
                )}

                {/* Primary CTA */}
                <button
                  onClick={handleChatInquiry}
                  className="w-full py-2.5 rounded-lg bg-white text-background-base font-medium text-sm transition-colors hover:bg-gray-100 flex items-center justify-center gap-1.5"
                >
                  <span>Check Availability</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const CourseCard = memo(CourseCardInner, (prevProps, nextProps) => {
  return (
    prevProps.course.id === nextProps.course.id &&
    prevProps.compact === nextProps.compact &&
    prevProps.expandable === nextProps.expandable &&
    prevProps.defaultExpanded === nextProps.defaultExpanded &&
    prevProps.availability?.status === nextProps.availability?.status &&
    prevProps.availability?.date === nextProps.availability?.date &&
    prevProps.tripDays?.length === nextProps.tripDays?.length
  );
});
