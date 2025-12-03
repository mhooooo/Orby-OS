'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

// Brand Colors (Fireflies)
const COLORS = ['#FF6B35', '#00D4FF', '#A855F7', '#FF3B3B', '#FBBF24'];

const SIZE_CONFIGS = {
  loading: { orbSize: 80, dotSize: 10, radius: 28 },
  hero: { orbSize: 80, dotSize: 10, radius: 24 },
  chat: { orbSize: 48, dotSize: 6, radius: 14 },
};

type ActorState = 'loading' | 'hero' | 'chat';
type LoadingPhase = 'morphing' | 'escaping' | 'resisting' | 'collapse' | 'ready' | 'complete';

interface PersistentActorProps {
  state: ActorState;
  isThinking?: boolean;
  onLoadingComplete?: () => void;
  className?: string;
}

// Generate deterministic "random" paths for each dot
// Uses index-based seed so it's consistent across renders
function generateDotPaths(index: number, radius: number) {
  // Deterministic pseudo-random based on index
  const seed = (index + 1) * 1.618; // Golden ratio for nice distribution
  const rand1 = Math.sin(seed * 12.9898) * 0.5 + 0.5;
  const rand2 = Math.cos(seed * 78.233) * 0.5 + 0.5;
  const rand3 = Math.sin(seed * 43.758) * 0.5 + 0.5;
  const rand4 = Math.cos(seed * 93.989) * 0.5 + 0.5;

  // Create organic drift keyframes
  const xDir = index % 2 === 0 ? 1 : -1;
  const yDir = index % 3 === 0 ? 1 : -1;

  return {
    x: [
      0,
      xDir * rand1 * radius,
      -xDir * rand2 * radius * 0.7,
      xDir * rand3 * radius * 0.4,
      0,
    ],
    y: [
      0,
      yDir * rand2 * radius * 0.8,
      -yDir * rand1 * radius,
      yDir * rand4 * radius * 0.5,
      0,
    ],
    // Duration varies per dot (3-5s range) for organic feel
    duration: 3 + rand3 * 2,
    // Stagger start times
    delay: index * 0.4,
  };
}

export function PersistentActor({
  state,
  isThinking = false,
  onLoadingComplete,
  className = '',
}: PersistentActorProps) {
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('morphing');
  const hasCompletedRef = useRef(false);

  const config = SIZE_CONFIGS[state === 'loading' ? 'hero' : state];

  // Pre-generate paths for each dot (memoized)
  const dotPaths = useMemo(() =>
    COLORS.map((_, i) => generateDotPaths(i, config.radius)),
    [config.radius]
  );

  // Loading sequence timings
  useEffect(() => {
    if (state !== 'loading') return;

    const escapeTimer = setTimeout(() => setLoadingPhase('escaping'), 1500);
    const resistTimer = setTimeout(() => setLoadingPhase('resisting'), 2300);
    const collapseTimer = setTimeout(() => setLoadingPhase('collapse'), 3200);
    const readyTimer = setTimeout(() => setLoadingPhase('ready'), 3600);
    const completeTimer = setTimeout(() => {
      setLoadingPhase('complete');
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onLoadingComplete?.();
      }
    }, 3900);

    return () => {
      clearTimeout(escapeTimer);
      clearTimeout(resistTimer);
      clearTimeout(collapseTimer);
      clearTimeout(readyTimer);
      clearTimeout(completeTimer);
    };
  }, [state, onLoadingComplete]);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: config.orbSize + 80,
        height: config.orbSize + 80,
      }}
    >
      {/* 1. Ambient Glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(255,107,53,0.1) 40%, transparent 70%)',
        }}
        animate={{
          opacity: state === 'loading' ? (loadingPhase === 'escaping' || loadingPhase === 'resisting' ? 0.6 : 0.4) : 0,
          scale: state === 'loading' ? (loadingPhase === 'escaping' ? 2.2 : loadingPhase === 'resisting' ? 2.1 : 2) : 1.8,
        }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {/* 2. Thinking Halo */}
      <motion.div
        className="absolute inset-[-8px] rounded-full"
        style={{
          background: `conic-gradient(from 0deg, #FF3B3B, #FBBF24, #00D4FF, #A855F7, #FF6B35, #FF3B3B)`,
          filter: 'blur(16px)',
        }}
        animate={{
          rotate: 360,
          opacity: (state !== 'loading' && isThinking) ? 0.5 : 0,
          scale: (state !== 'loading' && isThinking) ? 1.05 : 0.9,
        }}
        transition={{
          rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
          opacity: { duration: 0.4 },
          scale: { duration: 0.4 }
        }}
      />

      {/* 3. Dark Glass Orb - Always present, no animation */}
      <div
        className="absolute rounded-full border border-white/10"
        style={{
          width: config.orbSize,
          height: config.orbSize,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 0 40px rgba(255,255,255,0.02), inset 0 0 20px rgba(255,255,255,0.02)',
        }}
      />

      {/* 4. The Floating Fireflies */}
      <div
        className="relative z-10"
        style={{
          width: config.orbSize,
          height: config.orbSize,
        }}
      >
        {COLORS.map((color, i) => {
          const path = dotPaths[i];
          // Speed up when thinking (shorter duration = faster)
          const speed = isThinking ? 0.4 : 1;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                backgroundColor: color,
                width: config.dotSize,
                height: config.dotSize,
                boxShadow: `0 0 12px ${color}, 0 0 20px ${color}50`,
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
              }}
              animate={{
                // Organic drift paths
                x: path.x.map(v => v + (-config.dotSize / 2)),
                y: path.y.map(v => v + (-config.dotSize / 2)),
                // Breathe in/out (3D depth)
                scale: [1, 1.2, 0.9, 1],
                // Subtle opacity pulse
                opacity: loadingPhase === 'collapse' ? 0.6 : [1, 0.85, 1],
              }}
              transition={{
                x: {
                  duration: path.duration * speed,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  delay: path.delay * speed,
                },
                y: {
                  duration: path.duration * 1.1 * speed,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  delay: path.delay * speed,
                },
                scale: {
                  duration: path.duration * 0.8 * speed,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  delay: path.delay * 0.5 * speed,
                },
                opacity: {
                  duration: 0.3,
                },
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function NeuralDots(props: { size?: string; isThinking?: boolean }) {
  return <PersistentActor state={props.size === 'medium' ? 'chat' : 'hero'} {...props} />;
}
