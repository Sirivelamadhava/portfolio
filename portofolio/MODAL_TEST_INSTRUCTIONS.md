# First Visit Modal - Testing Instructions

## Quick Test Steps

### 1. Clear LocalStorage (Reset for testing)
Open browser console (F12) and run:
```javascript
localStorage.removeItem('first_visit_response');
```

### 2. Manually Test the Modal
Run this in the console:
```javascript
window.showFirstVisitModal();
```

### 3. Check if Modal Element Exists
```javascript
document.getElementById('firstVisitModal')
// Should return the modal element, not null
```

### 4. Check if Bootstrap is Loaded
```javascript
window.bootstrap || bootstrap
// Should return Bootstrap object
```

### 5. Full Test Sequence
```javascript
// 1. Clear response
localStorage.removeItem('first_visit_response');

// 2. Wait a moment
setTimeout(() => {
  // 3. Show modal
  window.showFirstVisitModal();
}, 1000);
```

## Expected Behavior

1. Page loads → Animation plays (4 seconds)
2. Animation overlay fades out → Removed
3. Modal appears immediately after overlay is removed
4. Modal shows:
   - Welcome message
   - Name input field (optional)
   - "Yes, First Time" button
   - "No, Returning" button

## If Modal Still Doesn't Show

Check the console for:
- `✅ First visit modal script loaded` - Script is loaded
- `🎬 Animation complete! Showing first visit modal...` - Trigger called
- `✅ Modal shown with Bootstrap` - Modal displayed successfully
- Any error messages

## Manual Override

If needed, you can always manually show the modal:
```javascript
localStorage.removeItem('first_visit_response');
window.showFirstVisitModal();
```

