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
