# Chand Mia High School Website

A complete, database-driven school website with admin panel built with Node.js, Express, and MongoDB.

## Features

- **Public Website**: Homepage, About, Academics, Students, Teachers, Achievements, Activities, Gallery, Admissions, Contact
- **Admin Panel**: Secure login, dashboard, full CRUD for all content
- **Database**: MongoDB with proper indexing and validation
- **Image Upload**: Hero slides, gallery, logos, photos with validation
- **Circular Rotating Logo**: Animated school logo on homepage
- **Lightbox Gallery**: Full-screen image viewing with navigation
- **Responsive Design**: Works on mobile, tablet, desktop
- **Accessibility**: Semantic HTML, alt text, keyboard navigation

## Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas connection string

### Installation

```bash
# 1. Clone or navigate to project
cd chandmiaschool

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and secure session secret

# 4. Seed database with demo data
npm run seed

# 5. Start server
npm start

# 6. Open website
# Public: http://localhost:3000
# Admin: http://localhost:3000/admin/login.html
```

### Default Admin Login

After seeding:
- **Email**: admin@chandmiaschool.edu.bd
- **Password**: admin123

**Change password immediately after first login!**

## Project Structure

```
chandmiaschool/
├── public/                 # Public website
│   ├── css/style.css      # Main stylesheet
│   ├── js/main.js         # Frontend JavaScript
│   ├── index.html         # Homepage
│   ├── about.html         # About page
│   ├── academics.html     # Academics page
│   ├── students.html      # Students page
│   ├── teachers.html      # Teachers page
│   ├── achievements.html  # Achievements page
│   ├── activities.html    # Activities page
│   ├── gallery.html       # Gallery page
│   ├── admissions.html    # Admissions page
│   ├── contact.html       # Contact page
│   ├── 404.html           # 404 page
│   └── 500.html           # 500 page
├── admin/                  # Admin panel
│   ├── css/admin.css      # Admin stylesheet
│   ├── js/admin.js        # Admin utilities
│   ├── login.html         # Login page
│   ├── dashboard.html     # Dashboard
│   ├── settings.html      # School settings
│   ├── hero.html          # Hero slides
│   ├── students.html      # Students management
│   ├── teachers.html      # Teachers management
│   ├── academics.html     # Academics management
│   ├── achievements.html  # Achievements management
│   ├── activities.html    # Activities management
│   ├── gallery.html       # Gallery management
│   ├── inquiries.html     # Admission inquiries
│   ├── statistics.html    # Statistics management
│   └── admission-grades.html # Admission grades
├── server/                 # Backend
│   ├── server.js          # Express server
│   ├── models/index.js    # MongoDB connection & collections
│   ├── middleware/
│   │   ├── auth.js        # Authentication middleware
│   │   └── upload.js      # File upload middleware
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication
│   │   ├── settings.js    # School settings
│   │   ├── hero.js        # Hero slides
│   │   ├── students.js    # Students
│   │   ├── teachers.js    # Teachers
│   │   ├── academics.js   # Academics
│   │   ├── achievements.js # Achievements
│   │   ├── activities.js  # Activities
│   │   ├── gallery.js     # Gallery
│   │   ├── inquiries.js   # Admission inquiries
│   │   ├── statistics.js  # Statistics
│   │   ├── admissionGrades.js # Admission grades
│   │   └── dashboard.js   # Dashboard stats
│   └── seed.js            # Database seeder
├── uploads/                # Uploaded images (auto-created)
├── package.json
├── .env.example
└── README.md
```

## Environment Variables

Create `.env` file from `.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017/chandmia_school
SESSION_SECRET=your-super-secret-random-string-here
PORT=3000
ADMIN_EMAIL=admin@chandmiaschool.edu.bd
ADMIN_PASSWORD=changeme123
```

**Important**: Generate a secure random string for `SESSION_SECRET` in production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Admin Panel Guide

### First Time Setup

1. Login at `/admin/login.html`
2. Go to **School Settings** → Fill in school information
3. Upload **School Logo** and **Favicon**
4. Add **Hero Slides** for homepage slider
5. Add **Statistics** (Established year, student count, etc.)
6. Add **Academic Programs**
7. Add **Teachers**
8. Add **Top Students** (enable "Display on Homepage")
8. Add **Achievements** and **Activities**
9. Upload **Gallery Images**
10. Configure **Admission Grades**

### Content Management

All content is managed through the admin panel - no code changes needed:

- **School Settings**: Name, address, contact, description, mission, vision, motto, social links
- **Hero Slides**: Multiple slides with images, titles, descriptions, buttons
- **Students**: Photo, name, class, achievements, GPA, homepage display
- **Teachers**: Photo, name, designation, subject, qualification, experience
- **Academics**: Subject, description, teacher, class, image
- **Achievements**: Title, description, year, category, image
- **Activities**: Title, description, image
- **Gallery**: Images with categories (Campus, Classrooms, Students, etc.)
- **Admission Inquiries**: View, filter, update status (New→Contacted→Resolved→Archived)
- **Statistics**: Key numbers displayed on homepage
- **Admission Grades**: Available grades for inquiry form

### Image Guidelines

- **Hero Slides**: 1920x1080 recommended
- **Gallery**: Any aspect ratio, max 5MB
- **Logo**: Square, used in circular logo animation
- **Favicon**: 32x32 or 16x16 px
- **Photos**: Square aspect ratio works best

All uploads validated: JPEG, PNG, WebP, GIF only, max 5MB.

## Customization

### Colors

Edit CSS variables in `public/css/style.css` and `admin/css/admin.css`:

```css
:root {
  --color-primary: #1e3a5f;      /* Main brand color */
  --color-accent: #c9a84c;       /* Accent/gold color */
  --color-primary-dark: #152a45; /* Darker primary */
  --color-accent-dark: #b0923f;  /* Darker accent */
}
```

### School Information

All text content is editable via Admin Panel → School Settings.

### Demo Data

Run `npm run seed` to populate with demo data marked as "[Demo]" or placeholder text. Replace with real data via admin panel.

## Deployment

### Production Checklist

- [ ] Set strong `SESSION_SECRET` in `.env`
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (configure reverse proxy with SSL)
- [ ] Set up proper MongoDB indexes (already in code)
- [ ] Configure backup strategy for database
- [ ] Set up logging/monitoring

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### MongoDB Connection Failed

- Check `MONGODB_URI` in `.env`
- Ensure MongoDB is running: `mongosh` or check MongoDB Atlas network access
- For local MongoDB: `brew services start mongodb/brew/mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux)

### Images Not Loading

- Check `uploads/` folder exists and has write permissions
- Verify server serves static files from `/uploads` route

### Admin Login Not Working

- Run `npm run seed` to create default admin
- Clear browser cookies for localhost
- Check browser console for errors

### Port Already in Use

Change `PORT` in `.env` or kill existing process:
```bash
lsof -ti:3000 | xargs kill -9
```

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- Session-based authentication with secure cookies
- All admin routes protected by middleware
- File upload validation (type, size)
- MongoDB injection prevention via driver
- Input validation on all forms
- XSS protection via escaping

## License

MIT License - Feel free to use for your school.

## Support

For issues, check the code comments or open an issue on the repository.