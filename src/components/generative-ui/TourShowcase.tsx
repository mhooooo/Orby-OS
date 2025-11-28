'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';

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

  const STEP_DURATION = 5000; // 5 seconds per step

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => (prev + 1) % TOUR_STEPS.length);
    setProgress(0);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => (prev - 1 + TOUR_STEPS.length) % TOUR_STEPS.length);
    setProgress(0);
  }, []);

  // Auto-play logic
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
    <div className="w-full max-w-5xl mx-auto">
      {/* Main Card */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${step.gradient} border border-white/10 backdrop-blur-sm`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        {/* Content */}
        <div className="relative p-8 md:p-10">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm">
              <Icon size={20} className="text-white" />
            </div>
            <span className="text-sm text-gray-400">
              {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          {/* Title & Subtitle */}
          <h2 className="text-3xl md:text-4xl font-medium text-white mb-2 tracking-tight">
            {step.title}
          </h2>
          <p className="text-lg text-gray-300 mb-4">
            {step.subtitle}
          </p>
          <p className="text-gray-400 max-w-2xl mb-8">
            {step.description}
          </p>

          {/* Stats Grid */}
          {step.stats && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {step.stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-2xl font-semibold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Features Grid */}
          {step.features && (
            <div className="grid grid-cols-2 gap-3 mb-8">
              {step.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Button */}
          {step.cta && (
            <button
              onClick={() => handleCta(step.cta!.prompt)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              {step.cta.label}
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-orange-400 transition-all duration-50"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 px-2">
        {/* Step Dots */}
        <div className="flex items-center gap-2">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                setProgress(0);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-orange-400 w-6'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevStep}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isPlaying ? (
              <Pause size={18} className="text-white" />
            ) : (
              <Play size={18} className="text-white" />
            )}
          </button>
          <button
            onClick={nextStep}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
