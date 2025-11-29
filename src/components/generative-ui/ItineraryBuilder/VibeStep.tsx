'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Mountain, Coins } from 'lucide-react';
import { useItinerary } from '@/context/ItineraryContext';
import { TripVibe, VIBE_INFO } from '@/types/itinerary';
import { cn } from '@/lib/utils';

const VIBE_ICONS: Record<TripVibe, React.ReactNode> = {
  championship: <Trophy size={32} />,
  scenic: <Mountain size={32} />,
  value: <Coins size={32} />,
};

const VIBE_COLORS: Record<TripVibe, string> = {
  championship: 'from-amber-500/20 to-amber-600/5',
  scenic: 'from-emerald-500/20 to-emerald-600/5',
  value: 'from-blue-500/20 to-blue-600/5',
};

const VIBE_BORDER_COLORS: Record<TripVibe, string> = {
  championship: 'group-hover:border-amber-500/50',
  scenic: 'group-hover:border-emerald-500/50',
  value: 'group-hover:border-blue-500/50',
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">What&apos;s your vibe?</h3>
        <p className="text-gray-400">
          This helps us recommend the right courses for you
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {vibes.map(([vibe, info], index) => (
          <motion.button
            key={vibe}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(vibe)}
            className={cn(
              'relative overflow-hidden rounded-3xl p-1 text-left transition-all duration-300 group',
              selectedVibe === vibe
                ? 'scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                : 'hover:scale-[1.01]'
            )}
          >
            <div className={cn(
              "relative h-full rounded-[1.3rem] overflow-hidden p-6 flex items-center gap-6",
              "bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 transition-colors duration-300",
              selectedVibe === vibe ? "bg-white/10 border-white/30" : "group-hover:bg-white/5",
              VIBE_BORDER_COLORS[vibe]
            )}>
              {/* Gradient background */}
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-500',
                  selectedVibe === vibe ? 'opacity-100' : 'group-hover:opacity-50',
                  VIBE_COLORS[vibe]
                )}
              />

              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg',
                  selectedVibe === vibe
                    ? 'bg-white text-black scale-110'
                    : 'bg-black/40 text-white/70 group-hover:text-white group-hover:bg-black/60'
                )}
              >
                {VIBE_ICONS[vibe]}
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1">
                <h4 className={cn(
                  "text-xl font-bold mb-1 transition-colors",
                  selectedVibe === vibe ? "text-white" : "text-white/90"
                )}>
                  {info.label}
                </h4>
                <p className={cn(
                  "text-sm transition-colors",
                  selectedVibe === vibe ? "text-white/80" : "text-gray-400"
                )}>
                  {info.description}
                </p>
              </div>

              {/* Radio indicator */}
              <div
                className={cn(
                  'relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                  selectedVibe === vibe
                    ? 'border-white bg-white'
                    : 'border-white/20 group-hover:border-white/40'
                )}
              >
                {selectedVibe === vibe && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2.5 h-2.5 rounded-full bg-black"
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
