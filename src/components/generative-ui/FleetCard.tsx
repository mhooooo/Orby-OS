'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Users, MessageCircle, Snowflake, Languages, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

interface FleetCardProps {
  className?: string;
  onAction?: (prompt: string) => void;
}

const vehicleTypes = [
  {
    name: 'VIP Van',
    capacity: '4-6 golfers',
    description: 'Spacious and comfortable with dedicated golf bag storage',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
  },
  {
    name: 'VVIP Van',
    capacity: '4-6 golfers',
    description: 'Extra legroom, premium interior, refreshments included',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80',
  },
];

const includedFeatures = [
  { icon: Briefcase, text: 'Door-to-door service from airport to hotel to courses' },
  { icon: Snowflake, text: 'Air-conditioned comfort throughout your journey' },
  { icon: Languages, text: 'English-speaking driver who knows the golf courses' },
  { icon: Users, text: 'Golf bags stored safely in dedicated compartment' },
];

export function FleetCard({ className, onAction }: FleetCardProps) {
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
        <div className="relative h-48 sm:h-56 md:h-auto md:w-2/5 md:min-h-[400px] overflow-hidden">
          <CloudinaryImage
            src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80"
            alt="Luxury private transfer van for golf trips"
            width={600}
            height={400}
            className="w-full h-full"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background-base via-background-base/50 to-transparent" />

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              Private Transfers
            </h2>
            <p className="text-sm text-text-secondary">
              Your own vehicle and driver for the entire trip
            </p>
          </div>
        </div>

        {/* Content - right side on desktop */}
        <div className="p-5 md:p-6 md:w-3/5 space-y-5">
        {/* What is this? */}
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-2">
            What is this?
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Your own private vehicle and driver for the entire trip. No shared shuttles, no waiting - just hop in and go whenever you&apos;re ready.
          </p>
        </div>

        {/* What's Included */}
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">
            What&apos;s included
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {includedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <feature.icon size={14} className="text-accent-cyan shrink-0 mt-0.5" />
                <span className="text-xs text-text-secondary leading-relaxed">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vehicle Options with Images */}
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">
            Vehicle options
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {vehicleTypes.map((vehicle, index) => (
              <motion.div
                key={index}
                className="rounded-lg overflow-hidden bg-white/5 border border-white/5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {/* Vehicle Image */}
                <div className="relative h-24 overflow-hidden">
                  <CloudinaryImage
                    src={vehicle.image}
                    alt={vehicle.name}
                    width={300}
                    height={150}
                    className="w-full h-full"
                    objectFit="cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-base/80 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-sm font-medium text-text-primary block">
                      {vehicle.name}
                    </span>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users size={12} className="text-text-muted" />
                    <span className="text-xs text-text-muted">{vehicle.capacity}</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {vehicle.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Clickable Action */}
        <button
          onClick={() => onAction?.('Tell me about transport options for my group')}
          className="w-full flex items-center gap-3 p-4 rounded-button bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group cursor-pointer"
        >
          <MessageCircle size={16} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
          <span className="text-sm text-text-secondary">
            Need transport?{' '}
            <span className="text-text-primary font-medium">Tap to discuss options</span>
          </span>
        </button>
        </div>
      </div>
    </motion.div>
  );
}
