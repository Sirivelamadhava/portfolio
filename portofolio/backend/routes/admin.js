const crypto = require('crypto');
const express = require('express');
const { adminSupabase } = require('../config/database');
const { authenticateAdmin, createAdminToken } = require('../middleware/admin-auth');

const router = express.Router();

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function isConfigured() {
  return Boolean(
    adminSupabase &&
    process.env.ADMIN_USERNAME &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_TOKEN_SECRET
  );
}

router.post('/login', (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Configure SUPABASE_SERVICE_KEY, ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_TOKEN_SECRET in backend/.env.'
    });
  }

  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string' ||
      !safeEqual(username, process.env.ADMIN_USERNAME) ||
      !safeEqual(password, process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  res.json({
    success: true,
    token: createAdminToken(username),
    expiresIn: 2 * 60 * 60
  });
});

router.use(authenticateAdmin, (req, res, next) => {
  if (!adminSupabase) {
    return res.status(503).json({
      success: false,
      message: 'Set SUPABASE_SERVICE_KEY in backend/.env to enable private admin data access.'
    });
  }
  next();
});

router.get('/messages', async (req, res) => {
  const { data, error, count } = await adminSupabase
    .from('messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 99);

  if (error) {
    console.error('Error fetching admin messages:', error);
    return res.status(500).json({ success: false, message: 'Failed to load messages.' });
  }

  res.json({ success: true, data: data || [], count: count || 0 });
});

router.get('/visitors', async (req, res) => {
  const { data, error, count } = await adminSupabase
    .from('visitors')
    .select('ip_address, user_agent, visit_count, first_visit, last_visit', { count: 'exact' })
    .order('last_visit', { ascending: false })
    .range(0, 99);

  if (error) {
    console.error('Error fetching admin visitors:', error);
    return res.status(500).json({ success: false, message: 'Failed to load visitors.' });
  }

  res.json({ success: true, data: data || [], count: count || 0 });
});

router.get('/views', async (req, res) => {
  const { data, error, count } = await adminSupabase
    .from('profile_views')
    .select('ip_address, user_agent, referrer, session_id, viewed_at', { count: 'exact' })
    .order('viewed_at', { ascending: false })
    .range(0, 99);

  if (error) {
    console.error('Error fetching admin profile views:', error);
    return res.status(500).json({ success: false, message: 'Failed to load profile views.' });
  }

  res.json({ success: true, data: data || [], count: count || 0 });
});

router.get('/visitor-responses', async (req, res) => {
  const { data, error, count } = await adminSupabase
    .from('visitor_responses')
    .select('visitor_id, visitor_name, user_response, actual_first_visit, session_id, ip_address, response_time', { count: 'exact' })
    .order('response_time', { ascending: false })
    .range(0, 999);

  if (error) {
    console.error('Error fetching admin visitor responses:', error);
    return res.status(500).json({ success: false, message: 'Failed to load visitor responses.' });
  }

  res.json({ success: true, data: data || [], count: count || 0 });
});

router.get('/online-users', async (req, res) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const [viewsResult, responsesResult] = await Promise.all([
    adminSupabase
      .from('profile_views')
      .select('ip_address, viewed_at, referrer, user_agent, session_id')
      .gte('viewed_at', fiveMinutesAgo)
      .order('viewed_at', { ascending: false })
      .limit(1000),
    adminSupabase
      .from('visitor_responses')
      .select('visitor_id, ip_address, visitor_name, session_id')
      .order('response_time', { ascending: false })
      .limit(1000)
  ]);

  if (viewsResult.error || responsesResult.error) {
    console.error('Error fetching admin online users:', viewsResult.error || responsesResult.error);
    return res.status(500).json({ success: false, message: 'Failed to load online users.' });
  }

  res.json({
    success: true,
    data: {
      views: viewsResult.data || [],
      responses: responsesResult.data || []
    }
  });
});

router.patch('/messages/:id/read', async (req, res) => {
  const { error } = await adminSupabase
    .from('messages')
    .update({ read_status: req.body.read_status !== false })
    .eq('id', req.params.id);

  if (error) {
    console.error('Error updating admin message:', error);
    return res.status(500).json({ success: false, message: 'Failed to update message.' });
  }

  res.json({ success: true, message: 'Message updated successfully.' });
});

router.delete('/messages/:id', async (req, res) => {
  const { error } = await adminSupabase
    .from('messages')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    console.error('Error deleting admin message:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }

  res.json({ success: true, message: 'Message deleted successfully.' });
});

module.exports = router;
