# Portfolio Backend Server

Express.js backend server that uses Supabase as the database. This server provides API endpoints for the portfolio website.

## Features

- ✅ RESTful API endpoints for messages and analytics
- ✅ Supabase database integration
- ✅ CORS enabled for frontend communication
- ✅ Health check endpoint
- ✅ Error handling and logging

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory (optional - defaults are provided):

```env
# Supabase Configuration
SUPABASE_URL=https://fubudmekboxqnfzoclzw.supabase.co
SUPABASE_ANON_KEY=sb_publishable_Km4RL8c0RYR95PPZDzhl5g_x9SblV_9
SUPABASE_SERVICE_KEY=your_service_key_here

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5500

# Environment
NODE_ENV=development
```

**Note**: If you don't create a `.env` file, the server will use default values from the configuration.

### 3. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Messages
- `POST /api/messages` - Submit contact form
- `GET /api/messages` - Get all messages
- `GET /api/messages/:id` - Get single message
- `PATCH /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message

### Analytics
- `POST /api/views` - Track profile view
- `GET /api/views/count` - Get total views count
- `GET /api/views/analytics` - Get analytics data

## Example Requests

### Submit Contact Form
```bash
POST http://localhost:3000/api/messages
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Hello",
  "message": "This is a test message"
}
```

### Track Profile View
```bash
POST http://localhost:3000/api/views
Content-Type: application/json

{
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "referrer": "https://google.com",
  "session_id": "session_123"
}
```

### Get Analytics
```bash
GET http://localhost:3000/api/views/analytics?days=30
```

## Database

This backend uses Supabase as the database. Make sure you have:

1. Created the Supabase project
2. Run the SQL schema from `database/supabase-schema.sql` in the Supabase SQL Editor
3. Configured the Supabase URL and keys in `.env` or use the defaults

## Development

The server uses:
- **Express.js** - Web framework
- **Supabase** - Database and backend
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify Node.js is installed: `node --version`
- Check that dependencies are installed: `npm install`

### Database connection errors
- Verify Supabase credentials are correct
- Check that database tables exist (run the SQL schema)
- Check Row Level Security (RLS) policies in Supabase

### CORS errors
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Check that the frontend is making requests to the correct backend URL

## Notes

- This backend is optional - the frontend can work directly with Supabase
- The backend provides a RESTful API layer over Supabase
- For production, consider using Supabase's service role key instead of anon key

