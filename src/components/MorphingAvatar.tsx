'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NeuralDots } from './NeuralDots';

interface MorphingAvatarProps {
  isChatting: boolean;
  isThinking?: boolean;
}

export function MorphingAvatar({ isChatting, isThinking = false }: MorphingAvatarProps) {
  return (
    <motion.div
      layoutId="agent-avatar"
      className="fixed z-50"
      initial={false}
      animate={{
        // Hero: centered above "Hi, there!" text
        // Chat: Dynamic Island style - top center
        top: isChatting ? 20 : 'calc(35% - 80px)',
        left: '50%',
        x: '-50%',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      <motion.div
        className="flex items-center justify-center"
        animate={{
          width: isChatting ? 48 : 120,
          height: isChatting ? 48 : 120,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        <NeuralDots
          size={isChatting ? 'medium' : 'hero'}
          isThinking={isThinking}
        />
      </motion.div>
    </motion.div>
  );
}
