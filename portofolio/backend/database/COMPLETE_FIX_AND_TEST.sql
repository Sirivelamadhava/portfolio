-- ============================================
-- COMPLETE FIX AND TEST FOR VISITOR_RESPONSES
-- Run this ENTIRE file to fix and test everything
-- ============================================

-- ============================================
-- PART 1: CHECK CURRENT STATUS
-- ============================================

-- Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'visitor_responses'
        ) THEN '✅ Table EXISTS'
        ELSE '❌ Table DOES NOT EXIST - Need to create it first'
    END AS table_status;

-- Check all columns
SELECT 
    'Current Columns' AS info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'visitor_responses'
ORDER BY ordinal_position;

-- Check RLS status
SELECT 
    'RLS Status' AS info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'visitor_responses'
        ) THEN (
            SELECT CASE 
                WHEN relforcerowsecurity THEN 'ENABLED ✅'
                ELSE 'DISABLED ❌'
            END
            FROM pg_class 
            WHERE relname = 'visitor_responses'
        )
        ELSE 'Table not found'
    END AS rls_status;

-- Check policies
SELECT 
    'Current Policies' AS info,
    policyname,
    cmd AS command,
    roles AS allowed_roles
FROM pg_policies 
WHERE tablename = 'visitor_responses';

-- Check current data count
SELECT 
    'Current Data' AS info,
    COUNT(*) AS total_rows
FROM visitor_responses;

-- ============================================
-- PART 2: FIX TABLE STRUCTURE
-- ============================================

-- Ensure table exists with all required columns
CREATE TABLE IF NOT EXISTS visitor_responses (
    id BIGSERIAL PRIMARY KEY,
    visitor_id VARCHAR(255) NOT NULL,
    visitor_name VARCHAR(100),
    user_response BOOLEAN NOT NULL,
    actual_first_visit BOOLEAN NOT NULL,
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    response_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- visitor_name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'visitor_name'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN visitor_name VARCHAR(100);
        RAISE NOTICE '✅ Added visitor_name column';
    END IF;
    
    -- session_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'session_id'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN session_id VARCHAR(255);
        RAISE NOTICE '✅ Added session_id column';
    END IF;
    
    -- ip_address
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN ip_address VARCHAR(45);
        RAISE NOTICE '✅ Added ip_address column';
    END IF;
    
    -- user_agent
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN user_agent TEXT;
        RAISE NOTICE '✅ Added user_agent column';
    END IF;
    
    -- response_time
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'response_time'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN response_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE '✅ Added response_time column';
    END IF;
    
    -- created_at
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

-- ============================================
-- PART 3: FIX RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE visitor_responses ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anonymous insert on visitor_responses" ON visitor_responses;
DROP POLICY IF EXISTS "Allow anonymous select on visitor_responses" ON visitor_responses;
DROP POLICY IF EXISTS "Allow service role full access on visitor_responses" ON visitor_responses;
DROP POLICY IF EXISTS "Enable insert for anon" ON visitor_responses;
DROP POLICY IF EXISTS "Enable select for anon" ON visitor_responses;

-- Create fresh policies
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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON visitor_responses TO anon;
GRANT ALL ON visitor_responses TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================
-- PART 4: TEST INSERT (As Anonymous User)
-- ============================================

-- Test insert with anon role (simulating what the website does)
DO $$
DECLARE
    test_id TEXT;
BEGIN
    -- Set role to anon for testing
    PERFORM set_config('request.jwt.claim.role', 'anon', true);
    
    -- Try to insert test data
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
        'test_visitor_' || EXTRACT(EPOCH FROM NOW())::text,
        'Test User - Admin Fix',
        true,
        true,
        'test_session_' || EXTRACT(EPOCH FROM NOW())::text,
        '127.0.0.1',
        'Test Browser - Admin Fix',
        NOW()
    ) RETURNING id::text INTO test_id;
    
    RAISE NOTICE '✅ Test insert SUCCESSFUL! Inserted ID: %', test_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert FAILED: %', SQLERRM;
END $$;

-- ============================================
-- PART 5: VERIFICATION
-- ============================================

-- Verify final structure
SELECT 
    '✅ Final Table Structure' AS status,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'visitor_responses'
ORDER BY ordinal_position;

-- Verify policies
SELECT 
    '✅ Policies' AS status,
    policyname AS policy_name,
    cmd AS command,
    roles AS allowed_roles
FROM pg_policies 
WHERE tablename = 'visitor_responses'
ORDER BY policyname;

-- Verify data (should show at least the test record)
SELECT 
    '✅ Data Verification' AS status,
    COUNT(*) AS total_rows,
    COUNT(DISTINCT visitor_id) AS unique_visitors,
    COUNT(*) FILTER (WHERE visitor_name IS NOT NULL AND visitor_name != '') AS with_names
FROM visitor_responses;

-- Show recent data
SELECT 
    'Recent Responses' AS info,
    id,
    LEFT(visitor_id, 20) AS visitor_id_short,
    visitor_name,
    user_response,
    actual_first_visit,
    response_time
FROM visitor_responses 
ORDER BY response_time DESC 
LIMIT 10;

