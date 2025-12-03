'use client';

import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DateIntentModal, DateIntentData, DateIntentToast } from '@/components/DateIntentModal';
import { useProactiveUI } from './ProactiveUIManager';

interface ProactiveDateIntentModalProps {
  onSubmit?: (data: DateIntentData) => void;
  initialGolfers?: number;
}

/**
 * Proactive wrapper for DateIntentModal.
 * Integrates with ProactiveUIManager for orchestrated display.
 */
export function ProactiveDateIntentModal({
  onSubmit,
  initialGolfers = 4,
}: ProactiveDateIntentModalProps) {
  const { state, dismiss, hide, markDataCollected } = useProactiveUI();

  const isOpen = state.activePopup === 'DateIntentModal';

  const handleClose = () => {
    dismiss('DateIntentModal');
  };

  const handleSubmit = (data: DateIntentData) => {
    // Mark data as collected
    if (data.datePreference) {
      markDataCollected('dates', {
        start: data.specificDate || data.datePreference,
        duration: 1, // Default 1 day, could be expanded
      });
    }
    if (data.golfers) {
      markDataCollected('groupSize', data.golfers);
    }

    // Hide without dismissing (successful submission)
    hide();

    // Call external handler
    onSubmit?.(data);
  };

  return (
    <DateIntentModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      initialGolfers={initialGolfers}
    />
  );
}

/**
 * Proactive wrapper for DateIntentToast.
 * Shows automatically after DateIntentModal submission.
 */
export function ProactiveDateIntentToast() {
  const [showToast, setShowToast] = React.useState(false);
  const { state } = useProactiveUI();

  // Show toast when DateIntentModal was just hidden (not dismissed)
  useEffect(() => {
    if (
      state.activePopup === null &&
      state.shownThisSession.includes('DateIntentModal') &&
      state.knownData.dates
    ) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.activePopup, state.shownThisSession, state.knownData.dates]);

  return (
    <AnimatePresence>
      {showToast && <DateIntentToast onDismiss={() => setShowToast(false)} />}
    </AnimatePresence>
  );
}
