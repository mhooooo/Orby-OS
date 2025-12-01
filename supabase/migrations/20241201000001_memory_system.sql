-- Memory System Migration
-- Memory Architecture - Phases 7-8
-- Run this in the Supabase SQL Editor

-- =====================================================
-- Extension: pgvector for semantic search
-- =====================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- Table: chat_messages
-- Purpose: Short-term memory - raw conversation history
-- =====================================================
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

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

-- Indexes for chat_messages
CREATE INDEX idx_chat_messages_session ON chat_messages(session_uuid);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

-- Composite index for retrieval queries
CREATE INDEX idx_chat_messages_identity_time
ON chat_messages(session_uuid, user_id, created_at DESC);

-- =====================================================
-- Table: user_memories
-- Purpose: Long-term memory with embeddings for semantic search
-- =====================================================
CREATE TABLE user_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

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

-- Standard indexes for user_memories
CREATE INDEX idx_user_memories_session ON user_memories(session_uuid);
CREATE INDEX idx_user_memories_user ON user_memories(user_id);
CREATE INDEX idx_user_memories_type ON user_memories(memory_type);
CREATE INDEX idx_user_memories_category ON user_memories(category);

-- Composite for identity lookups
CREATE INDEX idx_user_memories_identity
ON user_memories(session_uuid, user_id);

-- Trigger to auto-update updated_at on user_memories
-- Reuses the update_updated_at_column() function from 002_user_data.sql
CREATE TRIGGER update_user_memories_updated_at
  BEFORE UPDATE ON user_memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: session_profiles
-- Purpose: Session metadata for analytics and merge operations
-- =====================================================
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

-- =====================================================
-- Row Level Security Policies
-- =====================================================

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

-- =====================================================
-- Database Functions
-- =====================================================

-- ============================================
-- Function: search_memories
-- Purpose: Semantic search for relevant memories
-- ============================================
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
    -- Exclude archived memories
    AND um.memory_type != 'archived'
  ORDER BY um.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- Function: merge_session_to_user
-- Purpose: Merge session data to user account on login
-- ============================================
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

-- ============================================
-- Function: reinforce_memory
-- Purpose: Increment reinforcement count and update confidence
-- ============================================
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

-- =====================================================
-- Enable Realtime
-- =====================================================

-- Enable realtime for itinerary_drafts table (already exists from Phase 5)
ALTER PUBLICATION supabase_realtime ADD TABLE itinerary_drafts;

-- Enable realtime for user_memories (optional - for live memory indicators)
ALTER PUBLICATION supabase_realtime ADD TABLE user_memories;
