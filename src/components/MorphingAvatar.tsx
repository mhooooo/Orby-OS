'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PersistentActor } from './NeuralDots';

interface MorphingAvatarProps {
  isChatting: boolean;
  isThinking?: boolean;
  onLoadingComplete?: () => void;
}

const CONTAINER_SPRING = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export function MorphingAvatar({ isChatting, isThinking = false, onLoadingComplete }: MorphingAvatarProps) {
  const [hasLoaded, setHasLoaded] = useState(false);

  // Auto-complete loading after a short delay if no explicit loading state
  // This ensures the avatar doesn't get stuck in loading
  useEffect(() => {
    if (!hasLoaded) {
      const timer = setTimeout(() => {
        setHasLoaded(true);
        onLoadingComplete?.();
      }, 500); // Short delay to allow initial render
      return () => clearTimeout(timer);
    }
  }, [hasLoaded, onLoadingComplete]);

  return (
    <motion.div
      className="absolute z-50 origin-top"
      style={{
        left: '50%',
        x: '-50%'
      }}
      initial={false}
      animate={{
        // Hero: 35% down the container
        // Chat: 20px from the top
        top: isChatting ? '20px' : '35%',
        // Vertical offset to ensure true visual center
        y: isChatting ? 0 : '-50%',
      }}
      transition={CONTAINER_SPRING}
    >
      <PersistentActor
        state={isChatting ? 'chat' : 'hero'}
        isThinking={isThinking}
      />
    </motion.div>
  );
}