-- Golf Okay Database Schema
-- Run this in the Supabase SQL Editor

-- Create courses table
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('bangkok', 'phuket', 'hua_hin', 'chiang_mai', 'pattaya')),
  location TEXT NOT NULL,
  par INTEGER NOT NULL,
  yardage INTEGER NOT NULL,
  holes INTEGER NOT NULL CHECK (holes IN (9, 18)),
  tags TEXT[] DEFAULT '{}',
  hero_image TEXT,
  description TEXT,
  green_fee JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX idx_courses_region ON courses(region);
CREATE INDEX idx_courses_tags ON courses USING GIN(tags);

-- Enable Row Level Security (public read access)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON courses
  FOR SELECT
  USING (true);

-- Seed data with expanded course list (15 courses across regions)
INSERT INTO courses (name, region, location, par, yardage, holes, tags, hero_image, description, green_fee) VALUES

-- Bangkok Region (5 courses)
('Thai Country Club', 'bangkok', 'Bangkok, Thailand', 72, 7166, 18,
 ARRAY['championship', 'night_golf', 'lpga_host'],
 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80',
 'Home to the Honda LPGA Thailand, Thai Country Club is one of the most prestigious courses in Southeast Asia with immaculate conditions year-round. Features challenging water hazards and fast bentgrass greens.',
 '{"weekday": {"guest": 180, "member": 140}, "weekend": {"guest": 220, "member": 180}}'::jsonb),

('Alpine Golf Club', 'bangkok', 'Pathum Thani, Thailand', 72, 7135, 18,
 ARRAY['championship', 'scenic', 'asian_tour'],
 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80',
 'A world-class championship course that has hosted multiple Asian Tour events. Known for its challenging layout, strategic bunkering, and pristine fairway conditions throughout the year.',
 '{"weekday": {"guest": 160, "member": 120}, "weekend": {"guest": 200, "member": 160}}'::jsonb),

('Nikanti Golf Club', 'bangkok', 'Nakhon Pathom, Thailand', 72, 7266, 18,
 ARRAY['championship', 'scenic', 'design_award'],
 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
 'An award-winning 18-hole championship course designed to challenge golfers of all skill levels. Unique single-loop design ensures no waiting. Features pristine Paspalum grass and stunning lake views.',
 '{"weekday": {"guest": 175, "member": 135}, "weekend": {"guest": 215, "member": 175}}'::jsonb),

('Riverdale Golf Club', 'bangkok', 'Pathum Thani, Thailand', 72, 7004, 18,
 ARRAY['scenic', 'night_golf', 'value'],
 'https://images.unsplash.com/photo-1600005082509-d8ed5d1d9dc5?w=800&q=80',
 'A beautifully landscaped course along the Chao Phraya River. Offers night golf under excellent lighting. Great value for quality course conditions and scenic river views.',
 '{"weekday": {"guest": 95, "member": 70}, "weekend": {"guest": 130, "member": 95}}'::jsonb),

('Royal Gems Golf City', 'bangkok', 'Nakhon Pathom, Thailand', 72, 7050, 18,
 ARRAY['resort', 'night_golf', 'beginner_friendly'],
 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&q=80',
 'A resort-style golf complex with 45 holes to choose from. Perfect for groups of all skill levels. Features on-site accommodation and excellent practice facilities.',
 '{"weekday": {"guest": 85, "member": 60}, "weekend": {"guest": 110, "member": 85}}'::jsonb),

-- Phuket Region (4 courses)
('Blue Canyon Country Club', 'phuket', 'Phuket, Thailand', 72, 7179, 18,
 ARRAY['championship', 'scenic', 'johnnie_walker'],
 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80',
 'Two world-renowned courses carved through a former tin mine and rubber plantation. The Canyon Course is consistently ranked among Asia''s best, having hosted the Johnnie Walker Classic three times.',
 '{"weekday": {"guest": 190, "member": 150}, "weekend": {"guest": 240, "member": 190}}'::jsonb),

('Laguna Golf Phuket', 'phuket', 'Phuket, Thailand', 71, 6815, 18,
 ARRAY['resort', 'scenic', 'family_friendly'],
 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80',
 'Located within the Laguna resort complex, this Paul Jansen-designed course features stunning lagoon and mountain views. Perfect for resort guests with easy access to beaches and dining.',
 '{"weekday": {"guest": 165, "member": 125}, "weekend": {"guest": 195, "member": 165}}'::jsonb),

('Red Mountain Golf Club', 'phuket', 'Phuket, Thailand', 72, 6900, 18,
 ARRAY['championship', 'scenic', 'dramatic'],
 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
 'Built on a former tin mine, Red Mountain offers some of the most dramatic elevation changes in Thailand. Signature red soil canyons and stunning ocean views make every hole memorable.',
 '{"weekday": {"guest": 185, "member": 145}, "weekend": {"guest": 230, "member": 185}}'::jsonb),

('Loch Palm Golf Club', 'phuket', 'Phuket, Thailand', 72, 6805, 18,
 ARRAY['scenic', 'palm_trees', 'value'],
 'https://images.unsplash.com/photo-1600005082509-d8ed5d1d9dc5?w=800&q=80',
 'A picturesque course featuring a large lake surrounded by palm trees. Well-maintained at an accessible price point. Great option for mid-handicap players looking for a scenic round.',
 '{"weekday": {"guest": 130, "member": 95}, "weekend": {"guest": 160, "member": 130}}'::jsonb),

-- Pattaya Region (3 courses)
('Siam Country Club', 'pattaya', 'Pattaya, Thailand', 72, 6907, 18,
 ARRAY['championship', 'scenic', 'lpga_host'],
 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&q=80',
 'Thailand''s most famous golf destination featuring multiple championship courses. The Old Course and Plantation Course have hosted LPGA events. Beautiful natural scenery and world-class conditions.',
 '{"weekday": {"guest": 200, "member": 160}, "weekend": {"guest": 250, "member": 200}}'::jsonb),

('Laem Chabang International', 'pattaya', 'Pattaya, Thailand', 72, 7100, 18,
 ARRAY['championship', 'jack_nicklaus', 'ocean_view'],
 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80',
 'A Jack Nicklaus-designed championship course with 27 holes offering three distinct nines. Mountain, Lake, and Valley courses provide varied challenges with stunning views of the Gulf of Thailand.',
 '{"weekday": {"guest": 150, "member": 115}, "weekend": {"guest": 185, "member": 150}}'::jsonb),

('Burapha Golf Club', 'pattaya', 'Pattaya, Thailand', 72, 6930, 18,
 ARRAY['scenic', 'value', 'beginner_friendly'],
 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80',
 'A well-maintained course offering great value in the Pattaya area. Wide fairways and forgiving rough make it ideal for recreational golfers. Beautiful landscaping with flowering trees throughout.',
 '{"weekday": {"guest": 80, "member": 55}, "weekend": {"guest": 110, "member": 80}}'::jsonb),

-- Hua Hin Region (2 courses)
('Black Mountain Golf Club', 'hua_hin', 'Hua Hin, Thailand', 72, 7343, 18,
 ARRAY['championship', 'award_winning', 'asian_tour'],
 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
 'Ranked #1 in Thailand multiple times, Black Mountain is carved through a pineapple plantation with stunning mountain backdrops. Host of the Thailand Classic and known for its immaculate conditioning.',
 '{"weekday": {"guest": 220, "member": 175}, "weekend": {"guest": 260, "member": 220}}'::jsonb),

('Banyan Golf Club', 'hua_hin', 'Hua Hin, Thailand', 72, 7217, 18,
 ARRAY['championship', 'scenic', 'mountain_view'],
 'https://images.unsplash.com/photo-1600005082509-d8ed5d1d9dc5?w=800&q=80',
 'A stunning championship course with panoramic mountain views. Each hole offers a unique challenge with strategic bunkering and water hazards. Excellent clubhouse with Thai and international cuisine.',
 '{"weekday": {"guest": 175, "member": 140}, "weekend": {"guest": 210, "member": 175}}'::jsonb),

-- Chiang Mai Region (1 course)
('Alpine Golf Resort Chiang Mai', 'chiang_mai', 'Chiang Mai, Thailand', 72, 7102, 18,
 ARRAY['championship', 'scenic', 'mountain_view'],
 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&q=80',
 'Set against the backdrop of Doi Suthep mountain, this championship course offers a cooler climate and stunning scenery. Well-designed layout challenges all skill levels with strategic hazards.',
 '{"weekday": {"guest": 140, "member": 105}, "weekend": {"guest": 175, "member": 140}}'::jsonb);

-- =====================================================
-- User Data Tables (Phase 4: Authentication)
-- =====================================================

-- Table: saved_courses
-- Purpose: Track courses saved/favorited by users
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

-- Table: itinerary_drafts
-- Purpose: Store user itinerary drafts/trip plans
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
-- Row Level Security Policies for User Data
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

-- =====================================================
-- Inquiries Table (Phase 5: Booking Flow)
-- =====================================================

-- Table: inquiries
-- Purpose: Store booking inquiries from users (both authenticated and guests)
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
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Inquiries Policies
CREATE POLICY "Users can view own inquiries"
  ON inquiries
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated users can create inquiries"
  ON inquiries
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
