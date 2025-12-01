-- Inquiries Table Migration
-- Phase 5: Booking Flow
-- Run this in the Supabase SQL Editor

-- =====================================================
-- Table: inquiries
-- Purpose: Store booking inquiries from users (both authenticated and guests)
-- =====================================================
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  itinerary_draft_id UUID REFERENCES itinerary_drafts(id) ON DELETE SET NULL,
  itinerary_snapshot JSONB,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_email ON inquiries(email);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- Trigger to auto-update updated_at on inquiries
-- Reuses the update_updated_at_column() function from 002_user_data.sql
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security Policies
-- =====================================================

-- Enable RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own inquiries (by user_id or email match)
CREATE POLICY "Users can view own inquiries"
  ON inquiries
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy: Authenticated users can create inquiries
CREATE POLICY "Authenticated users can create inquiries"
  ON inquiries
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Note: Service role (API routes with service_role key) bypasses RLS
-- and can INSERT/UPDATE/DELETE any inquiry for admin operations
