'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChatInput } from './chat/ChatInput';
import { Sparkles, Trophy, Wand2, Tag } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';

// Brand color palette for spectrum pills - Supercharged contrast
const BRAND_COLORS = {
  purple: 'text-[#E0C3FC] bg-[#9B5DE5]/20 border-[#9B5DE5]/40 hover:bg-[#9B5DE5]/30',
  blue: 'text-[#B3ECFF] bg-[#00BBF9]/20 border-[#00BBF9]/40 hover:bg-[#00BBF9]/30',
  orange: 'text-[#FFCDB3] bg-[#FF6B35]/20 border-[#FF6B35]/40 hover:bg-[#FF6B35]/30',
  red: 'text-[#FFC5C5] bg-[#F05D5E]/20 border-[#F05D5E]/40 hover:bg-[#F05D5E]/30',
} as const;

type ColorKey = keyof typeof BRAND_COLORS;

interface SpectrumPill {
  icon: React.ElementType;
  label: string;
  colorKey: ColorKey;
  prompt: string;
}

const SPECTRUM_PILLS: SpectrumPill[] = [
  {
    icon: Sparkles,
    label: "First-Time Guide",
    colorKey: "purple",
    prompt: "I've never played golf in Thailand before. Guide me through the best regions and what I need to know."
  },
  {
    icon: Trophy,
    label: "Top Rated",
    colorKey: "blue",
    prompt: "Show me the top 3 rated golf courses in Thailand with a 'Course HoloCard' for each."
  },
  {
    icon: Wand2,
    label: "Build a Trip",
    colorKey: "orange",
    prompt: "I want to plan a custom trip. Ask me the necessary questions (dates, pax, skill) to build an itinerary."
  },
  {
    icon: Tag,
    label: "Get a Price",
    colorKey: "red",
    prompt: "I need a quick quote. Ask me for my requirements so you can give me an estimated price breakdown."
  },
];

interface GreetingStateContentProps {
  onIntroComplete?: () => void;
}

export function GreetingStateContent({ onIntroComplete: _onIntroComplete }: GreetingStateContentProps) {
  const { sendMessage } = useChatContext();

  const handlePillClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* Main Content */}
      <div className="w-full flex flex-col items-center">
        {/* Greeting Text */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-5xl md:text-6xl font-semibold text-white tracking-tight drop-shadow-lg">
            Hi, there!
          </h2>
        </motion.div>

        {/* Centered Input */}
        <motion.div
          className="w-full px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ChatInput variant="centered" className="p-0" />
        </motion.div>

        {/* Spectrum Pills */}
        <motion.div
          className="mt-6 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {SPECTRUM_PILLS.map((pill) => {
            const colorClasses = BRAND_COLORS[pill.colorKey];
            return (
              <button
                key={pill.label}
                onClick={() => handlePillClick(pill.prompt)}
                className="group relative flex items-center gap-3 pl-2 pr-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/15 rounded-full hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:shadow-black/20 transition-all duration-300"
              >
                {/* Icon Container */}
                <div className={`p-2 rounded-full border transition-all duration-300 group-hover:scale-110 ${colorClasses}`}>
                  <pill.icon size={18} strokeWidth={1.5} />
                </div>
                {/* Label */}
                <span className="text-sm font-medium text-gray-100 group-hover:text-white">
                  {pill.label}
                </span>
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

