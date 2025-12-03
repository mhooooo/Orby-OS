import { ItineraryDraft, TripVibe } from '@/types/itinerary';
import { Course } from '@/types/course';

// Pricing constants (in THB)
const PRICING = {
  // Average green fees by vibe (when no specific courses selected)
  vibeGreenFees: {
    championship: 4500,
    scenic: 3500,
    value: 2000,
  } as Record<TripVibe, number>,

  // Transfer costs per day
  transfers: {
    sedan: 2500,
    'vip-van': 4500,
    'vvip-van': 6500,
  },

  // Airport transfer surcharge
  airportPickup: 1500,

  // Caddie tip per round
  caddieTip: 400,

  // Group discount thresholds
  groupDiscounts: [
    { minSize: 8, discount: 0.1 }, // 10% off for 8+
    { minSize: 12, discount: 0.15 }, // 15% off for 12+
  ],

  // Default rounds per day
  roundsPerDay: 1,
};

/**
 * Calculate the estimated price for an itinerary
 */
export function calculateItineraryPrice(
  draft: ItineraryDraft,
  courses: Course[] = []
): number {
  const { numberOfDays, groupSize, vibe, transfers, includeCaddieTips } = draft;

  // If no selections made yet, return 0
  if (!vibe && numberOfDays === 0) {
    return 0;
  }

  let total = 0;

  // 1. Green fees estimate
  const greenFeePerRound = vibe
    ? getAverageGreenFee(vibe, courses)
    : PRICING.vibeGreenFees.value;
  const totalRounds = numberOfDays * PRICING.roundsPerDay;
  const greenFeesTotal = greenFeePerRound * totalRounds * groupSize;
  total += greenFeesTotal;

  // 2. Transfer costs
  if (transfers.enabled) {
    const transferCostPerDay = PRICING.transfers[transfers.vehicleType];
    const transferDays = numberOfDays;
    total += transferCostPerDay * transferDays;

    // Airport pickup surcharge
    if (transfers.includesAirportPickup) {
      total += PRICING.airportPickup;
    }
  }

  // 3. Caddie tips
  if (includeCaddieTips) {
    total += PRICING.caddieTip * totalRounds * groupSize;
  }

  // 4. Apply group discount
  const discount = getGroupDiscount(groupSize);
  if (discount > 0) {
    total = total * (1 - discount);
  }

  return Math.round(total);
}

/**
 * Get average green fee based on vibe and available courses
 */
function getAverageGreenFee(vibe: TripVibe, courses: Course[]): number {
  // If we have courses, calculate average from them
  if (courses.length > 0) {
    // Filter courses by vibe (using tags as proxy)
    const vibeTag = vibe === 'championship' ? 'championship' : vibe;
    const matchingCourses = courses.filter((c) =>
      c.tags.some((t) => t.toLowerCase().includes(vibeTag))
    );

    const relevantCourses = matchingCourses.length > 0 ? matchingCourses : courses;
    const avgFee =
      relevantCourses.reduce((sum, c) => sum + c.greenFee.weekday.guest, 0) /
      relevantCourses.length;

    return Math.round(avgFee);
  }

  // Fall back to preset averages
  return PRICING.vibeGreenFees[vibe];
}

/**
 * Get applicable group discount
 */
function getGroupDiscount(groupSize: number): number {
  const applicable = PRICING.groupDiscounts
    .filter((d) => groupSize >= d.minSize)
    .sort((a, b) => b.discount - a.discount);

  return applicable.length > 0 ? applicable[0].discount : 0;
}

/**
 * Calculate breakdown for display
 */
export function calculatePriceBreakdown(
  draft: ItineraryDraft,
  courses: Course[] = []
): PriceBreakdown {
  const { numberOfDays, groupSize, vibe, transfers, includeCaddieTips } = draft;

  const greenFeePerRound = vibe
    ? getAverageGreenFee(vibe, courses)
    : PRICING.vibeGreenFees.value;
  const totalRounds = numberOfDays * PRICING.roundsPerDay;

  const breakdown: PriceBreakdown = {
    greenFees: {
      perRound: greenFeePerRound,
      rounds: totalRounds,
      golfers: groupSize,
      subtotal: greenFeePerRound * totalRounds * groupSize,
    },
    transfers: {
      enabled: transfers.enabled,
      vehicleType: transfers.vehicleType,
      perDay: transfers.enabled ? PRICING.transfers[transfers.vehicleType] : 0,
      days: numberOfDays,
      airportPickup: transfers.enabled && transfers.includesAirportPickup ? PRICING.airportPickup : 0,
      subtotal: transfers.enabled
        ? PRICING.transfers[transfers.vehicleType] * numberOfDays +
          (transfers.includesAirportPickup ? PRICING.airportPickup : 0)
        : 0,
    },
    caddieTips: {
      enabled: includeCaddieTips,
      perRound: PRICING.caddieTip,
      rounds: totalRounds,
      golfers: groupSize,
      subtotal: includeCaddieTips ? PRICING.caddieTip * totalRounds * groupSize : 0,
    },
    discount: {
      percentage: getGroupDiscount(groupSize) * 100,
      amount: 0,
    },
    total: 0,
  };

  // Calculate subtotal before discount
  const subtotal = breakdown.greenFees.subtotal + breakdown.transfers.subtotal + breakdown.caddieTips.subtotal;

  // Apply discount
  const discountAmount = subtotal * getGroupDiscount(groupSize);
  breakdown.discount.amount = Math.round(discountAmount);
  breakdown.total = Math.round(subtotal - discountAmount);

  return breakdown;
}

// Types for price breakdown
export interface PriceBreakdown {
  greenFees: {
    perRound: number;
    rounds: number;
    golfers: number;
    subtotal: number;
  };
  transfers: {
    enabled: boolean;
    vehicleType: 'sedan' | 'vip-van' | 'vvip-van';
    perDay: number;
    days: number;
    airportPickup: number;
    subtotal: number;
  };
  caddieTips: {
    enabled: boolean;
    perRound: number;
    rounds: number;
    golfers: number;
    subtotal: number;
  };
  discount: {
    percentage: number;
    amount: number;
  };
  total: number;
}
