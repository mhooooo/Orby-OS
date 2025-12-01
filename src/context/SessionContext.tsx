'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { getSessionUuid } from '@/lib/session';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface SessionState {
  sessionUuid: string | null;
  isMerged: boolean;
}

interface SessionContextType extends SessionState {
  ensureSession: () => Promise<string | null>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Initialize sessionUuid on client side only
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);
  const [isMerged, setIsMerged] = useState(false);

  const { user } = useAuth();

  // Initialize session UUID on mount (client-side only)
  useEffect(() => {
    try {
      const uuid = getSessionUuid();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessionUuid(uuid);
    } catch (error) {
      console.error('[Session] Failed to initialize session:', error);
    }
  }, []);

  // Register session in database on mount
  useEffect(() => {
    if (!sessionUuid) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('session_profiles')
      .upsert(
        {
          session_uuid: sessionUuid,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: 'session_uuid' }
      )
      .then(({ error }: { error: unknown }) => {
        if (error) {
          console.error('[Session] Failed to register session:', error);
        }
      });
  }, [sessionUuid]);

  // Merge session when user logs in
  useEffect(() => {
    if (user && sessionUuid && !isMerged) {
      mergeSessionToUser(sessionUuid, user.id)
        .then(() => {
          console.log('[Session] Successfully merged session to user');
          setIsMerged(true);
        })
        .catch((error) => {
          console.error('[Session] Failed to merge session:', error);
        });
    }
  }, [user, sessionUuid, isMerged]);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (!sessionUuid) {
      try {
        const uuid = getSessionUuid();
        setSessionUuid(uuid);
        return uuid;
      } catch (error) {
        console.error('[Session] Failed to ensure session:', error);
        return null;
      }
    }
    return sessionUuid;
  }, [sessionUuid]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      sessionUuid,
      isMerged,
      ensureSession,
    }),
    [sessionUuid, isMerged, ensureSession]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}

/**
 * API call to merge anonymous session data to authenticated user.
 * Calls the merge_session_to_user RPC function.
 */
async function mergeSessionToUser(sessionUuid: string, userId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('merge_session_to_user', {
    p_session_uuid: sessionUuid,
    p_user_id: userId,
  });

  if (error) throw error;

  console.log('[Session] Merge result:', data);
  return data;
}
