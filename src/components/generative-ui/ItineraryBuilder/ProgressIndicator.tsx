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
    <div className="w-full">
      {/* Step indicators */}
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-700" />

        {/* Active progress line */}
        <motion.div
          className="absolute top-4 left-0 h-0.5 bg-[#A4E600]"
          initial={{ width: 0 }}
          animate={{
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
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
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                  isCompleted
                    ? 'bg-[#A4E600] text-black'
                    : isActive
                    ? 'bg-[#A4E600] text-black ring-4 ring-[#A4E600]/30'
                    : 'bg-gray-700 text-gray-400'
                )}
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
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
                  'mt-2 text-xs whitespace-nowrap',
                  isActive ? 'text-white font-medium' : 'text-gray-500'
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
