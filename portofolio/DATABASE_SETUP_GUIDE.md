# Complete Database Setup Guide

## 📋 Your Supabase Credentials

**Project URL:** `https://fubudmekboxqnfzoclzw.supabase.co`  
**Publishable API Key:** `sb_publishable_Km4RL8c0RYR95PPZDzhl5g_x9SblV_9`

✅ **All credentials have been updated in your portfolio files!**

---

## 🚀 Quick Setup Steps

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Complete Setup SQL

1. Click **"New Query"** button
2. Open the file: `portofolio/backend/database/COMPLETE_SETUP.sql`
3. Copy **ALL** the contents
4. Paste into the SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter`)

### Step 3: Verify Tables Created

After running the SQL, verify tables were created:

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ `messages`
   - ✅ `profile_views`
   - ✅ `visitors`
   - ✅ `analytics`
   - ✅ `visitor_responses`
   - ✅ `visits`

### Step 4: Test Your Portfolio

1. Open `index.html` in your browser
2. Open browser console (F12)
3. You should see: `✓ Supabase client initialized`
4. Submit the contact form to test
5. Check `admin.html` to view messages

---

## 📊 Database Tables Overview

### 1. **messages**
Stores contact form submissions
- `id` - Primary key
- `name` - Sender's name
- `email` - Sender's email
- `subject` - Message subject
- `message` - Message content
- `created_at` - Timestamp
- `read_status` - Read/unread status

### 2. **profile_views**
Tracks every page view
- `id` - Primary key
- `ip_address` - Visitor's IP
- `user_agent` - Browser info
- `referrer` - Where they came from
- `session_id` - Session identifier
- `visitor_id` - UUID for tracking
- `viewed_at` - Timestamp

### 3. **visitors**
Tracks unique visitors
- `id` - Primary key
- `ip_address` - Unique visitor IP
- `visitor_id` - UUID identifier
- `visit_count` - Number of visits
- `is_bot` - Bot detection
- `first_visit` - First visit time
- `last_visit` - Last visit time

### 4. **analytics**
Daily aggregated analytics
- `id` - Primary key
- `date` - Date (unique)
- `total_views` - Total views for day
- `unique_visitors` - Unique visitors
- `messages_received` - Messages count

### 5. **visitor_responses**
First visit modal responses
- `id` - Primary key
- `visitor_id` - Visitor identifier
- `visitor_name` - Optional name
- `user_response` - User's answer
- `actual_first_visit` - Tracking data
- `response_time` - When answered

### 6. **visits**
Enhanced tracking with UUID
- `id` - Primary key
- `visitor_id` - UUID identifier
- `event_type` - Type of event
- `url` - Page URL
- `is_bot` - Bot detection
- `created_at` - Timestamp

---

## 🔒 Security (Row Level Security)

All tables have **Row Level Security (RLS)** enabled with policies that allow:
- ✅ **INSERT** - Anyone can insert (for forms and tracking)
- ✅ **SELECT** - Anyone can read (for admin dashboard)
- ✅ **UPDATE** - Anyone can update (for marking messages as read)
- ✅ **DELETE** - Anyone can delete (for deleting messages)

### ⚠️ Production Recommendations

For production, consider:
1. **Restrict SELECT policies** to authenticated users only
2. **Use Supabase Auth** for admin dashboard
3. **Get service_role key** for server-side operations
4. **Review and tighten** RLS policies based on your needs

---

## 🛠️ Troubleshooting

### Error: "relation does not exist"
- ✅ Make sure you ran the complete SQL setup
- ✅ Check that all tables were created in Table Editor
- ✅ Verify you're using the correct project

### Error: "permission denied" or "row-level security policy"
- ✅ Check RLS policies in Supabase Dashboard
- ✅ Go to **Authentication** > **Policies**
- ✅ Verify policies are correctly set up

### Error: "Supabase client not initialized"
- ✅ Check browser console for errors
- ✅ Verify `supabase-config.js` is loaded
- ✅ Check that Supabase library is loaded before `api.js`

### Contact form not working
- ✅ Check browser console for errors
- ✅ Verify RLS policies allow INSERT on `messages` table
- ✅ Check Supabase dashboard to see if data is being inserted

### Admin dashboard not showing data
- ✅ Verify RLS policies allow SELECT
- ✅ Check browser console for errors
- ✅ Ensure tables have data (test by submitting contact form)

---

## 📝 Configuration Files

All credentials are configured in:

1. **Frontend:** `portofolio/assets/js/supabase-config.js`
   - ✅ Project URL: `https://fubudmekboxqnfzoclzw.supabase.co`
   - ✅ Publishable Key: `sb_publishable_Km4RL8c0RYR95PPZDzhl5g_x9SblV_9`

2. **Backend:** `portofolio/backend/config/database.js`
   - ✅ Project URL updated
   - ⚠️ Service Role Key needed for server-side operations

---

## 🔑 Getting Service Role Key (For Backend)

If you need to use the backend server:

1. Go to Supabase Dashboard
2. Navigate to **Settings** > **API**
3. Find **service_role key** (secret)
4. Copy it
5. Add to `.env` file:
   ```
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```

⚠️ **Never expose the service_role key in client-side code!**

---

## ✅ Verification Checklist

- [ ] SQL setup file executed successfully
- [ ] All 6 tables created in Supabase
- [ ] RLS policies enabled and working
- [ ] Portfolio loads without errors
- [ ] Contact form submits successfully
- [ ] Admin dashboard shows data
- [ ] Browser console shows: `✓ Supabase client initialized`

---

## 🎉 You're All Set!

Your portfolio database is now fully configured and ready to use!

**Next Steps:**
1. Test the contact form
2. Check the admin dashboard
3. Monitor analytics
4. Deploy your portfolio!

---

## 📞 Need Help?

If you encounter issues:
1. Check the browser console (F12)
2. Check Supabase dashboard logs
3. Verify RLS policies
4. Ensure all tables exist

---

**Last Updated:** Database setup with credentials from your Supabase project

