'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, MessageCircle, MapPin, Car, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

interface AccommodationCardProps {
  className?: string;
  onAction?: (prompt: string) => void;
}

const whatsIncluded = [
  { icon: MapPin, text: 'Hand-picked hotels near your golf courses' },
  { icon: Gift, text: 'Special golf package rates exclusive to our guests' },
  { icon: Car, text: 'Shuttle service to and from courses' },
];

const propertyTypes = [
  { name: 'Resort', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', description: 'On-course luxury' },
  { name: 'Hotel', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', description: 'City convenience' },
  { name: 'Villa', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80', description: 'Private retreat' },
];

export function AccommodationCard({ className, onAction }: AccommodationCardProps) {
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
        <div className="relative h-48 sm:h-56 md:h-auto md:w-2/5 md:min-h-[380px] overflow-hidden">
          <CloudinaryImage
            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"
            alt="Luxury golf resort accommodation"
            width={600}
            height={400}
            className="w-full h-full"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background-base via-background-base/50 to-transparent" />

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={18} className="text-accent-purple" />
              <h2 className="text-2xl font-bold text-text-primary">
                Golf Resort Accommodations
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              From boutique resorts to 5-star luxury
            </p>
          </div>
        </div>

        {/* Content - right side on desktop */}
        <div className="p-5 md:p-6 md:w-3/5 space-y-5">
          {/* Description */}
          <div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Stay at hand-picked hotels near your golf courses. From boutique resorts with on-course access to 5-star luxury, we match your accommodation to your itinerary.
            </p>

            <div className="space-y-2.5">
              {whatsIncluded.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-accent-purple/10 flex items-center justify-center">
                    <item.icon size={12} className="text-accent-purple" />
                  </div>
                  <span className="text-sm text-text-secondary leading-relaxed">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Property Types Showcase */}
          <div>
            <h3 className="text-sm font-medium text-text-primary mb-3">
              Property types we offer
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {propertyTypes.map((property, index) => (
                <motion.div
                  key={index}
                  className="rounded-lg overflow-hidden bg-white/5 border border-white/5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="relative h-20 overflow-hidden">
                    <CloudinaryImage
                      src={property.image}
                      alt={property.name}
                      width={200}
                      height={120}
                      className="w-full h-full"
                      objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-base/80 to-transparent" />
                  </div>
                  <div className="p-2 text-center">
                    <span className="text-xs font-medium text-text-primary block">
                      {property.name}
                    </span>
                    <p className="text-[10px] text-text-muted">
                      {property.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Clickable Action */}
          <button
            onClick={() => onAction?.('Help me find hotels for my golf trip')}
            className="w-full flex items-center gap-3 p-4 rounded-button bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group cursor-pointer"
          >
            <MessageCircle size={16} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
            <span className="text-sm text-text-secondary">
              Need a place to stay?{' '}
              <span className="text-text-primary font-medium">Tap to explore hotels</span>
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
