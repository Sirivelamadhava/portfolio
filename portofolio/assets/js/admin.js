/**
 * Admin Dashboard JavaScript
 * Handles authentication, analytics loading, and dashboard functionality
 */

// Authentication credentials
const ADMIN_CREDENTIALS = {
  username: 'yash',
  password: '1797365'
};

// Store full data for view more functionality
window.allVisitorsData = [];
window.allViewsData = [];
window.allMessagesData = [];
window.messagesData = [];
window.visitorsExpanded = false;
window.viewsExpanded = false;
window.messagesExpanded = false;

// Check if user is authenticated
function checkAuthentication() {
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
  if (isAuthenticated) {
    showDashboard();
  } else {
    showLogin();
  }
}

// Show login form
function showLogin() {
  document.getElementById('login-container').style.display = 'flex';
  document.getElementById('dashboard-container').style.display = 'none';
  const usernameInput = document.getElementById('username');
  if (usernameInput) {
    usernameInput.focus();
  }
}

// Show dashboard
function showDashboard() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('dashboard-container').style.display = 'block';
  
  // Display admin login times
  updateAdminLoginTimes();
  
  // Load analytics when dashboard is shown
  setTimeout(loadAnalytics, 500);
}

// Update admin login times display
function updateAdminLoginTimes() {
  const currentLoginTime = sessionStorage.getItem('adminLoginTime');
  let currentLoginTimestamp = 0;
  
  if (currentLoginTime) {
    currentLoginTimestamp = parseInt(currentLoginTime);
    const currentLoginDate = new Date(currentLoginTimestamp);
    const currentTimeEl = document.getElementById('current-login-time');
    if (currentTimeEl) {
      currentTimeEl.textContent = currentLoginDate.toLocaleString();
    }
  } else {
    const currentTimeEl = document.getElementById('current-login-time');
    if (currentTimeEl) {
      currentTimeEl.textContent = 'Just now';
    }
  }
  
  // Get last login time from localStorage
  const lastLoginISO = localStorage.getItem('adminLastLogin');
  
  if (lastLoginISO) {
    const lastLoginDate = new Date(lastLoginISO);
    const lastLoginTimestamp = lastLoginDate.getTime();
    const timeDifference = Math.abs(lastLoginTimestamp - currentLoginTimestamp);
    
    if (timeDifference > 2000) {
      const lastTimeEl = document.getElementById('last-login-time');
      if (lastTimeEl) {
        lastTimeEl.textContent = lastLoginDate.toLocaleString();
      }
      return;
    }
  }
  
  // Check history
  const loginHistory = JSON.parse(localStorage.getItem('adminLoginHistory') || '[]');
  if (loginHistory.length > 1) {
    for (let i = 1; i < loginHistory.length; i++) {
      const histEntry = loginHistory[i];
      if (histEntry.timestamp_ms) {
        const histTime = parseInt(histEntry.timestamp_ms);
        if (Math.abs(histTime - currentLoginTimestamp) > 2000) {
          const histDate = new Date(histTime);
          const lastTimeEl = document.getElementById('last-login-time');
          if (lastTimeEl) {
            lastTimeEl.textContent = histDate.toLocaleString();
          }
          return;
        }
      }
    }
  }
  
  const lastTimeEl = document.getElementById('last-login-time');
  if (lastTimeEl) {
    lastTimeEl.textContent = 'First login';
  }
}

// Handle login form submission
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;
    const errorDiv = document.getElementById('login-error');
    
    if (!errorDiv) return;
    
    // Clear previous error
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    
    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const previousLoginTimestamp = localStorage.getItem('adminLastLoginTimestamp');
      const newLoginTimestamp = Date.now();
      const newLoginTimeISO = new Date().toISOString();
      
      // Set authentication
      sessionStorage.setItem('adminAuthenticated', 'true');
      sessionStorage.setItem('adminLoginTime', newLoginTimestamp.toString());
      
      // Update last login information
      if (previousLoginTimestamp) {
        const previousLoginDate = new Date(parseInt(previousLoginTimestamp));
        localStorage.setItem('adminLastLogin', previousLoginDate.toISOString());
      } else {
        localStorage.removeItem('adminLastLogin');
      }
      
      // Save new login timestamp
      localStorage.setItem('adminLastLoginTimestamp', newLoginTimestamp.toString());
      
      // Save to login history
      const loginHistory = JSON.parse(localStorage.getItem('adminLoginHistory') || '[]');
      loginHistory.unshift({ 
        timestamp: newLoginTimeISO, 
        date: new Date(newLoginTimeISO).toLocaleString(),
        timestamp_ms: newLoginTimestamp
      });
      localStorage.setItem('adminLoginHistory', JSON.stringify(loginHistory.slice(0, 10)));
      
      // Show dashboard
      showDashboard();
    } else {
      // Show error
      errorDiv.textContent = 'Invalid username or password. Please try again.';
      errorDiv.style.display = 'block';
      
      // Clear password field
      const passwordInput = document.getElementById('password');
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  });
}

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminLoginTime');
    showLogin();
    
    // Clear form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.reset();
    }
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }
}

// Get Supabase client
function getSupabaseClient() {
  if (window.SupabaseConfig && window.SupabaseConfig.client) {
    return window.SupabaseConfig.client();
  }
  return null;
}

// Check database connection
async function checkDatabaseConnection() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Supabase client is null');
    return false;
  }

  try {
    // Try to query messages table
    const { data, error } = await supabase.from('messages').select('id').limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      return false;
    }
    
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection exception:', error);
    return false;
  }
}

// Load analytics
async function loadAnalytics() {
  // Check authentication
  if (sessionStorage.getItem('adminAuthenticated') !== 'true') {
    showLogin();
    return;
  }

  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<span class="loading-spinner"></span> Loading...';
  }

  const supabase = getSupabaseClient();
  
  if (!supabase) {
    showError('Supabase client not initialized. Please check your configuration.');
    return;
  }

  // Check connection
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    showError('Cannot connect to database. Please check your Supabase configuration.');
    return;
  }

  try {
    // Load analytics data
    const [viewsResult, messagesResult] = await Promise.all([
      supabase.from('profile_views').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true })
    ]);

    if (viewsResult.error) throw viewsResult.error;
    if (messagesResult.error) throw messagesResult.error;

    /**
     * Calculate Unique Visitors - CLEAR AND RELIABLE METHOD
     * 
     * How it works:
     * 1. The 'visitors' table stores one row per unique visitor
     * 2. Each row has a unique 'ip_address' (enforced by database constraint)
     * 3. For localhost: ip_address = 'session_XXXXX' (unique per session)
     * 4. For real IPs: ip_address = actual IP address
     * 5. We count distinct ip_address values from visitors who visited in last 30 days
     */
    let uniqueVisitorsCount = 0;
    try {
      // Step 1: Get all visitors from visitors table
      const { data: allVisitors, error: visitorsError } = await supabase
        .from('visitors')
        .select('ip_address, last_visit, first_visit');
      
      if (visitorsError) {
        console.error('[Unique Visitors] Database error:', visitorsError);
        throw visitorsError;
      }
      
      if (!allVisitors || allVisitors.length === 0) {
        console.log('[Unique Visitors] No visitors found in database');
        uniqueVisitorsCount = 0;
      } else {
        // Step 2: Calculate 30 days ago timestamp
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = thirtyDaysAgo.toISOString();
        
        // Step 3: Count unique visitors who visited in last 30 days
        const uniqueSet = new Set();
        let totalVisitors = 0;
        let recentVisitors = 0;
        
        allVisitors.forEach(visitor => {
          totalVisitors++;
          
          // Check if visitor visited in last 30 days
          const lastVisit = visitor.last_visit || visitor.first_visit;
          const isRecent = lastVisit && lastVisit >= cutoffDate;
          
          if (isRecent) {
            recentVisitors++;
            // Each ip_address in visitors table is already unique (enforced by UNIQUE constraint)
            // So we just count distinct ip_address values
            if (visitor.ip_address) {
              uniqueSet.add(visitor.ip_address);
            }
          }
        });
        
        uniqueVisitorsCount = uniqueSet.size;
        
        // Log detailed information for debugging
        console.log('[Unique Visitors] Calculation:', {
          totalVisitorsInDB: totalVisitors,
          recentVisitors: recentVisitors,
          uniqueVisitors: uniqueVisitorsCount,
          cutoffDate: cutoffDate
        });
        
        // If we have visitors but count is 0, show all-time count as fallback
        if (uniqueVisitorsCount === 0 && totalVisitors > 0) {
          console.warn('[Unique Visitors] No recent visitors, counting all-time unique visitors');
          const allTimeUnique = new Set();
          allVisitors.forEach(v => {
            if (v.ip_address) allTimeUnique.add(v.ip_address);
          });
          uniqueVisitorsCount = allTimeUnique.size;
          console.log('[Unique Visitors] All-time unique visitors:', uniqueVisitorsCount);
        }
      }
    } catch (err) {
      console.error('[Unique Visitors] Error:', err);
      // Final fallback: try simple count query
      try {
        const { count, error } = await supabase
          .from('visitors')
          .select('*', { count: 'exact', head: true });
        
        if (!error && count !== null) {
          uniqueVisitorsCount = count;
          console.log('[Unique Visitors] Fallback count:', uniqueVisitorsCount);
        }
      } catch (fallbackErr) {
        console.error('[Unique Visitors] Fallback also failed:', fallbackErr);
        uniqueVisitorsCount = 0;
      }
    }

    // Display Actual Data stats
    const actualUniqueEl = document.getElementById('actual-unique-count');
    const actualTotalEl = document.getElementById('actual-total-count');
    const actualMessagesEl = document.getElementById('actual-messages-count');
    
    if (actualUniqueEl) {
      actualUniqueEl.textContent = uniqueVisitorsCount.toLocaleString();
    }
    
    if (actualTotalEl) {
      actualTotalEl.textContent = (viewsResult.count || 0).toLocaleString();
    }
    
    if (actualMessagesEl) {
      actualMessagesEl.textContent = (messagesResult.count || 0).toLocaleString();
    }
      
    // Show success status
    showSuccess('Connected to Supabase database successfully!');

    // Load new structured sections
    await loadUserGivenData();
    await loadActualData();

  } catch (error) {
    console.error('Error loading analytics:', error);
    showError(`Error: ${error.message}`);
  } finally {
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Refresh';
    }
  }
}

// Show error message
function showError(message) {
  const statusDiv = document.getElementById('connection-status');
  if (statusDiv) {
    statusDiv.className = 'alert alert-danger connection-status';
    statusDiv.style.display = 'block';
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
      statusMessage.textContent = '❌ ' + message;
    }
  }
  
  // Don't overwrite stats with "Error" - they might have valid cached data
  // Only show error in status message
}

// Show success message
function showSuccess(message) {
  const statusDiv = document.getElementById('connection-status');
  if (statusDiv) {
    statusDiv.className = 'alert alert-success connection-status';
    statusDiv.style.display = 'block';
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
      statusMessage.textContent = '✅ ' + message;
    }
  }
}

// Load visitor activity
async function loadVisitorActivity() {
  const tbody = document.getElementById('visitors-table');
  const supabase = getSupabaseClient();
  
  if (!tbody || !supabase) {
    return;
  }

  try {
    const { data: visitorsData, error: visitorsError } = await supabase
      .from('visitors')
      .select('*')
      .order('last_visit', { ascending: false })
      .limit(100);

    if (visitorsError) {
      throw visitorsError;
    }

    window.allVisitorsData = visitorsData || [];

    if (!visitorsData || visitorsData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-info">📭 No visitor data yet.</td></tr>';
      const btn = document.getElementById('visitors-view-more-btn');
      if (btn) btn.style.display = 'none';
    } else {
      renderVisitorsTable(10);
      const btn = document.getElementById('visitors-view-more-btn');
      if (btn && visitorsData.length > 10) {
        btn.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error loading visitor activity:', error);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">⚠️ Error: ${error.message}</td></tr>`;
  }
}

// Render visitors table
function renderVisitorsTable(limit = null) {
  const tbody = document.getElementById('visitors-table');
  if (!tbody) return;
  
  const dataToShow = limit ? window.allVisitorsData.slice(0, limit) : window.allVisitorsData;
  
  if (window.allVisitorsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-info">📭 No visitor data yet.</td></tr>';
    return;
  }

  tbody.innerHTML = dataToShow.map((visitor) => {
    const escapeHtml = (text) => {
      if (!text) return 'N/A';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    const visitorId = visitor.visitor_id || visitor.ip_address || 'Unknown';
    const userAgent = visitor.user_agent || 'Unknown';
    const shortUserAgent = userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
    const firstVisit = visitor.first_visit ? new Date(visitor.first_visit).toLocaleString() : 'N/A';
    const lastVisit = visitor.last_visit ? new Date(visitor.last_visit).toLocaleString() : 'N/A';
    
    return `
      <tr>
        <td>${escapeHtml(visitorId.substring(0, 8) + '...')}</td>
        <td>${firstVisit}</td>
        <td><strong>${lastVisit}</strong></td>
        <td><span class="badge bg-info">${visitor.visit_count || 1}</span></td>
        <td title="${escapeHtml(userAgent)}">${escapeHtml(shortUserAgent)}</td>
      </tr>
    `;
  }).join('');
}

// Toggle visitors view
function toggleVisitorsView() {
  window.visitorsExpanded = !window.visitorsExpanded;
  const btn = document.getElementById('visitors-view-more-btn');
  
  if (btn) {
    if (window.visitorsExpanded) {
      renderVisitorsTable();
      btn.innerHTML = '<i class="bi bi-chevron-up"></i> View Less';
    } else {
      renderVisitorsTable(10);
      btn.innerHTML = '<i class="bi bi-chevron-down"></i> View More';
    }
  }
}

// Load visitor responses (first visit data)
async function loadVisitorResponses() {
  const tbody = document.getElementById('responses-table');
  if (!tbody) return;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">❌ Database connection error</td></tr>';
      return;
    }

    const { data: responses, error } = await supabase
      .from('visitor_responses')
      .select('*')
      .order('response_time', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading visitor responses:', error);
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-warning">⚠️ Error loading data</td></tr>';
      return;
    }

    if (!responses || responses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-info">📭 No visitor responses yet.</td></tr>';
      return;
    }

    // Store data globally for toggle view
    window.allResponsesData = responses;

    // Render table
    renderResponsesTable(10);

    // Show "View More" button if there are more than 10 responses
    const viewMoreBtn = document.getElementById('responses-view-more-btn');
    if (viewMoreBtn && responses.length > 10) {
      viewMoreBtn.style.display = 'block';
    }

  } catch (err) {
    console.error('Error in loadVisitorResponses:', err);
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">❌ Error loading responses</td></tr>';
  }
}

// Render responses table
function renderResponsesTable(limit = null) {
  const tbody = document.getElementById('responses-table');
  if (!tbody) return;
  
  const dataToShow = limit ? window.allResponsesData.slice(0, limit) : window.allResponsesData;
  
  if (window.allResponsesData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-info">📭 No visitor responses yet.</td></tr>';
    return;
  }

    tbody.innerHTML = dataToShow.map((response) => {
      const escapeHtml = (text) => {
        if (!text) return 'N/A';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };
      
      const visitorName = response.visitor_name || 'Anonymous';
      const visitorId = response.visitor_id || 'Unknown';
      const userSaid = response.user_response ? 'First Time' : 'Returning';
      const actuallyIs = response.actual_first_visit ? 'First Time' : 'Returning';
      const matches = response.user_response === response.actual_first_visit;
      const responseTime = response.response_time ? new Date(response.response_time).toLocaleString() : 'N/A';
      
      return `
        <tr>
          <td><strong style="color: var(--admin-primary);">${escapeHtml(visitorName)}</strong></td>
          <td title="${escapeHtml(visitorId)}">${escapeHtml(visitorId.substring(0, 15))}${visitorId.length > 15 ? '...' : ''}</td>
          <td><span class="badge ${response.user_response ? 'bg-primary' : 'bg-secondary'}">${userSaid}</span></td>
          <td><span class="badge ${response.actual_first_visit ? 'bg-info' : 'bg-warning'}">${actuallyIs}</span></td>
          <td><span class="badge ${matches ? 'bg-success' : 'bg-danger'}">${matches ? '✓ Match' : '✗ Mismatch'}</span></td>
          <td>${responseTime}</td>
        </tr>
      `;
    }).join('');
}

// Toggle responses view
function toggleResponsesView() {
  window.responsesExpanded = !window.responsesExpanded;
  const btn = document.getElementById('responses-view-more-btn');
  
  if (btn) {
    if (window.responsesExpanded) {
      renderResponsesTable();
      btn.innerHTML = '<i class="bi bi-chevron-up"></i> View Less';
    } else {
      renderResponsesTable(10);
      btn.innerHTML = '<i class="bi bi-chevron-down"></i> View More';
    }
  }
}

// ============= NEW STRUCTURED SECTIONS =============

// Load User Given Data Section
async function loadUserGivenData() {
  const tbody = document.getElementById('user-given-table');
  if (!tbody) {
    console.error('user-given-table element not found');
    return;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not available');
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">❌ Database connection error</td></tr>';
      return;
    }

    console.log('Loading user given data from visitor_responses table...');
    
    const { data: responses, error } = await supabase
      .from('visitor_responses')
      .select('*')
      .order('response_time', { ascending: false })
      .limit(1000); // Limit to prevent huge queries

    if (error) {
      console.error('❌ Error loading user given data:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Check if table doesn't exist
      if (error.message && (error.message.includes('relation') || error.message.includes('does not exist'))) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-warning">⚠️ Table "visitor_responses" does not exist. Please run the SQL schema file in Supabase.</td></tr>';
      } else {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-warning">⚠️ Error loading data: ${error.message}</td></tr>`;
      }
      
      // Set stats to 0 on error
      const uniqueCountEl = document.getElementById('user-unique-count');
      const totalCountEl = document.getElementById('user-total-count');
      const namesCountEl = document.getElementById('user-with-names-count');
      if (uniqueCountEl) uniqueCountEl.textContent = '0';
      if (totalCountEl) totalCountEl.textContent = '0';
      if (namesCountEl) namesCountEl.textContent = '0';
      return;
    }

    console.log('User given data loaded:', responses?.length || 0, 'responses');
    
    // If no data, provide helpful diagnostics
    if (!responses || responses.length === 0) {
      console.warn('⚠️ No responses found.');
      console.warn('This is normal if:');
      console.warn('  1. No users have submitted the first-visit modal yet');
      console.warn('  2. You need to clear localStorage and test: localStorage.removeItem("first_visit_response")');
      console.warn('');
      console.warn('If the table is missing, run: COMPLETE_FIX_AND_TEST.sql in Supabase SQL Editor');
    } else {
      console.log('✅ Successfully loaded', responses.length, 'visitor responses!');
    }

    if (!responses || responses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-info">📭 No user responses yet.</td></tr>';
      const uniqueCountEl = document.getElementById('user-unique-count');
      const totalCountEl = document.getElementById('user-total-count');
      const namesCountEl = document.getElementById('user-with-names-count');
      if (uniqueCountEl) uniqueCountEl.textContent = '0';
      if (totalCountEl) totalCountEl.textContent = '0';
      if (namesCountEl) namesCountEl.textContent = '0';
      return;
    }

    // Calculate stats
    // Unique visitors: Only count those who responded "First Time" (user_response = true)
    const firstTimeResponses = responses.filter(r => r.user_response === true);
    
    // Create a Set of unique identifiers - check visitor_id, ip_address, and session_id
    const uniqueVisitorSet = new Set();
    firstTimeResponses.forEach(r => {
      // Use visitor_id if available, otherwise fall back to ip_address, then session_id
      const uniqueId = r.visitor_id || r.ip_address || r.session_id;
      if (uniqueId && uniqueId !== 'unknown') {
        uniqueVisitorSet.add(uniqueId);
      }
    });
    const uniqueVisitors = uniqueVisitorSet.size;
    
    const totalResponses = responses.length;
    const withNames = responses.filter(r => r.visitor_name && r.visitor_name.trim()).length;

    console.log('User given stats:', { 
      uniqueVisitors, 
      totalResponses, 
      withNames, 
      firstTimeCount: firstTimeResponses.length,
      allFirstTimeIds: Array.from(uniqueVisitorSet)
    });

    // Display stats
    const uniqueCountEl = document.getElementById('user-unique-count');
    const totalCountEl = document.getElementById('user-total-count');
    const namesCountEl = document.getElementById('user-with-names-count');
    
    if (uniqueCountEl) uniqueCountEl.textContent = uniqueVisitors.toLocaleString();
    if (totalCountEl) totalCountEl.textContent = totalResponses.toLocaleString();
    if (namesCountEl) namesCountEl.textContent = withNames.toLocaleString();

    // Store data globally for toggle view
    window.allUserGivenData = responses;

    // Render table (limit 10)
    renderUserGivenTable(10);

    // Show "View More" button if there are more than 10 responses
    const viewMoreContainer = document.getElementById('user-given-view-more-container');
    if (viewMoreContainer && responses.length > 10) {
      viewMoreContainer.style.display = 'block';
    } else if (viewMoreContainer) {
      viewMoreContainer.style.display = 'none';
    }

  } catch (err) {
    console.error('Error in loadUserGivenData:', err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">❌ Error: ${err.message || 'Unknown error'}</td></tr>`;
    
    // Set stats to 0 on error
    const uniqueCountEl = document.getElementById('user-unique-count');
    const totalCountEl = document.getElementById('user-total-count');
    const namesCountEl = document.getElementById('user-with-names-count');
    if (uniqueCountEl) uniqueCountEl.textContent = '0';
    if (totalCountEl) totalCountEl.textContent = '0';
    if (namesCountEl) namesCountEl.textContent = '0';
  }
}

// Render User Given Data Table
function renderUserGivenTable(limit = null) {
  const tbody = document.getElementById('user-given-table');
  if (!tbody || !window.allUserGivenData) return;
  
  const dataToShow = limit ? window.allUserGivenData.slice(0, limit) : window.allUserGivenData;
  
  if (window.allUserGivenData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-info">📭 No user responses yet.</td></tr>';
    return;
  }

  tbody.innerHTML = dataToShow.map((response) => {
    const escapeHtml = (text) => {
      if (!text) return 'Anonymous';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    const visitorName = response.visitor_name ? escapeHtml(response.visitor_name) : '<span class="text-muted">Anonymous</span>';
    const visitorId = response.visitor_id || response.session_id || 'Unknown';
    const userResponse = response.user_response ? 'First Time' : 'Returning';
    const actualStatus = response.actual_first_visit ? 'First Time' : 'Returning';
    const responseTime = response.response_time ? new Date(response.response_time).toLocaleString() : 'N/A';
    
    return `
      <tr>
        <td><strong style="color: var(--admin-primary);">${visitorName}</strong></td>
        <td title="${escapeHtml(visitorId)}">${escapeHtml(visitorId.substring(0, 15))}${visitorId.length > 15 ? '...' : ''}</td>
        <td><span class="badge ${response.user_response ? 'bg-primary' : 'bg-secondary'}">${userResponse}</span></td>
        <td><span class="badge ${response.actual_first_visit ? 'bg-info' : 'bg-warning'}">${actualStatus}</span></td>
        <td>${responseTime}</td>
      </tr>
    `;
  }).join('');
}

// Toggle User Given View
function toggleUserGivenView() {
  window.userGivenExpanded = !window.userGivenExpanded;
  const btn = document.getElementById('user-given-view-more-btn');
  
  if (btn) {
    if (window.userGivenExpanded) {
      renderUserGivenTable();
      btn.innerHTML = '<i class="bi bi-chevron-up"></i> View Less';
    } else {
      renderUserGivenTable(10);
      btn.innerHTML = '<i class="bi bi-chevron-down"></i> View More';
    }
  }
}

// Load Actual Data Section
async function loadActualData() {
  await Promise.all([
    loadActualVisitors(),
    loadActualViews(),
    loadActualMessages(),
    loadOnlineUsers()
  ]);
}

// Load Actual Visitors
async function loadActualVisitors() {
  const tbody = document.getElementById('actual-visitors-table');
  if (!tbody) return;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">❌ Database connection error</td></tr>';
      return;
    }

    const { data: visitors, error } = await supabase
      .from('visitors')
      .select('*')
      .order('last_visit', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading actual visitors:', error);
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-warning">⚠️ Error loading data</td></tr>';
      return;
    }

    if (!visitors || visitors.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-info">📭 No visitor data yet.</td></tr>';
      return;
    }

    window.allActualVisitors = visitors;
    renderActualVisitorsTable(10);

    // Update tab label
    const visitorsTab = document.getElementById('visitors-tab');
    if (visitorsTab) {
      const count = visitors.length > 10 ? '10+' : visitors.length.toString();
      visitorsTab.innerHTML = `<i class="bi bi-people"></i> Visitors (${count})`;
    }

    const viewMoreContainer = document.getElementById('visitors-view-more-container');
    if (viewMoreContainer && visitors.length > 10) {
      viewMoreContainer.style.display = 'block';
    }

  } catch (err) {
    console.error('Error in loadActualVisitors:', err);
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">❌ Error loading data</td></tr>';
  }
}

// Render Actual Visitors Table
function renderActualVisitorsTable(limit = null) {
  const tbody = document.getElementById('actual-visitors-table');
  if (!tbody || !window.allActualVisitors) return;
  
  const dataToShow = limit ? window.allActualVisitors.slice(0, limit) : window.allActualVisitors;
  
  tbody.innerHTML = dataToShow.map((visitor) => {
    const escapeHtml = (text) => {
      if (!text) return 'N/A';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    const visitorId = visitor.visitor_id || visitor.ip_address || 'Unknown';
    const firstVisit = visitor.first_visit ? new Date(visitor.first_visit).toLocaleString() : 'N/A';
    const lastVisit = visitor.last_visit ? new Date(visitor.last_visit).toLocaleString() : 'N/A';
    const userAgent = visitor.user_agent || 'Unknown';
    const shortUserAgent = userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
    
    return `
      <tr>
        <td>${escapeHtml(visitorId.substring(0, 15))}${visitorId.length > 15 ? '...' : ''}</td>
        <td>${firstVisit}</td>
        <td><strong>${lastVisit}</strong></td>
        <td><span class="badge bg-info">${visitor.visit_count || 1}</span></td>
        <td title="${escapeHtml(userAgent)}">${escapeHtml(shortUserAgent)}</td>
      </tr>
    `;
  }).join('');
}

// Toggle Actual Visitors View
function toggleActualVisitorsView() {
  window.actualVisitorsExpanded = !window.actualVisitorsExpanded;
  const btn = document.getElementById('visitors-view-more-btn');
  
  if (btn) {
    if (window.actualVisitorsExpanded) {
      renderActualVisitorsTable();
      btn.innerHTML = '<i class="bi bi-chevron-up"></i> View Less';
    } else {
      renderActualVisitorsTable(10);
      btn.innerHTML = '<i class="bi bi-chevron-down"></i> View More';
    }
  }
}

// Load Actual Views
async function loadActualViews() {
  const tbody = document.getElementById('actual-views-table');
  if (!tbody) return;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">❌ Database connection error</td></tr>';
      return;
    }

    const { data: views, error } = await supabase
      .from('profile_views')
      .select('*')
      .order('viewed_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading actual views:', error);
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-warning">⚠️ Error loading data</td></tr>';
      return;
    }

    if (!views || views.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-info">📭 No profile views yet.</td></tr>';
      return;
    }

    window.allActualViews = views;
    renderActualViewsTable(10);

    // Update tab label
    const viewsTab = document.getElementById('views-tab');
    if (viewsTab) {
      const count = views.length > 10 ? '10+' : views.length.toString();
      viewsTab.innerHTML = `<i class="bi bi-eye"></i> Profile Views (${count})`;
    }

    const viewMoreContainer = document.getElementById('views-view-more-container');
    if (viewMoreContainer && views.length > 10) {
      viewMoreContainer.style.display = 'block';
    }

  } catch (err) {
    console.error('Error in loadActualViews:', err);
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">❌ Error loading data</td></tr>';
  }
}

// Render Actual Views Table
function renderActualViewsTable(limit = null) {
  const tbody = document.getElementById('actual-views-table');
  if (!tbody || !window.allActualViews) return;
  
  const dataToShow = limit ? window.allActualViews.slice(0, limit) : window.allActualViews;
  
  tbody.innerHTML = dataToShow.map((view) => {
    const escapeHtml = (text) => {
      if (!text) return 'N/A';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    const visitorId = view.visitor_id || view.ip_address || view.session_id || 'Unknown';
    const viewTime = view.viewed_at ? new Date(view.viewed_at).toLocaleString() : 'N/A';
    const referrer = view.referrer || 'Direct';
    const userAgent = view.user_agent || 'Unknown';
    const shortUserAgent = userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
    
    return `
      <tr>
        <td>${escapeHtml(visitorId.substring(0, 15))}${visitorId.length > 15 ? '...' : ''}</td>
        <td>${viewTime}</td>
        <td>${escapeHtml(referrer)}</td>
        <td title="${escapeHtml(userAgent)}">${escapeHtml(shortUserAgent)}</td>
      </tr>
    `;
  }).join('');
}

// Toggle Actual Views View
function toggleActualViewsView() {
  window.actualViewsExpanded = !window.actualViewsExpanded;
  const btn = document.getElementById('views-view-more-btn');
  
  if (btn) {
    if (window.actualViewsExpanded) {
      renderActualViewsTable();
      btn.innerHTML = '<i class="bi bi-chevron-up"></i> View Less';
    } else {
      renderActualViewsTable(10);
      btn.innerHTML = '<i class="bi bi-chevron-down"></i> View More';
    }
  }
}

// Load Actual Messages
async function loadActualMessages() {
  const tbody = document.getElementById('actual-messages-table');
  if (!tbody) return;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">❌ Database connection error</td></tr>';
      return;
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading actual messages:', error);
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-warning">⚠️ Error loading data</td></tr>';
      return;
    }

    if (!messages || messages.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-info">📭 No messages yet.</td></tr>';
      return;
    }

    window.allActualMessages = messages;
    renderActualMessagesTable(10);

    // Update tab label
    const messagesTab = document.getElementById('messages-tab');
    if (messagesTab) {
      const count = messages.length > 10 ? '10+' : messages.length.toString();
      messagesTab.innerHTML = `<i class="bi bi-envelope"></i> Messages (${count})`;
    }

    const viewMoreContainer = document.getElementById('messages-view-more-container');
    if (viewMoreContainer && messages.length > 10) {
      viewMoreContainer.style.display = 'block';
    }

  } catch (err) {
    console.error('Error in loadActualMessages:', err);
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">❌ Error loading data</td></tr>';
  }
}

// Render Actual Messages Table
function renderActualMessagesTable(limit = null) {
  const tbody = document.getElementById('actual-messages-table');
  if (!tbody || !window.allActualMessages) return;
  
  const dataToShow = limit ? window.allActualMessages.slice(0, limit) : window.allActualMessages;
  
  tbody.innerHTML = dataToShow.map((message) => {
    const escapeHtml = (text) => {
      if (!text) return 'N/A';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    const messagePreview = message.message ? (message.message.length > 100 ? message.message.substring(0, 100) + '...' : message.message) : 'N/A';
    const date = message.created_at ? new Date(message.created_at).toLocaleString() : 'N/A';
    const isRead = message.read_status !== undefined ? message.read_status : (message.read || false);
    const fullMessage = escapeHtml(message.message || '');
    
    return `
      <tr class="${isRead ? '' : 'table-warning'}">
        <td>${message.id || 'N/A'}</td>
        <td>${escapeHtml(message.name || 'Anonymous')}</td>
        <td><a href="mailto:${escapeHtml(message.email || '')}">${escapeHtml(message.email || 'N/A')}</a></td>
        <td>${escapeHtml(message.subject || 'No Subject')}</td>
        <td>
          <button class="btn btn-sm btn-link text-start p-0" onclick="showActualMessageModal(${message.id})" title="Click to view full message" style="color: var(--admin-primary); text-decoration: underline;">
            ${escapeHtml(messagePreview)}
          </button>
        </td>
        <td>${date}</td>
        <td><span class="badge ${isRead ? 'bg-success' : 'bg-warning'}">${isRead ? 'Read' : 'Unread'}</span></td>
        <td>
          ${!isRead ? `
            <button class="btn btn-sm btn-success me-1" onclick="markMessageRead(${message.id})" title="Mark as Read">
              <i class="bi bi-check-circle"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-danger" onclick="deleteActualMessage(${message.id})" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Toggle Actual Messages View
function toggleActualMessagesView() {
  window.actualMessagesExpanded = !window.actualMessagesExpanded;
  const btn = document.getElementById('messages-view-more-btn');
  
  if (btn) {
    if (window.actualMessagesExpanded) {
      renderActualMessagesTable();
      btn.innerHTML = '<i class="bi bi-chevron-up"></i> View Less';
    } else {
      renderActualMessagesTable(10);
      btn.innerHTML = '<i class="bi bi-chevron-down"></i> View More';
    }
  }
}

// Show message modal for actual messages
function showActualMessageModal(messageId) {
  const message = window.allActualMessages?.find(msg => msg.id === messageId);
  if (!message) {
    alert('Message not found');
    return;
  }

  // Create modal if it doesn't exist
  let modal = document.getElementById('actualMessageModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'actualMessageModal';
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" style="background-color: #232323; color: #ffffff; border: 1px solid rgba(255,255,255,0.1);">
          <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
            <h5 class="modal-title"><i class="bi bi-envelope"></i> Message Details</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <div class="mb-2"><strong>From:</strong> <span id="actual-modal-name"></span></div>
              <div class="mb-2"><strong>Email:</strong> <a id="actual-modal-email" href="" style="color: var(--admin-primary);"></a></div>
              <div class="mb-2"><strong>Subject:</strong> <span id="actual-modal-subject"></span></div>
              <div class="mb-2"><strong>Date:</strong> <span id="actual-modal-date"></span></div>
              <div class="mb-2"><strong>Status:</strong> <span id="actual-modal-status"></span></div>
            </div>
            <div>
              <strong>Message:</strong>
              <div class="mt-2 p-3" style="background-color: #1f1f1f; border-radius: 8px; white-space: pre-wrap; max-height: 500px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1);" id="actual-modal-message"></div>
            </div>
          </div>
          <div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1);">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-success" id="actual-modal-mark-read-btn" style="display: none;">
              <i class="bi bi-check-circle"></i> Mark as Read
            </button>
            <button type="button" class="btn btn-danger" id="actual-modal-delete-btn">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Populate modal
  const isRead = message.read_status !== undefined ? message.read_status : (message.read || false);
  document.getElementById('actual-modal-name').textContent = message.name || 'Unknown';
  const emailEl = document.getElementById('actual-modal-email');
  emailEl.textContent = message.email || 'N/A';
  emailEl.href = message.email ? 'mailto:' + message.email : '#';
  document.getElementById('actual-modal-subject').textContent = message.subject || 'No Subject';
  document.getElementById('actual-modal-date').textContent = message.created_at ? new Date(message.created_at).toLocaleString() : 'N/A';
  document.getElementById('actual-modal-status').innerHTML = `<span class="badge ${isRead ? 'bg-success' : 'bg-warning'}">${isRead ? 'Read' : 'Unread'}</span>`;
  // Display full message with proper formatting
  const messageEl = document.getElementById('actual-modal-message');
  if (messageEl) {
    messageEl.textContent = message.message || 'No message content';
    messageEl.style.whiteSpace = 'pre-wrap';
    messageEl.style.wordWrap = 'break-word';
    messageEl.style.maxHeight = '500px';
    messageEl.style.overflowY = 'auto';
  }
  
  // Set up mark as read button
  const markReadBtn = document.getElementById('actual-modal-mark-read-btn');
  if (markReadBtn) {
    if (isRead) {
      markReadBtn.style.display = 'none';
    } else {
      markReadBtn.style.display = 'inline-block';
      markReadBtn.onclick = () => {
        markMessageRead(messageId);
      };
    }
  }

  // Set up delete button
  const deleteBtn = document.getElementById('actual-modal-delete-btn');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      if (confirm('Are you sure you want to delete this message?')) {
        deleteActualMessage(messageId);
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      }
    };
  }

  // Show modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

// Mark message as read (for actual messages)
async function markMessageRead(messageId) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    alert('Database connection error');
    return;
  }

  try {
    const { error } = await supabase
      .from('messages')
      .update({ read_status: true })
      .eq('id', messageId);

    if (error) {
      throw error;
    }

    // Update local data
    if (window.allActualMessages) {
      const message = window.allActualMessages.find(msg => msg.id === messageId);
      if (message) {
        message.read_status = true;
      }
    }

    // Reload messages table
    const currentLimit = window.actualMessagesExpanded ? null : 10;
    renderActualMessagesTable(currentLimit);
    
    // Reload analytics to update count
    await loadAnalytics();

    // Close modal if open
    const modal = document.getElementById('actualMessageModal');
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    }

    // Show success message
    alert('Message marked as read!');

    console.log('✅ Message marked as read');
  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    alert('Error marking message as read: ' + error.message);
  }
}

// Delete actual message
async function deleteActualMessage(messageId) {
  if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    alert('Database connection error');
    return;
  }

  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      throw error;
    }

    // Remove from local data
    if (window.allActualMessages) {
      window.allActualMessages = window.allActualMessages.filter(msg => msg.id !== messageId);
    }

    // Reload messages table
    const currentLimit = window.actualMessagesExpanded ? null : 10;
    renderActualMessagesTable(currentLimit);
    
    // Reload analytics to update count
    await loadAnalytics();

    // Close modal if open
    const modal = document.getElementById('actualMessageModal');
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    }

    // Show success message
    alert('Message deleted successfully!');

    console.log('✅ Message deleted');
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    alert('Error deleting message: ' + error.message);
  }
}

// Load recent profile views
async function loadRecentViews() {
  const tbody = document.getElementById('views-table');
  const supabase = getSupabaseClient();
  
  if (!tbody || !supabase) {
    return;
  }

  try {
    const { data: viewsData, error: viewsError } = await supabase
      .from('profile_views')
      .select('*')
      .order('viewed_at', { ascending: false })
      .limit(100);

    if (viewsError) {
      throw viewsError;
    }

    window.allViewsData = viewsData || [];

    if (!viewsData || viewsData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-info">📭 No view data yet.</td></tr>';
      const btn = document.getElementById('views-view-more-btn');
      if (btn) btn.style.display = 'none';
    } else {
      renderViewsTable(10);
      const btn = document.getElementById('views-view-more-btn');
      if (btn && viewsData.length > 10) {
        btn.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error loading recent views:', error);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">⚠️ Error: ${error.message}</td></tr>`;
  }
}

// Render views table
function renderViewsTable(limit = null) {
  const tbody = document.getElementById('views-table');
  if (!tbody) return;
  
  const dataToShow = limit ? window.allViewsData.slice(0, limit) : window.allViewsData;
  
  if (window.allViewsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-info">📭 No view data yet.</td></tr>';
    return;
  }

  tbody.innerHTML = dataToShow.map((view) => {
    const escapeHtml = (text) => {
      if (!text) return 'N/A';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    const visitorId = view.visitor_id || view.ip_address || 'Unknown';
    const userAgent = view.user_agent || 'Unknown';
    const shortUserAgent = userAgent.length > 40 ? userAgent.substring(0, 40) + '...' : userAgent;
    const viewTime = view.viewed_at ? new Date(view.viewed_at).toLocaleString() : 'N/A';
    const referrer = view.referrer && view.referrer !== 'direct' ? view.referrer : 'Direct';
    const shortReferrer = referrer.length > 40 ? referrer.substring(0, 40) + '...' : referrer;
    
    return `
      <tr>
        <td>${escapeHtml(visitorId.toString().substring(0, 8) + '...')}</td>
        <td><strong>${viewTime}</strong></td>
        <td title="${escapeHtml(referrer)}">${escapeHtml(shortReferrer)}</td>
        <td title="${escapeHtml(userAgent)}">${escapeHtml(shortUserAgent)}</td>
      </tr>
    `;
  }).join('');
}

// Toggle views view
function toggleViewsView() {
  window.viewsExpanded = !window.viewsExpanded;
  const btn = document.getElementById('views-view-more-btn');
  
  if (btn) {
    if (window.viewsExpanded) {
      renderViewsTable();
      btn.innerHTML = '<i class="bi bi-chevron-up"></i> View Less';
    } else {
      renderViewsTable(10);
      btn.innerHTML = '<i class="bi bi-chevron-down"></i> View More';
    }
  }
}

// Load messages
async function loadMessages() {
  const tbody = document.getElementById('messages-table');
  const supabase = getSupabaseClient();
  
  if (!tbody || !supabase) {
    return;
  }

  try {
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (messagesError) {
      throw messagesError;
    }

    window.allMessagesData = messagesData || [];
    window.messagesData = messagesData || [];

    if (!messagesData || messagesData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-info">📭 No messages yet.</td></tr>';
      const btn = document.getElementById('messages-view-more-btn');
      if (btn) btn.style.display = 'none';
    } else {
      renderMessagesTable(10);
      const btn = document.getElementById('messages-view-more-btn');
      if (btn && messagesData.length > 10) {
        btn.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">⚠️ Error: ${error.message}</td></tr>`;
  }
}

// Render messages table
function renderMessagesTable(limit = null) {
  const tbody = document.getElementById('messages-table');
  if (!tbody) return;
  
  if (!window.allMessagesData || window.allMessagesData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-info">📭 No messages yet.</td></tr>';
    return;
  }

  const dataToShow = limit ? window.allMessagesData.slice(0, limit) : window.allMessagesData;
  
  tbody.innerHTML = dataToShow.map((msg) => {
    const escapeHtml = (text) => {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    const messagePreview = msg.message ? (msg.message.length > 50 ? msg.message.substring(0, 50) + '...' : msg.message) : 'No message';
    const safeMessage = escapeHtml(msg.message || '');
    const safeName = escapeHtml(msg.name || '');
    const safeEmail = escapeHtml(msg.email || '');
    const safeSubject = escapeHtml(msg.subject || 'No Subject');
    
    return `
      <tr class="${msg.read_status ? '' : 'table-warning'}" data-message-id="${msg.id}">
        <td>${msg.id}</td>
        <td>${safeName}</td>
        <td><a href="mailto:${safeEmail}">${safeEmail}</a></td>
        <td>${safeSubject}</td>
        <td>
          <button class="btn btn-sm btn-outline-light" onclick="showMessageModal(${msg.id})" title="Click to view full message">
            ${escapeHtml(messagePreview)}
          </button>
        </td>
        <td>${new Date(msg.created_at).toLocaleString()}</td>
        <td>
          <span class="badge ${msg.read_status ? 'bg-success' : 'bg-warning'}">
            ${msg.read_status ? 'Read' : 'Unread'}
          </span>
        </td>
        <td>
          ${!msg.read_status ? `
            <button class="btn btn-sm btn-success" onclick="markAsRead(${msg.id})" title="Mark as Read">
              <i class="bi bi-check-circle"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-danger" onclick="deleteMessage(${msg.id})" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Toggle messages view
function toggleMessagesView() {
  window.messagesExpanded = !window.messagesExpanded;
  const btn = document.getElementById('messages-view-more-btn');
  
  if (btn) {
    if (window.messagesExpanded) {
      renderMessagesTable();
      btn.innerHTML = '<i class="bi bi-chevron-up"></i> View Less';
    } else {
      renderMessagesTable(10);
      btn.innerHTML = '<i class="bi bi-chevron-down"></i> View More';
    }
  }
}

// Show message modal
function showMessageModal(messageId) {
  const message = window.messagesData?.find(msg => msg.id === messageId);
  if (!message) {
    alert('Message not found');
    return;
  }

  // Create modal if it doesn't exist
  let modal = document.getElementById('messageModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'messageModal';
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="background-color: #232323; color: #ffffff;">
          <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
            <h5 class="modal-title">Message Details</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <strong>From:</strong> <span id="modal-name"></span><br>
              <strong>Email:</strong> <a id="modal-email" href=""></a><br>
              <strong>Subject:</strong> <span id="modal-subject"></span><br>
              <strong>Date:</strong> <span id="modal-date"></span>
            </div>
            <div class="mb-3">
              <strong>Message:</strong>
              <div class="mt-2 p-3" style="background-color: #1f1f1f; border-radius: 5px; white-space: pre-wrap; max-height: 400px; overflow-y: auto;" id="modal-message"></div>
            </div>
          </div>
          <div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1);">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-success" id="modal-mark-read-btn" style="display: none;">Mark as Read</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Populate modal
  document.getElementById('modal-name').textContent = message.name || 'Unknown';
  document.getElementById('modal-email').textContent = message.email || '';
  document.getElementById('modal-email').href = 'mailto:' + (message.email || '');
  document.getElementById('modal-subject').textContent = message.subject || 'No Subject';
  document.getElementById('modal-date').textContent = new Date(message.created_at).toLocaleString();
  document.getElementById('modal-message').textContent = message.message || 'No message content';
  
  // Show/hide mark as read button
  const markReadBtn = document.getElementById('modal-mark-read-btn');
  if (markReadBtn) {
    if (message.read_status) {
      markReadBtn.style.display = 'none';
    } else {
      markReadBtn.style.display = 'inline-block';
      markReadBtn.onclick = () => {
        markAsRead(messageId);
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      };
    }
  }

  // Show modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

// Mark message as read
async function markAsRead(messageId) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    alert('Supabase client not initialized');
    return;
  }

  try {
    const { error } = await supabase
      .from('messages')
      .update({ read_status: true })
      .eq('id', messageId);

    if (error) {
      throw error;
    }

    // Reload messages
    const currentLimit = window.messagesExpanded ? null : 10;
    renderMessagesTable(currentLimit);
    await loadMessages();
  } catch (error) {
    console.error('Error marking message as read:', error);
    alert('Error marking message as read: ' + error.message);
  }
}

// Delete message
async function deleteMessage(messageId) {
  if (!confirm('Are you sure you want to delete this message?')) {
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    alert('Supabase client not initialized');
    return;
  }

  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      throw error;
    }

    // Reload messages
    const currentLimit = window.messagesExpanded ? null : 10;
    renderMessagesTable(currentLimit);
    await loadMessages();
    await loadAnalytics(); // Reload stats
  } catch (error) {
    console.error('Error deleting message:', error);
    alert('Error deleting message: ' + error.message);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Setup login form
  setupLoginForm();
  
  // Check authentication
  checkAuthentication();
  
  // Auto-logout after 2 hours of inactivity
  const loginTime = sessionStorage.getItem('adminLoginTime');
  if (loginTime) {
    const twoHours = 2 * 60 * 60 * 1000;
    const timeSinceLogin = Date.now() - parseInt(loginTime);
    if (timeSinceLogin > twoHours) {
      sessionStorage.removeItem('adminAuthenticated');
      sessionStorage.removeItem('adminLoginTime');
      showLogin();
    }
  }
  
  // Auto-refresh every 30 seconds (only if authenticated)
  setInterval(() => {
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
      loadAnalytics();
    }
  }, 30000);
  
  // Auto-refresh online users more frequently (every 15 seconds) to remove offline users
  setInterval(() => {
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
      // Check if online users tab is active
      const onlineUsersTab = document.getElementById('online-users-tab');
      if (onlineUsersTab && onlineUsersTab.classList.contains('active')) {
        loadOnlineUsers();
      } else if (window.allOnlineUsers) {
        // Even if tab is not active, re-render to filter out offline users
        renderOnlineUsersTable();
      }
    }
  }, 15000); // Refresh every 15 seconds
});

// Load Online Users (active in last 5 minutes)
async function loadOnlineUsers() {
  const tbody = document.getElementById('online-users-table');
  if (!tbody) return;
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Database connection error</td></tr>';
    return;
  }

  try {
    // Get last 5 minutes timestamp for truly active users
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    // Query ALL recent profile views (this shows all active sessions/viewers)
    const { data: recentViews, error: viewsError } = await supabase
      .from('profile_views')
      .select('ip_address, viewed_at, referrer, user_agent, session_id')
      .gte('viewed_at', fiveMinutesAgo)
      .order('viewed_at', { ascending: false })
      .limit(1000); // Get up to 1000 recent views to capture all online users

    if (viewsError) {
      console.error('❌ Error loading profile views:', viewsError);
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading online users: ' + (viewsError.message || 'Unknown error') + '</td></tr>';
      return;
    }

    if (!recentViews || recentViews.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-info">📭 No users online right now</td></tr>';
      window.allOnlineUsers = [];
      return;
    }

    // Get visitor names from visitor_responses - get ALL responses (not just with names)
    const { data: visitorResponses } = await supabase
      .from('visitor_responses')
      .select('visitor_id, ip_address, visitor_name, session_id')
      .order('response_time', { ascending: false }); // Get most recent first

    // Create multiple maps for name lookup by different identifiers
    const nameMapBySessionId = new Map();
    const nameMapByVisitorId = new Map();
    const nameMapByIP = new Map();
    
    visitorResponses?.forEach(response => {
      const name = response.visitor_name;
      if (!name || !name.trim()) return; // Skip if no name
      
      // Map by session_id (most accurate - unique per browser session)
      if (response.session_id) {
        nameMapBySessionId.set(response.session_id, name);
      }
      
      // Map by visitor_id (can be IP or session-based)
      if (response.visitor_id) {
        nameMapByVisitorId.set(response.visitor_id, name);
      }
      
      // Map by IP (fallback, but less accurate)
      if (response.ip_address) {
        // Only set if not already set (to avoid overwriting with older data)
        if (!nameMapByIP.has(response.ip_address)) {
          nameMapByIP.set(response.ip_address, name);
        }
      }
    });

    // Group by unique identifier - use session_id + IP combination for better uniqueness
    // This shows ALL unique active users/viewers
    const uniqueUsers = new Map();
    
    recentViews.forEach(view => {
      const ip = view.ip_address;
      if (!ip || ip === 'unknown') return;
      
      // Normalize IP address
      const normalizedIP = ip.trim().toLowerCase();
      
      // Use session_id as primary unique identifier - each session = one unique user/viewer
      // Fallback to IP + timestamp if no session_id
      const sessionId = view.session_id || null;
      const uniqueKey = sessionId || `${normalizedIP}_${new Date(view.viewed_at).getTime()}`;
      
      // If this session/user already exists, update it only if this view is more recent
      if (uniqueUsers.has(uniqueKey)) {
        const existing = uniqueUsers.get(uniqueKey);
        const existingTime = new Date(existing.last_activity);
        const currentTime = new Date(view.viewed_at);
        
        if (currentTime > existingTime) {
          existing.last_activity = view.viewed_at;
          
          // Update current page from referrer
          try {
            if (view.referrer && view.referrer !== 'direct' && view.referrer !== 'Direct') {
              const url = new URL(view.referrer);
              existing.current_page = url.pathname || existing.current_page;
            }
          } catch (e) {
            // Keep existing page
          }
          // Update user agent if more recent
          if (view.user_agent) {
            existing.user_agent = view.user_agent;
          }
        }
      } else {
        // New viewer/session - add to list (each unique session = one user)
        let currentPage = '/';
        try {
          if (view.referrer && view.referrer !== 'direct' && view.referrer !== 'Direct') {
            const url = new URL(view.referrer);
            currentPage = url.pathname || '/';
          }
        } catch (e) {
          currentPage = '/';
        }
        
        // Get visitor name and visitor_id from visitor_responses - match by session_id (most accurate)
        let visitorName = null;
        let displayVisitorId = sessionId || normalizedIP;
        
        if (sessionId) {
          // Find the matching visitor_response for this session
          const matchingResponse = visitorResponses?.find(r => 
            r.session_id === sessionId
          );
          
          if (matchingResponse) {
            visitorName = matchingResponse.visitor_name || null;
            displayVisitorId = matchingResponse.visitor_id || sessionId || normalizedIP;
          } else {
            // Fallback: try to match by session_id in name maps
            visitorName = nameMapBySessionId.get(sessionId) || null;
          }
        }
        
        // If still no name, try other fallback methods
        if (!visitorName) {
          visitorName = nameMapByVisitorId.get(sessionId) || 
                       nameMapByVisitorId.get(normalizedIP) || 
                       nameMapByIP.get(normalizedIP) || 
                       null;
        }
        
        // If still no visitor_id, use session_id or IP
        if (displayVisitorId === (sessionId || normalizedIP) && sessionId) {
          const matchingResponseByIP = visitorResponses?.find(r => 
            r.session_id === sessionId || r.ip_address === normalizedIP
          );
          if (matchingResponseByIP && matchingResponseByIP.visitor_id) {
            displayVisitorId = matchingResponseByIP.visitor_id;
          }
        }
        
        uniqueUsers.set(uniqueKey, {
          ip_address: normalizedIP,
          visitor_id: displayVisitorId, // Use actual visitor_id from responses if available
          session_id: sessionId || 'No Session',
          name: visitorName || null,
          last_activity: view.viewed_at,
          current_page: currentPage,
          user_agent: view.user_agent || 'Unknown',
          is_active: true
        });
      }
    });
    
    console.log('🔍 Processing views:', {
      totalViews: recentViews.length,
      uniqueUsersFound: uniqueUsers.size,
      uniqueIPs: new Set(recentViews.map(v => v.ip_address).filter(ip => ip && ip !== 'unknown')).size,
      uniqueSessionIDs: new Set(recentViews.map(v => v.session_id).filter(s => s)).size,
      sampleIPs: Array.from(new Set(recentViews.map(v => v.ip_address).filter(ip => ip && ip !== 'unknown'))).slice(0, 5)
    });

    // Convert to array and filter out offline users immediately
    const fiveMinutesAgoDate = new Date(Date.now() - 5 * 60 * 1000);
    let onlineUsersArray = Array.from(uniqueUsers.values())
      .filter(user => {
        // Only include users active within last 5 minutes
        if (!user || !user.last_activity) return false;
        const activityTime = new Date(user.last_activity);
        return activityTime >= fiveMinutesAgoDate;
      })
      .sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity));

    // Final deduplication: Ensure no duplicate visitor IDs or session IDs
    const seenVisitorIDs = new Set();
    const seenSessionIDs = new Set();
    onlineUsersArray = onlineUsersArray.filter(user => {
      if (!user) return false;
      
      // Primary deduplication by visitor_id (session_id if available, otherwise IP)
      if (user.visitor_id) {
        const normalizedVisitorID = user.visitor_id.trim().toLowerCase();
        if (seenVisitorIDs.has(normalizedVisitorID)) {
          console.warn('⚠️ Duplicate visitor_id found and removed:', normalizedVisitorID);
          return false;
        }
        seenVisitorIDs.add(normalizedVisitorID);
      }
      
      // Secondary check by session_id
      if (user.session_id && user.session_id !== 'No Session') {
        const normalizedSessionID = user.session_id.trim().toLowerCase();
        if (seenSessionIDs.has(normalizedSessionID)) {
          console.warn('⚠️ Duplicate session_id found and removed:', normalizedSessionID);
          return false;
        }
        seenSessionIDs.add(normalizedSessionID);
      }
      
      return true;
    });

    // Set names for users without names and ensure all fields are set
    onlineUsersArray.forEach(user => {
      if (!user.name) {
        user.name = 'Anonymous';
      }
      if (!user.current_page) {
        user.current_page = '/';
      }
      if (!user.user_agent) {
        user.user_agent = 'Unknown';
      }
      // Ensure is_active is set correctly
      const activityTime = new Date(user.last_activity);
      user.is_active = activityTime >= fiveMinutesAgoDate;
    });

    // Store globally - only online users
    window.allOnlineUsers = onlineUsersArray;

    console.log('✅ Online users loaded:', {
      totalViews: recentViews?.length || 0,
      uniqueUsersInMap: uniqueUsers.size,
      uniqueOnlineUsersAfterFilter: onlineUsersArray.length,
      users: onlineUsersArray.map(u => ({
        ip: u.ip_address?.substring(0, 15) || 'unknown',
        name: u.name || 'Anonymous',
        visitorID: u.visitor_id?.substring(0, 15) || 'unknown',
        lastActivity: u.last_activity,
        isActive: u.is_active
      }))
    });
    
    // Debug: Log unique IPs found
    if (recentViews && recentViews.length > 0) {
      const uniqueIPs = new Set(recentViews.map(v => v.ip_address).filter(ip => ip && ip !== 'unknown'));
      console.log('🔍 Debug - Unique IPs found:', uniqueIPs.size, 'Online users shown:', onlineUsersArray.length);
    }

    // Render table
    renderOnlineUsersTable();

  } catch (err) {
    console.error('❌ Error loading online users:', err);
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading online users: ' + (err.message || 'Unknown error') + '</td></tr>';
  }
}

// Render Online Users Table
function renderOnlineUsersTable() {
  const tbody = document.getElementById('online-users-table');
  if (!tbody || !window.allOnlineUsers) return;
  
  // Double-check and filter out any offline users (fresh check)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const currentlyOnlineUsers = window.allOnlineUsers.filter(user => {
    if (!user || !user.last_activity) return false;
    const activityTime = new Date(user.last_activity);
    const isOnline = activityTime >= fiveMinutesAgo;
    
    // Update is_active status
    if (user) {
      user.is_active = isOnline;
    }
    
    return isOnline;
  });
  
  // Update global array to only include currently online users
  window.allOnlineUsers = currentlyOnlineUsers;
  
  if (currentlyOnlineUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-info">📭 No users online right now</td></tr>';
    return;
  }

  // Show all online users
  tbody.innerHTML = currentlyOnlineUsers.map((user) => {
    const escapeHtml = (text) => {
      if (!text) return 'N/A';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    const lastActivity = user.last_activity ? new Date(user.last_activity).toLocaleString() : 'N/A';
    const timeAgo = user.last_activity ? getTimeAgo(new Date(user.last_activity)) : 'N/A';
    const userAgent = user.user_agent || 'Unknown';
    const shortUserAgent = userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
    const currentPage = user.current_page || '/';
    
    return `
      <tr>
        <td>${escapeHtml(user.ip_address.substring(0, 15))}${user.ip_address.length > 15 ? '...' : ''}</td>
        <td>${escapeHtml(user.name || 'Anonymous')}</td>
        <td>${lastActivity}<br><small class="text-muted">${timeAgo} ago</small></td>
        <td>${escapeHtml(currentPage)}</td>
        <td title="${escapeHtml(userAgent)}">${escapeHtml(shortUserAgent)}</td>
        <td><span class="badge bg-success"><i class="bi bi-circle-fill" style="font-size: 8px;"></i> Online</span></td>
      </tr>
    `;
  }).join('');
}

// Helper function to get time ago string
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return seconds + 's';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm';
  const hours = Math.floor(minutes / 60);
  return hours + 'h';
}

// Make message functions globally accessible for onclick handlers
window.showActualMessageModal = showActualMessageModal;
window.markMessageRead = markMessageRead;
window.deleteActualMessage = deleteActualMessage;

