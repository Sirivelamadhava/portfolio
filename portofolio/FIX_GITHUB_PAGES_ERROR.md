# Fix "Failed to fetch" Error on GitHub Pages

## ⚠️ Most Common Cause: Database Tables Not Created

The "Failed to fetch" error usually means **the Supabase database tables haven't been created yet**. 

## ✅ Quick Fix (5 minutes)

### Step 1: Create Database Tables in Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in and select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the Schema**
   - Open the file: `backend/database/supabase-schema.sql` from your project
   - **Copy the entire SQL content**
   - Paste it into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)

4. **Verify Tables Created**
   - Go to **Table Editor** in the left sidebar
   - You should see 4 tables:
     - ✅ `messages`
     - ✅ `profile_views`
     - ✅ `visitors`
     - ✅ `analytics`

### Step 2: Test Your Website

1. **Wait 1-2 minutes** for GitHub Pages to update
2. **Clear your browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Open your website**: https://yaswanthneela.me
4. **Open browser console** (F12) and check for:
   - ✅ `✓ Supabase client initialized`
   - ❌ Any red error messages

5. **Test the contact form**
   - Fill out the form
   - Submit it
   - Should see success message

### Step 3: Verify in Supabase

1. Go to Supabase Dashboard → **Table Editor** → `messages`
2. You should see your test message

## 🔍 If Still Not Working

### Check Browser Console

1. Open your website
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for error messages:

**Common Errors:**

| Error | Solution |
|-------|----------|
| `relation "messages" does not exist` | Run the SQL schema (Step 1) |
| `permission denied` | RLS policies not set - run SQL schema again |
| `Supabase client not initialized` | Check Network tab - is `@supabase/supabase-js` loading? |
| `Failed to fetch` | Check internet connection, verify Supabase URL |

### Test Connection

1. Open `test-supabase.html` in your browser
2. Click **"Test Connection"** button
3. It will show you exactly what's wrong

## 📋 Checklist

Before reporting issues, make sure:

- [ ] SQL schema has been run in Supabase
- [ ] All 4 tables exist in Supabase Table Editor
- [ ] Browser console shows: `✓ Supabase client initialized`
- [ ] No CORS errors in console
- [ ] Internet connection is working
- [ ] GitHub Pages has updated (wait 2-3 minutes after push)

## 🚀 After Fixing

Once the tables are created, your website should work immediately. The contact form will:
- ✅ Save messages to Supabase
- ✅ Track profile views
- ✅ Update analytics

## 📞 Still Need Help?

1. Check `TROUBLESHOOTING.md` for detailed solutions
2. Open browser console and copy the exact error message
3. Test with `test-supabase.html` to see detailed diagnostics

---

**Most likely fix**: Just run the SQL schema in Supabase! That's usually all that's needed. 🎯

