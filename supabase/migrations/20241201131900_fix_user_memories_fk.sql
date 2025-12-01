-- Fix: Remove foreign key constraint on source_message_id
-- The passive profiler generates message IDs that don't exist in chat_messages
-- since chat messages aren't persisted (yet)

ALTER TABLE user_memories
DROP CONSTRAINT IF EXISTS user_memories_source_message_id_fkey;

-- Make source_message_id nullable since it's optional
ALTER TABLE user_memories
ALTER COLUMN source_message_id DROP NOT NULL;
