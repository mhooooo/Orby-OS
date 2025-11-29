'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useItinerary } from '@/context/ItineraryContext';
import { WIZARD_STEPS } from '@/types/itinerary';
import { cn } from '@/lib/utils';

export function WizardNavigation() {
  const { state, prevStep, nextStep, completeWizard } = useItinerary();
  const { currentStep, draft } = state;

  const currentIndex = WIZARD_STEPS.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  // Last step before summary
  const isLastStep = currentIndex === WIZARD_STEPS.length - 2;

  // Validation for each step
  const canProceed = () => {
    switch (currentStep) {
      case 'region':
        return !!draft.region;
      case 'vibe':
        return !!draft.vibe;
      case 'logistics':
        return true; // Always valid
      case 'dates':
        return !!draft.startDate && draft.groupSize > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      completeWizard();
    } else {
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mt-12 pt-8 border-t border-white/10"
    >
      {/* Back Button */}
      <button
        onClick={prevStep}
        disabled={isFirstStep}
        className={cn(
          'flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300',
          isFirstStep
            ? 'text-gray-600 cursor-not-allowed'
            : 'text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
        )}
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-bold">Back</span>
      </button>

      {/* Skip Button - only shown on optional steps */}
      {currentStep === 'logistics' && (
        <button
          onClick={nextStep}
          className="text-sm text-gray-500 hover:text-white transition-colors font-medium"
        >
          Skip this step
        </button>
      )}

      {/* Next/Complete Button */}
      <button
        onClick={handleNext}
        disabled={!canProceed()}
        className={cn(
          'flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg',
          canProceed()
            ? 'bg-white text-black hover:bg-gray-100 hover:scale-105 hover:shadow-white/20'
            : 'bg-white/5 text-gray-500 cursor-not-allowed'
        )}
      >
        <span className="text-sm">
          {isLastStep ? 'Build Itinerary' : 'Continue'}
        </span>
        {isLastStep ? (
          <Check size={20} />
        ) : (
          <ChevronRight size={20} />
        )}
      </button>
    </motion.div>
  );
}
