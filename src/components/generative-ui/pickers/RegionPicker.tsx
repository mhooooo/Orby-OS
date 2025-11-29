'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useChatContext } from '@/context/ChatContext';

const REGIONS = [
  { id: 'bangkok', name: 'Bangkok', courses: 12, emoji: '🏙️' },
  { id: 'phuket', name: 'Phuket', courses: 8, emoji: '🏝️' },
  { id: 'pattaya', name: 'Pattaya', courses: 15, emoji: '🌴' },
  { id: 'hua_hin', name: 'Hua Hin', courses: 10, emoji: '👑' },
  { id: 'chiang_mai', name: 'Chiang Mai', courses: 6, emoji: '⛰️' },
];

export function RegionPicker() {
  const { sendMessage } = useChatContext();

  const handleSelect = (region: typeof REGIONS[0]) => {
    sendMessage(`I want to play in ${region.name}`);
  };

  return (
    <div className="w-full max-w-md">
      <div className="grid grid-cols-2 gap-2">
        {REGIONS.map((region, idx) => (
          <motion.button
            key={region.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleSelect(region)}
            className="flex items-center gap-3 p-3 rounded-2xl bg-[#282A2C] border border-gray-700 hover:border-[#FF6B35] hover:bg-[#282A2C]/80 transition-all text-left group"
          >
            <span className="text-2xl">{region.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white group-hover:text-[#FF6B35] transition-colors">
                {region.name}
              </div>
              <div className="text-xs text-gray-500">{region.courses} courses</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
