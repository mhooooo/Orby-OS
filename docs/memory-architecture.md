# Golf Okay Memory Architecture

> **Active + Passive Memory System**
> Hard data via inline tools, soft profiling via background jobs.

---

## Table of Contents

1. [Database Schema](#1-database-schema)
2. [Identity Management](#2-identity-management)
3. [Active Memory (Inline Tools)](#3-active-memory-inline-tools)
4. [Passive Profiler (Edge Function)](#4-passive-profiler-edge-function)
5. [Retrieval Mechanism](#5-retrieval-mechanism)
6. [Context Injection](#6-context-injection)
7. [Realtime UI Updates](#7-realtime-ui-updates)
8. [Error Handling & Edge Cases](#8-error-handling--edge-cases)
9. [Cost Analysis](#9-cost-analysis)

---

## 1. Database Schema

### 1.1 Enable Vector Extension

```sql
-- Run once in Supabase SQL editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1.2 Tables

#### `chat_messages` - Short-Term Memory

Stores raw conversation history for context window and replay.

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (one or both will be set)
  session_uuid UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Tool tracking (for Active Memory audit trail)
  tool_calls JSONB DEFAULT '[]',
  tool_results JSONB DEFAULT '[]',

  -- Metadata
  tokens_used INTEGER,
  model TEXT DEFAULT 'claude-sonnet-4-20250514',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_messages_session ON chat_messages(session_uuid);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

-- Composite index for retrieval queries
CREATE INDEX idx_chat_messages_identity_time
ON chat_messages(session_uuid, user_id, created_at DESC);
```

#### `user_memories` - Long-Term Memory (Vector Store)

Stores extracted preferences and facts with embeddings for semantic search.

```sql
CREATE TABLE user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  session_uuid UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Memory content
  memory_type TEXT NOT NULL CHECK (memory_type IN (
    'preference',      -- "Likes fast greens", "Prefers morning tee times"
    'constraint',      -- "Needs golf cart", "Budget under 5000 THB"
    'fact',            -- "Traveling with spouse", "First time in Thailand"
    'behavior',        -- "Usually books 3-4 days trips", "Asks many questions"
    'archived'         -- Superseded by newer conflicting memory (kept for audit)
  )),
  category TEXT,       -- 'play_style', 'budget', 'logistics', 'social', 'health'
  content TEXT NOT NULL,

  -- Vector embedding (OpenAI text-embedding-3-small = 1536 dimensions)
  embedding VECTOR(1536),

  -- Quality signals
  confidence FLOAT DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  times_reinforced INTEGER DEFAULT 1,  -- Increases when same fact extracted again
  last_used_at TIMESTAMPTZ,            -- Track relevance decay

  -- Provenance
  source_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  extraction_model TEXT DEFAULT 'claude-haiku',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index (HNSW - faster, zero maintenance)
-- HNSW is preferred over IVFFlat: no list tuning, handles updates better
CREATE INDEX idx_user_memories_embedding
ON user_memories USING hnsw (embedding vector_cosine_ops);

-- Standard indexes
CREATE INDEX idx_user_memories_session ON user_memories(session_uuid);
CREATE INDEX idx_user_memories_user ON user_memories(user_id);
CREATE INDEX idx_user_memories_type ON user_memories(memory_type);
CREATE INDEX idx_user_memories_category ON user_memories(category);

-- Composite for identity lookups
CREATE INDEX idx_user_memories_identity
ON user_memories(session_uuid, user_id);
```

#### `session_profiles` - Session Metadata

Tracks anonymous sessions for analytics and merge operations.

```sql
CREATE TABLE session_profiles (
  session_uuid UUID PRIMARY KEY,

  -- Link to user (set on merge)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  merged_at TIMESTAMPTZ,

  -- Session metadata
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,

  -- Device/browser fingerprint (optional, for multi-device)
  user_agent TEXT,
  ip_country TEXT,

  -- Current state snapshot (for quick access)
  current_itinerary_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_profiles_user ON session_profiles(user_id);
```

### 1.3 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CHAT_MESSAGES Policies
-- ============================================

-- Users can read their own messages (by user_id OR session_uuid from header)
-- ⚠️ SECURITY NOTE: Header-based session_uuid can be spoofed.
-- For anonymous users, the UUID IS their "key" - acceptable for low-risk data.
-- For authenticated users, user_id takes precedence (auth.uid() is secure).
-- Consider: signed cookies or JWT claims for session validation in production.
CREATE POLICY "Users read own messages" ON chat_messages
  FOR SELECT USING (
    user_id = auth.uid()
    OR session_uuid = (current_setting('request.headers', true)::json->>'x-session-uuid')::uuid
  );

-- Service role can insert (API routes)
CREATE POLICY "Service inserts messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- Users can't update or delete messages (immutable log)
-- Only service role can do maintenance

-- ============================================
-- USER_MEMORIES Policies
-- ============================================

-- Users can read their own memories
CREATE POLICY "Users read own memories" ON user_memories
  FOR SELECT USING (
    user_id = auth.uid()
    OR session_uuid = (current_setting('request.headers', true)::json->>'x-session-uuid')::uuid
  );

-- Service role inserts (Edge Function)
CREATE POLICY "Service inserts memories" ON user_memories
  FOR INSERT WITH CHECK (true);

-- Service role updates (reinforcement, merge)
CREATE POLICY "Service updates memories" ON user_memories
  FOR UPDATE USING (true);

-- ============================================
-- SESSION_PROFILES Policies
-- ============================================

-- Users can read their own session
CREATE POLICY "Users read own session" ON session_profiles
  FOR SELECT USING (
    user_id = auth.uid()
    OR session_uuid = (current_setting('request.headers', true)::json->>'x-session-uuid')::uuid
  );

-- Service role manages sessions
CREATE POLICY "Service manages sessions" ON session_profiles
  FOR ALL USING (true);
```

### 1.4 Database Functions

#### Semantic Search Function

```sql
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding VECTOR(1536),
  p_session_uuid UUID,
  p_user_id UUID DEFAULT NULL,
  match_count INT DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  memory_type TEXT,
  category TEXT,
  content TEXT,
  confidence FLOAT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    um.id,
    um.memory_type,
    um.category,
    um.content,
    um.confidence,
    1 - (um.embedding <=> query_embedding) AS similarity
  FROM user_memories um
  WHERE
    -- Match by session OR user
    (um.session_uuid = p_session_uuid OR um.user_id = p_user_id)
    -- Only return if similar enough
    AND (1 - (um.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY um.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

#### Merge Session to User Function

```sql
CREATE OR REPLACE FUNCTION merge_session_to_user(
  p_session_uuid UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  messages_merged INT;
  memories_merged INT;
  conflicts_resolved INT;
BEGIN
  -- Update chat_messages
  UPDATE chat_messages
  SET user_id = p_user_id
  WHERE session_uuid = p_session_uuid
    AND user_id IS NULL;
  GET DIAGNOSTICS messages_merged = ROW_COUNT;

  -- Update user_memories
  UPDATE user_memories
  SET user_id = p_user_id
  WHERE session_uuid = p_session_uuid
    AND user_id IS NULL;
  GET DIAGNOSTICS memories_merged = ROW_COUNT;

  -- Update session_profiles
  UPDATE session_profiles
  SET
    user_id = p_user_id,
    merged_at = NOW()
  WHERE session_uuid = p_session_uuid;

  -- ============================================
  -- CONFLICT RESOLUTION
  -- When same category has conflicting memories,
  -- keep the MOST RECENT one (session wins over old account data)
  -- Archive the old conflicting memory instead of deleting
  -- ============================================

  -- Mark conflicting old memories as archived
  -- Scenario: Account has "budget: luxury", session has "budget: tight"
  -- Result: Archive the old "luxury" memory, keep the fresh "tight" one
  WITH conflicts AS (
    SELECT
      um.id,
      um.category,
      um.created_at,
      ROW_NUMBER() OVER (
        PARTITION BY um.user_id, um.category
        ORDER BY um.created_at DESC  -- Most recent wins
      ) as recency_rank
    FROM user_memories um
    WHERE um.user_id = p_user_id
      AND um.category IN ('budget', 'play_style', 'logistics')  -- Categories that can conflict
  )
  UPDATE user_memories
  SET
    memory_type = 'archived',
    updated_at = NOW()
  WHERE id IN (
    SELECT id FROM conflicts WHERE recency_rank > 1
  );
  GET DIAGNOSTICS conflicts_resolved = ROW_COUNT;

  -- Deduplicate exact duplicates (same content for same user)
  -- Keep the one with highest confidence/reinforcement
  WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY user_id, content
      ORDER BY times_reinforced DESC, confidence DESC
    ) as rn
    FROM user_memories
    WHERE user_id = p_user_id
      AND memory_type != 'archived'
  )
  DELETE FROM user_memories
  WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

  RETURN jsonb_build_object(
    'messages_merged', messages_merged,
    'memories_merged', memories_merged,
    'conflicts_resolved', conflicts_resolved,
    'session_uuid', p_session_uuid,
    'user_id', p_user_id
  );
END;
$$;
```

#### Update Memory Reinforcement

```sql
CREATE OR REPLACE FUNCTION reinforce_memory(
  p_memory_id UUID,
  p_new_confidence FLOAT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE user_memories
  SET
    times_reinforced = times_reinforced + 1,
    confidence = COALESCE(p_new_confidence, LEAST(confidence + 0.05, 1.0)),
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE id = p_memory_id;
END;
$$;
```

---

## 2. Identity Management

### 2.1 Frontend: Session UUID Generation

```typescript
// src/lib/session.ts

const SESSION_KEY = 'golf_okay_session_uuid';
const SESSION_CREATED_KEY = 'golf_okay_session_created';

/**
 * Get or create a persistent session UUID.
 * Stored in localStorage for persistence across page loads.
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
 * Clear session (for testing or user request).
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_CREATED_KEY);
}

/**
 * Get session age in hours.
 */
export function getSessionAge(): number {
  const created = localStorage.getItem(SESSION_CREATED_KEY);
  if (!created) return 0;
  return (Date.now() - new Date(created).getTime()) / (1000 * 60 * 60);
}
```

### 2.2 Context Provider: Session Context

```typescript
// src/context/SessionContext.tsx

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSessionUuid } from '@/lib/session';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface SessionState {
  sessionUuid: string | null;
  isLoading: boolean;
  isMerged: boolean;
}

interface SessionContextType extends SessionState {
  ensureSession: () => Promise<string>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    sessionUuid: null,
    isLoading: true,
    isMerged: false,
  });

  const { user } = useAuth();

  // Initialize session on mount
  useEffect(() => {
    const uuid = getSessionUuid();
    setState(prev => ({ ...prev, sessionUuid: uuid, isLoading: false }));

    // Register session in database
    supabase.from('session_profiles').upsert({
      session_uuid: uuid,
      last_active_at: new Date().toISOString(),
    }, { onConflict: 'session_uuid' });
  }, []);

  // Merge session when user logs in
  useEffect(() => {
    if (user && state.sessionUuid && !state.isMerged) {
      mergeSessionToUser(state.sessionUuid, user.id)
        .then(() => {
          setState(prev => ({ ...prev, isMerged: true }));
        })
        .catch(console.error);
    }
  }, [user, state.sessionUuid, state.isMerged]);

  const ensureSession = async (): Promise<string> => {
    if (state.sessionUuid) return state.sessionUuid;
    const uuid = getSessionUuid();
    setState(prev => ({ ...prev, sessionUuid: uuid }));
    return uuid;
  };

  return (
    <SessionContext.Provider value={{ ...state, ensureSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}

// API call to merge
async function mergeSessionToUser(sessionUuid: string, userId: string) {
  const { data, error } = await supabase.rpc('merge_session_to_user', {
    p_session_uuid: sessionUuid,
    p_user_id: userId,
  });

  if (error) throw error;
  console.log('[Session] Merged:', data);
  return data;
}
```

### 2.3 API Headers: Pass Session UUID

```typescript
// src/lib/api-client.ts

import { getSessionUuid } from './session';

/**
 * Fetch wrapper that includes session UUID in headers.
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
  const sessionUuid = typeof window !== 'undefined' ? getSessionUuid() : null;

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(sessionUuid && { 'X-Session-UUID': sessionUuid }),
    },
    credentials: 'include', // For auth cookies
  });
}
```

---

## 3. Active Memory (Inline Tools)

### 3.1 Tool Definitions

```typescript
// src/lib/tools.ts (additions)

export const ACTIVE_MEMORY_TOOLS: Anthropic.Tool[] = [
  {
    name: 'set_trip_dates',
    description: 'Set the travel dates for the trip. Use when user specifies dates like "next Tuesday", "March 15-20", etc.',
    input_schema: {
      type: 'object',
      properties: {
        start_date: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        end_date: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (optional for single day)',
        },
        flexibility: {
          type: 'string',
          enum: ['fixed', 'flexible_1_day', 'flexible_week'],
          description: 'How flexible are these dates',
        },
      },
      required: ['start_date'],
    },
  },
  {
    name: 'set_group_size',
    description: 'Set the number of golfers in the group. Use when user mentions party size.',
    input_schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of golfers',
        },
        composition: {
          type: 'string',
          description: 'Optional: "couples", "friends", "corporate", "solo"',
        },
      },
      required: ['count'],
    },
  },
  {
    name: 'add_course_to_trip',
    description: 'Add a specific golf course to the itinerary. Use when user says they want to play a specific course.',
    input_schema: {
      type: 'object',
      properties: {
        course_name: {
          type: 'string',
          description: 'Name of the course',
        },
        course_id: {
          type: 'string',
          description: 'Course ID if known',
        },
        preferred_date: {
          type: 'string',
          description: 'Preferred date for this course (YYYY-MM-DD)',
        },
        tee_time_preference: {
          type: 'string',
          enum: ['early_morning', 'morning', 'midday', 'afternoon'],
          description: 'Preferred tee time slot',
        },
      },
      required: ['course_name'],
    },
  },
  {
    name: 'set_budget',
    description: 'Set budget constraints for the trip. Use when user mentions budget, price sensitivity, or spending limits.',
    input_schema: {
      type: 'object',
      properties: {
        total_budget: {
          type: 'number',
          description: 'Total budget in THB',
        },
        per_round_budget: {
          type: 'number',
          description: 'Max budget per round in THB',
        },
        tier: {
          type: 'string',
          enum: ['budget', 'mid_range', 'premium', 'luxury'],
          description: 'General budget tier',
        },
      },
      required: [],
    },
  },
  {
    name: 'set_transport_needs',
    description: 'Set transportation requirements. Use when user mentions transport, transfers, or vehicle needs.',
    input_schema: {
      type: 'object',
      properties: {
        need_airport_transfer: {
          type: 'boolean',
        },
        need_daily_transport: {
          type: 'boolean',
        },
        vehicle_preference: {
          type: 'string',
          enum: ['sedan', 'suv', 'van', 'minibus'],
        },
        pickup_location: {
          type: 'string',
        },
      },
      required: [],
    },
  },
  {
    name: 'set_special_requirements',
    description: 'Record special requirements or constraints. Use for accessibility, dietary, health needs.',
    input_schema: {
      type: 'object',
      properties: {
        needs_golf_cart: {
          type: 'boolean',
          description: 'User requires a golf cart',
        },
        dietary_restrictions: {
          type: 'array',
          items: { type: 'string' },
        },
        mobility_notes: {
          type: 'string',
        },
        other: {
          type: 'string',
        },
      },
      required: [],
    },
  },
];
```

### 3.2 Tool Handlers

```typescript
// src/lib/tool-handlers.ts (additions)

import { ItineraryDraft } from '@/types/itinerary';

interface ActiveMemoryResult {
  success: boolean;
  updated_fields: string[];
  current_state: Partial<ItineraryDraft>;
}

export async function handleSetTripDates(
  input: { start_date: string; end_date?: string; flexibility?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  const { start_date, end_date, flexibility } = input;

  // Calculate number of days
  const start = new Date(start_date);
  const end = end_date ? new Date(end_date) : start;
  const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Update or create itinerary draft
  const { data, error } = await supabase
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      start_date,
      end_date: end_date || start_date,
      number_of_days: numberOfDays,
      date_flexibility: flexibility || 'fixed',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['start_date', 'end_date', 'number_of_days'],
    current_state: data || {},
  };
}

export async function handleSetGroupSize(
  input: { count: number; composition?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  const { data, error } = await supabase
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      group_size: input.count,
      group_composition: input.composition,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['group_size', 'group_composition'],
    current_state: data || {},
  };
}

export async function handleAddCourseToTrip(
  input: { course_name: string; course_id?: string; preferred_date?: string; tee_time_preference?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  // Find course by name if ID not provided
  let courseId = input.course_id;
  if (!courseId) {
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .ilike('name', `%${input.course_name}%`)
      .limit(1)
      .single();
    courseId = course?.id;
  }

  // Get current draft
  const { data: draft } = await supabase
    .from('itinerary_drafts')
    .select('selected_courses')
    .eq('session_uuid', sessionUuid)
    .single();

  const currentCourses = draft?.selected_courses || [];
  const newCourse = {
    course_id: courseId,
    course_name: input.course_name,
    preferred_date: input.preferred_date,
    tee_time_preference: input.tee_time_preference,
    added_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      selected_courses: [...currentCourses, newCourse],
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['selected_courses'],
    current_state: data || {},
  };
}

export async function handleSetBudget(
  input: { total_budget?: number; per_round_budget?: number; tier?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  const { data, error } = await supabase
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      total_budget: input.total_budget,
      per_round_budget: input.per_round_budget,
      budget_tier: input.tier,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['total_budget', 'per_round_budget', 'budget_tier'],
    current_state: data || {},
  };
}

export async function handleSetTransportNeeds(
  input: { need_airport_transfer?: boolean; need_daily_transport?: boolean; vehicle_preference?: string; pickup_location?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  const { data, error } = await supabase
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      transport_config: input,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['transport_config'],
    current_state: data || {},
  };
}

export async function handleSetSpecialRequirements(
  input: { needs_golf_cart?: boolean; dietary_restrictions?: string[]; mobility_notes?: string; other?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  const { data, error } = await supabase
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      special_requirements: input,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['special_requirements'],
    current_state: data || {},
  };
}
```

### 3.3 Tool Dispatcher Update

```typescript
// src/lib/tool-handlers.ts (update executeToolCall)

export async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  sessionUuid?: string
): Promise<unknown> {
  switch (toolName) {
    // ... existing tools ...

    // Active Memory Tools
    case 'set_trip_dates':
      if (!sessionUuid) return { error: 'Session required' };
      return handleSetTripDates(toolInput as any, sessionUuid);

    case 'set_group_size':
      if (!sessionUuid) return { error: 'Session required' };
      return handleSetGroupSize(toolInput as any, sessionUuid);

    case 'add_course_to_trip':
      if (!sessionUuid) return { error: 'Session required' };
      return handleAddCourseToTrip(toolInput as any, sessionUuid);

    case 'set_budget':
      if (!sessionUuid) return { error: 'Session required' };
      return handleSetBudget(toolInput as any, sessionUuid);

    case 'set_transport_needs':
      if (!sessionUuid) return { error: 'Session required' };
      return handleSetTransportNeeds(toolInput as any, sessionUuid);

    case 'set_special_requirements':
      if (!sessionUuid) return { error: 'Session required' };
      return handleSetSpecialRequirements(toolInput as any, sessionUuid);

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
```

---

## 4. Passive Profiler (Edge Function)

### 4.1 Edge Function: `extract-memories`

```typescript
// supabase/functions/extract-memories/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY'); // For embeddings
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

// Categories of memories to extract
const MEMORY_CATEGORIES = {
  play_style: [
    'pace of play preference',
    'walking vs cart',
    'competitive vs casual',
    'practice habits',
  ],
  budget: [
    'price sensitivity',
    'willingness to splurge',
    'value orientation',
  ],
  logistics: [
    'time preferences',
    'location preferences',
    'transport needs',
  ],
  social: [
    'group dynamics',
    'travel companions',
    'communication style',
  ],
  health: [
    'physical limitations',
    'dietary needs',
    'accessibility requirements',
  ],
};

const EXTRACTION_PROMPT = `You are a memory extraction system for a golf concierge AI.

Analyze the user's message and extract IMPLICIT preferences, personality traits, or long-term constraints.

RULES:
1. DO NOT extract explicit booking data (dates, group size, specific courses) - those are handled elsewhere.
2. Only extract SOFT signals that reveal personality or preferences.
3. Be conservative - only extract if confidence > 0.7.
4. Look for patterns, not one-time mentions.

CATEGORIES:
- play_style: pace, walking/cart, competitive/casual
- budget: price sensitivity, value focus, luxury preference
- logistics: morning/afternoon person, location preferences
- social: solo/group, communication style
- health: physical needs, dietary, accessibility

EXAMPLES:
- "make sure it's not too expensive" → { type: "preference", category: "budget", content: "User is price-sensitive", confidence: 0.8 }
- "I hate waking up early" → { type: "preference", category: "logistics", content: "User prefers late tee times", confidence: 0.85 }
- "my knee has been bothering me" → { type: "constraint", category: "health", content: "User may need golf cart due to knee issues", confidence: 0.75 }

USER MESSAGE:
{message}

RECENT CONTEXT (last 3 messages):
{context}

Return a JSON array of extracted memories. Return [] if nothing notable.
Format: [{ "type": "preference|constraint|fact|behavior", "category": "play_style|budget|logistics|social|health", "content": "Human readable memory", "confidence": 0.0-1.0 }]`;

async function extractMemories(
  message: string,
  context: string
): Promise<Array<{ type: string; category: string; content: string; confidence: number }>> {
  const prompt = EXTRACTION_PROMPT
    .replace('{message}', message)
    .replace('{context}', context);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307', // Fast & cheap for extraction
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const content = data.content[0]?.text || '[]';

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    console.error('Failed to parse extraction:', content);
    return [];
  }
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}

async function findSimilarMemory(
  sessionUuid: string,
  userId: string | null,
  embedding: number[],
  threshold = 0.9
): Promise<{ id: string; content: string } | null> {
  const { data } = await supabase.rpc('search_memories', {
    query_embedding: embedding,
    p_session_uuid: sessionUuid,
    p_user_id: userId,
    match_count: 1,
    similarity_threshold: threshold,
  });

  return data?.[0] || null;
}

serve(async (req) => {
  try {
    const { message_id, session_uuid, user_id, content, context } = await req.json();

    // Step 1: Extract memories using LLM
    const extracted = await extractMemories(content, context);

    if (extracted.length === 0) {
      return new Response(JSON.stringify({ extracted: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Process each extracted memory
    const results = [];

    for (const memory of extracted) {
      // Skip low confidence
      if (memory.confidence < 0.7) continue;

      // Generate embedding
      const embedding = await getEmbedding(memory.content);

      // Check for similar existing memory (dedup/reinforce)
      const similar = await findSimilarMemory(session_uuid, user_id, embedding);

      if (similar) {
        // Reinforce existing memory
        await supabase.rpc('reinforce_memory', {
          p_memory_id: similar.id,
          p_new_confidence: Math.min(memory.confidence + 0.05, 1.0),
        });
        results.push({ action: 'reinforced', id: similar.id });
      } else {
        // Insert new memory
        const { data, error } = await supabase.from('user_memories').insert({
          session_uuid,
          user_id,
          memory_type: memory.type,
          category: memory.category,
          content: memory.content,
          embedding,
          confidence: memory.confidence,
          source_message_id: message_id,
          extraction_model: 'claude-3-haiku-20240307',
        }).select('id').single();

        if (!error) {
          results.push({ action: 'created', id: data.id });
        }
      }
    }

    return new Response(JSON.stringify({ extracted: results.length, results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### 4.2 Trigger: Call Edge Function After Chat

```typescript
// src/app/api/chat/route.ts (addition)

// After the chat response is complete, trigger passive profiling
async function triggerPassiveProfiler(
  messageId: string,
  sessionUuid: string,
  userId: string | null,
  content: string,
  recentMessages: Array<{ role: string; content: string }>
) {
  // Fire and forget - don't block the response
  fetch(`${process.env.SUPABASE_URL}/functions/v1/extract-memories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      message_id: messageId,
      session_uuid: sessionUuid,
      user_id: userId,
      content,
      context: recentMessages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n'),
    }),
  }).catch(console.error); // Don't throw - this is background
}
```

---

## 5. Retrieval Mechanism

### 5.1 Embedding Service

```typescript
// src/lib/embeddings.ts

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}
```

### 5.2 Memory Retrieval Service

```typescript
// src/lib/memory-retrieval.ts

import { supabase } from './supabase';
import { getEmbedding } from './embeddings';

interface RetrievedMemory {
  id: string;
  memory_type: string;
  category: string;
  content: string;
  confidence: number;
  similarity: number;
}

interface RetrievalResult {
  memories: RetrievedMemory[];
  recentHistory: Array<{ role: string; content: string }>;
  currentItinerary: Record<string, unknown> | null;
}

export async function retrieveContext(
  sessionUuid: string,
  userId: string | null,
  currentMessage: string,
  options: {
    memoryCount?: number;
    historyCount?: number;
    similarityThreshold?: number;
  } = {}
): Promise<RetrievalResult> {
  const {
    memoryCount = 5,
    historyCount = 10,
    similarityThreshold = 0.7,
  } = options;

  // Run queries in parallel
  const [embedding, historyResult, itineraryResult] = await Promise.all([
    getEmbedding(currentMessage),
    supabase
      .from('chat_messages')
      .select('role, content')
      .or(`session_uuid.eq.${sessionUuid}${userId ? `,user_id.eq.${userId}` : ''}`)
      .order('created_at', { ascending: false })
      .limit(historyCount),
    supabase
      .from('itinerary_drafts')
      .select('*')
      .eq('session_uuid', sessionUuid)
      .single(),
  ]);

  // Semantic search for relevant memories
  const { data: memories } = await supabase.rpc('search_memories', {
    query_embedding: embedding,
    p_session_uuid: sessionUuid,
    p_user_id: userId,
    match_count: memoryCount,
    similarity_threshold: similarityThreshold,
  });

  return {
    memories: memories || [],
    recentHistory: (historyResult.data || []).reverse(),
    currentItinerary: itineraryResult.data,
  };
}
```

---

## 6. Context Injection

### 6.1 Build Enhanced System Prompt

```typescript
// src/lib/context-builder.ts

import { RetrievalResult } from './memory-retrieval';

interface ContextConfig {
  maxMemoryTokens?: number;
  maxHistoryTokens?: number;
}

export function buildEnhancedSystemPrompt(
  basePrompt: string,
  retrieved: RetrievalResult,
  config: ContextConfig = {}
): string {
  const { maxMemoryTokens = 500, maxHistoryTokens = 1000 } = config;

  const sections: string[] = [basePrompt];

  // Section: User Profile from Long-Term Memory
  if (retrieved.memories.length > 0) {
    const memoryLines = retrieved.memories
      .sort((a, b) => b.confidence - a.confidence)
      .map(m => `- [${m.category}] ${m.content} (confidence: ${m.confidence.toFixed(2)})`);

    sections.push(`
## User Profile (Retrieved from Memory)
The following facts are known about this user. Prioritize these over assumptions:

${memoryLines.join('\n')}

IMPORTANT: If memory contradicts user's current request, ask for clarification.
`);
  }

  // Section: Current Trip State from Active Memory
  if (retrieved.currentItinerary) {
    const itinerary = retrieved.currentItinerary;
    const stateLines: string[] = [];

    if (itinerary.start_date) stateLines.push(`- Travel dates: ${itinerary.start_date} to ${itinerary.end_date || itinerary.start_date}`);
    if (itinerary.group_size) stateLines.push(`- Group size: ${itinerary.group_size} golfers`);
    if (itinerary.region) stateLines.push(`- Region: ${itinerary.region}`);
    if (itinerary.budget_tier) stateLines.push(`- Budget tier: ${itinerary.budget_tier}`);
    if (itinerary.selected_courses?.length) {
      stateLines.push(`- Selected courses: ${itinerary.selected_courses.map((c: any) => c.course_name).join(', ')}`);
    }
    if (itinerary.special_requirements?.needs_golf_cart) {
      stateLines.push(`- Special: User needs golf cart`);
    }

    if (stateLines.length > 0) {
      sections.push(`
## Current Trip Planning State
The user is building a trip with these confirmed details:

${stateLines.join('\n')}

Use Active Memory tools (set_trip_dates, set_group_size, etc.) to update this state when user provides new hard data.
`);
    }
  }

  // Section: Conversation Context
  if (retrieved.recentHistory.length > 0) {
    // Trim to token budget (rough estimate: 4 chars = 1 token)
    let historyText = retrieved.recentHistory
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    if (historyText.length > maxHistoryTokens * 4) {
      historyText = historyText.slice(-maxHistoryTokens * 4);
      historyText = '...(earlier conversation truncated)...\n\n' + historyText;
    }

    sections.push(`
## Recent Conversation
${historyText}
`);
  }

  return sections.join('\n\n---\n\n');
}
```

### 6.2 Updated Chat Route

```typescript
// src/app/api/chat/route.ts (updated flow)

import { retrieveContext } from '@/lib/memory-retrieval';
import { buildEnhancedSystemPrompt } from '@/lib/context-builder';
import { GOLF_OKAY_SYSTEM_PROMPT, golfOkayTools, ACTIVE_MEMORY_TOOLS } from '@/lib/tools';

export async function POST(request: Request) {
  const { messages } = await request.json();
  const sessionUuid = request.headers.get('X-Session-UUID');
  const userId = /* get from auth */ null;

  // Get the latest user message
  const latestMessage = messages[messages.length - 1];

  // Step 1: Retrieve context (memories, history, itinerary state)
  const retrieved = await retrieveContext(
    sessionUuid!,
    userId,
    latestMessage.content
  );

  // Step 2: Build enhanced system prompt
  const systemPrompt = buildEnhancedSystemPrompt(
    GOLF_OKAY_SYSTEM_PROMPT,
    retrieved
  );

  // Step 3: Call Claude with enhanced context
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    tools: [...golfOkayTools, ...ACTIVE_MEMORY_TOOLS],
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  });

  // Step 4: Handle tool calls (including Active Memory tools)
  // ... tool execution loop ...

  // Step 5: Store the conversation
  const messageId = await storeMessage(sessionUuid!, userId, latestMessage);

  // Step 6: Trigger passive profiler (async, non-blocking)
  triggerPassiveProfiler(
    messageId,
    sessionUuid!,
    userId,
    latestMessage.content,
    retrieved.recentHistory
  );

  // Step 7: Return streaming response
  // ...
}
```

---

## 7. Realtime UI Updates

### 7.1 Supabase Realtime Subscription

When Active Memory tools update `itinerary_drafts`, the UI should reflect changes instantly without polling.

```typescript
// src/hooks/useRealtimeItinerary.ts

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/context/SessionContext';

interface ItineraryDraft {
  id: string;
  session_uuid: string;
  start_date?: string;
  end_date?: string;
  group_size?: number;
  region?: string;
  selected_courses?: Array<{ course_id: string; course_name: string }>;
  budget_tier?: string;
  transport_config?: Record<string, unknown>;
  special_requirements?: Record<string, unknown>;
  updated_at: string;
}

export function useRealtimeItinerary() {
  const { sessionUuid } = useSession();
  const [draft, setDraft] = useState<ItineraryDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionUuid) return;

    // Initial fetch
    supabase
      .from('itinerary_drafts')
      .select('*')
      .eq('session_uuid', sessionUuid)
      .single()
      .then(({ data }) => {
        setDraft(data);
        setIsLoading(false);
      });

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`draft_${sessionUuid}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'itinerary_drafts',
          filter: `session_uuid=eq.${sessionUuid}`,
        },
        (payload) => {
          console.log('[Realtime] Itinerary updated:', payload);

          if (payload.eventType === 'DELETE') {
            setDraft(null);
          } else {
            setDraft(payload.new as ItineraryDraft);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionUuid]);

  return { draft, isLoading };
}
```

### 7.2 Integration with Chat UI

```typescript
// src/components/chat/ChatArea.tsx (example integration)

import { useRealtimeItinerary } from '@/hooks/useRealtimeItinerary';
import { TripSummaryCard } from '@/components/generative-ui/TripSummaryCard';

export function ChatArea() {
  const { draft } = useRealtimeItinerary();

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto">
        {/* ... messages ... */}
      </div>

      {/* Floating Trip Summary - updates in realtime */}
      {draft && (
        <div className="sticky bottom-20 mx-4">
          <TripSummaryCard
            dates={draft.start_date ? `${draft.start_date} - ${draft.end_date}` : undefined}
            groupSize={draft.group_size}
            region={draft.region}
            coursesCount={draft.selected_courses?.length || 0}
            budgetTier={draft.budget_tier}
          />
        </div>
      )}

      {/* Chat input */}
      <ChatInput />
    </div>
  );
}
```

### 7.3 Enable Realtime in Supabase

```sql
-- Enable realtime for itinerary_drafts table
ALTER PUBLICATION supabase_realtime ADD TABLE itinerary_drafts;

-- Optional: Enable for user_memories if you want live memory indicators
ALTER PUBLICATION supabase_realtime ADD TABLE user_memories;
```

---

## 8. Error Handling & Edge Cases

### 8.1 Embedding Failures

```typescript
// src/lib/embeddings.ts

export async function getEmbeddingSafe(text: string): Promise<number[] | null> {
  try {
    return await getEmbedding(text);
  } catch (error) {
    console.error('Embedding failed, falling back to no semantic search:', error);
    return null;
  }
}

// In retrieval, gracefully degrade
if (!embedding) {
  // Fall back to most recent memories instead of semantic search
  const { data: memories } = await supabase
    .from('user_memories')
    .select('*')
    .or(`session_uuid.eq.${sessionUuid}${userId ? `,user_id.eq.${userId}` : ''}`)
    .order('created_at', { ascending: false })
    .limit(5);
}
```

### 8.2 Contradiction Handling

```typescript
// In extraction prompt, add:
const CONTRADICTION_RULES = `
If you detect a contradiction with known memories:
1. Extract the NEW preference with category "update"
2. Flag for human review if high-stakes (budget, health)
3. Don't overwrite - let the system handle merge logic

Example:
- Existing memory: "User prefers luxury courses"
- New message: "Actually, I'm on a tight budget this time"
- Extract: { type: "preference", category: "budget", content: "User is budget-conscious for THIS trip", confidence: 0.7, is_temporary: true }
`;
```

### 8.3 Rate Limiting & Cost Control

```typescript
// src/lib/memory-config.ts

export const MEMORY_CONFIG = {
  // Extraction limits
  maxExtractionsPerHour: 100,
  maxExtractionsPerSession: 50,

  // Cost control
  skipExtractionIfTokensLow: true,
  minMessageLengthForExtraction: 20, // Skip "yes", "no", "ok"

  // Retrieval limits
  maxMemoriesPerQuery: 10,
  maxHistoryMessages: 20,

  // Cleanup
  memoryExpiryDays: 365,
  sessionExpiryDays: 30,
};

// Check before extraction
async function shouldExtract(sessionUuid: string, content: string): Promise<boolean> {
  // Skip short messages
  if (content.length < MEMORY_CONFIG.minMessageLengthForExtraction) {
    return false;
  }

  // Check rate limit
  const { count } = await supabase
    .from('user_memories')
    .select('*', { count: 'exact', head: true })
    .eq('session_uuid', sessionUuid)
    .gte('created_at', new Date(Date.now() - 3600000).toISOString());

  return (count || 0) < MEMORY_CONFIG.maxExtractionsPerHour;
}
```

---

## 9. Cost Analysis

### Per-Message Costs (Worst Case)

| Component | Model | Tokens | Cost |
|-----------|-------|--------|------|
| Main Chat | Claude Sonnet | ~2000 | ~$0.012 |
| Extraction | Claude Haiku | ~500 | ~$0.0003 |
| Embedding | text-embedding-3-small | ~100 | ~$0.00002 |
| **Total** | | | **~$0.013** |

### Optimizations Applied

1. **Classifier gate**: Skip extraction for short/simple messages → 50% reduction
2. **Static routes**: No API call for preset buttons → 30% reduction
3. **Memory caching**: Don't re-extract known facts → 20% reduction
4. **Haiku for extraction**: 10x cheaper than Sonnet

### Expected Cost Per User Session

| Scenario | Messages | Extractions | Cost |
|----------|----------|-------------|------|
| Quick browse | 5 | 1 | ~$0.05 |
| Trip planning | 15 | 5 | ~$0.15 |
| Power user | 30 | 10 | ~$0.30 |

---

## Implementation Checklist

- [x] **Database**
  - [x] Enable pgvector extension
  - [x] Create chat_messages table
  - [x] Create user_memories table
  - [x] Create session_profiles table
  - [x] Add RLS policies
  - [x] Create search_memories function
  - [x] Create merge_session_to_user function

- [x] **Identity**
  - [x] Create session.ts utility
  - [x] Create SessionContext provider
  - [x] Add X-Session-UUID header to API calls
  - [x] Implement merge workflow on auth

- [x] **Active Memory**
  - [x] Define new tools in tools.ts
  - [x] Implement tool handlers
  - [x] Update tool dispatcher
  - [ ] Test with ItineraryBuilder

- [ ] **Passive Profiler**
  - [ ] Create Edge Function
  - [ ] Deploy to Supabase
  - [ ] Add trigger in chat route
  - [ ] Test extraction quality

- [ ] **Retrieval**
  - [ ] Implement embedding service
  - [ ] Implement memory retrieval
  - [ ] Build context injection
  - [ ] Update chat route

- [ ] **Testing**
  - [ ] Unit tests for extraction
  - [ ] Integration tests for merge
  - [ ] Load testing for vector search
  - [ ] E2E test for full flow
