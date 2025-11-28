# Auth Integration Examples

Quick reference for integrating authentication into Golf Okay components.

## Example 1: Add Auth Button to Sidebar

```tsx
// In src/components/Sidebar.tsx

import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const { user, loading, signIn, signOut } = useAuth();

  return (
    <aside className="...">
      {/* Existing sidebar content */}

      {/* Auth section at bottom */}
      <div className="mt-auto p-4 border-t border-[#282A2C]">
        {loading ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : user ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-400 truncate">
              {user.email}
            </div>
            <button
              onClick={signOut}
              className="w-full px-4 py-2 rounded-full bg-[#282A2C] hover:bg-[#FF6B35] text-white transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="w-full px-4 py-2 rounded-full bg-[#00D4FF] hover:bg-[#00B8E0] text-[#131314] font-medium transition-colors text-sm"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </aside>
  );
}
```

## Example 2: Auth Gate Modal (Soft Conversion)

Trigger after 3+ chat turns or when user tries to save/book:

```tsx
// src/components/AuthGateModal.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'turns' | 'save' | 'book';
}

export function AuthGateModal({ isOpen, onClose, reason }: AuthGateModalProps) {
  const { user, signIn } = useAuth();

  // Auto-close if user signs in
  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  if (!isOpen) return null;

  const messages = {
    turns: {
      title: "Loving the vibe?",
      subtitle: "Sign in to save your progress and get personalized recommendations",
    },
    save: {
      title: "Save this for later",
      subtitle: "Sign in to bookmark courses and build your dream itinerary",
    },
    book: {
      title: "Ready to book?",
      subtitle: "Sign in to continue and we'll handle the rest",
    },
  };

  const { title, subtitle } = messages[reason];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1E1F20] rounded-3xl p-8 max-w-md w-full mx-4 border border-[#282A2C]">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400 mb-6">{subtitle}</p>

        <button
          onClick={signIn}
          className="w-full px-6 py-3 rounded-full bg-[#00D4FF] hover:bg-[#00B8E0] text-[#131314] font-medium transition-colors mb-3"
        >
          Continue with Google
        </button>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 rounded-full bg-transparent hover:bg-[#282A2C] text-gray-400 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
```

## Example 3: Save Course Feature

```tsx
// src/components/generative-ui/CourseDetailCard.tsx

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function CourseDetailCard({ course }) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!user) {
      // Trigger auth gate modal
      return;
    }

    // Save to Supabase
    const { error } = await supabase
      .from('saved_courses')
      .insert({
        user_id: user.id,
        course_id: course.id,
      });

    if (!error) {
      setIsSaved(true);
    }
  };

  return (
    <div className="...">
      {/* Course details */}

      <button
        onClick={handleSave}
        className={`... ${isSaved ? 'bg-[#00D4FF]' : 'bg-[#282A2C]'}`}
      >
        {isSaved ? '❤️ Saved' : '🤍 Save'}
      </button>
    </div>
  );
}
```

## Example 4: Turn Counter for Auth Gate

```tsx
// In src/context/ChatContext.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [turnCount, setTurnCount] = useState(0);
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Increment on each user message
  const sendMessage = async (message: string) => {
    if (!user) {
      setTurnCount(prev => prev + 1);
    }
    // ... send message logic
  };

  // Show auth gate after 3 turns (for non-authenticated users)
  useEffect(() => {
    if (!user && turnCount >= 3) {
      setShowAuthGate(true);
    }
  }, [user, turnCount]);

  return (
    <ChatContext.Provider value={{ ... }}>
      {children}
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        reason="turns"
      />
    </ChatContext.Provider>
  );
}
```

## Example 5: Check Auth Status Anywhere

```tsx
import { useAuth } from '@/hooks/useAuth';

export function AnyComponent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading auth state...</div>;
  }

  return (
    <div>
      {user ? (
        <p>Welcome back, {user.email}!</p>
      ) : (
        <p>Browse as guest or sign in for full features</p>
      )}
    </div>
  );
}
```

## Database Schema for User Features

Add these tables to your Supabase project:

```sql
-- Saved courses table
CREATE TABLE saved_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE saved_courses ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own saved courses
CREATE POLICY "Users can manage their own saved courses"
  ON saved_courses
  FOR ALL
  USING (auth.uid() = user_id);

-- Saved itineraries table
CREATE TABLE saved_itineraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE saved_itineraries ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own itineraries
CREATE POLICY "Users can manage their own itineraries"
  ON saved_itineraries
  FOR ALL
  USING (auth.uid() = user_id);
```

## Usage Notes

- Auth state is available globally via `useAuth()` hook
- `user` is `null` when not signed in
- `loading` is `true` during initial auth check
- Always check `user` before accessing user-specific features
- Use auth gate strategically (after 3+ turns or on save/book intent)
- Google OAuth requires proper setup in Supabase dashboard

See `AUTH_SETUP.md` for complete configuration guide.
