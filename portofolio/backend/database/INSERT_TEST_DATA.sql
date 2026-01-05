-- ============================================
-- INSERT TEST DATA FOR VISITOR_RESPONSES
-- Run this to add sample data for testing
-- ============================================

-- Insert test records to verify the dashboard works
INSERT INTO visitor_responses (
    visitor_id,
    visitor_name,
    user_response,
    actual_first_visit,
    session_id,
    ip_address,
    user_agent,
    response_time
) VALUES 
(
    'test_visitor_001',
    'John Doe',
    true,
    true,
    'test_session_001',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
    NOW() - INTERVAL '2 days'
),
(
    'test_visitor_002',
    'Jane Smith',
    false,
    true,
    'test_session_002',
    '192.168.1.101',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    NOW() - INTERVAL '1 day'
),
(
    'test_visitor_003',
    NULL, -- Anonymous user
    true,
    false,
    'test_session_003',
    '192.168.1.102',
    'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0',
    NOW() - INTERVAL '12 hours'
),
(
    'test_visitor_004',
    'Alice Johnson',
    true,
    true,
    'test_session_004',
    '192.168.1.103',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148',
    NOW() - INTERVAL '6 hours'
),
(
    'test_visitor_005',
    'Bob Williams',
    false,
    false,
    'test_session_005',
    '192.168.1.104',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0',
    NOW() - INTERVAL '3 hours'
),
(
    'test_visitor_006',
    NULL, -- Anonymous
    true,
    true,
    'test_session_006',
    '192.168.1.105',
    'Mozilla/5.0 (Android 13; Mobile) Chrome/120.0',
    NOW() - INTERVAL '1 hour'
),
(
    'test_visitor_007',
    'Charlie Brown',
    false,
    true,
    'test_session_007',
    '192.168.1.106',
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) Mobile/15E148',
    NOW() - INTERVAL '30 minutes'
),
(
    'test_visitor_008',
    'Diana Prince',
    true,
    false,
    'test_session_008',
    '192.168.1.107',
    'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0',
    NOW() - INTERVAL '15 minutes'
),
(
    'test_visitor_009',
    NULL, -- Anonymous
    true,
    true,
    'test_session_009',
    '192.168.1.108',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
    NOW() - INTERVAL '5 minutes'
),
(
    'test_visitor_010',
    'Eva Green',
    false,
    false,
    'test_session_010',
    '192.168.1.109',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0',
    NOW()
)
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 
    '✅ Test Data Inserted' AS status,
    COUNT(*) AS total_records,
    COUNT(DISTINCT visitor_id) AS unique_visitors,
    COUNT(*) FILTER (WHERE visitor_name IS NOT NULL AND visitor_name != '') AS with_names,
    COUNT(*) FILTER (WHERE user_response = true) AS first_time_responses,
    COUNT(*) FILTER (WHERE user_response = false) AS returning_responses
FROM visitor_responses
WHERE visitor_id LIKE 'test_visitor_%';

-- Show the test data
SELECT 
    id,
    LEFT(visitor_id, 20) AS visitor_id,
    visitor_name,
    CASE WHEN user_response THEN 'First Time' ELSE 'Returning' END AS user_said,
    CASE WHEN actual_first_visit THEN 'First Time' ELSE 'Returning' END AS actually_is,
    response_time
FROM visitor_responses
WHERE visitor_id LIKE 'test_visitor_%'
ORDER BY response_time DESC;

-- Note: After testing, you can delete test data with:
-- DELETE FROM visitor_responses WHERE visitor_id LIKE 'test_visitor_%';

