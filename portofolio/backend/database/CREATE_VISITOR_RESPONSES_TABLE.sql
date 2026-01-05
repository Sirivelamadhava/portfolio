-- ============================================
-- CREATE VISITOR RESPONSES TABLE
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Step 1: Create the visitor_responses table
CREATE TABLE IF NOT EXISTS visitor_responses (
    id BIGSERIAL PRIMARY KEY,
    visitor_id VARCHAR(255) NOT NULL,
    visitor_name VARCHAR(100), -- Optional name entered by user
    user_response BOOLEAN NOT NULL, -- What the user said (true = first time, false = returning)
    actual_first_visit BOOLEAN NOT NULL, -- What tracking data says (true = first time, false = returning)
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    response_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_visitor_responses_visitor_id ON visitor_responses(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_responses_response_time ON visitor_responses(response_time DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_responses_user_response ON visitor_responses(user_response);
CREATE INDEX IF NOT EXISTS idx_visitor_responses_actual_first_visit ON visitor_responses(actual_first_visit);
-- Note: Partial index for visitor_name only if the column exists and has non-null values
-- This index is optional and can be created separately if needed

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE visitor_responses ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow anonymous insert on visitor_responses" ON visitor_responses;
DROP POLICY IF EXISTS "Allow anonymous select on visitor_responses" ON visitor_responses;
DROP POLICY IF EXISTS "Allow service role full access on visitor_responses" ON visitor_responses;

-- Step 5: Create RLS policies for anonymous access
-- Allow anonymous users to insert their responses
CREATE POLICY "Allow anonymous insert on visitor_responses"
  ON visitor_responses FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to select (for admin dashboard)
CREATE POLICY "Allow anonymous select on visitor_responses"
  ON visitor_responses FOR SELECT
  TO anon
  USING (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access on visitor_responses"
  ON visitor_responses FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON visitor_responses TO anon;
GRANT ALL ON visitor_responses TO service_role;

-- Step 7: Verify table was created
SELECT 
    'Table created successfully!' AS status,
    COUNT(*) AS current_rows
FROM visitor_responses;

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify everything is set up correctly
-- ============================================

-- Check if table exists
SELECT 
    table_name,
    'Exists' AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'visitor_responses';

-- Check RLS policies
SELECT 
    policyname AS policy_name,
    cmd AS command,
    roles AS allowed_roles
FROM pg_policies 
WHERE tablename = 'visitor_responses';

-- Check indexes
SELECT 
    indexname AS index_name,
    indexdef AS definition
FROM pg_indexes 
WHERE tablename = 'visitor_responses'
ORDER BY indexname;

-- ============================================
-- TEST INSERT (Optional - you can delete this after testing)
-- ============================================

-- Uncomment the lines below to test insert functionality:
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
    'test_visitor_001',
    'Test User',
    true,
    true,
    'test_session_001',
    '127.0.0.1',
    'Test Browser',
    NOW()
);

-- Check if test data was inserted
SELECT * FROM visitor_responses ORDER BY response_time DESC LIMIT 5;
*/

