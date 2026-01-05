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
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Create Supabase client with service role key for server-side operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection
async function testConnection() {
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
  testConnection
};

