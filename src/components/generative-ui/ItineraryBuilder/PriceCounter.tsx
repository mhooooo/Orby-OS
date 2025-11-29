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
      className="mt-6 flex items-center justify-center"
    >
      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-emerald-500/10">
        <span className="text-sm font-medium text-gray-400">Estimated total:</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-emerald-400">฿</span>
          <motion.span className="text-2xl font-bold text-white tracking-tight">
            {displayValue}
          </motion.span>
          <span className="text-xs font-medium text-gray-500 ml-1">THB</span>
        </div>
      </div>
    </motion.div>
  );
}
