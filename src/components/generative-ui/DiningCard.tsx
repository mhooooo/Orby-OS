'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, MessageCircle, MapPin, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

interface DiningCardProps {
  className?: string;
  onAction?: (prompt: string) => void;
}

const whatWeOffer = [
  { icon: MapPin, text: 'Post-golf dinner reservations near every course' },
  { icon: Users, text: 'Group bookings for any size party' },
  { icon: Clock, text: 'Local recommendations from our concierge' },
];

const cuisineTypes = [
  { name: 'Thai', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80', description: 'Authentic local flavors' },
  { name: 'Seafood', image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&q=80', description: 'Fresh catch from the Gulf' },
  { name: 'International', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', description: 'Global cuisine options' },
];

export function DiningCard({ className, onAction }: DiningCardProps) {
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
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
            alt="Upscale Thai restaurant dining experience"
            width={600}
            height={400}
            className="w-full h-full"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background-base via-background-base/50 to-transparent" />

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-2">
              <UtensilsCrossed size={18} className="text-accent-gold" />
              <h2 className="text-2xl font-bold text-text-primary">
                Dining & Nightlife
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              From authentic Thai to international cuisine
            </p>
          </div>
        </div>

        {/* Content - right side on desktop */}
        <div className="p-5 md:p-6 md:w-3/5 space-y-5">
          {/* What we offer */}
          <div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              We partner with top restaurants near every golf destination. From authentic Thai street food to 5-star fine dining, we&apos;ll find the perfect spot for your post-round meal.
            </p>

            <div className="space-y-2.5">
              {whatWeOffer.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-accent-gold/10 flex items-center justify-center">
                    <item.icon size={12} className="text-accent-gold" />
                  </div>
                  <span className="text-sm text-text-secondary leading-relaxed">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Cuisine Showcase */}
          <div>
            <h3 className="text-sm font-medium text-text-primary mb-3">
              Cuisine styles we recommend
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {cuisineTypes.map((cuisine, index) => (
                <motion.div
                  key={index}
                  className="rounded-lg overflow-hidden bg-white/5 border border-white/5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="relative h-20 overflow-hidden">
                    <CloudinaryImage
                      src={cuisine.image}
                      alt={cuisine.name}
                      width={200}
                      height={120}
                      className="w-full h-full"
                      objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-base/80 to-transparent" />
                  </div>
                  <div className="p-2 text-center">
                    <span className="text-xs font-medium text-text-primary block">
                      {cuisine.name}
                    </span>
                    <p className="text-[10px] text-text-muted">
                      {cuisine.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Clickable Action */}
          <button
            onClick={() => onAction?.('Recommend restaurants near my golf courses')}
            className="w-full flex items-center gap-3 p-4 rounded-button bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group cursor-pointer"
          >
            <MessageCircle size={16} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
            <span className="text-sm text-text-secondary">
              Hungry after golf?{' '}
              <span className="text-text-primary font-medium">Tap for recommendations</span>
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
