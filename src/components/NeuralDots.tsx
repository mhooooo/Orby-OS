'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// Brand accent colors matching GolfOkayIcon
const ACCENT_COLORS = {
  orange: '#FF6B35',
  bluesky: '#00D4FF',
  red: '#FF3B3B',
  purpp: '#A855F7',
  yelloww: '#FBBF24',
};

// Pentagon formation - 5 dots evenly spaced at 72° intervals
// Starting from top (-90°) and going clockwise
const dots = [
  { color: ACCENT_COLORS.orange, angle: -90 },    // Top
  { color: ACCENT_COLORS.bluesky, angle: -18 },   // Top-right
  { color: ACCENT_COLORS.purpp, angle: 54 },      // Bottom-right
  { color: ACCENT_COLORS.red, angle: 126 },       // Bottom-left
  { color: ACCENT_COLORS.yelloww, angle: 198 },   // Top-left
];

// Dot configurations for different sizes
// Tighter radius values for cohesive logo appearance
const DOT_CONFIGS = {
  small: { containerSize: 32, radius: 6, dotSize: 4 },
  medium: { containerSize: 48, radius: 10, dotSize: 6 },
  large: { containerSize: 80, radius: 16, dotSize: 10 },
  hero: { containerSize: 120, radius: 16, dotSize: 14 }, // Tight pentagon formation
};

// Loading state uses a wider radius for the "chaos" breathing effect
const LOADING_RADIUS_MULTIPLIER = 1.4; // 24 * 1.4 = ~34px spread during loading

type ActorState = 'loading' | 'hero' | 'chat';
type LoadingPhase = 'gathering' | 'spinning' | 'settling' | 'complete';

interface PersistentActorProps {
  state: ActorState;
  isThinking?: boolean;
  onLoadingComplete?: () => void;
  className?: string;
}

/**
 * The Persistent Actor - Never unmounts, just changes position and animation state.
 * This is the key to smooth continuity between loading and hero states.
 */
export function PersistentActor({
  state,
  isThinking = false,
  onLoadingComplete,
  className = '',
}: PersistentActorProps) {
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('gathering');
  const [rotation, setRotation] = useState(0);
  const hasCompletedRef = React.useRef(false);

  // Get size config based on state
  const size = state === 'chat' ? 'medium' : 'hero';
  const config = DOT_CONFIGS[size];
  const center = config.containerSize / 2;

  // Use wider radius during loading for "chaos" effect, tight radius for "order/golf ball"
  const baseRadius = state === 'loading'
    ? config.radius * LOADING_RADIUS_MULTIPLIER
    : config.radius;

  // Loading phase progression
  useEffect(() => {
    if (state !== 'loading') return;

    const spinTimer = setTimeout(() => setLoadingPhase('spinning'), 1200);
    const settleTimer = setTimeout(() => setLoadingPhase('settling'), 2500);
    const completeTimer = setTimeout(() => {
      setLoadingPhase('complete');
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onLoadingComplete?.();
      }
    }, 3200);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(settleTimer);
      clearTimeout(completeTimer);
    };
  }, [state, onLoadingComplete]);

  // Organic rotation during spinning
  useEffect(() => {
    if (state === 'loading' && loadingPhase === 'spinning') {
      const interval = setInterval(() => {
        setRotation(prev => prev + 8);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [state, loadingPhase]);

  // Determine if we're in an active spinning state
  const isSpinning = state === 'loading' && loadingPhase === 'spinning';
  const isSettling = state === 'loading' && loadingPhase === 'settling';
  const isGathering = state === 'loading' && loadingPhase === 'gathering';

  // SNAP TO STATIC: Hero mode = completely still, no animation
  // Only animate when loading OR when actively thinking in chat
  const isStatic = state === 'hero' || (state === 'chat' && !isThinking);

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      animate={{
        width: config.containerSize,
        height: config.containerSize,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      {/* Ambient glow during loading */}
      {state === 'loading' && (
        <motion.div
          className="absolute w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: isSpinning ? [1, 1.2, 1] : 1,
            opacity: isSpinning ? [0.3, 0.6, 0.3] : 0.3,
          }}
          transition={{
            duration: 1.5,
            repeat: isSpinning ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Thinking halo for hero/chat states */}
      {state !== 'loading' && isThinking && (
        <motion.div
          className="absolute inset-[-8px] rounded-full"
          style={{
            background: `conic-gradient(
              from 0deg,
              ${ACCENT_COLORS.red},
              ${ACCENT_COLORS.yelloww},
              ${ACCENT_COLORS.bluesky},
              ${ACCENT_COLORS.purpp},
              ${ACCENT_COLORS.orange},
              ${ACCENT_COLORS.red}
            )`,
            filter: 'blur(12px)',
            opacity: 0.6,
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.08, 1],
          }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: [0.68, -0.15, 0.27, 1.15] },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      )}

      {/* DARK GLASS ORB - Glassmorphism container for the dots */}
      <motion.div
        layoutId="orb-skin"
        className="absolute rounded-full border border-white/10 z-0"
        style={{
          // Glass effect
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          // Size - slightly larger than dot cluster
          width: state === 'chat' ? 48 : 80,
          height: state === 'chat' ? 48 : 80,
          // Subtle glow for depth
          boxShadow: '0 0 30px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.02)',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: state === 'loading' ? 0 : 1,
          opacity: state === 'loading' ? 0 : 1,
        }}
        transition={{
          duration: 0.5,
          delay: state === 'loading' ? 0 : 0.15,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      />

      {/* The rotating container (only rotates during loading spin phase) */}
      <motion.div
        className="relative"
        style={{ width: config.containerSize, height: config.containerSize }}
        animate={{
          rotate: isSpinning ? rotation : 0,
          scale: isSettling ? [1, 1.15, 1] : 1,
        }}
        transition={{
          rotate: { duration: 0.05, ease: 'linear' },
          scale: { duration: 0.6, ease: [0.68, -0.55, 0.27, 1.55] },
        }}
      >
        {dots.map((dot, i) => {
          const angleRad = (dot.angle * Math.PI) / 180;

          // Tight "golf ball" position (order)
          const tightRadius = config.radius;
          const tightX = center + tightRadius * Math.cos(angleRad) - config.dotSize / 2;
          const tightY = center + tightRadius * Math.sin(angleRad) - config.dotSize / 2;

          // Wide position for loading (chaos)
          const wideRadius = config.radius * LOADING_RADIUS_MULTIPLIER;
          const wideX = center + wideRadius * Math.cos(angleRad) - config.dotSize / 2;
          const wideY = center + wideRadius * Math.sin(angleRad) - config.dotSize / 2;

          // Breathing expansion during spinning (even wider)
          const breathingRadius = wideRadius * 1.15;
          const breathingX = center + breathingRadius * Math.cos(angleRad) - config.dotSize / 2;
          const breathingY = center + breathingRadius * Math.sin(angleRad) - config.dotSize / 2;

          // Starting positions for gathering phase (scattered far outside)
          const startAngle = (dot.angle + 180) * Math.PI / 180;
          const startRadius = 150;
          const startX = center + startRadius * Math.cos(startAngle) - config.dotSize / 2;
          const startY = center + startRadius * Math.sin(startAngle) - config.dotSize / 2;

          // Determine target position based on state
          // Loading: wide/breathing, Hero/Chat: tight "golf ball"
          let targetX: number;
          let targetY: number;
          if (isSpinning) {
            targetX = breathingX;
            targetY = breathingY;
          } else if (isGathering || isSettling) {
            targetX = wideX;
            targetY = wideY;
          } else {
            // Hero or Chat state - TIGHT golf ball formation
            targetX = tightX;
            targetY = tightY;
          }

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: config.dotSize,
                height: config.dotSize,
                backgroundColor: dot.color,
                // Neon glow effect - dots are the stars
                boxShadow: `0 0 15px ${dot.color}, 0 0 25px ${dot.color}60`,
              }}
              initial={
                state === 'loading'
                  ? { x: startX, y: startY, scale: 0, opacity: 0 }
                  : false
              }
              animate={{
                x: targetX,
                y: targetY,
                // SNAP TO STATIC: No breathing in hero mode - solid, confident, ready
                scale: isStatic
                  ? 1.15 // Slightly larger, bold, FIXED - no animation
                  : isSettling
                  ? [1, 1.2, 1]
                  : isThinking
                  ? [1, 1.3, 1]
                  : [1, 1.1, 1],
                opacity: 1,
                boxShadow: isSpinning
                  ? `0 0 40px ${dot.color}, 0 0 60px ${dot.color}80`
                  : `0 0 15px ${dot.color}, 0 0 25px ${dot.color}60`,
              }}
              transition={{
                x: {
                  duration: isGathering ? 1 : state !== 'loading' ? 0.5 : 0.4,
                  delay: isGathering ? i * 0.08 : 0,
                  // Snap with spring for hero arrival
                  ease: isGathering
                    ? [0.34, 1.56, 0.64, 1]
                    : state !== 'loading'
                    ? [0.68, -0.55, 0.27, 1.55]
                    : 'easeOut',
                },
                y: {
                  duration: isGathering ? 1 : state !== 'loading' ? 0.5 : 0.4,
                  delay: isGathering ? i * 0.08 : 0,
                  ease: isGathering
                    ? [0.34, 1.56, 0.64, 1]
                    : state !== 'loading'
                    ? [0.68, -0.55, 0.27, 1.55]
                    : 'easeOut',
                },
                scale: isStatic
                  ? { duration: 0.4, type: 'spring', stiffness: 300, damping: 20 } // Quick snap, then STOP
                  : { duration: isThinking ? 1 : 2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' },
                opacity: {
                  duration: 0.4,
                  delay: isGathering ? i * 0.08 : 0,
                },
                boxShadow: { duration: 0.5 },
              }}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
}

// Legacy exports for backwards compatibility
export function NeuralDots({
  size = 'medium',
  isThinking = false,
  className = '',
}: {
  size?: 'small' | 'medium' | 'large' | 'hero';
  isThinking?: boolean;
  className?: string;
}) {
  const config = DOT_CONFIGS[size];
  const center = config.containerSize / 2;

  // Dark glass orb size scales with dot cluster
  const orbSize = size === 'hero' ? 80 : size === 'large' ? 56 : size === 'medium' ? 48 : 32;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: config.containerSize, height: config.containerSize }}
    >
      {isThinking && (
        <motion.div
          className="absolute inset-[-8px] rounded-full"
          style={{
            background: `conic-gradient(
              from 0deg,
              ${ACCENT_COLORS.red},
              ${ACCENT_COLORS.yelloww},
              ${ACCENT_COLORS.bluesky},
              ${ACCENT_COLORS.purpp},
              ${ACCENT_COLORS.orange},
              ${ACCENT_COLORS.red}
            )`,
            filter: 'blur(12px)',
            opacity: 0.6,
          }}
          animate={{ rotate: 360, scale: [1, 1.08, 1] }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: [0.68, -0.15, 0.27, 1.15] },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      )}

      {/* DARK GLASS ORB */}
      <div
        className="absolute rounded-full border border-white/10"
        style={{
          width: orbSize,
          height: orbSize,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 0 30px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.02)',
        }}
      />

      {/* The dots - neon glowing stars */}
      <div
        className="absolute"
        style={{ width: config.containerSize, height: config.containerSize }}
      >
        {dots.map((dot, i) => {
          const angleRad = (dot.angle * Math.PI) / 180;
          const x = center + config.radius * Math.cos(angleRad) - config.dotSize / 2;
          const y = center + config.radius * Math.sin(angleRad) - config.dotSize / 2;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: config.dotSize,
                height: config.dotSize,
                backgroundColor: dot.color,
                left: x,
                top: y,
                boxShadow: `0 0 15px ${dot.color}, 0 0 25px ${dot.color}60`,
              }}
              // SNAP TO STATIC: Only animate when thinking, otherwise solid
              animate={
                isThinking
                  ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }
                  : { scale: 1.15, opacity: 1 } // Static, bold, confident
              }
              transition={
                isThinking
                  ? { duration: 1, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }
                  : { duration: 0.3, type: 'spring', stiffness: 300 } // Snap then stop
              }
            />
          );
        })}
      </div>
    </div>
  );
}

// Keep loader export for compatibility but mark as deprecated
export function NeuralDotsLoader({ onComplete }: { onComplete?: () => void }) {
  return <PersistentActor state="loading" onLoadingComplete={onComplete} />;
}
