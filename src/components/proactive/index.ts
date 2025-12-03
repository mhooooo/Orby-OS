// Proactive UI System
// Central orchestrator and components for non-intrusive user nudges

// Core orchestrator
export {
  ProactiveUIProvider,
  useProactiveUI,
  ProactiveUIDemo,
  type ProactiveComponentType,
  type ProactiveUIState,
  type KnownUserData,
} from './ProactiveUIManager';

// Date Intent Modal (wrapped)
export {
  ProactiveDateIntentModal,
  ProactiveDateIntentToast,
} from './ProactiveDateIntentModal';

// Group Size Nudge
export {
  GroupSizeNudge,
  GroupSizeNudgeStandalone,
} from './GroupSizeNudge';

// Trip Builder Prompt
export {
  TripBuilderPrompt,
  TripBuilderPromptStandalone,
  TripBuilderPill,
} from './TripBuilderPrompt';

// Re-export original components for standalone use
export { DateIntentModal, DateIntentToast, type DateIntentData } from '@/components/DateIntentModal';
export {
  AvailabilityBadge,
  AvailabilityDot,
  AvailabilityBadgeWithInfo,
  type AvailabilityStatus,
} from '@/components/AvailabilityBadge';
