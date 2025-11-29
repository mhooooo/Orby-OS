'use client';

import { createContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createAuthClient, signInWithGoogle as signInGoogle, signOut as signOutUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign in handler
  const signIn = useCallback(async () => {
    try {
      await signInGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }, []);

  // Sign out handler
  const signOut = useCallback(async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const supabase = createAuthClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signOut,
    }),
    [user, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
