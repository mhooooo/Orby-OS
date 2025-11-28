'use client';

import { useAuth } from '@/hooks/useAuth';

/**
 * Example component showing how to use the auth system
 *
 * Usage:
 * - Shows user email when signed in
 * - Shows "Sign in with Google" button when signed out
 * - Displays loading state
 */
export function AuthButton() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <div className="px-4 py-2 rounded-full bg-[#282A2C] text-gray-400">
        Loading...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">{user.email}</span>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 rounded-full bg-[#282A2C] hover:bg-[#FF6B35] text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-2 rounded-full bg-[#00D4FF] hover:bg-[#00B8E0] text-[#131314] font-medium transition-colors"
    >
      Sign in with Google
    </button>
  );
}
