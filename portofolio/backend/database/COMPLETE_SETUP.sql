-- =====================================================
-- COMPLETE SUPABASE DATABASE SETUP
-- Portfolio Website - Complete Database Schema
-- =====================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project: fubudmekboxqnfzoclzw
-- 3. Navigate to SQL Editor (left sidebar)
-- 4. Click "New Query"
-- 5. Copy and paste this entire file
-- 6. Click "Run" to execute
--
-- CREDENTIALS:
-- Project URL: https://fubudmekboxqnfzoclzw.supabase.co
-- Publishable Key: sb_publishable_Km4RL8c0RYR95PPZDzhl5g_x9SblV_9
-- =====================================================

-- =====================================================
-- 1. MESSAGES TABLE (Contact Form)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_status BOOLEAN DEFAULT FALSE
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_status ON messages(read_status);

-- =====================================================
-- 2. PROFILE VIEWS TABLE (Page View Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS profile_views (
    id BIGSERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    session_id VARCHAR(255),
    visitor_id UUID,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for profile_views
CREATE INDEX IF NOT EXISTS idx_profile_views_ip_address ON profile_views(ip_address);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_visitor_id ON profile_views(visitor_id);

-- =====================================================
-- 3. VISITORS TABLE (Unique Visitor Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS visitors (
    id BIGSERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    user_agent TEXT,
    referrer TEXT,
    visitor_id UUID,
    visit_count INTEGER DEFAULT 1,
    is_bot BOOLEAN DEFAULT FALSE,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for visitors
CREATE INDEX IF NOT EXISTS idx_visitors_ip ON visitors(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitors_last_visit ON visitors(last_visit);
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON visitors(visitor_id);

-- =====================================================
-- 4. ANALYTICS TABLE (Daily Analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);

-- =====================================================
-- 5. VISITOR RESPONSES TABLE (First Visit Modal)
-- =====================================================
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

-- Indexes for visitor_responses
CREATE INDEX IF NOT EXISTS idx_visitor_responses_visitor_id ON visitor_responses(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_responses_response_time ON visitor_responses(response_time);
CREATE INDEX IF NOT EXISTS idx_visitor_responses_user_response ON visitor_responses(user_response);

-- =====================================================
-- 6. VISITS TABLE (Enhanced Tracking)
-- =====================================================
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

-- Indexes for visits
CREATE INDEX IF NOT EXISTS idx_visits_visitor_time ON visits(visitor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_visits_time ON visits(created_at);
CREATE INDEX IF NOT EXISTS idx_visits_event_type ON visits(event_type);
CREATE INDEX IF NOT EXISTS idx_visits_bot ON visits(is_bot) WHERE is_bot = false;

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to detect bots
CREATE OR REPLACE FUNCTION is_bot_user_agent(user_agent TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF user_agent IS NULL THEN
        RETURN FALSE;
    END IF;
    
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
    IF ip IS NULL OR ip = '' OR ip = 'unknown' THEN
        RETURN NULL;
    END IF;
    RETURN encode(digest(ip, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 8. VIEWS FOR ANALYTICS
-- =====================================================

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

-- =====================================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. RLS POLICIES - MESSAGES
-- =====================================================

-- Allow anonymous insert (contact form)
DROP POLICY IF EXISTS "Allow anonymous insert on messages" ON messages;
CREATE POLICY "Allow anonymous insert on messages"
    ON messages FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous select (admin dashboard)
DROP POLICY IF EXISTS "Allow anonymous select on messages" ON messages;
CREATE POLICY "Allow anonymous select on messages"
    ON messages FOR SELECT
    TO anon
    USING (true);

-- Allow anonymous update (mark as read)
DROP POLICY IF EXISTS "Allow anonymous update on messages" ON messages;
CREATE POLICY "Allow anonymous update on messages"
    ON messages FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow anonymous delete (delete messages)
DROP POLICY IF EXISTS "Allow anonymous delete on messages" ON messages;
CREATE POLICY "Allow anonymous delete on messages"
    ON messages FOR DELETE
    TO anon
    USING (true);

-- =====================================================
-- 11. RLS POLICIES - PROFILE VIEWS
-- =====================================================

DROP POLICY IF EXISTS "Allow anonymous insert on profile_views" ON profile_views;
CREATE POLICY "Allow anonymous insert on profile_views"
    ON profile_views FOR INSERT
    TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on profile_views" ON profile_views;
CREATE POLICY "Allow anonymous select on profile_views"
    ON profile_views FOR SELECT
    TO anon
    USING (true);

-- =====================================================
-- 12. RLS POLICIES - VISITORS
-- =====================================================

DROP POLICY IF EXISTS "Allow anonymous insert on visitors" ON visitors;
CREATE POLICY "Allow anonymous insert on visitors"
    ON visitors FOR INSERT
    TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on visitors" ON visitors;
CREATE POLICY "Allow anonymous select on visitors"
    ON visitors FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow anonymous update on visitors" ON visitors;
CREATE POLICY "Allow anonymous update on visitors"
    ON visitors FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 13. RLS POLICIES - ANALYTICS
-- =====================================================

DROP POLICY IF EXISTS "Allow anonymous insert on analytics" ON analytics;
CREATE POLICY "Allow anonymous insert on analytics"
    ON analytics FOR INSERT
    TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on analytics" ON analytics;
CREATE POLICY "Allow anonymous select on analytics"
    ON analytics FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow anonymous update on analytics" ON analytics;
CREATE POLICY "Allow anonymous update on analytics"
    ON analytics FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 14. RLS POLICIES - VISITOR RESPONSES
-- =====================================================

DROP POLICY IF EXISTS "Allow anonymous insert on visitor_responses" ON visitor_responses;
CREATE POLICY "Allow anonymous insert on visitor_responses"
    ON visitor_responses FOR INSERT
    TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on visitor_responses" ON visitor_responses;
CREATE POLICY "Allow anonymous select on visitor_responses"
    ON visitor_responses FOR SELECT
    TO anon
    USING (true);

-- =====================================================
-- 15. RLS POLICIES - VISITS
-- =====================================================

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

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- Your database is now ready to use!
-- 
-- Tables created:
-- ✅ messages - Contact form submissions
-- ✅ profile_views - Page view tracking
-- ✅ visitors - Unique visitor tracking
-- ✅ analytics - Daily analytics data
-- ✅ visitor_responses - First visit modal responses
-- ✅ visits - Enhanced tracking with UUID
--
-- Next steps:
-- 1. Test your contact form
-- 2. Check admin.html to view messages and analytics
-- 3. For production, consider restricting SELECT policies to authenticated users
--
-- =====================================================

