-- User Data Schema Migration
-- Phase 4: Authentication & User Features
-- Run this in the Supabase SQL Editor after auth is enabled

-- =====================================================
-- Table: saved_courses
-- Purpose: Track courses saved/favorited by users
-- =====================================================
CREATE TABLE saved_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Index for faster lookups
CREATE INDEX idx_saved_courses_user_id ON saved_courses(user_id);
CREATE INDEX idx_saved_courses_course_id ON saved_courses(course_id);

-- =====================================================
-- Table: itinerary_drafts
-- Purpose: Store user itinerary drafts/trip plans
-- =====================================================
CREATE TABLE itinerary_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  draft_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX idx_itinerary_drafts_user_id ON itinerary_drafts(user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on itinerary_drafts
CREATE TRIGGER update_itinerary_drafts_updated_at
  BEFORE UPDATE ON itinerary_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security Policies
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE saved_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_drafts ENABLE ROW LEVEL SECURITY;

-- Saved Courses Policies
CREATE POLICY "Users can view own saved courses"
  ON saved_courses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save courses"
  ON saved_courses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave courses"
  ON saved_courses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Itinerary Drafts Policies
CREATE POLICY "Users can view own itinerary drafts"
  ON itinerary_drafts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create itinerary drafts"
  ON itinerary_drafts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itinerary drafts"
  ON itinerary_drafts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own itinerary drafts"
  ON itinerary_drafts
  FOR DELETE
  USING (auth.uid() = user_id);
