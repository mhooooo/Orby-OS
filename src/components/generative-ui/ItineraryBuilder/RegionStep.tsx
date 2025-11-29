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
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-white">Where do you want to play?</h3>
        <p className="text-sm text-gray-400 mt-1">
          Select your destination region in Thailand
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REGION_DATA.map(({ region, description, courses, image }, index) => (
          <motion.button
            key={region}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(region)}
            className={cn(
              'relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200',
              'border hover:border-[#FF6B35]/50',
              selectedRegion === region
                ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                : 'border-gray-700 bg-[#282A2C] hover:bg-[#282A2C]/80'
            )}
          >
            {/* Background image overlay */}
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <MapPin size={16} className="text-[#FF6B35]" />
                    {REGION_NAMES[region]}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{description}</p>
                </div>
                <span className="text-xs text-gray-500 bg-black/30 px-2 py-1 rounded-full">
                  {courses} courses
                </span>
              </div>
            </div>

            {/* Selected indicator */}
            {selectedRegion === region && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#FF6B35] flex items-center justify-center"
              >
                <svg
                  className="w-3 h-3 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
