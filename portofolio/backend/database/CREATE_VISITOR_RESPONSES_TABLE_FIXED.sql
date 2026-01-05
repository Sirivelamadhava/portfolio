-- ============================================
-- CREATE VISITOR RESPONSES TABLE (FIXED VERSION)
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Step 1: Drop table if it exists (to start fresh)
-- Remove the DROP TABLE line below if you want to keep existing data
-- DROP TABLE IF EXISTS visitor_responses CASCADE;

-- Step 2: Create the visitor_responses table
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

-- Step 3: Add visitor_name column if it doesn't exist (in case table was created earlier)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'visitor_name'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN visitor_name VARCHAR(100);
    END IF;
END $$;

-- Step 4: Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_visitor_responses_visitor_id ON visitor_responses(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_responses_response_time ON visitor_responses(response_time DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_responses_user_response ON visitor_responses(user_response);
CREATE INDEX IF NOT EXISTS idx_visitor_responses_actual_first_visit ON visitor_responses(actual_first_visit);

-- Step 5: Enable Row Level Security (RLS)
ALTER TABLE visitor_responses ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow anonymous insert on visitor_responses" ON visitor_responses;
DROP POLICY IF EXISTS "Allow anonymous select on visitor_responses" ON visitor_responses;
DROP POLICY IF EXISTS "Allow service role full access on visitor_responses" ON visitor_responses;

-- Step 7: Create RLS policies for anonymous access
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

-- Step 8: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON visitor_responses TO anon;
GRANT ALL ON visitor_responses TO service_role;

-- Step 9: Verify table was created
SELECT 
    'Table created successfully!' AS status,
    COUNT(*) AS current_rows
FROM visitor_responses;

-- ============================================
-- VERIFICATION QUERIES
-- Run these separately to verify everything is set up correctly
-- ============================================

-- Check if table exists
SELECT 
    table_name,
    'Exists' AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'visitor_responses';

-- Check all columns in the table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'visitor_responses'
ORDER BY ordinal_position;

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

