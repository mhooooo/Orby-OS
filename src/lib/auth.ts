import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Create a browser client for auth operations
export function createAuthClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Sign in with Google OAuth
export async function signInWithGoogle() {
  const supabase = createAuthClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

// Sign out
export async function signOut() {
  const supabase = createAuthClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createAuthClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

// Get current session
export async function getCurrentSession() {
  const supabase = createAuthClient();

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }

  return session;
}
