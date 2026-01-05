-- ============================================
-- CHECK VISITOR_RESPONSES TABLE STRUCTURE
-- Run this to verify your table has all required columns
-- ============================================

-- Check if table exists
SELECT 
    'Table Status' AS check_type,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'visitor_responses'
        ) THEN '✅ Table EXISTS'
        ELSE '❌ Table DOES NOT EXIST'
    END AS status;

-- Check all columns in the table
SELECT 
    'Column Check' AS check_type,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'visitor_responses'
ORDER BY ordinal_position;

-- Check if visitor_name column exists
SELECT 
    'visitor_name Column' AS check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'visitor_responses' 
            AND column_name = 'visitor_name'
        ) THEN '✅ visitor_name column EXISTS'
        ELSE '❌ visitor_name column MISSING - Run ADD_COLUMN script'
    END AS status;

-- Count current rows
SELECT 
    'Data Count' AS check_type,
    COUNT(*) AS total_rows
FROM visitor_responses;

-- Show sample data (if any)
SELECT 
    'Sample Data' AS check_type,
    id,
    visitor_id,
    visitor_name,
    user_response,
    actual_first_visit,
    response_time
FROM visitor_responses 
ORDER BY response_time DESC 
LIMIT 5;

