const express = require('express');
const bcrypt = require('bcryptjs');
const { collections, ObjectId } = require('../models');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await collections.adminUsers().findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.adminId = admin._id.toString();
    req.session.adminEmail = admin.email;
    req.session.adminName = admin.name;

    res.json({ 
      success: true, 
      message: 'Login successful',
      admin: { name: admin.name, email: admin.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

router.get('/me', async (req, res) => {
  if (!req.session?.adminId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const admin = await collections.adminUsers().findOne(
      { _id: new ObjectId(req.session.adminId) },
      { projection: { password: 0 } }
    );
    
    if (!admin) {
      req.session.destroy();
      return res.status(401).json({ error: 'Admin not found' });
    }
    
    res.json({ admin: { name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/create-first-admin', async (req, res) => {
  try {
    const count = await collections.adminUsers().countDocuments();
    if (count > 0) {
      return res.status(403).json({ error: 'Admin already exists' });
    }

    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    await collections.adminUsers().insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date()
    });

    res.json({ success: true, message: 'First admin created' });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;