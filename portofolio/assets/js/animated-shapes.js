// Animated Shapes, Grid Background, and Cursor Trail
// Converted from React components to vanilla JavaScript

(function() {
  'use strict';

  // Animation stage management
  let animationStage = 0;
  const stages = {
    INIT: 0,
    SHOW_GRID_SHAPES: 1,
    SHOW_Y: 2,
    SHOW_ASH: 3,
    SHOW_SCROLL: 4
  };

  // Initialize animations
  function initAnimations() {
    // Hide main content initially
    hidePortfolioContent();
    
    // Hide cursor during animation (will be re-enabled after animation)
    const cursor = document.getElementById('customCursor');
    const cursorFollower = document.getElementById('customCursorFollower');
    if (cursor) {
      cursor.style.opacity = '0';
      cursor.style.pointerEvents = 'none';
    }
    if (cursorFollower) {
      cursorFollower.style.opacity = '0';
      cursorFollower.style.pointerEvents = 'none';
    }

    // Create fullscreen animation overlay
    const animationOverlay = document.createElement('div');
    animationOverlay.id = 'animation-overlay';
    animationOverlay.style.cssText = 'position: fixed; inset: 0; z-index: 99999; background-color: #000000; display: flex; align-items: center; justify-content: center; overflow: hidden;';
    document.body.appendChild(animationOverlay);

    // Create animation container
    const animationContainer = document.createElement('div');
    animationContainer.id = 'animation-container';
    animationContainer.style.cssText = 'position: absolute; inset: 0; overflow: hidden; pointer-events: none;';
    animationOverlay.appendChild(animationContainer);

    // Create name display container
    const nameContainer = document.createElement('div');
    nameContainer.id = 'name-container';
    nameContainer.style.cssText = 'position: relative; z-index: 10; text-align: center; color: white;';
    animationOverlay.appendChild(nameContainer);

    // Add CSS animations
    addAnimationStyles();

    // Create grid background
    createGridBackground(animationContainer);

    // Create animated shapes - DISABLED (blocks removed)
    // createAnimatedShapes(animationContainer);

    // Create cursor trail
    createCursorTrail();

    // Create name animation
    createNameAnimation(nameContainer);

    // Start animation sequence
    startAnimationSequence(animationOverlay);
  }

  // Hide portfolio content initially
  function hidePortfolioContent() {
    const header = document.getElementById('header');
    const main = document.querySelector('.main');
    
    if (header) header.style.opacity = '0';
    if (main) main.style.opacity = '0';
    
    // Prevent scrolling during animation
    document.body.style.overflow = 'hidden';
  }

  // Show portfolio content after animation with smooth, subtle effects
  function showPortfolioContent() {
    const header = document.getElementById('header');
    const main = document.querySelector('.main');
    
    // Re-enable scrolling
    document.body.style.overflow = '';
    
    // Ensure cursor is visible and functional after animation
    setTimeout(() => {
      const cursor = document.getElementById('customCursor');
      const cursorFollower = document.getElementById('customCursorFollower');
      
      if (cursor) {
        cursor.style.display = 'block';
        cursor.style.opacity = '1';
        cursor.style.visibility = 'visible';
        cursor.style.zIndex = '9999999';
        cursor.style.pointerEvents = 'none';
      }
      
      if (cursorFollower) {
        cursorFollower.style.display = 'block';
        cursorFollower.style.opacity = '1';
        cursorFollower.style.visibility = 'visible';
        cursorFollower.style.zIndex = '9999998';
        cursorFollower.style.pointerEvents = 'none';
      }
      
      // Force cursor position update by triggering a mousemove event
      // Get current mouse position from window if available
      if (typeof window.mouseX !== 'undefined' && typeof window.mouseY !== 'undefined') {
        const moveEvent = new MouseEvent('mousemove', {
          clientX: window.mouseX,
          clientY: window.mouseY,
          bubbles: true,
          cancelable: true,
          view: window
        });
        document.dispatchEvent(moveEvent);
      } else {
        // Trigger a fake mousemove to wake up the cursor
        document.dispatchEvent(new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      }
      
      console.log('✅ Cursor re-enabled after animation');
    }, 300);
    
    // Ensure we're at the top
    window.scrollTo(0, 0);
    
    // Set initial state for smooth animation
    if (header) {
      header.style.opacity = '0';
      header.style.transform = 'translateY(-20px) scale(0.98)';
      header.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      header.style.filter = 'blur(4px)';
    }
    
    if (main) {
      main.style.opacity = '0';
      main.style.transform = 'translateY(20px) scale(0.98)';
      main.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), filter 1.2s ease-out';
      main.style.filter = 'blur(4px)';
    }
    
    // Animate in with slight delay for smooth reveal
    setTimeout(() => {
      if (header) {
        header.style.opacity = '1';
        header.style.transform = 'translateY(0) scale(1)';
        header.style.filter = 'blur(0)';
      }
      
      if (main) {
        main.style.opacity = '1';
        main.style.transform = 'translateY(0) scale(1)';
        main.style.filter = 'blur(0)';
      }
    }, 100);
  }

  // Add CSS animation styles
  function addAnimationStyles() {
    // Add Google Font for animation letters
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    const style = document.createElement('style');
    style.textContent = `
      .grid-background {
        position: absolute;
        inset: 0;
        z-index: 0;
        background-image: linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
        background-size: 3rem 3rem;
        opacity: 0;
        transition: opacity 1s ease-in;
      }
      .grid-background.visible {
        opacity: 1;
      }
      
      .trail-dot {
        position: fixed;
        width: 8px;
        height: 8px;
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        animation: fade-out-trail 0.4s ease-out forwards;
      }
      @keyframes fade-out-trail {
        from {
          opacity: 0.8;
          transform: translate(-50%, -50%) scale(1);
        }
        to {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0);
        }
      }
      
      #name-container {
        font-family: 'Orbitron', monospace;
      }
      
      .name-char {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.2em;
        height: 1.2em;
        border-radius: 50%;
        transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-family: 'Orbitron', monospace;
        font-weight: 900;
        margin: 0 0.4em;
        text-transform: uppercase;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-size: 200% 200%;
        animation: gradient-shift 3s ease infinite, smooth-pulse 2s ease-in-out infinite;
        position: relative;
        box-shadow: 0 0 0 rgba(255, 255, 255, 0);
      }
      
      .letter-circle-container {
        position: relative;
        display: inline-block;
      }
      
      .letter-circle-bg {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        opacity: 0.2;
        filter: blur(15px);
        transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 0;
        width: 1.2em;
        height: 1.2em;
        transform: scale(0.8);
        animation: circle-glow 2s ease-in-out infinite;
      }
      
      .letter-circle-container:hover .letter-circle-bg {
        opacity: 0.4;
        transform: scale(1.1);
        filter: blur(20px);
      }
      
      @keyframes circle-glow {
        0%, 100% { 
          opacity: 0.2;
          transform: scale(0.8);
        }
        50% { 
          opacity: 0.3;
          transform: scale(0.9);
        }
      }
      
      .name-char {
        position: relative;
        z-index: 1;
      }
      
      .name-char::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        background: inherit;
        opacity: 0.3;
        filter: blur(12px);
        z-index: -1;
        transition: all 0.8s ease;
      }
      
      @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      @keyframes smooth-pulse {
        0%, 100% { 
          transform: scale(1) rotate(0deg);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }
        50% { 
          transform: scale(1.05) rotate(2deg);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
        }
      }
      
      .name-char.hidden {
        opacity: 0;
        transform: translateY(-30px) scale(0.5) rotate(-180deg);
        filter: blur(10px);
      }
      
      .name-char.visible {
        opacity: 1;
        transform: translateY(0) scale(1) rotate(0deg);
        filter: blur(0);
      }
      
      .letter-circle-container .letter-circle-bg {
        opacity: 0;
        transform: scale(0.5);
        transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      .name-char:hover {
        transform: scale(1.15) rotate(5deg);
        transition: all 0.3s ease;
      }
      
      .scroll-indicator {
        position: absolute;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 1s ease-out;
        animation: bounce 2s infinite;
      }
      
      .scroll-indicator.visible {
        opacity: 1;
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50% { transform: translateX(-50%) translateY(-10px); }
      }
      
      #animation-overlay.fade-out {
        opacity: 0;
        transition: opacity 1s ease-out;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  // Create grid background
  function createGridBackground(container) {
    const grid = document.createElement('div');
    grid.className = 'grid-background';
    grid.id = 'grid-background';
    container.appendChild(grid);
  }

  // Create animated shapes - multiple blocks sliding from right to left
  function createAnimatedShapes(container) {
    const blockConfigs = [
      // Row 1 - Top
      { id: 'block-1', top: '10%', width: '8vw', height: '8vw', color: '#22d3ee', delay: '0s' },
      { id: 'block-2', top: '10%', width: '6vw', height: '6vw', color: '#d946ef', delay: '0.2s' },
      { id: 'block-3', top: '10%', width: '10vw', height: '10vw', color: '#fde047', delay: '0.4s' },
      { id: 'block-4', top: '10%', width: '7vw', height: '7vw', color: '#a3e636', delay: '0.6s' },
      
      // Row 2 - Middle Top
      { id: 'block-5', top: '25%', width: '9vw', height: '9vw', color: '#22d3ee', delay: '0.1s' },
      { id: 'block-6', top: '25%', width: '5vw', height: '5vw', color: '#d946ef', delay: '0.3s' },
      { id: 'block-7', top: '25%', width: '8vw', height: '8vw', color: '#fde047', delay: '0.5s' },
      { id: 'block-8', top: '25%', width: '6vw', height: '6vw', color: '#a3e636', delay: '0.7s' },
      
      // Row 3 - Middle
      { id: 'block-9', top: '40%', width: '7vw', height: '7vw', color: '#22d3ee', delay: '0.15s' },
      { id: 'block-10', top: '40%', width: '9vw', height: '9vw', color: '#d946ef', delay: '0.35s' },
      { id: 'block-11', top: '40%', width: '6vw', height: '6vw', color: '#fde047', delay: '0.55s' },
      { id: 'block-12', top: '40%', width: '8vw', height: '8vw', color: '#a3e636', delay: '0.75s' },
      
      // Row 4 - Middle Bottom
      { id: 'block-13', top: '55%', width: '8vw', height: '8vw', color: '#22d3ee', delay: '0.2s' },
      { id: 'block-14', top: '55%', width: '7vw', height: '7vw', color: '#d946ef', delay: '0.4s' },
      { id: 'block-15', top: '55%', width: '9vw', height: '9vw', color: '#fde047', delay: '0.6s' },
      { id: 'block-16', top: '55%', width: '5vw', height: '5vw', color: '#a3e636', delay: '0.8s' },
      
      // Row 5 - Bottom
      { id: 'block-17', top: '70%', width: '6vw', height: '6vw', color: '#22d3ee', delay: '0.1s' },
      { id: 'block-18', top: '70%', width: '10vw', height: '10vw', color: '#d946ef', delay: '0.3s' },
      { id: 'block-19', top: '70%', width: '7vw', height: '7vw', color: '#fde047', delay: '0.5s' },
      { id: 'block-20', top: '70%', width: '8vw', height: '8vw', color: '#a3e636', delay: '0.7s' },
      
      // Row 6 - Very Bottom
      { id: 'block-21', top: '85%', width: '9vw', height: '9vw', color: '#22d3ee', delay: '0.25s' },
      { id: 'block-22', top: '85%', width: '6vw', height: '6vw', color: '#d946ef', delay: '0.45s' },
      { id: 'block-23', top: '85%', width: '8vw', height: '8vw', color: '#fde047', delay: '0.65s' },
      { id: 'block-24', top: '85%', width: '7vw', height: '7vw', color: '#a3e636', delay: '0.85s' }
    ];

    blockConfigs.forEach((config, index) => {
      const block = document.createElement('div');
      block.className = 'animated-block';
      block.id = config.id;
      block.style.cssText = `
        position: absolute;
        top: ${config.top};
        left: 0;
        width: ${config.width};
        height: ${config.height};
        background: linear-gradient(135deg, ${config.color}, ${config.color}dd);
        animation-delay: ${config.delay};
        opacity: 0;
      `;
      container.appendChild(block);
    });
  }

  // Create cursor trail
  function createCursorTrail() {
    const dots = [];
    let dotId = 0;

    function handleMouseMove(event) {
      const dot = document.createElement('div');
      dot.className = 'trail-dot';
      dot.style.left = event.clientX + 'px';
      dot.style.top = event.clientY + 'px';
      dot.id = 'trail-dot-' + (dotId++);
      document.body.appendChild(dot);
      
      dots.push(dot);
      
      // Keep only last 30 dots
      if (dots.length > 30) {
        const oldDot = dots.shift();
        if (oldDot && oldDot.parentNode) {
          oldDot.parentNode.removeChild(oldDot);
        }
      }
      
      // Remove dot after animation
      setTimeout(() => {
        if (dot.parentNode) {
          dot.parentNode.removeChild(dot);
        }
        const index = dots.indexOf(dot);
        if (index > -1) {
          dots.splice(index, 1);
        }
      }, 400);
    }

    // Throttle mouse move events
    let rafId = null;
    window.addEventListener('mousemove', (event) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        handleMouseMove(event);
        rafId = null;
      });
    });
  }

  // Create name animation
  function createNameAnimation(container) {
    const nameChars = ['Y', 'A', 'S', 'H', '❤️'];
    const nameColors = ['#22d3ee', '#d946ef', '#fde047', '#a3e636', '#ff6b35']; // cyan, fuchsia, yellow, lime, orange
    
    const nameWrapper = document.createElement('h1');
    nameWrapper.id = 'name-wrapper';
    nameWrapper.style.cssText = 'font-size: clamp(2rem, 8vw, 5rem); font-weight: 900; display: flex; align-items: baseline; justify-content: center; margin: 0; gap: 0.5em;';
    
    nameChars.forEach((char, index) => {
      // Create circular container
      const container = document.createElement('div');
      container.className = 'letter-circle-container';
      container.style.cssText = 'position: relative; display: inline-block;';
      
      // Create circular background
      const circleBg = document.createElement('div');
      circleBg.className = 'letter-circle-bg';
      
      // Create letter span
      const span = document.createElement('span');
      span.className = 'name-char hidden';
      span.textContent = char;
      
      // Create blended gradient for each letter
      // Each letter blends with adjacent colors for smooth transitions
      let gradient;
      if (index === 0) {
        // Y: cyan to fuchsia (blending with A) - diagonal blend
        gradient = `linear-gradient(135deg, ${nameColors[0]} 0%, ${nameColors[1]} 50%, ${nameColors[0]} 100%)`;
      } else if (index === 1) {
        // A: fuchsia to yellow (blending Y and S) - mixed colors
        gradient = `linear-gradient(135deg, ${nameColors[1]} 0%, ${nameColors[2]} 50%, ${nameColors[0]} 100%)`;
      } else if (index === 2) {
        // S: yellow to lime (blending A and H) - vibrant mix
        gradient = `linear-gradient(135deg, ${nameColors[2]} 0%, ${nameColors[3]} 50%, ${nameColors[1]} 100%)`;
      } else if (index === 3) {
        // H: lime to orange (blending S and N) - vibrant transition
        gradient = `linear-gradient(135deg, ${nameColors[3]} 0%, ${nameColors[4]} 50%, ${nameColors[2]} 100%)`;
      } else {
        // ❤️ (5th): orange to cyan (blending H and Y, circular) - full spectrum
        gradient = `linear-gradient(135deg, ${nameColors[4]} 0%, ${nameColors[0]} 50%, ${nameColors[3]} 100%)`;
      }
      
      // Apply gradient to both background and text
      circleBg.style.background = gradient;
      circleBg.style.opacity = '0.15';
      span.style.background = gradient;
      span.style.transitionDelay = index > 0 ? `${(index - 1) * 150}ms` : '0ms';
      
      if (index === 0) {
        span.id = 'char-y';
      }
      
      // Assemble: container > circleBg + span
      container.appendChild(circleBg);
      container.appendChild(span);
      nameWrapper.appendChild(container);
    });
    
    container.appendChild(nameWrapper);
    
    // Add scroll indicator
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.id = 'scroll-indicator';
    scrollIndicator.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(255, 255, 255, 0.5);">
        <path d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
      </svg>
    `;
    container.appendChild(scrollIndicator);
  }

  // Start animation sequence
  function startAnimationSequence(overlay) {
    // Stage 1: Show Grid (500ms)
    setTimeout(() => {
      animationStage = stages.SHOW_GRID_SHAPES;
      const grid = document.getElementById('grid-background');
      if (grid) grid.classList.add('visible');
    }, 500);

    // Stage 2: Show 'Y' (1000ms)
    setTimeout(() => {
      animationStage = stages.SHOW_Y;
      const charY = document.getElementById('char-y');
      if (charY) {
        charY.classList.remove('hidden');
        charY.classList.add('visible');
        // Animate the circular background for Y
        const container = charY.closest('.letter-circle-container');
        if (container) {
          const circleBg = container.querySelector('.letter-circle-bg');
          if (circleBg) {
            circleBg.style.opacity = '0.2';
            circleBg.style.transform = 'scale(0.8)';
          }
        }
      }
    }, 1000);

    // Stage 3: Show remaining letters (A, S, H, ❤️) (2000ms)
    setTimeout(() => {
      animationStage = stages.SHOW_ASH;
      
      // Show remaining characters (A, S, H, ❤️)
      const nameChars = document.querySelectorAll('.name-char');
      nameChars.forEach((char, index) => {
        if (index > 0 && char.classList.contains('hidden')) {
          setTimeout(() => {
            char.classList.remove('hidden');
            char.classList.add('visible');
            // Animate the circular background
            const container = char.closest('.letter-circle-container');
            if (container) {
              const circleBg = container.querySelector('.letter-circle-bg');
              if (circleBg) {
                circleBg.style.opacity = '0.2';
                circleBg.style.transform = 'scale(0.8)';
              }
            }
          }, (index - 1) * 150);
        }
      });
    }, 2000);

    // Stage 4: Show scroll indicator (2800ms)
    setTimeout(() => {
      animationStage = stages.SHOW_SCROLL;
      const scrollIndicator = document.getElementById('scroll-indicator');
      if (scrollIndicator) scrollIndicator.classList.add('visible');
    }, 2800);

    // Stage 5: Fade out overlay, scroll to top, and show portfolio (4000ms - after animation completes)
    setTimeout(() => {
      if (overlay) {
        overlay.classList.add('fade-out');
        // Scroll to top smoothly
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        
        // Remove overlay after fade completes and show portfolio
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
            console.log('✅ Animation overlay removed');
          }
          showPortfolioContent();
          
          // Trigger first visit modal IMMEDIATELY after overlay is removed
          setTimeout(() => {
            console.log('🎬 Animation complete! Showing first visit modal...');
            if (typeof window.showFirstVisitModal === 'function') {
              window.showFirstVisitModal();
            } else if (typeof window.triggerFirstVisitModal === 'function') {
              window.triggerFirstVisitModal();
            } else {
              console.error('❌ Modal functions not available!');
            }
          }, 500);
        }, 1000);
      }
    }, 4000);
  }

  // Initialize when DOM is ready - DISABLED
  // if (document.readyState === 'loading') {
  //   document.addEventListener('DOMContentLoaded', initAnimations);
  // } else {
  //   initAnimations();
  // }
})();

