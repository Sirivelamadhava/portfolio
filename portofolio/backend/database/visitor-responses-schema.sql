-- Visitor Responses Table
-- Stores user responses about first visit and compares with actual tracking data
-- Run this SQL in your Supabase SQL Editor

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

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_visitor_responses_visitor_id ON visitor_responses(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_responses_response_time ON visitor_responses(response_time);
CREATE INDEX IF NOT EXISTS idx_visitor_responses_user_response ON visitor_responses(user_response);
CREATE INDEX IF NOT EXISTS idx_visitor_responses_actual_first_visit ON visitor_responses(actual_first_visit);

-- Enable RLS
ALTER TABLE visitor_responses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for user responses)
CREATE POLICY "Allow anonymous insert on visitor_responses"
  ON visitor_responses FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous select (for admin dashboard)
CREATE POLICY "Allow anonymous select on visitor_responses"
  ON visitor_responses FOR SELECT
  TO anon
  USING (true);

