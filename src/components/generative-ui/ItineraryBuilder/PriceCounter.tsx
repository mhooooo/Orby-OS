'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useItinerary } from '@/context/ItineraryContext';
import { calculateItineraryPrice } from '@/lib/pricing';

export function PriceCounter() {
  const { state, dispatch } = useItinerary();
  const { draft, availableCourses } = state;
  const [displayValue, setDisplayValue] = useState('0');

  // Calculate total price whenever draft changes (memoized)
  const calculatedPrice = useMemo(() => {
    return calculateItineraryPrice(draft, availableCourses);
  }, [draft, availableCourses]);

  // Update context with the calculated price
  useEffect(() => {
    dispatch({ type: 'UPDATE_TOTAL', payload: calculatedPrice });
  }, [calculatedPrice, dispatch]);

  // Animated spring for smooth number transitions
  const springValue = useSpring(calculatedPrice, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  // Update spring when calculated price changes
  useEffect(() => {
    springValue.set(calculatedPrice);
  }, [calculatedPrice, springValue]);

  // Subscribe to spring value changes
  useEffect(() => {
    const unsubscribe = springValue.on('change', (value) => {
      setDisplayValue(Math.round(value).toLocaleString());
    });
    return unsubscribe;
  }, [springValue]);

  if (calculatedPrice === 0) {
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
        <span className="text-lg font-semibold text-[#FF6B35]">฿</span>
        <motion.span className="text-lg font-semibold text-white">
          {displayValue}
        </motion.span>
        <span className="text-xs text-gray-500 ml-1">THB</span>
      </div>
    </motion.div>
  );
}
