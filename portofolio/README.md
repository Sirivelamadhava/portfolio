# Portfolio Website - Neela Yaswanth

A modern, responsive portfolio website showcasing my projects, skills, and experience as a Software Development Engineer.

## Features

- ✨ Modern, responsive design
- 📊 Analytics dashboard for tracking profile views
- 📧 Contact form with database storage
- 🎯 Profile view tracking
- 💼 Project showcase
- 📱 Mobile-friendly interface

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5.3.7
- React (for projects)
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MySQL

### Database
- MySQL for storing messages, views, and analytics

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Neelayaswanth/portofolio.git
   cd portofolio
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure database**
   - Create a MySQL database
   - Import the schema from `backend/database/schema.sql`
   - Create `.env` file in `backend/` folder:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=portfolio_db
     PORT=3000
     FRONTEND_URL=http://localhost:5500
     ```

4. **Start the backend server**
   ```bash
   npm start
   ```

5. **Open the frontend**
   - Open `index.html` in your browser
   - Or use a local server like VS Code Live Server

## Project Structure

```
SnapFolio/
├── assets/
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript files
│   ├── img/          # Images
│   └── vendor/       # Third-party libraries
├── backend/
│   ├── config/       # Database configuration
│   ├── routes/       # API routes
│   ├── database/     # Database schema
│   └── server.js     # Main server file
├── forms/            # Contact form handler
├── index.html        # Main portfolio page
└── admin.html        # Analytics dashboard
```

## API Endpoints

### Messages
- `POST /api/messages` - Submit contact form
- `GET /api/messages` - Get all messages
- `PATCH /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message

### Analytics
- `POST /api/views` - Track profile view
- `GET /api/views/count` - Get total views
- `GET /api/views/analytics` - Get analytics data

## Admin Dashboard

Access the admin dashboard at `admin.html` to view:
- Total profile views
- Unique visitors
- Messages received
- Recent messages with full content

## Contact

- **Email:** yaswanthneela72@gmail.com
- **Phone:** +91 7675867841
- **LinkedIn:** [Neela Yaswanth](https://www.linkedin.com/in/neela-yaswanth-220b492b9)
- **GitHub:** [Neelayaswanth](https://github.com/Neelayaswanth)

## License

This project is open source and available under the MIT License.

## Author

**Neela Yaswanth**
- Software Development Engineer
- B.Tech in Artificial Intelligence and Data Science
- Akshaya College of Engineering and Technology

