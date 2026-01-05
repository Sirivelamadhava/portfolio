-- Improved Tracking Schema with UUID visitor_id
-- This schema implements server-side tracking with UUID v4 visitor_id
-- Run this SQL in your Supabase SQL Editor

-- Main visits table for all tracking events
CREATE TABLE IF NOT EXISTS visits (
  id BIGSERIAL PRIMARY KEY,
  visitor_id UUID NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'pageview',
  url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT, -- hash(ip) for privacy - avoid storing raw IP
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_visits_visitor_time ON visits(visitor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_visits_time ON visits(created_at);
CREATE INDEX IF NOT EXISTS idx_visits_event_type ON visits(event_type);
CREATE INDEX IF NOT EXISTS idx_visits_bot ON visits(is_bot) WHERE is_bot = false;

-- Keep existing tables for backward compatibility
-- (you can migrate data from old tables to new visits table)

-- Update visitors table to include visitor_id
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS visitor_id UUID;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE;

-- Update profile_views to include visitor_id
ALTER TABLE profile_views ADD COLUMN IF NOT EXISTS visitor_id UUID;

-- Function to detect bots (can be enhanced)
CREATE OR REPLACE FUNCTION is_bot_user_agent(user_agent TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_agent IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Common bot patterns
  RETURN user_agent ILIKE '%bot%' OR
         user_agent ILIKE '%crawler%' OR
         user_agent ILIKE '%spider%' OR
         user_agent ILIKE '%scraper%' OR
         user_agent ILIKE '%curl%' OR
         user_agent ILIKE '%python%' OR
         user_agent ILIKE '%wget%' OR
         user_agent = '';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to hash IP address (for privacy)
CREATE OR REPLACE FUNCTION hash_ip(ip TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Simple hash - in production use SHA256
  IF ip IS NULL OR ip = '' OR ip = 'unknown' THEN
    RETURN NULL;
  END IF;
  RETURN encode(digest(ip, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- View for unique visitors in last 30 days
CREATE OR REPLACE VIEW unique_visitors_30d AS
SELECT COUNT(DISTINCT visitor_id) AS unique_visitors
FROM visits
WHERE created_at >= now() - interval '30 days'
AND is_bot = false;

-- View for total pageviews
CREATE OR REPLACE VIEW total_pageviews AS
SELECT COUNT(*) AS total_views
FROM visits
WHERE event_type = 'pageview'
AND is_bot = false;

-- Enable RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for tracking)
CREATE POLICY "Allow anonymous insert on visits"
  ON visits FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous select (for admin dashboard)
CREATE POLICY "Allow anonymous select on visits"
  ON visits FOR SELECT
  TO anon
  USING (true);

-- Note: For production, restrict SELECT to authenticated admin users only

