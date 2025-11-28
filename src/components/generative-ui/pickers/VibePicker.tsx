'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Mountain, Coins } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';

const VIBES = [
  {
    id: 'championship',
    name: 'Championship',
    description: 'Tournament-quality, challenging layouts',
    icon: Trophy,
    color: 'from-amber-500/20 to-amber-600/10',
  },
  {
    id: 'scenic',
    name: 'Scenic',
    description: 'Beautiful landscapes, photo-worthy views',
    icon: Mountain,
    color: 'from-emerald-500/20 to-emerald-600/10',
  },
  {
    id: 'value',
    name: 'Value',
    description: 'Great golf at accessible prices',
    icon: Coins,
    color: 'from-blue-500/20 to-blue-600/10',
  },
];

export function VibePicker() {
  const { sendMessage } = useChatContext();

  const handleSelect = (vibe: typeof VIBES[0]) => {
    sendMessage(`I prefer ${vibe.name.toLowerCase()} courses`);
  };

  return (
    <div className="w-full max-w-md">
      <div className="space-y-2">
        {VIBES.map((vibe, idx) => (
          <motion.button
            key={vibe.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleSelect(vibe)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#282A2C] border border-gray-700 hover:border-[#FF6B35] transition-all text-left group overflow-hidden relative"
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${vibe.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

            <div className="relative z-10 w-12 h-12 rounded-xl bg-gray-700 group-hover:bg-[#FF6B35] flex items-center justify-center transition-colors">
              <vibe.icon size={24} className="text-gray-300 group-hover:text-white transition-colors" />
            </div>

            <div className="relative z-10 flex-1">
              <div className="font-semibold text-white">{vibe.name}</div>
              <div className="text-sm text-gray-400">{vibe.description}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
