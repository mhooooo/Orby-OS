'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Car, Bus, X } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';

const TRANSPORT_OPTIONS = [
  {
    id: 'sedan',
    name: 'Sedan',
    description: 'Toyota Camry, up to 3 golfers',
    price: '฿2,500/day',
    icon: Car,
  },
  {
    id: 'van',
    name: 'VIP Van',
    description: 'Toyota Alphard, up to 8 golfers',
    price: '฿4,500/day',
    icon: Bus,
    luxury: true,
  },
  {
    id: 'none',
    name: 'No transport needed',
    description: "I'll arrange my own",
    icon: X,
  },
];

export function TransportPicker() {
  const { sendMessage } = useChatContext();

  const handleSelect = (option: typeof TRANSPORT_OPTIONS[0]) => {
    if (option.id === 'none') {
      sendMessage("I'll arrange my own transport");
    } else {
      sendMessage(`I'd like the ${option.name} for transfers`);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="space-y-2">
        {TRANSPORT_OPTIONS.map((option, idx) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleSelect(option)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#282A2C] border border-gray-700 hover:border-[#FF6B35] transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-700 group-hover:bg-[#FF6B35] flex items-center justify-center transition-colors">
              <option.icon size={22} className="text-gray-300 group-hover:text-white transition-colors" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{option.name}</span>
                {option.luxury && (
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#FF6B35]/20 text-[#FF6B35]">
                    Luxury
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">{option.description}</div>
            </div>

            {option.price && (
              <div className="text-right">
                <div className="text-sm font-semibold text-[#FF6B35]">{option.price}</div>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
