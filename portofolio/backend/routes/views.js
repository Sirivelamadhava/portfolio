/**
 * Views and Analytics API Routes
 * Handles profile view tracking and analytics
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// POST /api/views - Track profile view
router.post('/', async (req, res) => {
  try {
    const { ip_address, user_agent, referrer, session_id } = req.body;

    const sessionId = session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ipAddress = ip_address || req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = user_agent || req.get('user-agent') || 'unknown';
    const referer = referrer || req.get('referer') || 'direct';

    // Insert profile view
    const { data: viewData, error: viewError } = await supabase
      .from('profile_views')
      .insert([
        {
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referer,
          session_id: sessionId
        }
      ])
      .select()
      .single();

    if (viewError) {
      console.error('Error tracking view:', viewError);
      return res.status(500).json({
        success: false,
        message: 'Failed to track view',
        error: viewError.message
      });
    }

    // Update or insert visitor
    const uniqueVisitorId = ipAddress === 'unknown' || ipAddress === '127.0.0.1'
      ? `session_${sessionId}`
      : ipAddress;

    // Check if visitor exists
    const { data: existingVisitor } = await supabase
      .from('visitors')
      .select('id, visit_count')
      .eq('ip_address', uniqueVisitorId)
      .maybeSingle();

    if (existingVisitor) {
      // Update existing visitor
      await supabase
        .from('visitors')
        .update({
          visit_count: (existingVisitor.visit_count || 1) + 1,
          last_visit: new Date().toISOString(),
          user_agent: userAgent,
          referrer: referer
        })
        .eq('ip_address', uniqueVisitorId);
    } else {
      // Insert new visitor
      const { error: insertError } = await supabase
        .from('visitors')
        .insert({
          ip_address: uniqueVisitorId,
          user_agent: userAgent,
          referrer: referer,
          visit_count: 1
        });

      // Handle race condition
      if (insertError && insertError.code === '23505') {
        // Visitor was created between check and insert, fetch and update
        const { data: raceVisitor } = await supabase
          .from('visitors')
          .select('visit_count')
          .eq('ip_address', uniqueVisitorId)
          .single();

        if (raceVisitor) {
          await supabase
            .from('visitors')
            .update({
              visit_count: (raceVisitor.visit_count || 1) + 1,
              last_visit: new Date().toISOString(),
              user_agent: userAgent,
              referrer: referer
            })
            .eq('ip_address', uniqueVisitorId);
        }
      }
    }

    // Update analytics for today
    const today = new Date().toISOString().split('T')[0];
    await updateAnalytics(today, 'total_views');

    res.status(201).json({
      success: true,
      message: 'View tracked successfully',
      data: viewData
    });
  } catch (error) {
    console.error('Error in POST /api/views:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/views/count - Get total views count
router.get('/count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching view count:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch view count',
        error: error.message
      });
    }

    res.json({
      success: true,
      count: count || 0
    });
  } catch (error) {
    console.error('Error in GET /api/views/count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/views/analytics - Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get analytics data
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        error: analyticsError.message
      });
    }

    // Get total counts
    const { count: totalViews } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true });

    const { count: totalVisitors } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });

    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      data: {
        analytics: analyticsData || [],
        totals: {
          views: totalViews || 0,
          visitors: totalVisitors || 0,
          messages: totalMessages || 0
        }
      }
    });
  } catch (error) {
    console.error('Error in GET /api/views/analytics:', error);
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
          total_views: field === 'total_views' ? 1 : 0,
          unique_visitors: 0,
          messages_received: 0
        }, {
          onConflict: 'date'
        });
    }

    // Update unique visitors count for today
    const startOfDay = new Date(date + 'T00:00:00Z').toISOString();
    const endOfDay = new Date(date + 'T23:59:59Z').toISOString();

    const { data: uniqueViews } = await supabase
      .from('profile_views')
      .select('ip_address')
      .gte('viewed_at', startOfDay)
      .lte('viewed_at', endOfDay);

    if (uniqueViews && uniqueViews.length > 0) {
      const uniqueIPs = new Set(uniqueViews.map(v => v.ip_address).filter(ip => ip && ip !== 'unknown'));
      await supabase
        .from('analytics')
        .update({
          unique_visitors: uniqueIPs.size
        })
        .eq('date', date);
    }
  } catch (error) {
    console.error('Error updating analytics:', error);
    // Don't throw - analytics update failure shouldn't break the API
  }
}

module.exports = router;

