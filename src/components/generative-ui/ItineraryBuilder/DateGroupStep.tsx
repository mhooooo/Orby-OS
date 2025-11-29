'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useItinerary } from '@/context/ItineraryContext';
import { cn } from '@/lib/utils';

export function DateGroupStep() {
  const { state, setDates, setGroupSize } = useItinerary();
  const { startDate, numberOfDays, groupSize } = state.draft;

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
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">When & Who</h3>
        <p className="text-gray-400">
          Set your travel dates and group size
        </p>
      </div>

      {/* Date Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 p-8 shadow-lg"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Calendar size={24} className="text-blue-400" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Travel Dates</h4>
            <p className="text-sm text-gray-400">Select your start date</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Start Date Input */}
          <div className="relative group">
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              min={getMinDate()}
              className={cn(
                'w-full p-4 rounded-xl bg-white/5 border border-white/10',
                'text-white text-base focus:outline-none focus:border-blue-500/50 focus:bg-white/10',
                'appearance-none cursor-pointer transition-all duration-300',
                '[color-scheme:dark]'
              )}
            />
          </div>

          {/* Duration Selector */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-gray-300 font-medium">Trip Duration</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleDaysChange(-1)}
                disabled={localDays <= 1}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
                  localDays <= 1
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                )}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="w-20 text-center font-bold text-white text-lg">
                {localDays} {localDays === 1 ? 'day' : 'days'}
              </span>
              <button
                onClick={() => handleDaysChange(1)}
                disabled={localDays >= 14}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
                  localDays >= 14
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                )}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Date Summary */}
          {localStartDate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
            >
              <span className="text-blue-300 font-medium">
                {new Date(localStartDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                → {getEndDate()}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Group Size Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[2rem] bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 p-8 shadow-lg"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-500/10">
            <Users size={24} className="text-purple-400" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Group Size</h4>
            <p className="text-sm text-gray-400">How many golfers?</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 py-4">
          <button
            onClick={() => handleGroupChange(-1)}
            disabled={localGroupSize <= 1}
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200',
              localGroupSize <= 1
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
            )}
          >
            <Minus size={24} />
          </button>

          <div className="text-center min-w-[100px]">
            <span className="text-5xl font-bold text-white tracking-tight">{localGroupSize}</span>
            <p className="text-sm text-gray-400 mt-2 font-medium uppercase tracking-wide">
              {localGroupSize === 1 ? 'golfer' : 'golfers'}
            </p>
          </div>

          <button
            onClick={() => handleGroupChange(1)}
            disabled={localGroupSize >= 16}
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200',
              localGroupSize >= 16
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
            )}
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Group size hints */}
        <div className="mt-8 flex justify-center gap-3">
          {[2, 4, 8].map((size) => (
            <button
              key={size}
              onClick={() => setLocalGroupSize(size)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                localGroupSize === size
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              )}
            >
              {size} {size === 4 ? 'Flight' : size === 8 ? 'Group' : ''}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
