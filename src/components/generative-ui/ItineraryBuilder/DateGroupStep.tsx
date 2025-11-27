'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useItinerary } from '@/context/ItineraryContext';
import { cn } from '@/lib/utils';

export function DateGroupStep() {
  const { state, setDates, setGroupSize } = useItinerary();
  const { startDate, endDate, numberOfDays, groupSize } = state.draft;

  const [localStartDate, setLocalStartDate] = useState(startDate || '');
  const [localDays, setLocalDays] = useState(numberOfDays);
  const [localGroupSize, setLocalGroupSize] = useState(groupSize);

  // Update context when values change
  useEffect(() => {
    if (localStartDate) {
      const start = new Date(localStartDate);
      const end = new Date(start.getTime() + (localDays - 1) * 24 * 60 * 60 * 1000);
      setDates(localStartDate, end.toISOString().split('T')[0], localDays);
    }
  }, [localStartDate, localDays, setDates]);

  useEffect(() => {
    setGroupSize(localGroupSize);
  }, [localGroupSize, setGroupSize]);

  const handleDaysChange = (delta: number) => {
    const newDays = Math.max(1, Math.min(14, localDays + delta));
    setLocalDays(newDays);
  };

  const handleGroupChange = (delta: number) => {
    const newSize = Math.max(1, Math.min(16, localGroupSize + delta));
    setLocalGroupSize(newSize);
  };

  // Calculate end date display
  const getEndDate = () => {
    if (!localStartDate) return '';
    const start = new Date(localStartDate);
    const end = new Date(start.getTime() + (localDays - 1) * 24 * 60 * 60 * 1000);
    return end.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-white">When & Who</h3>
        <p className="text-sm text-gray-400 mt-1">
          Set your travel dates and group size
        </p>
      </div>

      {/* Date Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[#282A2C] p-4 border border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#A4E600]/20 flex items-center justify-center">
            <Calendar size={20} className="text-[#A4E600]" />
          </div>
          <div>
            <h4 className="font-medium text-white">Travel Dates</h4>
            <p className="text-xs text-gray-400">Select your start date</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Start Date Input */}
          <div className="relative">
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              min={getMinDate()}
              className={cn(
                'w-full p-3 rounded-xl bg-[#1E1F20] border border-gray-600',
                'text-white text-sm focus:outline-none focus:border-[#A4E600]',
                'appearance-none cursor-pointer',
                '[color-scheme:dark]'
              )}
            />
          </div>

          {/* Duration Selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1F20]">
            <span className="text-sm text-gray-300">Trip Duration</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDaysChange(-1)}
                disabled={localDays <= 1}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  localDays <= 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                )}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="w-16 text-center font-medium text-white">
                {localDays} {localDays === 1 ? 'day' : 'days'}
              </span>
              <button
                onClick={() => handleDaysChange(1)}
                disabled={localDays >= 14}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  localDays >= 14
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                )}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Date Summary */}
          {localStartDate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-gray-400"
            >
              {new Date(localStartDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}{' '}
              → {getEndDate()}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Group Size Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-[#282A2C] p-4 border border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#A4E600]/20 flex items-center justify-center">
            <Users size={20} className="text-[#A4E600]" />
          </div>
          <div>
            <h4 className="font-medium text-white">Group Size</h4>
            <p className="text-xs text-gray-400">How many golfers?</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => handleGroupChange(-1)}
            disabled={localGroupSize <= 1}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
              localGroupSize <= 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            )}
          >
            <Minus size={20} />
          </button>

          <div className="text-center">
            <span className="text-4xl font-bold text-white">{localGroupSize}</span>
            <p className="text-xs text-gray-400 mt-1">
              {localGroupSize === 1 ? 'golfer' : 'golfers'}
            </p>
          </div>

          <button
            onClick={() => handleGroupChange(1)}
            disabled={localGroupSize >= 16}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
              localGroupSize >= 16
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            )}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Group size hints */}
        <div className="mt-4 flex justify-center gap-2">
          {[2, 4, 8].map((size) => (
            <button
              key={size}
              onClick={() => setLocalGroupSize(size)}
              className={cn(
                'px-3 py-1 rounded-full text-xs transition-colors',
                localGroupSize === size
                  ? 'bg-[#A4E600] text-black font-medium'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              )}
            >
              {size} {size === 4 ? '(flight)' : size === 8 ? '(group)' : ''}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
