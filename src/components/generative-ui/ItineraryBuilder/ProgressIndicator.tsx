'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { WizardStep, WIZARD_STEPS } from '@/types/itinerary';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  steps: WizardStep[];
  currentStep: WizardStep;
}

const STEP_LABELS: Record<WizardStep, string> = {
  region: 'Region',
  vibe: 'Vibe',
  logistics: 'Logistics',
  dates: 'Dates',
  summary: 'Summary',
};

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  const currentIndex = WIZARD_STEPS.indexOf(currentStep);

  return (
    <div className="w-full mb-8">
      {/* Step indicators */}
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10" />

        {/* Active progress line */}
        <motion.div
          className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400"
          initial={{ width: 0 }}
          animate={{
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const stepIndex = WIZARD_STEPS.indexOf(step);
          const isActive = stepIndex === currentIndex;
          const isCompleted = stepIndex < currentIndex;

          return (
            <div
              key={step}
              className="relative flex flex-col items-center z-10"
            >
              {/* Circle */}
              <motion.div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                  isCompleted
                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : isActive
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110'
                      : 'bg-[#1a1a1a] border border-white/10 text-gray-500'
                )}
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  'mt-3 text-[10px] uppercase tracking-wider font-bold transition-colors duration-300',
                  isActive ? 'text-white' : 'text-gray-600'
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
