'use client';

import React, { useState } from 'react';
import { motion, Transition } from 'framer-motion';

// --- THE TYPES OF ANIMATION YOU CAN GENERATE ---
type PhysicsProfile = {
  name: string;
  stiffness: number;
  damping: number;
  mass: number;
  stagger: number; // Delay between dots
  scaleStrength: number; // How much it grows/shrinks
};

// --- PRESETS ---
const PRESETS: PhysicsProfile[] = [
  { name: 'Apple Smooth', stiffness: 350, damping: 28, mass: 0.8, stagger: 0.03, scaleStrength: 1.1 },
  { name: 'Nintendo Bounce', stiffness: 400, damping: 15, mass: 1, stagger: 0.08, scaleStrength: 1.3 },
  { name: 'Fluid / Underwater', stiffness: 120, damping: 20, mass: 1.5, stagger: 0.15, scaleStrength: 1.05 },
  { name: 'Sci-Fi / Mechanical', stiffness: 500, damping: 40, mass: 0.5, stagger: 0, scaleStrength: 1.0 },
  { name: 'Heavy Industrial', stiffness: 200, damping: 60, mass: 3, stagger: 0.02, scaleStrength: 1.0 },
];

export function AnimationTuner() {
  const [profile, setProfile] = useState<PhysicsProfile>(PRESETS[0]);
  const [key, setKey] = useState(0); // Used to force-restart animation

  // Randomizer Function
  const randomize = () => {
    setProfile({
      name: 'Random Gen #' + Math.floor(Math.random() * 1000),
      stiffness: Math.floor(Math.random() * (600 - 100) + 100), // 100 to 600
      damping: Math.floor(Math.random() * (60 - 10) + 10),     // 10 to 60
      mass: Number((Math.random() * (2 - 0.5) + 0.5).toFixed(1)), // 0.5 to 2
      stagger: Number((Math.random() * 0.2).toFixed(2)),
      scaleStrength: Number((Math.random() * (1.5 - 1) + 1).toFixed(2)),
    });
    setKey(k => k + 1); // Re-run animation
  };

  // Re-trigger animation
  const replay = () => setKey(k => k + 1);

  return (
    <div className="flex flex-col items-center gap-8 p-12 bg-neutral-900 min-h-screen text-white font-mono">

      {/* --- THE STAGE --- */}
      <div className="relative w-64 h-64 flex items-center justify-center bg-neutral-800/50 rounded-xl border border-white/10">
        <TestSubject profile={profile} uniqueKey={key} />
      </div>

      {/* --- CONTROLS --- */}
      <div className="flex gap-4">
        <button
          onClick={replay}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition"
        >
          Replay Animation
        </button>
        <button
          onClick={randomize}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm font-bold transition shadow-lg shadow-blue-500/20"
        >
          Randomize
        </button>
        <div className="flex gap-2">
           {PRESETS.map((p, i) => (
             <button
               key={i}
               onClick={() => { setProfile(p); setKey(k => k + 1); }}
               className="w-8 h-8 rounded-full border border-white/20 hover:border-white text-xs flex items-center justify-center"
               title={p.name}
             >
               {i + 1}
             </button>
           ))}
        </div>
      </div>

      {/* --- PRESET LABELS --- */}
      <div className="flex gap-4 text-xs text-neutral-500">
        {PRESETS.map((p, i) => (
          <span key={i} className="text-center">
            <span className="text-white/60">{i + 1}:</span> {p.name}
          </span>
        ))}
      </div>

      {/* --- OUTPUT CODE --- */}
      <div className="w-full max-w-md bg-black p-6 rounded-lg border border-white/10 relative group">
        <h3 className="text-neutral-500 text-xs uppercase mb-4 tracking-wider">Physics Configuration</h3>
        <pre className="text-sm text-green-400 overflow-x-auto whitespace-pre-wrap">
{`const PHYSICS = {
  type: 'spring',
  stiffness: ${profile.stiffness},
  damping: ${profile.damping},
  mass: ${profile.mass},
};

// Use this delay for dots: i * ${profile.stagger}
// Scale strength: ${profile.scaleStrength}`}
        </pre>
        <div className="absolute top-4 right-4 text-xs text-neutral-600">
          {profile.name}
        </div>
      </div>

      {/* --- CURRENT VALUES --- */}
      <div className="grid grid-cols-5 gap-4 text-center text-xs">
        <div>
          <div className="text-neutral-500">Stiffness</div>
          <div className="text-white font-bold">{profile.stiffness}</div>
        </div>
        <div>
          <div className="text-neutral-500">Damping</div>
          <div className="text-white font-bold">{profile.damping}</div>
        </div>
        <div>
          <div className="text-neutral-500">Mass</div>
          <div className="text-white font-bold">{profile.mass}</div>
        </div>
        <div>
          <div className="text-neutral-500">Stagger</div>
          <div className="text-white font-bold">{profile.stagger}s</div>
        </div>
        <div>
          <div className="text-neutral-500">Scale</div>
          <div className="text-white font-bold">{profile.scaleStrength}x</div>
        </div>
      </div>
    </div>
  );
}

// --- SIMPLIFIED VERSION OF YOUR COMPONENT FOR TESTING ---
function TestSubject({ profile, uniqueKey }: { profile: PhysicsProfile, uniqueKey: number }) {
  // Common Colors
  const colors = ['#FF6B35', '#00D4FF', '#A855F7', '#FF3B3B', '#FBBF24'];

  // The Transition Object
  const transition: Transition = {
    type: 'spring',
    stiffness: profile.stiffness,
    damping: profile.damping,
    mass: profile.mass,
  };

  return (
    <motion.div
      key={uniqueKey} // Forces React to destroy and recreate component to restart animation
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={transition}
      className="relative w-32 h-32 flex items-center justify-center"
    >
      {/* Orb Skin */}
      <motion.div
        className="absolute inset-0 rounded-full border border-white/20 bg-white/5 backdrop-blur-md"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transition}
      />

      {/* Dots */}
      {colors.map((color, i) => {
        const angle = (i * 72 - 90) * (Math.PI / 180);
        const radius = 40;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}`
            }}
            initial={{ x: 0, y: 0, scale: 0 }}
            animate={{ x, y, scale: profile.scaleStrength }}
            transition={{
              ...transition,
              delay: i * profile.stagger // Apply the stagger
            }}
          />
        );
      })}
    </motion.div>
  );
}
