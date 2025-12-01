-- Chats Table Migration
-- Creates a chats table to store distinct conversation threads
-- Similar to Claude's chat history feature

-- =====================================================
-- Table: chats
-- Purpose: Store distinct conversation threads
-- =====================================================
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identity (one or both will be set)
  session_uuid UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Chat metadata
  title TEXT, -- Auto-generated from first message or user-defined

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chats
CREATE INDEX idx_chats_session ON chats(session_uuid);
CREATE INDEX idx_chats_user ON chats(user_id);
CREATE INDEX idx_chats_updated ON chats(updated_at DESC);

-- Composite index for retrieval queries
CREATE INDEX idx_chats_identity_time
ON chats(session_uuid, user_id, updated_at DESC);

-- =====================================================
-- Alter chat_messages: Add chat_id column
-- =====================================================
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES chats(id) ON DELETE CASCADE;

-- Index for chat_id
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat ON chat_messages(chat_id);

-- =====================================================
-- Function: Update chat updated_at on new message
-- =====================================================
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.chat_id IS NOT NULL THEN
    UPDATE chats SET updated_at = NOW() WHERE id = NEW.chat_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update chat timestamp
DROP TRIGGER IF EXISTS trigger_update_chat_timestamp ON chat_messages;
CREATE TRIGGER trigger_update_chat_timestamp
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_timestamp();

-- =====================================================
-- RLS Policies for chats table
-- =====================================================
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own chats (by user_id or session_uuid)
CREATE POLICY "Users can view own chats" ON chats
FOR SELECT
USING (
  user_id = auth.uid()
  OR session_uuid = (current_setting('request.headers', true)::json->>'x-session-uuid')::uuid
);

-- Policy: Users can insert their own chats
CREATE POLICY "Users can create chats" ON chats
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR user_id IS NULL
);

-- Policy: Users can update their own chats
CREATE POLICY "Users can update own chats" ON chats
FOR UPDATE
USING (
  user_id = auth.uid()
  OR session_uuid = (current_setting('request.headers', true)::json->>'x-session-uuid')::uuid
);

-- Policy: Users can delete their own chats
CREATE POLICY "Users can delete own chats" ON chats
FOR DELETE
USING (
  user_id = auth.uid()
  OR session_uuid = (current_setting('request.headers', true)::json->>'x-session-uuid')::uuid
);

-- =====================================================
-- Function: Merge chats from session to user on auth
-- =====================================================
CREATE OR REPLACE FUNCTION merge_chats_to_user(
  p_session_uuid UUID,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  -- Update chats to belong to user
  UPDATE chats
  SET user_id = p_user_id
  WHERE session_uuid = p_session_uuid
    AND user_id IS NULL;

  -- Update chat_messages to belong to user
  UPDATE chat_messages
  SET user_id = p_user_id
  WHERE session_uuid = p_session_uuid
    AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE chats IS 'Stores distinct conversation threads for chat history';
COMMENT ON COLUMN chats.title IS 'Auto-generated from first message or user-defined title';
COMMENT ON COLUMN chats.session_uuid IS 'Session UUID for anonymous users';
COMMENT ON COLUMN chats.user_id IS 'User ID for authenticated users';
