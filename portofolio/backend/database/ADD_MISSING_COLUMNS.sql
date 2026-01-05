-- ============================================
-- ADD MISSING COLUMNS TO VISITOR_RESPONSES TABLE
-- Run this if the table exists but is missing columns
-- ============================================

-- Add visitor_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'visitor_name'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN visitor_name VARCHAR(100);
        RAISE NOTICE 'Added visitor_name column';
    ELSE
        RAISE NOTICE 'visitor_name column already exists';
    END IF;
END $$;

-- Add session_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'session_id'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN session_id VARCHAR(255);
        RAISE NOTICE 'Added session_id column';
    ELSE
        RAISE NOTICE 'session_id column already exists';
    END IF;
END $$;

-- Add ip_address column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN ip_address VARCHAR(45);
        RAISE NOTICE 'Added ip_address column';
    ELSE
        RAISE NOTICE 'ip_address column already exists';
    END IF;
END $$;

-- Add user_agent column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN user_agent TEXT;
        RAISE NOTICE 'Added user_agent column';
    ELSE
        RAISE NOTICE 'user_agent column already exists';
    END IF;
END $$;

-- Add response_time column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'response_time'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN response_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added response_time column';
    ELSE
        RAISE NOTICE 'response_time column already exists';
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'visitor_responses' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE visitor_responses ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added created_at column';
    ELSE
        RAISE NOTICE 'created_at column already exists';
    END IF;
END $$;

-- Verify all columns now exist
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'visitor_responses'
ORDER BY ordinal_position;

