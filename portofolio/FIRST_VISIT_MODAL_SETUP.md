# First Visit Modal Setup

## Issue: Modal Not Showing

If the modal is not appearing, follow these steps:

### 1. Clear LocalStorage
Open browser console (F12) and run:
```javascript
localStorage.removeItem('first_visit_response');
```

### 2. Test Modal Manually
In browser console, run:
```javascript
window.showFirstVisitModal();
```

### 3. Check Console Logs
Look for these messages:
- `✅ First visit modal script loaded`
- `🎬 Animation complete! Triggering first visit modal...`
- `✅ Modal shown with Bootstrap` or `✅ Modal shown manually`

### 4. Verify Database Table
Run this SQL in Supabase:
```sql
ALTER TABLE visitor_responses ADD COLUMN IF NOT EXISTS visitor_name VARCHAR(100);
```

### 5. Expected Behavior
- Animation plays (4 seconds)
- Modal appears immediately after animation
- Shows: Welcome message, name input, two buttons
- User can enter name (optional)
- User clicks "Yes, First Time" or "No, Returning"
- Data is saved to database

### 6. Troubleshooting
- **Modal not appearing**: Check console for errors
- **Bootstrap not found**: Ensure Bootstrap JS is loaded
- **Database error**: Check Supabase table exists
- **Animation blocking**: Modal should appear after overlay is removed

## Testing
After clearing localStorage, refresh the page and the modal should appear after the animation completes.

