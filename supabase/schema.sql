-- Florida Pickleball Tournaments Database Schema
-- Run this in your Supabase SQL Editor

-- Regions enum
CREATE TYPE florida_region AS ENUM (
  'South Florida',
  'Central Florida',
  'Tampa Bay',
  'North Florida',
  'Panhandle'
);

-- Skill levels enum
CREATE TYPE skill_level AS ENUM (
  'Amateur',
  'Intermediate',
  'Pro/Open',
  'Seniors (50+)',
  'All Levels'
);

-- Organizers table
CREATE TABLE organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  bio TEXT,
  verified BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Venues table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  county TEXT,
  region florida_region NOT NULL,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  court_count INTEGER,
  indoor BOOLEAN DEFAULT false,
  outdoor BOOLEAN DEFAULT true,
  surface_type TEXT,
  amenities TEXT[],
  photo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tournaments table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  registration_deadline DATE,
  venue_id UUID REFERENCES venues(id),
  organizer_id UUID REFERENCES organizers(id),
  city TEXT NOT NULL,
  county TEXT,
  region florida_region NOT NULL,
  level skill_level NOT NULL DEFAULT 'All Levels',
  categories TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  featured_until DATE,
  registration_url TEXT,
  entry_fee_min DECIMAL(8,2),
  entry_fee_max DECIMAL(8,2),
  max_participants INTEGER,
  format TEXT,
  prize_pool TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('pending', 'upcoming', 'active', 'completed', 'cancelled')),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'premium')),
  results_url TEXT,
  results_summary TEXT,
  click_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Newsletter subscribers
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  region florida_region,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  active BOOLEAN DEFAULT true
);

-- Partners / Sponsors
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'premium', 'title')),
  active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Registration click tracking
CREATE TABLE registration_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT now(),
  referrer TEXT,
  user_agent TEXT
);

-- Create indexes
CREATE INDEX idx_tournaments_date ON tournaments(date_start);
CREATE INDEX idx_tournaments_region ON tournaments(region);
CREATE INDEX idx_tournaments_featured ON tournaments(featured) WHERE featured = true;
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_slug ON tournaments(slug);
CREATE INDEX idx_venues_region ON venues(region);

-- Enable Row Level Security
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_clicks ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view published data)
CREATE POLICY "Public can view organizers" ON organizers
  FOR SELECT USING (true);

CREATE POLICY "Public can view venues" ON venues
  FOR SELECT USING (true);

CREATE POLICY "Public can view non-pending tournaments" ON tournaments
  FOR SELECT USING (status != 'pending');

CREATE POLICY "Public can view active partners" ON partners
  FOR SELECT USING (active = true);

-- Insert policies for registration clicks (anyone can create clicks)
CREATE POLICY "Anyone can create registration clicks" ON registration_clicks
  FOR INSERT WITH CHECK (true);

-- Insert policies for subscribers (anyone can subscribe)
CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Admin policies (will be expanded when auth is implemented)
-- For now, allow authenticated users to manage data
CREATE POLICY "Authenticated users can manage organizers" ON organizers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage venues" ON venues
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage tournaments" ON tournaments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage partners" ON partners
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view subscribers" ON subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view registration clicks" ON registration_clicks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizers_updated_at
  BEFORE UPDATE ON organizers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
