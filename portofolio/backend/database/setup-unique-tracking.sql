-- Setup Unique Visitor Tracking System
-- Run this SQL in your Supabase SQL Editor
-- This file sets up the improved tracking system with UUID visitor_id

-- Step 1: Create visits table (if not exists)
CREATE TABLE IF NOT EXISTS visits (
  id BIGSERIAL PRIMARY KEY,
  visitor_id UUID NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'pageview',
  url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_visits_visitor_time ON visits(visitor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_visits_time ON visits(created_at);
CREATE INDEX IF NOT EXISTS idx_visits_event_type ON visits(event_type);
CREATE INDEX IF NOT EXISTS idx_visits_bot ON visits(is_bot) WHERE is_bot = false;

-- Step 3: Add visitor_id columns to existing tables (for backward compatibility)
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS visitor_id UUID;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE;
ALTER TABLE profile_views ADD COLUMN IF NOT EXISTS visitor_id UUID;

-- Step 4: Create helper functions
CREATE OR REPLACE FUNCTION is_bot_user_agent(user_agent TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_agent IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN user_agent ILIKE '%bot%' 
    OR user_agent ILIKE '%crawler%' 
    OR user_agent ILIKE '%spider%' 
    OR user_agent ILIKE '%scraper%' 
    OR user_agent ILIKE '%curl%' 
    OR user_agent ILIKE '%wget%' 
    OR user_agent = '';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION hash_ip(ip TEXT)
RETURNS TEXT AS $$
BEGIN
  IF ip IS NULL OR ip = '' OR ip = 'unknown' THEN
    RETURN NULL;
  END IF;
  RETURN encode(digest(ip, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 5: Create function to get unique visitors count
CREATE OR REPLACE FUNCTION get_unique_visitors_count(days_ago INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  unique_count INTEGER;
  start_date TIMESTAMPTZ;
BEGIN
  start_date := now() - (days_ago || ' days')::INTERVAL;
  
  -- Try visits table first
  BEGIN
    SELECT COUNT(DISTINCT visitor_id) INTO unique_count
    FROM visits
    WHERE created_at >= start_date
    AND (is_bot = false OR is_bot IS NULL);
    
    IF unique_count IS NOT NULL THEN
      RETURN unique_count;
    END IF;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  
  -- Fallback: use profile_views
  BEGIN
    WITH distinct_visitors AS (
      SELECT DISTINCT 
        COALESCE(
          visitor_id::TEXT, 
          ip_address, 
          session_id
        ) AS visitor_identifier
      FROM profile_views
      WHERE viewed_at >= start_date
      AND (
        (ip_address IS NOT NULL AND ip_address != 'unknown' AND ip_address != '127.0.0.1')
        OR session_id IS NOT NULL 
        OR visitor_id IS NOT NULL
      )
    )
    SELECT COUNT(*) INTO unique_count FROM distinct_visitors;
    
    IF unique_count IS NOT NULL THEN
      RETURN unique_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Final fallback: count from visitors table
  SELECT COUNT(DISTINCT COALESCE(visitor_id::TEXT, ip_address)) INTO unique_count
  FROM visitors
  WHERE last_visit >= start_date OR first_visit >= start_date;
  
  RETURN COALESCE(unique_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create function for total unique visitors
CREATE OR REPLACE FUNCTION get_total_unique_visitors()
RETURNS INTEGER AS $$
DECLARE
  unique_count INTEGER;
BEGIN
  -- Try visits table first
  BEGIN
    SELECT COUNT(DISTINCT visitor_id) INTO unique_count
    FROM visits
    WHERE is_bot = false OR is_bot IS NULL;
    
    IF unique_count IS NOT NULL THEN
      RETURN unique_count;
    END IF;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  
  -- Fallback: profile_views
  BEGIN
    WITH distinct_visitors AS (
      SELECT DISTINCT 
        COALESCE(visitor_id::TEXT, ip_address, session_id) AS visitor_identifier
      FROM profile_views
      WHERE ip_address != 'unknown' AND ip_address != '127.0.0.1'
    )
    SELECT COUNT(*) INTO unique_count FROM distinct_visitors;
    
    IF unique_count IS NOT NULL THEN
      RETURN unique_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Final fallback
  SELECT COUNT(DISTINCT COALESCE(visitor_id::TEXT, ip_address)) INTO unique_count
  FROM visitors;
  
  RETURN COALESCE(unique_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Step 7: Enable RLS on visits table
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for visits table (if they don't exist)
DROP POLICY IF EXISTS "Allow anonymous insert on visits" ON visits;
CREATE POLICY "Allow anonymous insert on visits"
  ON visits FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on visits" ON visits;
CREATE POLICY "Allow anonymous select on visits"
  ON visits FOR SELECT
  TO anon
  USING (true);

-- Step 9: Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_unique_visitors_count(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_total_unique_visitors() TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Unique visitor tracking system setup complete!';
END $$;

