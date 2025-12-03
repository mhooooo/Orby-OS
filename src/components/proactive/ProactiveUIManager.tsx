'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useState,
  ReactNode,
} from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ProactiveComponentType =
  | 'DateIntentModal'
  | 'GroupSizeNudge'
  | 'TripBuilderPrompt'
  | 'AvailabilityBadge'
  | 'GroupDiscountToast';

// Priority: lower number = higher priority
export const PRIORITY: Record<ProactiveComponentType, number> = {
  DateIntentModal: 1,
  GroupSizeNudge: 2,
  TripBuilderPrompt: 3,
  AvailabilityBadge: 10, // Inline, no approval needed
  GroupDiscountToast: 5,
};

export interface KnownUserData {
  dates?: {
    start: string;
    duration: number;
  };
  groupSize?: number;
  regions?: string[];
  budget?: 'value' | 'mid' | 'premium';
}

export interface ProactiveUIState {
  // Track what's been shown this session
  shownThisSession: ProactiveComponentType[];
  // Timestamp of last shown proactive UI (for global cooldown)
  lastShownAt: number | null;
  // Dismissed types with their dismiss timestamp (for type-specific cooldown)
  dismissedTypes: Partial<Record<ProactiveComponentType, number>>;
  // Data we've already collected (don't ask again)
  knownData: KnownUserData;
  // Current popup showing (only one at a time)
  activePopup: ProactiveComponentType | null;
  // Track courses viewed for trigger conditions
  coursesViewed: string[];
  // User idle tracking
  lastInteractionAt: number;
  // Is user currently typing/inputting
  isUserActive: boolean;
}

type ProactiveUIAction =
  | { type: 'REQUEST_SHOW'; payload: { componentType: ProactiveComponentType } }
  | { type: 'SHOW'; payload: ProactiveComponentType }
  | { type: 'HIDE' }
  | { type: 'DISMISS'; payload: ProactiveComponentType }
  | { type: 'SET_KNOWN_DATA'; payload: Partial<KnownUserData> }
  | { type: 'TRACK_COURSE_VIEW'; payload: string }
  | { type: 'SET_USER_ACTIVE'; payload: boolean }
  | { type: 'UPDATE_INTERACTION' }
  | { type: 'RESET' };

// ============================================================================
// CONSTANTS
// ============================================================================

const GLOBAL_COOLDOWN = 2 * 60 * 1000; // 2 minutes between any proactive UI
const DISMISS_COOLDOWN = 10 * 60 * 1000; // 10 minutes after dismiss
const MAX_POPUPS_PER_SESSION = 1; // Only 1 popup per session

const SESSION_STORAGE_KEY = 'proactive-ui-state';

// ============================================================================
// INITIAL STATE
// ============================================================================

const createInitialState = (): ProactiveUIState => ({
  shownThisSession: [],
  lastShownAt: null,
  dismissedTypes: {},
  knownData: {},
  activePopup: null,
  coursesViewed: [],
  lastInteractionAt: Date.now(),
  isUserActive: false,
});

// ============================================================================
// REDUCER
// ============================================================================

function proactiveUIReducer(
  state: ProactiveUIState,
  action: ProactiveUIAction
): ProactiveUIState {
  switch (action.type) {
    case 'SHOW':
      return {
        ...state,
        shownThisSession: [...state.shownThisSession, action.payload],
        lastShownAt: Date.now(),
        activePopup: action.payload,
      };

    case 'HIDE':
      return {
        ...state,
        activePopup: null,
      };

    case 'DISMISS':
      return {
        ...state,
        activePopup: null,
        dismissedTypes: {
          ...state.dismissedTypes,
          [action.payload]: Date.now(),
        },
      };

    case 'SET_KNOWN_DATA':
      return {
        ...state,
        knownData: { ...state.knownData, ...action.payload },
      };

    case 'TRACK_COURSE_VIEW':
      if (state.coursesViewed.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        coursesViewed: [...state.coursesViewed, action.payload],
      };

    case 'SET_USER_ACTIVE':
      return {
        ...state,
        isUserActive: action.payload,
        lastInteractionAt: action.payload ? Date.now() : state.lastInteractionAt,
      };

    case 'UPDATE_INTERACTION':
      return {
        ...state,
        lastInteractionAt: Date.now(),
      };

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface ProactiveUIContextValue {
  state: ProactiveUIState;
  // Core API
  requestShow: (componentType: ProactiveComponentType, force?: boolean) => boolean;
  dismiss: (componentType: ProactiveComponentType) => void;
  hide: () => void;
  canShow: (componentType: ProactiveComponentType) => boolean;
  // Data management
  markDataCollected: (dataType: keyof KnownUserData, value: unknown) => void;
  getKnownData: () => KnownUserData;
  // Tracking
  trackCourseView: (courseId: string) => void;
  setUserActive: (active: boolean) => void;
  updateInteraction: () => void;
  // Reset
  reset: () => void;
}

const ProactiveUIContext = createContext<ProactiveUIContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface ProactiveUIProviderProps {
  children: ReactNode;
  initialState?: Partial<ProactiveUIState>;
}

export function ProactiveUIProvider({ children, initialState }: ProactiveUIProviderProps) {
  // Hydration flag to avoid SSR mismatch
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize state from session storage after mount
  const [state, dispatch] = useReducer(proactiveUIReducer, createInitialState(), (initial) => {
    // On client, try to restore from session storage
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...initial, ...parsed, ...initialState };
        }
      } catch {
        // Ignore errors
      }
    }
    return { ...initial, ...initialState };
  });

  // Mark as hydrated after mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Persist state to session storage
  useEffect(() => {
    if (!isHydrated) return;

    try {
      // Only persist relevant fields (not activePopup)
      const toPersist = {
        shownThisSession: state.shownThisSession,
        lastShownAt: state.lastShownAt,
        dismissedTypes: state.dismissedTypes,
        knownData: state.knownData,
        coursesViewed: state.coursesViewed,
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(toPersist));
    } catch {
      // Ignore errors
    }
  }, [state, isHydrated]);

  // Check if we can show a component
  const canShow = useCallback(
    (componentType: ProactiveComponentType): boolean => {
      // Always allow inline badges
      if (componentType === 'AvailabilityBadge') {
        return true;
      }

      // Check if user is active (typing, scrolling)
      if (state.isUserActive) {
        return false;
      }

      // Check if another popup is active
      if (state.activePopup !== null) {
        return false;
      }

      // Check session popup limit (only for modals/nudges)
      const isPopup = ['DateIntentModal', 'GroupSizeNudge'].includes(componentType);
      if (isPopup) {
        const popupsShown = state.shownThisSession.filter((t) =>
          ['DateIntentModal', 'GroupSizeNudge'].includes(t)
        ).length;
        if (popupsShown >= MAX_POPUPS_PER_SESSION) {
          return false;
        }
      }

      // Check global cooldown
      if (state.lastShownAt) {
        const timeSince = Date.now() - state.lastShownAt;
        if (timeSince < GLOBAL_COOLDOWN) {
          return false;
        }
      }

      // Check type-specific dismiss cooldown
      const dismissedAt = state.dismissedTypes[componentType];
      if (dismissedAt) {
        const timeSince = Date.now() - dismissedAt;
        if (timeSince < DISMISS_COOLDOWN) {
          return false;
        }
      }

      // Check if already shown this session
      if (state.shownThisSession.includes(componentType)) {
        return false;
      }

      // Type-specific checks
      switch (componentType) {
        case 'DateIntentModal':
          // Don't show if we already have dates
          if (state.knownData.dates) return false;
          break;

        case 'GroupSizeNudge':
          // Don't show if we already have group size
          if (state.knownData.groupSize !== undefined) return false;
          break;

        case 'TripBuilderPrompt':
          // Only show after viewing 3+ courses
          if (state.coursesViewed.length < 3) return false;
          break;
      }

      return true;
    },
    [state]
  );

  // Request to show a component
  const requestShow = useCallback(
    (componentType: ProactiveComponentType, force = false): boolean => {
      if (!force && !canShow(componentType)) {
        return false;
      }

      dispatch({ type: 'SHOW', payload: componentType });
      return true;
    },
    [canShow]
  );

  // Dismiss a component
  const dismiss = useCallback((componentType: ProactiveComponentType) => {
    dispatch({ type: 'DISMISS', payload: componentType });
  }, []);

  // Hide without dismissing (e.g., on submit)
  const hide = useCallback(() => {
    dispatch({ type: 'HIDE' });
  }, []);

  // Mark data as collected
  const markDataCollected = useCallback(
    (dataType: keyof KnownUserData, value: unknown) => {
      dispatch({
        type: 'SET_KNOWN_DATA',
        payload: { [dataType]: value },
      });
    },
    []
  );

  // Get known data
  const getKnownData = useCallback(() => state.knownData, [state.knownData]);

  // Track course view
  const trackCourseView = useCallback((courseId: string) => {
    dispatch({ type: 'TRACK_COURSE_VIEW', payload: courseId });
  }, []);

  // Set user active state
  const setUserActive = useCallback((active: boolean) => {
    dispatch({ type: 'SET_USER_ACTIVE', payload: active });
  }, []);

  // Update last interaction timestamp
  const updateInteraction = useCallback(() => {
    dispatch({ type: 'UPDATE_INTERACTION' });
  }, []);

  // Reset
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Memoize context value
  const value = useMemo(
    () => ({
      state,
      requestShow,
      dismiss,
      hide,
      canShow,
      markDataCollected,
      getKnownData,
      trackCourseView,
      setUserActive,
      updateInteraction,
      reset,
    }),
    [
      state,
      requestShow,
      dismiss,
      hide,
      canShow,
      markDataCollected,
      getKnownData,
      trackCourseView,
      setUserActive,
      updateInteraction,
      reset,
    ]
  );

  return (
    <ProactiveUIContext.Provider value={value}>
      {children}
    </ProactiveUIContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useProactiveUI() {
  const context = useContext(ProactiveUIContext);
  if (!context) {
    throw new Error('useProactiveUI must be used within ProactiveUIProvider');
  }
  return context;
}

// ============================================================================
// DEMO ORCHESTRATOR (for audit page testing)
// ============================================================================

interface ProactiveUIDemoProps {
  children: ReactNode;
}

export function ProactiveUIDemo({ children }: ProactiveUIDemoProps) {
  const { state, requestShow, dismiss, hide, reset, canShow } = useProactiveUI();

  return (
    <div className="space-y-6">
      {/* Status display */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Orchestrator Status
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-text-muted">Active Popup:</span>
            <span className="text-text-primary ml-2 font-mono">
              {state.activePopup || 'none'}
            </span>
          </div>
          <div>
            <span className="text-text-muted">Shown This Session:</span>
            <span className="text-text-primary ml-2 font-mono">
              {state.shownThisSession.length}
            </span>
          </div>
          <div>
            <span className="text-text-muted">Courses Viewed:</span>
            <span className="text-text-primary ml-2 font-mono">
              {state.coursesViewed.length}
            </span>
          </div>
          <div>
            <span className="text-text-muted">Known Data:</span>
            <span className="text-text-primary ml-2 font-mono">
              {Object.keys(state.knownData).join(', ') || 'none'}
            </span>
          </div>
        </div>
      </div>

      {/* Trigger buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => requestShow('DateIntentModal', true)}
          disabled={!canShow('DateIntentModal') && state.activePopup !== null}
          className="px-4 py-2 rounded-lg bg-accent-coral/20 text-accent-coral text-sm font-medium
                     hover:bg-accent-coral/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Trigger DateIntentModal
        </button>
        <button
          onClick={() => requestShow('GroupSizeNudge', true)}
          disabled={state.activePopup !== null}
          className="px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan text-sm font-medium
                     hover:bg-accent-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Trigger GroupSizeNudge
        </button>
        <button
          onClick={() => requestShow('TripBuilderPrompt', true)}
          disabled={state.activePopup !== null}
          className="px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple text-sm font-medium
                     hover:bg-accent-purple/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Trigger TripBuilderPrompt
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-white/10 text-text-secondary text-sm font-medium
                     hover:bg-white/20 transition-colors"
        >
          Reset State
        </button>
      </div>

      {/* Component container */}
      {children}
    </div>
  );
}
