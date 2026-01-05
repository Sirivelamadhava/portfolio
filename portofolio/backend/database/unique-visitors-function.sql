-- Database Functions for Accurate Unique Visitor Counting
-- Run this SQL in your Supabase SQL Editor

-- Function to get unique visitors count in a time window
CREATE OR REPLACE FUNCTION get_unique_visitors_count(days_ago INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  unique_count INTEGER;
  start_date TIMESTAMPTZ;
BEGIN
  start_date := now() - (days_ago || ' days')::INTERVAL;
  
  -- Try to use visits table first (most accurate)
  BEGIN
    SELECT COUNT(DISTINCT visitor_id) INTO unique_count
    FROM visits
    WHERE created_at >= start_date
    AND (is_bot = false OR is_bot IS NULL);
    
    RETURN COALESCE(unique_count, 0);
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: use profile_views with distinct identifiers
    BEGIN
      WITH distinct_visitors AS (
        SELECT DISTINCT 
          COALESCE(visitor_id::TEXT, ip_address, session_id) AS visitor_identifier
        FROM profile_views
        WHERE viewed_at >= start_date
        AND (ip_address IS NOT NULL OR session_id IS NOT NULL OR visitor_id IS NOT NULL)
        AND ip_address != 'unknown'
        AND ip_address != '127.0.0.1'
      )
      SELECT COUNT(*) INTO unique_count FROM distinct_visitors;
      
      RETURN COALESCE(unique_count, 0);
    EXCEPTION WHEN OTHERS THEN
      -- Final fallback: count from visitors table
      SELECT COUNT(*) INTO unique_count
      FROM visitors
      WHERE last_visit >= start_date
      OR first_visit >= start_date;
      
      RETURN COALESCE(unique_count, 0);
    END;
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to get unique visitors count (all time)
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
    
    RETURN COALESCE(unique_count, 0);
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: count distinct from profile_views
    BEGIN
      WITH distinct_visitors AS (
        SELECT DISTINCT 
          COALESCE(visitor_id::TEXT, ip_address, session_id) AS visitor_identifier
        FROM profile_views
        WHERE ip_address != 'unknown'
        AND ip_address != '127.0.0.1'
      )
      SELECT COUNT(*) INTO unique_count FROM distinct_visitors;
      
      RETURN COALESCE(unique_count, 0);
    EXCEPTION WHEN OTHERS THEN
      -- Final fallback
      SELECT COUNT(*) INTO unique_count FROM visitors;
      RETURN COALESCE(unique_count, 0);
    END;
  END;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_unique_visitors_count(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_total_unique_visitors() TO anon;

