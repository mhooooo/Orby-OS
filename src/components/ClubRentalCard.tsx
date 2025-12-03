'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

type Gender = 'male' | 'female';
type Hand = 'right' | 'left';
type Tier = 'standard' | 'premium';

interface ClubRentalSelection {
  gender?: Gender;
  hand?: Hand;
  tier?: Tier;
}

interface ClubRentalCardProps {
  onComplete?: (selection: ClubRentalSelection) => void;
  onAction?: (prompt: string) => void;
  className?: string;
}

const whatsIncluded = [
  'Full set: Driver, woods, irons, wedges, putter',
  'Premium golf bag included',
  'Cleaned and inspected before each rental',
  'Delivered directly to the course',
];

const whyRent = [
  { title: 'Travel Light', description: 'No need to lug clubs through airports' },
  { title: 'Try Premium Equipment', description: 'Play with top-tier gear you might not own' },
  { title: 'Zero Risk', description: 'No airline damage, no lost luggage stress' },
];

const tierInfo = {
  standard: {
    name: 'Standard Set',
    description: 'Quality clubs from trusted brands. Perfect for casual rounds.',
    price: '฿1,500/day',
    brands: 'Callaway, TaylorMade, Titleist',
  },
  premium: {
    name: 'High Performance',
    description: 'Latest models with premium shafts. For the serious golfer.',
    price: '฿2,500/day',
    brands: 'Titleist T-Series, Callaway Apex, TaylorMade Qi',
  },
};

export function ClubRentalCard({ onComplete, onAction, className }: ClubRentalCardProps) {
  const [mode, setMode] = useState<'info' | 'booking'>('info');
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<ClubRentalSelection>({});

  const handleStartBooking = () => {
    setMode('booking');
    setStep(1);
  };

  const handleGenderSelect = (gender: Gender) => {
    setSelection({ ...selection, gender });
    setStep(2);
  };

  const handleHandSelect = (hand: Hand) => {
    setSelection({ ...selection, hand });
    setStep(3);
  };

  const handleTierSelect = (tier: Tier) => {
    const finalSelection = { ...selection, tier };
    setSelection(finalSelection);
    onComplete?.(finalSelection);
    // Could show confirmation or trigger chat message
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setMode('info');
    }
  };

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
      <AnimatePresence mode="wait">
        {mode === 'info' ? (
          <motion.div
            key="info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Responsive layout: stack on mobile, side-by-side on desktop */}
            <div className="flex flex-col md:flex-row">
              {/* Hero Image - left side on desktop */}
              <div className="relative h-48 sm:h-56 md:h-auto md:w-2/5 md:min-h-[400px] overflow-hidden">
                <CloudinaryImage
                  src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80"
                  alt="Premium golf club rental set"
                  width={600}
                  height={400}
                  className="w-full h-full"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background-base via-background-base/50 to-transparent" />

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h2 className="text-2xl font-bold text-text-primary mb-1">
                    Premium Club Rentals
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Play with top equipment without the travel hassle
                  </p>
                </div>
              </div>

              {/* Content - right side on desktop */}
              <div className="p-5 md:p-6 md:w-3/5 space-y-6">
              {/* What's Included */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">
                  What&apos;s included
                </h3>
                <div className="space-y-2.5">
                  {whatsIncluded.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                        <Check size={10} className="text-accent-cyan" />
                      </div>
                      <span className="text-sm text-text-secondary leading-relaxed">
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Why Rent */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">
                  Why rent?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {whyRent.map((item, index) => (
                    <motion.div
                      key={index}
                      className="p-3 rounded-lg bg-white/5 border border-white/5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <span className="text-sm font-medium text-text-primary block mb-1">
                        {item.title}
                      </span>
                      <p className="text-xs text-text-muted">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleStartBooking}
                className="w-full py-3 rounded-button bg-accent-coral hover:bg-accent-coral/90 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Configure Rental</span>
                <ChevronRight size={16} />
              </button>

              {/* Clickable Action */}
              <button
                onClick={() => onAction?.("I'd like to rent golf clubs for my trip")}
                className="w-full flex items-center gap-3 p-4 rounded-button bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group cursor-pointer"
              >
                <MessageCircle size={16} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
                <span className="text-sm text-text-secondary">
                  Need clubs?{' '}
                  <span className="text-text-primary font-medium">Tap to configure rental</span>
                </span>
              </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="booking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5"
          >
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    s <= step ? 'bg-accent-coral' : 'bg-white/10'
                  )}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Gender */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-1">
                      Club Specifications
                    </h3>
                    <p className="text-sm text-text-muted">
                      This helps us fit the right clubs for you
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(['male', 'female'] as const).map((gender) => (
                      <button
                        key={gender}
                        onClick={() => handleGenderSelect(gender)}
                        className={cn(
                          'p-4 rounded-lg border text-center transition-all',
                          selection.gender === gender
                            ? 'bg-accent-coral/20 border-accent-coral text-text-primary'
                            : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10 hover:border-white/20'
                        )}
                      >
                        <span className="block text-2xl mb-2">
                          {gender === 'male' ? '👨' : '👩'}
                        </span>
                        <span className="font-medium capitalize">{gender}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Hand */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-1">
                      Dominant Hand
                    </h3>
                    <p className="text-sm text-text-muted">
                      Which hand do you swing with?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(['right', 'left'] as const).map((hand) => (
                      <button
                        key={hand}
                        onClick={() => handleHandSelect(hand)}
                        className={cn(
                          'p-4 rounded-lg border text-center transition-all',
                          selection.hand === hand
                            ? 'bg-accent-coral/20 border-accent-coral text-text-primary'
                            : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10 hover:border-white/20'
                        )}
                      >
                        <span className="block text-2xl mb-2">
                          {hand === 'right' ? '🤚' : '✋'}
                        </span>
                        <span className="font-medium capitalize">{hand}-handed</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Tier */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-1">
                      Equipment Tier
                    </h3>
                    <p className="text-sm text-text-muted">
                      Choose your club quality
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(['standard', 'premium'] as const).map((tier) => {
                      const info = tierInfo[tier];
                      return (
                        <button
                          key={tier}
                          onClick={() => handleTierSelect(tier)}
                          className={cn(
                            'w-full p-4 rounded-lg border text-left transition-all',
                            selection.tier === tier
                              ? 'bg-accent-coral/20 border-accent-coral'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span className="block font-medium text-text-primary mb-1">
                                {info.name}
                              </span>
                              <p className="text-xs text-text-muted mb-2">
                                {info.description}
                              </p>
                              <p className="text-xs text-text-muted">
                                Brands: {info.brands}
                              </p>
                            </div>
                            <span className="text-accent-gold font-semibold ml-4">
                              {info.price}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back button */}
            <button
              onClick={handleBack}
              className="w-full mt-4 py-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              ← Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
