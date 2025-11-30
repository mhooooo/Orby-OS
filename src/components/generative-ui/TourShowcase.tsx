'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag,
  Car,
  Trophy,
  Plane,
  Shield,
  Utensils,
  Hotel,
  Users,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  stats?: { label: string; value: string }[];
  features?: string[];
  cta?: { label: string; prompt: string };
  image?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    title: 'Welcome to Golf Okay',
    subtitle: 'Your Golf Concierge in Thailand',
    description: 'Since 1996, we\'ve been crafting unforgettable golf experiences across Thailand. Let us show you what makes us different.',
    icon: Sparkles,
    gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
    stats: [
      { label: 'Years Experience', value: '28+' },
      { label: 'Partner Courses', value: '50+' },
      { label: 'Happy Golfers', value: '10K+' },
    ],
  },
  {
    id: 'courses',
    title: 'World-Class Courses',
    subtitle: '50+ Partner Courses Across 6 Regions',
    description: 'From championship layouts to hidden gems, we\'ve curated the finest golf courses Thailand has to offer.',
    icon: Flag,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    features: [
      'Bangkok - 15 courses',
      'Pattaya - 12 courses',
      'Hua Hin - 8 courses',
      'Chiang Mai - 6 courses',
      'Phuket - 5 courses',
      'Khao Yai - 4 courses',
    ],
    cta: { label: 'Explore Courses', prompt: 'Show me the top courses in Thailand' },
  },
  {
    id: 'transport',
    title: 'Premium Fleet',
    subtitle: 'Travel in Style & Comfort',
    description: 'Our professional drivers and luxury vehicles ensure you arrive refreshed and ready to play.',
    icon: Car,
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    features: [
      'Premium sedans for solo/duo',
      'VIP vans for groups up to 8',
      'English-speaking drivers',
      'Airport pickup included',
    ],
    cta: { label: 'View Fleet', prompt: 'Show me your transport options' },
  },
  {
    id: 'clubs',
    title: 'Club Rentals',
    subtitle: 'Premium Equipment, No Baggage',
    description: 'Travel light with our premium rental sets from top brands. Delivered to your first tee.',
    icon: Trophy,
    gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    features: [
      'TaylorMade, Callaway, Titleist',
      'Men\'s & women\'s sets',
      'Left-handed available',
      'Delivered to course',
    ],
  },
  {
    id: 'airport',
    title: 'Airport Fast-Track',
    subtitle: 'Skip the Lines, Start Your Trip Right',
    description: 'VIP arrival service with personal escort through immigration and customs.',
    icon: Plane,
    gradient: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    features: [
      'Personal meet & greet',
      'Priority immigration',
      'Luggage assistance',
      'Lounge access available',
    ],
  },
  {
    id: 'insurance',
    title: 'Golf Insurance',
    subtitle: 'Play with Peace of Mind',
    description: 'Comprehensive coverage for equipment, cancellations, and even that elusive hole-in-one celebration.',
    icon: Shield,
    gradient: 'from-rose-500/20 via-red-500/10 to-transparent',
    features: [
      'Equipment coverage',
      'Trip cancellation',
      'Medical emergencies',
      'Hole-in-one celebration',
    ],
  },
  {
    id: 'dining',
    title: 'Dining & Nightlife',
    subtitle: 'The 19th Hole & Beyond',
    description: 'From authentic Thai cuisine to international favorites, we know where to eat and celebrate after your round.',
    icon: Utensils,
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    features: [
      'Restaurant reservations',
      'Rooftop bars',
      'Local hidden gems',
      'Group celebrations',
    ],
  },
  {
    id: 'hotels',
    title: 'Accommodations',
    subtitle: 'Rest Like a Champion',
    description: 'Partner hotels near every course, from boutique resorts to 5-star luxury.',
    icon: Hotel,
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    features: [
      'Golf resort packages',
      'City center hotels',
      'Budget to luxury',
      'Special golf rates',
    ],
  },
  {
    id: 'team',
    title: 'Meet the Team',
    subtitle: 'Tanyawit & Pharuehat',
    description: 'Founded by passionate golfers who know Thailand inside out. We\'re not just booking agents - we\'re your local friends.',
    icon: Users,
    gradient: 'from-orange-500/20 via-rose-500/10 to-transparent',
    stats: [
      { label: 'IAGTO Member', value: '✓' },
      { label: 'TAT Licensed', value: '✓' },
      { label: 'Rating', value: '4.9★' },
    ],
    cta: { label: 'Start Planning', prompt: 'Help me plan a golf trip' },
  },
];

export function TourShowcase() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const { sendMessage } = useChatContext();

  const STEP_DURATION = 6000; // 6 seconds per step

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => (prev + 1) % TOUR_STEPS.length);
    setProgress(0);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => (prev - 1 + TOUR_STEPS.length) % TOUR_STEPS.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStep();
          return 0;
        }
        return prev + (100 / (STEP_DURATION / 50));
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isPlaying, nextStep]);

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  const handleCta = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4">
      <motion.div
        layout
        className={cn(
          "relative overflow-hidden rounded-[2.5rem]",
          "bg-white/5 backdrop-blur-2xl border border-white/10",
          "shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
        )}
      >
        {/* Dynamic Gradient Background */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className={cn("absolute inset-0 bg-gradient-to-br opacity-50", step.gradient)}
        />

        {/* Content Container */}
        <div className="relative p-6 sm:p-8 md:p-12 flex flex-col md:flex-row gap-8 sm:gap-12 items-center">

          {/* Left Side: Visual & Icon */}
          <div className="w-full md:w-1/3 flex flex-col items-center justify-center text-center">
            <motion.div
              key={`icon-${step.id}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 sm:mb-6 shadow-2xl shadow-black/20"
            >
              <Icon size={36} className="text-white drop-shadow-lg sm:w-12 sm:h-12" />
            </motion.div>

            <div className="flex gap-2 justify-center">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentStep(idx);
                    setProgress(0);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === currentStep ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Right Side: Text & Details */}
          <div className="w-full md:w-2/3">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider text-white/80">
                    Step {currentStep + 1}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
                  {step.title}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white/80 mb-4 sm:mb-6 font-light">
                  {step.subtitle}
                </p>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 sm:mb-8 max-w-xl">
                  {step.description}
                </p>

                {/* Stats or Features */}
                {step.stats && (
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {step.stats.map((stat, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-3 sm:p-4 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {step.features && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
                    {step.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                {step.cta && (
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCta(step.cta!.prompt)}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm shadow-lg shadow-white/10 hover:bg-gray-100 transition-colors"
                  >
                    {step.cta.label}
                    <ArrowRight size={18} />
                  </motion.button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
          <motion.div
            className="h-full bg-white/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex gap-2">
          <button
            onClick={prevStep}
            className="p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-colors border border-white/5"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-colors border border-white/5"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={nextStep}
            className="p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-colors border border-white/5"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
