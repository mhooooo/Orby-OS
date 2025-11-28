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
      className="flex items-center justify-between mt-8 pt-4 border-t border-gray-700"
    >
      {/* Back Button */}
      <button
        onClick={prevStep}
        disabled={isFirstStep}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors',
          isFirstStep
            ? 'text-gray-600 cursor-not-allowed'
            : 'text-gray-400 hover:text-white hover:bg-[#282A2C]'
        )}
      >
        <ChevronLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Skip Button - only shown on optional steps */}
      {currentStep === 'logistics' && (
        <button
          onClick={nextStep}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Skip this step
        </button>
      )}

      {/* Next/Complete Button */}
      <button
        onClick={handleNext}
        disabled={!canProceed()}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all',
          canProceed()
            ? 'bg-[#FF6B35] text-black hover:bg-[#E85A2A]'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        )}
      >
        <span className="text-sm">
          {isLastStep ? 'Build Itinerary' : 'Continue'}
        </span>
        {isLastStep ? (
          <Check size={18} />
        ) : (
          <ChevronRight size={18} />
        )}
      </button>
    </motion.div>
  );
}
