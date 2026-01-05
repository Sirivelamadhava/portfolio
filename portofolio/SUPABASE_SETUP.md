# Supabase Setup Guide

This guide will help you set up Supabase for your portfolio website.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your Supabase project URL and anon key (already configured in `assets/js/supabase-config.js`)

## Step 1: Create Tables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `backend/database/supabase-schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the SQL

This will create the following tables:
- `messages` - Stores contact form submissions
- `profile_views` - Tracks profile page views
- `visitors` - Tracks unique visitors
- `analytics` - Daily analytics data

## Step 2: Verify Configuration

The Supabase configuration is already set in `assets/js/supabase-config.js`:

```javascript
const SUPABASE_CONFIG = {
  url: 'https://fubudmekboxqnfzoclzw.supabase.co',
  anonKey: 'sb_publishable_Km4RL8c0RYR95PPZDzhl5g_x9SblV_9'
};
```

**Your credentials are already configured!**

## Step 3: Test the Connection

1. Open `index.html` in your browser
2. Open the browser console (F12)
3. You should see: `✓ Supabase client initialized`
4. Submit the contact form to test message storage
5. Check the `admin.html` page to view messages and analytics

## Step 4: Security Considerations (Recommended for Production)

### Option 1: Restrict Admin Access with Authentication

For production, you should:
1. Enable Supabase Authentication
2. Create an admin user
3. Update RLS policies to restrict SELECT operations to authenticated users only
4. Add authentication to `admin.html`

### Option 2: Use Service Role Key (Not Recommended for Client-Side)

For server-side operations, you can use the service role key, but **never expose it in client-side code**.

### Option 3: Keep Current Setup (For Development)

The current setup allows anonymous access to all operations. This is fine for development but should be secured for production.

## Row Level Security (RLS) Policies

The SQL schema includes RLS policies that allow:
- **INSERT**: Anyone can insert data (for contact forms and view tracking)
- **SELECT**: Anyone can read data (for admin dashboard)
- **UPDATE**: Anyone can update data (for marking messages as read)
- **DELETE**: Anyone can delete data (for deleting messages)

For production, consider restricting SELECT, UPDATE, and DELETE to authenticated users only.

## Troubleshooting

### Error: "relation does not exist"
- Make sure you've run the SQL schema in the Supabase SQL Editor
- Check that all tables were created successfully

### Error: "permission denied" or "new row violates row-level security policy"
- Check your RLS policies in Supabase
- Go to **Authentication** > **Policies** in your Supabase dashboard
- Verify that the policies are correctly set up

### Error: "Supabase client not initialized"
- Make sure the Supabase JS library is loaded before `api.js`
- Check the browser console for errors
- Verify that `supabase-config.js` is loaded correctly

### Messages not appearing in admin dashboard
- Check the browser console for errors
- Verify that RLS policies allow SELECT operations
- Check the Supabase dashboard to see if data is being inserted

## Database Structure

### messages
- `id` - Primary key
- `name` - Sender's name
- `email` - Sender's email
- `subject` - Message subject
- `message` - Message content
- `created_at` - Timestamp
- `read_status` - Boolean (read/unread)

### profile_views
- `id` - Primary key
- `ip_address` - Visitor's IP address
- `user_agent` - Browser user agent
- `referrer` - Referrer URL
- `session_id` - Session identifier
- `viewed_at` - Timestamp

### visitors
- `id` - Primary key
- `ip_address` - Unique visitor identifier
- `user_agent` - Browser user agent
- `referrer` - Referrer URL
- `visit_count` - Number of visits
- `first_visit` - First visit timestamp
- `last_visit` - Last visit timestamp

### analytics
- `id` - Primary key
- `date` - Date (unique)
- `total_views` - Total views for the day
- `unique_visitors` - Unique visitors for the day
- `messages_received` - Messages received for the day

## Next Steps

1. ✅ Tables created
2. ✅ Configuration set
3. ✅ Test the contact form
4. ✅ Check the admin dashboard
5. 🔒 Secure your admin dashboard (recommended for production)
6. 🚀 Deploy your portfolio website

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the Supabase dashboard logs
3. Verify your RLS policies
4. Ensure all tables are created correctly

