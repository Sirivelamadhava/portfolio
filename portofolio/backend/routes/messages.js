/**
 * Messages API Routes
 * Handles contact form submissions and message management
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// POST /api/messages - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          subject: subject?.trim() || 'No Subject',
          message: message.trim(),
          read_status: false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save message. Please try again later.',
        error: error.message
      });
    }

    // Update analytics for today
    const today = new Date().toISOString().split('T')[0];
    await updateAnalytics(today, 'messages_received');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: data
    });
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/messages - Get all messages
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0, read_status } = req.query;

    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Filter by read status if provided
    if (read_status !== undefined) {
      query = query.eq('read_status', read_status === 'true');
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data || [],
      count: count || data?.length || 0
    });
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/messages/:id - Get single message
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching message:', error);
      return res.status(404).json({
        success: false,
        message: 'Message not found',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error in GET /api/messages/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PATCH /api/messages/:id/read - Mark message as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { read_status = true } = req.body;

    const { data, error } = await supabase
      .from('messages')
      .update({ read_status: read_status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update message',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: data
    });
  } catch (error) {
    console.error('Error in PATCH /api/messages/:id/read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/messages/:id - Delete message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete message',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/messages/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Helper function to update analytics
async function updateAnalytics(date, field) {
  try {
    const { data: analyticsData, error: fetchError } = await supabase
      .from('analytics')
      .select('*')
      .eq('date', date)
      .single();

    if (analyticsData && !fetchError) {
      // Update existing analytics
      await supabase
        .from('analytics')
        .update({
          [field]: (analyticsData[field] || 0) + 1
        })
        .eq('date', date);
    } else {
      // Insert new analytics
      await supabase
        .from('analytics')
        .upsert({
          date: date,
          total_views: 0,
          unique_visitors: 0,
          messages_received: field === 'messages_received' ? 1 : 0
        }, {
          onConflict: 'date'
        });
    }
  } catch (error) {
    console.error('Error updating analytics:', error);
    // Don't throw - analytics update failure shouldn't break the API
  }
}

module.exports = router;

