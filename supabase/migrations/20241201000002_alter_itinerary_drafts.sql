-- Alter itinerary_drafts table for Active Memory tools
-- This migration adds session_uuid for anonymous users and individual columns
-- for real-time trip building via AI tools

-- Add session_uuid column for anonymous session tracking
ALTER TABLE itinerary_drafts
ADD COLUMN IF NOT EXISTS session_uuid UUID;

-- Make user_id nullable (anonymous users won't have one)
ALTER TABLE itinerary_drafts
ALTER COLUMN user_id DROP NOT NULL;

-- Add individual columns for Active Memory tools
ALTER TABLE itinerary_drafts
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS number_of_days INTEGER,
ADD COLUMN IF NOT EXISTS date_flexibility TEXT DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS group_size INTEGER,
ADD COLUMN IF NOT EXISTS group_composition TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS vibe TEXT,
ADD COLUMN IF NOT EXISTS selected_courses JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS total_budget NUMERIC,
ADD COLUMN IF NOT EXISTS per_round_budget NUMERIC,
ADD COLUMN IF NOT EXISTS budget_tier TEXT,
ADD COLUMN IF NOT EXISTS transport_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS special_requirements JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Create unique constraint on session_uuid for upsert operations
-- Only one draft per session
CREATE UNIQUE INDEX IF NOT EXISTS idx_itinerary_drafts_session_uuid
ON itinerary_drafts(session_uuid)
WHERE session_uuid IS NOT NULL;

-- Create index for session lookups
CREATE INDEX IF NOT EXISTS idx_itinerary_drafts_session
ON itinerary_drafts(session_uuid);

-- RLS policy updates for session-based access
-- Drop existing policies first, then recreate with session support
DROP POLICY IF EXISTS "Users can view own itinerary drafts" ON itinerary_drafts;
DROP POLICY IF EXISTS "Users read own drafts by session" ON itinerary_drafts;
DROP POLICY IF EXISTS "Service can insert itinerary drafts" ON itinerary_drafts;
DROP POLICY IF EXISTS "Service can update itinerary drafts" ON itinerary_drafts;

-- Create combined policy for select (user_id OR session_uuid)
CREATE POLICY "Users can view own itinerary drafts" ON itinerary_drafts
  FOR SELECT USING (
    user_id = auth.uid()
    OR session_uuid = (current_setting('request.headers', true)::json->>'x-session-uuid')::uuid
  );

-- Service role can insert (for API routes)
CREATE POLICY "Service can insert itinerary drafts" ON itinerary_drafts
  FOR INSERT WITH CHECK (true);

-- Service role can update (for API routes)
CREATE POLICY "Service can update itinerary drafts" ON itinerary_drafts
  FOR UPDATE USING (true);

-- Comment for documentation
COMMENT ON COLUMN itinerary_drafts.session_uuid IS 'Anonymous session UUID for pre-auth trip building';
COMMENT ON COLUMN itinerary_drafts.selected_courses IS 'Array of {course_id, course_name, preferred_date, tee_time_preference, added_at}';
COMMENT ON COLUMN itinerary_drafts.transport_config IS '{need_airport_transfer, need_daily_transport, vehicle_preference, pickup_location}';
COMMENT ON COLUMN itinerary_drafts.special_requirements IS '{needs_golf_cart, dietary_restrictions[], mobility_notes, other}';
