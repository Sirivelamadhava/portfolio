-- Portfolio Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Table for storing contact messages
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_status BOOLEAN DEFAULT FALSE
);

-- Create index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Table for tracking profile views
CREATE TABLE IF NOT EXISTS profile_views (
    id BIGSERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    session_id VARCHAR(255),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for profile_views
CREATE INDEX IF NOT EXISTS idx_profile_views_ip_address ON profile_views(ip_address);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);

-- Table for tracking unique visitors
CREATE TABLE IF NOT EXISTS visitors (
    id BIGSERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    user_agent TEXT,
    referrer TEXT,
    visit_count INTEGER DEFAULT 1,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for visitors
CREATE INDEX IF NOT EXISTS idx_visitors_ip ON visitors(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitors_last_visit ON visitors(last_visit);

-- Table for daily analytics
CREATE TABLE IF NOT EXISTS analytics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0
);

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous inserts and selects
-- These policies allow anyone to insert data (for contact form and view tracking)
-- and read data (for admin dashboard - you may want to restrict this in production)

-- Messages policies
CREATE POLICY "Allow anonymous insert on messages"
    ON messages FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous select on messages"
    ON messages FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous update on messages"
    ON messages FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on messages"
    ON messages FOR DELETE
    TO anon
    USING (true);

-- Profile views policies
CREATE POLICY "Allow anonymous insert on profile_views"
    ON profile_views FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous select on profile_views"
    ON profile_views FOR SELECT
    TO anon
    USING (true);

-- Visitors policies
CREATE POLICY "Allow anonymous insert on visitors"
    ON visitors FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous select on visitors"
    ON visitors FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous update on visitors"
    ON visitors FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Analytics policies
CREATE POLICY "Allow anonymous insert on analytics"
    ON analytics FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous select on analytics"
    ON analytics FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous update on analytics"
    ON analytics FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Note: For production, you may want to:
-- 1. Restrict SELECT policies to authenticated users only
-- 2. Create a service role key for admin operations
-- 3. Use Supabase Auth for admin dashboard authentication
-- 4. Consider using Supabase Functions for server-side operations

