# Troubleshooting "Failed to fetch" Error on GitHub Pages

## Common Causes and Solutions

### 1. Database Tables Not Created
**Symptom**: "Failed to fetch" or "relation does not exist" error

**Solution**:
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the contents of `backend/database/supabase-schema.sql`
5. Click **Run**
6. Verify tables are created in **Table Editor**

### 2. Row Level Security (RLS) Policies Not Set
**Symptom**: "permission denied" or "new row violates row-level security policy"

**Solution**:
1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Check that all tables have policies allowing anonymous access:
   - `messages` - Allow INSERT, SELECT, UPDATE, DELETE for `anon`
   - `profile_views` - Allow INSERT, SELECT for `anon`
   - `visitors` - Allow INSERT, SELECT, UPDATE for `anon`
   - `analytics` - Allow INSERT, SELECT, UPDATE for `anon`

3. If policies are missing, run the SQL schema again (it includes RLS policies)

### 3. Supabase Client Not Initializing
**Symptom**: Console shows "Supabase client not initialized"

**Solution**:
1. Open browser console (F12)
2. Check if you see: `✓ Supabase client initialized`
3. If not, check Network tab for errors loading `@supabase/supabase-js`
4. Verify the Supabase library is loaded before `api.js`

### 4. CORS Issues
**Symptom**: CORS errors in console

**Solution**:
- Supabase handles CORS automatically
- Make sure your Supabase project URL is correct in `supabase-config.js`
- Check that your domain is allowed in Supabase settings (if using custom domain)

### 5. Network/Firewall Issues
**Symptom**: "Failed to fetch" with no specific error

**Solution**:
1. Check browser console for detailed error
2. Verify internet connection
3. Check if Supabase service is accessible: https://status.supabase.com
4. Try accessing Supabase directly: https://wpskhrfgseqtaozxpxmn.supabase.co

## Quick Diagnostic Steps

1. **Open Browser Console (F12)**
   - Look for any red error messages
   - Check if Supabase client initialized

2. **Test Supabase Connection**
   - Open `test-supabase.html` in your browser
   - Click "Test Connection" button
   - Check what errors appear

3. **Verify Database Setup**
   - Go to Supabase Dashboard → Table Editor
   - Verify these tables exist:
     - `messages`
     - `profile_views`
     - `visitors`
     - `analytics`

4. **Check RLS Policies**
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify policies allow anonymous access

## Testing Locally vs GitHub Pages

### Local Testing
- Open `index.html` directly in browser
- Or use a local server: `python -m http.server 8000`

### GitHub Pages Testing
- Make sure all files are committed and pushed
- Wait a few minutes for GitHub Pages to update
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for errors

## Still Having Issues?

1. **Check Browser Console** - Look for specific error messages
2. **Test with test-supabase.html** - This will show detailed error information
3. **Verify Supabase Project** - Make sure project is active and not paused
4. **Check Supabase Logs** - Go to Supabase Dashboard → Logs

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch" | Network/CORS issue | Check internet, verify Supabase URL |
| "relation does not exist" | Tables not created | Run SQL schema in Supabase |
| "permission denied" | RLS policies missing | Run SQL schema (includes policies) |
| "Supabase client not initialized" | Library not loaded | Check script order in HTML |

