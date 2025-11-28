'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';

const DAYS_OPTIONS = [
  { days: 2, label: 'Weekend', description: '2 rounds' },
  { days: 3, label: 'Long Weekend', description: '3 rounds' },
  { days: 5, label: 'Week', description: '5 rounds' },
  { days: 7, label: 'Full Week', description: '7 rounds' },
];

export function DaysPicker() {
  const { sendMessage } = useChatContext();

  const handleSelect = (option: typeof DAYS_OPTIONS[0]) => {
    sendMessage(`I want to play ${option.days} days of golf`);
  };

  return (
    <div className="w-full max-w-md">
      <div className="grid grid-cols-2 gap-2">
        {DAYS_OPTIONS.map((option, idx) => (
          <motion.button
            key={option.days}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleSelect(option)}
            className="flex items-center gap-3 p-4 rounded-2xl bg-[#282A2C] border border-gray-700 hover:border-[#FF6B35] hover:bg-[#282A2C]/80 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-700 group-hover:bg-[#FF6B35] flex items-center justify-center transition-colors">
              <Calendar size={18} className="text-gray-300 group-hover:text-white transition-colors" />
            </div>
            <div>
              <div className="font-semibold text-white">{option.days} days</div>
              <div className="text-xs text-gray-500">{option.description}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
