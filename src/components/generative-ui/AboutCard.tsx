'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Team member data structure
interface TeamMember {
  id: string;
  name: string;
  role: string;
  expertise: string;
  avatar: string;
  portrait: string;
}

interface AboutData {
  company: string;
  tagline: string;
  founded: number;
  yearsExperience: number;
  founders: { name: string; role: string; expertise: string; image?: string }[];
  certifications: string[];
  stats: {
    coursesPartner: number;
    happyGolfers: number;
    averageRating: number;
  };
  description: string;
}

interface AboutCardProps {
  data: AboutData;
  team?: TeamMember[];
  className?: string;
}

// Default team data (will be replaced with real data later)
const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'tanyawit',
    name: 'Tanyawit',
    role: 'CEO',
    expertise: 'Golf Tourism',
    avatar: 'https://placehold.co/100x100/1E1F20/ffffff?text=TW',
    portrait: 'https://placehold.co/400x500/1E1F20/ffffff?text=Portrait',
  },
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'Operations Lead',
    expertise: 'Hospitality',
    avatar: 'https://placehold.co/100x100/1E1F20/ffffff?text=SC',
    portrait: 'https://placehold.co/400x500/1E1F20/ffffff?text=Portrait',
  },
  {
    id: 'james',
    name: 'James',
    role: 'Course Relations',
    expertise: 'Partnerships',
    avatar: 'https://placehold.co/100x100/1E1F20/ffffff?text=JW',
    portrait: 'https://placehold.co/400x500/1E1F20/ffffff?text=Portrait',
  },
  {
    id: 'mei',
    name: 'Mei',
    role: 'Customer Experience',
    expertise: 'Support',
    avatar: 'https://placehold.co/100x100/1E1F20/ffffff?text=ML',
    portrait: 'https://placehold.co/400x500/1E1F20/ffffff?text=Portrait',
  },
];

export function AboutCard({ data, team = DEFAULT_TEAM, className }: AboutCardProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember>(team[0]);

  return (
    <motion.div
      className={cn(
        'relative w-full rounded-card overflow-hidden',
        'bg-background-base border border-white/5',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Main Content Area */}
      <div className="relative">
        {/* Top Section: Company Info + Featured Portrait */}
        <div className="flex flex-col md:flex-row">
          {/* Left Side (60%) - Company Info */}
          <div className="flex-1 md:w-[60%] p-8 sm:p-12 lg:p-16">
            {/* Company Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary tracking-tighter mb-3"
            >
              {data.company}
            </motion.h1>

            {/* Tagline with accent bar */}
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                className="w-12 h-1 bg-accent-coral rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              />
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl text-text-muted font-light"
              >
                {data.tagline}
              </motion.p>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-text-secondary text-base leading-relaxed mb-8 max-w-lg"
            >
              {data.description}
            </motion.p>

            {/* Inline Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-3 text-sm"
            >
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="font-bold text-accent-coral">{data.yearsExperience}+</span>
                <span>years</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="font-bold text-accent-cyan">{data.stats.coursesPartner}+</span>
                <span>courses</span>
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="font-bold text-accent-gold">{data.stats.averageRating}</span>
                <span>rating</span>
              </span>
            </motion.div>
          </div>

          {/* Right Side (40%) - Featured Portrait */}
          <div className="relative md:w-[40%] h-64 md:h-auto md:min-h-[400px] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-background-base via-transparent to-transparent z-10" />

            {/* Portrait with crossfade */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMember.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <img
                  src={selectedMember.portrait}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover object-top"
                />
              </motion.div>
            </AnimatePresence>

            {/* Name/Role overlay on portrait */}
            <motion.div
              key={`info-${selectedMember.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute bottom-4 right-4 z-20 text-right"
            >
              <p className="text-lg font-bold text-white drop-shadow-lg">
                {selectedMember.name}
              </p>
              <p className="text-sm text-accent-coral font-medium drop-shadow-lg">
                {selectedMember.role}
              </p>
            </motion.div>

            {/* Subtle shadow underneath portrait */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent z-10" />
          </div>
        </div>

        {/* Team Avatars Section */}
        <div className="bg-surface-glass border-t border-white/5 p-6 sm:p-8">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-5">
            Meet the Team
          </h3>

          <div className="flex flex-wrap gap-6">
            {team.map((member, idx) => {
              const isSelected = selectedMember.id === member.id;

              return (
                <motion.button
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  onClick={() => setSelectedMember(member)}
                  className="flex flex-col items-center gap-2 group"
                >
                  {/* Avatar with ring */}
                  <div
                    className={cn(
                      'relative w-12 h-12 rounded-full overflow-hidden transition-all duration-300',
                      isSelected
                        ? 'ring-2 ring-accent-coral ring-offset-2 ring-offset-background-base'
                        : 'ring-2 ring-transparent group-hover:ring-white/30 group-hover:ring-offset-2 group-hover:ring-offset-background-base'
                    )}
                  >
                    {/* Gradient background for loading/fallback */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-coral via-accent-purple to-accent-cyan" />

                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="relative w-full h-full object-cover"
                    />

                    {/* Selection indicator glow */}
                    {isSelected && (
                      <motion.div
                        layoutId="avatar-glow"
                        className="absolute inset-0 bg-accent-coral/20"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>

                  {/* Name */}
                  <span
                    className={cn(
                      'text-xs font-medium transition-colors',
                      isSelected ? 'text-text-primary' : 'text-text-muted group-hover:text-text-secondary'
                    )}
                  >
                    {member.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom section - Certifications & CTA */}
      <div className="p-6 sm:p-8 border-t border-white/5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Certifications */}
          <div className="flex flex-wrap gap-2">
            {data.certifications.map((cert, idx) => (
              <motion.span
                key={cert}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-text-muted hover:bg-white/10 transition-colors cursor-default"
              >
                <Shield size={12} className="text-accent-gold" />
                {cert}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-text-muted"
            >
              <CheckCircle2 size={12} className="text-accent-cyan" />
              {data.stats.happyGolfers.toLocaleString()}+ Happy Golfers
            </motion.span>
          </div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-3 px-6 py-3 rounded-button bg-white text-background-base font-bold text-sm hover:bg-gray-100 transition-all shadow-lg shadow-white/10"
          >
            Start Your Journey
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>

      {/* Accent corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-accent-coral/20 to-transparent rounded-full blur-2xl" />
      </div>
    </motion.div>
  );
}
