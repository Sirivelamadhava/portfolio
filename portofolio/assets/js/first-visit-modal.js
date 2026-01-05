/**
 * First Visit Modal Handler - SIMPLE AND RELIABLE
 */

(function() {
  'use strict';

  // Check if user has already responded
  function hasUserResponded() {
    return localStorage.getItem('first_visit_response') !== null;
  }

  // Show modal - multiple methods
  function showFirstVisitModal() {
    if (hasUserResponded()) {
      return;
    }

    const modalEl = document.getElementById('firstVisitModal');
    if (!modalEl) {
      console.error('Modal element not found!');
      return;
    }

    console.log('🎯 Showing first visit modal...');

    // Method 1: Try Bootstrap Modal
    function tryBootstrap() {
      let BootstrapModal = null;
      
      if (window.bootstrap && window.bootstrap.Modal) {
        BootstrapModal = window.bootstrap.Modal;
      } else if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        BootstrapModal = bootstrap.Modal;
      }

      if (BootstrapModal) {
        try {
          const modal = new BootstrapModal(modalEl, {
            backdrop: 'static',
            keyboard: false
          });
          modal.show();
          
          modalEl.addEventListener('shown.bs.modal', function() {
            const input = document.getElementById('visitor-name-input');
            if (input) setTimeout(() => input.focus(), 300);
          }, { once: true });
          
          console.log('✅ Modal shown with Bootstrap');
          return true;
        } catch (e) {
          console.error('Bootstrap modal error:', e);
          return false;
        }
      }
      return false;
    }

    // Method 2: Manual display
    function showManually() {
      modalEl.classList.remove('fade');
      modalEl.classList.add('show');
      modalEl.style.display = 'block';
      modalEl.style.zIndex = '999999';
      modalEl.setAttribute('aria-hidden', 'false');
      
      if (!document.querySelector('.modal-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.style.zIndex = '999998';
        document.body.appendChild(backdrop);
      }
      
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => {
        const input = document.getElementById('visitor-name-input');
        if (input) input.focus();
      }, 300);
      
      console.log('✅ Modal shown manually');
    }

    // Try Bootstrap first, fallback to manual
    if (!tryBootstrap()) {
      setTimeout(showManually, 100);
    }
  }

  // Handle response
  async function handleFirstVisitResponse(isFirstTime) {
    const nameInput = document.getElementById('visitor-name-input');
    const visitorName = nameInput ? nameInput.value.trim() : '';
    
    // Save locally first
    localStorage.setItem('first_visit_response', JSON.stringify({
      response: isFirstTime,
      name: visitorName,
      timestamp: new Date().toISOString()
    }));

    // Hide modal and ensure complete cleanup
    const modalEl = document.getElementById('firstVisitModal');
    if (modalEl) {
      try {
        const modal = window.bootstrap?.Modal?.getInstance(modalEl) || bootstrap?.Modal?.getInstance(modalEl);
        if (modal) {
          // Use Bootstrap's hide method
          modal.hide();
          
          // Ensure cleanup after modal hides
          modalEl.addEventListener('hidden.bs.modal', function cleanup() {
            // Remove all backdrops
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(b => b.remove());
            
            // Remove modal-open class
            document.body.classList.remove('modal-open');
            
            // Restore body overflow
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            
            // Remove this event listener
            modalEl.removeEventListener('hidden.bs.modal', cleanup);
          }, { once: true });
        } else {
          // Manual cleanup if Bootstrap modal instance doesn't exist
          modalEl.classList.remove('show');
          modalEl.style.display = 'none';
          modalEl.setAttribute('aria-hidden', 'true');
          modalEl.removeAttribute('aria-modal');
          
          // Remove all backdrops
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach(b => b.remove());
          
          // Remove modal-open class
          document.body.classList.remove('modal-open');
          
          // Restore body overflow and padding
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        }
      } catch (e) {
        console.error('Error hiding modal:', e);
        // Force cleanup on error
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        if (modalEl) {
          modalEl.classList.remove('show');
          modalEl.style.display = 'none';
        }
      }
    }

    // Save to database
    try {
      let supabase = null;
      if (window.SupabaseConfig && window.SupabaseConfig.client) {
        supabase = window.SupabaseConfig.client();
      } else if (typeof getSupabaseClient === 'function') {
        supabase = getSupabaseClient();
      }

      if (supabase) {
        let sessionId = sessionStorage.getItem('portfolio_session_id');
        if (!sessionId) {
          sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem('portfolio_session_id', sessionId);
        }
        
        let ipAddress = 'unknown';
        try {
          const res = await fetch('https://api.ipify.org?format=json');
          const data = await res.json();
          ipAddress = data.ip || 'unknown';
        } catch (e) {}

        const uniqueVisitorId = (ipAddress === 'unknown' || ipAddress === '127.0.0.1') 
          ? `session_${sessionId}` 
          : ipAddress;

        const { data: existingVisitor } = await supabase
          .from('visitors')
          .select('id, visit_count')
          .eq('ip_address', uniqueVisitorId)
          .maybeSingle();

        const isActuallyFirstVisit = !existingVisitor || existingVisitor.visit_count === 1;

        console.log('Saving visitor response to database...', {
          visitor_id: uniqueVisitorId.substring(0, 20),
          visitor_name: visitorName || 'not provided',
          user_response: isFirstTime,
          actual_first_visit: isActuallyFirstVisit
        });

        const { data: insertData, error: insertError } = await supabase
          .from('visitor_responses')
          .insert({
            visitor_id: uniqueVisitorId,
            visitor_name: visitorName || null,
            user_response: isFirstTime,
            actual_first_visit: isActuallyFirstVisit,
            session_id: sessionId,
            ip_address: ipAddress,
            user_agent: navigator.userAgent || 'unknown',
            response_time: new Date().toISOString()
          })
          .select();

        if (insertError) {
          console.error('❌ Error saving visitor response:', insertError);
          console.error('Error details:', {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint
          });
        } else {
          console.log('✅ Visitor response saved successfully!', insertData);
        }
      } else {
        console.warn('⚠️ Supabase client not available, response saved locally only');
      }
    } catch (e) {
      console.error('❌ Error saving response:', e);
    }

    if (typeof showToast === 'function') {
      showToast(
        isFirstTime ? 'Thank you! Welcome! 🎉' : 'Thanks for coming back! 👋',
        'success'
      );
    }
    
    // Final cleanup - ensure page is scrollable (fallback after 500ms)
    setTimeout(() => {
      if (typeof forceCleanupModal === 'function') {
        forceCleanupModal();
      }
    }, 500);
  }

  // Global trigger
  window.triggerFirstVisitModal = function() {
    console.log('🎬 triggerFirstVisitModal called');
    if (!hasUserResponded()) {
      setTimeout(showFirstVisitModal, 300);
    }
  };

  window.handleFirstVisitResponse = handleFirstVisitResponse;
  window.showFirstVisitModal = showFirstVisitModal;

  // Auto-trigger after animation completes
  function checkAndShow() {
    const overlay = document.getElementById('animation-overlay');
    const modalEl = document.getElementById('firstVisitModal');
    const isVisible = modalEl && (
      modalEl.classList.contains('show') || 
      modalEl.style.display === 'block'
    );

    if (!overlay && !hasUserResponded() && !isVisible) {
      console.log('✅ Animation done, showing modal...');
      window.triggerFirstVisitModal();
      return true;
    }
    return false;
  }

  // Start checking after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => {
        let tries = 0;
        const interval = setInterval(() => {
          tries++;
          if (checkAndShow() || tries > 15) {
            clearInterval(interval);
          }
        }, 500);
      }, 4000);
    });
  } else {
    setTimeout(() => {
      let tries = 0;
      const interval = setInterval(() => {
        tries++;
        if (checkAndShow() || tries > 15) {
          clearInterval(interval);
        }
      }, 500);
    }, 4000);
  }

  console.log('✅ First visit modal script loaded');
  console.log('💡 To manually test: Run "localStorage.removeItem(\'first_visit_response\'); window.showFirstVisitModal();" in console');
})();

// Force cleanup function to ensure page is scrollable (global)
function forceCleanupModal() {
  // Remove all modal backdrops
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(b => {
    b.remove();
  });
  
  // Remove modal-open class
  document.body.classList.remove('modal-open');
  
  // Restore body styles
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  
  // Ensure modal is hidden
  const modalEl = document.getElementById('firstVisitModal');
  if (modalEl) {
    modalEl.classList.remove('show');
    modalEl.style.display = 'none';
    modalEl.setAttribute('aria-hidden', 'true');
  }
  
  console.log('✅ Modal cleanup completed - page should be scrollable now');
}

// Make it globally accessible
window.forceCleanupModal = forceCleanupModal;
