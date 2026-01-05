-- ============================================
-- FIX VISITOR_RESPONSES TABLE - Complete Solution
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================

-- Step 1: Check current table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'visitor_responses'
ORDER BY ordinal_position;

-- Step 2: Add missing columns (safe - won't error if they exist)
DO $$ 
BEGIN
    -- Add visitor_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'visitor_name'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN visitor_name VARCHAR(100);
        RAISE NOTICE '✅ Added visitor_name column';
    ELSE
        RAISE NOTICE 'ℹ️ visitor_name column already exists';
    END IF;
    
    -- Add session_id column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'session_id'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN session_id VARCHAR(255);
        RAISE NOTICE '✅ Added session_id column';
    END IF;
    
    -- Add ip_address column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN ip_address VARCHAR(45);
        RAISE NOTICE '✅ Added ip_address column';
    END IF;
    
    -- Add user_agent column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN user_agent TEXT;
        RAISE NOTICE '✅ Added user_agent column';
    END IF;
    
    -- Add response_time column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'response_time'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN response_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE '✅ Added response_time column';
    END IF;
    
    -- Add created_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE '✅ Added created_at column';
    END IF;
END $$;

-- Step 3: Ensure RLS is enabled
ALTER TABLE visitor_responses ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Allow anonymous insert on visitor_responses" ON visitor_responses;
DROP POLICY IF EXISTS "Allow anonymous select on visitor_responses" ON visitor_responses;
DROP POLICY IF EXISTS "Allow service role full access on visitor_responses" ON visitor_responses;

-- Create policies
CREATE POLICY "Allow anonymous insert on visitor_responses"
  ON visitor_responses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select on visitor_responses"
  ON visitor_responses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service role full access on visitor_responses"
  ON visitor_responses FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 5: Verify final table structure
SELECT 
    'Final Table Structure' AS info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'visitor_responses'
ORDER BY ordinal_position;

-- Step 6: Test insert (optional - uncomment to test)
/*
INSERT INTO visitor_responses (
    visitor_id,
    visitor_name,
    user_response,
    actual_first_visit,
    session_id,
    ip_address,
    user_agent,
    response_time
) VALUES (
    'test_' || EXTRACT(EPOCH FROM NOW())::text,
    'Test User',
    true,
    true,
    'test_session',
    '127.0.0.1',
    'Test Browser',
    NOW()
) RETURNING *;
*/

-- Step 7: Show current data count
SELECT 
    'Data Status' AS info,
    COUNT(*) AS total_responses,
    COUNT(DISTINCT visitor_id) AS unique_visitors,
    COUNT(*) FILTER (WHERE visitor_name IS NOT NULL AND visitor_name != '') AS with_names
FROM visitor_responses;

