'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Wand2, Tag, Mic } from 'lucide-react';
import { PersistentActor } from '@/components/NeuralDots';

// --- THE SYSTEM TOKENS ---
const SYSTEM = {
  colors: {
    orange: '#FF6B35',
    cyan: '#00D4FF',
    purple: '#A855F7',
    red: '#FF3B3B',
    yellow: '#FBBF24',
  },
  physics: {
    snap: { type: "spring" as const, stiffness: 120, damping: 15 },
    drift: { duration: 4, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as const }
  }
};

// --- COMPONENT: SPECTRUM PILL ---
const SpectrumPill = ({
  icon: Icon,
  label,
  colorKey
}: {
  icon: React.ElementType;
  label: string;
  colorKey: keyof typeof SYSTEM.colors;
}) => {
  const color = SYSTEM.colors[colorKey];

  return (
    <motion.button
      whileHover={{ scale: 1.02, borderColor: color }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex items-center gap-3 pl-2 pr-5 py-3 bg-[#111] border border-white/10 rounded-full transition-colors"
    >
      <div
        className="p-2 rounded-full transition-colors"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={18} color={color} strokeWidth={1.5} />
      </div>
      <span className="text-sm font-medium text-gray-300 group-hover:text-white">{label}</span>

      {/* Subtle Glow on Hover */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ boxShadow: `0 0 20px ${color}20` }}
      />
    </motion.button>
  );
};

// --- COMPONENT: COMMAND BAR ---
const CommandBar = () => (
  <div className="relative w-full max-w-2xl">
    <div className="relative z-10 flex items-center w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 focus-within:border-white/20 focus-within:bg-white/10 transition-all shadow-2xl">
      <div className="w-12 h-12 flex items-center justify-center text-gray-500">
        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
          <PlusIcon />
        </div>
      </div>
      <input
        type="text"
        placeholder="Ask me anything about golf in Thailand..."
        className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-gray-500 h-12 px-2"
      />
      <div className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-colors">
        <Mic size={20} />
      </div>
    </div>
  </div>
);

// Helper Icons
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);

// --- COMPONENT: COLOR SWATCH ---
const ColorSwatch = ({ name, hex }: { name: string; hex: string }) => (
  <div className="flex items-center gap-3">
    <div
      className="w-10 h-10 rounded-full shadow-lg"
      style={{ backgroundColor: hex, boxShadow: `0 0 20px ${hex}50` }}
    />
    <div>
      <p className="text-sm font-medium text-white">{name}</p>
      <p className="text-xs text-gray-500 font-mono">{hex}</p>
    </div>
  </div>
);

// --- COMPONENT: SECTION DIVIDER ---
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="w-full max-w-4xl space-y-6">
    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{title}</h2>
    <div className="flex flex-wrap gap-6 items-center justify-center">
      {children}
    </div>
  </div>
);

// --- PREVIEW PAGE ---
export default function DesignSystemPreview() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-8 font-sans">

      {/* Ambient Spotlight */}
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="space-y-20 relative z-10 flex flex-col items-center py-16">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Design System</h1>
          <p className="text-gray-500">The Obsidian Glass Language</p>
        </div>

        {/* 1. The Neural Orb */}
        <Section title="Neural Orb — The Living Logo">
          <div className="flex gap-12 items-end">
            <div className="flex flex-col items-center gap-4">
              <PersistentActor state="hero" />
              <span className="text-xs text-gray-500">Hero (80px)</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <PersistentActor state="chat" />
              <span className="text-xs text-gray-500">Chat (48px)</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <PersistentActor state="hero" isThinking />
              <span className="text-xs text-gray-500">Thinking</span>
            </div>
          </div>
        </Section>

        {/* 2. Color Palette */}
        <Section title="Spectrum Colors — Semantic Energy">
          <div className="grid grid-cols-5 gap-8">
            <ColorSwatch name="Orange" hex={SYSTEM.colors.orange} />
            <ColorSwatch name="Cyan" hex={SYSTEM.colors.cyan} />
            <ColorSwatch name="Purple" hex={SYSTEM.colors.purple} />
            <ColorSwatch name="Red" hex={SYSTEM.colors.red} />
            <ColorSwatch name="Yellow" hex={SYSTEM.colors.yellow} />
          </div>
        </Section>

        {/* 3. Hero Composition */}
        <Section title="Hero Composition">
          <div className="flex flex-col items-center gap-8">
            <PersistentActor state="hero" />
            <h1 className="text-6xl font-black tracking-tight text-center">Hi, there!</h1>
          </div>
        </Section>

        {/* 4. Command Bar */}
        <Section title="Command Bar — Glass Input">
          <CommandBar />
        </Section>

        {/* 5. Spectrum Pills */}
        <Section title="Spectrum Pills — Action Triggers">
          <div className="flex flex-wrap gap-4 justify-center">
            <SpectrumPill icon={Sparkles} label="First-Time Guide" colorKey="purple" />
            <SpectrumPill icon={Trophy} label="Top Rated Courses" colorKey="cyan" />
            <SpectrumPill icon={Wand2} label="Build a Trip" colorKey="orange" />
            <SpectrumPill icon={Tag} label="Get a Price" colorKey="red" />
          </div>
        </Section>

        {/* 6. Glass Cards */}
        <Section title="Glass Cards — Container Language">
          <div className="flex gap-6">
            {/* Basic Glass */}
            <div className="w-64 h-40 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 flex flex-col justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Basic Glass</span>
              <span className="text-lg font-medium">bg-white/5</span>
            </div>

            {/* Elevated Glass */}
            <div className="w-64 h-40 rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/10 shadow-2xl p-6 flex flex-col justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Elevated Glass</span>
              <span className="text-lg font-medium">+ shadow-2xl</span>
            </div>

            {/* Interactive Glass */}
            <motion.div
              whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' }}
              className="w-64 h-40 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 flex flex-col justify-between cursor-pointer transition-colors"
            >
              <span className="text-xs text-gray-500 uppercase tracking-wide">Interactive</span>
              <span className="text-lg font-medium">+ hover:scale</span>
            </motion.div>
          </div>
        </Section>

        {/* 7. Motion Principles */}
        <Section title="Motion Principles">
          <div className="flex gap-8">
            <div className="text-center space-y-4">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 mx-auto"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div>
                <p className="text-sm font-medium">Drift</p>
                <p className="text-xs text-gray-500">easeInOut, 2-4s</p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 mx-auto"
                whileHover={{ scale: 1.1 }}
                transition={SYSTEM.physics.snap}
              />
              <div>
                <p className="text-sm font-medium">Snap</p>
                <p className="text-xs text-gray-500">spring, stiff: 120</p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 mx-auto"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div>
                <p className="text-sm font-medium">Breathe</p>
                <p className="text-xs text-gray-500">scale 1→1.1→1</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm pt-12 border-t border-white/5 w-full max-w-4xl">
          <p>Golf Okay — Obsidian Glass Design System</p>
        </div>

      </div>
    </div>
  );
}
