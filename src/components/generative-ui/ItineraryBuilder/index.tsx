'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ItineraryProvider, useItinerary } from '@/context/ItineraryContext';
import { Region, WIZARD_STEPS, WizardStep } from '@/types/itinerary';
import { RegionStep } from './RegionStep';
import { VibeStep } from './VibeStep';
import { LogisticsStep } from './LogisticsStep';
import { DateGroupStep } from './DateGroupStep';
import { ProgressIndicator } from './ProgressIndicator';
import { WizardNavigation } from './WizardNavigation';
import { PriceCounter } from './PriceCounter';

interface ItineraryBuilderProps {
  initialRegion?: Region;
}

// Internal wizard content
function WizardContent() {
  const { state, dispatch } = useItinerary();
  const { currentStep, draft } = state;

  // Skip region step if already selected
  useEffect(() => {
    if (draft.region && currentStep === 'region') {
      dispatch({ type: 'SET_STEP', payload: 'vibe' });
    }
  }, [draft.region, currentStep, dispatch]);

  const renderStep = (step: WizardStep) => {
    switch (step) {
      case 'region':
        return <RegionStep />;
      case 'vibe':
        return <VibeStep />;
      case 'logistics':
        return <LogisticsStep />;
      case 'dates':
        return <DateGroupStep />;
      case 'summary':
        return null; // Summary is rendered separately
      default:
        return null;
    }
  };

  // Don't render wizard if we're at summary
  if (currentStep === 'summary') {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <ProgressIndicator
        steps={WIZARD_STEPS.slice(0, -1)} // Exclude summary from progress
        currentStep={currentStep}
      />

      {/* Rolling Price Counter */}
      <PriceCounter />

      {/* Step Content */}
      <div className="mt-6 min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep(currentStep)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <WizardNavigation />
    </div>
  );
}

// Main exported component with provider
export function ItineraryBuilder({ initialRegion }: ItineraryBuilderProps) {
  return (
    <div className="rounded-3xl bg-[#1E1F20] p-6 border border-gray-800">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Plan Your Golf Trip</h2>
        <p className="text-sm text-gray-400 mt-1">
          Let&apos;s build your perfect Thailand golf experience
        </p>
      </div>
      <ItineraryProvider initialRegion={initialRegion}>
        <WizardContent />
      </ItineraryProvider>
    </div>
  );
}
