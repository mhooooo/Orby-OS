'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useItinerary } from '@/context/ItineraryContext';
import { calculateItineraryPrice } from '@/lib/pricing';

export function PriceCounter() {
  const { state, dispatch } = useItinerary();
  const { draft, availableCourses } = state;
  const [displayPrice, setDisplayPrice] = useState(0);

  // Calculate total price whenever draft changes
  useEffect(() => {
    const total = calculateItineraryPrice(draft, availableCourses);
    dispatch({ type: 'UPDATE_TOTAL', payload: total });
    setDisplayPrice(total);
  }, [draft, availableCourses, dispatch]);

  // Animated spring for smooth number transitions
  const springValue = useSpring(displayPrice, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  const displayValue = useTransform(springValue, (value) =>
    Math.round(value).toLocaleString()
  );

  // Update spring when display price changes
  useEffect(() => {
    springValue.set(displayPrice);
  }, [displayPrice, springValue]);

  if (displayPrice === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-4 flex items-center justify-center"
    >
      <div className="inline-flex items-baseline gap-1 px-4 py-2 rounded-full bg-[#282A2C] border border-gray-700">
        <span className="text-xs text-gray-400">Estimated total:</span>
        <span className="text-lg font-semibold text-[#A4E600]">฿</span>
        <motion.span className="text-lg font-semibold text-white">
          {displayValue}
        </motion.span>
        <span className="text-xs text-gray-500 ml-1">THB</span>
      </div>
    </motion.div>
  );
}
