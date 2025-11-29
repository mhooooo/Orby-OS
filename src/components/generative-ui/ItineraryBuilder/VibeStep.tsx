'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Mountain, Coins } from 'lucide-react';
import { useItinerary } from '@/context/ItineraryContext';
import { TripVibe, VIBE_INFO } from '@/types/itinerary';
import { cn } from '@/lib/utils';

const VIBE_ICONS: Record<TripVibe, React.ReactNode> = {
  championship: <Trophy size={24} />,
  scenic: <Mountain size={24} />,
  value: <Coins size={24} />,
};

const VIBE_COLORS: Record<TripVibe, string> = {
  championship: 'from-amber-500/20 to-amber-600/5',
  scenic: 'from-emerald-500/20 to-emerald-600/5',
  value: 'from-blue-500/20 to-blue-600/5',
};

export function VibeStep() {
  const { state, setVibe, nextStep } = useItinerary();
  const selectedVibe = state.draft.vibe;

  const handleSelect = (vibe: TripVibe) => {
    setVibe(vibe);
    setTimeout(() => nextStep(), 300);
  };

  const vibes = Object.entries(VIBE_INFO) as [TripVibe, { label: string; description: string }][];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-white">What&apos;s your vibe?</h3>
        <p className="text-sm text-gray-400 mt-1">
          This helps us recommend the right courses for you
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {vibes.map(([vibe, info], index) => (
          <motion.button
            key={vibe}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(vibe)}
            className={cn(
              'relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200',
              'border hover:border-[#FF6B35]/50',
              selectedVibe === vibe
                ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                : 'border-gray-700 bg-[#282A2C]'
            )}
          >
            {/* Gradient background */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-r opacity-50',
                VIBE_COLORS[vibe]
              )}
            />

            {/* Content */}
            <div className="relative z-10 flex items-center gap-4">
              <div
                className={cn(
                  'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                  selectedVibe === vibe
                    ? 'bg-[#FF6B35] text-black'
                    : 'bg-gray-700 text-gray-300'
                )}
              >
                {VIBE_ICONS[vibe]}
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-white">{info.label}</h4>
                <p className="text-sm text-gray-400 mt-0.5">{info.description}</p>
              </div>

              {/* Radio indicator */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  selectedVibe === vibe
                    ? 'border-[#FF6B35] bg-[#FF6B35]'
                    : 'border-gray-600'
                )}
              >
                {selectedVibe === vibe && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-black"
                  />
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
