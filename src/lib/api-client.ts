import { getSessionUuid } from './session';

/**
 * Fetch wrapper that includes session UUID and auth credentials in headers.
 * Use this for all API calls to ensure session tracking works properly.
 *
 * @param url - API endpoint URL
 * @param options - Standard fetch options
 * @returns Fetch response
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Get session UUID if on client-side
  const sessionUuid = typeof window !== 'undefined' ? getSessionUuid() : null;

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(sessionUuid && { 'X-Session-UUID': sessionUuid }),
    },
    credentials: 'include', // For auth cookies
  });
}
