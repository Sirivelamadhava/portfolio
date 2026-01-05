/**
 * Portfolio API Integration using Supabase
 * Handles contact form submissions and profile view tracking
 */

// Get Supabase client
function getSupabaseClient() {
  // Try to get from config first
  if (window.SupabaseConfig && window.SupabaseConfig.client) {
    const client = window.SupabaseConfig.client();
    if (client) return client;
  }
  
  // Fallback: try to get from global supabase
  if (typeof supabase !== 'undefined' && typeof window.supabase !== 'undefined') {
    // Initialize if config exists
    if (window.SupabaseConfig && window.SupabaseConfig.config) {
      const config = window.SupabaseConfig.config;
      return supabase.createClient(config.url, config.anonKey);
    }
  }
  
  console.error('✗ Supabase client not initialized. Make sure supabase-config.js is loaded.');
  return null;
}

// Generate or retrieve session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('portfolio_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('portfolio_session_id', sessionId);
  }
  return sessionId;
}

// Get client IP address (approximate using a service)
async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.warn('Could not fetch IP address:', error);
    return 'unknown';
  }
}

// Track profile view
async function trackProfileView() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Supabase client not initialized');
    return;
  }

  try {
    const sessionId = getSessionId();
    const referrer = document.referrer || 'direct';
    const userAgent = navigator.userAgent || 'unknown';
    const ipAddress = await getClientIP();
    
    console.log('Tracking profile view...', { 
      sessionId: sessionId.substring(0, 20), 
      referrer,
      ipAddress: ipAddress.substring(0, 15) + '...'
    });
    
    // Insert profile view
    const { data: viewData, error: viewError } = await supabase
      .from('profile_views')
      .insert([
        {
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer,
          session_id: sessionId
        }
      ])
      .select();

    if (viewError) {
      console.error('Error tracking view:', viewError);
      return;
    }

    // Update or insert visitor
    const uniqueVisitorId = ipAddress === 'unknown' || ipAddress === '127.0.0.1' 
      ? `session_${sessionId}` 
      : ipAddress;

    // Check if visitor exists and update or insert
    const { data: existingVisitor, error: visitorError } = await supabase
      .from('visitors')
      .select('id, visit_count')
      .eq('ip_address', uniqueVisitorId)
      .maybeSingle();

    if (existingVisitor && !visitorError) {
      // Update existing visitor
      await supabase
        .from('visitors')
        .update({
          visit_count: (existingVisitor.visit_count || 1) + 1,
          last_visit: new Date().toISOString(),
          user_agent: userAgent,
          referrer: referrer
        })
        .eq('ip_address', uniqueVisitorId);
    } else {
      // Try to insert new visitor
      const { error: insertError } = await supabase
        .from('visitors')
        .insert({
          ip_address: uniqueVisitorId,
          user_agent: userAgent,
          referrer: referrer,
          visit_count: 1
        });
      
      // If insert fails due to unique constraint (race condition), fetch and update
      if (insertError && insertError.code === '23505') {
        // Visitor was created between check and insert, fetch current count and update
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
              referrer: referrer
            })
            .eq('ip_address', uniqueVisitorId);
        }
      } else if (insertError) {
        console.error('Error inserting visitor:', insertError);
      }
    }

    // Update analytics for today
    const today = new Date().toISOString().split('T')[0];
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .eq('date', today)
      .single();

    if (analyticsData && !analyticsError) {
      // Update existing analytics
      await supabase
        .from('analytics')
        .update({
          total_views: (analyticsData.total_views || 0) + 1
        })
        .eq('date', today);
    } else {
      // Insert new analytics (using upsert to handle race conditions)
      await supabase
        .from('analytics')
        .upsert({
          date: today,
          total_views: 1,
          unique_visitors: 0,
          messages_received: 0
        }, {
          onConflict: 'date'
        });
    }

    // Update unique visitors count for today
    // Get all views for today and count unique IPs
    const startOfDay = new Date(today + 'T00:00:00Z').toISOString();
    const endOfDay = new Date(today + 'T23:59:59Z').toISOString();
    
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
        .eq('date', today);
    }

    console.log('✓ Profile view tracked successfully');
    // Optionally update view count display
    updateViewCount();
  } catch (error) {
    console.error('Error tracking profile view:', error);
    // Log but don't interrupt user experience
  }
}

// Get and display view count
async function updateViewCount() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Supabase client not initialized');
    return;
  }

  try {
    const { count, error } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching view count:', error);
      return;
    }

    // Update view count display if element exists
    const viewCountElement = document.getElementById('view-count');
    if (viewCountElement) {
      viewCountElement.textContent = (count || 0).toLocaleString();
    }
  } catch (error) {
    console.error('Error fetching view count:', error);
  }
}

// Submit contact form
async function submitContactForm(formData) {
  // Wait for Supabase to be ready
  let supabase = getSupabaseClient();
  if (!supabase) {
    // Try to initialize again
    if (window.SupabaseConfig && window.SupabaseConfig.init) {
      supabase = window.SupabaseConfig.init();
    }
    
    if (!supabase) {
      console.error('Supabase client not available');
      return {
        success: false,
        message: 'Database connection not available. Please refresh the page and try again.'
      };
    }
  }

  try {
    // Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'No Subject',
          message: formData.message
        }
      ])
      .select();

    if (error) {
      console.error('Error submitting message:', error);
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to send message. ';
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        errorMessage += 'Database tables not set up. Please contact the website administrator.';
      } else if (error.message.includes('permission') || error.message.includes('policy')) {
        errorMessage += 'Permission denied. Please check database permissions.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage += 'Network error. Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Please try again later.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }

    // Update analytics for today
    const today = new Date().toISOString().split('T')[0];
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .eq('date', today)
      .single();

    if (analyticsData && !analyticsError) {
      // Update existing analytics
      await supabase
        .from('analytics')
        .update({
          messages_received: (analyticsData.messages_received || 0) + 1
        })
        .eq('date', today);
    } else {
      // Insert new analytics (using upsert to handle race conditions)
      await supabase
        .from('analytics')
        .upsert({
          date: today,
          total_views: 0,
          unique_visitors: 0,
          messages_received: 1
        }, {
          onConflict: 'date'
        });
    }

    return {
      success: true,
      message: 'Message sent successfully',
      id: data[0].id
    };
  } catch (error) {
    console.error('Error submitting form:', error);
    
    // Handle network errors specifically
    let errorMessage = 'Failed to send message. ';
    if (error.message && error.message.includes('fetch')) {
      errorMessage += 'Network error. Please check your internet connection and try again.';
    } else if (error.message && error.message.includes('Failed to fetch')) {
      errorMessage += 'Unable to connect to the server. Please check your internet connection.';
    } else {
      errorMessage += error.message || 'An unexpected error occurred. Please try again later.';
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

// Initialize API integration
document.addEventListener('DOMContentLoaded', function() {
  // Wait for Supabase to initialize (with retries)
  let retries = 0;
  const maxRetries = 10;
  
  function tryInitialize() {
    const supabase = getSupabaseClient();
    if (supabase) {
      // Track profile view on page load
      trackProfileView();
    } else if (retries < maxRetries) {
      retries++;
      setTimeout(tryInitialize, 200);
    } else {
      console.warn('Supabase not initialized after multiple attempts, skipping profile view tracking');
    }
  }
  
  // Start initialization after a short delay
  setTimeout(tryInitialize, 500);

  // Handle contact form submission
  // Use a more reliable approach that works even if validate.js loads
  function setupFormHandler() {
    const contactForm = document.querySelector('.php-email-form[data-supabase-form]');
    if (!contactForm) {
      // Try again after a short delay if form not found
      setTimeout(setupFormHandler, 100);
      return;
    }

    // Remove the form's action to prevent any default submission
    contactForm.setAttribute('action', 'javascript:void(0);');
    contactForm.setAttribute('onsubmit', 'return false;');
    
    // Add our submit handler - use capture phase and make it non-removable
    const formHandler = async function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const form = e.currentTarget || e.target;
      const submitButton = form.querySelector('button[type="submit"]');
      const loadingDiv = form.querySelector('.loading');
      const errorMessage = form.querySelector('.error-message');
      const sentMessage = form.querySelector('.sent-message');

      // Get form data
      const formData = {
        name: form.querySelector('input[name="name"]').value.trim(),
        email: form.querySelector('input[name="email"]').value.trim(),
        subject: form.querySelector('input[name="subject"]').value.trim(),
        message: form.querySelector('textarea[name="message"]').value.trim()
      };

      // Validation
      if (!formData.name || !formData.email || !formData.message) {
        if (errorMessage) {
          errorMessage.innerHTML = 'Please fill in all required fields.';
          errorMessage.style.display = 'block';
        }
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        if (errorMessage) {
          errorMessage.innerHTML = 'Please enter a valid email address.';
          errorMessage.style.display = 'block';
        }
        return;
      }

      // Hide previous messages
      if (errorMessage) {
        errorMessage.style.display = 'none';
        errorMessage.innerHTML = '';
      }
      if (sentMessage) {
        sentMessage.style.display = 'none';
      }
      if (loadingDiv) {
        loadingDiv.style.display = 'block';
      }
      
      // Disable submit button
      const originalButtonText = submitButton ? submitButton.textContent : 'Send Message';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      // Submit to Supabase
      try {
        // Ensure Supabase is ready before submitting
        let supabaseReady = getSupabaseClient();
        if (!supabaseReady) {
          // Try to initialize
          if (window.SupabaseConfig && window.SupabaseConfig.init) {
            supabaseReady = window.SupabaseConfig.init();
          }
          
          // If still not ready, wait a bit and try once more
          if (!supabaseReady) {
            await new Promise(resolve => setTimeout(resolve, 500));
            supabaseReady = getSupabaseClient();
          }
        }
        
        if (!supabaseReady) {
          throw new Error('Database connection not available. Please refresh the page and try again.');
        }
        
        const result = await submitContactForm(formData);

        // Hide loading
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Send Message';
        }

        // Show result
        if (result && result.success) {
          // Hide error message if visible
          if (errorMessage) {
            errorMessage.style.display = 'none';
          }
          if (sentMessage) {
            sentMessage.style.display = 'block';
            // Hide success message after 5 seconds
            setTimeout(() => {
              sentMessage.style.display = 'none';
            }, 5000);
          }
          
          // Show toast notification
          if (typeof window.showToast === 'function') {
            window.showToast('Sent', 'success', 3000);
          }
          
          form.reset();
        } else {
          // Show error
          if (errorMessage) {
            errorMessage.innerHTML = result?.message || 'Failed to send message. Please try again.';
            errorMessage.style.display = 'block';
          }
          if (sentMessage) {
            sentMessage.style.display = 'none';
          }
          
          // Show error toast
          if (typeof window.showToast === 'function') {
            window.showToast(result?.message || 'Failed to send message', 'error', 4000);
          }
        }
      } catch (error) {
        console.error('Form submission error:', error);
        // Hide loading
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
        // Show error
        if (errorMessage) {
          const errorMsg = error.message || 'Network error. Please check your connection and try again.';
          errorMessage.innerHTML = errorMsg;
          errorMessage.style.display = 'block';
        }
        if (sentMessage) {
          sentMessage.style.display = 'none';
        }
        
        // Show error toast
        if (typeof window.showToast === 'function') {
          window.showToast(error.message || 'Network error. Please try again.', 'error', 4000);
        }
      }
    };
    
    // Attach handler in capture phase (runs first) and as non-removable
    contactForm.addEventListener('submit', formHandler, {
      capture: true,
      passive: false,
      once: false
    });
    
    console.log('✓ Contact form handler attached to Supabase');
  }
  
  // Setup form handler after DOM is ready
  setupFormHandler();
});

// Export functions for use in other scripts
window.PortfolioAPI = {
  trackProfileView,
  updateViewCount,
  submitContactForm,
  getSessionId,
  getSupabaseClient: getSupabaseClient
};
