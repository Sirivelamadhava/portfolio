# ⚠️ Important: Supabase API Key Format

## Current Configuration

Your Supabase configuration uses:
- **Project URL:** `https://fubudmekboxqnfzoclzw.supabase.co`
- **Publishable Key:** `sb_publishable_Km4RL8c0RYR95PPZDzhl5g_x9SblV_9`

## ⚠️ Potential Issue

The key format `sb_publishable_...` is unusual. Supabase JavaScript client library typically expects **JWT tokens** (starting with `eyJ...`) for the anon key.

## ✅ How to Get the Correct Anon Key

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Look for **"anon"** or **"public"** key
5. It should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT format)

## 🔧 If You Need to Update the Key

1. Open `portofolio/assets/js/supabase-config.js`
2. Replace the `anonKey` value with the JWT token from your Supabase dashboard
3. Save the file
4. Refresh your admin dashboard

## 📝 Example of Correct Format

```javascript
const SUPABASE_CONFIG = {
  url: 'https://fubudmekboxqnfzoclzw.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1YnVkbWVrYm94cW5mem9jbHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc...' // JWT token
};
```

## 🧪 Testing the Connection

After updating the key:
1. Open browser console (F12)
2. Check for: `✓ Supabase client initialized`
3. Check admin dashboard - it should connect successfully

---

**Note:** If the `sb_publishable_...` key works, you can ignore this. However, if you're getting connection errors, use the JWT anon key instead.

