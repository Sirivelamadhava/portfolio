# SQL Setup Instructions

## ⚠️ IMPORTANT: Which Files to Run

**DO NOT run `.md` files - they are documentation only!**
- ❌ `.md` files = **Documentation only, NEVER run in SQL Editor**
- ✅ `.sql` files = **SQL code to run in Supabase SQL Editor**

## 📝 Steps to Fix Unique Visitor Counting

### Option 1: Simple Installation (Recommended)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open the file: `backend/database/install-unique-tracking.sql`
4. Copy the **ENTIRE** file content
5. Paste into Supabase SQL Editor
6. Click **"Run"** button
7. Wait for "Success" message

### Option 2: Step by Step

1. **First Time Setup:**
   - Run: `backend/database/supabase-schema.sql`
   - Creates basic tables (messages, profile_views, visitors, analytics)

2. **For Improved Tracking:**
   - Run: `backend/database/install-unique-tracking.sql`
   - Adds visits table and functions for accurate unique visitor counting

## What Each File Does

### `supabase-schema.sql`
- Creates basic tables for messages, views, and visitors
- Sets up Row Level Security (RLS)

### `setup-unique-tracking.sql`
- Creates `visits` table with UUID visitor_id
- Adds helper functions for unique counting
- Adds visitor_id columns to existing tables
- Creates database functions for efficient counting

