'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useItinerary } from '@/context/ItineraryContext';
import { Region, REGION_NAMES } from '@/types/itinerary';
import { cn } from '@/lib/utils';

const REGION_DATA: { region: Region; description: string; courses: number; image: string }[] = [
  {
    region: 'bangkok',
    description: 'World-class courses, nightlife, easy access',
    courses: 12,
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80',
  },
  {
    region: 'phuket',
    description: 'Ocean views, luxury resorts, island vibes',
    courses: 8,
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80',
  },
  {
    region: 'hua_hin',
    description: 'Royal courses, beach town, local charm',
    courses: 10,
    image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&q=80',
  },
  {
    region: 'chiang_mai',
    description: 'Mountain scenery, cooler climate, temples',
    courses: 6,
    image: 'https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=400&q=80',
  },
  {
    region: 'pattaya',
    description: 'Endless courses, entertainment, easy from BKK',
    courses: 15,
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80',
  },
];

export function RegionStep() {
  const { state, setRegion, nextStep } = useItinerary();
  const selectedRegion = state.draft.region;

  const handleSelect = (region: Region) => {
    setRegion(region);
    // Auto-advance after selection
    setTimeout(() => nextStep(), 300);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Where do you want to play?</h3>
        <p className="text-gray-400">
          Select your destination region in Thailand
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REGION_DATA.map(({ region, description, courses, image }, index) => (
          <motion.button
            key={region}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(region)}
            className={cn(
              'relative overflow-hidden rounded-3xl p-1 text-left transition-all duration-300 group',
              selectedRegion === region
                ? 'ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'hover:scale-[1.02]'
            )}
          >
            <div className={cn(
              "relative h-full rounded-[1.3rem] overflow-hidden p-5",
              "bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10",
              selectedRegion === region ? "bg-emerald-900/20" : "group-hover:bg-white/5"
            )}>
              {/* Background image overlay */}
              <div
                className="absolute inset-0 opacity-30 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <span className="text-xs font-bold text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    {courses} courses
                  </span>

                  {/* Selected indicator */}
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                    selectedRegion === region
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-white/30 group-hover:border-white/50"
                  )}>
                    {selectedRegion === region && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <MapPin size={18} className={selectedRegion === region ? "text-emerald-400" : "text-white/60"} />
                    {REGION_NAMES[region]}
                  </h4>
                  <p className="text-sm text-gray-300 font-light">{description}</p>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
