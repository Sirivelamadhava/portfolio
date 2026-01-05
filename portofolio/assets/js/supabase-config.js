/**
 * Supabase Configuration
 * Replace these values with your Supabase project credentials
 */

// Supabase configuration
const SUPABASE_CONFIG = {
  // Your Supabase project URL
  url: 'https://fubudmekboxqnfzoclzw.supabase.co',
  
  // Your Supabase publishable/anonymous key
  anonKey: 'sb_publishable_Km4RL8c0RYR95PPZDzhl5g_x9SblV_9'
};

// Supabase client instance
let supabaseClient = null;

// Function to initialize Supabase client
function initSupabaseClient() {
  try {
    // Check if supabase library is loaded
    if (typeof supabase === 'undefined') {
      console.warn('Supabase library not loaded yet');
      return null;
    }

    // Create Supabase client with explicit options
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey
        }
      }
    });
    
    // Also set on window for global access
    window.supabase = supabaseClient;
    
    console.log('✓ Supabase client initialized');
    console.log('✓ Project URL:', SUPABASE_CONFIG.url);
    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    console.error('Error details:', error.message);
    return null;
  }
}

// Get Supabase client (lazy initialization)
function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }
  
  // Try to initialize
  return initSupabaseClient();
}

// Initialize when DOM is ready and library is loaded
function waitForSupabaseLibrary() {
  if (typeof supabase !== 'undefined') {
    initSupabaseClient();
  } else {
    // Retry after a short delay
    setTimeout(waitForSupabaseLibrary, 100);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Wait for library to load
    waitForSupabaseLibrary();
  });
} else {
  // DOM already loaded
  waitForSupabaseLibrary();
}

// Export for use in other scripts
window.SupabaseConfig = {
  client: getSupabaseClient,
  config: SUPABASE_CONFIG,
  init: initSupabaseClient
};
