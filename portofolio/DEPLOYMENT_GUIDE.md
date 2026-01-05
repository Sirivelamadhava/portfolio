# Deployment Guide - Custom Domain Setup

This guide will help you deploy your portfolio backend and configure the admin dashboard to work with your custom domain (yaswanthneela.me).

## Prerequisites

1. Backend code ready (✅ Already done)
2. Custom domain configured (yaswanthneela.me)
3. Account on a hosting platform (Render, Railway, Heroku, etc.)

## Step 1: Deploy Backend to Render/Railway/Heroku

### Option A: Deploy to Render (Recommended - Free tier available)

1. **Create a new Web Service on Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `Neelayaswanth/portofolio`

2. **Configure the service:**
   - **Name:** `portfolio-backend` (or any name you prefer)
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid for better performance)

3. **Set Environment Variables:**
   - Go to "Environment" tab
   - Add these variables:
     ```
     DATABASE_URL=postgresql://portfolio_db_8c1j_user:LcgegQDkPEoLnmB9XNuDbbp3XM7mksi7@dpg-d47g31jipnbc73crkckg-a.oregon-postgres.render.com/portfolio_db_8c1j
     PORT=3000
     NODE_ENV=production
     FRONTEND_URL=https://yaswanthneela.me
     ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the service URL (e.g., `https://portfolio-backend-xxx.onrender.com`)

### Option B: Deploy to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables (same as above)
6. Deploy and get the service URL

### Option C: Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create portfolio-backend`
4. Set environment variables:
   ```bash
   heroku config:set DATABASE_URL=your_database_url
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://yaswanthneela.me
   ```
5. Deploy: `git push heroku main`

## Step 2: Update API URLs in Frontend

After deploying the backend, update the API URLs:

### 1. Update `admin.html`:

Find this line (around line 112):
```javascript
return 'https://your-backend-app.onrender.com/api'; // TODO: Update with your backend URL
```

Replace with your actual backend URL:
```javascript
return 'https://portfolio-backend-xxx.onrender.com/api'; // Your actual backend URL
```

### 2. Update `assets/js/api.js`:

Find these lines (around line 14):
```javascript
return 'https://your-backend-app.onrender.com/api'; // TODO: Update with your actual backend URL
```

Replace with your actual backend URL:
```javascript
return 'https://portfolio-backend-xxx.onrender.com/api'; // Your actual backend URL
```

## Step 3: Update Backend CORS Settings

The backend already includes `https://yaswanthneela.me` in the allowed origins. If you have a `www` subdomain, add it too:

In `backend/server.js`, update the allowed origins:
```javascript
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://yaswanthneela.me',
  'https://www.yaswanthneela.me', // Add this if you use www
  process.env.FRONTEND_URL
].filter(Boolean);
```

Or set `FRONTEND_URL=*` in your backend environment variables to allow all origins (less secure, but easier for testing).

## Step 4: Deploy Frontend

### Option A: GitHub Pages

1. Push your code to GitHub (already done ✅)
2. Go to repository settings → Pages
3. Select branch: `main`
4. Select folder: `/ (root)` or `/portofolio`
5. Save
6. Your site will be available at: `https://yourusername.github.io/portofolio`

### Option B: Netlify

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select your repository
4. Build settings:
   - **Base directory:** `portofolio` (if your files are in a subdirectory)
   - **Publish directory:** `portofolio` (or root if files are at root)
5. Add custom domain: `yaswanthneela.me`
6. Deploy

### Option C: Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory:** `portofolio` (if needed)
5. Add custom domain: `yaswanthneela.me`
6. Deploy

## Step 5: Configure Custom Domain

1. **In your domain registrar (where you bought yaswanthneela.me):**
   - Add a CNAME record:
     - **Type:** CNAME
     - **Name:** @ (or www)
     - **Value:** your-netlify-app.netlify.app (or vercel deployment URL)

2. **In Netlify/Vercel:**
   - Go to Domain Settings
   - Add custom domain: `yaswanthneela.me`
   - Follow the instructions to verify ownership

## Step 6: Test the Admin Dashboard

1. Visit: `https://yaswanthneela.me/admin.html`
2. Open browser console (F12)
3. Check if API calls are working
4. Click "Refresh Data" button
5. Verify that:
   - Total Profile Views shows a number
   - Unique Visitors shows a number
   - Messages are displayed

## Troubleshooting

### Admin dashboard shows "Cannot connect to backend"

1. **Check backend URL:**
   - Verify the backend URL in `admin.html` and `api.js` is correct
   - Test the backend URL directly: `https://your-backend-url.onrender.com/api/health`

2. **Check CORS:**
   - Verify `https://yaswanthneela.me` is in the allowed origins
   - Check backend logs for CORS errors

3. **Check environment variables:**
   - Verify `DATABASE_URL` is set correctly
   - Verify `FRONTEND_URL` is set to `https://yaswanthneela.me`

### API calls failing

1. **Check browser console:**
   - Look for CORS errors
   - Look for network errors
   - Check the actual API URL being used

2. **Test backend directly:**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```

3. **Check backend logs:**
   - Go to Render/Railway/Heroku dashboard
   - Check logs for errors

### Database connection issues

1. **Verify DATABASE_URL:**
   - Make sure it's set correctly in backend environment variables
   - Test the connection using the `check-db.ps1` script locally

2. **Check database status:**
   - Verify your PostgreSQL database on Render is running
   - Check if the database URL is accessible

## Quick Checklist

- [ ] Backend deployed to Render/Railway/Heroku
- [ ] Backend URL copied and saved
- [ ] Environment variables set (DATABASE_URL, FRONTEND_URL, etc.)
- [ ] API URLs updated in `admin.html`
- [ ] API URLs updated in `assets/js/api.js`
- [ ] CORS settings updated in `backend/server.js`
- [ ] Frontend deployed to Netlify/Vercel/GitHub Pages
- [ ] Custom domain configured (yaswanthneela.me)
- [ ] Admin dashboard tested: `https://yaswanthneela.me/admin.html`
- [ ] API calls working (check browser console)
- [ ] Data loading correctly in admin dashboard

## Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore` ✅
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** - Most hosting platforms do this automatically
4. **Limit CORS origins** - Don't use `FRONTEND_URL=*` in production
5. **Use strong database passwords**
6. **Regularly update dependencies**

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check backend logs on your hosting platform
3. Verify all URLs are correct
4. Test API endpoints directly using curl or Postman

