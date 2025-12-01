'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  ItineraryWizardState,
  ItineraryAction,
  ItineraryDraft,
  Region,
  WizardStep,
  WIZARD_STEPS,
  createInitialDraft,
  createId,
} from '@/types/itinerary';
import { Course } from '@/types/course';
import { analytics } from '@/lib/analytics';

// Initial state
const createInitialState = (initialRegion?: Region | null): ItineraryWizardState => ({
  draft: createInitialDraft(initialRegion),
  currentStep: initialRegion ? 'vibe' : 'region',
  availableCourses: [],
  isLoading: false,
  error: null,
});

// Reducer function
function itineraryReducer(
  state: ItineraryWizardState,
  action: ItineraryAction
): ItineraryWizardState {
  switch (action.type) {
    case 'SET_REGION':
      return {
        ...state,
        draft: { ...state.draft, region: action.payload },
      };

    case 'SET_VIBE':
      return {
        ...state,
        draft: { ...state.draft, vibe: action.payload },
      };

    case 'SET_DATES': {
      const { startDate, endDate, numberOfDays } = action.payload;
      // Generate days array based on numberOfDays
      const days = Array.from({ length: numberOfDays }, (_, i) => ({
        dayNumber: i + 1,
        date: startDate
          ? new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          : undefined,
        activities: [],
      }));
      return {
        ...state,
        draft: { ...state.draft, startDate, endDate, numberOfDays, days },
      };
    }

    case 'SET_GROUP_SIZE':
      return {
        ...state,
        draft: { ...state.draft, groupSize: action.payload },
      };

    case 'SET_TRANSFERS':
      return {
        ...state,
        draft: {
          ...state.draft,
          transfers: { ...state.draft.transfers, ...action.payload },
        },
      };

    case 'SET_CADDIE_TIPS':
      return {
        ...state,
        draft: { ...state.draft, includeCaddieTips: action.payload },
      };

    case 'ADD_ACTIVITY': {
      const { dayNumber, activity } = action.payload;
      const updatedDays = state.draft.days.map((day) =>
        day.dayNumber === dayNumber
          ? { ...day, activities: [...day.activities, { ...activity, id: createId() }] }
          : day
      );
      return {
        ...state,
        draft: { ...state.draft, days: updatedDays },
      };
    }

    case 'REMOVE_ACTIVITY': {
      const { dayNumber, activityId } = action.payload;
      const updatedDays = state.draft.days.map((day) =>
        day.dayNumber === dayNumber
          ? { ...day, activities: day.activities.filter((a) => a.id !== activityId) }
          : day
      );
      return {
        ...state,
        draft: { ...state.draft, days: updatedDays },
      };
    }

    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'NEXT_STEP': {
      const currentIndex = WIZARD_STEPS.indexOf(state.currentStep);
      if (currentIndex < WIZARD_STEPS.length - 1) {
        return { ...state, currentStep: WIZARD_STEPS[currentIndex + 1] };
      }
      return state;
    }

    case 'PREV_STEP': {
      const currentIndex = WIZARD_STEPS.indexOf(state.currentStep);
      if (currentIndex > 0) {
        return { ...state, currentStep: WIZARD_STEPS[currentIndex - 1] };
      }
      return state;
    }

    case 'SET_COURSES':
      return { ...state, availableCourses: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'UPDATE_TOTAL':
      return {
        ...state,
        draft: { ...state.draft, totalEstimate: action.payload },
      };

    case 'RESET':
      return createInitialState();

    case 'COMPLETE_WIZARD':
      return {
        ...state,
        draft: { ...state.draft, status: 'complete' },
        currentStep: 'summary',
      };

    default:
      return state;
  }
}

// Context types
interface ItineraryContextType {
  state: ItineraryWizardState;
  dispatch: React.Dispatch<ItineraryAction>;
  // Convenience methods
  setRegion: (region: Region) => void;
  setVibe: (vibe: ItineraryDraft['vibe']) => void;
  setDates: (startDate: string, endDate: string, numberOfDays: number) => void;
  setGroupSize: (size: number) => void;
  toggleTransfers: (enabled: boolean) => void;
  toggleCaddieTips: (enabled: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: WizardStep) => void;
  setCourses: (courses: Course[]) => void;
  completeWizard: () => void;
  reset: () => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

// Provider component
interface ItineraryProviderProps {
  children: ReactNode;
  initialRegion?: Region | null;
}

export function ItineraryProvider({ children, initialRegion }: ItineraryProviderProps) {
  const [state, dispatch] = useReducer(itineraryReducer, createInitialState(initialRegion));

  // Convenience methods
  const setRegion = (region: Region) => {
    dispatch({ type: 'SET_REGION', payload: region });
    analytics.itineraryStepCompleted(1, 'region');
  };

  const setVibe = (vibe: ItineraryDraft['vibe']) => {
    if (vibe) {
      dispatch({ type: 'SET_VIBE', payload: vibe });
      analytics.itineraryStepCompleted(2, 'vibe');
    }
  };

  const setDates = (startDate: string, endDate: string, numberOfDays: number) => {
    dispatch({ type: 'SET_DATES', payload: { startDate, endDate, numberOfDays } });
    analytics.itineraryStepCompleted(3, 'dates');
  };

  const setGroupSize = (size: number) => {
    dispatch({ type: 'SET_GROUP_SIZE', payload: size });
    analytics.itineraryStepCompleted(4, 'group_size');
  };

  const toggleTransfers = (enabled: boolean) =>
    dispatch({ type: 'SET_TRANSFERS', payload: { enabled } });

  const toggleCaddieTips = (enabled: boolean) =>
    dispatch({ type: 'SET_CADDIE_TIPS', payload: enabled });

  const nextStep = () => dispatch({ type: 'NEXT_STEP' });

  const prevStep = () => dispatch({ type: 'PREV_STEP' });

  const goToStep = (step: WizardStep) => dispatch({ type: 'SET_STEP', payload: step });

  const setCourses = (courses: Course[]) => dispatch({ type: 'SET_COURSES', payload: courses });

  const completeWizard = () => dispatch({ type: 'COMPLETE_WIZARD' });

  const reset = () => dispatch({ type: 'RESET' });

  return (
    <ItineraryContext.Provider
      value={{
        state,
        dispatch,
        setRegion,
        setVibe,
        setDates,
        setGroupSize,
        toggleTransfers,
        toggleCaddieTips,
        nextStep,
        prevStep,
        goToStep,
        setCourses,
        completeWizard,
        reset,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
}

// Custom hook for using the context
export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (context === undefined) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
}
