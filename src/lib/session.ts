const SESSION_KEY = 'golf_okay_session_uuid';
const SESSION_CREATED_KEY = 'golf_okay_session_created';

/**
 * Get or create a persistent session UUID.
 * Stored in localStorage for persistence across page loads.
 *
 * @throws {Error} If called on server-side
 */
export function getSessionUuid(): string {
  // Check if we're on the client
  if (typeof window === 'undefined') {
    throw new Error('getSessionUuid must be called on client side');
  }

  let sessionUuid = localStorage.getItem(SESSION_KEY);

  if (!sessionUuid) {
    sessionUuid = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionUuid);
    localStorage.setItem(SESSION_CREATED_KEY, new Date().toISOString());
  }

  return sessionUuid;
}

/**
 * Clear session from localStorage.
 * Useful for testing or explicit user logout.
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_CREATED_KEY);
}

/**
 * Get session age in hours.
 * Returns 0 if session doesn't exist or called on server-side.
 */
export function getSessionAge(): number {
  if (typeof window === 'undefined') return 0;

  const created = localStorage.getItem(SESSION_CREATED_KEY);
  if (!created) return 0;

  return (Date.now() - new Date(created).getTime()) / (1000 * 60 * 60);
}
