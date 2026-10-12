/**
 * Supabase Database Configuration
 * Connects to Supabase using the service role key for server-side operations
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables or use defaults
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fubudmekboxqnfzoclzw.supabase.co';
// Note: For server-side operations, you should use the service_role key (not the publishable key)
// Get it from: Supabase Dashboard > Settings > API > service_role key (secret)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_KEY = SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Public routes use the publishable key unless a service key is configured.
const supabase = SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Admin operations must use the service-role key and never fall back to the public key.
const adminSupabase = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Test connection
async function testConnection() {
  if (!supabase) {
    console.warn('Supabase credentials not configured. Database-backed features will be unavailable until SUPABASE_SERVICE_KEY is set.');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('count', { count: 'exact', head: true });
    
    if (error && !error.message.includes('relation')) {
      console.error('Database connection error:', error.message);
      return false;
    }
    
    console.log('✓ Connected to Supabase database');
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return false;
  }
}

module.exports = {
  supabase,
  adminSupabase,
  testConnection
};
