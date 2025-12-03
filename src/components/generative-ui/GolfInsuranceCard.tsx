'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, MessageCircle, Heart, Briefcase, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

interface GolfInsuranceCardProps {
  className?: string;
  onAction?: (prompt: string) => void;
}

const coverageAreas = [
  {
    icon: Heart,
    title: 'Medical emergencies',
    description: 'Hospital care, doctor visits, and emergency evacuation',
  },
  {
    icon: Briefcase,
    title: 'Equipment protection',
    description: 'Coverage for lost, stolen, or damaged golf clubs',
  },
  {
    icon: Plane,
    title: 'Trip protection',
    description: 'Cancellations, delays, and interruptions reimbursed',
  },
];

export function GolfInsuranceCard({ className, onAction }: GolfInsuranceCardProps) {
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
            src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80"
            alt="Golf trip insurance - peace of mind"
            width={600}
            height={400}
            className="w-full h-full"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background-base via-background-base/50 to-transparent" />

          {/* Shield badge */}
          <div className="absolute top-4 right-4 md:left-4 md:right-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/20 backdrop-blur-md border border-accent-gold/30">
              <Shield size={14} className="text-accent-gold" />
              <span className="text-xs font-medium text-accent-gold">Protected</span>
            </div>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              Golf Trip Insurance
            </h2>
            <p className="text-sm text-text-secondary">
              Coverage designed specifically for golfers
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
              Travel insurance designed specifically for golfers. Covers the unique risks of a golf vacation that standard travel insurance often misses.
            </p>
          </div>

          {/* Why would you want it? */}
          <div>
            <h3 className="text-sm font-medium text-text-primary mb-2">
              Why would you want it?
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Your golf clubs alone can be worth thousands. Add in the cost of green fees, flights, and hotels - peace of mind is worth the small premium.
            </p>
          </div>

          {/* Coverage Areas with icons */}
          <div>
            <h3 className="text-sm font-medium text-text-primary mb-3">
              What&apos;s covered
            </h3>
            <div className="space-y-3">
              {coverageAreas.map((area, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="shrink-0 p-2 rounded-lg bg-accent-gold/10">
                    <area.icon size={16} className="text-accent-gold" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-primary block">
                      {area.title}
                    </span>
                    <p className="text-xs text-text-muted mt-0.5">
                      {area.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Additional note */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Check size={12} className="text-accent-cyan" />
            <span>All plans include 24/7 emergency assistance and English-speaking support.</span>
          </div>

          {/* Clickable Action */}
          <button
            onClick={() => onAction?.('Add golf trip insurance to my itinerary')}
            className="w-full flex items-center gap-3 p-4 rounded-button bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group cursor-pointer"
          >
            <MessageCircle size={16} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
            <span className="text-sm text-text-secondary">
              Want coverage?{' '}
              <span className="text-text-primary font-medium">Tap to add insurance</span>
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
