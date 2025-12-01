'use client';

import React, { useEffect, useState } from 'react';
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
import { ItinerarySummary } from '../ItinerarySummary';
import AuthGateModal from '../AuthGateModal';

interface ItineraryBuilderProps {
  initialRegion?: Region;
}

// Internal wizard content
function WizardContent() {
  const { state, dispatch } = useItinerary();
  const { currentStep, draft } = state;
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Render summary if we're at summary step
  if (currentStep === 'summary') {
    return (
      <>
        <ItinerarySummary
          draft={draft}
          courses={state.availableCourses}
          onProceedToBooking={() => {
            // TODO: Implement booking flow
            console.log('Proceeding to booking with draft:', draft);
          }}
          onShowAuthModal={() => setShowAuthModal(true)}
        />
        <AuthGateModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          triggerReason="save_itinerary"
        />
      </>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
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

// Wrapper to handle conditional rendering of header
function ItineraryBuilderInner() {
  const { state } = useItinerary();
  const isSummary = state.currentStep === 'summary';

  if (isSummary) {
    // Summary has its own styling, render it directly
    return <WizardContent />;
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-[#1E1F20] p-4 sm:p-6 border border-gray-800">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white">Plan Your Golf Trip</h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Let&apos;s build your perfect Thailand golf experience
        </p>
      </div>
      <WizardContent />
    </div>
  );
}

// Main exported component with provider
export function ItineraryBuilder({ initialRegion }: ItineraryBuilderProps) {
  return (
    <ItineraryProvider initialRegion={initialRegion}>
      <ItineraryBuilderInner />
    </ItineraryProvider>
  );
}
