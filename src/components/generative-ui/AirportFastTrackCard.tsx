'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, MessageCircle, Clock, Star, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

interface AirportFastTrackCardProps {
  className?: string;
  onAction?: (prompt: string) => void;
}

const benefits = [
  'Personal greeter waiting at your gate with a sign',
  'Skip immigration queues with dedicated fast-track lanes',
  'Assistance with luggage and customs clearance',
  'Access to VIP lounge while waiting',
];

const stats = [
  { icon: Clock, value: '5 min', label: 'vs. 45 min average' },
  { icon: Star, value: '4.9', label: 'customer rating' },
  { icon: Shield, value: '100%', label: 'stress-free' },
];

export function AirportFastTrackCard({ className, onAction }: AirportFastTrackCardProps) {
  return (
    <motion.div
      className={cn(
        'relative w-full max-w-lg md:max-w-4xl rounded-card overflow-hidden',
        'bg-surface-glass backdrop-blur-xl border border-white/10',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Responsive layout: stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col md:flex-row">
        {/* Hero Image - left side on desktop */}
        <div className="relative h-48 sm:h-56 md:h-auto md:w-2/5 md:min-h-[420px] overflow-hidden">
          <CloudinaryImage
            src="https://images.unsplash.com/photo-1540339832862-474599807836?w=800&q=80"
            alt="VIP airport lounge and fast-track service"
            width={600}
            height={400}
            className="w-full h-full"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background-base via-background-base/50 to-transparent" />

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              Airport Fast Track
            </h2>
            <p className="text-sm text-text-secondary">
              VIP arrival service at Bangkok airports
            </p>
          </div>
        </div>

        {/* Content - right side on desktop */}
        <div className="md:w-3/5">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 p-5 md:p-6 border-b border-white/5">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <stat.icon size={16} className="text-accent-cyan mx-auto mb-1" />
                <div className="text-lg font-bold text-text-primary">{stat.value}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <div className="p-5 md:p-6 space-y-5">
            {/* What is this? */}
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-2">
                What is this?
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                A VIP arrival service at Bangkok&apos;s airports. A personal assistant meets you at the plane door and whisks you through immigration in minutes instead of the typical 30-60 minute queue.
              </p>
            </div>

            {/* Why would you want it? */}
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-2">
                Why would you want it?
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                After a long flight, the last thing you want is to wait in line. Start your golf trip relaxed and on schedule, especially if you have a tee time the same day.
              </p>
            </div>

            {/* Key Benefits */}
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">
                What&apos;s included
              </h3>
              <div className="space-y-2.5">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <div className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                      <Check size={10} className="text-accent-cyan" />
                    </div>
                    <span className="text-sm text-text-secondary leading-relaxed">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Clickable Action */}
            <button
              onClick={() => onAction?.('Add airport fast-track service to my trip')}
              className="w-full flex items-center gap-3 p-4 rounded-button bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group cursor-pointer"
            >
              <MessageCircle size={16} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
              <span className="text-sm text-text-secondary">
                Skip the queues?{' '}
                <span className="text-text-primary font-medium">Tap to add fast-track</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
