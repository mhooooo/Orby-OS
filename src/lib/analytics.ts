/**
 * Analytics Utility
 *
 * Provides a unified API for tracking events with Plausible or PostHog.
 * Configurable via NEXT_PUBLIC_ANALYTICS_PROVIDER env var.
 *
 * Default: Plausible (privacy-focused, GDPR-compliant)
 * Alternative: PostHog (feature-rich, user identification)
 */

type AnalyticsProvider = 'plausible' | 'posthog' | 'none';

interface PlausibleEvent {
  (eventName: string, options?: { props?: Record<string, string | number | boolean> }): void;
}

interface PostHogClient {
  capture: (eventName: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  reset: () => void;
}

declare global {
  interface Window {
    plausible?: PlausibleEvent;
    posthog?: PostHogClient;
  }
}

/**
 * Get configured analytics provider
 */
function getProvider(): AnalyticsProvider {
  if (typeof window === 'undefined') return 'none';

  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as AnalyticsProvider;

  // Default to Plausible if not specified
  return provider || 'plausible';
}

/**
 * Check if analytics is available
 */
function isAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  const provider = getProvider();

  if (provider === 'plausible') {
    return typeof window.plausible === 'function';
  }

  if (provider === 'posthog') {
    return !!window.posthog;
  }

  return false;
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (!isAvailable()) return;

  const provider = getProvider();

  try {
    if (provider === 'plausible' && window.plausible) {
      window.plausible(eventName, { props: properties });
    } else if (provider === 'posthog' && window.posthog) {
      window.posthog.capture(eventName, properties);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
}

/**
 * Track page view (manual - Plausible auto-tracks by default)
 */
export function trackPageView(url: string): void {
  if (!isAvailable()) return;

  const provider = getProvider();

  try {
    if (provider === 'plausible' && window.plausible) {
      window.plausible('pageview', { props: { url } });
    } else if (provider === 'posthog' && window.posthog) {
      window.posthog.capture('$pageview', { url });
    }
  } catch (error) {
    console.error('[Analytics] Failed to track page view:', error);
  }
}

/**
 * Identify user (PostHog only - Plausible is anonymous by design)
 */
export function identifyUser(
  userId: string,
  traits?: Record<string, unknown>
): void {
  if (!isAvailable()) return;

  const provider = getProvider();

  try {
    if (provider === 'posthog' && window.posthog) {
      window.posthog.identify(userId, traits);
    }
    // Plausible: no-op (privacy-focused, no user tracking)
  } catch (error) {
    console.error('[Analytics] Failed to identify user:', error);
  }
}

/**
 * Reset user identity (PostHog only - useful on logout)
 */
export function resetUser(): void {
  if (!isAvailable()) return;

  const provider = getProvider();

  try {
    if (provider === 'posthog' && window.posthog) {
      window.posthog.reset();
    }
  } catch (error) {
    console.error('[Analytics] Failed to reset user:', error);
  }
}

/**
 * Event tracking helpers for common actions
 */
export const analytics = {
  // Chat interactions
  chatTurn: (turnNumber: number, hasToolUse: boolean) => {
    trackEvent('chat_turn', {
      turn_number: turnNumber,
      has_tool_use: hasToolUse,
    });
  },

  toolUsed: (toolName: string) => {
    trackEvent('tool_used', { tool_name: toolName });
  },

  // Auth conversions
  authConversion: (trigger: string, method: 'google' | 'email') => {
    trackEvent('auth_conversion', {
      trigger,
      method,
    });
  },

  authTrigger: (intent: string) => {
    trackEvent('auth_trigger', { intent });
  },

  // Booking flow
  inquirySubmitted: (data: {
    coursesCount: number;
    days: number;
    groupSize: number;
  }) => {
    trackEvent('inquiry_submitted', {
      courses_count: data.coursesCount,
      days: data.days,
      group_size: data.groupSize,
    });
  },

  // User actions
  courseSaved: (courseId: string) => {
    trackEvent('course_saved', { course_id: courseId });
  },

  courseUnsaved: (courseId: string) => {
    trackEvent('course_unsaved', { course_id: courseId });
  },

  itinerarySaved: (stepCompleted: number) => {
    trackEvent('itinerary_saved', { step_completed: stepCompleted });
  },

  // Itinerary builder steps
  itineraryStepCompleted: (step: number, stepName: string) => {
    trackEvent('itinerary_step_completed', {
      step,
      step_name: stepName,
    });
  },

  // Service interactions
  serviceViewed: (serviceName: string) => {
    trackEvent('service_viewed', { service_name: serviceName });
  },

  // Course interactions
  courseDetailViewed: (courseId: string) => {
    trackEvent('course_detail_viewed', { course_id: courseId });
  },

  courseCarouselViewed: (coursesCount: number) => {
    trackEvent('course_carousel_viewed', { courses_count: coursesCount });
  },

  // Fleet interactions
  fleetViewed: () => {
    trackEvent('fleet_viewed');
  },

  // Suggestion pills
  suggestionClicked: (suggestionText: string) => {
    trackEvent('suggestion_clicked', { suggestion_text: suggestionText });
  },

  // User identity (PostHog only)
  identify: identifyUser,
  reset: resetUser,
};

/**
 * Server-side event tracking (for API routes)
 *
 * Note: Plausible and PostHog both support server-side events,
 * but require API keys. For now, this is a no-op on server.
 * Client-side tracking is sufficient for MVP.
 */
export function trackServerEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  // Future: implement server-side tracking if needed
  console.log('[Analytics] Server event:', eventName, properties);
}
