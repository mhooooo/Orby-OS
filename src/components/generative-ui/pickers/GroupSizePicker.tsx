'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Users, UsersRound } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';

const GROUP_OPTIONS = [
  { id: 'solo', size: 1, label: 'Solo', description: 'Just me', icon: User },
  { id: 'couple', size: 2, label: 'Pair', description: '2 golfers', icon: Users },
  { id: 'flight', size: 4, label: 'Flight', description: '4 golfers', icon: UsersRound },
  { id: 'group', size: 8, label: 'Group', description: '8 golfers', icon: UsersRound },
];

export function GroupSizePicker() {
  const { sendMessage } = useChatContext();

  const handleSelect = (option: typeof GROUP_OPTIONS[0]) => {
    sendMessage(`There will be ${option.size} ${option.size === 1 ? 'golfer' : 'golfers'}`);
  };

  return (
    <div className="w-full max-w-md">
      <div className="grid grid-cols-4 gap-2">
        {GROUP_OPTIONS.map((option, idx) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleSelect(option)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#282A2C] border border-gray-700 hover:border-[#FF6B35] hover:bg-[#282A2C]/80 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-700 group-hover:bg-[#FF6B35] flex items-center justify-center transition-colors">
              <option.icon size={20} className="text-gray-300 group-hover:text-white transition-colors" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{option.size}</div>
              <div className="text-xs text-gray-500">{option.description}</div>
            </div>
          </motion.button>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center mt-3">
        Groups of 8+ get special discounts
      </p>
    </div>
  );
}
