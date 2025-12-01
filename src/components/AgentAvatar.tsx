'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GolfOkayIcon } from './icons/GolfOkayIcon';

interface AgentAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  isThinking?: boolean;
  className?: string;
}

export function AgentAvatar({ size = 'md', isThinking = false, className = '' }: AgentAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
    hero: 'w-28 h-28',
  };

  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 48,
    xl: 56,
    hero: 64,
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Thinking Halo - Spinning Gradient */}
      {isThinking && (
        <motion.div
          className="absolute inset-[-4px] rounded-full"
          style={{
            background: `conic-gradient(
              from 0deg,
              #F05D5E,
              #FEE440,
              #00BBF9,
              #9B5DE5,
              #FF6B35,
              #F05D5E
            )`,
            filter: 'blur(8px)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Subtle Breathing Glow (when idle) */}
      {!isThinking && (
        <motion.div
          className="absolute inset-[-2px] rounded-full bg-white/10"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Avatar Circle */}
      <div
        className={`relative w-full h-full rounded-full bg-[#1E1F20] border border-white/25 flex items-center justify-center overflow-hidden ${
          size === 'hero' || size === 'xl' ? 'shadow-[0_0_60px_rgba(255,255,255,0.15)]' : ''
        }`}
      >
        <GolfOkayIcon size={iconSizes[size]} className="text-white" />
      </div>
    </div>
  );
}
