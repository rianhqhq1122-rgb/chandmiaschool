require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const { connectDB, closeDB } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const heroRoutes = require('./routes/hero');
const studentsRoutes = require('./routes/students');
const teachersRoutes = require('./routes/teachers');
const academicsRoutes = require('./routes/academics');
const achievementsRoutes = require('./routes/achievements');
const activitiesRoutes = require('./routes/activities');
const galleryRoutes = require('./routes/gallery');
const inquiriesRoutes = require('./routes/inquiries');
const statisticsRoutes = require('./routes/statistics');
const admissionGradesRoutes = require('./routes/admissionGrades');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/admission-grades', admissionGradesRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/admin/*', (req, res) => {
  if (req.path === '/login.html' || req.path === '/login') {
    return res.sendFile(path.join(__dirname, '../admin/login.html'));
  }
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).sendFile(path.join(__dirname, '../public/500.html'));
});

async function start() {
  try {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/chandmia_school');
    console.log('Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Admin panel: http://localhost:${PORT}/admin/login.html`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

start();